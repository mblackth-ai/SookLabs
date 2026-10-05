// HQ acceptance-driven loop: standing authority per front. Pure data + checks,
// no I/O. This is enforced by the worker (lib/hq/loop-worker.js), not by prompts.
//
// Authority hierarchy: docs/HQ-MCP-CONTROL-PLANE.md § "Execution mode — canonical
// authority". The source manifests below mirror that table; if they disagree,
// the canonical document wins and this file is the bug.
//
// Pattern reference (not a dependency): OpenClaw standing orders — scope,
// triggers, approval gates, escalation — read at openclaw/openclaw@28a6f71.

export const POLICY_VERSION = "2026-10-03.1";

// Actions no task may take on its own, on any front. Each is an escalation to Mark.
export const ESCALATION_GATES = [
  "credentials", // creating, reading or rotating secrets/keys
  "spend", // new paid resources or raising a budget
  "irreversible", // deletes, force pushes, data destruction
  "production-migration",
  "external-publishing", // social posts, public content
  "customer-communication",
  "business-decision", // pricing, scope, client commitments
  "authority-change", // editing these policies or acceptance criteria
];

const SOURCES = {
  "hq-mcp": {
    repo: "mblackth-ai/SookLabs",
    files: [
      { role: "primary", path: "docs/HQ-MCP-CONTROL-PLANE.md" },
      { role: "supporting", path: "docs/HQ-DEVELOPER.md" },
    ],
  },
  "sookly-journey": {
    repo: "mblackth-ai/sookly-omnichat",
    files: [
      { role: "acceptance", path: "sookly-control/release-matrix.md" },
      { role: "state", path: "sookly-control/current-state.md" },
      { role: "tracks", path: "sookly-control/active-tracks.md" },
    ],
  },
  "seos-social": {
    repo: "mblackth-ai/SEOS",
    files: [
      { role: "definition", path: "docs/SEOS-MVP-1.md" },
      { role: "acceptance", path: "docs/mvp-smoke-checklist.md" },
      { role: "decisions", path: "docs/agent/DECISIONS.md" },
    ],
  },
  "rdusa-internal": {
    repo: "mblackth-ai/rdusa",
    files: [
      { role: "index", path: "rdusa-retainer-growth-system-v2/00_INDEX/RDUSA_RETAINER_GROWTH_SYSTEM_INDEX.md" },
      { role: "scope", path: "rdusa-retainer-growth-system-v2/01_RETAINER_FRAMEWORK_GUARDRAILS/RETAINER_PROMISE_MAP.md" },
      { role: "execution", path: "rdusa-retainer-growth-system-v2/04_ACTIONS_AUTOMATIONS_EXECUTION/NEXT_ACTIONS.md" },
      { role: "governance", path: "docs/RDUSA_MASTER_AUDIT_SCOPE_AUTHORITY_ACCOUNTABILITY_2026-10-01.md" },
    ],
  },
};

const COMMON_SKILLS = ["acceptance-gap-triage", "evidence-collect", "failing-check-diagnosis", "review-request"];

export const FRONTS = [
  {
    id: "hq-mcp",
    name: "HQ / MCP Gateway",
    opsItemId: "exec-hq-mcp",
    goal: "Converge room backend and MCP; prove the two-seat baton handoff (control plane § Immediate end-to-end milestone).",
    allowedSkills: [...COMMON_SKILLS, "scoped-implementation", "deploy-verify"],
    prohibited: ["MCP write tools without policy and approval receipts", "bypassing merge/deploy/migration gates"],
    triggers: ["room dispatch", "GitHub check/PR event", "worker completion", "recovery sweep"],
    acceptanceAuthority: "docs/HQ-MCP-CONTROL-PLANE.md",
  },
  {
    id: "sookly-journey",
    name: "Sookly Journey / CRM",
    opsItemId: "exec-sookly",
    goal: "Release-matrix rows reach PASS with evidence in their required environment.",
    allowedSkills: [...COMMON_SKILLS, "scoped-implementation"],
    prohibited: ["live Stripe configuration or real charges", "enabling public registration", "provider OAuth app changes"],
    triggers: ["room dispatch", "GitHub check/PR event", "worker completion", "recovery sweep"],
    acceptanceAuthority: "sookly-control/release-matrix.md",
  },
  {
    id: "seos-social",
    name: "SEOS Social Control Plane",
    opsItemId: "exec-seos",
    goal: "MVP 1 plus the smoke checklist pass; Manual / Workflow Ready / Future API never shown as Connected.",
    allowedSkills: [...COMMON_SKILLS, "scoped-implementation"],
    prohibited: ["presenting Manual/Workflow Ready/Future API as Connected", "posting to social networks"],
    triggers: ["room dispatch", "GitHub check/PR event", "worker completion", "recovery sweep"],
    acceptanceAuthority: "docs/mvp-smoke-checklist.md",
  },
  {
    id: "rdusa-internal",
    name: "RDUSA Internal Retainer Control",
    opsItemId: "exec-rdusa",
    goal: "Scope-linked delivery ledger and evidence map; completed, blocked and extra-scope work distinguished.",
    // No code changes and nothing client-facing: triage, evidence and review only.
    allowedSkills: [...COMMON_SKILLS],
    prohibited: ["client delivery or messaging", "new obligations from historic documents", "report publication"],
    triggers: ["room dispatch", "worker completion", "recovery sweep"],
    acceptanceAuthority: "rdusa-retainer-growth-system-v2/01_RETAINER_FRAMEWORK_GUARDRAILS/RETAINER_PROMISE_MAP.md",
  },
].map((front) => ({ ...front, sources: SOURCES[front.id] }));

export function frontById(id) {
  return FRONTS.find((front) => front.id === id) || null;
}

// What each seat may be asked to do. A dispatch to a seat that lacks a
// capability is refused before anything is sent.
export const SEAT_CAPABILITIES = {
  claude: ["implement", "diagnose", "review", "evidence"],
  cursor: ["implement", "diagnose", "review", "integrate"],
  codex: ["diagnose", "review", "test"],
  grok: ["review", "orchestrate", "copy"],
  gemini: ["review", "spec"],
  chatgpt: ["review", "spec"],
};

export function sourceLinks(frontId, resolved = {}) {
  const front = frontById(frontId);
  if (!front) return [];
  return front.sources.files.map((file) => {
    const sha = resolved[file.path]?.sha || "";
    const ref = sha || "HEAD";
    return {
      role: file.role,
      path: file.path,
      repo: front.sources.repo,
      sha,
      status: resolved[file.path]?.status || "unchecked",
      url: `https://github.com/${front.sources.repo}/blob/${ref}/${file.path.split("/").map(encodeURIComponent).join("/")}`,
    };
  });
}

/**
 * Can this task run this skill right now? Pure. Returns { ok } or
 * { ok:false, code, reason } — codes are surfaced verbatim as blockers.
 */
export function authorize({ task, skill, front, seatCaps = SEAT_CAPABILITIES }) {
  if (!front) return { ok: false, code: "unknown-front", reason: `No standing authority for front "${task.front}".` };
  if (!skill) return { ok: false, code: "unknown-skill", reason: "Skill is not in the reviewed catalog." };
  if (!front.allowedSkills.includes(skill.id)) {
    return { ok: false, code: "skill-not-allowed", reason: `${skill.id} is not allowed on ${front.id}.` };
  }
  const gate = (skill.gates || []).find((name) => ESCALATION_GATES.includes(name));
  if (gate) return { ok: false, code: "escalation", reason: `${skill.id} crosses the ${gate} gate; Mark must approve.` };
  if (skill.seatCapability) {
    const seat = task.ownerSeat;
    const caps = seatCaps[seat] || [];
    if (!caps.includes(skill.seatCapability)) {
      return { ok: false, code: "invalid-capability", reason: `${seat || "No seat"} does not have the ${skill.seatCapability} capability.` };
    }
  }
  if (task.revoked) return { ok: false, code: "revoked", reason: "Authority for this task was revoked." };
  if (task.authority?.policyVersion && task.authority.policyVersion !== POLICY_VERSION) {
    return { ok: false, code: "authority-changed", reason: `Task was authorised under policy ${task.authority.policyVersion}; current is ${POLICY_VERSION}. Re-approve.` };
  }
  return { ok: true };
}

// Lifecycle stages stay distinct; only deploy-verify may reach production_accepted.
export const STAGES = ["queued", "working", "tested", "reviewed", "merged", "deployed", "production_accepted"];
export const STATUSES = ["active", "waiting", "blocked", "paused", "proposed", "done", "cancelled"];
