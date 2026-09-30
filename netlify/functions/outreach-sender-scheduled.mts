import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { addBusinessDays, draftOutreach, FOLLOWUP_BUSINESS_DAYS, trackedLink } from "../lib/flywheel";
import { postWebhook } from "../lib/http";

type Env = (k: string) => string | undefined;

/**
 * 1) Queue follow-up drafts (step 2, then 3) behind every sent message. They start as 'draft',
 *    so a human still approves each one; send_after holds them until the right business day.
 * 2) Send approved drafts that are due. Nothing leaves unless OUTREACH_SEND_ENABLED=true;
 *    otherwise this is a dry run that only reports what it would send.
 */
export async function runSender(env: Env, now = new Date()) {
  const url = env("SUPABASE_URL");
  const key = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Supabase server configuration is required.");
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const live = env("OUTREACH_SEND_ENABLED") === "true";
  const siteUrl = env("PUBLIC_SITE_URL") || "https://spatchy.netlify.app/";
  const limit = Math.max(1, Math.min(200, Number(env("OUTREACH_BATCH_LIMIT")) || 25));

  const queued = await queueFollowups(db, siteUrl);
  const result = { live, queued, sent: 0, wouldSend: [] as string[], skipped: {} as Record<string, number>, failed: 0 };

  const { data: due, error } = await db
    .from("outreach_drafts")
    .select("id, jobsite_id, language, subject, body, to_email, sequence_step, send_after, approved_at")
    .eq("status", "approved")
    .or(`send_after.is.null,send_after.lte.${now.toISOString()}`)
    .order("sequence_step", { ascending: true })
    .limit(limit);
  if (error) throw new Error(`approved drafts query failed: ${error.message}`);

  const skip = async (id: string, status: string) => {
    result.skipped[status] = (result.skipped[status] || 0) + 1;
    if (live) await db.from("outreach_drafts").update({ status }).eq("id", id);
  };

  const claimed = new Set<string>(); // one language per jobsite per step, also within a single run
  for (const d of due || []) {
    const slot = `${d.jobsite_id}:${d.sequence_step}`;
    if (claimed.has(slot)) {
      await skip(d.id, "superseded");
      continue;
    }
    const email = (d.to_email || "").trim().toLowerCase();
    if (!email) {
      await skip(d.id, "skipped_no_email");
      continue;
    }
    const { data: sup, error: supErr } = await db.from("suppression_list").select("email").eq("email", email).maybeSingle();
    if (supErr) throw new Error(`suppression lookup failed: ${supErr.message}`);
    if (sup) {
      await skip(d.id, "skipped_suppressed");
      continue;
    }
    const { data: site, error: siteErr } = await db.from("jobsites").select("lead_id, source_code").eq("id", d.jobsite_id).single();
    if (siteErr || !site) throw new Error(`jobsite lookup failed: ${siteErr?.message || "not found"}`);
    if (site.lead_id) {
      await skip(d.id, "superseded");
      continue;
    }
    // One language per jobsite per step: if the other language already went out, don't send twice.
    const { data: twin, error: twinErr } = await db
      .from("outreach_drafts")
      .select("id")
      .eq("jobsite_id", d.jobsite_id)
      .eq("sequence_step", d.sequence_step)
      .in("status", ["sent", "replied"])
      .limit(1);
    if (twinErr) throw new Error(`previous send lookup failed: ${twinErr.message}`);
    if (twin && twin.length) {
      await skip(d.id, "superseded");
      continue;
    }

    claimed.add(slot);
    if (!live) {
      result.wouldSend.push(`${d.id} -> ${email} [step ${d.sequence_step}, ${d.language}]`);
      continue;
    }

    try {
      const provider = await postWebhook(env("OUTREACH_EMAIL_WEBHOOK_URL"), {
        to: email,
        from: env("OUTREACH_FROM"),
        reply_to: env("OUTREACH_REPLY_TO") || env("OUTREACH_FROM"),
        subject: d.subject,
        text: d.body,
        headers: env("OUTREACH_UNSUBSCRIBE_MAILTO") ? { "List-Unsubscribe": `<mailto:${env("OUTREACH_UNSUBSCRIBE_MAILTO")}?subject=STOP>` } : undefined,
        metadata: { draft_id: d.id, source: site?.source_code },
      });
      if ("skipped" in provider) throw new Error("OUTREACH_EMAIL_WEBHOOK_URL is not set");
      await db.from("outreach_drafts").update({ status: "sent", sent_at: new Date().toISOString(), provider_response: provider }).eq("id", d.id);
      // The other-language twin for this step is now moot.
      await db.from("outreach_drafts").update({ status: "superseded" }).eq("jobsite_id", d.jobsite_id).eq("sequence_step", d.sequence_step).in("status", ["draft", "approved"]).neq("id", d.id);
      await db.from("outreach_events").insert({ draft_id: d.id, jobsite_id: d.jobsite_id, email, kind: "sent" });
      await db.from("jobsites").update({ status: "contacted" }).eq("id", d.jobsite_id).eq("status", "discovered");
      result.sent++;
    } catch (e) {
      const msg = (e as Error).message.slice(0, 500);
      await db.from("outreach_drafts").update({ status: "failed", delivery_error: msg }).eq("id", d.id);
      await db.from("outreach_events").insert({ draft_id: d.id, jobsite_id: d.jobsite_id, email, kind: "failed", payload: { error: msg } });
      result.failed++;
    }
  }

  console.log(JSON.stringify({ engine: "outreach-sender", ...result }));
  return result;
}

async function queueFollowups(db: SupabaseClient, siteUrl: string) {
  const { data: sent, error } = await db
    .from("outreach_drafts")
    .select("id, jobsite_id, language, to_email, sequence_step, sent_at")
    .eq("status", "sent")
    .lt("sequence_step", 3)
    .is("replied_at", null);
  if (error) throw new Error(`sent drafts query failed: ${error.message}`);

  let queued = 0;
  for (const p of sent || []) {
    const next = (p.sequence_step + 1) as 2 | 3;
    const { data: child, error: childErr } = await db.from("outreach_drafts").select("id").eq("parent_draft_id", p.id).eq("sequence_step", next).maybeSingle();
    if (childErr) throw new Error(`follow-up lookup failed: ${childErr.message}`);
    if (child) continue;
    const { data: site, error: siteErr } = await db.from("jobsites").select("*").eq("id", p.jobsite_id).single();
    if (siteErr || !site) throw new Error(`follow-up jobsite lookup failed: ${siteErr?.message || "not found"}`);
    if (site.lead_id) continue;
    if (p.to_email) {
      const { data: sup, error: supErr } = await db.from("suppression_list").select("email").eq("email", p.to_email.toLowerCase()).maybeSingle();
      if (supErr) throw new Error(`follow-up suppression lookup failed: ${supErr.message}`);
      if (sup) continue;
    }
    const copy = draftOutreach(
      { address: site.address, jurisdiction: site.jurisdiction, signalType: site.signal_type, sourceUrl: site.source_url, strikeCmaFlag: site.strike_cma_flag },
      trackedLink(siteUrl, site.source_code),
      next,
    )[p.language as "en" | "es"];
    const { error: insErr } = await db.from("outreach_drafts").insert({
      jobsite_id: p.jobsite_id,
      parent_draft_id: p.id,
      contact_role: "contractor",
      language: p.language,
      subject: copy.subject,
      body: copy.body,
      status: "draft",
      to_email: p.to_email,
      sequence_step: next,
      send_after: addBusinessDays(new Date(p.sent_at), FOLLOWUP_BUSINESS_DAYS[next]).toISOString(),
    });
    if (insErr) throw new Error(`follow-up insert failed: ${insErr.message}`);
    queued++;
  }
  return queued;
}

export default async () => {
  await runSender((k) => Netlify.env.get(k));
};

// Every 30 min, 13:00–22:30 UTC Mon–Fri (9:00–18:30 Eastern during daylight time).
export const config = {
  schedule: "*/30 13-22 * * 1-5",
};
