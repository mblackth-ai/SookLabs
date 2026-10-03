import { timingSafeEqual, createHash } from "crypto";
import { json } from "@/lib/hq/room-http";
import { runTick } from "@/lib/hq/loop-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

// Scheduled wake. Callers: the GitHub Actions schedule (.github/workflows/hq-loop-wake.yml)
// with HQ_LOOP_WORKER_SECRET, or Vercel Cron with CRON_SECRET. Each call runs
// one bounded tick; durability comes from the database leases, not this request.

const digest = (value) => createHash("sha256").update(String(value)).digest();

function authorized(request) {
  const header = request.headers.get("authorization") || "";
  const presented = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  if (!presented) return false;
  return [process.env.HQ_LOOP_WORKER_SECRET, process.env.CRON_SECRET]
    .map((value) => (value || "").trim())
    .filter((value) => value.length >= 32)
    .some((secret) => timingSafeEqual(digest(secret), digest(presented)));
}

async function handle(request, trigger) {
  if (!authorized(request)) return json({ ok: false, error: "Send the worker secret." }, 401);
  try {
    return json({ ok: true, ...(await runTick(trigger)) });
  } catch {
    console.error("loop tick failed");
    return json({ ok: false, error: "The tick failed; leases will expire and the next wake recovers." }, 503);
  }
}

export const GET = (request) => handle(request, "cron");
export const POST = (request) => handle(request, request.headers.get("x-hq-wake") || "scheduled");
