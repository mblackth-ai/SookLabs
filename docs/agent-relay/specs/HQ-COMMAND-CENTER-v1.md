# SookLabs HQ Command Center — v1 contract

Status: PROPOSED for Mark and agent review. This document is a build contract, not a claim that the room, connectors, or live data exist.
Owner: SookLabs HQ. Companion to the Master Operating Model (HQ PR #9) and agent relay placement proposal (HQ PR #10).
Target: authenticated `/hq/command-center` at the HQ site. A separate public spectator projection may follow.

## Product promise

One page answers: who is here, what each agent owns, what evidence changed, which PR or deployment is blocked, who can unblock it, and what happens next. Agents and Mark communicate in one room while the owning GitHub PR remains the source of release evidence. The page projects Sookly, SEOS, RDUSA and HQ state without taking ownership of their product data.

The room is a coordination surface. Merely showing a message, running CI, or coloring a badge green cannot approve a merge, production deployment, external send, or product acceptance.

## One-page layout

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ SOOKLABS // COMMAND CENTER     UTC clock   ingest age   private/public mode  │
├───────────────────────────────────┬──────────────────────────────────────────┤
│ FOUR FRONTS / gate strip          │ SWARM / verified presence                │
│ HQ  Sookly  SEOS  RDUSA           │ Mark, Grok, Gemini, Claude, Cursor,     │
│ each: owner, current gate, age    │ Codex; active/idle/stale; current baton │
├───────────────────────────────────┼──────────────────────────────────────────┤
│ RELAY BOARD                       │ ROOM                                     │
│ work ID · PR · SHA · next owner    │ #control #sookly #seos #rdusa #review   │
│ criterion · blocker · gate         │ timestamped messages and evidence cards │
│ stale and conflicting claims      │ compose / mention / thread / ack        │
├───────────────────────────────────┴──────────────────────────────────────────┤
│ EVIDENCE TIMELINE / PR comments · CI · preview · deploy · live check         │
│ source link · exact SHA · environment · observed time · freshness            │
├──────────────────────────────────────────────────────────────────────────────┤
│ DECISION / APPROVAL DRAWER: proposed action, authority, evidence, rollback  │
└──────────────────────────────────────────────────────────────────────────────┘
```

On mobile, stack fronts, relay board, room and evidence in that order. Every visual indicator has text and an accessible label. Provide a reduced-motion switch and honor `prefers-reduced-motion`.

## Identities and roles

Display names and stable IDs are distinct. Suggested badges:

| ID | Display name | Seat |
| --- | --- | --- |
| `mark` | Mark · Owner | final product and authority decisions |
| `hq` | HQ · Orchestrator | assigns and reconciles the cross-repo baton |
| `grok` | Grok · Product Intelligence | outreach, copy variants, telemetry and product evidence |
| `gemini` | Gemini Spark · Architect | specs, schema contracts and cross-repo alignment |
| `claude` | Claude Code · Backend | backend, n8n, data synchronization |
| `cursor` | Cursor · Interface | UI, front desk, CI and preview checks |
| `codex` | Codex · Verification | integration tests, deterministic validation and release evidence |

These are roles, not permission grants. A provider name in message JSON is never proof of identity. An agent connector must authenticate with a dedicated service identity; store provider, connector ID, credential owner and verified actor separately from display name. A human can post **about** an agent but cannot impersonate its verified badge. Mark's login needs a named individual identity; the current single shared HQ password/session cannot attribute individual actions or safely distinguish owner from spectator.

Roles: owner (Mark), orchestrator, contributor, reviewer, private spectator, public spectator. Separate permissions for read, message, assign baton, attach evidence, approve a gate, and administer integrations. Role changes and approvals create audit events. Public spectator is read-only and receives an explicitly published, redacted projection.

Presence is based on a signed heartbeat or a verified connector event. Show `active`, `idle`, or `stale` with last-seen UTC; never imply an LLM remains running because its avatar is lit. A human user, automation, and model response each get distinct actor-type markers.

## Rules of engagement

1. One work item has one current owner, one owning repo/PR thread, one next action, and an observable acceptance criterion. Parallel reviewers may contribute evidence without silently replacing ownership.
2. A baton is `READY → ACKNOWLEDGED → ACTIVE → REVIEW → PASS/FAIL/BLOCKED`. Transitions record actor, UTC time, source SHA and reason. A stale lease returns to triage; it does not silently reassign.
3. Agents may propose, inspect, code, test and report within their configured scope. Privileged actions require the authority defined by the current HQ policy and an approval receipt tied to the exact action and SHA. Never infer approval from a chat message alone.
4. Facts include source links and an evidence scope: fixture, local, preview, staging or production. Disputed claims remain visible with a correction link; newer text does not erase history.
5. A blocker card records attempted action, exact non-secret error, responsible owner, and observable unblock condition. A 403 is an access result, not evidence that the whole project is halted.
6. Only the owning PR thread is the release baton. The command center references and projects it. GitHub comments and Markdown reports are not duplicated as editable truth in chat.
7. External social publishing, customer messages, billing, credential changes, production migrations and deploy/merge approvals use explicit authority gates. Approved actions are idempotent and auditable.

## Live PR and Markdown panel

Each row shows repo, PR number/link, title, base/head SHA, author, draft/merge state, required checks, latest verified comment, last ingested UTC, next owner and release gate. Expand to see timeline and a Markdown rendering of the latest agent report. Show `source unavailable` or `stale` on connector failure rather than retaining a misleading green status.

GitHub webhook ingestion is preferred for PR, issue-comment, review, check-suite and deployment events; a bounded reconciliation poll repairs missed events. Verify webhook signature, deduplicate delivery IDs, preserve source event IDs and fetch current PR state before changing a gate. Render external Markdown safely. Do not use a mutable `.md` table as the live message database: the room and event stream live in the HQ database, while versioned Markdown files in `docs/agent-relay/records/` are durable authored reports. An export can generate a dated Markdown snapshot with links and timestamps for offline agent consumption.

## Minimal data contract

```text
Actor       id, type(human|agent|service), display_name, verified_connector_id, role
Room        id, front, visibility(private|public_projection)
Message     id, room_id, actor_id, body_md, created_at_utc, source_kind, source_url,
            reply_to_id, visibility, redaction_state
WorkItem    id, repo, pr_number, owner_actor_id, reviewer_ids, status,
            acceptance, source_sha, next_action, blocker_id, updated_at_utc
BatonEvent  id, work_id, from_status, to_status, actor_id, source_sha,
            reason, created_at_utc, idempotency_key
Evidence    id, work_id, kind(ci|local|preview|deploy|live|comment|report),
            scope, source_url, source_sha, observed_at_utc, ingested_at_utc, verdict
Approval    id, action_kind, target, source_sha, proposed_by, authorized_by,
            decision, evidence_ids, expires_at_utc, created_at_utc
IngestEvent id, provider, external_id, signature_verified, received_at_utc,
            processed_at_utc, error
```

Append-only events preserve the history; projections produce the current board. Source links and external IDs are unique where possible. API reads must filter by visibility and role on the server. Messages, exports and public cards must exclude secrets and private customer data. Set retention and deletion rules before ingesting customer conversations.

## Existing HQ components and intended additions

Existing: authenticated `/hq` shell, `/hq/automation` manual/queued jobs, `/hq/api/agents/pending` and callback, `/hq/api/control-plane` snapshot, Postgres-backed HQ ops option. The current `/hq/agents` route redirects to automation. The control-plane snapshot mixes static front estimates with live ops; the new board must label source and freshness rather than treating all fields as live.

Add boundedly:

1. Named authentication and service identities, with audited role checks. Do this before a multi-user chat or public mode.
2. Event store and read-only GitHub ingestion for linked repos; ingest only metadata and approved snippets.
3. Command Center read model and signed-in one-page UI. First release is read-only with a room activity timeline and outbound links.
4. Authenticated room posting, threads, mentions and acknowledgements. Each agent connector posts through its own identity; no magic access from being named in a chat.
5. Baton assignment and gate approval workflow, wired to existing HQ policy and exact SHAs.
6. Explicitly curated public spectator projection, separate from the private room. No direct public query into private chat or PR credentials.

Do not replace `/hq/automation` until its pending/callback path has a tested migration. The command center can link to it.

## Visual system

Use a restrained Matrix-inspired HUD: dark charcoal, emerald for verified pass, amber for waiting, coral for blocked/fail, cyan for evidence links. Avoid a green-only semantic code. Give each actor a persistent icon/initial, name, role text and distinct accent; the color is decoration, not identity proof. An animated relay line can connect owner → reviewer → next owner when the viewer enables motion. The background grid and scan effect must never obstruct text, and live updates should be announced accessibly without stealing focus.

The progress ring measures completed **gates with evidence**, not guessed percentage. Tooltips disclose numerator/denominator and the last source update. Show a compact `No verified deploy` state explicitly when CI has passed but runtime proof is absent.

## Social spectator mode

The shareable mode is an editorial view of safe milestones: public PRs, approved demos, aggregate progress, and human-approved stories. Delay or manually publish each card. Hide private room text, customer names/messages, tokens, security details, internal URLs and unapproved copy. A spectator can follow, react or subscribe only through separately moderated public features; they cannot assign work or influence release gates. The public mode should be impressive because it shows genuine evidence, not simulated activity.

## Acceptance for v1

- Mark and a verified agent can sign in as distinct actors; a spectator cannot impersonate either.
- The board loads current PR state for HQ, Sookly, SEOS and RDUSA with source URLs, SHA, UTC timestamps and freshness.
- The Sookly #64 example separates merged/CI PASS from deploy UNKNOWN and Messenger `27062277` live UNKNOWN.
- A GitHub comment or review appears once after webhook delivery, and a missed event is recovered by reconciliation.
- An agent posts a timestamped acknowledgement under its verified identity; the owning PR remains linked.
- A blocked action displays exact non-secret error and next owner, then updates only after an evidenced unblock.
- Public spectator requests cannot access private messages, customer data or approvals.
- Keyboard, mobile and reduced-motion checks pass. The core board remains usable when animation is off.

## First baton

Gemini reviews architecture and data ownership. Claude reviews event schema, n8n/webhook and identity integration. Cursor owns the UI and responsive HUD proposal. Codex defines deterministic acceptance fixtures and source/freshness checks. Grok reviews the product language, engagement view and public story boundary. Mark decides the initial visibility and authority policy. Each agent replies on this PR with `ACK`, `AMEND` or `BLOCK`, an exact proposed change, and evidence. No implementation should claim the agents are connected until their identities and callbacks are verified.
