import assert from "node:assert/strict";
import test from "node:test";
import { expireStaleAgentJobs, isStaleRunningJob, staleThresholdMs, TIMED_OUT } from "./agent-jobs.js";

const NOW = Date.parse("2026-10-21T15:00:00Z");
const H = 3_600_000;

test("running jobs older than the threshold time out; fresh and finished jobs are untouched", () => {
  const jobs = [
    { id: "old", status: "running", startedAt: "2026-10-18T23:00:00Z", summary: "Dispatching morning briefing…" },
    { id: "fresh", status: "running", startedAt: new Date(NOW - 1 * H).toISOString() },
    { id: "done", status: "completed", startedAt: "2026-10-01T00:00:00Z" },
    { id: "nostart", status: "running" },
  ];
  const { jobs: out, expired } = expireStaleAgentJobs(jobs, NOW, 6 * H);
  assert.equal(expired, 2);
  assert.equal(out[0].status, TIMED_OUT);
  assert.equal(out[0].completedAt, new Date(NOW).toISOString());
  assert.match(out[0].summary, /^Timed out: no result after 6h · Dispatching/);
  assert.equal(out[1], jobs[1]);
  assert.equal(out[2], jobs[2]);
  assert.equal(out[3].status, TIMED_OUT);
  assert.equal(jobs[0].status, "running", "input not mutated");
});

test("threshold boundary and env override", () => {
  const job = { status: "running", startedAt: new Date(NOW - 6 * H).toISOString() };
  assert.equal(isStaleRunningJob(job, NOW, 6 * H), false);
  assert.equal(isStaleRunningJob(job, NOW + 1, 6 * H), true);
  assert.equal(staleThresholdMs({}), 6 * H);
  assert.equal(staleThresholdMs({ HQ_AGENT_JOB_STALE_HOURS: "2" }), 2 * H);
  assert.equal(staleThresholdMs({ HQ_AGENT_JOB_STALE_HOURS: "nope" }), 6 * H);
});

test("non-array input is safe", () => {
  assert.deepEqual(expireStaleAgentJobs(undefined, NOW), { jobs: [], expired: 0 });
});
