# Engine integration preflight

Status: **design only**. This document is not production policy, not acceptance, and not a merge instruction.
Date: 2026-10-15
SookLabs `master` verified at `8c6d83a411a9ed93f8dddc07558eb052c017967e` (merge of PR #38, 2026-10-09).
Author of this plan: Cursor. Implementation of the SL tasks below is for other seats. Cursor does not review its own later diffs; Claude does architecture and security review, and a fresh Cursor session validates integration only after that review.

Draft governance PRs are **guidance only**. Do not merge them and do not cite them as production policy:

| PR | Head observed this run | Role |
| --- | --- | --- |
| [SookLabs #42](https://github.com/mblackth-ai/SookLabs/pull/42) | `d493ec47e6037df4815e1f365dbc65f7d9d0c506` on `docs/ecosystem-alignment-20261015`, draft, mergeable | Proposed cross-repo contract. Read via the GitHub API. |
| [SEOS #12](https://github.com/mblackth-ai/SEOS/pull/12) | Open draft, checks green. SEOS main `f4505d4` (pass `bc-ccf9eeca`) | Governance only. Do not merge from this preflight. |
| [rdusa #6](https://github.com/mblackth-ai/rdusa/pull/6) | One of six open drafts on rdusa main `839532a` (pass `bc-d0a012b4`). No CI on the repo | Governance only. Do not merge. |
| [sookly-omnichat #93](https://github.com/mblackth-ai/sookly-omnichat/pull/93) | Repo verified at main `777ce576` (pass `bc-79f72035`). The pass did not quote #93's diff. 36 open PRs, including stale #3 and red or stale drafts #14, #16, #18–#25, #58 | Leave the governance draft unmerged. Do not treat it as the kanban, which is already on main. |

No production code, migrations, deploys, or external writes were made while writing this file.

## How to read the labels

| Label | Meaning |
| --- | --- |
| PRESENT | Read in SookLabs `master` at `8c6d83a` this run. |
| RECORDED | Written in a SookLabs file about another repo or a live system. The file exists. The remote claim was not re-checked against that system this run. |
| PROPOSED | A design in this document or in unmerged guidance. Not built. |
| UNKNOWN | Looked for in a verification pass and not identified. |

Agent reports are claims. A green CI URL stored in `data/hq/ops.json` is RECORDED evidence of a past run, not a fresh production PASS.

## 1. What this run could and could not see

This environment's GitHub credential cannot clone the private sibling repos. Three later read-only passes did:

| Repo | Pass | Main |
| --- | --- | --- |
| SEOS | `bc-ccf9eeca` | `f4505d4` |
| rdusa | `bc-d0a012b4` | `839532a` |
| sookly-omnichat | `bc-79f72035` | `777ce576` |

Vercel MCP on team `mblackth-ai's projects` returned zero projects. DigitalOcean Apps list was empty. Live deploy SHAs were not in those passes. Quo MCP is unauthenticated. Quo and Xero have no application code in SookLabs, SEOS, rdusa, or sookly-omnichat (rdusa has docs only). Sookly has no migration pending in git. Whether production applied the 3 Oct migrations is unconfirmed; PR #62 claims they were applied.

Public HTTP this run (no login, no mutation):

| Host | Observed | Deployed SHA |
| --- | --- | --- |
| `https://hq.sooklabs.com` | HTTP 200, `server: Vercel`, title "SookLabs HQ" | Live SHA not in the passes |
| `https://seos.sooklabs.com` | HTTP 200, `server: Vercel`, title "SookLabs Expansion OS". SEOS README names this Vercel host. A droplet workflow also exists | Live SHA not in the passes. Repo main is `f4505d4` |
| `https://www.sookly.co/en` | HTTP 200 after redirects from `sookly.co`, `server: Vercel` | Live SHA not in the passes. Repo main is `777ce576` |
| `https://retaildisplayusa.com/` | HTTP 202 from nginx, SiteGround captcha (`sgcaptcha`) | Joomla client is `rdusa/scripts/joomla-publisher.mjs` (API v1). Live article id was not fetched |

`lib/hq/control-plane.js` still contains a retainer amount field (`currentRetainerUsd`). This preflight does not copy that number. New docs, PRs, and room posts must not copy commercial figures. SookLabs #42 already proposes that rule; it is not merged.

## 2. Verified architecture (SookLabs `8c6d83a`)

HQ is the founder control plane inside this Next.js app. Domain products stay in their own repos. `docs/HQ-MCP-CONTROL-PLANE.md` is the HQ domain authority. `docs/HQ-DEVELOPER.md` is the supporting map. `lib/hq/loop-policy.js` (`POLICY_VERSION` `2026-10-03.1`) names the other three fronts and forbids the loop from credentials, spend, irreversible actions, production migrations, external publishing, customer communication, business decisions, and authority changes.

```
Mark (HQ session or seat "mark")
  → room post / baton                         lib/hq/swarm-routing.js decideRoute
  → hq_room_dispatches (one row per source message + seat)
  → seat inbox: HTTP, webhook adapter, or MCP room_inbox → room_claim → room_post
  → evidence refs checked only when HQ_GITHUB_TOKEN is set (docs/HQ-DEVELOPER.md)
  → promote (Mark, HTTP only) writes room/log, never master

SEOS (main `f4505d4`, pass `bc-ccf9eeca`)
  ← HQ server reads GET /api/authority/hq-summary     lib/hq/authority-client.js
  ← HQ server reads GET /api/analytics/hq-summary     lib/hq/analytics-summary.js
  ← HQ server can PATCH authority approvals           lib/hq/authority-client.js decideAuthorityApproval
  Bearer SEOS_HQ_API_TOKEN. Base URL SEOS_INTERNAL_URL or NEXT_PUBLIC_SEOS_URL or https://seos.sooklabs.com

Owner room (HQ database, tables only after Mark's install button)
  → /hq/client bound to the owner key's business_slug, not the URL
  → rankings projected from the SEOS analytics summary; HQ does not store them
```

Two MCP servers exist. They are not interchangeable.

| Surface | PRESENT tools | Seat model |
| --- | --- | --- |
| Room MCP `app/hq/api/room/mcp/route.js`, contract `lib/hq/room-mcp-rpc.js` | `room_read`, `room_board`, `room_inbox`, `room_claim`, `room_post`, `room_enroll_pending`, `room_enroll_decide`, `hq_status`, `hq_next_actions` | Seat connection as Bearer. Author stamped from the key. |
| Internal MCP `services/sooklabs-mcp/src/tools.js` | `project_status`, `blockers`, `build_status`, `deploy_status` | OAuth subject → seat registry. Hard-locked to `mblackth-ai/SookLabs`. |

Room MCP explicitly has no promote, broadcast, merge, deploy, or publish tool (`lib/hq/room-mcp.js` `BLOCKED_TOOLS`, instructions in `room-mcp-rpc.js`). Planned control-plane write tools in `docs/HQ-MCP-CONTROL-PLANE.md` (`dispatch_bounded_agent_job`, `record_decision`, `update_project_status`, `approve_action`) are **absent**. Do not add them as a side effect of SL-001.

Channels PRESENT in `lib/hq/swarm-contract.js`: `room`, `rdusa`, `jaka`. Codex's review of SookLabs #33, quoted in `docs/relay/10-claude-check-in-2026-10-05.md` §11, still holds in spirit: any seat key can read those channels. They are internal operator namespaces, not tenant isolation. Owner rooms are the client boundary.

Content pipeline PRESENT as a pure module only: `lib/hq/content-draft.js`. Sites `rdusa` and `sooklabs`. Statuses `draft` → `ready-for-review` → `approved` → `published`. Seats: author `gemini`, editor `claude`, approver `mark`, publisher `codex`. Approval stores `approved_hash` of the normalized body. Publish requires that hash and a numeric `joomla_id`. There is no Joomla client, no content route, and no database table for drafts in this repo.

Analytics PRESENT as a fail-closed client. Missing or placeholder `SEOS_HQ_API_TOKEN` makes no request and returns `configured: false` (`lib/hq/analytics-summary.js`). The tested payload shape is `{ generatedAt, workspaces: [{ slug }] }` plus sparkline points of `averagePosition`. No sales, revenue, or attribution fields exist in that client.

Auth PRESENT:

| Actor | Mechanism | File |
| --- | --- | --- |
| Mark, HQ UI | HMAC session cookie | `lib/hq/auth.js`, `middleware.js` |
| Agent seat | Per-seat connection secret | `lib/hq/seat-auth.js` |
| Business owner | Separate httpOnly `hq_owner` cookie; hashes only in Postgres | `lib/hq/owner-portal.js` |
| SEOS summary calls | Server-side bearer | `authority-client.js`, `analytics-summary.js` |
| GitHub room webhook | HMAC over raw body | `lib/hq/github.js` |

On master, `middleware.js` treats the whole `/hq/api/client/` prefix as open (session not required). The route handlers check themselves today. Unmerged #40 narrows that list. That narrowing is not on master.

Tests PRESENT (no `npm test` script on master):

```
node --test lib/hq/*.test.js
HQ_TEST_DATABASE_URL=postgres://… node --test --test-concurrency=1 lib/hq/*.test.js
cd services/sooklabs-mcp && node --test test/*.test.js
npm run lint
npm run build
```

Postgres tables are created from JavaScript, not Prisma. `data/hq/schema.sql` only creates `hq_ops`. Room, loop, enroll, and owner DDL live in `lib/hq/swarm-pg.js`, `loop-store.js`, `seat-enroll.js`, and `owner-portal.js`. Owner tables are the exception: they are not created on first use; `migrateOwnerPortal` runs only from Mark's button.

`lib/hq/four-fronts.js` still publishes static progress and old branch names (`cursor/operational-journey-engine-v1`, `cursor/seos-social-control-plane-mvp1`, `cursor/rdusa-internal-retainer-control-v1`, `cursor/hq-mcp-gateway-v1`). Treat that file as a stale estimate. `lib/hq/room-summary.js` already labels the finish line "Not acceptance."

## 3. Component reuse matrix

| Need | Decision | Where | Why |
| --- | --- | --- | --- |
| Founder oversight, approvals, audit | Reuse | HQ room, ops store, `getControlPlaneSnapshot` | Already the control plane. |
| Durable agent handoff | Extend | `normalizeBaton` + existing `hq_room_dispatches` | Seats, claim, and evidence refs exist. SL fields are stripped today. |
| New SL task database | Defer / do not build | — | `docs/HQ-MCP-CONTROL-PLANE.md` forbids a parallel checklist store. |
| MCP write tools for merge, deploy, publish | Defer | Room MCP blocked list | Human gates stay outside MCP. |
| Internal MCP GitHub reads | Reuse | `services/sooklabs-mcp` | SookLabs repo only. Do not point it at SEOS. |
| Joomla draft → publish | Extend later, read-only first | Approval rule is `lib/hq/content-draft.js`. The API client is `rdusa/scripts/joomla-publisher.mjs` (Joomla API v1). SEOS has no Joomla code | SL-011 wraps a read on the rdusa client. Do not add a second client in SEOS. |
| GSC / GA4 numbers inside HQ | Reuse the SEOS summary | `lib/hq/analytics-summary.js`, `/hq/reports` | HQ must not add a second Google pull. |
| Shared metric definitions | Extend | New pure checker beside the analytics client | Reject attribution claims. Do not invent a warehouse. |
| SEOS Knowledge Base, Refactor Studio, social connectors | Reuse | Present on SEOS main. Connectors registry is on main. Lifecycle tests are only on `cursor/seos-social-control-plane-mvp1` @ `a256ad2`. Nothing writes knowledge-kind state | Do not rebuild them in HQ. |
| Sookly receptionist, inbox, contacts, kanban | Reuse | `ContactsKanbanBoard.tsx` (`cac0648`) and `contact-crm-lifecycle.ts` are on sookly main. Roles `admin` / `agent` / `viewer`. API keys are per workspace. Human approval gate is present | SL-021 extends the board. Do not build a second one. |
| Andrew's CRM | Defer | Product name, URL, and API are UNKNOWN after the rdusa pass. Discovery is SL-013 and needs Andrew | Do not replace or fork. |
| Quo and Xero | Defer | No application code in SookLabs, SEOS, rdusa, or sookly-omnichat. rdusa has docs only. Quo MCP is unauthenticated | Do not invent a connector. No private call content by default. |
| RDUSA client page | Extend with care | Owner rooms on master, guards on #40 | Channel `rdusa` is not the tenant boundary. |
| JAKA client profile | Extend in SL-005 | Owner slug `jaka-transportation` already used in `lib/hq/owner-portal.test.js`; room channel `jaka` stays internal | Project room events per tenant. Tim's client role is read-only until SL-006. |
| Owner-room install button | Defer | `migrateOwnerPortal` | Do not press it. See SL-002. |
| Drive relay | Reuse | `lib/hq/drive-bridge.js` on master | Off until `HQ_DRIVE_SERVICE_ACCOUNT_JSON`. #32's helper is still unmerged. |
| Acceptance loop | Reuse | `lib/hq/loop-*.js` | MCP replies do not wake it. SL-001 includes that gap. |

## 4. Reconciliation before any new task

Do this before opening SL implementation PRs. "Merge into a task" means the surviving work has an SL id below and must not be reimplemented on a second branch.

### SEOS agent relay (SookLabs repo)

| Item | State verified this run | Disposition |
| --- | --- | --- |
| Drive bridge on master (`lib/hq/drive-bridge.js`, `drive-bridge-service.js`, commits from the #38 line including `e79cb79`) | PRESENT | Keep. It is the live relay path. |
| SookLabs #32, draft, `cursor/gemini-drive-relay-1d22` @ `f151673` (2026-10-05) | Open. Diff vs master still adds `lib/hq/gemini-relay.js`, `gemini-relay.test.js`, and `docs/relay/gemini/*`. `gemini-relay.js` is absent on master. | **Keep and rebase** onto current master as SL-004. Do not close. Do not open a second relay helper. |
| SookLabs #33, draft, `cursor/gemini-spark-relay-mds-fe50` @ `c1b6019` | Open. Channel registry and the reply-channel fix are already on master (`ROOM_CHANNELS`, `04a3457` is in history via #38). The branch still carries relay markdown and RoomBoard edits. | **Do not merge.** Split: close the code changes as superseded; salvage missing markdown only under SL-007 if a rebase shows those files still absent. |
| `docs/relay/10-claude-check-in-2026-10-05.md` on master | PRESENT through §26 | Keep as history. Later passes §27–§32 exist only on `origin/claude/hopeful-edison-x93kfj` @ `ac4ce80` (2026-10-10), which is **not** an ancestor of master. |
| Unmerged wake patch described on that branch (`docs/relay/patches/pr20-mcp-room-post-loop-wake.patch`) | **Not on master.** Gap re-checked in source: `app/hq/api/room/messages/route.js` calls `wakeFromDispatch`; `lib/hq/room-mcp.js` does not. | **Merge into SL-001.** Do not open a separate wake PR. |

### SEOS MVP smoke and analytics (pass `bc-ccf9eeca`, main `f4505d4`)

| Item | What the relay records | Disposition |
| --- | --- | --- |
| SEOS #8, open draft, no checks | Relay (2026-10-05, against main `38d0777`): 12 pass, 5 not met, 2 not run. The five misses are checklist wording (`auth.restricted`, `auth.command-center`, `kb.badge`, `cc.scores`, `cc.feed`). `hq.local` fetches HQ without a session, so it can false-fail. `hq.prod` was not run. The 2026-10-15 pass confirms the draft is still open and has no checks. | **Keep the evidence. Do not close the finding.** Checklist edits are an authority change (Mark). False-fail fix is SL-008. |
| Lockfile `@swc/helpers` | Already on SEOS main `f4505d4`. `fbf0170` is the head of PR #2, which was based on the social branch | **Do not port the lockfile again.** Keep `cursor/seos-social-control-plane-mvp1` @ `a256ad2` only for the lifecycle tests that are still absent from main. |
| SEOS #9 | Merged at `f9a4275` (not `1eb2fdf`). Analytics endpoint and `add_analytics`. Main is now `f4505d4` | **Already merged. Do not reopen.** GSC/GA4 read-only clients are on main. Property ids live in the DB and are not committed. Live freshness was not re-run. |
| SEOS #10 | Droplet workflow is present, has no migrate step, and falls back to `ssh-keyscan` when `known_hosts` is empty. README still names Vercel `seos.sooklabs.com` | **Keep both facts.** SL-009 makes `known_hosts` required. Do not add a third deploy path. |
| SEOS #11 | Open Prisma-lock draft, checks green, mergeable. On main the Prisma lock is still `sqlite` and the authority migration SQL is still SQLite | **Keep. Finish as SL-010.** Do not open a second Prisma-lock branch. Do not `migrate resolve` or `migrate deploy` against production in that PR. |
| `cursor/seos-social-control-plane-mvp1` @ `a256ad2` | Lifecycle tests are on this branch and not on main. Connectors registry is already on main. | **Keep** for those tests only. Do not port the lockfile again. Do not start a replacement MVP branch. |
| SEOS #7, #6, #1 | Open drafts: relay doc, operating model, dev env | **Keep as drafts.** Do not merge from this preflight. |
| SEOS #5, #4 | Open and CONFLICTING: connect stepper, and the RDUSA n8n / Refactor golden path | **Do not merge.** Rebase only if a later SL task needs that diff. Do not start a second golden-path branch. |
| SookLabs branch `SEOSCLAUDEMV1` @ `2d5fbc0` (2026-06-26) | SookLabs history, "Promote SookLabs v2 to production routes". Not the SEOS repo. | **Close** when Mark is closing stale branches. Do not build on it. |
| SookLabs branch `cursor/seos-command-center-a03e` @ `5a58e1a` (2026-09-04) | Not an ancestor of master. Master already has `app/hq/(dash)/seos/*`. | **Close** after a diff confirms no unique page is still required. Do not revive it for the RDUSA pilot. |
| SookLabs #42 and SEOS #12 | Guidance drafts. | **Keep open as drafts. Do not merge** from this preflight. |

### RDUSA workflow

| Item | State | Disposition |
| --- | --- | --- |
| Room channels `rdusa` and `jaka` | PRESENT on master | **Keep** as internal operator rooms. Do not expose them to the client. |
| SookLabs #33 channel work | Superseded on master for the registry and reply path | Covered above: do not merge the PR. |
| SookLabs #39 owner rooms and reports | Merged (`6b985a7` in history, relay §24) | **Keep the feature. Do not press "Switch on owner rooms".** Redeem is two statements (`lib/hq/owner-portal.js` `redeemOwnerInvite`): the invite is marked used, then the access row is inserted. A failed insert burns the link. Keys do not expire in the database. Access is `business_slug`, not an immutable workspace id. |
| SookLabs #40, draft, `cursor/phase1-owner-room-guards-7966` @ `bfcc782` | Open. Relay §27 says it conflicts with master on the `middleware.js` import. Codex review RECORDED 2026-10-09: not merge-ready; six blockers, four of them already on master via #39. | **Keep open. Do not merge** until it is rebased and SL-002 has landed, or until SL-002's transaction is included in that rebase. Do not close it: the allow-list, fixed error codes, and confirm step are still wanted. |
| rdusa #6 | Open draft among #1–#6. Repo has no CI. Main `839532a` | **Keep as draft guidance. Do not merge.** |
| Joomla publisher | PRESENT: `scripts/joomla-publisher.mjs`, Joomla API v1, `JOOMLA_API_TOKEN`. SEOS has no Joomla code | **Reuse this client for reads (SL-011).** Do not add a second client in SEOS. The script can publish; the read task must not call that path. |
| `lib/hq/content-draft.js` | PRESENT in SookLabs, tested, not wired to the publisher | **Keep** as the approval rule. SL-011 may call it. Do not rewrite the state machine. |
| rdusa hygiene | `codex_order_runs/` is tracked because `.gitignore` says `.codex_order_runs/`. Customer emails sit in about 50 tracked files. Other prospect lists are in the repo. No acceptance test suite | **SL-027.** Untrack the order runs and fix the ignore rule. History rewrite waits for Mark. |

### JAKA client view

| Item | State on `8c6d83a` | Disposition |
| --- | --- | --- |
| Room channel `jaka` | PRESENT in `ROOM_CHANNELS` | **Keep internal.** SL-005 does not give Tim that channel. Tenant scope is the owner key's business, the same rule as `/hq/client`. |
| Owner slug `jaka-transportation` | PRESENT as the fixture business in `lib/hq/owner-portal.test.js` | **Reuse** for Tim's invite. Do not add a second identity table in SL-005. |
| `/hq/client` | PRESENT. Renders one SEOS workspace matched to `owner.business` (`app/hq/client/page.js`) | **Extend** with the JAKA lane projection. Do not replace the reports view with a second client app. |
| `/hq/retainers` and a retainer-contract module | **Absent.** No route, file, or nav entry on this SHA | Mark's retainer lane shows "not on file" until a real module exists. Do not invent score, fee, AR, or billing notes. Tim's role never receives that lane (SL-005). |
| Branch `cursor/blog-posts-drafts-b3a7` | Not in the SookLabs, SEOS, rdusa, or sookly passes | The site lane displays a SHA only when an event carries one. |

### Sookly, left out of the three streams above but in the way

`data/hq/ops.json` records sookly-omnichat CI PASS at `1278bfb7c61d1be12c6042c31bc3023473bee8cf` and `8d94194502862e0f5e0b7dbd58b2f0fc7a8ec1b0`, with staging and production NOT TESTED. Journey branch name in `four-fronts.js` is `cursor/operational-journey-engine-v1`. **Do not duplicate that Journey work.** sookly #93 stays an unmerged guidance draft.

## 5. Other SookLabs drafts that collide or distract

| PR | Head | Disposition |
| --- | --- | --- |
| #37 `fix/hq-loop-wake-missing-secret-fails-2026-10-07` @ `699c08b` | Draft. Makes a missing loop secret fail the scheduled wake. | **Keep.** Rebase onto master before merge. Not part of the first three. Merging it does not prove a live worker. |
| #36 timeline @ `c26889b` | Draft. Fan-out patch is on master at `docs/relay/patches/pr36-repo-graph-fanout.patch`. CSS will conflict. | **Keep** off the integration critical path. Apply the patch when someone rebases it. |
| #31 visual border | Draft, unrelated | Leave it. |
| #12, #11, #10, #9, #7, #6, #5 | Older docs and a stacked timeline | Do not treat as current architecture. Close when Mark wants the queue cleaned. Do not mine them for a second operating model. |

## 6. RDUSA journeys (design target, not a built path)

### Article: Joomla draft → approved publication

```
Joomla API v1 via rdusa/scripts/joomla-publisher.mjs (token env; publish path exists, read task must not use it)
  → SEOS preview                                  PROPOSED. SEOS has no Joomla code. Refactor Studio and Knowledge Base are on SEOS main and do not write knowledge-kind state
  → comment / proposed edit without publish       PROPOSED
  → Mark approves the exact body hash             PRESENT as checkTransition in content-draft.js
  → a later edit clears that approval             PRESENT (hash mismatch denies publish)
  → Codex records joomla_id                       PRESENT as a field rule only
  → Joomla write / public URL                     Present only inside the publisher script. Not authorized for v1
  → GSC/GA4 read-only clients                     PRESENT on SEOS main. Property ids are per workspace in the DB, not in git. Live freshness was not re-run
  → HQ client report for that business only       PRESENT as /hq/reports and /hq/client projection
```

Human gates: Mark approves the exact revision; a stale Joomla revision must fail closed; no seat self-approves; no autonomous publish. SEOS Refactor Studio acceptance stays a separate gate (RECORDED in #42 and the control plane). This pilot does not redefine it.

### Enquiry → CRM quote

```
Sookly enquiry                                Human approval gate is PRESENT. Contact staging is contact-crm-lifecycle.ts on main 777ce576
  → human review / quarantine                  PRESENT as that gate. PR #3 is stale. Do not revive it for this
  → Sookly contact                              ContactsKanbanBoard.tsx (cac0648) is the board. Columns follow contact SOP stages
  → Andrew's CRM quote / order                  UNKNOWN product, URL, and API. Do not replace it
  → HQ shows status                             PROPOSED read-only projection (SL-019)
```

HQ does not become the CRM. Sookly does not become the CMS. No bidirectional sync until the CRM's API, auth, consent, and record of truth are written down and Mark approves the scope.

## 7. Schemas and API contracts

### PRESENT (SookLabs)

| Contract | Shape observed |
| --- | --- |
| Room post | Kinds `chat`, `baton`, `decision`, `evidence`, `status`. Baton keeps only `to`, `status`, `task` (160 chars), `next`. `approval` is forced null. |
| Dispatch | States in `lib/hq/swarm-routing.js`: `queued`, `dispatching`, `thinking`, `responded`, `failed`, `offline`, `timed_out`. Unique per source message and seat. |
| Evidence ref | `pr`, `commit`, `ci`, `file`, `doc`. |
| Content draft | Front matter in `content-draft.js`. Not persisted. |
| SEOS authority client | `GET` and `PATCH` `{base}/api/authority/hq-summary`. Error returns `configured` and empty workspaces. |
| SEOS analytics client | `GET {base}/api/analytics/hq-summary?months=`. Never throws. |
| Owner invite | `hqi_` token, 7-day expiry, hash stored, GET does not consume. |
| Owner access | `hqo_` key, cookie 90 days, server row has no expiry column. |
| Internal MCP | Four read tools, SookLabs repo only. |
| Loop escalation | Eight gates in `loop-policy.js`. |

### PROPOSED (do not implement except inside the SL task that owns them)

| Contract | Owned by | Rule |
| --- | --- | --- |
| SL baton fields `slId`, `reviewer` | SL-001 | Survive normalization. Reviewer seat ≠ assignee seat. |
| SL statuses `dispatched`, `claimed`, `in_review`, `reviewed`, `approved`, `blocked` | SL-001 | `approved` only from seat `mark`. Review evidence only from `reviewer`. |
| Metric envelope `source`, `property`, `period`, `capturedAt`, `stale` | SL-003 | Reject keys that look like revenue, sales, or attribution. |
| Tenant lane event `{ tenant, lane, itemId, status, needsMark, needsTim, evidence, fields, revision }` | SL-005 | Append-only on the room event path. HQ projects it. No second store. Client DTO drops `retainer` and agent names. |
| Tim lead action `{ itemId, action, revision, idempotencyKey }` → audit `{ actor, item, action, at }` | SL-006 | Only `confirmed`, `declined`, `done` on a JAKA lead that is waiting on Tim. Stale revision and cross-tenant ids fail closed. |
| Joomla read DTO `id`, `revision`, `title`, `body`, `state=unpublished` | SL-011 | Read-only. No write method in that PR. |
| CRM map | SL-013 | Empty until the product name and auth exist. |
| Quo metadata | SL-014 | Ids, timestamps, direction, disposition. No transcript or recording by default. SL-024 consumes this reducer. |
| Work item lifecycle `draft → edit/approval → approved → execution → done` | SL-016 | Generic model the Sookly CRM will store. HQ Execution tab only projects it. |
| Master-view number `{ source, period, freshness, amount? }` | SL-017 | Xero revenue is accounting revenue. Marketing numbers stay under the SL-003 envelope. Missing source renders unavailable. |
| Contact identity `{ id, sourceLinks, consent, retention }` | SL-022 | No merge of live mail or calls until consent and retention are recorded. |

### RECORDED, source not opened

SEOS Prisma migrations `20260716193000_add_authority_tracker` (SQLite history, Postgres rewrite on the unmerged branch) and `20261005170000_add_analytics`. Sookly release-matrix rows. RDUSA promise map.

## 8. Risks and human gates

| Risk | Evidence | Gate |
| --- | --- | --- |
| Sibling repos | Verified by passes `bc-ccf9eeca`, `bc-d0a012b4`, `bc-79f72035` | Use those SHAs. Do not invent files the passes did not name. |
| Deployed SHA unknown while homepages return 200 | Header probe | No production PASS. `hq:verify-deploy` was not run; it needs the deploy script's expected inputs and was out of scope. |
| Two SEOS hosts possible (Vercel response vs RECORDED droplet workflow) | Both observations | Mark names the production host before any deploy change. |
| Owner link can be burned | `redeemOwnerInvite` lines 123–141 | Do not install owner tables. SL-002 first. |
| `/hq/api/client/*` open on master | `middleware.js` | #40 after rebase. Future client routes must stay on the allow-list. |
| `rdusa` / `jaka` channel ≠ tenant isolation | `ROOM_CHANNELS` plus Codex review in the relay | Client data goes through owner rooms, scoped by the key. SL-005 tests that a JAKA key cannot read RDUSA. |
| Retainer figures on a client page | No `/hq/retainers` module on this SHA; `currentRetainerUsd` still exists in `control-plane.js` | SL-005 omits score, fee, AR, and billing notes from Tim's DTO. Mark's lane stays "not on file" until a real contract source exists. |
| Commercial figure in `control-plane.js` | Field present | Do not copy it into docs, prompts, or reports. Removing it is a separate Mark decision, not this PR. |
| Analytics could be read as sales proof | Client has positions and, on the reports page, sessions/clicks RECORDED in `docs/HQ-OWNER-ROOMS.md` | SL-003 refuses attribution language. Work completed is not a business outcome. |
| Joomla write without revision check | No client yet | Publish stays behind `content-draft.js` plus a stale-revision check that does not exist yet. |
| Andrew's RDUSA CRM | The rdusa pass left the product name, URL, and API UNKNOWN. Docs mention it. There is no client | SL-013 asks Andrew. SL-019 stays fail-closed until he names it. Do not replace or fork it. |
| Xero and Quo | No application code in any of the four repos. rdusa has docs only. This agent session still has a Xero MCP with list and write tools. No Xero call was made. Quo MCP needs auth | SL-014, SL-018, SL-023, and SL-024 are new clients, not extensions. Never copy Xero write tools into HQ. |
| Twelve years of mail and a deduped contact graph | Named by Mark as the desired graph. Not ingested. | SL-022 defines consent and retention. SL-026 refuses to import without that record. |
| Quo | MCP `needsAuth` | No call content. No connector until consent and scopes are written down. |
| MCP `room_post` does not wake the loop | Source comparison | Pull seats (Cursor, Codex, Claude) would look idle to the loop. Fixed only inside SL-001. |
| Self-approval | Content draft and enroll already forbid some of this | SL cards must forbid the assignee from recording their own review. |
| #42 / #12 / #6 / #93 merged by habit | They are drafts | Leave them drafts. |

Mark has authorized merge and deploy where a brief is reversible and stays inside its stop rules. Production migrations, credential changes, spend, and production data writes still stop for his explicit yes. External publishing and customer messages stay stopped too. Email ingestion and contact-identity resolution also stop until he records consent and a retention window.

## 9. How SL tasks are staffed

Default seats, already in `ROOM_SEATS`:

| Role | Seat | Does | Does not |
| --- | --- | --- | --- |
| Specify | `grok` | Posts the SL baton using the brief below, unchanged in scope | Redesign the task |
| Implement and write tests | `codex` | One PR, one change | Review that same PR |
| Architecture and security review | `claude` | Review the diff against the brief and the gates | Implement the same task |
| Integration validation | `cursor` | Fresh session checks merge, tests, and neighboring routes | Architecture-review its own plan or Codex's PR in place of Claude |
| Approve | `mark` | Migrations, credentials, spend, and production data writes. Merge and deploy are allowed where the brief says the change is reversible and contains none of those four. | Skip the four stops |

This preflight is Cursor's design. Grok's specify step is to dispatch the brief, not to replace it. A scope change is a new SL id and a Mark decision.

Every task is one independently testable PR. No agent reviews its own work. Stop rules in each brief are mandatory.

## 10. First three PRs

Do these in order. The SEOS, rdusa, and sookly passes do not change it. SL-001 is still the handoff path. SL-002 is still the redeem fix before Tim's invite. SL-003 is still the metric language before any new number is shown. Joomla, the existing kanban, and the ops-command state machine land in later tasks.

SL-005 (JAKA client view) is not in this three. It starts only after SL-001 and SL-002 are merged: it reads the room event path from SL-001, and Tim's invite uses the redeem path SL-002 makes atomic. SL-006 starts only after SL-005. SL-005 stays read-only.

---

### SL-001 — Record an SL handoff on the existing room seats

**WHAT**

One change: an SL baton can be sent to Codex, Claude, or Cursor, and the room keeps the handoff, status, PR, and review evidence, including a loop wake when the reply arrives over MCP.

Expected outcome: Grok (or Mark) posts one baton. The target seat gets one dispatch. A later evidence post attaches a PR ref. The reviewer seat, who is not the assignee, attaches review evidence. Mark is the only seat who can mark it approved. An MCP reply to that dispatch wakes the acceptance loop the same way the HTTP reply route already does.

Measurable acceptance:

1. A baton `{ slId: "SL-001", to: "codex", reviewer: "claude", status: "dispatched", task, next }` round-trips through `normalizeBaton` without dropping `slId` or `reviewer`.
2. `reviewer === to` is rejected.
3. Seat `codex` cannot post status `reviewed` or kind `decision` for that `slId`. Seat `claude` can post `reviewed` only with a `doc` or `pr` ref. Seat `mark` is the only seat who can set `approved`.
4. Posting the dispatched baton creates one `hq_room_dispatches` row for `codex` and a second post does not create a second row (existing uniqueness).
5. `lib/hq/room-mcp.js` calls `wakeFromDispatch` only when `replyWakesLoop` is true: first stored reply with a `dispatchId`. Replays, rejected replies, and ordinary posts do not wake.
6. No new table, no new MCP tool, no promote/broadcast tool.

Required tests: `node --test lib/hq/sl-handoff.test.js lib/hq/swarm-contract.test.js lib/hq/dispatch-guard.test.js`. Postgres cases that already need `HQ_TEST_DATABASE_URL` stay skipped when that variable is absent, and they must pass when it is a disposable database. Add `--test-concurrency=1` if the Postgres file is included.

**HOW**

Repo: `mblackth-ai/SookLabs` only. Branch from current `master` (`8c6d83a` or newer). Suggested name `cursor/sl-001-room-handoff-<suffix>` under whoever implements it; Codex may use the house prefix the seat already uses if Mark prefers, as long as it is not `docs/ecosystem-alignment-20261015` and not #40's branch.

Components:

- New `lib/hq/sl-handoff.js` and `lib/hq/sl-handoff.test.js` (pure).
- `lib/hq/swarm-contract.js` `normalizeBaton` — keep `slId` (`SL-` + digits) and `reviewer` (a real seat, different from `to`).
- `lib/hq/dispatch-guard.js` — add `replyWakesLoop(saved, dispatchId)` as described on hopeful-edison `ac4ce80` §32. The patch file itself is not on master; re-implement that behavior, do not copy the patch blindly if line numbers moved.
- `lib/hq/room-mcp.js` — `after(() => wakeFromDispatch(dispatchId))` behind that rule, matching `app/hq/api/room/messages/route.js`.
- `app/hq/api/room/messages/route.js` and `lib/hq/swarm-router.js` — use the same rule so the three reply paths cannot drift.
- `lib/hq/room-mcp-rpc.js` — document the SL fields in the `room_post` description. Do not add a tool.

APIs: existing `POST /hq/api/room/messages` and MCP `room_post` / `room_inbox` / `room_claim` / `room_board`. Dependencies: none new. Test environment: local `node --test` plus disposable Postgres for the dispatch uniqueness and wake tests. Required access: a SookLabs git push credential. No production database, no seat secrets, no `HQ_GITHUB_TOKEN` required for the unit tests.

**WHO**

Grok posts the baton. Codex implements and writes the tests. Claude reviews architecture and security (self-approval, wake only on first reply, no new store). Cursor, in a new session, validates integration against master and runs the tests. Mark approves merge. Nobody deploys.

**Handoff (cold start)**

Context: HQ already routes Mark's and Grok's batons through `decideRoute` in `lib/hq/swarm-routing.js` and stores dispatches in Postgres via `lib/hq/swarm-pg.js`. `normalizeBaton` currently returns only `to`, `status`, `task`, `next`, and `approval: null`, so an SL id would be deleted on the way in. HTTP replies wake the loop (`messages/route.js` around the `wakeFromDispatch` call). MCP replies do not (`room-mcp.js` `room_post` path). Pull seats use MCP, so a handoff to Codex, Claude, or Cursor never nudges the loop. The control plane says the ops execution board and room batons are the record. Do not create `hq_sl_tasks`.

Files to read before editing: `docs/HQ-MCP-CONTROL-PLANE.md` (execution mode and "do not invent a parallel checklist store"), `docs/ENGINE_INTEGRATION_PREFLIGHT.md` (this file), `lib/hq/swarm-contract.js`, `lib/hq/swarm-routing.js`, `lib/hq/dispatch-guard.js`, `lib/hq/room-mcp.js`, `app/hq/api/room/messages/route.js`, `lib/hq/swarm-router.js`, `lib/hq/room-mcp-rpc.js`.

Acceptance tests: the six numbered checks above. Also run `node --test lib/hq/swarm-routing.test.js lib/hq/room-mcp-rpc.test.js` and `npm run lint`. `npm run build` if the route file changed.

Stop rules:

- Stop after the draft PR. Do not merge, deploy, or migrate.
- Do not add MCP tools, a new table, or a second task store.
- Do not touch owner rooms, SEOS, Joomla, analytics wording, or #40.
- Do not put secrets, commercial figures, or customer text in tests. Use fixture ids.
- If `normalizeBaton` cannot grow without breaking `promotionFiles` YAML, extend YAML with the two new fields in the same PR and test it. Do not leave the fields only in the message body.
- If the wake change and the baton fields start to need unrelated refactors, stop and say so. Do not widen the PR.

Rollback: revert the PR. No schema change, so production data is untouched.

---

### SL-002 — Make owner-link redeem one transaction

**WHAT**

One change: `redeemOwnerInvite` marks the invite used and inserts `hq_owner_access` in a single database transaction. If the insert fails, the invite stays unused.

Expected outcome: two concurrent redeems still produce one access row (the existing `UPDATE … WHERE used_at IS NULL` stays). A forced insert failure leaves `used_at` null so Mark can retry. No change to cookie lifetime, slug binding, middleware, or the install button.

Measurable acceptance:

1. On a disposable database, a successful redeem sets `used_at` and `access_id` and returns one `hqo_` key.
2. A second redeem of the same token returns the used error and does not insert a second access row.
3. When the access insert throws, the transaction rolls back: `used_at` is null and no access row exists.
4. `peekOwnerInvite` still does not consume the link.
5. Existing owner-portal tests stay green.

Required tests: extend `lib/hq/owner-portal.test.js` (or the current redeem test file on the branch) with the rollback case. Run `HQ_TEST_DATABASE_URL=postgres://… node --test --test-concurrency=1 lib/hq/owner-portal.test.js`.

**HOW**

Repo: SookLabs, new branch from current master. Do not commit onto `cursor/phase1-owner-room-guards-7966`. That branch is #40 and has a different job (middleware allow-list, error codes, confirm step).

Components: `lib/hq/owner-portal.js` `redeemOwnerInvite` only, plus its test. Use the existing `pg` client and one `BEGIN` / `COMMIT` around the update, insert, and `access_id` update. A unique violation or a thrown error must `ROLLBACK`.

APIs: `POST` redeem route should behave the same on success. No new route. No MCP change. Test environment: disposable Postgres. Required access: git push. Do not set production `HQ_DATABASE_URL` in the test shell. Do not call the install action.

**WHO**

Grok dispatches. Codex implements and writes the rollback test. Claude reviews the transaction (lost update, double-use, error path). Cursor validates in a new session that #40's files were not mixed in and that `middleware.js` is untouched. Mark approves. Do not press the owner-room button.

**Handoff (cold start)**

Context: owner rooms shipped in #39. The invite update and the access insert are separate `await q(...)` calls in `redeemOwnerInvite`. Relay §29 (on `ac4ce80`, not on master) records Codex's confirmation of that bug. The tables may be absent in production because they are created only by `migrateOwnerPortal`. Write the test so it creates the schema on the disposable database the same way the existing owner tests do. Read `docs/HQ-OWNER-ROOMS.md` and `lib/hq/owner-portal.js` through `revokeOwner`.

Stop rules:

- One function's atomicity. Do not add key expiry, workspace ids, or middleware allow-lists here. Those stay follow-ups (SL-012) and #40.
- Do not run `migrateOwnerPortal` against any shared or production database.
- Do not log the raw token or key.
- Stop after the draft PR.

Rollback: revert the PR. If a production database somehow received a partial redeem before this ships, Mark handles that row by hand; this PR does not ship a repair script.

---

### SL-003 — Shared metric envelope with no sales attribution

**WHAT**

One change: a pure function checks the object HQ is willing to show from SEOS analytics. It requires source metadata and rejects sales-attribution fields.

Expected outcome: reports can keep keyword position, clicks, and sessions only when the envelope says where they came from, for which property, for which period, when they were captured, and whether they are stale. A payload that includes revenue, sales, deals, pipeline, or attribution is refused and the page shows the existing unavailable state. HQ still does not call Google.

Measurable acceptance:

1. A fixture `{ source: "gsc", property, period, capturedAt, stale: false, workspaces: [{ slug, averagePosition }] }` passes.
2. The same object with `stale: true` passes and is labeled stale (the function returns `stale: true`; the UI string is the existing honest empty/error style, not a new badge system).
3. Adding `revenue`, `sales`, `attributedRevenue`, `pipeline`, or `roas` fails.
4. Missing `source`, `property`, `period`, or `capturedAt` fails.
5. `readAnalyticsSummaryWith` still makes no request when the token is missing, and a refused envelope does not throw.

Required tests: `node --test lib/hq/analytics-summary.test.js` plus the new cases in that file or `lib/hq/metric-envelope.test.js`.

**HOW**

Repo: SookLabs only. New pure module `lib/hq/metric-envelope.js`. Call it from the reports read path after `readAnalyticsSummaryWith` returns `ok`. Files to inspect: `lib/hq/analytics-summary.js`, `app/hq/(dash)/reports/` (confirm the page path on the branch; `docs/HQ-OWNER-ROOMS.md` says `/hq/reports`), and the owner client page so both projections use the same function. If the owner page and the founder page cannot both be wired without a second behavior change, wire the pure function and the founder reports page only, and say the owner page is untouched.

No SEOS deploy, no new Google credential, no schema. Test environment: `node --test` with fixture JSON. Required access: git push. `SEOS_HQ_API_TOKEN` must not be required for tests.

**WHO**

Grok dispatches. Codex implements the checker and tests. Claude reviews for over-claiming (sessions and clicks are not sales). Cursor validates both report surfaces if both were touched. Mark approves. Do not point the client at a new SEOS route.

**Handoff (cold start)**

Context: HQ already proxies SEOS `GET /api/analytics/hq-summary` and treats SEOS as the store (`docs/HQ-OWNER-ROOMS.md`). The unit test only asserts `workspaces[0].slug`. The reports page copy in that doc mentions keyword groups, clicks, and sessions. Those are allowed topics when the envelope is complete. They are not attribution. SEOS #9 is RECORDED as the producer of this endpoint; its response schema was not read this run. Be strict: unknown extra keys are ignored, attribution keys are rejected. Do not invent GSC or GA4 property ids.

Stop rules:

- Do not add a Google API client, a cron pull, or a cache table.
- Do not change SEOS in this PR.
- Do not display a number when `stale` is true without the word stale on that block.
- Do not copy retainer amounts into fixtures.
- Stop after the draft PR. If the live SEOS payload is unknown, fixtures are enough; do not block the PR on production credentials.

Rollback: revert the PR. Reports return to today's client behavior.

---

## 11. Later tasks (not the first three)

These are specified so a seat can start cold. They are not permission to skip the reconciliation in §4. SL-004 does not wait on the first three. SL-005 waits on merged SL-001 and SL-002. SL-006 waits on merged SL-005. Later tasks wait on the dependency named in their own brief.

### SL-004 — Rebase the Gemini relay helper onto master

**WHAT.** One change: rebase SookLabs #32 so `lib/hq/drive-bridge.js` uses the dedupe helper in `lib/hq/gemini-relay.js` instead of a second copy. Expected outcome: one function builds the Drive claim key, with the existing bridge tests and the #32 unit tests both passing. Acceptance: `node --test lib/hq/drive-bridge.test.js lib/hq/gemini-relay.test.js` green; no new Google call. **HOW.** Continue from a rebase of `cursor/gemini-drive-relay-1d22` onto current master. Do not open another relay branch. Test env is `node --test` without Drive credentials. **WHO.** Codex rebases and tests. Claude reviews secret quarantine still holds (`SECRET_RULES` in `drive-bridge.js`). Cursor validates the import is the only behavior change. Mark merges #32 or the replacement PR and closes the leftover branch.

**Handoff.** Read `lib/hq/drive-bridge.js` and the #32 versions of `gemini-relay.js`. The relay text says the dedupe formulas already match; prove that with a test vector, and if they differ, stop and ask Mark which key wins. Stop rules: no new scheduler, no service-account JSON, no change to room routing, stop after the draft PR. Rollback: revert; the bridge on master keeps working.

### SL-005 — JAKA client profile, read-only

Depends on merged SL-001 (room events) and merged SL-002 (atomic invite redeem). Not part of the first three. Stays read-only. Tim's confirm/decline/done action is SL-006 and must not land in this PR.

**WHAT**

One change: a JAKA tenant projection. Agents post typed events. HQ shows them on Mark's JAKA profile and, for Tim, on the existing client room. Each item carries `needsMark` and `needsTim`. The page leads with items stuck with a person.

Expected outcome: Mark sees every JAKA lane, including retainer. Tim, signed in through the owner-link flow as the client for `jaka-transportation`, sees the same operational lanes as a calm summary, with "fronts we're covering this week" counts and his own waiting-on-Tim items first. He does not see RDUSA, other tenants, retainer score, fee, AR, billing notes, agent names, internal notes, or credentials. There is no new source of truth and no button that changes a lead.

Measurable acceptance:

1. A fixture event `{ tenant, lane, itemId, status, needsMark, needsTim, evidence, fields, revision }` round-trips through a pure parser. Unknown tenant or lane is rejected.
2. Mark's DTO for `jaka-transportation` includes the lanes below. The retainer lane is present and, while `/hq/retainers` is still absent, its only value is "not on file".
3. Tim's DTO has no `retainer` lane and no keys `score`, `fee`, `ar`, or `billingNotes`, including inside nested fields.
4. A JAKA client key asked for `rdusa` or any other tenant gets a refusal and an empty item list. No RDUSA id appears in the body.
5. Tim's DTO strips agent seat names, internal notes, and anything that looks like a token. Evidence links remain only if they are ordinary http(s) URLs without query secrets.
6. Sort: people-stuck items first (waiting lane, then contractor follow-ups, then leads with `needsTim`), then site, Facebook, and SEO.
7. Tim's header counts items per visible lane for the current week. The retainer lane is not a count on his page.
8. No route in this PR accepts POST except the existing sign-out.

v1 field list (JAKA team, 2026-10-15). These are the fields to display. Live values are not known in this preflight; missing data stays blank.

| Lane | Fields |
| --- | --- |
| Contractor contacts | Legacy Contractors of KC (ongoing in-house assist); single contacts such as Rio Moving; last contact; status. `needsMark` / `needsTim` on each row. |
| Waiting on Tim or Mark | Unconfirmed lead texts (J5, Tito correction, J7/J8); Google listing phone change; LinkedIn Company Page sign-in. Each row flagged needs-Mark or needs-Tim. |
| Site / blog | Last scheduled post date; buffer days against 7; next refill window and due date; drafts branch `cursor/blog-posts-drafts-b3a7` head SHA; post count; build status; production deploy status (blocked: Origin to Vercel); count of (913) numbers left. |
| Facebook buffer | Last scheduled post; days left against 7 at 2 a day; next refill window; blockers (Facebook signed out). |
| SEO packs | Last pack window and file; whether it landed on the drafts branch; next due date; weekly run schedule and last result; locks (live search only, phone (816) 299-7989, no review count, no rates or BBB); Google listing phone mismatch. |
| Leads | ID; source and link; posted time; type (customer job, then crew or assist); status (waiting on Tim, sent, missed, deleted). Missed or expired leads stay visible. Weekly hiring call: next run, groups, posted / awaiting send-yes / blocked. Groups queue: found, joined, pending. |
| Retainer (Mark only) | Score, fee, AR, billing notes, promises. Hidden from Tim. Do not invent figures. |

**HOW**

Repo: SookLabs. New branch from current master after SL-001 and SL-002. Components: a pure projector `lib/hq/tenant-projection.js` plus tests; founder page under the existing HQ dash for one tenant; Tim's page extends `app/hq/client/page.js`, which already binds the business from `ownerForKey` and never from the URL. Events are room messages parsed after SL-001. Do not add a JAKA table. Do not read the `jaka` room channel as if it were tenant ACL.

The branch name `cursor/blog-posts-drafts-b3a7` was not in this SookLabs clone. Display the SHA from the event. Do not deploy that branch.

`/hq/retainers` is absent on `8c6d83a`. Mark's retainer lane reads that module only if it exists at implementation time. Otherwise it shows "not on file".

Test environment: `node --test` with fixtures. Disposable Postgres only if the testing the owner key lookup requires it. Required access: git push. Do not mint a production invite for Tim in this PR.

**WHO**

Grok dispatches after SL-001 and SL-002 have merged. Codex implements the projector, both pages, and the permission tests. Claude reviews tenant isolation and the retainer omission (a hidden CSS block is not sufficient; the keys must be absent from the client payload). Cursor validates in a new session that RDUSA fixtures cannot leak and that no write route was added. Mark approves. Do not press the owner-room install button. Do not send Tim a link until Mark does that himself, after SL-002 is in production.

**Handoff (cold start)**

Context: JAKA (Open Door Movers / JAKA Movers & Transportation, jakatransportation.com) is a client beside RDUSA. Mark wants JAKA's work on its own HQ profile. The room channel `jaka` is an internal operator namespace (`lib/hq/swarm-contract.js`). The client boundary is the owner key. Tests already use the slug `jaka-transportation` (`lib/hq/owner-portal.test.js`). `/hq/client` currently shows SEOS analytics for that slug only (`app/hq/client/page.js`).

Files to read: this brief, `docs/HQ-OWNER-ROOMS.md`, `lib/hq/owner-portal.js`, `app/hq/client/page.js`, `lib/hq/swarm-contract.js`, and the SL-001 event shape once it has merged.

Acceptance tests: the eight checks above, plus `node --test lib/hq/owner-portal.test.js` so the slug behavior still holds. `npm run lint`. `npm run build` if pages changed.

Stop rules:

- Read-only. No confirm, decline, done, send, or publish control. That write is SL-006.
- Do not render retainer data to the client role, even as an empty label that names fee or AR.
- Do not query across tenants and then filter in the browser. The server selects `jaka-transportation` only.
- Do not store contacts, call recordings, or retainer amounts in the room as a side effect of the page.
- Do not copy commercial figures into fixtures. Use the words "not on file".
- Stop after the draft PR.

Rollback: revert the PR. No schema change.

---

### SL-006 — Tim confirms, declines, or marks done his waiting leads

Depends on merged SL-005. One write, and only that write.

**WHAT**

One change: the JAKA client role may set a lead that is waiting on Tim to `confirmed`, `declined`, or `done`.

Expected outcome: Tim's page gains that single control on those rows. The server checks tenant, lane, flag, revision, and an idempotency key. Success appends an audit record `{ actor, item, action, at }`. A repeat of the same key returns the original record. A stale revision, a non-lead, a lead that is not waiting on Tim, or any other tenant fails closed and writes nothing.

Measurable acceptance:

1. A JAKA client key, item in lane `leads`, `needsTim: true`, matching `revision`, and a new idempotency key stores one audit event and the projection shows the new status.
2. The same key and same body returns the same audit id and does not append a second row.
3. The same key with a different action is rejected and does not write.
4. Wrong revision is rejected and does not write.
5. RDUSA item id, contractor row, SEO row, retainer row, or a lead without `needsTim` is rejected.
6. Actor stored is the owner-access id, not an agent seat name and not the raw cookie.

**HOW**

Repo: SookLabs. Append the audit event on the same room/event path SL-005 reads. Idempotency is a unique `(tenant, idempotencyKey)`. If the current message table cannot enforce that uniqueness, add the smallest unique index in a SQL file with a rollback note, and run it only on disposable Postgres in CI. Do not apply it to production in the PR. No other verb, no text send, no Facebook or SEO mutation.

Test environment: disposable Postgres when the uniqueness constraint is involved; pure tests for the allow-list. Required access: git push. Production migration and a live invite remain Mark's yes.

**WHO**

Grok dispatches after SL-005 has merged. Codex implements the action and the six tests. Claude reviews fail-closed paths and the audit actor. Cursor validates no other client write exists. Mark approves the merge. He still has to say yes before any production migration or before the invite is sent.

**Handoff (cold start)**

Read the SL-005 projector and `redeemOwnerInvite` after SL-002. The client session is the `hq_owner` cookie. Do not accept a tenant id from the request body; take it from the key. Stop if SL-005's client DTO still contains retainer keys or other tenants: fix that in a follow-up to SL-005, do not widen this PR. Stop after the draft PR. Rollback: revert. If a unique index was added only in test, production is unchanged until Mark applies the SQL.

---

### SL-007 — Salvage #33 markdown or close it

**WHAT.** One change: a docs-only PR that copies relay markdown from `cursor/gemini-spark-relay-mds-fe50` which is still absent on master, or a PR comment that lists zero missing files. Expected outcome: #33 can be closed without losing batons Mark still wants. Acceptance: `git diff master...<salvage>` contains no `app/`, `lib/`, or `components/` changes. **HOW.** SookLabs. Compare the #33 file list in §4 to master. **WHO.** Cursor prepares the diff (docs only). Claude checks the pages do not declare themselves ratified policy. Mark closes #33.

**Handoff.** Channel code on #33 is superseded. Do not re-apply `RoomBoard.jsx` or `swarm-routing.js` from that branch. Stop if the salvage would edit canonical HQ policy; those sentences stay in the historical branch. Rollback: close the salvage PR.

### SL-008 — Fix the SEOS `hq.local` smoke false-fail

**WHAT.** One change, in SEOS: the automated `hq.local` check signs into HQ before looking for the SEOS link. Expected outcome: an HQ login page without a cookie is not scored as a missing cross-link. Acceptance: a fixture HTTP server that returns the login HTML on the first GET and the knowledge-base link after `POST /hq/api/login` passes; a refused login is `NOT_RUN` or a blocked state, not `NOT_MET` for the product. **HOW.** Repo `mblackth-ai/SEOS`. Find the #8 smoke runner by searching for `hq.local`. Do not edit `docs/mvp-smoke-checklist.md` in this PR (authority change). Test env: the SEOS test command recorded in that repo's README or CI workflow, discovered at start, not guessed. Required access: SEOS push. HQ password only via the local test env, never committed. **WHO.** Codex implements. Claude reviews cookie handling. Cursor validates the check still cannot mark a provider Connected. Mark approves.

**Handoff.** Relay §6 (master copy of `docs/relay/10-claude-check-in-2026-10-05.md`) is the claim. Re-read the SEOS files before editing; if #8 is already fixed, close this task with the commit SHA. Stop rules: do not change checklist wording, do not run `hq.prod`, do not deploy, stop after the draft PR. Rollback: revert the test-only change.

### SL-009 — Droplet deploy host key

**WHAT.** One change: SEOS `deploy-droplet.yml` fails closed when `DROPLET_KNOWN_HOSTS` is empty. Expected outcome: a job cannot ssh-keyscan an unknown host and then deploy. Acceptance: a workflow test or a documented dry review plus a unit/shell check if the repo already has one; the workflow does not gain a migrate step. **HOW.** SEOS. Read the workflow at the current main SHA before editing. **WHO.** Codex edits the workflow. Claude reviews the SSH trust change. Cursor validates it still deploys only the CI SHA and still does not touch `.env`. Mark approves, and Mark is the one who stores the known_hosts secret.

**Handoff.** Pass `bc-ccf9eeca` confirmed the `ssh-keyscan` fallback and the missing migrate step on main `f4505d4`. SEOS has no Joomla code; do not add any. If the workflow already requires the secret, stop and record the line. Do not change `rsync --delete` in this PR. Do not deploy. Rollback: revert the workflow.

### SL-010 — Finish the SEOS Prisma lock branch

**WHAT.** One change on open SEOS #11 (the Prisma-lock draft, checks green, mergeable): keep that PR's Postgres rewrite and add a read-only `prisma migrate diff` against an empty database if #11 does not already fail on unexpected SQL. Expected outcome: CI proves the rewritten migrations apply from scratch. Main `f4505d4` still has a sqlite lock and SQLite authority SQL, so this PR is still needed. Acceptance: the #11 checks stay green and the diff step does not use a production `DATABASE_URL`. **HOW.** Push to the existing #11 branch. Do not open `cursor/seos-prisma-lock-postgres-f2a3` or any second rewrite. **WHO.** Codex adds the diff step only if it is missing. Claude reviews the SQLite-to-Postgres edit already on #11. Cursor validates no `migrate deploy` against a live URL. Mark runs any production baseline later.

**Handoff.** Verified 2026-10-15: #11 is the Prisma-lock draft. SEOS has no Joomla code; do not add any. If #11 already contains the empty-database diff, stop and say so. Do not `resolve --applied`. Rollback: revert the added commit only.

### SL-011 — Joomla unpublished read (no publish)

**WHAT.** One change: a read function, copied in behavior from `rdusa/scripts/joomla-publisher.mjs` (Joomla API v1), returns `{ id, revision, title, body, state }` for one unpublished article using a fixture transport. Expected outcome: tests pass without a network. A `state` other than unpublished is an error. The diff contains no publish method and does not call the publisher's write path. **HOW.** rdusa, not SEOS. SEOS has no Joomla code; do not add any. Token stays `JOOMLA_API_TOKEN` and empty in examples. **WHO.** Codex implements against fixtures. Claude reviews that the publish function is not invoked. Cursor validates the DTO. Mark approves before any real token is used.

**Handoff.** The reference client is already on rdusa main `839532a`. Read it and wrap a read. Do not guess a second REST shape. No production article fetch in CI. The public site returned a SiteGround captcha, so do not scrape it. Rollback: revert.

### SL-012 — Owner key expiry and stable business id

**WHAT.** One change: `hq_owner_access` gains `expires_at`, `ownerForKey` rejects expired rows, and the business binding uses an id that does not change when a slug is renamed. Expected outcome: a 90-day server expiry matches the cookie comment in `docs/HQ-OWNER-ROOMS.md`, and a slug edit cannot retarget the owner. Acceptance: disposable-Postgres tests for expired, revoked, and renamed-slug. **HOW.** SookLabs. This is a production schema change. Ship the DDL in a reviewed SQL file with a rollback `ALTER`/`DROP COLUMN` note. Do not execute it on production in the PR. Do not combine with #40's UI. **WHO.** Codex writes SQL and tests. Claude reviews tenant binding. Cursor validates middleware is untouched. Mark applies the migration himself after merge.

**Handoff.** Depends on SL-002 already merged so the redeem path is transactional before new columns are added. Read `OWNER_SCHEMA` in `owner-portal.js`. Stop if anyone asks to press the install button as part of the test. Rollback SQL is part of the PR body.

### SL-013 — Andrew CRM discovery (still no integration)

**WHAT.** One change: a short note that the rdusa pass found no product name, URL, or API for Andrew's CRM. Expected outcome: those three fields stay UNKNOWN until Andrew answers. Acceptance: the note contains no credentials, no customer emails, and no replacement CRM. **HOW.** Ask Andrew. Do not scan the tracked order-run or prospect files for a vendor name (SL-027). No API write. **WHO.** Grok asks Andrew. Codex records only what Andrew confirms. Claude reviews for secrets. Mark confirms before SL-019 starts.

**Handoff.** The rdusa pass (`bc-d0a012b4`, main `839532a`) is the evidence. Docs mention the CRM. That is not identification. Stop when Andrew has not answered; do not ship a connector. Rollback: revert the note.

### SL-014 — Quo metadata map

**WHAT.** One change: a contract test for a Quo event reduced to `{ id, at, direction, disposition }` with an explicit deny-list for transcript, recording URL, and audio. Expected outcome: a fixture with a transcript fails the reducer. **HOW.** New pure module in SookLabs. Quo has no code in SEOS, rdusa, or sookly (rdusa docs only). Do not extend a connector that is not there. Quo MCP stays unused. **WHO.** Codex writes the reducer and tests. Claude reviews the deny-list. Cursor validates it is not wired to a live webhook. Mark approves any later subscription.

**Handoff.** Confirmed absent on 2026-10-15. Stop before any live call. No private call content in logs, tests, or room posts. Rollback: revert the pure module.

### SL-015 — Sookly enquiry handoff, read-only

**WHAT.** One change: document and test the existing Sookly transition from quarantined enquiry to a human-approved contact, using that repo's release matrix as the oracle. Expected outcome: no new CRM and no write to Andrew's CRM. Acceptance: the test named in `sookly-control/release-matrix.md` for quarantine / human review, once that file is opened. **HOW.** `mblackth-ai/sookly-omnichat` only. Look for the Journey branch before adding files. **WHO.** Codex adds a missing test only if the matrix requires one that is absent. Claude reviews tenant isolation. Cursor validates HQ was not given a second contact store. Mark approves.

**Handoff.** ops.json says staging is NOT TESTED. Do not deploy. If #93 is the only open governance doc, leave it unmerged. Stop if the work duplicates `cursor/operational-journey-engine-v1`. Rollback: revert the test PR.

## 12. Central nervous system

Mark's north star: one work-item lifecycle, a CRM that lives in Sookly, Andrew's existing CRM left in place, one RDUSA contact identity, and an HQ master view per tenant. HQ projects. It does not become a second CRM, a second ledger, or a mailbox.

Order is value first where the risk stays reversible. Identity resolution and email ingestion are last because they need consent and retention before any production read of those stores.

| Phase | Task | Value | Risk held back |
| --- | --- | --- | --- |
| 1 | SL-016 lifecycle + Execution tab | One status language for every client item | No customer data. Read-only tab. |
| 2 | SL-017 master view shell | Mark sees the four blocks, honestly empty | No live Xero, no invented revenue. |
| 3 | SL-018 Xero read-only numbers | Revenue and budget from the ledger | Fixtures in the PR. Live credentials wait for Mark. No Xero writes. |
| 4 | SL-019 Andrew CRM note relay | HQ shows his notes without replacing his system | Adapter fails closed until SL-013 names the product. |
| 5 | SL-020 Sookly work-item store | The CRM backend uses the SL-016 lifecycle | Production migration waits for Mark. |
| 6 | SL-021 Pipeline kanban | Extend `ContactsKanbanBoard.tsx` on sookly main | Read-only filters. No new board. No email import. |
| 7 | SL-022 Identity contract | Dedup rules exist before any merge of people | No ingestion. Consent and retention are required fields. |
| 8 | SL-023 Xero contacts on the identity | Ledger people join the graph | Read-only. Consent record required. |
| 9 | SL-024 Quo metadata on the identity | Calls show as metadata and summaries | No call content. Reuses SL-014. |
| 10 | SL-025 Joomla people on the identity | Site contacts join the graph | Read-only. No publish. |
| 11 | SL-026 Email gate | Twelve years of mail can be imported later | The PR refuses to import. Consent and retention are the gate. |

Xero, as observed this run: the agent session has a Xero MCP (list contacts, invoices, and payments, and also create/update tools). The SookLabs git tree has no Xero module. No Xero API call was made. The MCP is an operator tool. It is not the production adapter, and its write tools must not be copied into HQ.

Andrew's CRM: product name, URL, and API are UNKNOWN. SL-013 needs Andrew. Do not replace the CRM. Xero and Quo are not that system, and neither has code in the four repos.

### SL-016 — Work-item lifecycle and Execution tab

**WHAT.** One change: map the existing sookly ops-command states onto the client lifecycle, and add a read-only Execution tab. The machine on sookly main is `PROPOSED → AWAITING_APPROVAL → APPROVED → APPLYING → APPLIED`, stored as OperationsCommand, CommandProposal, CommandApproval, and CommandExecution, scoped by `workspaceId`. That maps to draft, approval, execution, and done. Expected outcome: the tab lists fixture rows in APPLYING / execution only. Acceptance: a rejected skip from PROPOSED to APPLIED, and no new WorkItem table in the diff. **HOW.** SookLabs projector plus the Execution tab. Do not create `lib/hq/work-item.js` as a second store. Do not rewrite `content-draft.js`. A new table is allowed only if Codex writes down why the four existing command tables cannot represent the row, and Claude agrees before the table is added. **WHO.** Codex maps and tests. Claude reviews the no-new-table rule. Cursor validates the tab is read-only. Merge and deploy are allowed. There is no migration.

**Handoff.** Verified on sookly main `777ce576`. There is no WorkItem model. Reuse the command tables in SL-020. Stop after the draft PR. Rollback: revert.

### SL-017 — Per-tenant master view shell

**WHAT.** One change: one founder page per tenant with four blocks: revenue and budget, marketing, Sookly highlights, pipeline. Every number has `source`, `period`, and `freshness`. Expected outcome: with no connectors configured, each block says unavailable. A fixture number missing any of the three fields is dropped. Marketing fixtures that include revenue attribution are dropped (SL-003). An Xero fixture may show an amount only when `source` is `xero`. Acceptance: the three-field rule, the attribution rejection, and a tenant switch that does not leak the other tenant's fixtures. **HOW.** SookLabs. Reuse `metric-envelope.js` once SL-003 exists. No Google client, no Xero client, no Sookly database. **WHO.** Codex implements. Claude reviews cross-tenant fixtures. Cursor validates both tenants. Merge and deploy are allowed; there is no credential and no migration.

**Handoff.** Depends on SL-016 only for the pipeline block's empty state (label it "not connected" if SL-016 has not merged; do not block the other three blocks). Stop after the draft PR. Rollback: revert.

### SL-018 — Xero read-only revenue block

**WHAT.** One change: fill the revenue and budget block from a read-only Xero client using fixture invoices and payments. Expected outcome: totals carry source `xero`, a period, and a captured-at freshness. The client module exports no create or update function. Acceptance: a test that the module's export list has no write symbol, and a fixture payment that belongs to another tenant is excluded. **HOW.** SookLabs server module. Do not call the live Xero MCP from the app. Do not import `create-contact`, `create-invoice`, `update-contact`, or `update-invoice`. Live org id and credentials stay empty in the PR. Pointing production at a real Xero org is a credential change and waits for Mark. **WHO.** Codex writes the fixture client and tests. Claude reviews the export surface. Cursor validates the master view still renders unavailable when the fixture flag is off. Mark's yes is required before any real token is set.

**Handoff.** Read §12. If the only Xero access is the operator MCP, leave the app client fixture-backed and say so in the PR. Do not pull a live invoice into the repo. Stop after the draft PR. Rollback: revert.

### SL-019 — Andrew CRM ownership map and read-only note relay

**WHAT.** One change: a document that says which RDUSA operations Andrew's CRM owns, plus a read-only adapter that relays note text into the HQ tenant projection. Expected outcome: when the product is still unnamed, the adapter returns unavailable and the page shows that. When a fixture note is supplied, HQ shows the note with source, period, and freshness. Acceptance: the adapter has no write method, and a fixture for a second tenant is not returned for RDUSA. **HOW.** SookLabs. Depends on SL-013. Do not fork his database. Do not sync bidirectionally. **WHO.** Codex implements the fail-closed adapter and tests. Claude reviews that the map does not assign his deals to Sookly. Cursor validates the RDUSA page. Mark confirms the ownership sentences before they are treated as true; until then they stay labeled UNKNOWN.

**Handoff.** Start from SL-013's findings. If that doc is still empty, this PR ships the fail-closed adapter and an ownership table full of UNKNOWN. Stop after the draft PR. No production credential. Rollback: revert.

### SL-020 — Sookly stores the work-item lifecycle

**WHAT.** One change: Sookly tests prove a CommandExecution row moves along the existing ops-command states and is invisible to another `workspaceId`. Expected outcome: no new WorkItem table. Acceptance: those tests, using the test command in the sookly repo. **HOW.** `mblackth-ai/sookly-omnichat` main `777ce576`. Extend OperationsCommand / CommandProposal / CommandApproval / CommandExecution. Do not add a parallel journey table. No migration is pending in git. Do not apply the 3 Oct migrations to production in this PR. PR #62 claims they were applied; that claim was not re-checked. **WHO.** Codex writes tests against the existing tables. Claude reviews the workspace predicate. Cursor validates HQ gained no copy. A production migration, if one becomes necessary, waits for Mark.

**Handoff.** SL-016 is the map. If the four tables cannot hold the row, stop and justify a table in the PR body. Do not add it in the same commit. Rollback: revert. No history rewrite.

### SL-021 — Pipeline kanban for suppliers, clients, and deals

**WHAT.** One change: extend `ContactsKanbanBoard.tsx` (`cac0648` on sookly main). Expected outcome: suppliers, clients, and deals render as columns or filters on that board, using the contact SOP stages already there, and an APPLYING item can be distinguished from a finished one. Acceptance: a fixture test that a second workspace's card is absent. No new board component. No drag-and-drop write. **HOW.** sookly-omnichat only. HQ's pipeline block may link here and must not copy cards into HQ. **WHO.** Codex extends the existing component and tests. Claude reviews that Andrew's CRM is not a new column. Cursor validates there is still one board. This PR does not migrate.

**Handoff.** The board is already on main. Do not build another. Do not import mail, Quo, or Xero. Contact staging stays `contact-crm-lifecycle.ts`. PR #3 is stale; do not revive it. Stop after the draft PR. Rollback: revert.

### SL-022 — Contact identity, consent, and retention

**WHAT.** One change: a pure identity record `{ id, displayName, sourceLinks[], consent, retention }`. `consent` names the person, the sources allowed, the date, and who approved. `retention` names the window and the deletion date. Expected outcome: a record with either field missing cannot be marked mergeable. Acceptance: tests reject a merge when consent or retention is absent, and reject two source links that claim different tenants. **HOW.** Sookly, pure module and tests. No mailbox, no Quo, no Xero call. **WHO.** Codex implements. Claude reviews the gate. Cursor validates no I/O was added. Mark must record the real consent and retention text before any later phase runs against production data. This PR does not collect that text from customers.

**Handoff.** Read §12. Twelve years of email is the scope Mark named; it is not permission to read a mailbox. Stop after the draft PR. Rollback: revert.

### SL-023 — Attach Xero contacts, read-only

**WHAT.** One change: link a fixture Xero contact onto an SL-022 identity when consent lists `xero` and retention is set. Expected outcome: without that consent the link is refused. Invoices and payments stay on the contact as read-only references, not copies of line-item history beyond id, status, amount, currency, and date. Acceptance: the refusal test and a test that a second tenant's contact is refused. **HOW.** Sookly or the HQ read model, one place only. Reuse the SL-018 fixture client. No Xero write. **WHO.** Codex implements. Claude reviews data minimization. Cursor validates tenant refusal. Live Xero still waits for Mark's credential yes.

**Handoff.** Depends on SL-018 and SL-022. Stop after the draft PR. Rollback: revert.

### SL-024 — Attach Quo metadata and summaries

**WHAT.** One change: attach SL-014's reduced Quo event to an identity when consent lists `quo`. Expected outcome: transcript, recording URL, and audio are still rejected. A summary field is allowed only if the fixture marks it as a human-written summary, and consent is present. Acceptance: the deny-list tests from SL-014 still pass, plus a missing-consent refusal. **HOW.** Consume `SL-014`'s reducer. Do not authenticate Quo in this PR. **WHO.** Codex implements. Claude reviews the summary rule. Cursor validates no webhook was registered. Mark's yes is required before any live Quo credential.

**Handoff.** Quo MCP was unauthenticated on 2026-10-15. Do not call it. Stop after the draft PR. Rollback: revert.

### SL-025 — Attach Joomla people, read-only

**WHAT.** One change: link a fixture Joomla contact id onto an identity when consent lists `joomla`. Expected outcome: no article publish method exists in the diff. Acceptance: unpublished versus missing id is distinguished, and a foreign tenant is refused. **HOW.** rdusa, next to the SL-011 read that wraps `scripts/joomla-publisher.mjs`. SEOS has no Joomla code. Fixture transport only. **WHO.** Codex implements. Claude reviews that publish stays out. Cursor validates the identity link. No production Joomla credential in the PR.

**Handoff.** Depends on SL-011 and SL-022. The client exists. Do not block on discovering Joomla. Rollback: revert.

### SL-026 — Email ingestion gate

**WHAT.** One change: an import function that returns `refused` unless it is given a consent record (mailbox, date range, purpose) and a retention window, both matching SL-022. Expected outcome: the twelve-year range Mark described is representable as a date range in the consent object, and the function still does not connect to a mailbox. Acceptance: missing consent, missing retention, and a range that exceeds the consented window are all refused; a fully populated fixture returns `ready` without performing I/O. **HOW.** Sookly pure module. No IMAP, no Google, no Microsoft client. **WHO.** Codex implements the gate and tests. Claude reviews that `ready` has no side effect. Cursor validates the module imports nothing that opens a socket. Mark's yes, plus the stored consent and retention decision, is required before any later PR adds a real mailbox client.

**Handoff.** This is the last phase. Do not start it by pulling mail "to see the shape". rdusa already tracks customer emails in about 50 files; do not copy them into this module. Stop after the draft PR. Rollback: revert.

### SL-027 — rdusa repo hygiene

**WHAT.** One change: stop tracking `codex_order_runs/` and fix the ignore rule. The rule is `.codex_order_runs/` (leading dot), so the real directory is not ignored. Expected outcome: `git check-ignore` matches `codex_order_runs/`, and `git rm --cached` removes it from the index without deleting the local files. Acceptance: a fresh clone of the PR branch does not list those paths, and the diff does not rewrite history. **HOW.** rdusa main `839532a`. Edit `.gitignore` and untrack only. Customer emails in about 50 other tracked files, and other prospect lists, stay in git for this PR. List their paths in the PR body. Do not paste addresses. A history rewrite that purges them is a separate decision and waits for Mark. **WHO.** Codex edits the ignore rule and the index. Claude reviews that no customer content was copied into the PR text. Cursor validates `git status` is clean of the order-run paths. Mark's yes is required before any `git filter-repo` or force push.

**Handoff.** Verified by pass `bc-d0a012b4`. The repo has no CI and no acceptance suite, so the check is `git check-ignore -v` plus `git ls-files`. Do not use SL-013 as an excuse to read those files. Stop after the draft PR. Rollback: revert the commit. That restores tracking. It does not restore a history rewrite, because this PR must not perform one.

## 13. What this preflight does not start

The tasks above are specified and not implemented. No Joomla publish, no Google pull, no CRM replacement, no Quo subscription, no mailbox import, no Xero write, no owner-table install, no MCP write tool, and no merge of #32, #33, #36, #37, #40, #42, SEOS #12, rdusa #6, or sookly #93.

Merge and deploy are available for a reversible PR that avoids migrations, credentials, spend, and production data writes. Those four still wait for Mark.

Next human step: Mark reads §4, §10, and §12. Grok dispatches SL-001 with the brief in §10, unchanged, to Codex, with Claude named as reviewer.
