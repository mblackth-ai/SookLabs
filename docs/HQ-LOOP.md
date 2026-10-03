# HQ execution loop

Subordinate to `docs/HQ-MCP-CONTROL-PLANE.md` § "Execution mode". That section and each front's canonical files decide what "done" means. This file covers only how the loop moves work toward those finish lines. If the two conflict, the control-plane doc wins.

## What it is

The loop is a bounded worker that takes tasks from the room and the ops board through the global workflow:

GOAL → … → EVIDENCE → REVIEW → MERGE → DEPLOY → PRODUCTION ACCEPTANCE

- **It runs without a browser.** Each wake runs one tick. A tick claims due tasks under a database lease, runs one step per task, and commits the result only while it still holds the lease.
- **It hands work out and reads evidence.** It posts batons to seats and reads evidence from GitHub and production.
- **It never merges, deploys, migrates, publishes or changes authority.** Those stay with Mark (see Escalation gates).

The ops `workstreams.executionMode` items stay the board of record. The loop tables hold only execution mechanics: leases, retries, evidence rows and dispatch receipts. Seeding reads the ops items fresh and creates loop tasks. It never edits ops.

## Code map

| File | Role |
| --- | --- |
| `lib/hq/loop-policy.js` | Fronts, canonical sources, standing authority per front, seat capabilities, escalation gates, `authorize()`. Policy version `POLICY_VERSION`. |
| `lib/hq/loop-skills.js` | Reviewed skill catalog: id, version, owner, trigger, inputs, outputs, verification, failure mode. |
| `lib/hq/loop-store.js` | Postgres tables and the claim/commit primitives. Plain `pg`. |
| `lib/hq/loop-worker.js` | `tick()` and the step functions. Deterministic: there is no model call in the loop itself. |
| `lib/hq/loop-service.js` | App side: board read model, seeding, operator controls, event wakes. |
| `app/hq/api/room/loop/*` | `tick` (worker secret), `board` (seats and Mark), `tasks` (Mark creates, agents propose), `tasks/[id]/control` and `control` (Mark), `seed` (Mark). |
| `components/hq/AcceptancePanel.jsx` | Acceptance & Sources panel. It sits beside the chat on desktop and is a tab on mobile. |
| `scripts/hq-loop-migrate.mjs` | Additive table creation. Refuses any non-local database without `--approved-by`. |
| `scripts/hq-loop-worker.mjs` | Optional long-running worker for a host that stays up. |
| `.github/workflows/hq-loop-wake.yml` | Free scheduled wake every 5 minutes. |

## Tables (created only by the migration script)

| Table | Contents |
| --- | --- |
| `hq_loop_tasks` | One row per task: front, owner/reviewer seat, deliverable, acceptance (test, environment, smoke), authority (policy version, approver, approval ref, scope), refs, stage, status, next skill/action, blocker. Mechanics: `lease_owner`, `lease_until`, `fence`, `attempts`, `next_wake_at`, `waiting_on`, `resource_key`, `paused`, `revoked`. |
| `hq_loop_evidence` | Observed facts with kind, environment, revision, label and verdict. |
| `hq_loop_events` | Audit trail. `dedupe_key` is UNIQUE, so a replayed webhook or control is recorded once. |
| `hq_loop_effects` | One row per external side effect `(task_id, effect_key)`, so a replay never posts twice. |
| `hq_loop_budget` | Per-day counters (`dispatch`, `github-read`). |
| `hq_loop_workers` | Last heartbeat per worker. |
| `hq_loop_control` | `loop.paused`. |

Evidence labels are explicit:

- CI results are "CI evidence, not production".
- Deployment records are "deployment record, not acceptance".
- Seat replies are "a claim, not proof".

Only a passing smoke test with `acceptance.environment = "production"` moves a task to `production_accepted`.

## Durability

| Concern | Mechanism |
| --- | --- |
| Wake | GitHub Actions every 5 min. Event wakes on a seat reply to a loop dispatch and on a GitHub webhook for a task's repo. Optional `scripts/hq-loop-worker.mjs`. |
| Exclusive claim | `FOR UPDATE SKIP LOCKED`. A lease (`HQ_LOOP_LEASE_MS`) and a fence that increases by one per claim. |
| Stale worker | A commit needs a matching `fence`, a matching `lease_owner` and `NOT revoked`. Anything else is rejected and logged as `stale-commit-rejected`. |
| Operator wins | Pause, retry, cancel and revoke bump the fence and clear the lease. |
| Crash or restart | The lease expires and the next worker reclaims the task. The dispatch message and dispatch IDs are derived from the task and prompt hash. Before posting, a replay checks `hq_loop_effects` and the room for the message, so nothing is posted twice. |
| Retries | Exponential backoff from `HQ_LOOP_BACKOFF_BASE_MS` up to `HQ_LOOP_BACKOFF_MAX_MS`. At `max_attempts` the task is blocked with "Retry exhausted after N attempts: …". |
| GitHub rate limit | Not counted as an attempt. The task sleeps until `x-ratelimit-reset`. |
| Timeouts | Each step is cut at `HQ_LOOP_STEP_TIMEOUT_MS`. Each tick is cut at `HQ_LOOP_TICK_BUDGET_MS` / `HQ_LOOP_STEPS_PER_TICK`. |
| Waiting on a seat | `waiting_on` = dispatch id. A watchdog re-checks every `HQ_LOOP_WAIT_WATCHDOG_MS`. If the seat is offline, failed or timed out, the task is blocked with "No reply was invented". |
| Shared resources | Two tasks with the same `resource_key` never hold live leases at the same time. |
| Independent fronts | A blocked task never blocks a task on another front. |

## Authority

- **Standing authority per front** lives in `FRONTS[].allowedSkills` and `prohibited`. RDUSA has no `scoped-implementation`.
- **Skill checks.** `authorize()` runs before every skill. It refuses on: unknown front or skill, a skill the front doesn't allow, a seat without the required capability, a revoked task, or a policy-version change.
- **Proposals.** Agent seats can only propose (`status: proposed`). Nothing runs until Mark approves. Agents can't approve, control, seed or pause.
- **Escalation gates.** The loop never crosses these: credentials, spend, irreversible actions, production migrations, external publishing, customer communication, business decisions, authority changes. Merges and deploys stay with Mark. The loop waits for them and reads the result.

## Skills and memory

The catalog is code-reviewed (`lib/hq/loop-skills.js`). It has six skills:

- acceptance-gap-triage
- evidence-collect
- failing-check-diagnosis
- scoped-implementation
- review-request
- deploy-verify

Nothing is installed at runtime.

Memory is kept separate by kind:

- **Canonical files are authority.** They are re-read with their SHA on every triage. A change is logged as `authority-source-changed`.
- **Loop tables are working state.**
- **Room messages are conversation.**

Seat replies are never treated as evidence on their own: the worker parses the refs in a reply and re-reads them from GitHub.

## OpenClaw reference

Reference only: openclaw/openclaw@28a6f71449aa5542c9fb825dcb3423dfbb7abf82. It is not installed and not a dependency.

| Adopted (re-implemented here) | HQ-specific / not adopted |
| --- | --- |
| Standing orders: scope, triggers, approval gates, escalation → `FRONTS` + `ESCALATION_GATES` | AGENTS.md persona/bootstrap files |
| Writer-claim fencing (`activeWriterRunId`) → `fence` + `lease_owner` | ClawHub / runtime skill installs |
| Heartbeat "NO_REPLY" discipline → idle ticks post nothing | Agent self-modifying memory |
| Per-agent skill allowlists → `SEAT_CAPABILITIES` + `allowedSkills` | Gateway / channel plugins |

## Environment

| Variable | Default | Purpose |
| --- | --- | --- |
| `HQ_LOOP_WORKER_SECRET` | — | Bearer for `POST /hq/api/room/loop/tick`. At least 32 characters. Also the GitHub Actions secret. |
| `CRON_SECRET` | — | Also accepted by `GET …/loop/tick`, for a Vercel cron if one is ever added. |
| `HQ_GITHUB_TOKEN` | — | Read token for contents, pulls, checks and deployments. Without it, GitHub allows 60 requests/hour per IP and the loop waits on the rate limit. |
| `HQ_LOOP_STEPS_PER_TICK` | 4 | |
| `HQ_LOOP_TICK_BUDGET_MS` | 40000 | |
| `HQ_LOOP_STEP_TIMEOUT_MS` | 20000 | |
| `HQ_LOOP_LEASE_MS` | 60000 | |
| `HQ_LOOP_DISPATCHES_PER_DAY` | 20 | |
| `HQ_LOOP_GITHUB_READS_PER_DAY` | 2000 | |
| `HQ_LOOP_WAIT_WATCHDOG_MS` | 1800000 | |
| `HQ_LOOP_BACKOFF_BASE_MS` / `HQ_LOOP_BACKOFF_MAX_MS` | 60000 / 1800000 | |

GitHub Actions repository secrets: `HQ_LOOP_TICK_URL` (`https://hq.sooklabs.com/hq/api/room/loop/tick`) and `HQ_LOOP_WORKER_SECRET`. The workflow logs only the HTTP status and step count.

## Runbook

1. **Install (production migration, Mark approves):**
   ```
   HQ_DATABASE_URL=<prod> node scripts/hq-loop-migrate.mjs --approved-by mark
   ```
   It is additive (`CREATE … IF NOT EXISTS`). Until it runs, every loop endpoint reports `installed: false` and the panel says so.
2. **Secrets (Mark):** set `HQ_LOOP_WORKER_SECRET` and `HQ_GITHUB_TOKEN` in Vercel, and the two Actions secrets.
3. **Seed:** in the panel, click "Load ops board items", or `POST /hq/api/room/loop/seed` as Mark. If the production ops store has no `executionMode` items, the result says `available: 0`. Apply the repository seed through the ops interface first.
4. **Watch:** the panel shows worker health (`ok`, or `stale` after 10 minutes without a tick), budgets, and each task's stage, blocker and evidence.
5. **Stop:**
   - "Pause loop" in the panel, or `POST /hq/api/room/loop/control {"action":"pause-all"}`. The next tick does nothing.
   - Per task: pause, cancel or revoke.

## Rollback

| Step | Effect |
| --- | --- |
| Pause loop | Immediate, reversible. |
| Disable `hq-loop-wake.yml`, or delete its secrets | Stops scheduled wakes. Event wakes only re-run tasks that are already due. |
| Revert the PR / redeploy the previous Vercel deployment | The room keeps working. Loop tables are inert without the code. |
| Tables (only if Mark asks) | `DROP TABLE hq_loop_tasks, hq_loop_evidence, hq_loop_events, hq_loop_effects, hq_loop_budget, hq_loop_workers, hq_loop_control`. Room messages and dispatches the loop posted stay as history. |

## Tests

```
HQ_TEST_DATABASE_URL=postgres://… node --test --test-concurrency=1 lib/hq/*.test.js
```

`lib/hq/loop.test.js` covers:

- the full flow from triage to production smoke;
- a stale commit being rejected, and crash recovery with no duplicate dispatch;
- front independence and the resource lock;
- an offline seat, an invalid capability, the budget, pause, revoke, backoff and exhaustion, timeouts, the rate-limit wait, routing with no refs, duplicate events, and a failed smoke that stays failed.
