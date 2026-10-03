import { decideEnrollment } from "@/lib/hq/seat-enroll";
import { enrollUnavailable } from "@/lib/hq/seat-enroll-http";
import { json, readJson, requireSeatPost } from "@/lib/hq/room-http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** An approver seat approves or denies, and must enter the requester's pairing code. */
export async function POST(request, { params }) {
  const { id } = await params;
  const payload = await readJson(request);
  if (!payload.ok) return json({ ok: false, error: payload.error }, payload.status);
  const auth = await requireSeatPost(request, payload.body);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);
  const action = String(payload.body?.action || "");
  if (!["approve", "deny"].includes(action)) return json({ ok: false, error: "Action must be approve or deny." }, 400);
  const down = await enrollUnavailable();
  if (down) return json({ ok: false, error: down.error }, down.status);
  const result = await decideEnrollment({ id, code: payload.body?.code, approve: action === "approve", approver: auth.seat });
  if (result.error) return json({ ok: false, error: result.error.error }, result.error.status);
  return json({ ok: true, request: result.enrollment });
}
