import type { SupabaseClient } from "@supabase/supabase-js";
import { type Candidate, draftOutreach, makeSourceCode, score, trackedLink } from "./flywheel";

export type Classification = {
  confidence: number;
  reviewRequired: boolean;
  reason: string;
  phase?: string;
  strikeCmaFlag?: boolean;
};

type Env = (key: string) => string | undefined;

/** Jev via the AI gateway. Without a key, everything is routed to human review (never guessed). */
export async function classifyWithJev(candidate: Candidate, env: Env): Promise<Classification> {
  const apiKey = env("AI_GATEWAY_API_KEY");
  const gateway = env("AI_GATEWAY_URL") || "https://ai-gateway.vercel.sh/v1/chat/completions";
  const fallback = (reason: string): Classification => ({
    confidence: 0,
    reviewRequired: true,
    reason,
    phase: candidate.phase,
    strikeCmaFlag: candidate.strikeCmaFlag,
  });
  if (!apiKey) return fallback("AI gateway is not configured.");

  let response: Response;
  try {
    response = await fetch(gateway, {
      method: "POST",
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({
        model: env("JEV_MODEL") || "typesafe-ai/jev",
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Classify Palm Beach construction jobsite leads for crew-shuttle need. Return JSON only: {confidence:number, phase:string|null, strikeCmaFlag:boolean, reason:string}. Never invent a contractor, developer, permit number, or fact not present in the input.",
          },
          { role: "user", content: JSON.stringify(candidate) },
        ],
      }),
    });
  } catch (e) {
    return fallback(`Jev gateway unreachable: ${(e as Error).message}`);
  }
  if (!response.ok) return fallback(`Jev gateway HTTP ${response.status}`);
  try {
    const data = await response.json();
    const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}");
    const confidence = Math.max(0, Math.min(1, Number(parsed.confidence) || 0));
    return {
      confidence,
      reviewRequired: confidence < 0.75,
      reason: String(parsed.reason || ""),
      phase: parsed.phase || candidate.phase,
      // A record-backed parking flag can't be switched off by the model.
      strikeCmaFlag: Boolean(candidate.strikeCmaFlag) || Boolean(parsed.strikeCmaFlag),
    };
  } catch {
    return fallback("Jev returned invalid JSON.");
  }
}

export type ProcessResult = { id: string; created: boolean; score: number; drafted: boolean; reason?: string };

/**
 * Upsert one signal as a jobsite, give it an attribution code, score it, and (re)draft
 * step-1 outreach unless a human has already engaged with this jobsite.
 */
export async function processCandidate(
  db: SupabaseClient,
  c: Candidate,
  opts: { siteUrl: string; classification: Classification },
): Promise<ProcessResult> {
  const cls = opts.classification;
  const merged: Candidate = { ...c, phase: cls.phase || c.phase, strikeCmaFlag: cls.strikeCmaFlag ?? c.strikeCmaFlag };
  const s = score(merged);

  // Only write fields the source actually provided, so a thinner re-import can't erase data.
  const payload: Record<string, unknown> = {
    address: c.address,
    source_url: c.sourceUrl,
    strike_cma_flag: Boolean(merged.strikeCmaFlag),
    classification_confidence: cls.confidence,
    review_required: cls.reviewRequired,
    score: s,
  };
  const optional: [string, unknown][] = [
    ["jurisdiction", c.jurisdiction],
    ["general_contractor", c.generalContractor],
    ["contractor_email", c.contractorEmail],
    ["contractor_phone", c.contractorPhone],
    ["developer", c.developer],
    ["permit_noc_number", c.permitNocNumber],
    ["phase", merged.phase],
    ["start_date", c.startDate],
    ["estimated_completion", c.estimatedCompletion],
    ["signal_type", c.signalType],
  ];
  for (const [k, v] of optional) if (v !== undefined && v !== null && v !== "") payload[k] = v;

  const { data: existing, error: findErr } = await db
    .from("jobsites")
    .select("id, source_code, lead_id, status, contractor_email")
    .eq("source_url", c.sourceUrl)
    .maybeSingle();
  if (findErr) throw new Error(`jobsites lookup failed: ${findErr.message}`);

  let id: string;
  let created = false;
  if (existing?.id) {
    const { error } = await db.from("jobsites").update(payload).eq("id", existing.id);
    if (error) throw new Error(`jobsites update failed: ${error.message}`);
    id = existing.id;
  } else {
    const { data, error } = await db
      .from("jobsites")
      .insert({ ...payload, status: "discovered" })
      .select("id")
      .single();
    if (error || !data) throw new Error(`jobsites insert failed: ${error?.message}`);
    id = data.id;
    created = true;
  }

  const sourceCode = existing?.source_code || makeSourceCode(id);
  if (!existing?.source_code) {
    const { error } = await db.from("jobsites").update({ source_code: sourceCode }).eq("id", id);
    if (error) throw new Error(`source_code update failed: ${error.message}`);
  }

  if (cls.reviewRequired) {
    await db.from("review_queue").insert({
      entity_type: "jobsite",
      entity_id: id,
      reason: cls.reason || `Low-confidence classification; score ${s}`,
      payload: c,
    });
  }

  // Leave the jobsite alone once it became a lead or a human approved/sent anything.
  if (existing?.lead_id || existing?.status === "lead") return { id, created, score: s, drafted: false, reason: "already a lead" };
  const { data: engaged, error: engagedErr } = await db
    .from("outreach_drafts")
    .select("id")
    .eq("jobsite_id", id)
    .in("status", ["approved", "sent", "replied", "failed"])
    .limit(1);
  if (engagedErr) throw new Error(`draft lookup failed: ${engagedErr.message}`);
  if (engaged && engaged.length) return { id, created, score: s, drafted: false, reason: "human already engaged" };

  const toEmail = c.contractorEmail || existing?.contractor_email || null;
  const drafts = draftOutreach(merged, trackedLink(opts.siteUrl, sourceCode), 1);
  const { error: delErr } = await db.from("outreach_drafts").delete().eq("jobsite_id", id).eq("status", "draft").eq("sequence_step", 1);
  if (delErr) throw new Error(`draft cleanup failed: ${delErr.message}`);
  const { error: insErr } = await db.from("outreach_drafts").insert([
    { jobsite_id: id, contact_role: "contractor", language: "en", subject: drafts.en.subject, body: drafts.en.body, status: "draft", to_email: toEmail, sequence_step: 1 },
    { jobsite_id: id, contact_role: "contractor", language: "es", subject: drafts.es.subject, body: drafts.es.body, status: "draft", to_email: toEmail, sequence_step: 1 },
  ]);
  if (insErr) throw new Error(`draft insert failed: ${insErr.message}`);

  return { id, created, score: s, drafted: true };
}
