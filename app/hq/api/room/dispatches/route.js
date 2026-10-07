import { json, requireSeatConnection } from "@/lib/hq/room-http";
import { touchRoomSeat } from "@/lib/hq/swarm";
import { inboxFor } from "@/lib/hq/swarm-router";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Pull seats (Cursor, Codex, Claude Code, a CLI) poll here with their own
// connection. A poll keeps the seat present for 30 minutes. Do not post a
// rest heartbeat to stay visible.
export async function GET(request) {
  const auth = await requireSeatConnection(request);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);
  try {
    await touchRoomSeat(auth.seat, auth.tokenHash);
    return json({ ok: true, seat: auth.seat, dispatches: await inboxFor(auth.seat) });
  } catch {
    console.error("room inbox read failed");
    return json({ ok: false, error: "The inbox could not be loaded." }, 503);
  }
}
