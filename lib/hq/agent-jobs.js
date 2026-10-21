/** Agent jobs that never got a callback stay "running" forever; age them out. */

export const DEFAULT_STALE_HOURS = 6;
export const TIMED_OUT = "timed_out";

export function staleThresholdMs(env = process.env) {
  const hours = Number(env.HQ_AGENT_JOB_STALE_HOURS);
  return (Number.isFinite(hours) && hours > 0 ? hours : DEFAULT_STALE_HOURS) * 3_600_000;
}

/** True when a job is still "running" but started longer ago than the threshold (or has no usable start time). */
export function isStaleRunningJob(job, nowMs = Date.now(), thresholdMs = staleThresholdMs()) {
  if (!job || job.status !== "running") return false;
  const started = Date.parse(job.startedAt || "");
  if (!Number.isFinite(started)) return true;
  return nowMs - started > thresholdMs;
}

/** Returns { jobs, expired } where stale running jobs are marked timed_out. Input is not mutated. */
export function expireStaleAgentJobs(jobs, nowMs = Date.now(), thresholdMs = staleThresholdMs()) {
  if (!Array.isArray(jobs)) return { jobs: [], expired: 0 };
  let expired = 0;
  const hours = Math.round(thresholdMs / 3_600_000);
  const next = jobs.map((job) => {
    if (!isStaleRunningJob(job, nowMs, thresholdMs)) return job;
    expired += 1;
    return {
      ...job,
      status: TIMED_OUT,
      completedAt: new Date(nowMs).toISOString(),
      summary: `Timed out: no result after ${hours}h${job.summary ? ` · ${job.summary}` : ""}`.slice(0, 240),
    };
  });
  return { jobs: next, expired };
}
