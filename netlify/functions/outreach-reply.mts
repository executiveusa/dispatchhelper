import { createClient } from "@supabase/supabase-js";
import { isStopReply, normalizeEmail } from "../lib/flywheel";
import { postWebhook, safeEqual } from "../lib/http";

type Env = (k: string) => string | undefined;

/**
 * Inbound reply hook. Point the mailbox's inbound-parse / forwarding rule at POST /api/outreach-reply
 * with header x-spatchy-secret: $OUTREACH_INBOUND_SECRET and JSON { from, subject, text }.
 * STOP/ALTO -> suppression list + stop all pending mail to that address.
 * Anything else -> mark replied, stop the sequence, alert dispatch.
 */
export async function handleReply(req: Request, env: Env): Promise<Response> {
  if (req.method !== "POST") return Response.json({ ok: false, error: "method_not_allowed" }, { status: 405, headers: { Allow: "POST" } });
  if (!safeEqual(req.headers.get("x-spatchy-secret"), env("OUTREACH_INBOUND_SECRET"))) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const url = env("SUPABASE_URL");
  const key = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return Response.json({ ok: false, error: "service_not_configured" }, { status: 503 });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const email = normalizeEmail(body?.from);
  if (!email) return Response.json({ ok: false, error: "invalid_from" }, { status: 400 });
  const text = String(body?.text ?? "").slice(0, 20000);
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  try {
    const { data: last, error: lastErr } = await db
      .from("outreach_drafts")
      .select("id, jobsite_id")
      .ilike("to_email", email)
      .in("status", ["sent", "replied"])
      .order("sent_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastErr) throw new Error(`reply lookup failed: ${lastErr.message}`);

    if (isStopReply(text)) {
      await checked(db.from("suppression_list").upsert({ email, reason: "reply_stop", source: "outreach-reply" }, { onConflict: "email", ignoreDuplicates: true }));
      await checked(db.from("outreach_drafts").update({ status: "superseded" }).ilike("to_email", email).in("status", ["draft", "approved"]));
      await checked(db.from("outreach_events").insert({ draft_id: last?.id ?? null, jobsite_id: last?.jobsite_id ?? null, email, kind: "stop", payload: { subject: body?.subject ?? null } }));
      return Response.json({ ok: true, action: "suppressed", matched: Boolean(last) });
    }

    if (!last) {
      await checked(db.from("outreach_events").insert({ email, kind: "reply", payload: { subject: body?.subject ?? null, unmatched: true } }));
      return Response.json({ ok: true, action: "logged_unmatched", matched: false });
    }

    await checked(db.from("outreach_drafts").update({ status: "replied", replied_at: new Date().toISOString() }).eq("id", last.id));
    await checked(db.from("outreach_drafts").update({ status: "superseded" }).eq("jobsite_id", last.jobsite_id).in("status", ["draft", "approved"]));
    await checked(db.from("outreach_events").insert({ draft_id: last.id, jobsite_id: last.jobsite_id, email, kind: "reply", payload: { subject: body?.subject ?? null, text: text.slice(0, 2000) } }));
    await checked(db.from("jobsites").update({ status: "replied" }).eq("id", last.jobsite_id));

    const alert = { type: "outreach_reply", from: email, subject: body?.subject ?? null, preview: text.slice(0, 280), jobsite_id: last.jobsite_id };
    const errors: string[] = [];
    for (const [u, to] of [
      [env("DISPATCH_SMS_WEBHOOK_URL"), env("DISPATCH_SMS_TO")],
      [env("DISPATCH_EMAIL_WEBHOOK_URL"), env("DISPATCH_EMAIL_TO")],
    ]) {
      try {
        await postWebhook(u, { ...alert, to });
      } catch (e) {
        errors.push((e as Error).message);
      }
    }
    return Response.json({ ok: true, action: "replied", matched: true, alertErrors: errors.length ? errors : undefined });
  } catch {
    return Response.json({ ok: false, error: "database_operation_failed" }, { status: 503 });
  }
}

async function checked(operation: PromiseLike<{ error: { message: string } | null }>) {
  const result = await operation;
  if (result.error) throw new Error(result.error.message);
}

export default async (req: Request) => handleReply(req, (k) => Netlify.env.get(k));

export const config = { path: "/api/outreach-reply" };
