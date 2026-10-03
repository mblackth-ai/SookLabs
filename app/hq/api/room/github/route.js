import { githubConfig, sha256Hex, verifyWebhookSignature } from "@/lib/hq/github";
import { json } from "@/lib/hq/room-http";
import { ingestGithubEvent } from "@/lib/hq/swarm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const EVENTS = new Set(["ping", "pull_request", "check_suite", "status"]);

// GitHub webhook → PR field. Signature is checked over the raw bytes before
// anything is parsed; redeliveries are recorded once (X-GitHub-Delivery).
export async function POST(request) {
  const { webhookSecret } = githubConfig();
  if (!webhookSecret) return json({ ok: false, error: "Webhook intake is not configured." }, 503);
  const raw = Buffer.from(await request.arrayBuffer());
  if (!verifyWebhookSignature(raw, request.headers.get("x-hub-signature-256") || "", webhookSecret)) {
    return json({ ok: false, error: "Signature does not match." }, 401);
  }
  const eventType = request.headers.get("x-github-event") || "";
  const deliveryId = request.headers.get("x-github-delivery") || "";
  if (!deliveryId) return json({ ok: false, error: "Missing delivery id." }, 400);
  if (!EVENTS.has(eventType)) return json({ ok: true, ignored: eventType });
  if (eventType === "ping") return json({ ok: true, pong: true });
  let payload;
  try {
    payload = JSON.parse(raw.toString("utf8"));
  } catch {
    return json({ ok: false, error: "Invalid JSON." }, 400);
  }
  try {
    const result = await ingestGithubEvent({ deliveryId, eventType, payload, payloadSha256: sha256Hex(raw) });
    return json({ ok: true, duplicate: result.duplicate, error: result.error || undefined });
  } catch {
    console.error("room github ingest failed");
    return json({ ok: false, error: "The event could not be stored." }, 503);
  }
}
