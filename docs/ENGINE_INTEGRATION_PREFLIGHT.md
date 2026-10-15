# Engine integration preflight

Status: **design only**. This document is not production policy, not acceptance, and not a merge instruction.
Date: 2026-10-15
SookLabs `master` verified at `8c6d83a411a9ed93f8dddc07558eb052c017967e` (merge of PR #38, 2026-10-09).
Author of this plan: Cursor. Implementation of the SL tasks below is for other seats. Cursor does not review its own later diffs; Claude does architecture and security review, and a fresh Cursor session validates integration only after that review.

Draft governance PRs are **guidance only**. Do not merge them and do not cite them as production policy:

| PR | Head observed this run | Role |
| --- | --- | --- |
| [SookLabs #42](https://github.com/mblackth-ai/SookLabs/pull/42) | `d493ec47e6037df4815e1f365dbc65f7d9d0c506` on `docs/ecosystem-alignment-20261015`, draft, mergeable | Proposed cross-repo contract. Read via the GitHub API. |
| [SEOS #12](https://github.com/mblackth-ai/SEOS/pull/12) | **UNVERIFIED** | Named by Mark. This run's GitHub credential cannot see the private SEOS repo. |
| [rdusa #6](https://github.com/mblackth-ai/rdusa/pull/6) | **UNVERIFIED** | Same credential limit. |
| [sookly-omnichat #93](https://github.com/mblackth-ai/sookly-omnichat/pull/93) | **UNVERIFIED** | Same credential limit. |

No production code, migrations, deploys, or external writes were made while writing this file.

## How to read the labels

| Label | Meaning |
| --- | --- |
| PRESENT | Read in SookLabs `master` at `8c6d83a` this run. |
| RECORDED | Written in a SookLabs file about another repo or a live system. The file exists. The remote claim was not re-checked against that system this run. |
| PROPOSED | A design in this document or in unmerged guidance. Not built. |
| UNVERIFIED | Not observed. Do not treat as fact. |

Agent reports are claims. A green CI URL stored in `data/hq/ops.json` is RECORDED evidence of a past run, not a fresh production PASS.

## 1. What this run could and could not see

The GitHub credential in this environment can read `mblackth-ai/SookLabs` and the public user repos `learnseo`, `Conversation-Automator`, and `dogecoin-uk`. Clones and raw URLs for `mblackth-ai/SEOS`, `mblackth-ai/rdusa`, and `mblackth-ai/sookly-omnichat` returned "repository not found" / HTTP 404. Those trees were not opened. Canonical files named by `lib/hq/loop-policy.js` were not read:

- `sookly-control/release-matrix.md`, `current-state.md`, `active-tracks.md`
- `docs/SEOS-MVP-1.md`, `docs/mvp-smoke-checklist.md`, `docs/agent/DECISIONS.md`
- `rdusa-retainer-growth-system-v2/00_INDEX/RDUSA_RETAINER_GROWTH_SYSTEM_INDEX.md` and the promise-map, next-actions, and 2026-10-01 governance paths

Vercel MCP on team `mblackth-ai's projects` (`team_yps0YDzhZHS17S0sjE0Q8rG0`) returned zero projects. DigitalOcean Apps list returned an empty list. Deployed git SHAs are **UNVERIFIED**. Quo MCP is unauthenticated; no Quo tool was called.

Public HTTP this run (no login, no mutation):

| Host | Observed | Deployed SHA |
| --- | --- | --- |
| `https://hq.sooklabs.com` | HTTP 200, `server: Vercel`, title "SookLabs HQ" | UNVERIFIED |
| `https://seos.sooklabs.com` | HTTP 200, `server: Vercel`, title "SookLabs Expansion OS" | UNVERIFIED |
| `https://www.sookly.co/en` | HTTP 200 after redirects from `sookly.co`, `server: Vercel` | UNVERIFIED |
| `https://retaildisplayusa.com/` | HTTP 202 from nginx, HTML refresh to `/.well-known/sgcaptcha/` (SiteGround captcha) | CMS, Joomla version, and article API UNVERIFIED |

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

SEOS (other repo, UNVERIFIED source)
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
| Joomla draft → publish | Extend later, read-only first | `lib/hq/content-draft.js` is the approval rule | No CMS client PRESENT. Publication source of truth stays Joomla once identified. |
| GSC / GA4 numbers inside HQ | Reuse the SEOS summary | `lib/hq/analytics-summary.js`, `/hq/reports` | HQ must not add a second Google pull. |
| Shared metric definitions | Extend | New pure checker beside the analytics client | Reject attribution claims. Do not invent a warehouse. |
| SEOS Knowledge Base, Refactor Studio, social connectors | Reuse in SEOS | Paths only RECORDED (`src/lib/social-connectors.ts` in ops links) | Source UNVERIFIED this run. |
| Sookly receptionist, inbox, contacts | Reuse in sookly-omnichat | Release matrix is the acceptance authority | Source UNVERIFIED. Do not rebuild CRM in HQ. |
| Andolw CRM | Defer | Discovery only | Identity UNVERIFIED. Do not replace or fork. |
| Quo call content | Defer | Quo MCP needs auth | No private call content by default. |
| RDUSA client page | Extend with care | Owner rooms on master, guards on #40 | Channel `rdusa` is not the tenant boundary. |
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
| SookLabs #33, draft, `cursor/gemini-spark-relay-mds-fe50` @ `c1b6019` | Open. Channel registry and the reply-channel fix are already on master (`ROOM_CHANNELS`, `04a3457` is in history via #38). The branch still carries relay markdown and RoomBoard edits. | **Do not merge.** Split: close the code changes as superseded; salvage missing markdown only under SL-005 if a rebase shows those files still absent. |
| `docs/relay/10-claude-check-in-2026-10-05.md` on master | PRESENT through §26 | Keep as history. Later passes §27–§32 exist only on `origin/claude/hopeful-edison-x93kfj` @ `ac4ce80` (2026-10-10), which is **not** an ancestor of master. |
| Unmerged wake patch described on that branch (`docs/relay/patches/pr20-mcp-room-post-loop-wake.patch`) | **Not on master.** Gap re-checked in source: `app/hq/api/room/messages/route.js` calls `wakeFromDispatch`; `lib/hq/room-mcp.js` does not. | **Merge into SL-001.** Do not open a separate wake PR. |

### SEOS MVP smoke and analytics (SEOS repo — RECORDED, not re-read)

| Item | What the relay records | Disposition |
| --- | --- | --- |
| SEOS #8, Cursor smoke run, against main `38d0777` on 2026-10-05 | 12 pass, 5 not met, 2 not run. The five misses are checklist wording (`auth.restricted`, `auth.command-center`, `kb.badge`, `cc.scores`, `cc.feed`), not product bugs. `hq.local` fetches HQ without a session, so it can false-fail. `hq.prod` was not run. | **Keep the evidence. Do not close the finding.** Checklist edits are an authority change (Mark). False-fail fix is SL-006, and only after the SEOS file is actually opened. |
| Lockfile fix `fbf0170` (relay calls it SEOS #2) | On 2026-10-05 it was on `cursor/seos-social-control-plane-mvp1`, not `main`. Later ops.json records a PASS at that SHA. Whether it is inside SEOS main `f4505d4` is UNVERIFIED. | **Do not close the MVP branch** until someone with SEOS access runs `git merge-base --is-ancestor fbf0170 <main>`. If it is an ancestor, close the branch. If not, one PR ports the lockfile only. No second lockfile branch. |
| SEOS #9 | Relay §24: Mark merged it. Analytics `GET /api/analytics/hq-summary` and Prisma migration `20261005170000_add_analytics`. Companion to SookLabs #39. Head at the time `1eb2fdf` on `claude/gallant-lamport-dggvhh`, then main `f4505d4`. | **Already merged. Do not reopen.** Production application of the migration is UNVERIFIED. HQ Reports is built to show "unavailable" until the token and tables work. |
| SEOS #10 | Relay §24: merged automatic droplet deploy. Workflow does not run migrations and does not touch `/opt/seos/.env`. Review notes: require `DROPLET_KNOWN_HOSTS`; check `rsync --delete`. | **Keep the merged workflow.** Host-key and rsync follow-ups are SL-007, after the workflow file is read. This run also saw `seos.sooklabs.com` answering from Vercel. Which host is production is **UNVERIFIED**. Do not add a third deploy path. |
| `cursor/seos-prisma-lock-postgres-f2a3` @ `33d1c76` | Relay §28 on the unmerged hopeful-edison tip, 2026-10-09. Rewrites the authority migration from SQLite to Postgres, CI job `prisma-migrate`, baseline via `migrate resolve` because production used `db push`. | **Keep. Merge into SL-008.** Do not open another Prisma-lock branch. Do not run `migrate resolve` or `migrate deploy` against production in that PR. |
| `cursor/seos-social-control-plane-mvp1` | Named in `four-fronts.js`. Tip not fetched. | **Keep** until the ancestor check above. Do not start a replacement MVP branch. |
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
| rdusa #6 and `cursor/rdusa-internal-retainer-control-v1` | PR contents UNVERIFIED. Branch name is only in `four-fronts.js`. | **Keep #6 as draft guidance. Do not merge.** Do not open a new RDUSA governance doc. Confirm the retainer branch still exists before any commit on it. |
| `lib/hq/content-draft.js` RDUSA article rules | PRESENT, tested, not wired to Joomla | **Keep.** SL-009 may call it. Do not rewrite the state machine. |
| Public site `retaildisplayusa.com` | Captcha wall this run. Joomla UNVERIFIED. | No workflow PR until a read-only article id and revision are observed. |

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
UNVERIFIED Joomla unpublished article (id + revision)
  → SEOS preview in the RDUSA tenant          PROPOSED, source UNVERIFIED
  → comment / proposed edit without publish   PROPOSED
  → Mark approves the exact body hash         PRESENT as checkTransition in content-draft.js
  → a later edit clears that approval         PRESENT (hash mismatch denies publish)
  → Codex records joomla_id                   PRESENT as a field rule only
  → Joomla write / public URL                 ABSENT
  → GSC/GA4 read-only pull in SEOS            RECORDED as SEOS #9 summary, freshness UNVERIFIED
  → HQ client report for that business only   PRESENT as /hq/reports and /hq/client projection
```

Human gates: Mark approves the exact revision; a stale Joomla revision must fail closed; no seat self-approves; no autonomous publish. SEOS Refactor Studio acceptance stays a separate gate (RECORDED in #42 and the control plane). This pilot does not redefine it.

### Enquiry → CRM quote

```
Site or Sookly inbox enquiry                  Sookly source UNVERIFIED
  → human review / quarantine                  RECORDED as Sookly's rule in #42; preserve it
  → Sookly contact                              Sookly owns this CRM once the release matrix says so
  → Andolw's existing CRM quote / order         UNVERIFIED system
  → HQ shows status                             PROPOSED read-only projection
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
| Joomla read DTO `id`, `revision`, `title`, `body`, `state=unpublished` | SL-009 | Read-only. No write method in that PR. |
| CRM map | SL-011 | Empty until the product name and auth exist. |
| Quo metadata | SL-012 | Ids, timestamps, direction, disposition. No transcript or recording by default. |

### RECORDED, source not opened

SEOS Prisma migrations `20260716193000_add_authority_tracker` (SQLite history, Postgres rewrite on the unmerged branch) and `20261005170000_add_analytics`. Sookly release-matrix rows. RDUSA promise map.

## 8. Risks and human gates

| Risk | Evidence | Gate |
| --- | --- | --- |
| Sibling repos invisible to this credential | Clone 404 | Do not invent SEOS, Sookly, or RDUSA file contents. SL-006, SL-007, SL-008, SL-009 stop until the tree is opened. |
| Deployed SHA unknown while homepages return 200 | Header probe | No production PASS. `hq:verify-deploy` was not run; it needs the deploy script's expected inputs and was out of scope. |
| Two SEOS hosts possible (Vercel response vs RECORDED droplet workflow) | Both observations | Mark names the production host before any deploy change. |
| Owner link can be burned | `redeemOwnerInvite` lines 123–141 | Do not install owner tables. SL-002 first. |
| `/hq/api/client/*` open on master | `middleware.js` | #40 after rebase. Future client routes must stay on the allow-list. |
| `rdusa` channel ≠ tenant isolation | `ROOM_CHANNELS` plus Codex review in the relay | Client data goes through owner rooms, scoped by the key. |
| Commercial figure in `control-plane.js` | Field present | Do not copy it into docs, prompts, or reports. Removing it is a separate Mark decision, not this PR. |
| Analytics could be read as sales proof | Client has positions and, on the reports page, sessions/clicks RECORDED in `docs/HQ-OWNER-ROOMS.md` | SL-003 refuses attribution language. Work completed is not a business outcome. |
| Joomla write without revision check | No client yet | Publish stays behind `content-draft.js` plus a stale-revision check that does not exist yet. |
| Andolw CRM unknown | Web search found Andrew Abrecht as president of Retail Display USA, phone and `Andrew@RetailDisplayUSA.com` on the public US Visual catalog page `retaildisplayusa.usvisual.com`. No CRM product, login, API, webhook, or retention terms. QuickBooks appears only as a public profile skill, not as this CRM. | Do not integrate. The name match is not identity proof. |
| Quo | MCP `needsAuth` | No call content. No connector until consent and scopes are written down. |
| MCP `room_post` does not wake the loop | Source comparison | Pull seats (Cursor, Codex, Claude) would look idle to the loop. Fixed only inside SL-001. |
| Self-approval | Content draft and enroll already forbid some of this | SL cards must forbid the assignee from recording their own review. |
| #42 / #12 / #6 / #93 merged by habit | They are drafts | Leave them drafts. |

Mark still approves merges, production deploys, production migrations, credentials, spend, external publishing, and customer messages.

## 9. How SL tasks are staffed

Default seats, already in `ROOM_SEATS`:

| Role | Seat | Does | Does not |
| --- | --- | --- | --- |
| Specify | `grok` | Posts the SL baton using the brief below, unchanged in scope | Redesign the task |
| Implement and write tests | `codex` | One PR, one change | Review that same PR |
| Architecture and security review | `claude` | Review the diff against the brief and the gates | Implement the same task |
| Integration validation | `cursor` | Fresh session checks merge, tests, and neighboring routes | Architecture-review its own plan or Codex's PR in place of Claude |
| Approve | `mark` | Merge and any production gate | — |

This preflight is Cursor's design. Grok's specify step is to dispatch the brief, not to replace it. A scope change is a new SL id and a Mark decision.

Every task is one independently testable PR. No agent reviews its own work. Stop rules in each brief are mandatory.

## 10. First three PRs

Do these in order. SL-001 is the only way later tasks should be handed off. SL-002 removes a data-loss bug before any client workspace work. SL-003 freezes metric language before any new Google use.

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

- One function's atomicity. Do not add key expiry, workspace ids, or middleware allow-lists here. Those stay follow-ups (SL-010) and #40.
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

These are specified so a seat can start cold after SL-001 exists. They are not permission to skip the reconciliation in §4.

### SL-004 — Rebase the Gemini relay helper onto master

**WHAT.** One change: rebase SookLabs #32 so `lib/hq/drive-bridge.js` uses the dedupe helper in `lib/hq/gemini-relay.js` instead of a second copy. Expected outcome: one function builds the Drive claim key, with the existing bridge tests and the #32 unit tests both passing. Acceptance: `node --test lib/hq/drive-bridge.test.js lib/hq/gemini-relay.test.js` green; no new Google call. **HOW.** Continue from a rebase of `cursor/gemini-drive-relay-1d22` onto current master. Do not open another relay branch. Test env is `node --test` without Drive credentials. **WHO.** Codex rebases and tests. Claude reviews secret quarantine still holds (`SECRET_RULES` in `drive-bridge.js`). Cursor validates the import is the only behavior change. Mark merges #32 or the replacement PR and closes the leftover branch.

**Handoff.** Read `lib/hq/drive-bridge.js` and the #32 versions of `gemini-relay.js`. The relay text says the dedupe formulas already match; prove that with a test vector, and if they differ, stop and ask Mark which key wins. Stop rules: no new scheduler, no service-account JSON, no change to room routing, stop after the draft PR. Rollback: revert; the bridge on master keeps working.

### SL-005 — Salvage #33 markdown or close it

**WHAT.** One change: a docs-only PR that copies relay markdown from `cursor/gemini-spark-relay-mds-fe50` which is still absent on master, or a PR comment that lists zero missing files. Expected outcome: #33 can be closed without losing batons Mark still wants. Acceptance: `git diff master...<salvage>` contains no `app/`, `lib/`, or `components/` changes. **HOW.** SookLabs. Compare the #33 file list in §4 to master. **WHO.** Cursor prepares the diff (docs only). Claude checks the pages do not declare themselves ratified policy. Mark closes #33.

**Handoff.** Channel code on #33 is superseded. Do not re-apply `RoomBoard.jsx` or `swarm-routing.js` from that branch. Stop if the salvage would edit canonical HQ policy; those sentences stay in the historical branch. Rollback: close the salvage PR.

### SL-006 — Fix the SEOS `hq.local` smoke false-fail

**WHAT.** One change, in SEOS: the automated `hq.local` check signs into HQ before looking for the SEOS link. Expected outcome: an HQ login page without a cookie is not scored as a missing cross-link. Acceptance: a fixture HTTP server that returns the login HTML on the first GET and the knowledge-base link after `POST /hq/api/login` passes; a refused login is `NOT_RUN` or a blocked state, not `NOT_MET` for the product. **HOW.** Repo `mblackth-ai/SEOS`. Find the #8 smoke runner by searching for `hq.local`. Do not edit `docs/mvp-smoke-checklist.md` in this PR (authority change). Test env: the SEOS test command recorded in that repo's README or CI workflow, discovered at start, not guessed. Required access: SEOS push. HQ password only via the local test env, never committed. **WHO.** Codex implements. Claude reviews cookie handling. Cursor validates the check still cannot mark a provider Connected. Mark approves.

**Handoff.** Relay §6 (master copy of `docs/relay/10-claude-check-in-2026-10-05.md`) is the claim. Re-read the SEOS files before editing; if #8 is already fixed, close this task with the commit SHA. Stop rules: do not change checklist wording, do not run `hq.prod`, do not deploy, stop after the draft PR. Rollback: revert the test-only change.

### SL-007 — Droplet deploy host key

**WHAT.** One change: SEOS `deploy-droplet.yml` fails closed when `DROPLET_KNOWN_HOSTS` is empty. Expected outcome: a job cannot ssh-keyscan an unknown host and then deploy. Acceptance: a workflow test or a documented dry review plus a unit/shell check if the repo already has one; the workflow does not gain a migrate step. **HOW.** SEOS. Read the workflow at the current main SHA before editing. **WHO.** Codex edits the workflow. Claude reviews the SSH trust change. Cursor validates it still deploys only the CI SHA and still does not touch `.env`. Mark approves, and Mark is the one who stores the known_hosts secret.

**Handoff.** Source of the finding: relay §24, not a fresh file read. If the workflow already requires the secret, stop and record the line. Do not change `rsync --delete` in this PR. Do not deploy. Rollback: revert the workflow.

### SL-008 — Finish the SEOS Prisma lock branch

**WHAT.** One change on the existing branch `cursor/seos-prisma-lock-postgres-f2a3`: add a read-only diff step that runs `prisma migrate diff` from a scratch database to the migrations directory and fails if unexpected SQL appears. Expected outcome: CI proves the rewritten migrations apply on empty Postgres, and the PR description tells Mark to run the production diff himself before any `migrate resolve`. Acceptance: CI job green on an empty Postgres service; the PR does not call production `DATABASE_URL`. **HOW.** Stay on that branch. Rebase onto current SEOS main. Do not open a second migration rewrite. **WHO.** Codex adds the CI step and tests. Claude reviews the SQLite-to-Postgres rewrite and the checksum warning in relay §28. Cursor validates no `migrate deploy` against a live URL. Mark runs any production baseline later, outside this PR.

**Handoff.** Relay §28 at hopeful-edison `ac4ce80` is the brief of record until the branch is opened. If the branch is gone, stop. Do not `resolve --applied` anything. Rollback: reset the added CI commit; leave the rewrite for Mark to reject separately.

### SL-009 — Joomla unpublished read (no publish)

**WHAT.** One change: a SEOS read function returns `{ id, revision, title, body, state }` for one unpublished article, with a fixture transport. Expected outcome: tests pass without a network. A `state` other than unpublished is an error. There is no publish method in the diff. **HOW.** SEOS, new branch, calling `content-draft` rules only by copying the hash/status idea or by a documented HTTP later. Do not import SookLabs code across repos. Joomla base URL and token stay in env examples, empty. **WHO.** Codex implements against fixtures. Claude reviews that no write verb exists. Cursor validates the DTO matches §7. Mark approves before any real token is used.

**Handoff.** Joomla on `retaildisplayusa.com` was **UNVERIFIED** this run (SiteGround captcha). Stop immediately if the repo has no existing Joomla client and no Mark-supplied API note: do not guess the vendor's REST shape. Prefer an existing client in SEOS if one is found. No autonomous publish. No production article fetch in CI. Rollback: revert.

### SL-010 — Owner key expiry and stable business id

**WHAT.** One change: `hq_owner_access` gains `expires_at`, `ownerForKey` rejects expired rows, and the business binding uses an id that does not change when a slug is renamed. Expected outcome: a 90-day server expiry matches the cookie comment in `docs/HQ-OWNER-ROOMS.md`, and a slug edit cannot retarget the owner. Acceptance: disposable-Postgres tests for expired, revoked, and renamed-slug. **HOW.** SookLabs. This is a production schema change. Ship the DDL in a reviewed SQL file with a rollback `ALTER`/`DROP COLUMN` note. Do not execute it on production in the PR. Do not combine with #40's UI. **WHO.** Codex writes SQL and tests. Claude reviews tenant binding. Cursor validates middleware is untouched. Mark applies the migration himself after merge.

**Handoff.** Depends on SL-002 already merged so the redeem path is transactional before new columns are added. Read `OWNER_SCHEMA` in `owner-portal.js`. Stop if anyone asks to press the install button as part of the test. Rollback SQL is part of the PR body.

### SL-011 — Andolw CRM discovery note (still no integration)

**WHAT.** One change: a short doc in the RDUSA repo, or in SookLabs if RDUSA is still inaccessible, that records only observed facts: product name, URL, vendor, owner, auth, entities, webhooks or polling, and which system is record of truth. Expected outcome: every unknown field says UNVERIFIED. Acceptance: the doc contains no credentials and no copied customer records, and it does not propose a replacement CRM. **HOW.** Read-only discovery. Browser or vendor docs. No API write, no account creation. **WHO.** Cursor or Codex may draft from evidence Mark supplies. Claude reviews for secret leakage. Mark confirms the identity. Grok does not guess a vendor.

**Handoff.** Start from §8 of this file. The public name Andrew Abrecht is a lead, not a conclusion. Stop when the CRM is still unnamed; ship the UNVERIFIED page rather than a connector. Rollback: revert the doc.

### SL-012 — Quo metadata map

**WHAT.** One change: a contract test for a Quo event reduced to `{ id, at, direction, disposition }` with an explicit deny-list for transcript, recording URL, and audio. Expected outcome: a fixture with a transcript fails the reducer. **HOW.** SookLabs or Sookly, wherever the inbox boundary already lives. If that code is only in sookly-omnichat, do the work there and do not fork it into HQ. Quo MCP stays unused until Mark completes auth for a read-only scope. **WHO.** Codex writes the reducer and tests. Claude reviews the deny-list. Cursor validates it is not wired to a live webhook. Mark approves any later subscription.

**Handoff.** Quo was `needsAuth` on 2026-10-15. Stop before any live call. No private call content in logs, tests, or room posts. Rollback: revert the pure module.

### SL-013 — Sookly enquiry handoff, read-only

**WHAT.** One change: document and test the existing Sookly transition from quarantined enquiry to a human-approved contact, using that repo's release matrix as the oracle. Expected outcome: no new CRM and no write to Andolw. Acceptance: the test named in `sookly-control/release-matrix.md` for quarantine / human review, once that file is opened. **HOW.** `mblackth-ai/sookly-omnichat` only. Look for the Journey branch before adding files. **WHO.** Codex adds a missing test only if the matrix requires one that is absent. Claude reviews tenant isolation. Cursor validates HQ was not given a second contact store. Mark approves.

**Handoff.** ops.json says staging is NOT TESTED. Do not deploy. If #93 is the only open governance doc, leave it unmerged. Stop if the work duplicates `cursor/operational-journey-engine-v1`. Rollback: revert the test PR.

## 12. What this preflight does not start

Streams A–F are planned above and not implemented. No Joomla publish, no Google pull, no CRM sync, no Quo subscription, no owner-table install, no MCP write tool, no merge of #32, #33, #36, #37, #40, #42, SEOS #12, rdusa #6, or sookly #93.

Next human step: Mark reads §4 and §10. Grok dispatches SL-001 with the brief in §10, unchanged, to Codex, with Claude named as reviewer.
