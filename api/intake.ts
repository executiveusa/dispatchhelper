import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const REQUIRED = ["name", "company", "phone", "email", "site", "riders"] as const;
const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 5;

function clean(value: unknown, max = 2000) {
  return String(value ?? "").trim().slice(0, max);
}

function integer(value: unknown, min = 0, max = 10000) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) return null;
  return parsed;
}

function getIp(req: any) {
  const forwarded = clean(req.headers?.["x-forwarded-for"], 256);
  return (forwarded.split(",")[0] || clean(req.socket?.remoteAddress, 128) || "unknown").trim();
}

async function postWebhook(url: string | undefined, payload: unknown) {
  if (!url) return { skipped: true };
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`notification webhook failed: ${response.status} ${body.slice(0, 300)}`);
  return { status: response.status, body: body.slice(0, 1000) };
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  const url = process.env.SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const salt = process.env.INTAKE_RATE_LIMIT_SALT;
  if (!url || !serviceRole || !salt) {
    return res.status(503).json({ ok: false, error: "service_not_configured" });
  }

  const body = req.body ?? {};
  if (clean(body.website, 200)) {
    return res.status(200).json({ ok: true });
  }

  const missing = REQUIRED.filter((key) => !clean(body[key], key === "site" ? 500 : 320));
  const riders = integer(body.riders, 1, 10000);
  const days = body.days === undefined ? null : integer(body.days, 1, 7);
  const roundTrips = body.roundTrips === undefined ? null : integer(body.roundTrips, 1, 20);
  const vehicles = body.vehicles === undefined ? null : integer(body.vehicles, 1, 500);
  const email = clean(body.email, 320);

  if (missing.length || !riders || !/^\S+@\S+\.\S+$/.test(email) ||
      (body.days !== undefined && !days) ||
      (body.roundTrips !== undefined && !roundTrips) ||
      (body.vehicles !== undefined && !vehicles)) {
    return res.status(400).json({ ok: false, error: "invalid_request", fields: missing });
  }

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const ipHash = createHash("sha256").update(`${salt}:${getIp(req)}`).digest("hex");
  const windowStarted = new Date(Math.floor(Date.now() / WINDOW_MS) * WINDOW_MS).toISOString();

  const { data: allowed, error: rateError } = await supabase.rpc("consume_intake_rate_limit", {
    p_ip_hash: ipHash,
    p_window_started_at: windowStarted,
    p_max_requests: MAX_REQUESTS,
  });

  if (rateError) {
    return res.status(503).json({ ok: false, error: "rate_limit_store_failed" });
  }
  if (!allowed) {
    return res.status(429).json({ ok: false, error: "rate_limited" });
  }

  const record = {
    name: clean(body.name, 160),
    company: clean(body.company, 200),
    role: clean(body.role, 120) || null,
    phone: clean(body.phone, 80),
    email,
    site: clean(body.site, 500),
    riders,
    target_start: clean(body.start, 32) || null,
    staging_lot: clean(body.lot, 500) || null,
    notes: clean(body.notes, 4000) || null,
    days,
    round_trips: roundTrips,
    vehicles,
    lang: clean(body.lang, 10) || "en",
    source: clean(body.source, 120) || "crew-shuttle-landing",
    page: clean(body.page, 1000) || null,
    status: "new",
  };

  const { data: lead, error } = await supabase
    .from("leads")
    .insert(record)
    .select("id")
    .single();

  if (error || !lead) {
    return res.status(503).json({ ok: false, error: "store_failed" });
  }

  const summary = [
    `${record.name} · ${record.role || "—"} · ${record.company}`,
    `${record.phone} · ${record.email}`,
    `Jobsite: ${record.site}`,
    `Riders per shift: ${record.riders}${record.vehicles ? ` → ${record.vehicles} vehicles` : ""}`,
    record.days && record.round_trips ? `${record.days} days/week · ${record.round_trips} round trips/day` : "",
    record.target_start ? `Start: ${record.target_start}` : "",
    record.staging_lot ? `Staging lot: ${record.staging_lot}` : "",
    record.notes || "",
  ].filter(Boolean).join("\n");

  const notificationPayload = { leadId: lead.id, summary, lead: record };
  const notifications = [
    { channel: "email", url: process.env.DISPATCH_EMAIL_WEBHOOK_URL, destination: process.env.DISPATCH_EMAIL_TO },
    { channel: "sms", url: process.env.DISPATCH_SMS_WEBHOOK_URL, destination: process.env.DISPATCH_SMS_TO },
  ] as const;

  for (const n of notifications) {
    const { data: row } = await supabase
      .from("outbound_notifications")
      .insert({ lead_id: lead.id, channel: n.channel, destination: n.destination || null, payload: notificationPayload })
      .select("id")
      .single();

    try {
      const provider = await postWebhook(n.url, { ...notificationPayload, to: n.destination });
      if (row?.id && !("skipped" in provider)) {
        await supabase.from("outbound_notifications").update({
          status: "sent",
          provider_response: provider,
          sent_at: new Date().toISOString(),
        }).eq("id", row.id);
      }
    } catch (notificationError) {
      if (row?.id) {
        await supabase.from("outbound_notifications").update({
          status: "failed",
          provider_response: { error: String(notificationError) },
        }).eq("id", row.id);
      }
    }
  }

  return res.status(200).json({ ok: true, leadId: lead.id });
}
