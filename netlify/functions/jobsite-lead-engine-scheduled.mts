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
};

const SOURCES = [
  { key: "TOWN_PALM_BEACH_PERMITS_URL", jurisdiction: "Town of Palm Beach" },
  { key: "PALM_BEACH_COUNTY_NOC_URL", jurisdiction: "Palm Beach County" },
  { key: "WEST_PALM_BEACH_PERMITS_URL", jurisdiction: "West Palm Beach" },
  { key: "FLORIDA_YIMBY_FEED_URL", jurisdiction: undefined },
  { key: "THE_REAL_DEAL_FEED_URL", jurisdiction: undefined },
] as const;

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

function draftOutreach(c: Candidate) {
  const project = c.address;
  return {
    en: {
      subject: `Crew parking at ${project}`,
      body: `We operate daily crew shuttles in Palm Beach County for construction sites that need off-site parking. If your team at ${project} is managing crew parking or a staging lot, we can build a route around your shift times.\n\nIf useful, reply with the approximate riders per shift and the staging location, if one is already selected.\n\nMolly's Trolleys / Palm Beach Tours & Transportation\n(561) 655-5515`,
    },
    es: {
      subject: `Estacionamiento de cuadrilla en ${project}`,
      body: `Operamos transporte diario de cuadrillas en el condado de Palm Beach para obras que necesitan estacionamiento fuera del sitio. Si su equipo en ${project} está manejando el estacionamiento de la cuadrilla o un lote de apoyo, podemos armar una ruta según sus turnos.\n\nSi le sirve, responda con el número aproximado de pasajeros por turno y la ubicación del lote de apoyo, si ya está definido.\n\nMolly's Trolleys / Palm Beach Tours & Transportation\n(561) 655-5515`,
    },
  };
}

async function classify(candidate: Candidate) {
  const apiKey = Netlify.env.get("AI_GATEWAY_API_KEY");
  const gateway = Netlify.env.get("AI_GATEWAY_URL") || "https://ai-gateway.vercel.sh/v1/chat/completions";
  if (!apiKey) return { confidence: 0, reviewRequired: true, reason: "AI gateway is not configured.", phase: candidate.phase, strikeCmaFlag: candidate.strikeCmaFlag };

  const response = await fetch(gateway, {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
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

  if (!response.ok) return { confidence: 0, reviewRequired: true, reason: `Jev gateway HTTP ${response.status}`, phase: candidate.phase, strikeCmaFlag: candidate.strikeCmaFlag };
  try {
    const data = await response.json();
    const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}");
    const confidence = Math.max(0, Math.min(1, Number(parsed.confidence) || 0));
    return {
      confidence,
      reviewRequired: confidence < 0.75,
      reason: String(parsed.reason || ""),
      phase: parsed.phase || candidate.phase,
      strikeCmaFlag: Boolean(parsed.strikeCmaFlag ?? candidate.strikeCmaFlag),
    };
  } catch {
    return { confidence: 0, reviewRequired: true, reason: "Jev returned invalid JSON.", phase: candidate.phase, strikeCmaFlag: candidate.strikeCmaFlag };
  }
}

export default async () => {
  const url = Netlify.env.get("SUPABASE_URL");
  const key = Netlify.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Supabase server configuration is required.");

  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  for (const source of SOURCES) {
    const sourceUrl = Netlify.env.get(source.key);
    if (!sourceUrl) continue;

    const response = await fetch(sourceUrl, { headers: { accept: "application/json" } });
    if (!response.ok) continue;
    const rows = await response.json();
    if (!Array.isArray(rows)) continue;

    for (const row of rows) {
      if (!row?.address || !row?.sourceUrl) continue;

      const candidate: Candidate = {
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
      };

      const classification = await classify(candidate);
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
        strike_cma_flag: Boolean(classification.strikeCmaFlag),
        status: "discovered",
        classification_confidence: classification.confidence,
        review_required: classification.reviewRequired,
      };

      const { data: existing } = await db.from("jobsites").select("id").eq("source_url", candidate.sourceUrl).maybeSingle();
      const saved = existing?.id
        ? await db.from("jobsites").update(payload).eq("id", existing.id).select("id").single()
        : await db.from("jobsites").insert(payload).select("id").single();

      if (!saved.data?.id) continue;

      const score = deterministicScore({ ...candidate, phase: classification.phase, strikeCmaFlag: classification.strikeCmaFlag });
      const drafts = draftOutreach(candidate);

      await db.from("outreach_drafts").delete().eq("jobsite_id", saved.data.id).eq("status", "draft");
      await db.from("outreach_drafts").insert([
        { jobsite_id: saved.data.id, contact_role: "superintendent", language: "en", subject: drafts.en.subject, body: drafts.en.body, status: "draft" },
        { jobsite_id: saved.data.id, contact_role: "superintendent", language: "es", subject: drafts.es.subject, body: drafts.es.body, status: "draft" },
      ]);

      if (classification.reviewRequired) {
        await db.from("review_queue").insert({
          entity_type: "jobsite",
          entity_id: saved.data.id,
          reason: classification.reason || `Low-confidence classification; deterministic score ${score}`,
          payload: candidate,
        });
      }
    }
  }
};

export const config = {
  schedule: "17 10 * * *",
};
