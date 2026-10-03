import { json, readJson, requireSeatPost } from "@/lib/hq/room-http";
import { broadcastRoomRecord, readClientNames } from "@/lib/hq/swarm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request, { params }) {
  const { id } = await params;
  const payload = await readJson(request);
  if (!payload.ok) return json({ ok: false, error: payload.error }, payload.status);
  const auth = await requireSeatPost(request, payload.body);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);
  if (auth.seat !== "mark") {
    return json({ ok: false, error: "Only Mark can queue a broadcast." }, 403);
  }
  try {
    const names = await readClientNames();
    const saved = await broadcastRoomRecord(id, names);
    if (!saved) return json({ ok: false, error: "Message not found." }, 404);
    return json({
      ok: true,
      storage: saved.storage,
      broadcast: saved.broadcast,
      social: false,
    });
  } catch {
    console.error("room broadcast failed");
    return json({ ok: false, error: "The broadcast could not be queued." }, 503);
  }
}
