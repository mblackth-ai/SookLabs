import { enrollmentForKey } from "@/lib/hq/seat-enroll";
import { enrollUnavailable } from "@/lib/hq/seat-enroll-http";
import { json, presentedConnection } from "@/lib/hq/room-http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** The requester polls its own request, authenticated by the (possibly still inactive) key. */
export async function GET(request, { params }) {
  const { id } = await params;
  const presented = presentedConnection(request);
  if (!presented.ok || !presented.token) return json({ ok: false, error: "Send the requested key as Authorization: Bearer <key>." }, 401);
  const down = await enrollUnavailable();
  if (down) return json({ ok: false, error: down.error }, down.status);
  const found = await enrollmentForKey(id, presented.token);
  if (!found) return json({ ok: false, error: "No such request for this key." }, 404);
  return json({ ok: true, request: { id: found.id, seat: found.seat, status: found.status, expiresAt: found.expiresAt, decidedBy: found.decidedBy } });
}
