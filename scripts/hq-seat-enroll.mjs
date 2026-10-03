#!/usr/bin/env node
/**
 * Request this seat's room key without anyone handling a secret.
 *
 *   node scripts/hq-seat-enroll.mjs <seat> [--client "codex-cli"] [--out .hq-seat.env] [--url https://hq.sooklabs.com]
 *
 * 1. Asks HQ for a key. The key is written to --out (mode 600, default
 *    .hq-seat-<seat>.env) as HQ_ROOM_CONNECTION=…, and is NEVER printed.
 * 2. Prints a pairing code. Tell it to an approver (Mark, or the seat Mark
 *    delegated) directly. Do not post it in the room.
 * 3. Waits (up to 15 minutes) until the key is approved, denied or expires.
 * Then load the file into your MCP client's env and run scripts/hq-mcp-check.mjs.
 */
import { writeFileSync } from "fs";

const args = process.argv.slice(2);
const opt = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);
const seat = (args[0] || "").toLowerCase();
if (!seat || seat.startsWith("--")) {
  console.error("Usage: node scripts/hq-seat-enroll.mjs <seat> [--client name] [--out file] [--url base]");
  process.exit(2);
}
const base = opt("--url", process.env.HQ_ROOM_URL || "https://hq.sooklabs.com").replace(/\/$/, "");
const out = opt("--out", `.hq-seat-${seat}.env`);

const res = await fetch(`${base}/hq/api/room/enroll`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ seat, client: opt("--client", "") }),
});
const body = await res.json().catch(() => ({}));
if (!res.ok || !body.key) {
  console.error(`Request failed (HTTP ${res.status}): ${body.error || "no key returned"}`);
  process.exit(1);
}
writeFileSync(out, `HQ_ROOM_CONNECTION=${body.key}\n`, { mode: 0o600 });
console.log(`Key for seat "${body.seat}" saved to ${out} (not printed). It is inactive until approved.`);
console.log(`\n  Pairing code: ${body.pairingCode}\n  Request:      ${body.requestId}\n  Approvers:    ${body.approvers.join(", ")}\n  Expires:      ${body.expiresAt}\n`);
console.log("Give the pairing code (not the key) to an approver. Waiting for approval…");

const deadline = Date.parse(body.expiresAt) + 5_000;
while (Date.now() < deadline) {
  await new Promise((r) => setTimeout(r, 5_000));
  const poll = await fetch(`${base}/hq/api/room/enroll/${body.requestId}`, { headers: { authorization: `Bearer ${body.key}` } }).catch(() => null);
  const state = poll && (await poll.json().catch(() => ({})));
  const status = state?.request?.status;
  if (status === "active") {
    console.log(`Approved by ${state.request.decidedBy}. Seat "${body.seat}" key is active. Next: set HQ_ROOM_CONNECTION from ${out} in your MCP client and run scripts/hq-mcp-check.mjs.`);
    process.exit(0);
  }
  if (status && status !== "pending") {
    console.error(`Request ${status}. Run this again for a new key.`);
    process.exit(1);
  }
}
console.error("Timed out waiting for approval. Run this again for a new key.");
process.exit(1);
