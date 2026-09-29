// Pure flywheel logic. No I/O here, so every function is unit-tested (tests/flywheel.test.ts).

export type SignalType =
  | "dev_review"
  | "construction_permit"
  | "row_parking_permit"
  | "three_strike_affidavit"
  | "news"
  | "manual";

export const SIGNAL_TYPES: readonly SignalType[] = [
  "dev_review",
  "construction_permit",
  "row_parking_permit",
  "three_strike_affidavit",
  "news",
  "manual",
];

export type Candidate = {
  address: string;
  jurisdiction?: string;
  generalContractor?: string;
  contractorEmail?: string;
  contractorPhone?: string;
  developer?: string;
  permitNocNumber?: string;
  phase?: string;
  startDate?: string;
  estimatedCompletion?: string;
  sourceUrl: string;
  strikeCmaFlag?: boolean;
  signalType?: SignalType;
};

// Company facts, exactly as published on the live page footer.
export const COMPANY = {
  name: "Molly's Trolleys / Palm Beach Tours & Transportation",
  phone: "(561) 655-5515",
  postal: "800 23rd Street, West Palm Beach, FL 33407",
};

// ---------------------------------------------------------------------------
// Attribution
// ---------------------------------------------------------------------------

/** Allow-list a ?source= value. Anything else falls back to the default. */
export function normalizeSource(raw: unknown, fallback = "crew-shuttle-landing"): string {
  const value = String(raw ?? "").trim().toLowerCase();
  return /^[a-z0-9_-]{1,80}$/.test(value) ? value : fallback;
}

/** Stable, short per-jobsite code, e.g. "o-3f9c2a1b". Derived from the jobsite uuid. */
export function makeSourceCode(jobsiteId: string): string {
  const hex = jobsiteId.replace(/[^a-f0-9]/gi, "").toLowerCase();
  if (hex.length < 8) throw new Error("jobsite id too short for a source code");
  return `o-${hex.slice(0, 8)}`;
}

export function trackedLink(siteUrl: string, sourceCode: string): string {
  const u = new URL(siteUrl);
  u.searchParams.set("source", sourceCode);
  return u.toString();
}

// ---------------------------------------------------------------------------
// Scoring (deterministic, explainable)
// ---------------------------------------------------------------------------

export function score(c: Candidate): number {
  let s = 0;
  const j = (c.jurisdiction || "").toLowerCase();
  const phase = (c.phase || "").toLowerCase();
  if (j.includes("town of palm beach") || j.includes("palm beach island")) s += 40;
  else if (j.includes("west palm beach")) s += 25;
  else if (j.includes("palm beach")) s += 15;

  switch (c.signalType) {
    case "three_strike_affidavit":
    case "row_parking_permit":
      s += 35; // the parking problem is on record
      break;
    case "construction_permit":
      s += 20;
      break;
    case "dev_review":
      s += 5; // early; nurture, not urgent
      break;
  }
  if (c.strikeCmaFlag && c.signalType !== "three_strike_affidavit" && c.signalType !== "row_parking_permit") s += 20;
  if (phase.includes("mid") || phase.includes("construction") || phase.includes("active")) s += 15;
  else if (phase.includes("pre")) s += 5;
  if (c.contractorEmail) s += 5; // reachable
  return Math.max(0, Math.min(100, s));
}

// ---------------------------------------------------------------------------
// Outreach copy. Facts only from the record; CAN-SPAM footer on every message.
// ---------------------------------------------------------------------------

export type Draft = { subject: string; body: string };

function footer(lang: "en" | "es", link: string): string {
  return lang === "en"
    ? `\n\nSee how it works: ${link}\n\n${COMPANY.name}\n${COMPANY.phone}\n${COMPANY.postal}\n\nReply STOP and we won't contact you again.`
    : `\n\nVea cómo funciona: ${link}\n\n${COMPANY.name}\n${COMPANY.phone}\n${COMPANY.postal}\n\nResponda ALTO y no volveremos a contactarle.`;
}

export function draftOutreach(c: Candidate, link: string, step: 1 | 2 | 3 = 1): { en: Draft; es: Draft } {
  const at = c.address;
  const parkingOnRecord = c.signalType === "row_parking_permit" || c.signalType === "three_strike_affidavit";

  if (step === 1) {
    const enLead = parkingOnRecord
      ? `Your project at ${at} has construction parking on file with the Town.`
      : `We saw the project at ${at}.`;
    const esLead = parkingOnRecord
      ? `Su proyecto en ${at} tiene estacionamiento de construcción registrado con el Town.`
      : `Vimos el proyecto en ${at}.`;
    return {
      en: {
        subject: `Crew parking at ${at}`,
        body:
          `${enLead} We run daily crew shuttles from a staging lot to Palm Beach County jobsites, 27–31 seats per vehicle, with dispatch and drivers available 24/7.\n\n` +
          `If it helps, reply with riders per shift and your staging lot, if you have one, and dispatch will size a route around your shift times.` +
          footer("en", link),
      },
      es: {
        subject: `Estacionamiento de cuadrilla en ${at}`,
        body:
          `${esLead} Operamos transporte diario de cuadrillas desde un lote de apoyo hasta obras en el condado de Palm Beach, de 27 a 31 asientos por vehículo, con despacho y choferes 24/7.\n\n` +
          `Si le sirve, responda con los pasajeros por turno y su lote de apoyo, si ya lo tiene, y despacho armará una ruta según sus turnos.` +
          footer("es", link),
      },
    };
  }

  if (step === 2) {
    return {
      en: {
        subject: `Re: Crew parking at ${at}`,
        body:
          `Following up on crew transportation for ${at}. If parking at the site is limited, a shuttle from a staging lot keeps crew vehicles off the street. ` +
          `A rider count per shift is enough for dispatch to size it.` +
          footer("en", link),
      },
      es: {
        subject: `Re: Estacionamiento de cuadrilla en ${at}`,
        body:
          `Damos seguimiento al transporte de cuadrillas para ${at}. Si el estacionamiento en la obra es limitado, un shuttle desde un lote de apoyo mantiene los vehículos fuera de la calle. ` +
          `Con el número de pasajeros por turno, despacho puede calcularlo.` +
          footer("es", link),
      },
    };
  }

  return {
    en: {
      subject: `Last note: crew shuttle for ${at}`,
      body:
        `Last note from us on ${at}. If crew parking becomes an issue later, dispatch is available 24/7 at ${COMPANY.phone}.` +
        footer("en", link),
    },
    es: {
      subject: `Última nota: shuttle de cuadrilla para ${at}`,
      body:
        `Última nota sobre ${at}. Si el estacionamiento de la cuadrilla se vuelve un problema, despacho está disponible 24/7 al ${COMPANY.phone}.` +
        footer("es", link),
    },
  };
}

// ---------------------------------------------------------------------------
// Sequencing
// ---------------------------------------------------------------------------

/** Follow-up spacing after the previous touch, in business days. Defaults; tune with data. */
export const FOLLOWUP_BUSINESS_DAYS: Record<2 | 3, number> = { 2: 4, 3: 6 };

export function addBusinessDays(from: Date, days: number): Date {
  const d = new Date(from.getTime());
  let added = 0;
  while (added < days) {
    d.setUTCDate(d.getUTCDate() + 1);
    const dow = d.getUTCDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return d;
}

// ---------------------------------------------------------------------------
// Replies
// ---------------------------------------------------------------------------

/** True when a reply asks to stop contact, in English or Spanish. Checks the first lines only,
 *  so a quoted footer ("Reply STOP ...") in the thread doesn't trigger it. */
export function isStopReply(text: string): boolean {
  const head = String(text || "")
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith(">"))
    .slice(0, 5)
    .join(" ")
    .toLowerCase();
  if (/reply stop and we won't contact you again|responda alto y no volveremos/.test(head)) {
    // Our own footer quoted without ">" (some clients). Only count an explicit standalone keyword.
    return /^\s*(stop|alto|unsubscribe)\b/.test(head);
  }
  return /\b(stop|unsubscribe|remove me|opt out|opt-out|no more emails|alto|darme de baja|no me contacten|no contactar)\b/.test(head);
}

export function normalizeEmail(raw: unknown): string | null {
  const v = String(raw ?? "").trim().toLowerCase();
  // Extract from "Name <x@y.z>"
  const m = v.match(/<([^>]+)>/);
  const e = (m ? m[1] : v).trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? e : null;
}

// ---------------------------------------------------------------------------
// Records import: CSV parsing + header mapping. The Town's column names aren't known
// until the records arrive, so headers are matched against aliases and the import
// fails loudly (listing the headers it saw) if a required field can't be found.
// ---------------------------------------------------------------------------

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const s = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (quoted) {
      if (ch === '"') {
        if (s[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && s[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((f) => f.trim() !== "")) rows.push(row);
      row = [];
    } else field += ch;
  }
  row.push(field);
  if (row.some((f) => f.trim() !== "")) rows.push(row);
  return rows;
}

const ALIASES: Record<string, string[]> = {
  permit: ["permit number", "permit #", "permit no", "permit_no", "permitnumber", "record number", "record #", "case number", "permit"],
  address: ["address", "project address", "site address", "location", "property address", "permit address", "street address"],
  contractor: ["contractor", "contractor name", "contractor corporate name", "contractor business name", "business name", "company", "qualifier business", "applicant company", "contractor dba name"],
  email: ["contractor email", "email", "e-mail", "applicant email", "contact email"],
  phone: ["contractor phone", "contractor phone #", "phone", "phone number", "contact phone", "applicant phone"],
  issued: ["issue date", "issued", "issued date", "date issued", "permit date", "approval date"],
  type: ["permit type", "type", "work type", "record type", "description", "work description"],
};

const norm = (h: string) => h.trim().toLowerCase().replace(/[\s_]+/g, " ").replace(/[^a-z0-9# -]/g, "");

export type HeaderMap = Partial<Record<keyof typeof ALIASES, number>>;

export function mapHeaders(headers: string[]): HeaderMap {
  const n = headers.map(norm);
  const out: HeaderMap = {};
  for (const [key, aliases] of Object.entries(ALIASES)) {
    const idx = n.findIndex((h) => aliases.includes(h));
    if (idx >= 0) out[key as keyof typeof ALIASES] = idx;
  }
  return out;
}

export function rowsToCandidates(
  text: string,
  opts: { requestRef: string; signalType: SignalType; jurisdiction?: string },
): { candidates: Candidate[]; skipped: { line: number; reason: string }[]; headers: string[] } {
  const rows = parseCsv(text);
  if (rows.length < 2) throw new Error("CSV has no data rows");
  const headers = rows[0];
  const map = mapHeaders(headers);
  const missing = (["address"] as const).filter((k) => map[k] === undefined);
  if (missing.length) {
    throw new Error(`CSV is missing required column(s): ${missing.join(", ")}. Headers seen: ${headers.join(" | ")}`);
  }
  const ref = opts.requestRef.replace(/[^A-Za-z0-9_-]/g, "");
  if (!ref) throw new Error("requestRef is required (the Town's records request reference)");

  const get = (r: string[], k: keyof typeof ALIASES) => {
    const i = map[k];
    return i === undefined ? "" : String(r[i] ?? "").trim();
  };

  const candidates: Candidate[] = [];
  const skipped: { line: number; reason: string }[] = [];
  const seen = new Set<string>();
  rows.slice(1).forEach((r, i) => {
    const line = i + 2;
    const address = get(r, "address");
    if (!address) return skipped.push({ line, reason: "no address" });
    const permit = get(r, "permit");
    const key = permit || `row${line}`;
    const sourceUrl = `records:${ref}#${key}`;
    if (seen.has(sourceUrl)) return skipped.push({ line, reason: `duplicate ${key}` });
    seen.add(sourceUrl);
    const typeText = get(r, "type").toLowerCase();
    // A generic permit export may mix types: promote rows that are clearly ROW/parking permits.
    let signalType = opts.signalType;
    if (signalType === "construction_permit" && /right[- ]of[- ]way|\brow\b|parking/.test(typeText)) signalType = "row_parking_permit";
    candidates.push({
      address,
      jurisdiction: opts.jurisdiction || "Town of Palm Beach",
      generalContractor: get(r, "contractor") || undefined,
      contractorEmail: normalizeEmail(get(r, "email")) || undefined,
      contractorPhone: get(r, "phone") || undefined,
      permitNocNumber: permit || undefined,
      startDate: toIsoDate(get(r, "issued")),
      sourceUrl,
      signalType,
      strikeCmaFlag: signalType === "row_parking_permit" || signalType === "three_strike_affidavit",
    });
  });
  return { candidates, skipped, headers };
}

/** Accepts ISO (2026-03-04) or US (3/4/2026, 03/04/26). Returns undefined when unparseable. */
export function toIsoDate(v: string): string | undefined {
  const s = v.trim();
  if (!s) return undefined;
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/);
  if (m) {
    const y = m[3].length === 2 ? `20${m[3]}` : m[3];
    const mm = m[1].padStart(2, "0");
    const dd = m[2].padStart(2, "0");
    if (+mm >= 1 && +mm <= 12 && +dd >= 1 && +dd <= 31) return `${y}-${mm}-${dd}`;
  }
  return undefined;
}
