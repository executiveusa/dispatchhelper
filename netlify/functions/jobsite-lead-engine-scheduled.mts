import { createClient } from "@supabase/supabase-js";
import { type Candidate, SIGNAL_TYPES, type SignalType } from "../lib/flywheel";
import { classifyWithJev, processCandidate } from "../lib/signals";

// JSON feeds of jobsite signals. Unset keys are skipped. Records-request CSVs don't need a feed:
// they go straight in with scripts/import-town-records.ts.
const SOURCES = [
  { key: "TOWN_PALM_BEACH_PERMITS_URL", jurisdiction: "Town of Palm Beach" },
  { key: "TOWN_PALM_BEACH_DEV_REVIEW_URL", jurisdiction: "Town of Palm Beach" },
  { key: "PALM_BEACH_COUNTY_NOC_URL", jurisdiction: "Palm Beach County" },
  { key: "WEST_PALM_BEACH_PERMITS_URL", jurisdiction: "West Palm Beach" },
  { key: "FLORIDA_YIMBY_FEED_URL", jurisdiction: undefined },
  { key: "THE_REAL_DEAL_FEED_URL", jurisdiction: undefined },
] as const;

function toCandidate(row: any, jurisdiction: string | undefined): Candidate | null {
  if (!row?.address || !row?.sourceUrl) return null;
  const str = (v: unknown) => (v === undefined || v === null || v === "" ? undefined : String(v));
  const signalType = SIGNAL_TYPES.includes(row.signalType) ? (row.signalType as SignalType) : undefined;
  return {
    address: String(row.address),
    jurisdiction: str(row.jurisdiction) ?? jurisdiction,
    generalContractor: str(row.generalContractor),
    contractorEmail: str(row.contractorEmail),
    contractorPhone: str(row.contractorPhone),
    developer: str(row.developer),
    permitNocNumber: str(row.permitNocNumber),
    phase: str(row.phase),
    startDate: str(row.startDate),
    estimatedCompletion: str(row.estimatedCompletion),
    sourceUrl: String(row.sourceUrl),
    strikeCmaFlag: Boolean(row.strikeCmaFlag),
    signalType,
  };
}

export async function runEngine(env: (k: string) => string | undefined) {
  const url = env("SUPABASE_URL");
  const key = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Supabase server configuration is required.");
  const siteUrl = env("PUBLIC_SITE_URL") || "https://spatchy.netlify.app/";
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  const summary: Record<string, { rows: number; processed: number; errors: number }> = {};
  for (const source of SOURCES) {
    const feedUrl = env(source.key);
    if (!feedUrl) continue;
    const s = (summary[source.key] = { rows: 0, processed: 0, errors: 0 });
    const headers: Record<string, string> = { accept: "application/json" };
    const feedKey = env("SIGNAL_FEED_KEY");
    if (feedKey) headers.authorization = `Bearer ${feedKey}`;

    const response = await fetch(feedUrl, { headers });
    if (!response.ok) {
      console.error(`${source.key}: HTTP ${response.status}`);
      s.errors++;
      continue;
    }
    const rows = await response.json();
    if (!Array.isArray(rows)) {
      console.error(`${source.key}: feed is not a JSON array`);
      s.errors++;
      continue;
    }
    s.rows = rows.length;
    for (const row of rows) {
      const c = toCandidate(row, source.jurisdiction);
      if (!c) continue;
      try {
        await processCandidate(db, c, { siteUrl, classification: await classifyWithJev(c, env) });
        s.processed++;
      } catch (e) {
        s.errors++;
        console.error(`${source.key} ${c.sourceUrl}: ${(e as Error).message}`);
      }
    }
  }
  console.log(JSON.stringify({ engine: "jobsite-lead-engine", summary }));
  return summary;
}

export default async () => {
  await runEngine((k) => Netlify.env.get(k));
};

export const config = {
  schedule: "17 10 * * *",
};
