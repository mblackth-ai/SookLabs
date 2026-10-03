import { json, readJson, requireSeatPost } from "@/lib/hq/room-http";
import { promoteRoomRecord } from "@/lib/hq/swarm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request, { params }) {
  const { id } = await params;
  const payload = await readJson(request);
  if (!payload.ok) return json({ ok: false, error: payload.error }, payload.status);
  const auth = await requireSeatPost(request, payload.body);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);
  if (auth.seat !== "mark") {
    return json({ ok: false, error: "Only Mark can promote a baton or a decision." }, 403);
  }
  try {
    const saved = await promoteRoomRecord(id);
    if (!saved) return json({ ok: false, error: "Message not found." }, 404);
    return json({
      ok: true,
      wrote: saved.wrote,
      promotedSha: saved.promotedSha,
      forSeat: saved.forSeat,
      paste: saved.paste,
      commitUrl: saved.commitUrl || "",
      branch: saved.branch || "",
      writeError: saved.writeError || "",
      message: saved.message,
    });
  } catch (err) {
    const status = err?.status === 400 ? 400 : 503;
    if (status === 503) console.error("room promote failed");
    return json({ ok: false, error: status === 400 ? err.message : "The promote could not be prepared." }, status);
  }
}
