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

export const ROOM_STREAM_BACKOFF_MS = [1000, 2000, 4000, 8000, 16000, 30000];

export function nextStreamBackoffMs(attempt) {
  const index = Math.min(Math.max(0, attempt), ROOM_STREAM_BACKOFF_MS.length - 1);
  return ROOM_STREAM_BACKOFF_MS[index];
}

function abortError() {
  const error = new Error("Aborted");
  error.name = "AbortError";
  return error;
}

function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError());
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(abortError());
      },
      { once: true },
    );
  });
}

/**
 * Read HQ room SSE with auth headers (EventSource cannot send x-hq-room-connection).
 * Calls onMessage for each message event; onError on HTTP or stream errors.
 * Resolves when the response body ends (serverless limit / proxy timeout).
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
    return { cleanExit: false };
  }
  if (!res.ok) {
    onError?.(new Error(`Stream HTTP ${res.status}`));
    return { cleanExit: false };
  }
  const reader = res.body?.getReader();
  if (!reader) {
    onError?.(new Error("Stream body unavailable."));
    return { cleanExit: false };
  }
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      let chunk;
      try {
        chunk = await reader.read();
      } catch (error) {
        if (error?.name === "AbortError") return { cleanExit: false, aborted: true };
        onError?.(error);
        return { cleanExit: false };
      }
      const { done, value } = chunk;
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
  } catch (error) {
    if (error?.name === "AbortError") return { cleanExit: false, aborted: true };
    onError?.(error);
    return { cleanExit: false };
  }
  return { cleanExit: true };
}

/**
 * Reconnect after clean EOF or errors. Uses stream `after=` cursor (message createdAt).
 */
export async function maintainRoomStream({
  channel = "room",
  headers = {},
  signal,
  onMessage,
  onError,
  sleepFn = sleep,
}) {
  let after = "";
  let attempt = 0;
  while (!signal?.aborted) {
    const query = new URLSearchParams({ channel });
    if (after) query.set("after", after);
    const url = `/hq/api/room/stream?${query.toString()}`;
    const result = await readRoomStream({
      url,
      headers,
      signal,
      onMessage: (message) => {
        if (message?.createdAt) after = message.createdAt;
        onMessage?.(message);
      },
      onError,
    });
    if (signal?.aborted || result.aborted) break;
    if (!result.cleanExit) attempt += 1;
    else attempt = 0;
    try {
      await sleepFn(nextStreamBackoffMs(attempt), signal);
    } catch (error) {
      if (error?.name === "AbortError") break;
      throw error;
    }
  }
}
