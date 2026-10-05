#!/usr/bin/env node
/**
 * CI / cron heartbeat: Sookly journey unit tests + checkpoint percent.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { computeSooklyJourneyCheckpoint } from "../lib/sookly/journey-checkpoint.js";

const test = spawnSync(
  process.execPath,
  [
    "--test",
    "lib/sookly/journey-model.test.js",
    "lib/sookly/journey-signal-router.test.js",
    "lib/sookly/journey-ingest.test.js",
    "lib/hq/sookly-journey-report.test.js",
  ],
  { cwd: process.cwd(), stdio: "inherit" }
);

if (test.status !== 0) process.exit(test.status ?? 1);

const checkpoint = computeSooklyJourneyCheckpoint({
  filesPresent: (p) => existsSync(join(process.cwd(), p)),
});

console.log(
  JSON.stringify(
    {
      ok: true,
      heartbeat: "sookly-journey",
      checkpointPercent: checkpoint.percent,
      currentCheckpointId: checkpoint.currentCheckpointId,
      at: new Date().toISOString(),
    },
    null,
    2
  )
);
