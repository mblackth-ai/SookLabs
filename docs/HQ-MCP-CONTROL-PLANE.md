# HQ Control Plane / MCP Gateway

## Purpose

HQ is the private operating control plane for SookLabs. It is not another specialist product and it must not duplicate Sookly or SEOS domain logic.

HQ answers four questions:

1. What is happening across the active businesses/products?
2. What is blocked or waiting for approval?
3. What is the next bounded action?
4. What evidence proves progress or business value?

## Shared operating direction

The immediate product requirement is **one room for the operator, many specialized workers behind it**.

The operator should not have to act as the message bus between separate Claude, Grok, ChatGPT, Cursor, Codex, Gemini, or other agent interfaces. The HQ room is the common coordination surface. MCP, APIs, webhooks, repository events, and approved agent interfaces are the machine-to-machine substrate behind that surface.

The target is not uncontrolled multi-agent chat. It is specialized workers operating against one shared, durable and auditable state.

### System roles

- **HQ room** — operator-facing coordination surface: objectives, batons, decisions, blockers, evidence and approvals.
- **MCP gateway** — common controlled tool surface for agents to read shared state and take explicitly permitted actions.
- **HQ database + event log** — durable enterprise memory. Important state must survive any model session.
- **GitHub / CI / deployment / runtime systems** — objective evidence. An agent saying "done" is not proof.
- **Sookly Intelligence / future reasoning layer** — learns from normalized outcomes across products and niches, but does not silently rewrite production behavior.

### Improvement loop

"Self-learning" means:

`observe -> propose -> test -> measure -> approve -> promote`

It does **not** mean unrestricted autonomous self-modification. Improvements need evidence, provenance, rollbackability and the normal approval gates.

### Model-agnostic design

Do not architect HQ around one model vendor. Different workers have different strengths and those strengths can change.

Current useful specialization:

- **Claude** — complete backend / implementation vertical slices quickly.
- **Grok** — MCP and swarm operational/orchestration layer.
- **Cursor** — repository integration, conflict resolution, refactor, review, commit and deploy execution.
- **ChatGPT** — cross-project architecture context, acceptance criteria, dependency tracking, synthesis and oversight.
- **Chief of Staff / HQ** — decompose objectives, route work, reconcile evidence, maintain state and escalate only real decisions or approvals to the operator.

Treat this as a routing preference, not a permanent vendor dependency.

### Speed policy

Do not confuse control with slowness.

Builders should be allowed to complete coherent vertical slices and follow discovered dependencies without constant interruption. Safety and quality gates belong at boundaries that matter: merge, production deploy, migrations, credentials, spend, external publishing and irreversible actions.

Prefer:

`build quickly -> inspect once coherent -> integrate -> acceptance test -> approve -> deploy`

over excessive pre-design that leaves nothing real to test.

### Current implementation checkpoint — 2026-10-03

Claude's `claude/room-seat-setup` branch has advanced the room backend beyond the original draft:

- One-command generation of separate seat connections.
- Row-level Postgres writes instead of whole-table delete/rewrite.
- Concurrency test evidence: 25/25 simultaneous posts persisted in the test environment.
- GitHub evidence reference verification for PRs, commits, files and CI.
- Real Promote behavior that writes the room log + baton in one commit to `room/log`, never directly to the default branch.
- Signed GitHub webhook intake with delivery deduplication.
- PR/CI projection exposed in the HQ room.
- Agent CLI for `read | post | board | prs`.
- HQ tests reported green on that branch and Next build reported successful.

Grok's draft PR #14 is building the separate internal SookLabs MCP v1:

- Streamable HTTP transport.
- OAuth resource-server behavior and seat identity from token `sub`.
- Read-only `project_status`, `blockers`, `build_status`, and `deploy_status` tools.
- Hard lock to the SookLabs repository.
- No write tools yet.

These lines of work are intentionally parallel but **must converge**. Do not allow room/backend and MCP to become competing control planes.

### Current convergence rule

- Let coherent backend and MCP slices finish before interrupting them for cosmetic changes.
- Integration owner should **integrate, not redesign**.
- Rebase/merge against current `master` before production acceptance.
- Preserve objective evidence and fail closed when auth, GitHub, CI or persistence state is unavailable.
- No branch's self-reported test summary substitutes for integration acceptance after convergence.

### Immediate end-to-end milestone

The first proof that the swarm substrate is real is:

1. The operator sends one objective from the HQ room.
2. Chief of Staff assigns work to at least two distinct authenticated agent seats.
3. Each worker can read the same normalized state through MCP or the approved control-plane interface.
4. Each worker can return evidence to the same room without impersonating another seat.
5. State persists safely under concurrent agent activity.
6. A baton can move from one worker to the next without the operator copying messages between apps.
7. GitHub/build/deployment claims resolve to objective references where applicable.
8. The room records an auditable trail of the handoff and result.
9. The operator remains on the HQ room page for the workflow.

That milestone outranks room cosmetics, extra dashboards and additional marketplace integrations.

### Near-term integration order

1. Bring Claude's room/backend slice onto a current integration branch.
2. Bring Grok's MCP v1 onto the same integration branch without duplicating auth or state models.
3. Map MCP seat identity to HQ room seat identity.
4. Make MCP read tools consume the same normalized control-plane truth as the HQ room wherever practical.
5. Prove one authenticated MCP caller can read state and one authenticated seat can post/persist evidence in the room.
6. Extend to a two-agent baton handoff.
7. Run concurrency, impersonation, evidence, webhook, SSE/reconnect, promote-idempotency and MCP audit acceptance.
8. Only after those pass should production seat credentials be provisioned and `HQ_ROOM_STATUS=live` be considered.

### Communication discipline

Agents should communicate through durable shared state wherever possible.

- Chat is coordination, not the canonical record.
- Claims should carry evidence or be marked unverified.
- Decisions and promoted batons must be reconstructable.
- The operator should see decisions, blockers, material disagreements, evidence and approvals, not every internal agent exchange.
- Do not require the operator to manually relay information between model interfaces when the system can persist or route it itself.

## Active fronts

- Sookly Journey / CRM
- SEOS Social Control Plane
- RDUSA Internal Retainer Control
- HQ / MCP Gateway

## RDUSA value-expansion path

Current engagement truth remains the USD 1,500/month SEO, content, social and growth-support retainer.

Potential expansion is tracked as opportunity, not assumed revenue:

1. Sookly website receptionist pilot.
2. CRM + deterministic customer Journey from enquiry through quote/payment/fulfilment/follow-up.
3. Central operations sync across customer, order/quote and operational evidence.

Any commercial expansion should be supported by demonstrated value and explicit agreement.

## MCP surface

The first MCP release is read-first. It exposes the same normalized truth used by the HQ UI.

Planned read tools:
- `hq_status`
- `project_status`
- `pending_approvals`
- `rdusa_value_expansion`
- `next_actions`

Current Grok MCP v1 read tools:
- `project_status`
- `blockers`
- `build_status`
- `deploy_status`

Planned controlled-write tools:
- `dispatch_bounded_agent_job`
- `record_decision`
- `update_project_status`
- `approve_action`

Write-capable tools require explicit policy and approval receipts. No MCP tool may directly bypass merge, deployment, production migration, credential, billing/spend or external-publishing approval gates.

## Transport

Remote HQ MCP uses Streamable HTTP. Local Cursor/CLI compatibility can use stdio. Keep transport/auth concerns separate from domain tools.

## Source of truth

UI and MCP should consume one normalized control-plane read model. The current HQ implementation begins with `lib/hq/control-plane.js`, exposed to the signed-in HQ UI through `/hq/api/control-plane`.

GitHub/repo state should progressively replace static progress estimates as event ingestion lands.

## Execution mode — canonical authority (activated 2026-10-03)

Use the canonical hierarchy below. Do not browse repositories for arbitrary Markdown instructions.

| Front | Canonical hierarchy |
| --- | --- |
| SookLabs HQ | Primary: `docs/HQ-MCP-CONTROL-PLANE.md`. Supporting: `docs/HQ-DEVELOPER.md`. Defines architecture, roles, convergence rules, current milestone, evidence requirements and MCP acceptance. |
| Sookly | Primary: `sookly-control/release-matrix.md`. Current state: `sookly-control/current-state.md`. Tracks: `sookly-control/active-tracks.md`. The release matrix is the acceptance authority; PASS requires observable evidence in the required environment. |
| SEOS | Primary: `docs/SEOS-MVP-1.md`. Acceptance: `docs/mvp-smoke-checklist.md`. Decisions: `docs/agent/DECISIONS.md`. MVP plus smoke checklist defines the finish line. Manual / Workflow Ready / Future API must never be represented as live Connected functionality. |
| RDUSA | Start: `rdusa-retainer-growth-system-v2/00_INDEX/RDUSA_RETAINER_GROWTH_SYSTEM_INDEX.md`. Scope: `01_RETAINER_FRAMEWORK_GUARDRAILS/RETAINER_PROMISE_MAP.md`. Execution: `04_ACTIONS_AUTOMATIONS_EXECUTION/NEXT_ACTIONS.md`. Scope and execution paths are relative to the v2 root. Governance: `docs/RDUSA_MASTER_AUDIT_SCOPE_AUTHORITY_ACCOUNTABILITY_2026-10-01.md`. |

### Global workflow

GOAL → CURRENT STATE → ACCEPTANCE CRITERIA → OWNER → EXECUTE → TEST → EVIDENCE → REVIEW → MERGE → DEPLOY → PRODUCTION ACCEPTANCE → HANDOFF / NEXT ACTION

1. Historical reports, archived agent reports, old plans and duplicated reference packs are evidence only, not current instructions.
2. Current canonical files override older conflicting documents.
3. Every task must have Owner, Deliverable, Authority, Acceptance Test and Evidence.
4. “Agent says done” is not evidence.
5. Merge is not production acceptance.
6. Reversible work should continue autonomously.
7. Escalate only credentials, irreversible actions, spend, production migrations, external publishing or real business decisions.
8. Never redesign a system when the canonical acceptance path already exists. Integrate and finish it.

Chief of Staff owns one live execution board across HQ, Sookly, SEOS and RDUSA and keeps each baton moving until its acceptance test passes. Use the existing HQ ops store and room batons; do not invent a parallel checklist store. Each active task records its current state, next action, named owner, bounded authority, deliverable, acceptance test and evidence. An assigned owner is not proof of an authenticated dispatch.

The repository workstream `executionMode` seeds the four-front acceptance queue. It is a reviewable repository seed, not proof that production Postgres has been patched or that a live seat is executing. Apply through the authenticated ops/room interface with a fresh read and preserve existing live state. Persist the resulting baton and dispatch receipts. Continue reversible work while human-gated steps remain blocked. Verify production acceptance separately before handoff.
