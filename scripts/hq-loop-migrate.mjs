#!/usr/bin/env node
/**
 * Create the HQ execution-loop tables (lib/hq/loop-store.js LOOP_SCHEMA).
 * Additive only: CREATE TABLE / INDEX IF NOT EXISTS, nothing altered or dropped.
 *
 *   HQ_DATABASE_URL=postgres://localhost/... node scripts/hq-loop-migrate.mjs
 *   HQ_DATABASE_URL=<production> node scripts/hq-loop-migrate.mjs --approved-by mark
 *
 * Any non-local database is a production migration: it refuses to run without
 * --approved-by <name>, which is recorded in hq_loop_events.
 */
import { LOOP_SCHEMA, closeLoopPool, loopInstalled, migrateLoop, recordEvent } from "../lib/hq/loop-store.js";

const url = process.env.HQ_DATABASE_URL || process.env.DATABASE_URL || "";
if (!url) {
  console.error("Set HQ_DATABASE_URL.");
  process.exit(2);
}
const args = process.argv.slice(2);
const approvedBy = args.includes("--approved-by") ? args[args.indexOf("--approved-by") + 1] : "";
const local = /@(localhost|127\.0\.0\.1)(:\d+)?\//.test(url);
if (!local && !approvedBy) {
  console.error("This is a production migration. Re-run with --approved-by <name> once Mark has approved it.");
  process.exit(3);
}
console.log(`Applying ${LOOP_SCHEMA.length} additive statements to ${local ? "a local database" : "a non-local database"}…`);
await migrateLoop();
console.log(`Installed: ${await loopInstalled()}`);
await recordEvent({ kind: "migration", actor: approvedBy || "local", payload: { statements: LOOP_SCHEMA.length } });
await closeLoopPool();
