import { getControlPlaneSnapshot } from "@/lib/hq/control-plane";
import { json, requireLiveRead } from "@/lib/hq/room-http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Command-center header: the same snapshot HQ renders, trimmed to what the
// room shows. Seats and the HQ login only; spectators never see it.
export async function GET(request) {
  const auth = await requireLiveRead(request);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);
  try {
    const snapshot = await getControlPlaneSnapshot();
    return json({
      ok: true,
      generatedAt: snapshot.generatedAt,
      finishLine: {
        percent: snapshot.overallProgress,
        basis: "Four-front estimate: the average of the progress set for each front in HQ.",
        fronts: (snapshot.fronts || []).map((front) => ({ id: front.id, name: front.name, progress: front.progress })),
      },
      approvals: (snapshot.approvals || []).map((job) => ({
        id: job.id,
        type: job.type || "",
        summary: job.summary || "",
        provider: job.provider || "",
        status: job.status,
        startedAt: job.startedAt || "",
      })),
      blockers: (snapshot.blockers || []).map((item) => ({
        id: item.id,
        title: item.title,
        detail: item.detail || "",
        href: item.href || "",
      })),
    });
  } catch {
    console.error("room summary failed");
    return json({ ok: false, error: "The HQ summary could not be loaded." }, 503);
  }
}
