#!/usr/bin/env node
/**
 * Generate one room connection per seat and (optionally) load them into Vercel.
 *
 *   node scripts/hq-room-seats.mjs                      # write .hq-room-seats.local.env only
 *   node scripts/hq-room-seats.mjs --vercel production  # also `vercel env add` each one
 *   node scripts/hq-room-seats.mjs --vercel production --live   # and set HQ_ROOM_STATUS=live
 *
 * Secrets are never printed. Each seat's value goes to that agent privately
 * (its own environment secret), never into a chat. Rerunning rotates every seat.
 */
import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { ROOM_CONNECTIONS, connectionEnvKey } from "../lib/hq/swarm-contract.js";

const args = process.argv.slice(2);
const target = args.includes("--vercel") ? args[args.indexOf("--vercel") + 1] : "";
const live = args.includes("--live");
if (args.includes("--vercel") && !["production", "preview", "development"].includes(target)) {
  console.error("Usage: --vercel production|preview|development");
  process.exit(1);
}

const seats = ROOM_CONNECTIONS.map(({ name }) => ({ key: connectionEnvKey(name), value: randomBytes(32).toString("base64url") }));
if (new Set(seats.map((s) => s.value)).size !== seats.length) throw new Error("duplicate secret");

const out = ".hq-room-seats.local.env";
writeFileSync(out, `# One line per seat. Give each agent only its own line.\n${seats.map((s) => `${s.key}=${s.value}`).join("\n")}\n`, { mode: 0o600 });
console.log(`Wrote ${seats.length} seat connections to ${out} (gitignored, mode 600).`);

if (target) {
  const vercel = (argv, input) => spawnSync("vercel", argv, { input, encoding: "utf8" });
  for (const { key, value } of seats) {
    vercel(["env", "rm", key, target, "-y"]);
    const added = vercel(["env", "add", key, target], value);
    console.log(`${added.status === 0 ? "set" : "FAILED"} ${key} (${target})${added.status === 0 ? "" : ` — ${added.stderr.trim()}`}`);
  }
  if (live) {
    vercel(["env", "rm", "HQ_ROOM_STATUS", target, "-y"]);
    const added = vercel(["env", "add", "HQ_ROOM_STATUS", target], "live");
    console.log(`${added.status === 0 ? "set" : "FAILED"} HQ_ROOM_STATUS=live (${target})`);
  }
  console.log(`Redeploy ${target} so the new values load: vercel --prod (or push to the deployed branch).`);
}
