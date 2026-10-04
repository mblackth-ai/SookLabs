import { currentApprovers, setDelegatedApprovers } from "@/lib/hq/seat-enroll";
import { enrollUnavailable } from "@/lib/hq/seat-enroll-http";
import { json, readJson, requireSeatPost } from "@/lib/hq/room-http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Mark only: choose which agent seats may approve key requests (Mark always can). */
export async function POST(request) {
  const payload = await readJson(request);
  if (!payload.ok) return json({ ok: false, error: payload.error }, payload.status);
  const auth = await requireSeatPost(request, payload.body);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);
  if (auth.seat !== "mark") return json({ ok: false, error: "Only Mark can change approvers." }, 403);
  const down = await enrollUnavailable();
  if (down) return json({ ok: false, error: down.error }, down.status);
  const delegated = await setDelegatedApprovers(Array.isArray(payload.body?.approvers) ? payload.body.approvers : [], auth.seat);
  return json({ ok: true, delegated, approvers: await currentApprovers() });
}
