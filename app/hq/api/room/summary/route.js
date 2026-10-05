import { getControlPlaneSnapshot } from "@/lib/hq/control-plane";
import { json, requireLiveRead } from "@/lib/hq/room-http";
import { summarizeSnapshot } from "@/lib/hq/room-summary";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Command-center header: the same snapshot HQ renders, trimmed to what the
// room shows. Seats and the HQ login only; spectators never see it.
export async function GET(request) {
  const auth = await requireLiveRead(request);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);
  try {
    const snapshot = await getControlPlaneSnapshot();
    return json({ ok: true, ...summarizeSnapshot(snapshot) });
  } catch {
    console.error("room summary failed");
    return json({ ok: false, error: "The HQ summary could not be loaded." }, 503);
  }
}
