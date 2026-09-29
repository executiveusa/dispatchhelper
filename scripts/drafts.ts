// Review and approve outreach drafts from the terminal until the desk is ported.
//
//   npx tsx scripts/drafts.ts list                 # pending drafts, best jobsites first
//   npx tsx scripts/drafts.ts show <draft-id>      # full text
//   npx tsx scripts/drafts.ts approve <id> [<id>…] # approve; the sender picks them up on its next run
//   npx tsx scripts/drafts.ts reject <id> [<id>…]
//
// Needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment.
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  process.exit(2);
}
const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const [cmd, ...ids] = process.argv.slice(2);

async function main() {
  if (cmd === "list") {
    const { data, error } = await db
      .from("outreach_drafts")
      .select("id, language, sequence_step, to_email, subject, send_after, jobsites(score, signal_type, general_contractor)")
      .eq("status", "draft")
      .limit(200);
    if (error) throw error;
    const rows = (data || []).sort((a: any, b: any) => (b.jobsites?.score ?? 0) - (a.jobsites?.score ?? 0));
    for (const r of rows as any[]) {
      console.log(
        [r.id, `score ${r.jobsites?.score ?? "?"}`, r.jobsites?.signal_type ?? "-", `step ${r.sequence_step}`, r.language, r.to_email || "NO EMAIL", r.jobsites?.general_contractor || "-", r.subject, r.send_after ? `after ${r.send_after.slice(0, 10)}` : ""].join("  |  "),
      );
    }
    console.log(`${rows.length} pending`);
  } else if (cmd === "show" && ids[0]) {
    const { data, error } = await db.from("outreach_drafts").select("*").eq("id", ids[0]).single();
    if (error) throw error;
    console.log(`To: ${data.to_email || "(none on record)"}\nSubject: ${data.subject}\n\n${data.body}`);
  } else if ((cmd === "approve" || cmd === "reject") && ids.length) {
    const patch = cmd === "approve" ? { status: "approved", approved_at: new Date().toISOString() } : { status: "superseded" };
    const { data, error } = await db.from("outreach_drafts").update(patch).in("id", ids).eq("status", "draft").select("id");
    if (error) throw error;
    console.log(`${cmd}d ${data?.length ?? 0} of ${ids.length}`);
  } else {
    console.error("Usage: list | show <id> | approve <id>… | reject <id>…");
    process.exit(2);
  }
}
main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
