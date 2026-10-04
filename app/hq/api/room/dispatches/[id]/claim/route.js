import { browserWriteAllowed, json, readJson, requireSeatConnection } from "@/lib/hq/room-http";
import { claimDispatch } from "@/lib/hq/swarm-router";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request, { params }) {
  const { id } = await params;
  if (!browserWriteAllowed(request)) return json({ ok: false, error: "Cross-site posts are blocked." }, 403);
  const auth = await requireSeatConnection(request);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);
  const payload = await readJson(request);
  if (!payload.ok) return json({ ok: false, error: payload.error }, payload.status);
  try {
    const result = await claimDispatch(id, auth.seat);
    if (result.error) return json({ ok: false, error: result.error.error }, result.error.status);
    return json({ ok: true, dispatch: result.dispatch });
  } catch {
    console.error("room dispatch claim failed");
    return json({ ok: false, error: "The dispatch could not be updated." }, 503);
  }
}
