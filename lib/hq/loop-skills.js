// Reviewed skill catalog for the HQ loop. A skill exists only if it is listed
// here; there is no Markdown discovery or third-party install. Adding or
// changing an entry is a code change that goes through PR review.
//
// The worker (lib/hq/loop-worker.js) owns the implementations. Permission to
// run a skill comes from lib/hq/loop-policy.js (front allowlist, escalation
// gates, seat capability), never from this metadata alone.

export const SKILLS = [
  {
    id: "acceptance-gap-triage",
    version: 1,
    owner: "claude",
    purpose: "Resolve the front's canonical sources at their current revision and record what is missing.",
    trigger: "Task created, authority source changed, or recovery sweep.",
    capabilities: ["github:read"],
    seatCapability: null,
    sideEffect: "none",
    inputs: ["task.front"],
    outputs: ["authority.sources[] with sha/status", "blocker if a source is unreadable"],
    verify: "Every manifest path resolves to a blob SHA; unreadable sources become a blocker, never an assumption.",
    onFailure: "Block with the unreadable path; retry with backoff (GitHub outage).",
  },
  {
    id: "evidence-collect",
    version: 1,
    owner: "claude",
    purpose: "Attach CI and deployment records for the task's refs, labelled with environment, revision and observation time.",
    trigger: "GitHub check/PR event or a seat reply that names refs.",
    capabilities: ["github:read"],
    seatCapability: null,
    sideEffect: "none",
    inputs: ["task.refs[] (repo#pr or repo@sha)"],
    outputs: ["evidence[] kind=ci|deployment, environment=ci|preview|production-record"],
    verify: "CI evidence is labelled CI; a deployment record is not production acceptance.",
    onFailure: "Retry with backoff; exhaustion blocks with the last GitHub status.",
  },
  {
    id: "failing-check-diagnosis",
    version: 1,
    owner: "claude",
    purpose: "Ask the owning seat to diagnose a failing check on the task's ref.",
    trigger: "Evidence shows a failed check.",
    capabilities: ["room:dispatch"],
    seatCapability: "diagnose",
    sideEffect: "dispatch",
    inputs: ["task", "failing evidence"],
    outputs: ["one room dispatch to the owner seat (idempotent per task step)"],
    verify: "Exactly one dispatch per step; the task waits for that seat's reply.",
    onFailure: "Offline seat → blocked 'seat offline'; no fabricated reply.",
  },
  {
    id: "scoped-implementation",
    version: 1,
    owner: "claude",
    purpose: "Hand a reversible, in-scope implementation step to the owning seat.",
    trigger: "Triage found a gap the front allows closing with code.",
    capabilities: ["room:dispatch"],
    seatCapability: "implement",
    sideEffect: "dispatch",
    inputs: ["task.deliverable", "task.acceptance", "task.nextAction"],
    outputs: ["one room dispatch to the owner seat"],
    verify: "The reply must carry refs; evidence-collect checks them.",
    onFailure: "Offline seat → blocked; retry exhaustion → blocked with reason.",
  },
  {
    id: "review-request",
    version: 1,
    owner: "claude",
    purpose: "Ask a reviewer seat to review the task's PR before any merge.",
    trigger: "CI green on the task's PR.",
    capabilities: ["room:dispatch"],
    seatCapability: "review",
    sideEffect: "dispatch",
    inputs: ["task.refs", "evidence"],
    outputs: ["one room dispatch to the reviewer seat", "review recorded on reply"],
    verify: "Review is recorded separately from merge and from production acceptance.",
    onFailure: "Offline reviewer → blocked.",
  },
  {
    id: "deploy-verify",
    version: 1,
    owner: "claude",
    purpose: "Run the task's production smoke test against the deployed revision.",
    trigger: "A production deployment record exists for the task's revision.",
    capabilities: ["http:read"],
    seatCapability: null,
    sideEffect: "none",
    inputs: ["task.acceptance.smoke {url, expectStatus, expectText}"],
    outputs: ["evidence kind=production-smoke environment=production with revision and observedAt"],
    verify: "Only a passing real HTTP check sets stage production_accepted; fixture/CI evidence never does.",
    onFailure: "A failed smoke records FAIL evidence and blocks; it never retries into a PASS.",
  },
];

export function skillById(id) {
  return SKILLS.find((skill) => skill.id === id) || null;
}
