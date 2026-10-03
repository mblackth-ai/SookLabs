import { json, readJson, requireSeatPost } from "@/lib/hq/room-http";
import { controlLoop } from "@/lib/hq/loop-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Kill switch: pause-all | resume-all. Mark only.
export async function POST(request) {
  const payload = await readJson(request);
  if (!payload.ok) return json({ ok: false, error: payload.error }, payload.status);
  const auth = await requireSeatPost(request, payload.body);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);
  if (auth.seat !== "mark") return json({ ok: false, error: "Only Mark can pause or resume the loop." }, 403);
  try {
    const result = await controlLoop(String(payload.body?.action || ""), "mark", String(payload.body?.idempotencyKey || "") || null);
    if (result.error) return json({ ok: false, error: result.error.error }, result.error.status);
    return json({ ok: true, ...result });
  } catch {
    return json({ ok: false, error: "The loop control could not be saved." }, 503);
  }
}
