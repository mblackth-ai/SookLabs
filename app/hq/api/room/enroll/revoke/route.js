import { ENROLLABLE_SEATS, revokeSeatKeys } from "@/lib/hq/seat-enroll";
import { enrollUnavailable } from "@/lib/hq/seat-enroll-http";
import { json, readJson, requireSeatPost } from "@/lib/hq/room-http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Mark only: revoke every self-enrolled key for a seat. Env-var keys are not affected. */
export async function POST(request) {
  const payload = await readJson(request);
  if (!payload.ok) return json({ ok: false, error: payload.error }, payload.status);
  const auth = await requireSeatPost(request, payload.body);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);
  if (auth.seat !== "mark") return json({ ok: false, error: "Only Mark can revoke keys." }, 403);
  const target = String(payload.body?.target || "");
  if (!ENROLLABLE_SEATS.includes(target)) return json({ ok: false, error: "Unknown agent seat." }, 400);
  const down = await enrollUnavailable();
  if (down) return json({ ok: false, error: down.error }, down.status);
  return json({ ok: true, ...(await revokeSeatKeys({ seat: target, by: auth.seat })) });
}
