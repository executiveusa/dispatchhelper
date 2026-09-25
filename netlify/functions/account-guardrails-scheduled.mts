import { createClient } from "@supabase/supabase-js";

const DAY = 24 * 60 * 60 * 1000;

export default async () => {
  const url = Netlify.env.get("SUPABASE_URL");
  const key = Netlify.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Supabase server configuration is required.");

  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const now = new Date();

  const { data: accounts, error } = await db.from("accounts").select("*").eq("status", "active");
  if (error) throw error;

  for (const account of accounts || []) {
    if (account.renewal_date) {
      const due = new Date(new Date(account.renewal_date).getTime() - 50 * DAY);
      const start = new Date(Date.UTC(due.getUTCFullYear(), due.getUTCMonth(), due.getUTCDate()));
      const end = new Date(start.getTime() + DAY);

      const { data: existing } = await db
        .from("account_tasks")
        .select("id")
        .eq("account_id", account.id)
        .eq("task_type", "renewal_notice_review")
        .gte("due_at", start.toISOString())
        .lt("due_at", end.toISOString())
        .maybeSingle();

      if (!existing) {
        await db.from("account_tasks").insert({
          account_id: account.id,
          task_type: "renewal_notice_review",
          due_at: due.toISOString(),
          payload: {
            renewalDate: account.renewal_date,
            increaseNoticeDays: account.increase_notice_days,
            note: "Review 5% increase notice. Human approval required before sending.",
          },
        });
      }
    }

    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 15));
    const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

    const { data: checkin } = await db
      .from("account_tasks")
      .select("id")
      .eq("account_id", account.id)
      .eq("task_type", "monthly_check_in")
      .gte("due_at", new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString())
      .lt("due_at", nextMonth.toISOString())
      .maybeSingle();

    if (!checkin) {
      await db.from("account_tasks").insert({
        account_id: account.id,
        task_type: "monthly_check_in",
        due_at: monthStart.toISOString(),
        payload: {
          terminationNoticeDays: account.termination_notice_days,
          note: "Monthly account check-in. Human sends any customer communication.",
        },
      });
    }
  }
};

export const config = {
  schedule: "47 10 * * *",
};
