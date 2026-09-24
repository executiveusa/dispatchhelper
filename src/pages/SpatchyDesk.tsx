import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TABS = ["Leads", "Dates", "Partners", "Rebook", "Reputation", "Signals", "Facts", "Jobsites", "Accounts"] as const;
type Tab = typeof TABS[number];

type Row = Record<string, any>;

function Empty({ label }: { label: string }) {
  return <div className="rounded-lg border border-dashed p-8 text-sm text-muted-foreground">No {label.toLowerCase()} records yet.</div>;
}

function fmt(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

export default function SpatchyDesk() {
  const [tab, setTab] = useState<Tab>("Leads");
  const [leads, setLeads] = useState<Row[]>([]);
  const [jobsites, setJobsites] = useState<Row[]>([]);
  const [accounts, setAccounts] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    const db = supabase as any;
    const [l, j, a] = await Promise.all([
      db.from("leads").select("*").order("created_at", { ascending: false }).limit(200),
      db.from("jobsites").select("*").order("created_at", { ascending: false }).limit(200),
      db.from("accounts").select("*").order("created_at", { ascending: false }).limit(200),
    ]);
    const firstError = l.error || j.error || a.error;
    if (firstError) setError(firstError.message || "Could not load desk data.");
    setLeads(l.data || []);
    setJobsites(j.data || []);
    setAccounts(a.data || []);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  const counts = useMemo(() => ({
    leads: leads.length,
    review: jobsites.filter((x) => x.review_required).length,
    active: accounts.filter((x) => x.status === "active").length,
  }), [leads, jobsites, accounts]);

  async function approveLead(id: string) {
    const db = supabase as any;
    const { error } = await db.from("leads").update({
      approved_at: new Date().toISOString(),
      status: "approved",
    }).eq("id", id);
    if (error) setError(error.message);
    else await load();
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center gap-4 px-4 py-3 md:px-6">
          <img src="/spatchy-icon.svg" alt="" className="h-9 w-9" />
          <div>
            <div className="font-semibold tracking-tight">Spatchy Lead Desk</div>
            <div className="text-xs text-muted-foreground">Molly's Trolleys · Palm Beach crew shuttle</div>
          </div>
          <div className="ml-auto flex items-center gap-2 text-xs">
            <Badge variant="outline">{counts.leads} leads</Badge>
            <Badge variant="outline">{counts.review} review</Badge>
            <Badge variant="outline">{counts.active} active accounts</Badge>
            <Button size="sm" variant="outline" onClick={() => void load()}>Refresh</Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] grid-cols-1 md:grid-cols-[210px_minmax(0,1fr)]">
        <aside className="border-b p-3 md:min-h-[calc(100vh-65px)] md:border-b-0 md:border-r">
          <nav className="flex gap-2 overflow-x-auto md:flex-col">
            {TABS.map((name) => (
              <button
                key={name}
                className={`whitespace-nowrap rounded-md px-3 py-2 text-left text-sm transition ${tab === name ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                onClick={() => setTab(name)}
              >
                {name}
              </button>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 p-4 md:p-6">
          <div className="mb-5">
            <h1 className="text-2xl font-bold tracking-tight">{tab}</h1>
            {tab === "Leads" && <p className="mt-1 text-sm text-muted-foreground">Inbound requests and drafted outreach. Drafts require human approval before sending.</p>}
            {tab === "Dates" && <p className="mt-1 text-sm text-muted-foreground">Capacity view for the 11-trolley operating calendar.</p>}
            {tab === "Jobsites" && <p className="mt-1 text-sm text-muted-foreground">Permit/NOC discoveries and review status.</p>}
            {tab === "Accounts" && <p className="mt-1 text-sm text-muted-foreground">Signed shuttle accounts, renewals, and notice windows.</p>}
          </div>

          {error && <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
          {loading ? <div className="text-sm text-muted-foreground">Loading…</div> : null}

          {!loading && tab === "Leads" && (
            leads.length ? <div className="space-y-3">{leads.map((lead) => (
              <article key={lead.id} className="rounded-lg border bg-card p-4 shadow-sm">
                <div className="flex flex-wrap items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold">{fmt(lead.company)}</div>
                    <div className="text-sm text-muted-foreground">{fmt(lead.name)} · {fmt(lead.role)}</div>
                    <div className="mt-2 text-sm">{fmt(lead.site)}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{fmt(lead.phone)} · {fmt(lead.email)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {lead.score !== null && lead.score !== undefined && <Badge variant="outline">score {fmt(lead.score)}</Badge>}
                    <Badge>{fmt(lead.status)}</Badge>
                  </div>
                </div>
                {(lead.drafted_reply_en || lead.drafted_reply_es) && (
                  <div className="mt-4 grid gap-3 lg:grid-cols-2">
                    {lead.drafted_reply_en && <pre className="whitespace-pre-wrap rounded-md bg-muted p-3 text-xs">{lead.drafted_reply_en}</pre>}
                    {lead.drafted_reply_es && <pre className="whitespace-pre-wrap rounded-md bg-muted p-3 text-xs">{lead.drafted_reply_es}</pre>}
                  </div>
                )}
                {lead.drafted_reply_en && !lead.approved_at && (
                  <div className="mt-3"><Button size="sm" onClick={() => void approveLead(lead.id)}>Approve draft</Button></div>
                )}
              </article>
            ))}</div> : <Empty label="Leads" />
          )}

          {!loading && tab === "Jobsites" && (
            jobsites.length ? <div className="overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[900px] text-sm">
                <thead className="bg-muted/60 text-left"><tr>
                  <th className="p-3">Address</th><th className="p-3">Jurisdiction</th><th className="p-3">GC</th><th className="p-3">Permit/NOC</th><th className="p-3">Phase</th><th className="p-3">Strike/CMA</th><th className="p-3">Review</th>
                </tr></thead>
                <tbody>{jobsites.map((j) => <tr key={j.id} className="border-t">
                  <td className="p-3 font-medium">{fmt(j.address)}</td><td className="p-3">{fmt(j.jurisdiction)}</td><td className="p-3">{fmt(j.general_contractor)}</td><td className="p-3">{fmt(j.permit_noc_number)}</td><td className="p-3">{fmt(j.phase)}</td><td className="p-3">{j.strike_cma_flag ? "Yes" : "No"}</td><td className="p-3">{j.review_required ? "Required" : "No"}</td>
                </tr>)}</tbody>
              </table>
            </div> : <Empty label="Jobsites" />
          )}

          {!loading && tab === "Accounts" && (
            accounts.length ? <div className="overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[800px] text-sm">
                <thead className="bg-muted/60 text-left"><tr>
                  <th className="p-3">Company</th><th className="p-3">Daily rate</th><th className="p-3">Round trips</th><th className="p-3">Start</th><th className="p-3">Renewal</th><th className="p-3">Status</th>
                </tr></thead>
                <tbody>{accounts.map((a) => <tr key={a.id} className="border-t">
                  <td className="p-3 font-medium">{fmt(a.company)}</td><td className="p-3">{a.daily_rate === null ? "—" : `$${Number(a.daily_rate).toFixed(2)}`}</td><td className="p-3">{fmt(a.round_trips)}</td><td className="p-3">{fmt(a.start_date)}</td><td className="p-3">{fmt(a.renewal_date)}</td><td className="p-3"><Badge variant="outline">{fmt(a.status)}</Badge></td>
                </tr>)}</tbody>
              </table>
            </div> : <Empty label="Accounts" />
          )}

          {!loading && tab === "Dates" && (
            <div className="rounded-lg border bg-card p-5">
              <div className="text-4xl font-bold">11</div>
              <div className="mt-1 text-sm text-muted-foreground">trolley capacity from the supplied Spatchy handoff. Booking/calendar records have not yet been supplied.</div>
            </div>
          )}

          {!loading && ["Partners", "Rebook", "Reputation", "Signals", "Facts"].includes(tab) && <Empty label={tab} />}
        </main>
      </div>
    </div>
  );
}
