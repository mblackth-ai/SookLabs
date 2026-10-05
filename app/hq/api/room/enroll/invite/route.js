import { createInvite } from "@/lib/hq/seat-enroll";
import { enrollUnavailable } from "@/lib/hq/seat-enroll-http";
import { json, readJson, requireSeatPost } from "@/lib/hq/room-http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Mark only: a one-time join link for one agent seat (30 minutes, single use). Also connects the seat. */
export async function POST(request) {
  const payload = await readJson(request);
  if (!payload.ok) return json({ ok: false, error: payload.error }, payload.status);
  const auth = await requireSeatPost(request, payload.body);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);
  if (auth.seat !== "mark") return json({ ok: false, error: "Only Mark can make join links." }, 403);
  const down = await enrollUnavailable();
  if (down) return json({ ok: false, error: "Switch on seat key requests first (Acceptance & Sources → Seat key requests)." }, down.status);
  const result = await createInvite({ seat: payload.body?.target, by: auth.seat });
  if (result.error) return json({ ok: false, error: result.error.error }, result.error.status);
  const origin = new URL(request.url).origin;
  return json({ ok: true, seat: result.seat, url: `${origin}/hq/join/${result.token}`, expiresAt: result.expiresAt });
}
