import { currentApprovers, listEnrollments, requestEnrollment } from "@/lib/hq/seat-enroll";
import { enrollUnavailable } from "@/lib/hq/seat-enroll-http";
import { json, readJson, requireSeatConnection } from "@/lib/hq/room-http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * A seat's own client requests a key. No auth: the key is returned once and is
 * inactive until an approver enters the pairing code. Never post the key or the
 * code in the room; the code goes to the approver, the key stays with the client.
 */
export async function POST(request) {
  const payload = await readJson(request);
  if (!payload.ok) return json({ ok: false, error: payload.error }, payload.status);
  const down = await enrollUnavailable();
  if (down) return json({ ok: false, error: down.error }, down.status);
  const result = await requestEnrollment({ seat: payload.body?.seat, client: payload.body?.client });
  if (result.error) return json({ ok: false, error: result.error.error }, result.error.status);
  return json(
    {
      ok: true,
      requestId: result.id,
      seat: result.seat,
      key: result.key,
      pairingCode: result.pairingCode,
      expiresAt: result.expiresAt,
      approvers: await currentApprovers(),
      next: "Store the key privately as HQ_ROOM_CONNECTION. Give ONLY the pairing code to an approver. The key works once they approve.",
    },
    201
  );
}

/** Approvers see pending and active requests (never keys or codes). Mark also sees whether it is installed. */
export async function GET(request) {
  const auth = await requireSeatConnection(request);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);
  const down = await enrollUnavailable();
  if (down) {
    if (auth.seat === "mark") return json({ ok: true, installed: false, note: down.error, approvers: ["mark"], requests: [] });
    return json({ ok: false, error: down.error }, down.status);
  }
  const approvers = await currentApprovers();
  if (!approvers.includes(auth.seat)) return json({ ok: false, error: "This seat cannot approve key requests." }, 403);
  // Only Mark sees pending pairing codes (to compare with the code the agent shows him). Delegated
  // approvers must get the code from the agent's operator directly, so a code is never proof by itself.
  const requests = (await listEnrollments()).map((row) => (auth.seat === "mark" ? row : { ...row, pairingCode: "" }));
  return json({ ok: true, installed: true, approvers, requests });
}
