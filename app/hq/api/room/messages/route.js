import { after } from "next/server";
import { requireLiveRead, requireSeatPost, parseRoomPost, readJson, json } from "@/lib/hq/room-http";
import { getRoomStorageMode, listDispatches, listRoomMessages, listRoomSeats, postRoomRecord } from "@/lib/hq/swarm";
import { clampRoomLimit, normalizeChannel, roomBoardRows } from "@/lib/hq/swarm-contract";
import { processQueued, routeMessage, seatStrip } from "@/lib/hq/swarm-router";
import { seatEnv } from "@/lib/hq/seat-auth";
import { wakeFromDispatch } from "@/lib/hq/loop-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
// Model-backed seats answer inside after(); give them room to finish.
export const maxDuration = 60;

export async function GET(request) {
  const auth = await requireLiveRead(request);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);
  const channel = normalizeChannel(request.nextUrl.searchParams.get("channel"));
  if (!channel) return json({ ok: false, error: "Channel is invalid." }, 400);
  const limit = clampRoomLimit(request.nextUrl.searchParams.get("limit"));
  const since = request.nextUrl.searchParams.get("after") || "";
  try {
    const messages = await listRoomMessages({ channel, after: since, limit });
    const seats = await listRoomSeats();
    const dispatches = messages.length ? await listDispatches({ sourceIds: messages.map((m) => m.id), limit: 2000 }) : [];
    if (dispatches.some((row) => row.status === "queued" || row.status === "dispatching")) {
      after(() => processQueued().catch(() => console.error("room dispatch retry failed")));
    }
    return json({
      ok: true,
      channel,
      storage: getRoomStorageMode(),
      messages,
      seats,
      strip: seatStrip(seats, await seatEnv()),
      dispatches,
      board: roomBoardRows(messages),
    });
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
  const dispatchId = String(payload.body?.dispatchId || "").trim() || null;
  let saved;
  try {
    saved = await postRoomRecord({
      seatId: auth.seat,
      tokenHash: auth.tokenHash,
      channel: parsed.channel,
      kind: parsed.kind,
      body: parsed.body,
      refs: parsed.refs,
      baton: parsed.baton,
      dispatchId,
    });
  } catch {
    console.error("room message write failed");
    return json({ ok: false, error: "The message could not be saved." }, 503);
  }
  if (saved.error) return json({ ok: false, error: saved.error.error }, saved.error.status);
  // A reply to a dispatch may be what an execution-loop task is waiting on.
  if (dispatchId && !saved.deduped) after(() => wakeFromDispatch(dispatchId));

  // The message is committed. Routing is separate: if it fails, the post still stands.
  let dispatches = [];
  let routeNote = "";
  if (!saved.deduped) {
    try {
      const routed = await routeMessage(saved.message);
      dispatches = routed.dispatches;
      routeNote = routed.note;
      const ids = dispatches.filter((row) => row.status === "queued").map((row) => row.id);
      if (ids.length) after(() => processQueued({ ids }).catch(() => console.error("room dispatch failed")));
    } catch {
      console.error("room routing failed");
      routeNote = "Posted. Routing to agents failed for this message.";
    }
  }
  return json({ ok: true, storage: saved.storage, deduped: saved.deduped, message: saved.message, dispatches, routeNote });
}
