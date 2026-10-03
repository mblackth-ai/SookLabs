import { json, requireLiveRead } from "@/lib/hq/room-http";
import { boardReadModel } from "@/lib/hq/loop-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Acceptance & Sources panel. Seats and the HQ login only; spectators get 401.
export async function GET(request) {
  const auth = await requireLiveRead(request);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);
  try {
    return json({ ok: true, ...(await boardReadModel()) });
  } catch {
    console.error("loop board read failed");
    return json({ ok: false, error: "Execution state could not be read." }, 503);
  }
}
