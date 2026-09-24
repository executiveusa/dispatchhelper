import { createClient } from "@supabase/supabase-js";

type Candidate = {
  address: string;
  jurisdiction?: string;
  generalContractor?: string;
  developer?: string;
  permitNocNumber?: string;
  phase?: string;
  startDate?: string;
  estimatedCompletion?: string;
  sourceUrl: string;
  strikeCmaFlag?: boolean;
  sourcePriority: number;
};

const SOURCES = [
  { key: "TOWN_PALM_BEACH_PERMITS_URL", jurisdiction: "Town of Palm Beach", priority: 1 },
  { key: "PALM_BEACH_COUNTY_NOC_URL", jurisdiction: "Palm Beach County", priority: 2 },
  { key: "WEST_PALM_BEACH_PERMITS_URL", jurisdiction: "West Palm Beach", priority: 3 },
  { key: "FLORIDA_YIMBY_FEED_URL", jurisdiction: undefined, priority: 4 },
  { key: "THE_REAL_DEAL_FEED_URL", jurisdiction: undefined, priority: 5 },
] as const;

function env(name: string) {
  return process.env[name]?.trim();
}

async function fetchCandidates(): Promise<Candidate[]> {
  const out: Candidate[] = [];
  for (const source of SOURCES) {
    const url = env(source.key);
    if (!url) continue;
    const response = await fetch(url, { headers: { accept: "application/json" } });
    if (!response.ok) continue;
    const rows = await response.json();
    if (!Array.isArray(rows)) continue;
    for (const row of rows) {
      if (!row?.address || !row?.sourceUrl) continue;
      out.push({
        address: String(row.address),
        jurisdiction: row.jurisdiction ? String(row.jurisdiction) : source.jurisdiction,
        generalContractor: row.generalContractor ? String(row.generalContractor) : undefined,
        developer: row.developer ? String(row.developer) : undefined,
        permitNocNumber: row.permitNocNumber ? String(row.permitNocNumber) : undefined,
        phase: row.phase ? String(row.phase) : undefined,
        startDate: row.startDate ? String(row.startDate) : undefined,
        estimatedCompletion: row.estimatedCompletion ? String(row.estimatedCompletion) : undefined,
        sourceUrl: String(row.sourceUrl),
        strikeCmaFlag: Boolean(row.strikeCmaFlag),
        sourcePriority: source.priority,
      });
    }
  }
  return out;
}

function deterministicScore(c: Candidate) {
  let score = 0;
  const jurisdiction = (c.jurisdiction || "").toLowerCase();
  const phase = (c.phase || "").toLowerCase();
  if (jurisdiction.includes("town of palm beach") || jurisdiction.includes("palm beach island")) score += 40;
  else if (jurisdiction.includes("west palm beach")) score += 25;
  if (phase.includes("mid") || phase.includes("construction") || phase.includes("active")) score += 25;
  else if (phase.includes("pre")) score += 10;
  if (c.strikeCmaFlag) score += 35;
  return Math.min(100, score);
}

async function classifyWithJev(candidate: Candidate) {
  const apiKey = env("AI_GATEWAY_API_KEY");
  const gateway = env("AI_GATEWAY_URL") || "https://ai-gateway.vercel.sh/v1/chat/completions";
  if (!apiKey) return { confidence: 0, reviewRequired: true, reason: "AI gateway is not configured." };

  const response = await fetch(gateway, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "typesafe-ai/jev",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "Classify Palm Beach construction jobsite leads for crew-shuttle need. Return JSON only: {confidence:number, phase:string|null, strikeCmaFlag:boolean, reason:string}. Never invent a contractor, developer, permit number, or fact not present in the input."
        },
        { role: "user", content: JSON.stringify(candidate) },
      ],
    }),
  });

  if (!response.ok) return { confidence: 0, reviewRequired: true, reason: `Jev gateway HTTP ${response.status}` };
  const data = await response.json();
  try {
    const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}");
    const confidence = Math.max(0, Math.min(1, Number(parsed.confidence) || 0));
    return {
      confidence,
      phase: parsed.phase || candidate.phase,
      strikeCmaFlag: Boolean(parsed.strikeCmaFlag ?? candidate.strikeCmaFlag),
      reason: String(parsed.reason || ""),
      reviewRequired: confidence < 0.75,
    };
  } catch {
    return { confidence: 0, reviewRequired: true, reason: "Jev returned invalid JSON." };
  }
}

function draftOutreach(c: Candidate) {
  const project = c.address;
  return {
    en: `Subject: Crew parking at ${project}\n\nWe operate daily crew shuttles in Palm Beach County for construction sites that need off-site parking. If your team at ${project} is managing crew parking or a staging lot, we can build a route around your shift times.\n\nIf useful, reply with the approximate riders per shift and the staging location, if one is already selected.\n\nMolly's Trolleys / Palm Beach Tours & Transportation\n(561) 655-5515`,
    es: `Asunto: Estacionamiento de cuadrilla en ${project}\n\nOperamos transporte diario de cuadrillas en el condado de Palm Beach para obras que necesitan estacionamiento fuera del sitio. Si su equipo en ${project} está manejando el estacionamiento de la cuadrilla o un lote de apoyo, podemos armar una ruta según sus turnos.\n\nSi le sirve, responda con el número aproximado de pasajeros por turno y la ubicación del lote de apoyo, si ya está definido.\n\nMolly's Trolleys / Palm Beach Tours & Transportation\n(561) 655-5515`,
  };
}

export async function runJobsiteLeadEngine() {
  const url = env("SUPABASE_URL");
  const serviceRole = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceRole) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");

  const db = createClient(url, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });
  const candidates = await fetchCandidates();

  for (const candidate of candidates) {
    const classification = await classifyWithJev(candidate);
    const score = deterministicScore({ ...candidate, phase: classification.phase, strikeCmaFlag: classification.strikeCmaFlag });
    const drafts = draftOutreach(candidate);

    const { data: existing } = await db
      .from("jobsites")
      .select("id")
      .eq("source_url", candidate.sourceUrl)
      .maybeSingle();

    const payload = {
      address: candidate.address,
      jurisdiction: candidate.jurisdiction || null,
      general_contractor: candidate.generalContractor || null,
      developer: candidate.developer || null,
      permit_noc_number: candidate.permitNocNumber || null,
      phase: classification.phase || null,
      start_date: candidate.startDate || null,
      estimated_completion: candidate.estimatedCompletion || null,
      source_url: candidate.sourceUrl,
      strike_cma_flag: classification.strikeCmaFlag,
      status: "discovered",
      classification_confidence: classification.confidence,
      review_required: classification.reviewRequired,
    };

    const result = existing?.id
      ? await db.from("jobsites").update(payload).eq("id", existing.id).select("id").single()
      : await db.from("jobsites").insert(payload).select("id").single();

    if (!result.data?.id) continue;

    const { data: lead } = await db.from("leads").insert({
      name: "Jobsite discovery",
      company: candidate.generalContractor || "Unknown contractor",
      role: "Superintendent",
      phone: "unknown",
      email: "unknown",
      site: candidate.address,
      riders: 1,
      source: "jobsite-lead-engine",
      page: candidate.sourceUrl,
      score,
      score_reason: classification.reason,
      status: "research",
      drafted_reply_en: drafts.en,
      drafted_reply_es: drafts.es,
    }).select("id").single();

    if (lead?.id) {
      await db.from("jobsites").update({ lead_id: lead.id }).eq("id", result.data.id);
    }

    if (classification.reviewRequired) {
      await db.from("review_queue").insert({
        entity_type: "jobsite",
        entity_id: result.data.id,
        reason: classification.reason || "Low-confidence classification",
        payload: candidate,
      });
    }
  }

  return { processed: candidates.length };
}

if (process.argv[1]?.endsWith("jobsite-lead-engine.ts")) {
  runJobsiteLeadEngine().then(console.log).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
