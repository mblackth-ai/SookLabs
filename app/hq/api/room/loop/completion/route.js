import { json, requireLiveRead } from "@/lib/hq/room-http";
import { completionReadModel } from "@/lib/hq/loop-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Finish line: how many tasks are production-accepted, what waits on Mark,
// what is stalled, and the last heartbeat. Seats and the HQ login only.
export async function GET(request) {
  const auth = await requireLiveRead(request);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);
  try {
    return json({ ok: true, ...(await completionReadModel()) });
  } catch {
    console.error("loop completion read failed");
    return json({ ok: false, error: "Completion state could not be read." }, 503);
  }
}
