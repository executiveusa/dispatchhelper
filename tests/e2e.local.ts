// LOCAL HARNESS — full flywheel loop against a real Postgres + PostgREST (the Supabase API layer).
// Requirements: Postgres 15+ on /tmp:5499 with a database "e2e" migrated through 202609290001,
// PostgREST serving it behind a /rest/v1 proxy on 127.0.0.1:54321, and a service_role JWT in /tmp/svc.key.
// Paths are the ones used when this was run on 2026-09-29; adapt them to your machine or CI.
// End-to-end run of the flywheel against local Postgres + PostgREST. Synthetic data only.
import http from "node:http";
import { execSync } from "node:child_process";
import assert from "node:assert/strict";

const KEY = execSync("cat /tmp/svc.key").toString().trim();
const env: Record<string, string> = {
  SUPABASE_URL: "http://127.0.0.1:54321",
  SUPABASE_SERVICE_ROLE_KEY: KEY,
  INTAKE_RATE_LIMIT_SALT: "e2e-salt",
  PUBLIC_SITE_URL: "https://spatchy.netlify.app/",
  OUTREACH_INBOUND_SECRET: "inbound-secret",
  OUTREACH_FROM: "dispatch@company.test",
};
(globalThis as any).Netlify = { env: { get: (k: string) => env[k] } };
const E = (k: string) => env[k];
const sql = (q: string) => execSync(`psql -h /tmp -p 5499 -U postgres -d e2e -At -F '|' -c "${q.replace(/"/g, '\\"')}"`).toString().trim();
const step = (s: string) => console.log(`\n▶ ${s}`);

// Catch outgoing webhooks (email provider + dispatch) and serve a signal feed.
const caught: { path: string; body: any }[] = [];
const feed = [{ address: "300 Feed Ave", sourceUrl: "feed:TEST-0300", generalContractor: "Other Co", contractorEmail: "PM@Other.test", signalType: "three_strike_affidavit", phase: "active" }];
const srv = http.createServer((req, res) => {
  let b = "";
  req.on("data", (c) => (b += c));
  req.on("end", () => {
    if (req.url === "/feed") { res.writeHead(200, { "content-type": "application/json" }); return res.end(JSON.stringify(feed)); }
    caught.push({ path: req.url!, body: b ? JSON.parse(b) : null });
    if (req.url === "/email-fail") { res.writeHead(500); return res.end("provider down"); }
    res.writeHead(200, { "content-type": "application/json" }); res.end(JSON.stringify({ id: `msg-${caught.length}` }));
  });
}).listen(54400);
const hook = (p: string) => `http://127.0.0.1:54400${p}`;

async function main() {
  step("Seed: a past customer (contract ended)");
  sql("insert into accounts(company,daily_rate,round_trips,start_date,status) values ('Example Builders, Inc.',100,3,'2026-01-05','ended')");

  step("Import the records-request CSV (Jev not configured → rows go to review, never guessed)");
  const out = execSync(
    `SUPABASE_URL=${env.SUPABASE_URL} SUPABASE_SERVICE_ROLE_KEY=${KEY} NODE_PATH=/tmp/tt/node_modules node --import /tmp/tt/node_modules/tsx/dist/esm/index.mjs scripts/import-town-records.ts --file tests/fixtures/records-sample.csv --ref PRR-TEST-1 --signal construction_permit`,
  ).toString();
  console.log(out.trim().split("\n").slice(-2).join("\n"));
  assert.equal(sql("select count(*) from jobsites"), "2");
  assert.equal(sql("select count(*) from jobsites where source_code ~ '^o-[0-9a-f]{8}$'"), "2");
  assert.equal(sql("select signal_type from jobsites where permit_noc_number='TEST-0002'"), "row_parking_permit");
  assert.equal(sql("select count(*) from outreach_drafts where status='draft' and sequence_step=1"), "4");
  assert.equal(sql("select count(*) from review_queue"), "2");
  console.log("  jobsites 2, drafts 4 (EN+ES each), review_queue 2 ✓");

  step("Expansion loop: past customer's new permits raise alerts");
  assert.equal(sql("select count(*) from account_tasks where task_type='new_project_alert'"), "2");
  console.log("  2 new_project_alert tasks for 'Example Builders, Inc.' ✓");

  step("Re-import the same file: idempotent");
  execSync(`SUPABASE_URL=${env.SUPABASE_URL} SUPABASE_SERVICE_ROLE_KEY=${KEY} NODE_PATH=/tmp/tt/node_modules node --import /tmp/tt/node_modules/tsx/dist/esm/index.mjs scripts/import-town-records.ts --file tests/fixtures/records-sample.csv --ref PRR-TEST-1 --signal construction_permit`);
  assert.equal(sql("select count(*) from jobsites"), "2");
  assert.equal(sql("select count(*) from outreach_drafts"), "4");
  assert.equal(sql("select count(*) from account_tasks where task_type='new_project_alert'"), "2");
  console.log("  still 2 jobsites, 4 drafts, 2 alerts ✓");

  step("Daily engine reads a JSON feed");
  env.TOWN_PALM_BEACH_PERMITS_URL = hook("/feed");
  const { runEngine } = await import("/home/claude/repo/netlify/functions/jobsite-lead-engine-scheduled.mts");
  const sum = await runEngine(E);
  assert.equal(sum.TOWN_PALM_BEACH_PERMITS_URL.processed, 1);
  assert.equal(sql("select contractor_email||'|'||signal_type||'|'||score from jobsites where source_url='feed:TEST-0300'"), "PM@Other.test|three_strike_affidavit|95");
  console.log("  feed row → jobsite, score 95 (island + parking on record + active + email) ✓");

  const [j1, code1] = sql("select id, source_code from jobsites where permit_noc_number='TEST-0001'").split("|");
  const [j3, code3] = sql("select id, source_code from jobsites where source_url='feed:TEST-0300'").split("|");
  const d1en = sql(`select id from outreach_drafts where jobsite_id='${j1}' and language='en'`);
  const d1es = sql(`select id from outreach_drafts where jobsite_id='${j1}' and language='es'`);
  const d2es = sql(`select id from outreach_drafts where jobsite_id=(select id from jobsites where permit_noc_number='TEST-0002') and language='es'`);
  const d3en = sql(`select id from outreach_drafts where jobsite_id='${j3}' and language='en'`);

  step("Nothing sends without approval; a human approves 4 drafts");
  const { runSender } = await import("/home/claude/repo/netlify/functions/outreach-sender-scheduled.mts");
  let r = await runSender(E);
  assert.equal(r.wouldSend.length, 0);
  sql(`update outreach_drafts set status='approved', approved_at=now() where id in ('${d1en}','${d1es}','${d2es}','${d3en}')`);

  step("Dry run (OUTREACH_SEND_ENABLED unset): reports, changes nothing");
  r = await runSender(E);
  console.log("  would send:", r.wouldSend.length, "skipped:", JSON.stringify(r.skipped));
  assert.equal(r.live, false);
  assert.equal(r.wouldSend.length, 2, "one language per jobsite");
  assert.equal(caught.length, 0);
  assert.equal(sql("select count(*) from outreach_drafts where status='approved'"), "4");

  step("Live send, provider down → marked failed, logged, nothing lost");
  env.OUTREACH_SEND_ENABLED = "true";
  env.OUTREACH_EMAIL_WEBHOOK_URL = hook("/email-fail");
  env.OUTREACH_BATCH_LIMIT = "1";
  r = await runSender(E);
  assert.equal(r.failed, 1);
  const failedId = sql("select id from outreach_drafts where status='failed'");
  console.log("  failed:", r.failed, "error stored:", sql(`select left(delivery_error,40) from outreach_drafts where id='${failedId}'`));
  sql(`update outreach_drafts set status='approved', delivery_error=null where id='${failedId}'`); // human retries

  step("Live send, provider up");
  env.OUTREACH_EMAIL_WEBHOOK_URL = hook("/email");
  env.OUTREACH_BATCH_LIMIT = "25";
  caught.length = 0;
  r = await runSender(E);
  console.log("  sent:", r.sent, "skipped:", JSON.stringify(r.skipped));
  assert.equal(r.sent, 2, "TEST-0001 (one language) + feed jobsite");
  assert.equal(r.skipped.skipped_no_email, 1, "TEST-0002 has no email on record");
  assert.equal(r.skipped.superseded, 1, "the other-language twin of TEST-0001");
  const mail = caught.find((c) => c.path === "/email")!.body;
  assert.ok(mail.text.includes("800 23rd Street, West Palm Beach, FL 33407"));
  assert.ok(mail.text.includes("Reply STOP") || mail.text.includes("Responda ALTO"));
  assert.ok(/source=o-[0-9a-f]{8}/.test(mail.text));
  console.log("  email payload has postal address, opt-out, tracked link ✓");
  assert.equal(sql(`select status from jobsites where id='${j1}'`), "contacted");

  step("Follow-ups queue on the next run, held until business day +4, still need approval");
  r = await runSender(E);
  console.log("  queued:", r.queued);
  assert.equal(r.queued, 2);
  const fu = sql(`select status, sequence_step, send_after::date from outreach_drafts where parent_draft_id is not null and jobsite_id='${j3}'`);
  console.log("  follow-up:", fu);
  assert.ok(fu.startsWith("draft|2|"));
  r = await runSender(E);
  assert.equal(r.queued, 0, "no duplicate follow-ups");

  step("A real reply: sequence stops, dispatch alerted");
  const { handleReply } = await import("/home/claude/repo/netlify/functions/outreach-reply.mts");
  env.DISPATCH_SMS_WEBHOOK_URL = hook("/sms"); env.DISPATCH_SMS_TO = "+15610000000";
  const bad = await handleReply(new Request("http://x/api/outreach-reply", { method: "POST", headers: { "x-spatchy-secret": "wrong" }, body: "{}" }), E);
  assert.equal(bad.status, 401);
  const to1 = sql(`select to_email from outreach_drafts where jobsite_id='${j1}' and status='sent'`);
  let res = await handleReply(new Request("http://x", { method: "POST", headers: { "x-spatchy-secret": "inbound-secret" }, body: JSON.stringify({ from: `Pat <${to1}>`, subject: "Re: Crew parking", text: "We have about 60 riders per shift. Call me.\n\n> Reply STOP and we won't contact you again." }) }), E);
  console.log("  reply →", JSON.stringify(await res.json()));
  assert.equal(sql(`select count(*) from outreach_drafts where jobsite_id='${j1}' and status in ('draft','approved')`), "0");
  assert.ok(caught.some((c) => c.path === "/sms" && c.body.type === "outreach_reply"));

  step("STOP reply: suppressed, pending mail cancelled");
  res = await handleReply(new Request("http://x", { method: "POST", headers: { "x-spatchy-secret": "inbound-secret" }, body: JSON.stringify({ from: "pm@other.test", text: "STOP" }) }), E);
  console.log("  stop →", JSON.stringify(await res.json()));
  assert.equal(sql("select count(*) from suppression_list where email='pm@other.test'"), "1");
  assert.equal(sql(`select count(*) from outreach_drafts where jobsite_id='${j3}' and status in ('draft','approved')`), "0");

  step("Lead via the page with the tracked code (runs the real intake function)");
  const { default: intake } = await import("/home/claude/repo/netlify/functions/intake.mts");
  const lr = await intake(new Request("http://x/api/intake", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "Pat Test", company: "Example Builders", phone: "5610000000", email: to1, site: "100 Example Way", riders: 60, lang: "en", source: code1, website: "" }) }), { ip: "127.0.0.1" });
  const lj = await lr.json();
  console.log("  intake →", lr.status, JSON.stringify(lj).slice(0, 80));
  assert.equal(lr.status, 200);
  assert.equal(sql(`select status||'|'||(lead_id is not null) from jobsites where id='${j1}'`), "lead|true");
  assert.equal(sql(`select vehicles||'|'||seat_basis from leads where source='${code1}'`), "3|27");
  console.log("  lead attributed to its permit; 60 riders → 3 vehicles on 27 seats ✓");

  step("Proof loop: contract completes");
  sql("update accounts set status='active'"); sql("update accounts set status='completed'");
  assert.equal(sql("select string_agg(task_type, ',' order by task_type) from account_tasks where task_type in ('review_request','case_note')"), "case_note,review_request");

  step("Metrics");
  console.log(sql("select signal_type, jobsites, contacted, replied, leads from flywheel_funnel order by signal_type"));
  console.log(sql("select source, signal_type, leads from leads_by_source_week"));
  console.log("\nALL E2E CHECKS PASSED");
}
main().then(() => { srv.close(); process.exit(0); }).catch((e) => { console.error("\nE2E FAILED:", e.message); srv.close(); process.exit(1); });
