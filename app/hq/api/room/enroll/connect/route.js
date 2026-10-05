import { setPullSeat } from "@/lib/hq/seat-enroll";
import { enrollUnavailable } from "@/lib/hq/seat-enroll-http";
import { json, readJson, requireSeatPost } from "@/lib/hq/room-http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Mark only: connect (or disconnect) an agent seat as `pull` from the room, so it
 * receives dispatches once it has an approved key. No secret is involved; paid
 * API adapters (openai, xai, anthropic) stay in Vercel with their provider keys.
 */
export async function POST(request) {
  const payload = await readJson(request);
  if (!payload.ok) return json({ ok: false, error: payload.error }, payload.status);
  const auth = await requireSeatPost(request, payload.body);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);
  if (auth.seat !== "mark") return json({ ok: false, error: "Only Mark can connect seats." }, 403);
  const down = await enrollUnavailable();
  if (down) return json({ ok: false, error: "Switch on seat key requests first (Acceptance & Sources → Seat key requests)." }, down.status);
  const result = await setPullSeat(payload.body?.target, payload.body?.connected !== false, auth.seat);
  if (result.error) return json({ ok: false, error: result.error.error }, result.error.status);
  return json({ ok: true, pull: result.pull });
}
