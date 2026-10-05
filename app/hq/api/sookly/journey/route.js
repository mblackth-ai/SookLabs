import { isHqSessionValid } from "@/lib/hq/session";
import { json } from "@/lib/hq/room-http";
import { getSooklyJourneySnapshot } from "@/lib/hq/sookly-journey-report";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  if (!(await isHqSessionValid())) {
    return json({ ok: false, error: "HQ login required." }, 401);
  }
  try {
    const snapshot = await getSooklyJourneySnapshot();
    return json({ ok: true, ...snapshot });
  } catch {
    console.error("sookly journey snapshot failed");
    return json({ ok: false, error: "Sookly journey snapshot could not be built." }, 503);
  }
}
