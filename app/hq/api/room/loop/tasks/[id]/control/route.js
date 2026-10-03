import { json, readJson, requireSeatPost } from "@/lib/hq/room-http";
import { controlTask } from "@/lib/hq/loop-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// pause | resume | retry | cancel | revoke | approve — Mark only, audited, idempotent per key.
export async function POST(request, { params }) {
  const { id } = await params;
  const payload = await readJson(request);
  if (!payload.ok) return json({ ok: false, error: payload.error }, payload.status);
  const auth = await requireSeatPost(request, payload.body);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);
  if (auth.seat !== "mark") return json({ ok: false, error: "Only Mark can control tasks." }, 403);
  try {
    const result = await controlTask(id, String(payload.body?.action || ""), "mark", String(payload.body?.idempotencyKey || "") || null);
    if (result.error) return json({ ok: false, error: result.error.error }, result.error.status);
    return json({ ok: true, task: result.task, duplicate: result.duplicate });
  } catch {
    console.error("loop control failed");
    return json({ ok: false, error: "The control action could not be saved." }, 503);
  }
}
