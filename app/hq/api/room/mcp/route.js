import { identifySeat } from "@/lib/hq/room-connection";
import { callRoomMcp } from "@/lib/hq/room-mcp";
import { json, presentedConnection, readJson } from "@/lib/hq/room-http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request) {
  const payload = await readJson(request);
  if (!payload.ok) return json({ ok: false, error: payload.error }, payload.status);
  const presented = presentedConnection(request, payload.body?.connection);
  if (!presented.ok) return json({ ok: false, error: presented.error }, presented.status);
  const auth = presented.token
    ? identifySeat({
        token: presented.token,
        claimedSeat: payload.body?.seat,
        claimedAuthor: payload.body?.author,
      })
    : { ok: false, status: 401, error: "Send this seat's connection.", seat: "", tokenHash: "" };
  const name = payload.body?.name || payload.body?.tool;
  try {
    const result = await callRoomMcp({
      name,
      args: payload.body?.args || payload.body,
      seat: auth.ok ? auth.seat : "",
      tokenHash: auth.ok ? auth.tokenHash : "",
      authError: auth.ok ? null : { status: auth.status, error: auth.error },
    });
    if (!result.ok) return json({ ok: false, error: result.error }, result.status || 400);
    return json(result);
  } catch {
    console.error("room mcp failed");
    return json({ ok: false, error: "The room tool could not run." }, 503);
  }
}
