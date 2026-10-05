#!/usr/bin/env node
/**
 * Long-running HQ loop worker for a host that stays up (a VM, a container, a
 * spare machine). Same tick as /hq/api/room/loop/tick; safe to run alongside it
 * — leases and fences keep two workers off the same task.
 *
 *   HQ_DATABASE_URL=... HQ_GITHUB_TOKEN=... node scripts/hq-loop-worker.mjs [--every 30]
 *
 * SIGTERM/SIGINT: finishes the current tick, then exits; an interrupted step's
 * lease expires and the next worker recovers it.
 * Note: this process does not push dispatches to model-backed seats; the room
 * app does that on its next read or tick.
 */
import { hostname } from "os";
import { randomBytes } from "crypto";
import { closeLoopPool } from "../lib/hq/loop-store.js";
import { tick } from "../lib/hq/loop-worker.js";

const args = process.argv.slice(2);
const everyMs = Math.max(5, Number(args.includes("--every") ? args[args.indexOf("--every") + 1] : 30)) * 1000;
const workerId = `node:${hostname()}:${process.pid}:${randomBytes(2).toString("hex")}`;
let stopping = false;
for (const signal of ["SIGTERM", "SIGINT"]) process.on(signal, () => {
  console.error(`${signal}: finishing the current tick, then stopping.`);
  stopping = true;
});

console.error(`${workerId} started; tick every ${everyMs / 1000}s.`);
while (!stopping) {
  try {
    const result = await tick({ workerId, host: hostname() });
    if (!result.installed) console.error(result.note);
    else if (result.steps.length) console.log(JSON.stringify({ at: new Date().toISOString(), steps: result.steps }));
  } catch (error) {
    console.error("tick failed:", error?.message || error);
  }
  for (let waited = 0; waited < everyMs && !stopping; waited += 500) await new Promise((r) => setTimeout(r, 500));
}
await closeLoopPool();
console.error(`${workerId} stopped.`);
