#!/usr/bin/env node
/**
 * Score a room record against the two-seat milestone.
 *
 *   node scripts/hq-room-completion.mjs
 *   node scripts/hq-room-completion.mjs --file data/hq/room.json
 *   node scripts/hq-room-completion.mjs --json
 *
 * Reads the local file store only. Prints the first gap. Does not post,
 * merge, or claim production acceptance.
 */

import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { evaluateRoomCompletion, formatRoomCompletion } from "../lib/hq/room-completion.js";

const args = process.argv.slice(2);
const fileFlag = args.indexOf("--file");
const file = resolve(fileFlag >= 0 ? args[fileFlag + 1] : "data/hq/room.json");
const asJson = args.includes("--json");

if (fileFlag >= 0 && !args[fileFlag + 1]) {
  console.error("Usage: node scripts/hq-room-completion.mjs [--file path] [--json]");
  process.exit(2);
}

let snapshot = { messages: [], dispatches: [] };
if (!existsSync(file)) {
  console.error(`No room record at ${file}. Scoring an empty room.`);
} else {
  try {
    const data = JSON.parse(readFileSync(file, "utf8"));
    snapshot = {
      messages: Array.isArray(data?.messages) ? data.messages : [],
      dispatches: Array.isArray(data?.dispatches) ? data.dispatches : [],
    };
  } catch {
    console.error(`Could not read ${file}.`);
    process.exit(2);
  }
}

const report = evaluateRoomCompletion(snapshot);
if (asJson) console.log(JSON.stringify(report, null, 2));
else console.log(formatRoomCompletion(report));
process.exit(report.verdict === "complete" ? 0 : 1);
