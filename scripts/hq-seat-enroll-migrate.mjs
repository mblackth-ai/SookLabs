#!/usr/bin/env node
/**
 * Create the seat key request table (lib/hq/seat-enroll.js ENROLL_SCHEMA).
 * Additive only: CREATE TABLE / INDEX IF NOT EXISTS.
 *
 *   HQ_DATABASE_URL=postgres://localhost/... node scripts/hq-seat-enroll-migrate.mjs
 *   HQ_DATABASE_URL=<production> node scripts/hq-seat-enroll-migrate.mjs --approved-by mark
 *
 * Any non-local database is a production migration and needs --approved-by <name>.
 */
import { closeEnrollPool, enrollInstalled, migrateEnroll } from "../lib/hq/seat-enroll.js";

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
const before = await enrollInstalled();
await migrateEnroll();
console.log(before ? "hq_seat_enrollments already present; nothing changed." : `Created hq_seat_enrollments${approvedBy ? ` (approved by ${approvedBy})` : ""}.`);
await closeEnrollPool();
