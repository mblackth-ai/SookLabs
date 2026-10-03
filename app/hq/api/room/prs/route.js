import { json, requireLiveRead } from "@/lib/hq/room-http";
import { listRoomPrs } from "@/lib/hq/swarm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// PR field: open PRs on the linked repos with CI state and freshness.
export async function GET(request) {
  const auth = await requireLiveRead(request);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);
  try {
    return json({ ok: true, ...(await listRoomPrs()) });
  } catch {
    console.error("room prs read failed");
    return json({ ok: false, error: "The PR field could not be loaded." }, 503);
  }
}
