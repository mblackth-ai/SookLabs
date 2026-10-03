import { requireLiveRead, requireSeatPost, parseRoomPost, readJson, json } from "@/lib/hq/room-http";
import { getRoomStorageMode, listRoomMessages, listRoomSeats, postRoomRecord } from "@/lib/hq/swarm";
import { clampRoomLimit, normalizeChannel, roomBoardRows } from "@/lib/hq/swarm-contract";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  const auth = await requireLiveRead(request);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);
  const channel = normalizeChannel(request.nextUrl.searchParams.get("channel"));
  if (!channel) return json({ ok: false, error: "Channel is invalid." }, 400);
  const limit = clampRoomLimit(request.nextUrl.searchParams.get("limit"));
  const after = request.nextUrl.searchParams.get("after") || "";
  try {
    const messages = await listRoomMessages({ channel, after, limit });
    const seats = await listRoomSeats();
    return json({ ok: true, channel, storage: getRoomStorageMode(), messages, seats, board: roomBoardRows(messages) });
  } catch {
    console.error("room messages read failed");
    return json({ ok: false, error: "The room could not be loaded." }, 503);
  }
}

export async function POST(request) {
  const payload = await readJson(request);
  if (!payload.ok) return json({ ok: false, error: payload.error }, payload.status);
  const auth = await requireSeatPost(request, payload.body);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);
  const parsed = parseRoomPost(payload.body, auth.seat);
  if (!parsed.ok) return json({ ok: false, error: parsed.error }, parsed.status);
  try {
    const saved = await postRoomRecord({
      seatId: auth.seat,
      tokenHash: auth.tokenHash,
      channel: parsed.channel,
      kind: parsed.kind,
      body: parsed.body,
      refs: parsed.refs,
      baton: parsed.baton,
    });
    return json({ ok: true, storage: saved.storage, deduped: saved.deduped, message: saved.message });
  } catch {
    console.error("room message write failed");
    return json({ ok: false, error: "The message could not be saved." }, 503);
  }
}
