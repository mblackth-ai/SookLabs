#!/usr/bin/env node
import { spawn } from "node:child_process";

const databaseUrl = process.env.HQ_TEST_DATABASE_URL || "";

function isLocalDatabase(value) {
  try {
    const url = new URL(value);
    return ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  } catch {
    return false;
  }
}

if (!databaseUrl) {
  console.error("HQ_TEST_DATABASE_URL is required. The completion harness never skips its Postgres checks.");
  process.exit(2);
}

if (!isLocalDatabase(databaseUrl)) {
  console.error("HQ_TEST_DATABASE_URL must point to localhost. The harness truncates disposable test tables.");
  process.exit(3);
}

const tests = [
  "lib/hq/dispatch-guard.test.js",
  "lib/hq/github.test.js",
  "lib/hq/loop.test.js",
  "lib/hq/room-connection.test.js",
  "lib/hq/room-mcp-rpc.test.js",
  "lib/hq/seat-enroll.test.js",
  "lib/hq/swarm-contract.test.js",
  "lib/hq/swarm-pg.test.js",
  "lib/hq/swarm-routing.test.js",
];

const child = spawn(
  process.execPath,
  ["--test", "--test-concurrency=1", ...tests],
  {
    env: {
      ...process.env,
      HQ_DATABASE_URL: databaseUrl,
    },
    stdio: "inherit",
  },
);

child.on("error", (error) => {
  console.error(`Could not start the completion harness: ${error.message}`);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) {
    console.error(`Completion harness stopped by ${signal}.`);
    process.exit(1);
  }
  process.exit(code ?? 1);
});
