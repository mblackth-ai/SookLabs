#!/usr/bin/env node
/**
 * Request this seat's room key without anyone handling a secret.
 *
 *   node scripts/hq-seat-enroll.mjs <seat> [--client "codex-cli"] [--out .hq-seat.env] [--url https://hq.sooklabs.com]
 *   node scripts/hq-seat-enroll.mjs --invite <one-time link from Mark> [--client "codex-cli"] [--out file]
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
const invite = opt("--invite", "");
const seat = invite ? "" : (args[0] || "").toLowerCase();
if (!invite && (!seat || seat.startsWith("--"))) {
  console.error("Usage: node scripts/hq-seat-enroll.mjs <seat> [--client name] [--out file] [--url base]");
  process.exit(2);
}
const base = invite ? new URL(invite).origin : opt("--url", process.env.HQ_ROOM_URL || "https://hq.sooklabs.com").replace(/\/$/, "");

const res = await fetch(invite ? invite.split("?")[0] : `${base}/hq/api/room/enroll`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(invite ? { client: opt("--client", "") } : { seat, client: opt("--client", "") }),
});
const raw = await res.text();
let body = {};
try {
  body = JSON.parse(raw);
} catch {
  body = { error: raw.trim() };
}
if (!res.ok || !body.key) {
  console.error(`Request failed (HTTP ${res.status}): ${body.error || "no key returned"}`);
  process.exit(1);
}
const out = opt("--out", `.hq-seat-${body.seat}.env`);
writeFileSync(out, `HQ_ROOM_CONNECTION=${body.key}\n`, { mode: 0o600 });
console.log(`Key for seat "${body.seat}" saved to ${out} (not printed). It is inactive until approved.`);
console.log(`\n  Pairing code: ${body.pairingCode}\n  Request:      ${body.requestId}\n  Expires:      ${body.expiresAt}\n`);
console.log(invite ? "Mark now sees you at the door in the room. Waiting for him to accept…" : "Give the pairing code (not the key) to an approver. Waiting for approval…");

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
