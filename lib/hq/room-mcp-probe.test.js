import assert from "node:assert/strict";
import test from "node:test";
import { ROOM_MCP_BROWSER_PATH } from "./room-mcp-endpoint.js";
import { parseMcpSeatFromInstructions, probeRoomMcp } from "./room-mcp-probe.js";

test("parseMcpSeatFromInstructions reads the seat from initialize instructions", () => {
  assert.equal(parseMcpSeatFromInstructions('Rules…\nThis connection is seat "cursor".'), "cursor");
  assert.equal(parseMcpSeatFromInstructions(""), "");
});

test("probeRoomMcp defaults to same-origin browser path", async () => {
  const original = globalThis.fetch;
  let seenUrl = "";
  globalThis.fetch = async (url) => {
    seenUrl = String(url);
    return {
      ok: true,
      json: async () => ({
        result: { protocolVersion: "2025-06-18", serverInfo: { name: "sooklabs-hq-room" }, instructions: 'seat "codex"' },
      }),
    };
  };
  try {
    await probeRoomMcp({ token: "k" });
    assert.equal(seenUrl, ROOM_MCP_BROWSER_PATH);
  } finally {
    globalThis.fetch = original;
  }
});

test("probeRoomMcp rejects empty keys and seat mismatches", async () => {
  assert.equal((await probeRoomMcp({ token: "" })).ok, false);
  const original = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({
      result: { protocolVersion: "2025-06-18", serverInfo: { name: "sooklabs-hq-room" }, instructions: 'seat "codex"' },
    }),
  });
  try {
    const ok = await probeRoomMcp({ token: "test-key", expectedSeat: "cursor" });
    assert.equal(ok.ok, false);
    assert.match(ok.error, /codex/);
    const match = await probeRoomMcp({ token: "test-key", expectedSeat: "codex" });
    assert.equal(match.ok, true);
    assert.equal(match.seat, "codex");
  } finally {
    globalThis.fetch = original;
  }
});
