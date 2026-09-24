import { createClient } from "@supabase/supabase-js";

const DAY = 24 * 60 * 60 * 1000;

function isoDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

export async function runAccountGuardrails(now = new Date()) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");

  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: accounts, error } = await db
    .from("accounts")
    .select("*")
    .eq("status", "active");

  if (error) throw error;

  let created = 0;
  for (const account of accounts || []) {
    if (account.renewal_date) {
      const due = new Date(new Date(account.renewal_date).getTime() - 50 * DAY);
      if (due >= new Date(now.getTime() - DAY)) {
        const { data: existing } = await db
          .from("account_tasks")
          .select("id")
          .eq("account_id", account.id)
          .eq("task_type", "renewal_notice_review")
          .gte("due_at", `${isoDate(due)}T00:00:00.000Z`)
          .lt("due_at", `${isoDate(new Date(due.getTime() + DAY))}T00:00:00.000Z`)
          .maybeSingle();

        if (!existing) {
          const { error: insertError } = await db.from("account_tasks").insert({
            account_id: account.id,
            task_type: "renewal_notice_review",
            due_at: due.toISOString(),
            payload: {
              renewalDate: account.renewal_date,
              increaseNoticeDays: account.increase_notice_days,
              note: "Review 5% increase notice. Human approval required before sending.",
            },
          });
          if (!insertError) created++;
        }
      }
    }

    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 15));
    const { data: checkin } = await db
      .from("account_tasks")
      .select("id")
      .eq("account_id", account.id)
      .eq("task_type", "monthly_check_in")
      .gte("due_at", new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString())
      .lt("due_at", new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)).toISOString())
      .maybeSingle();

    if (!checkin) {
      const { error: insertError } = await db.from("account_tasks").insert({
        account_id: account.id,
        task_type: "monthly_check_in",
        due_at: monthStart.toISOString(),
        payload: {
          terminationNoticeDays: account.termination_notice_days,
          note: "Monthly account check-in. Human sends any customer communication.",
        },
      });
      if (!insertError) created++;
    }
  }

  return { activeAccounts: accounts?.length ?? 0, tasksCreated: created };
}

if (process.argv[1]?.endsWith("account-guardrails.ts")) {
  runAccountGuardrails().then(console.log).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
