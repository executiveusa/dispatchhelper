import { timingSafeEqual } from "node:crypto";

export async function postWebhook(url: string | undefined, payload: unknown) {
  if (!url) return { skipped: true as const };
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`webhook failed: ${response.status} ${body.slice(0, 300)}`);
  return { status: response.status, body: body.slice(0, 1000) };
}

export function safeEqual(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false;
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
