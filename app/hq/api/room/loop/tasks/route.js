import { json, readJson, requireSeatPost } from "@/lib/hq/room-http";
import { createRoomTask, proposeTask } from "@/lib/hq/loop-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Mark creates an authorised task; an agent seat can only propose one.
export async function POST(request) {
  const payload = await readJson(request);
  if (!payload.ok) return json({ ok: false, error: payload.error }, payload.status);
  const auth = await requireSeatPost(request, payload.body);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);
  if (auth.tier === "crew") return json({ ok: false, error: "Crew cannot create tasks." }, 403);
  try {
    const result = auth.seat === "mark" ? await createRoomTask(payload.body, "mark") : await proposeTask(payload.body, auth.seat);
    if (result.error) return json({ ok: false, error: result.error.error }, result.error.status);
    return json({ ok: true, task: result.task, proposed: auth.seat !== "mark" });
  } catch {
    console.error("loop task create failed");
    return json({ ok: false, error: "The task could not be saved. Is the loop installed?" }, 503);
  }
}
