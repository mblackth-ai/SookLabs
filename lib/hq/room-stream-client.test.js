import assert from "node:assert/strict";
import test from "node:test";
import {
  maintainRoomStream,
  nextStreamBackoffMs,
  parseSseDataBlock,
  readRoomStream,
} from "./room-stream-client.js";
import { dispatchOutcomeNote } from "./dispatch-outcome.js";

test("parseSseDataBlock reads JSON message events", () => {
  const block = "event: message\ndata: {\"id\":\"m1\",\"body\":\"hi\"}\n";
  assert.deepEqual(parseSseDataBlock(block), { id: "m1", body: "hi" });
  assert.equal(parseSseDataBlock(": heartbeat\n"), null);
});

test("readRoomStream resolves cleanExit when the body ends", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    body: {
      getReader() {
        return {
          async read() {
            return { done: true };
          },
        };
      },
    },
  });
  try {
    const out = await readRoomStream({ url: "/hq/api/room/stream?channel=room" });
    assert.equal(out.cleanExit, true);
  } finally {
    globalThis.fetch = original;
  }
});

test("readRoomStream returns cleanExit false when reader rejects mid-stream", async () => {
  const original = globalThis.fetch;
  let reported;
  globalThis.fetch = async () => ({
    ok: true,
    body: {
      getReader() {
        let reads = 0;
        return {
          async read() {
            reads += 1;
            if (reads === 1) {
              return {
                done: false,
                value: new TextEncoder().encode(
                  'event: message\ndata: {"id":"m1","createdAt":"2026-10-05T12:00:00.000Z"}\n\n',
                ),
              };
            }
            throw new Error("transport dropped");
          },
        };
      },
    },
  });
  try {
    const out = await readRoomStream({
      url: "/hq/api/room/stream?channel=room",
      onError: (error) => {
        reported = error;
      },
    });
    assert.equal(out.cleanExit, false);
    assert.match(String(reported?.message || ""), /transport dropped/);
  } finally {
    globalThis.fetch = original;
  }
});

test("maintainRoomStream reconnects after transport error with after cursor and backoff", async () => {
  const original = globalThis.fetch;
  const urls = [];
  const backoffs = [];
  let pass = 0;
  globalThis.fetch = async (url) => {
    urls.push(String(url));
    pass += 1;
    if (pass === 1) {
      return {
        ok: true,
        body: {
          getReader() {
            let reads = 0;
            return {
              async read() {
                reads += 1;
                if (reads === 1) {
                  return {
                    done: false,
                    value: new TextEncoder().encode(
                      'event: message\ndata: {"id":"m1","createdAt":"2026-10-05T12:00:00.000Z","body":"hi"}\n\n',
                    ),
                  };
                }
                throw new Error("transport dropped");
              },
            };
          },
        },
      };
    }
    return {
      ok: true,
      body: {
        getReader() {
          return {
            async read() {
              return { done: true };
            },
          };
        },
      },
    };
  };
  const controller = new AbortController();
  try {
    await maintainRoomStream({
      channel: "room",
      signal: controller.signal,
      sleepFn: async (ms) => {
        backoffs.push(ms);
        if (urls.length >= 2) controller.abort();
      },
    });
  } catch {
    // aborted
  } finally {
    globalThis.fetch = original;
  }
  assert.ok(urls.length >= 2);
  assert.match(urls[1], /after=2026-10-05T12%3A00%3A00\.000Z/);
  assert.ok(backoffs.length >= 1);
  assert.equal(backoffs[0], nextStreamBackoffMs(1));
});

test("maintainRoomStream reconnects with after= cursor after EOF", async () => {
  const original = globalThis.fetch;
  const urls = [];
  let pass = 0;
  globalThis.fetch = async (url) => {
    urls.push(String(url));
    pass += 1;
    const chunk =
      pass === 1
        ? 'event: message\ndata: {"id":"m1","createdAt":"2026-10-05T12:00:00.000Z","body":"hi"}\n\n'
        : "";
    return {
      ok: true,
      body: {
        getReader() {
          let sent = false;
          return {
            async read() {
              if (!sent && chunk) {
                sent = true;
                return { done: false, value: new TextEncoder().encode(chunk) };
              }
              return { done: true };
            },
          };
        },
      },
    };
  };
  const controller = new AbortController();
  try {
    await maintainRoomStream({
      channel: "room",
      signal: controller.signal,
      sleepFn: async () => {
        if (urls.length >= 2) controller.abort();
      },
    });
  } catch {
    // abort during sleep ends the loop
  } finally {
    globalThis.fetch = original;
  }
  assert.ok(urls.length >= 2);
  assert.match(urls[1], /after=2026-10-05T12%3A00%3A00\.000Z/);
});

test("nextStreamBackoffMs is bounded", () => {
  assert.equal(nextStreamBackoffMs(0), 1000);
  assert.equal(nextStreamBackoffMs(99), nextStreamBackoffMs(10));
});

test("dispatchOutcomeNote lists offline seats with missing env names", () => {
  const note = dispatchOutcomeNote(
    [{ seatId: "cursor", status: "offline", error: "" }],
    [{ seatId: "cursor", missing: "HQ_ROOM_CONNECTION_CURSOR" }],
  );
  assert.match(note, /Cursor offline/);
  assert.match(note, /HQ_ROOM_CONNECTION_CURSOR/);
});
