import { json, requireLiveRead } from "@/lib/hq/room-http";
import { listRoomMessages } from "@/lib/hq/swarm";
import { SSE_HEARTBEAT_MS, normalizeChannel } from "@/lib/hq/swarm-contract";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  const auth = await requireLiveRead(request);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);
  const channel = normalizeChannel(request.nextUrl.searchParams.get("channel"));
  if (!channel) return json({ ok: false, error: "Channel is invalid." }, 400);
  let cursor = request.nextUrl.searchParams.get("after") || "";
  const encoder = new TextEncoder();
  const timers = { heart: null, poll: null };
  const stream = new ReadableStream({
    async start(controller) {
      const send = (chunk) => controller.enqueue(encoder.encode(chunk));
      const replay = async () => {
        const messages = await listRoomMessages({ channel, after: cursor, limit: 200 });
        for (const message of messages) {
          send(`event: message\ndata: ${JSON.stringify(message)}\n\n`);
          cursor = message.createdAt;
        }
      };
      try {
        await replay();
      } catch {
        send(`event: error\ndata: ${JSON.stringify({ error: "The room could not be loaded." })}\n\n`);
      }
      timers.heart = setInterval(() => send(`: heartbeat\n\n`), SSE_HEARTBEAT_MS);
      timers.poll = setInterval(async () => {
        try {
          await replay();
        } catch {
          send(`: heartbeat\n\n`);
        }
      }, 2000);
    },
    cancel() {
      clearInterval(timers.heart);
      clearInterval(timers.poll);
    },
  });
  request.signal.addEventListener("abort", () => {
    clearInterval(timers.heart);
    clearInterval(timers.poll);
  });
  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
    },
  });
}
