/** Parse one SSE block (lines between blank lines). Returns parsed JSON from `data:` or null. */
export function parseSseDataBlock(block) {
  const line = String(block || "")
    .split("\n")
    .find((row) => row.startsWith("data: "));
  if (!line) return null;
  try {
    return JSON.parse(line.slice(6));
  } catch {
    return null;
  }
}

/**
 * Read HQ room SSE with auth headers (EventSource cannot send x-hq-room-connection).
 * Calls onMessage for each message event; onError on HTTP or stream errors.
 */
export async function readRoomStream({ url, headers = {}, signal, onMessage, onError }) {
  let res;
  try {
    res = await fetch(url, {
      headers: { accept: "text/event-stream", ...headers },
      signal,
      cache: "no-store",
    });
  } catch (error) {
    if (error?.name !== "AbortError") onError?.(error);
    return;
  }
  if (!res.ok) {
    onError?.(new Error(`Stream HTTP ${res.status}`));
    return;
  }
  const reader = res.body?.getReader();
  if (!reader) {
    onError?.(new Error("Stream body unavailable."));
    return;
  }
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let split;
    while ((split = buffer.indexOf("\n\n")) >= 0) {
      const block = buffer.slice(0, split);
      buffer = buffer.slice(split + 2);
      const payload = parseSseDataBlock(block);
      if (!payload) continue;
      if (payload.error) onError?.(new Error(payload.error));
      else onMessage?.(payload);
    }
  }
}
