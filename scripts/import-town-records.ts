// Import a Town of Palm Beach public-records spreadsheet (CSV) into the flywheel.
//
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
//   npx tsx scripts/import-town-records.ts --file permits.csv --ref PRR-2026-0142 --signal construction_permit [--dry-run]
//
// --signal: construction_permit | row_parking_permit | three_strike_affidavit | dev_review
// Excel exports: save as CSV first. Re-running the same file is safe (dedupes on records:<ref>#<permit>).
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { rowsToCandidates, SIGNAL_TYPES, type SignalType } from "../netlify/lib/flywheel";
import { classifyWithJev, processCandidate } from "../netlify/lib/signals";

function arg(name: string) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
const flag = (name: string) => process.argv.includes(`--${name}`);

async function main() {
  const file = arg("file");
  const ref = arg("ref");
  const signal = arg("signal") as SignalType | undefined;
  if (!file || !ref || !signal || !SIGNAL_TYPES.includes(signal)) {
    console.error("Usage: --file <csv> --ref <records request ref> --signal <" + SIGNAL_TYPES.join("|") + "> [--dry-run]");
    process.exit(2);
  }

  const { candidates, skipped, headers } = rowsToCandidates(readFileSync(file, "utf8"), { requestRef: ref, signalType: signal });
  console.log(`Headers: ${headers.join(" | ")}`);
  console.log(`Parsed ${candidates.length} rows, skipped ${skipped.length}${skipped.length ? ": " + JSON.stringify(skipped.slice(0, 10)) : ""}`);
  const withEmail = candidates.filter((c) => c.contractorEmail).length;
  console.log(`With contractor email: ${withEmail}/${candidates.length}`);

  if (flag("dry-run")) {
    console.log(JSON.stringify(candidates.slice(0, 5), null, 2));
    console.log("Dry run: nothing written.");
    return;
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const env = (k: string) => process.env[k];
  const siteUrl = process.env.PUBLIC_SITE_URL || "https://spatchy.netlify.app/";

  let created = 0, updated = 0, drafted = 0, failed = 0;
  for (const c of candidates) {
    try {
      const r = await processCandidate(db, c, { siteUrl, classification: await classifyWithJev(c, env) });
      r.created ? created++ : updated++;
      if (r.drafted) drafted++;
    } catch (e) {
      failed++;
      console.error(`${c.sourceUrl}: ${(e as Error).message}`);
    }
  }
  console.log(JSON.stringify({ created, updated, drafted, failed }));
  if (failed) process.exit(1);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
