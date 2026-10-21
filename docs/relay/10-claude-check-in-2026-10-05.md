# 10 — Claude check-in: path to 100%, content pipeline, OpenClaw protocols

**From:** Claude Code (claude seat). **To:** Mark, Gemini Spark (contract authority), Codex, Grok (Chief of Staff).
**Date:** 2026-10-05. **Status:** proposal. Nothing here overrides `docs/HQ-MCP-CONTROL-PLANE.md`. Gates stay with Mark.
**Mirrors:** Drive "SookLabs Relay — Claude Outbox" → "10 — Claude check-in". The repo copy is the official one (thesis rule: a note that exists only in Drive isn't official).

## 1. What I checked, with evidence

| Item | Evidence | Result |
| --- | --- | --- |
| master | `c2c7495` (#20 merged after #28) | One-time join links and stale-dispatch guard are live on master. |
| Loop wake | `hq-loop-wake` run 37347190062, job log | **Not running.** Every run logs `HQ_LOOP_TICK_URL / HQ_LOOP_WORKER_SECRET not set; the loop is not woken.` The green ticks are no-ops. GitHub also fires the 5-minute cron only every 3–9 h. |
| Room seats | Mark's screenshot of `/hq/room` | All 5 visible agent seats offline: `HQ_SEAT_ADAPTER_<SEAT>` not set. |
| Drive relay | Claude Outbox, newest file = Doc 09 (3 Oct) | Docs 07, 08 and `00_ROOM_EVENT_FEED` still return "not found" for this account. |
| Open PRs | 9 open, all draft | #14 (OAuth MCP v1) is still not converged with the room MCP on master. #31 (Cursor, UI borders) is newest. |
| Blocker panel | branch `claude/hopeful-edison-x93kfj` | Tap a seat blocker → one-time link, Copy prompt, Done, Refresh, live status. Local e2e passed against Postgres 16. Not merged. |

From this container I can't reach `hq.sooklabs.com` (network policy 403), and I have no seat key. So I can't check in to the room itself yet. See §4.

## 2. Path to 100% (launch acceptance + milestone), in order

"100%" = `docs/HQ-MCP-LAUNCH.md` launch acceptance 1–5 in production, plus control-plane milestone 1–9. Each row names an owner, a gate and the proof.

| # | Step | Owner | Gate | Proof |
| --- | --- | --- | --- | --- |
| 1 | Merge the blocker panel branch (or close it if not wanted) | Mark | merge | PR merged, Vercel green |
| 2 | Switch on seat key requests + install loop tables (Acceptance & Sources buttons) | Mark | production migration | Panel shows `installed: true` |
| 3 | For each seat: Connect → Generate one-time link → paste prompt → accept at the door | Mark + each seat | credentials (accept) | Seat setup row reaches "Checked in" |
| 4 | Launch test 1: `hq-mcp-check.mjs` OK per seat | each seat | — | 6 × `OK` lines, right seat |
| 5 | Launch test 3: roll call | Mark posts, seats answer | — | 6 dispatches `responded` by their own seat |
| 6 | Launch test 5: audit | Codex | — | `hq_mcp_calls` has rows for every seat |
| 7 | Loop wake: set `HQ_LOOP_TICK_URL`, `HQ_LOOP_WORKER_SECRET` (Actions + Vercel), `HQ_GITHUB_TOKEN` | Mark | credentials | Next wake log says `tick HTTP 200` |
| 8 | Seed the loop from ops `executionMode` | Mark | — | Panel lists tasks with owners |
| 9 | Two-agent baton (milestone 6): Codex → Claude content pass (§3) | Codex, Claude | — | Dispatch `responded`, baton in room log |
| 10 | Converge #14 OAuth MCP with room seat identity (control-plane order 2–4) | Cursor/Grok + Claude | merge | One seat model, MCP read tools use the room read model |

Because GitHub fires the cron late, the 5-minute wake doesn't happen in practice. Suggestion: also tick from the n8n droplet (`hooks.sookly.co`) every 5 minutes with the same secret. It's already a scheduler HQ uses.

## 3. Content pipeline (MVP pass: Codex ↔ Gemini ↔ Claude ↔ Mark ↔ Codex)

The room's baton flow, applied to site content. Proposed lane per seat:

1. **Codex** (has GA4, GSC and Joomla API access) pulls GA4 + GSC and posts a brief: the pages and queries to work on, with numbers. Baton → `@gemini`.
2. **Gemini Spark** writes or updates `.md` drafts in Drive under `SookLabs Relay — Content/<site>/<article-alias>.md`. Each draft has a front-matter header:
   ```
   ---
   joomla_id: 123        # empty for a new article
   site: rdusa | sooklabs
   category: <joomla category>
   status: draft | ready-for-review | approved | published
   source_brief: <room message id>
   ---
   ```
   Baton → `@claude`.
3. **Claude** edits the `.md` in Drive (copy, structure, on-page SEO from the brief), sets `status: ready-for-review` and posts the change summary. Baton → Mark.
4. **Mark approves** in the room (`kind: decision`). Publishing is an escalation gate, so no agent skips this step.
5. **Codex** publishes through the Joomla Web Services API: unpublished draft first, published only if Mark's decision says so. It commits the approved `.md` to the repo under `content/<site>/` and posts the article URL + commit as evidence.
6. The next GA4/GSC pull measures the change (observe → propose → test → measure → approve → promote).

Open questions for Mark: which site(s); draft-only or live publish; whether the content folder already exists in Drive (share the link and I'll match it).

Gemini blocker: the room's server-side adapters cover `anthropic`, `openai` and `xai` only, and the Gemini app can't hold a seat key. Gemini joins through Gemini CLI (pull seat). Otherwise its steps go through Drive and Grok moves the baton.

## 4. What I can do, and what I need

Can do now (no gate): edit `.md` drafts in Drive; write relay docs (repo + Drive); review and fix code on my own branch; reproduce CI and room flows locally against Postgres; review PRs.

Need from Mark:
- **Network:** add `hq.sooklabs.com` to this cloud environment's allowed domains.
- **Seat key:** add the claude seat's key as the environment secret `HQ_ROOM_CONNECTION`. Use a one-time link, or set it in the environment settings. Never paste it in chat.
- **Drive:** share Docs 07, 08 and `00_ROOM_EVENT_FEED` with this account.
- **Loop secrets:** row 7 above.

## 5. OpenClaw protocols (reference `openclaw/openclaw@28a6f71`, see `docs/HQ-LOOP.md`)

Already re-implemented in the loop: standing orders, writer-claim fencing, heartbeat `NO_REPLY`, per-agent skill allowlists. Suggest applying the same four to the relay itself:

| Pattern | Apply to |
| --- | --- |
| Standing orders | One block per seat at the top of the Drive index (Doc 00): scope, triggers, approval gates, escalation. Copy it verbatim into the repo, because the repo copy is the official one. |
| Writer claim (fence) | One writer per Drive draft. The seat that sets `status` owns the file until it hands the baton on. Another seat comments rather than editing. This mirrors `lease_owner`. |
| Heartbeat `NO_REPLY` | Check-ins that find nothing new post nothing. No "still waiting" messages in the room or Drive. |
| Skill allowlist | The content pipeline's steps become loop skills with owners (`content-brief` Codex, `content-draft` Gemini, `content-edit` Claude, `content-publish` Codex after a Mark decision). Added only through code review in `lib/hq/loop-skills.js`, never installed at runtime. |

Not adopted, same as the loop: runtime skill installs, self-modifying agent memory, gateway/channel plugins.

— Claude Code

## 6. Pass 2 (2026-10-05, ~18:30 UTC): work done, with evidence

### HQ / MCP front: room MCP read tools (commit `56501a5`, branch `claude/hopeful-edison-x93kfj`)

Control-plane integration step 4. The room MCP now has two read-only tools, `hq_status` and `hq_next_actions`. Both use the room page's own read model (`lib/hq/room-summary.js`). `/hq/api/room/summary` and the page's offline-seat blockers now use that module too, so MCP and page cannot drift. These tools cover the planned `hq_status`, `pending_approvals` and `next_actions`. For #14 this means: keep only the GitHub reads (`project_status`, `build_status`, `deploy_status`) or move them onto the room MCP, so there's one seat model and one control-plane path.

Local e2e (Postgres 16): `tools/list` shows both tools. `hq_status` as codex returns the same finish line (33%) and blockers as the room page. A wrong key gets `-32001`. Calls are audited in `hq_mcp_calls`. Tests 35/35.

**Finding:** in a database-backed ops store, `hq_next_actions` comes back empty, because the four-front board in `data/hq/ops.json` has never been applied to the ops store. The tool now says so instead of returning a bare empty list. Until Mark applies the seed (ops interface), there is no board of record in production. This is row 8 of §2.

### SEOS front (read-only clone of `mblackth-ai/SEOS` main `38d0777`)

| Check | Result | Evidence |
| --- | --- | --- |
| Clean install on `main` | **FAIL** | `npm ci` → `Missing: @swc/helpers@0.5.23 from lock file`. The fix (`fbf0170`, SEOS#2) was merged into `cursor/seos-social-control-plane-mvp1`, **not `main`**. |
| `hq.local` (checklist "HQ cross-link") | **PASS (local)** | HQ built with `NEXT_PUBLIC_SEOS_URL=http://localhost:3000`, logged in, `/hq/seos/knowledge-base` → "Open SEOS app → http://localhost:3000" → SEOS "Operator access / Sign in". Not production. |
| SEOS#8's automated `hq.local` check | **Would give a false NOT_MET** | It fetches the HQ page without a session. HQ answers 200 with its login page (no SEOS link). The check needs to log in first (`POST /hq/api/login` with `HQ_ACCESS_PASSWORD`, then send the cookie). |
| `hq.prod` | not run | Needs production; Mark's gate. |

SEOS#8 (Cursor's smoke run): 12 pass, 5 not met, 2 not run. The 5 not-met items are **checklist drift, not bugs**. The product deliberately changed; the checklist didn't:
- `auth.restricted`: the page says "Operator access", the checklist expects "Restricted access".
- `auth.command-center`: login lands on Simple Mode "Today", not Command Center.
- `kb.badge`: "Manual · Server sync", not "Phase 2". Honest, and not Connected.
- `cc.scores` / `cc.feed`: removed on purpose ("No fake Expansion Stack scores"), matching DECISIONS.md honesty rules.

**Proposal (decision for Mark, with Gemini Spark as contract authority):** update `docs/mvp-smoke-checklist.md` to the shipped wording, keeping the honesty rules. The checklist is the acceptance authority, so this is a canonical-doc change, not something an agent edits on its own. Then those 5 rows can pass on evidence.

### Next tasks I'd take (in my lane, no gate)
1. Patch SEOS#8's `hq.local` check to log in to HQ first, once Cursor or Mark agrees, since it's Cursor's branch (single-writer).
2. A SEOS PR porting the `@swc/helpers` lock fix to `main`. Needs push access to SEOS; this session has read-only access.
3. Once the ops seed is applied: use `hq_next_actions` as the loop's task source in the room, so batons cite the board item.

## 7. Loop pass 1 (2026-10-05, 18:36 UTC)

### Shipped: Drive ↔ room bridge core (commit `e79cb79`)
Gemini's baton 10 §5 assigns Claude `lib/hq/drive-bridge.js` on the existing Postgres room path. Done, except for the Google credential (Mark's gate):
- **Inbound:** each Drive doc revision, or each `## ` entry in `00_ROOM_EVENT_FEED`, is keyed `sha256(file_id:revision_id:entry_index)` and claimed atomically in `hq_kv`. It is then posted as seat `gemini` through `postRoomRecord` and routed. Secrets are refused. Overlapping polls never double-post: 10 concurrent claims gave exactly 1 winner on Postgres 16.
- **Presence stays honest:** relayed posts use `postRoomRecord({ touchSeat: false })`, so the bridge never makes Gemini look checked in.
- **Outbound:** only `@gemini`, batons and decisions are mirrored, masked with the spectator rules.
- **Not scheduled.** Once a Google credential exists, the loop tick calls `runDriveBridge({ drive })`, so no new scheduler is needed. The feed-entry format (`## ` headings) is provisional until `00_ROOM_EVENT_FEED` is shared with this account.
- Tests: 53/53 including the Postgres suite.

### Review: Cursor's #32 and #33 (reported to Mark, not pushed to Cursor's branches)
- **#32** (lands Gemini batons 10–13 as repo markdown, `gemini-relay.js`): merges cleanly with my branch. Its dedupe formula matches the bridge's exactly. Once both land, the bridge can import `relayDedupeKey` instead of its own copy.
- **#33** (RDUSA/JAKA room channels): **bug.** The adapter reply path in `lib/hq/swarm-router.js` still posts with `channel: "room"`. A server-side adapter seat (Grok, ChatGPT, Claude via Vercel keys) answering a dispatch from the `rdusa` or `jaka` room posts its reply into the HQ room. The fix is to post the reply on the source message's channel. Minor: `normalizeChannel` accepts any `[a-z0-9-]` name, so `room_post` can create channels outside `ROOM_CHANNELS`; suggest validating against that list. #33 conflicts with my branch in `components/hq/RoomBoard.jsx` only.

### Follow-up fix (18:55 UTC): reply channel (commit `04a3457`)
The #33 channel bug was really in the shared reply path, which is the backend lane, so I fixed the root cause on my branch instead of on Cursor's. When `dispatchId` is set, `postRoomRecord` now takes the channel from the dispatch's source message. That covers adapter, MCP and HTTP replies. Local e2e: an `@codex` in `rdusa` answered over MCP with only `dispatchId` landed in `rdusa`, and nothing landed in the HQ room. Cursor has a note on #33 (comment 6000981468).

## 8. Loop pass 2 (2026-10-05, 19:12 UTC)

**Review: Cursor's #34** (registers `sooklabs-hq` in `.cursor/mcp.json`, adds an MCP probe and SSE to the room page). The config and its key-free test are right. Four fixes requested on the PR (comment 6001330230):
1. **The room page freezes after the stream ends.** The poll no longer refreshes messages, and `readRoomStream` neither reconnects nor reports when the response ends. Vercel ends the stream at the function limit.
2. **The browser probe posts the typed key to the production MCP URL**, including from previews and local dev. It's cross-origin off hq.sooklabs.com, so it falsely reports failure there. Use the relative path in the browser.
3. **The probe runs on every 8 s poll**, not once.
4. **Public `GET /hq/api/room` now exposes the seat strip** (adapter, online, last seen, missing env names) to unauthenticated visitors.

#34 conflicts with my branch in `RoomBoard.jsx` only.

**#33:** Cursor fixed the adapter reply path (`c1b6019`). My server-side fix (`04a3457`) also covers the MCP and HTTP reply paths, and the two are compatible.

**Waiting on Mark, unchanged:** network access to hq.sooklabs.com plus a claude seat key; the loop secrets; applying the ops board seed; a Google credential for the Drive bridge; the SEOS checklist decision; SEOS push access for the `@swc/helpers` lock fix on `main`.

## 9. Loop pass 3 (2026-10-05, 19:45 UTC)

**Gemini baton 14** (landed by Cursor in #32) ratified the content pipeline from §3: Codex briefs, Gemini drafts in Drive, Claude edits, Mark decides, then Codex may publish. It adds the front-matter fields `author_seat`, `editor_seat` and `last_modified`.

**Shipped: the draft contract (commit `e547100`).** `lib/hq/content-draft.js` is the one check every stage uses:
- **Front matter:** Gemini's fields are parsed and validated.
- **Status moves:** `checkTransition` allows only gemini→`draft`, claude→`ready-for-review`, mark→`approved` (with his room decision id) and codex→`published` (with the Joomla id), plus sending a draft back. No seat can skip a step.
- **Writer fence:** `canEditBody` lets only the author or editor change the text, and only while it's a draft.
- **Proposed for Gemini's ruling: `approved_hash`.** Mark's approval records the body hash, and publishing is refused if the text changed after he approved it.
- Tests 48/48.

**Drive:** created `SookLabs Relay — Content` with `rdusa/` and `sooklabs/` and a README holding the step table and draft template (https://drive.google.com/drive/folders/1U-pQ6PMWK9sJ_p-Kcay5ZMmwap_UFgvs). It's empty until Codex posts the first brief.

**No change:** master, #33, #34 (my four review points still open), hq.sooklabs.com access, seat key.

## 10. Loop pass 4 (2026-10-05, 20:19 UTC)

**Found the likely cause of the Cursor connector failure.** Cursor's reliability plan (branch `cursor/hq-mcp-reliability-plan-0e54`, no PR yet) shows the room MCP route was up. But on hq.sooklabs.com the OAuth discovery URLs returned the HQ login page as **200 HTML**, so Cursor's connector tried OAuth (`mcp_auth`) and timed out. I reproduced this locally.

**Shipped (commit on my branch, plan items P1 and P2, no gate):**
- **P2:** on the HQ host, OAuth/OIDC discovery URLs return **404 JSON** naming the bearer scheme. Other paths and the public site are unchanged, and so is the MCP 401 challenge.
- **P1:** `GET /hq/api/room/mcp/health` returns JSON only: deploy id, commit, and a 2 s bounded database check. It never includes seat names or secrets, and returns 503 when the database is down.
- Verified locally: discovery returns 404 JSON; health returns 200, then 503 with Postgres stopped, then 200 after restart. Tests 50/50.

**Reviews:**
- **#34:** Codex independently confirmed all four of my points (comment 6001779480). Still waiting on Cursor.
- **New Cursor branches, no PRs yet:**
  - `hq-mcp-routing-fix` re-includes all of #34's commits under new hashes.
  - `hq-mcp-heartbeat-recovery` adds the same `/room/mcp` rewrite and GET descriptor separately.
  - Three branches now overlap on `middleware.js`, the MCP route and `RoomBoard.jsx`. **Mark: pick one carrier** (suggest #34 plus the small discovery commit) before more stacking.
  - In those rewrites, `/room/mcp` and `/api/room/mcp` are dead code. On the HQ host the path is already lifted to `/hq/...`, and on other hosts the middleware returns before reaching them. Only `/hq/room/mcp` matters.

## 11. Loop pass 5 (2026-10-05, 20:53 UTC)

**Codex reviewed #33** (comment 6002640537). RDUSA/JAKA are acceptable only as internal operator namespaces, not client rooms: any seat key can read or write any channel, there's no per-channel membership, and unknown channels were accepted. Codex also confirmed that my server-side reply-channel fix (`04a3457`) is needed.

**Shipped (backend, my branch):** channels now fail closed to one registry (`room`, `rdusa`, `jaka`). It's added with exactly the lines #33 adds, so the two branches merge cleanly. Unknown channels are refused on REST messages GET/POST, board, stream and MCP `room_read`/`room_post`; local e2e confirmed it, and registered channels still work. Tests 51/51.

**Still needed before RDUSA/JAKA could ever be client-facing (Mark's decision):** a workspace/membership model with server-enforced channel claims. Until then, the UI should label them "internal portfolio rooms".

**Unchanged:**
- #34 is still waiting on Cursor's fixes.
- Three overlapping Cursor branches still need one carrier picked.
- master hasn't moved.
- No new Drive files.

## 12. Loop pass 6 (2026-10-05, 21:26 UTC)

No new activity from other seats. master, #32/#33/#34 and Drive are unchanged.

**Shipped: the Drive bridge now runs on the loop tick, off until credentialed.** It has a read-only Drive client (service-account JWT, `drive.readonly`, no new dependency) and a cursor in `hq_kv`; the first run looks back 24 h. Two env vars switch it on: `HQ_DRIVE_SERVICE_ACCOUNT_JSON` (**Mark's gate**: share only the relay folder with that service account) and `HQ_DRIVE_RELAY_FOLDER`. A bridge failure never fails the tick.

Local e2e:
- unconfigured: the bridge is skipped;
- fake key: fails closed with no key in the logs.

Tests 56/56.

**Going live for Gemini → room = Mark sets those two variables** (plus the loop secrets, row 7 of §2).

## 13. Loop pass 7 (2026-10-05, 22:01 UTC): merge brief for `claude/hopeful-edison-x93kfj`

No activity from other seats for two passes, so this pass made my branch ready to merge instead of adding more to it.

**Branch head `ac93735`, 18 commits ahead of master `c2c7495`. Fully green:** 67/67 tests with the Postgres suite (0 skipped). Lint shows only the 4 errors that already exist on master in `lib/hq/ops.js` (a `usePostgres` helper tripping React's hooks rule; not touched here). `next build` passes.

| Area | What it adds | Proof |
| --- | --- | --- |
| Room UI | Seat blocker panel: one-time link, copy prompt, done, refresh, live status | e2e at 390 px |
| MCP | `hq_status`, `hq_next_actions` (read-only, same model as the room page) | e2e, audit rows |
| MCP | OAuth discovery returns JSON 404 on the HQ host; `/hq/api/room/mcp/health` | e2e incl. database down → 503 |
| Room | Dispatch replies land in the source channel; channels fail closed to the registry | e2e REST + MCP |
| Drive bridge | Inbound/outbound core, atomic dedupe, read-only Drive client on the loop tick (off until credentialed) | 10-way claim race, fake-key e2e |
| Content | Draft contract (`content-draft.js`): status moves, writer fence, approval hash | unit |
| Docs | Relay check-in, launch tool table, loop env table | — |

**Merge order and conflicts:**
- **Merge this first.** It touches no production schema; the only new storage is rows in the existing `hq_kv`.
- **#33** then conflicts only in `components/hq/RoomBoard.jsx`. Its `ROOM_CHANNELS` lines match mine exactly.
- **#34** conflicts in `RoomBoard.jsx` as well, and still needs Cursor's four fixes. Its `room-mcp-rpc.test.js` tools/list assertion must add `hq_status`/`hq_next_actions`.

**Gates that remain Mark's after merge:**
- the Drive credential;
- the loop secrets;
- applying the ops seed;
- room access for this seat.

Nothing in the branch deploys, migrates or publishes on its own.

## 14. Loop pass 33 (2026-10-06, 12:04 UTC): hardened what the Drive bridge relays

Passes 8–32 found no changes. At 11:53 UTC, Codex posted a review on #32 (CHANGES REQUIRED). It found that copied relay text keeps "ratified" authority claims, and that a regex-only denylist neither blocks credentials broadly nor keeps customer data out. My inbound Drive bridge (`lib/hq/drive-bridge.js`) had the same pattern, so I fixed it here:

- **Authority:** every relayed post now carries `[relayed source claim · proposal/evidence only · not adopted HQ status]` under its heading. A Drive doc that calls itself ratified stays a proposal in the room.
- **Credentials:** these are quarantined (refused, claim kept, reported to the tick): JWTs, PEM private keys, Google API keys and OAuth tokens, `secret=`/`password:`-style assignments, signed or tokened URLs (`X-Goog-Signature`, `X-Amz-Signature`, `sig=`, `token=`), database URLs with passwords, and more provider prefixes. A false positive costs one manual repost.
- **Customer data:** an entry that names a client from the `clients` table is quarantined (`customer-data`). Emails and phone-shaped numbers are redacted. Dates, commit SHAs, ULIDs and plain numbers pass through.
- **Tests:** adversarial fixtures for each class. 69/69 pass with Postgres. The test files must run serially against one test DB (`--test-concurrency=1`); swarm-pg counts rows, and parallel files collide.

The same three points apply to #32's repo landing (`lib/hq/gemini-relay.js`). That branch is Cursor's, so this is reported, not pushed: the rules above can be lifted as-is.

**SEOS:** main moved to `ff3d45d`, which adds `docs/REFACTOR_STUDIO_FINAL_ACCEPTANCE.md` (the shared completion contract for Refactor Studio). It is read-only here; nothing in it touches HQ yet.

## 15. Loop pass 42 (2026-10-06, 17:00 UTC): Codex on #7; `lib/hq` lint now clean

Codex posted an exact-head review on #7 (Cursor's read-only git timeline) at 16:53 UTC: **keep draft, do not integrate this head.** Its three blockers:
- local clone data is labelled with a fresh timestamp without comparing branch-tip SHAs;
- the commit drawer reads only legacy commit statuses, not Actions check runs;
- the PR is stacked on the unmerged `chatgpt/hq-live-oversight-repo-timeline` (38 ahead / 39 behind master).

The fix is Cursor's: rebuild the timeline on current master. Nothing was pushed to that branch.

That stale stack also carries a lint fix that never reached master: `e74bfdd` renames `usePostgres` in `lib/hq/ops.js`, which trips `react-hooks/rules-of-hooks` four times. I ported the same rename (`isPostgresConfigured`, identical, so it no-ops if the stack ever lands). `lib/hq` now lints clean. 69/69 tests pass with Postgres, and the build passes.

Still on master, and fixed only on that stack, are nine lint errors in HQ UI components (`set-state-in-effect` ×7, Sidebar reassign, `app/hq/room/page.js` JSX in try/catch). Those touch ten components and change render behaviour, so I left them for the timeline owner or a separate pass rather than widening this branch.

## 16. Loop pass 76 (2026-10-07, 11:20 UTC): #14 and #35 on master; branch merged up

Master moved `c2c7495` → `03792f1`:
- `9169d9d`: #14, SookLabs internal MCP server v1 (read-only, OAuth resource server);
- `03792f1`: #35, DigitalOcean deploy runbook and A-gate verification.

I merged master into this branch. Two conflicts:
- **`lib/hq/ops.js`:** master moved storage selection into `lib/hq/ops-data.js`, so I took master's re-export. The new file reintroduced the `usePostgres` name, which trips `react-hooks/rules-of-hooks`. I renamed it to `isPostgresConfigured`, the same rename as §15.
- **`lib/hq/control-plane.js`:** kept master's `.js`-suffixed imports (`ops-data.js`, `ops-shared.js`) and re-added this branch's `executionBoard` import.

Checks after the merge:
- `lib/hq` lints clean.
- HQ tests: 69/69 pass with Postgres.
- `services/sooklabs-mcp` tests: 32/32 pass.

Its test run writes `services/sooklabs-mcp/data/hq/`. That path is not in `.gitignore` (only `/data/hq/*` at the root is), so a contributor who runs the suite gets an untracked directory. I'm reporting it here; the fix belongs to the MCP owner.

Open now:
- **#34**, Cursor's HQ room MCP registration: updated 10:50 UTC.
- **#7**, the git timeline: updated 10:46 UTC.

The intended merge order is unchanged: this branch, then #33, then #34.

**#34 re-check (head `57a740b`, 10:47 UTC).** The fix commit addresses all four points from my review:
- **SSE reconnect:** `maintainRoomStream` reconnects with an `after=` cursor after EOF or an error, and a test covers it.
- **MCP probe:** it uses the same-origin `ROOM_MCP_BROWSER_PATH`.
- **Probe cadence:** the probe moved out of `loadRoom` into its own effect, plus the Re-check button.
- **Public `GET /hq/api/room`:** it now returns `buildPublicRoomStatus`, a redacted view with no seat strip.

A trial merge of #34 onto this branch has one conflict. It's in `components/hq/RoomBoard.jsx`, two adjacent `useState` lines, and the fix is to keep both. The combined tree passes 80/80 HQ tests, including the room-MCP `tools/list` test with the `hq_*` tools. One new lint error: line 307 (`verifyMcp` inside an effect, `react-hooks/set-state-in-effect`). It is the same class as the seven already on master. Mark has set #34 to merge first (his comment on #7, 10:45 UTC). If it lands first, I take the `RoomBoard.jsx` merge on this branch.

## 17. Loop pass 77 (2026-10-07, 11:55 UTC): review of #36, the timeline rebuilt on master

Cursor opened **#36** (draft, head `c26889b`, base `03792f1`). It is the timeline-only slice of #7, rebuilt on master as Mark asked. #7 stays open as provenance.

It covers Codex's three #7 blockers:
- ref SHAs are compared, not just branch names (`reconcileRefFreshness`);
- `sourceAsOf` is reported separately from the response time;
- the drawer combines Actions check runs with the legacy commit status.

It also adds fixtures for an exact match, a moved tip and a missing branch. Read-only review notes, not pushed:

- **Auth and input: fine.** Both routes check `isHqSessionValid()`. The commit route only accepts a hex SHA of 7–40 characters. Git runs through `execFile` with an argument array, so a request can't inject a command. Error text containing a token pattern is replaced with a generic message.
- **GitHub API fan-out (main finding).** `readGithubSnapshot` calls `listGithubCommits` for every ref whose tip isn't already known. Each call walks that branch's whole history from its tip, up to 10 pages, without stopping at commits already collected. There is no cache. This repo has 52 remote branches, 35 not in master, and master has 79 commits. So one page load costs roughly 40–110 sequential GitHub calls, plus the branch and PR listings.
  - Vercel builds from a shallow clone, so production always takes this path.
  - Each page load is slow, and about 50–100 loads an hour would use up a 5,000-requests-per-hour token.
  - Fix: stop paging a branch at the first page that contains a commit already in the map (results are newest-first, so the rest is known). Also cache the snapshot, keyed by the sorted ref-SHA set, for 30–60 seconds.
- **CI.** The red `recovery` check is a Google Fonts fetch failure (`next/font/google`, `geist_mono`) during `next build`. It has nothing to do with this diff, as Cursor said. It needs one re-run, which is Mark's or Cursor's to trigger.

Merge-order effect: #36 touches no RoomBoard or room-MCP files, and a trial merge with #34 is clean. With this branch there is one conflict: both append rules to the end of `app/hq/hq.css` (this branch's `.hq-sj-*` seat-join rules, #36's `.hq-repo-*` timeline rules), and the fix is to keep both blocks. Whichever lands second takes it.

## 18. Loop pass 78 (2026-10-07, 12:28 UTC): #34 refreshed, #36 next in line, #37 opened

- **#34, now `ea3bef2`:** Cursor merged master in (`824e431`) and added `ea3bef2`, which recovers the SSE stream after reader transport errors. I re-ran a trial merge of this branch with that head:
  - still one conflict, the same two adjacent `useState` lines in `components/hq/RoomBoard.jsx` (keep both);
  - the combined tree passes 82/82 HQ tests with Postgres;
  - one lint error remains, `RoomBoard.jsx:307` (`verifyMcp` in an effect, from #34).
- **#36:** Mark has set it as the next merge after #34. Cursor traced its red `recovery` build to Turbopack issue vercel/next.js#99114. Google Fonts sometimes returns extensionless Geist Mono URLs, and that breaks `next/font/google`. The same failure reproduces on master `03792f1`, so it isn't this diff. The GitHub API fan-out finding from §17 is still open and hasn't been raised on the PR; it is recorded in Drive doc 22.
- **#37 (Codex/Mark, draft):** when `HQ_LOOP_TICK_URL` or `HQ_LOOP_WORKER_SECRET` is missing, `hq-loop-wake.yml` now fails instead of ending green. It's a two-line change and correct. Every scheduled run will go red until Mark sets both secrets, which is the intended signal.
- **#31 (Cursor, draft):** removes the light frame and white card borders in HQ CSS. It was updated but is still based on old master `c2c7495`. Not reviewed further.

Proposal for the font flake (for Mark): stop fetching Geist Mono from Google at build time. Either use the `geist` npm package's local fonts, or switch `app/hq/layout.js` to `next/font/local`. That removes the CI flake for every PR, not just #36. It touches the shared layout, so it should be its own small change after #34 and #36.

Environment note: the local test Postgres had stopped. 11 PG-backed tests then failed with `ECONNREFUSED`, and all passed after a restart. That was environmental, not a code regression.

## 19. Loop pass 79 (2026-10-07, 13:02 UTC): #34 landed; branch merged up

Master moved `03792f1` → `f76b3c1`. That is #34 merged: HQ room MCP registered in `.cursor/mcp.json`, SSE reconnect, same-origin probe and public room redaction.

I merged master into this branch. There was one conflict, as predicted in §16 and §18: two adjacent `useState` lines in `components/hq/RoomBoard.jsx`. Kept both (`joinOpen` and `mcpProbe`).

Checks after the merge:
- HQ tests: 82/82 pass with Postgres. That includes `room-mcp-rpc.test.js` with this branch's `hq_status` and `hq_next_actions` tools.
- `lib/hq` lints clean.
- `components/hq` has 9 lint errors. All are already on master: the 8 older ones from §15, plus `RoomBoard.jsx:307` from #34. None are new from this merge.

This branch is now ahead of master with no conflicts, and it is next in the merge order this file has recorded (this branch, then #33). #36 (timeline) is Mark's stated next feature after #34. Against this branch it has only the append-only `app/hq/hq.css` conflict, so either order works.

## 20. Loop pass 88 (2026-10-07, 17:55 UTC): #37 mergeability, a correction to the record

Codex reviewed #37 (head `699c08b`) at 17:50 UTC: amend/rebuild. It said the head is 10 behind master `f76b3c1`, that GitHub reports it non-mergeable, and that there is no exact-head Actions run.

What I checked here:
- **Mergeable:** `git merge-tree origin/master 699c08b` is **clean**, and GitHub's PR API shows `mergeable_state: clean`. None of the 10 newer master commits touch `.github/workflows/hq-loop-wake.yml`. The last master change to that file is `872183a`, which is older than #37's base. So a rebuild isn't needed for mergeability; a plain update-branch would do.
- **No exact-head run: valid.** The workflow runs only on schedule or manual dispatch, so it hasn't run on this head. Codex's acceptance stands:
  1. record the expected red run while the secrets are missing;
  2. after Mark sets `HQ_LOOP_TICK_URL` and `HQ_LOOP_WORKER_SECRET`, require HTTP 200 plus a new worker `lastBeatAt`.

Otherwise no change since §19: master `f76b3c1`, this branch `9be91bf` (0 behind), #36 unchanged at `c26889b`.

## 21. Loop pass 98 (2026-10-07, 23:14 UTC): Codex asks for a #36 rebuild; fan-out still not raised

Codex commented on #36 at 22:45 UTC: blocked, rebuild on current master. The head `c26889b` is 1 ahead and 8 behind master `f76b3c1`. The only Actions run on it, `37616459220`, is still red; that is the Turbopack/Google-font flake from §18.

Here, `git merge-tree origin/master c26889b` is **clean**. The rebuild Codex asks for is a plain refresh onto master plus a fresh CI run, not a conflict fix.

Codex's next-action list doesn't include the GitHub API fan-out from §17 (Drive doc 22). Each timeline load walks every unmerged branch's full history without stopping at known commits, and nothing is cached. That is roughly 40–110 sequential calls per load, and production always takes this path because Vercel builds from a shallow clone. It is still the main thing to fix in the rebuild before #36 goes live. Raising it on the PR is Mark's call; I haven't commented there.

No other change: master `f76b3c1`, this branch `bbb556e`, #37 `699c08b`, SEOS `ff3d45d`.

## 22. Mark's go-ahead (2026-10-08): fonts, lint, #36 fan-out patch, PR opened

Mark asked for three things and for this branch's PR to be opened.

**1. CI font flake removed (`3f2d2d7`).** `app/hq/layout.js` now loads Geist and Geist Mono from vendored variable woff2 files in `app/hq/fonts/` (SIL OFL, licence alongside) via `next/font/local`. Builds no longer fetch Geist Mono from Google, which is what tripped vercel/next.js#99114 on #36. Other site layouts still use `next/font/google` for different families; they haven't shown the flake.

**2. Lint: 44 errors → 0.** 30 were in `_reference/` (vendored design handoffs, now ignored). The 14 real ones are fixed in place; the few that are intentional post-hydration reads of browser storage or `matchMedia` keep their effect with a scoped, reasoned disable. 9 warnings remain (8 `<img>`, 1 deps), down from 11. HQ tests 82/82, `next build` passes.

**3. #36 fan-out: ready-to-apply patch for Cursor.** `docs/relay/patches/pr36-repo-graph-fanout.patch` applies cleanly to #36 head `c26889b` (`git apply`). It changes only `lib/hq/repo-graph-load.mjs`:
- branch history paging stops at the first page that reaches already-loaded commits;
- `loadSookLabsRepoGraph()` caches successful graphs per instance for 45 s and shares in-flight loads; failures are not cached.

Measured with `docs/relay/patches/pr36-fanout-sim.mjs` (simulated 600-commit master, 20 branches, no local git, as on Vercel): same 660-commit graph; GitHub calls **131 → 30** on a cold load and **131 → 0** on a repeat within 45 s. Trade-off: a branch whose unique commits sit more than one page behind a merge from master would show only its newest page; acceptable for a timeline, and called out in the code comment.

## 23. Loop pass 119 (2026-10-08, 13:25 UTC): review of #39 (Reports + owner rooms)

#39 was opened at 11:42 UTC by another Claude session (`claude/gallant-lamport-dggvhh`, head `4cbd05d`). #14 (the early standalone MCP server) was closed unmerged at 11:45. Nothing else moved: master `f76b3c1`, #38 `f14e841` (green, waiting on Mark), #36 `c26889b`, #37 `699c08b`, SEOS `ff3d45d`.

**#39: report only, not commented on the PR.**

What's sound:
- Invite links and owner keys are stored only as SHA-256 hashes.
- Redeeming is one atomic `UPDATE … WHERE used_at IS NULL … RETURNING`, so a link can't be used twice even by two requests at once.
- Opening the link (GET) never uses it up.
- The owner cookie is httpOnly, `SameSite=Lax`, and Secure in production.
- Every write route checks for cross-site posts.
- The owner's business comes from their key, never from the URL.
- `/hq/api/owners` verifies Mark's signed session (`verifySessionToken`), not just that a cookie exists.

Worth fixing before production:
1. **Production schema change from a button.** `POST /hq/api/owners {action:"install"}` runs `CREATE TABLE` against the live HQ database. The PR treats the click as the approval. That fits the rule that production migrations are Mark's gate only if Mark knows the click is the migration. The tables are additive and use `IF NOT EXISTS`, so it is low risk, but the button label should say so.
2. **The middleware opens the whole `/hq/api/client/` prefix.** Today only `redeem` and `logout` live there, and both check for themselves. Any future route under that prefix would be public by default. Listing the two paths explicitly would close that.
3. **The join page shows `?error=` text straight from the URL.** React escapes it, so there is no script risk, but anyone can send a SookLabs-branded link carrying any message they like. Sending an error code and mapping it to fixed text would close that.
4. **It depends on the SEOS companion branch.** That is `claude/gallant-lamport-dggvhh` in SEOS (head `1eb2fdf`; I missed it at first because my local SEOS clone tracks only `main`). It adds `GET /api/analytics/hq-summary` and a Prisma migration, `20261005170000_add_analytics`. That migration is a production schema change, so it goes through Mark's gate and must be applied before or with the SEOS deploy, as the PR says. Until then, HQ Reports shows its "unavailable" notice, which is safe.

Against #38, #39 conflicts only in `app/hq/hq.css`. Both add lines at the end of the file, so either merge order works with a two-minute fix.

## 24. Loop pass 121 (2026-10-08, 17:30 UTC): Mark merged #39; #38 rebuilt on it

Mark merged #39 into master (`6b985a7`) at about 17:20 UTC. That left #38 with the conflict predicted in §23, in the append-only `app/hq/hq.css`. I merged master into this branch (`432c4b8`) and kept both blocks: the seat join panel styles and the owner room styles. Nothing else conflicted, and the two `middleware.js` changes merged automatically.

After the merge:
- HQ tests pass, 88/88. That includes #39's `owner-portal` and `analytics-summary` tests, run against the local Postgres.
- eslint: 0 errors, which covers #39's new files.
- `next build` passes and lists the new `/hq/client`, `/hq/client/join/[token]`, `/hq/reports` and `/hq/api/client/*` routes.

**SEOS also moved.** Mark merged SEOS #9, the #39 companion with the analytics endpoint and the `add_analytics` migration, and SEOS #10, an automatic deploy to the droplet. SEOS main is now `f4505d4`.

Review of SEOS `deploy-droplet.yml` (report only):
- **Good:**
  - It runs only after `ci` passes on a push to `main`.
  - It deploys the exact commit CI passed on.
  - It does nothing until the secrets are set.
  - It doesn't touch `/opt/seos/.env`.
  - It never runs migrations.
  - It uses the `production` environment, so Mark can make every deploy wait for his click by adding required reviewers in Settings → Environments.
- **Set `DROPLET_KNOWN_HOSTS`:** this should be required, not optional. GitHub runners are fresh on every run, so without it each deploy trusts whatever host key it scans at that moment, which means the host is never actually verified. Fix: run `ssh-keyscan` once from a trusted machine and store the result.
- **Check `rsync --delete`:** it excludes only `.env`. Anything else kept only in `/opt/seos` on the droplet (uploads, local data, logs) is deleted on every deploy. Before the first automatic deploy, check that SEOS keeps nothing else there.
- **Order:** the analytics migration still has to be applied before or with this deploy. Per `f8f3222`, the app is safe to deploy before the tables exist, and Reports turns on with SEOS's one-click "Switch on".

Mark is active, so the loop goes back to 30 minutes.

## 25. Loop pass 122 (2026-10-08, 18:02 UTC): #40 fixes the #39 findings; Growth OS PRD

**#40 (Cursor, `cursor/phase1-owner-room-guards-7966`, head `5ef3f4c`): report only.** It fixes §23 findings 1–3 as proposed:
- The button now reads **"Create owner tables on the live database"** and says this is a production database change.
- `middleware.js` opens only `/hq/client`, `/hq/client/*`, `/hq/api/client/redeem` and `/hq/api/client/logout`, through a new `isOwnerPublicPath` helper with a test. Any future route under `/hq/api/client` stays behind Mark's session.
- The join page shows only fixed text, chosen by an error code (`used`, `expired`, `cancelled`, `unknown`, `unavailable`). An unrecognised code shows nothing, and the lookup uses `hasOwnProperty`, so names like `__proto__` can't slip through.

Looks correct to me. It merges cleanly into master.

Against #38 there is a single conflict: the two new import lines at the top of `middleware.js` (`mcp-discovery` from #38, `owner-open-paths` from #40). Keep both. Whichever PR merges second needs that one-line fix; if #40 lands first, I'll do it on #38.

**Drive: "SookLabs Growth OS — PRD (phased)"**, Mark, 15:59 UTC.
- Phase 1 is a monthly search report for RDUSA, built from real Google data and opened by both Mark and the owner.
- It lists nine capability areas and their gaps.
- My lane's gaps in that list:
  - Room MCP read tools: "from draft PR #14". #14 is now closed; #38 delivers `hq_status` and `hq_next_actions` instead.
  - The execution loop isn't switched on yet; that's the #37 secrets.

#39 shows as closed on GitHub, but its merge commit `6b985a7` is on master, so the code has landed.

State: master `6b985a7`; #38 `200e1af` (all green, clean against master); SEOS main `f4505d4`; hq.sooklabs.com still returns `000`.

## 26. Loop pass 131 (2026-10-09, 07:48 UTC): #40 updated

Cursor pushed two commits to #40 at 07:42 UTC: `37e7c3b` (tests and a confirm step) and `bfcc782` (merges master). Head is now `bfcc782`. Report only.

- **Confirm step.** "Create owner tables on the live database" now asks a second time ("Yes, create the tables" or Cancel) before it sends `install`. That closes §23 finding 1 fully.
- **Shared error helpers.** Redeem errors come from helpers in `owner-join-errors.js`, so the route and the portal can't drift apart. The new `owner-redeem.test.js` checks each code and status, and greps the route and portal to confirm they still use the helpers.
- **CI wiring.** `hq-room-mcp.yml` now runs both owner tests and triggers on the owner files and on `middleware.js`.
- **New `npm test` script:** `node --test lib/hq/*.test.js`. Minor issue: it doesn't pass `--test-concurrency=1`. Once `HQ_TEST_DATABASE_URL` is set, the Postgres-backed tests share one database, and they flaked when run in parallel here. That's harmless in CI today, because those tests skip without the variable. It's worth adding the flag before anyone runs the script against a real database.

#40 still merges cleanly into master. Against #38, the only conflict is still the one-line import at the top of `middleware.js`; keep both imports. Nothing else moved: master `6b985a7`, #38 `a0dfabd` green, SEOS unchanged, hq.sooklabs.com returns `000`.

## 27. #38 merged (2026-10-09, 10:48 UTC); Telegram on hold

Mark told me to merge #38, and I merged it as `8c6d83a`. On the new master, the HQ tests (Postgres) pass 88/88 and eslint reports 0 errors. This branch restarts from master for any follow-up work.

Mark has put the n8n "HQ on Telegram" front door on hold until further notice. Nothing has been built for it.

Where the other PRs stand against master `8c6d83a`:
- **#40 (Cursor, still a draft):** it now conflicts with master on the import line at the top of `middleware.js`. The fix is to keep both `mcp-discovery` and `owner-open-paths`. Cursor needs to merge master into the branch and mark the PR ready, then Mark merges. Also add `--test-concurrency=1` to its new `npm test` script (see §26).
- **#36 (Cursor, timeline):** two things are needed before merge. First, the end of `app/hq/hq.css` now conflicts, but both sides only add lines, so keep both. Second, the fan-out fix still has to be applied: it's on master at `docs/relay/patches/pr36-repo-graph-fanout.patch` and applies cleanly to `c26889b`.
- **#37 (loop wake):** merges cleanly. It is ready whenever Mark wants it. Until `HQ_LOOP_TICK_URL` and `HQ_LOOP_WORKER_SECRET` are set, scheduled runs will fail red on purpose. Merging it is Mark's call.

## 28. Loop pass 135 (2026-10-09, 11:25 UTC): SEOS Prisma → Postgres branch

New SEOS branch from Cursor: `cursor/seos-prisma-lock-postgres-f2a3`, head `33d1c76`. Report only; the SEOS repo is read-only for me.

**What it does**
- Rewrites `20260716193000_add_authority_tracker/migration.sql` from SQLite to Postgres SQL.
- Changes `migration_lock.toml` from `sqlite` to `postgresql`.
- Adds `.env.example`.
- Adds a CI job, `prisma-migrate`, that runs `prisma migrate deploy` on an empty Postgres. This proves every migration applies from scratch.
- Documents how to baseline production. Production SEOS was built with `db push`, so the authority migration is marked applied with `prisma migrate resolve --applied` and is not run. Then `migrate deploy` runs only `add_analytics`.

**Assessment.** The approach is right. Editing a migration that has already been applied would normally break Prisma's checksum check. Here that's safe, because production never recorded the old SQLite version, and the doc says to use `resolve` only when the tables already exist.

**One thing to add before Mark runs the baseline.** `migrate resolve --applied` records the migration without comparing it to the live database. If production's `db push` schema differs from the rewritten SQL, Prisma won't notice, and a later migration could fail or drift. Run this read-only check first:

`npx prisma migrate diff --from-url "$DATABASE_URL" --to-migrations prisma/migrations --shadow-database-url <empty db> --script`

An empty result, or only the expected analytics tables, means it's safe to `resolve` and then `deploy`. That keeps Mark's production-migration gate backed by evidence.

**Elsewhere:** nothing changed. Master `8c6d83a`; #40 is still a draft and conflicts on the `middleware.js` imports; #36 and #37 are unchanged; hq.sooklabs.com returns `000`.

## 29. Loop pass 136 (2026-10-09, 11:58 UTC): Codex blocks #40; Sookly audit batons 34 and 35

**Codex reviewed #40 at 11:52 UTC: not merge-ready.** It is 39 commits behind master and non-mergeable. Codex lists six blockers. I checked them against the code; four are real gaps I missed in §23:
- **Redeem isn't one transaction.** `redeemOwnerInvite` marks the invite used, then inserts the access row in a separate statement. If the insert fails, the one-use link is burned with no access granted. **Confirmed** in `lib/hq/owner-portal.js`.
- **Owner keys never expire on the server.** Only the browser cookie has a 90-day age. **Confirmed.**
- **The invite token is in the URL path.** It can land in proxy, platform or analytics logs. In §23 I treated this as standard for magic links, but Codex's point stands for a clinic-facing product.
- **Access is tied to `business_slug`,** which can change, not to an immutable workspace id. **Confirmed.**
- **Production schema change from the UI.** The confirm step isn't an approved migration with a rollback plan.
- **No approved report snapshots** before task titles reach client owners.

**This matters beyond #40.** Blockers 1–5 are in code that is already on master through #39. Owner rooms are still inactive, because the tables only exist once someone presses "Create owner tables". **Recommendation to Mark: don't press it until a replacement PR fixes 1–5.** Codex proposes a narrow PR: a migration file with a rollback runbook, a transactional redeem, key expiry, and binding to the workspace id.

**Drive 34 and 35 come from another Claude seat (chat, read-only).**
- **34** is a red-team of the Sookly receptionist and automation.
- **35** is a baton:
  - Codex lands an adversarial test harness (`tests/adversarial/` in SookLabs).
  - Cursor ships ten fixes, F1 to F10. F1 is medical-tier approval-first; F3 locks the n8n router to the HQ host and splits its secrets; F5 hardens the agent callback route.
  - Claude reviews each PR against its test IDs.

Mark has endorsed approval-first. Each merge, config flip and deploy still needs his approval. In my lane, F3 and F5 touch HQ code (`docs/n8n`, `app/hq/api/agents/callback`), so I'll review those PRs when they land. My Drive notes continue from 36.

## 30. Loop pass 141 (2026-10-09, 17:38 UTC): Codex refreshed its #37 review

Codex refreshed its review of #37 at 15:49 UTC. The PR is still a draft, and it can merge cleanly: 1 commit ahead and 52 behind master `8c6d83a`. The patch itself is still right. On master today, the scheduled wake exits 0 when a secret is missing, so a green run can mean that no wake happened.

The blocker is that #37 has no Actions run on its exact head commit. The next step is for the author to rebuild the PR on master. Then run it once without the secrets, to record the expected red failure. After Mark adds `HQ_LOOP_TICK_URL` and `HQ_LOOP_WORKER_SECRET`, the run must return HTTP 200 and update the worker's `lastBeatAt`. Until then the PR only fixes the false health signal; it doesn't prove a live worker.

I'm leaving the `fix/` branch alone, since it isn't mine. Nothing else moved: #40 is blocked, and #36 and the SEOS branch are unchanged.

## 31. Loop pass 146 (2026-10-09, 23:20 UTC): Codex's post-merge check of #19

At 21:46 UTC Codex edited its comment on the merged #19 (the Finish Line Command Center). The comment says the truthfulness wording from #19 is still on master, but production acceptance hasn't been done. I checked its source claims against master `8c6d83a`. All of them hold:

- The #19 merge `bc1e6fa` is in master's history, and master is 78 commits past it.
- `components/hq/RoomBoard.jsx` still says **Finish-line estimate** (line 848) and **Live / ready seats** (line 870).
- If the summary hasn't loaded or failed, the blockers card says "Control-plane blockers unavailable." (line 1251). It shows "No open blockers." only once `controlPlaneBlockers === "ok"` (line 1257).
- `app/hq/api/room/summary/route.js:18` fails closed with a 503 and a generic error.
- `lib/hq/room-summary.js:10` sets `FINISH_LINE_BASIS` to "… Not acceptance." The summary route, `RoomBoard.jsx`, `control-plane.js` and `room-mcp.js` all use that file.

I agree with Codex on what's still open. These checks only cover the source code. Nobody has yet confirmed which commit is actually deployed, or tested the room with two signed-in seats. That needs hq.sooklabs.com, which this session still can't reach (the proxy refuses the connection), plus seat keys. Both are Mark's to provide. I didn't comment on #19.

Unchanged: #40 is still blocked, #37 is still a draft, #36 hasn't moved, and the SEOS branches haven't changed (`git ls-remote` gives the same hash as before). Telegram/n8n stays on hold.

## 32. Loop pass 154 (2026-10-10, 11:06 UTC): patch so MCP `room_post` replies wake the loop

At 10:52 UTC Codex used a comment on the merged #20 to ask Cursor for a small fix: an MCP `room_post` reply to a dispatch should wake the acceptance-loop task that is waiting on it. Cursor stopped before making any edits, because it couldn't read the HQ single-writer lease. I checked master `8c6d83a`, and the gap is real:

- The HTTP reply route (`app/hq/api/room/messages/route.js:70`) calls `wakeFromDispatch`.
- The native push adapter (`lib/hq/swarm-router.js:136`) also calls `wakeFromDispatch`.
- `lib/hq/room-mcp.js` stores and routes the reply, but never wakes the loop. That's the path the pull seats (Cursor, Codex, Claude) use.

I can't see the lease either, so I haven't changed the shared code. The fix is a patch instead: `docs/relay/patches/pr20-mcp-room-post-loop-wake.patch` (5 files, +40/−4). It applies cleanly to master.

What the patch does:

- **One rule for when a reply wakes the loop.** It adds a function, `replyWakesLoop(saved, dispatchId)`, to `lib/hq/dispatch-guard.js`. A reply wakes the loop only if it carries a dispatch ID and was actually stored as a first reply. It doesn't wake for:
  - a replayed duplicate;
  - a reply the existing guard rejected: stale, expired, wrong seat or already finished. The guard rejects those before anything is stored.
  - an ordinary room post with no dispatch.
- **Same rule on all three reply paths.** `room-mcp.js` now calls `wakeFromDispatch` inside `after()`, the same way the HTTP route does, so the MCP reply returns without waiting for the wake. The HTTP route and the native adapter now use the same rule. They behave as before, except that the native adapter now also checks that the reply was actually stored.
- **Two tests in `dispatch-guard.test.js`.**
  - The first checks the rule itself for each case: a first reply, a replay, a rejection with 403 or 409, and a post with no dispatch.
  - The second reads the source of the three files and checks that each one calls `wakeFromDispatch` exactly once, behind the shared rule. It fails on unpatched master, flagging `room-mcp.js`; I confirmed that.

Verification, with the patch applied to the working tree:

- All HQ tests pass on the local disposable Postgres: 90 passed, 0 failed, 0 skipped. That's 88 before, plus the 2 new tests.
- Lint is clean on the changed files, and `next build` passes.
- None of this is CI, deployment or production evidence.

What the tests don't cover: an end-to-end MCP reply against Postgres, checking that the loop task is woken exactly once. `room-mcp.js` and `loop-service.js` are server-only, so the existing test harness can't load them. Codex's list also asks for that end-to-end test, so it's still open.

Next step: whoever holds the writer lease (or Mark) applies the patch on a fresh branch, runs CI on that exact head, and gets an independent review. I didn't comment on #20, since it isn't my PR.

## 33. Loop pass 216 (2026-10-15, 12:45 UTC): review of the ecosystem-alignment docs PRs (report only)

Passes 155 to 215 were quiet. Then two branches appeared:

- **HQ.** Mark opened draft PR #42 (`docs/ecosystem-alignment-20261015`, head `4d1a1ee`, docs only, +139). It adds:
  - `docs/architecture/SOOKLABS_SYSTEM_CONTRACT.md`;
  - `docs/architecture/DOCUMENT_AUTHORITY_REGISTER.md`;
  - `docs/acceptance/RDUSA_VERTICAL_SLICE.md`;
  - a cross-repository section in `AGENTS.md`.
- **SEOS.** A branch with the same name (head `8c884f6`, docs only, +22) adds `AGENTS.md` and `docs/ECOSYSTEM_ALIGNMENT.md`. SEOS `main` is unchanged at `f4505d4`.

I checked the PR's item "Document links and entrypoints verified on branch" against the branch:

- **Links resolve.** All the relative links resolve. Every HQ source the register names exists on the branch: `HQ-MCP-CONTROL-PLANE.md`, `HQ-AGENTS.md` and `HQ-MCP-ACTIVATION.md`. So do all four SEOS sources it names: `SEOS-MVP-1.md`, `agent/DECISIONS.md`, `REFACTOR_STUDIO_FINAL_ACCEPTANCE.md` and `authority-durability.md`.
- **The CRM owner's name is spelled two ways.** "Andolw" appears 4 times: in the contract at lines 40, 42 and 59, and in the acceptance doc at line 22. "Andrew" appears in the contract at line 22, in the register at line 35, and in SEOS `ECOSYSTEM_ALIGNMENT.md`. The docs themselves say not to guess this CRM's identity, so the spelling should be settled before merge.
- **SEOS says Vercel, but SEOS deploys to a droplet.** SEOS `ECOSYSTEM_ALIGNMENT.md` item 3 says "Confirm Vercel+Postgres". The latest commit on SEOS `main` (`be54795`) says SEOS now deploys to the droplet after CI. The durability check should name the host that is actually used.
- **The register leaves out HQ's relay notes.** It doesn't classify `docs/relay/` in HQ, which holds this check-in log and the patches folder. I suggest HISTORICAL, kept as evidence, so the reconciliation backlog doesn't treat those notes as active direction.
- **Nothing conflicts with open work.** Nothing in either branch conflicts with the #20 wake patch, #36, #37 or #40. The contract keeps MCP as bounded tools, which matches the control plane. Telegram/n8n stays on hold, and the register only classifies the older Drive relay spec.

This is a review only. I didn't comment on #42, and I made no edits on either branch.

## 34. Loop pass 217 (2026-10-15, 13:19 UTC): Codex's review of #42, checked against the branch

At 12:48 UTC Codex posted an exact-head review of #42 at `4d1a1ee`. It marks the PR blocked and asks for it to stay draft. Its two points both check out on the branch:

1. **The contract outranks domain sources.** `SOOKLABS_SYSTEM_CONTRACT.md` line 64 puts "this cross-system contract" above "domain canonical specs and tests". That contradicts the contract's own line 9 ("Domain-level acceptance and release criteria retain authority inside their own repositories"). It also contradicts the control plane's canonical-authority table (`docs/HQ-MCP-CONTROL-PLANE.md` §"Execution mode — canonical authority", lines 193–235).
2. **The RDUSA file reads as an authority.** `docs/acceptance/RDUSA_VERTICAL_SLICE.md` is titled "Acceptance Contract" and sets RDUSA scope and approval criteria from inside the HQ repo, even though the register forbids competing authorities.

Two more gaps the branch doesn't cover, beyond my §33 notes:

- The control plane names SEOS acceptance as `docs/mvp-smoke-checklist.md`, but the register lists only `SEOS-MVP-1.md` and `DECISIONS.md`.
- The control plane names RDUSA scope as `01_RETAINER_FRAMEWORK_GUARDRAILS/RETAINER_PROMISE_MAP.md` (with execution in `04_.../NEXT_ACTIONS.md`), but the register lists only the index and the governance doc. These are the owning sources the RDUSA checklist should defer to.

Suggested wording, offered as text only. Edits to a checkout of the PR branch were blocked as shared-resource changes, so this isn't a patch.

- **Contract precedence (replaces line 64):** "approved legal/client agreements and human permissions > each domain's canonical acceptance, scope and commercial sources (as named in `docs/HQ-MCP-CONTROL-PLANE.md`) within that domain > this cross-system contract, for cross-repository boundaries only > runtime evidence > historical/speculative reports. This contract never overrides a domain's canonical source; apparent conflicts become decision requests that cite both."
- **RDUSA file:** retitle it "Cross-System Evidence Checklist", with the status "PROPOSED, NON-AUTHORITATIVE projection". Add a header naming the RDUSA and SEOS owning sources and saying they win. Add an "Owning source" column for each domain owner to confirm. Change the final PASS line to "Checklist items do not grant PASS; the owning source's acceptance does."
- **AGENTS.md:** call the RDUSA file a non-authoritative checklist.
- **Register:** add three rows:
  - SEOS `docs/mvp-smoke-checklist.md` (ACTIVE_DOMAIN acceptance);
  - RDUSA `RETAINER_PROMISE_MAP.md` and `NEXT_ACTIONS.md` (ACTIVE_DOMAIN scope and execution);
  - HQ `docs/relay/` (HISTORICAL evidence).
- **Link and authority check:** Codex's "lightweight link/authority check" could be a small node script. It would check that the relative links in those four files resolve, that the `docs/HQ-*.md` references exist, that the RDUSA file stays marked NON-AUTHORITATIVE, and that the contract keeps the domain-precedence sentence.

Still open from §33: the "Andolw" / "Andrew" spelling, and SEOS's "Vercel+Postgres" when it actually runs on the droplet. No PR comment and no edits on #42 or on the SEOS branch. This is the author's call, and Codex has asked for a fresh exact-head review after the amendment.

## 35. Loop pass 220 (2026-10-15, 14:56 UTC): #42 strips financial figures; Cursor's #43 preflight (report only)

**#42, new head `d493ec4`.** Three new commits titled "security(docs): remove RDUSA financial figures and prohibit commercial data in repos". They:

- remove the retainer and proposal figures from the contract, the register and the RDUSA file;
- add a rule that confidential commercial terms stay out of repositories, PRs and design files.

Two things remain:

- **The figures are still in the branch history.** The current files are clean, but the earlier commits on the branch (`127ed77` through `4d1a1ee`) still contain them, and the PR's commit list shows those commits. A squash merge would keep them off master, but they stay readable in the branch and PR history until the branch is deleted or rewritten. That's Mark's call.
- **Master already holds a figure.** `lib/hq/control-plane.js` line 8 has a retainer amount field with a number in it. Cursor flags the same thing in #43. Removing it is a separate decision for Mark.

None of Codex's three asks at 12:48 is addressed yet: the precedence on line 64, the RDUSA file's status as an authority, and links to the owning sources. My §33/§34 findings are also still open: the CRM owner's two spellings, SEOS's Vercel-or-droplet host, and the register gaps.

**#43, new draft from Cursor (`cursor/engine-integration-preflight-2353`, head `c423a77`, one file, `docs/ENGINE_INTEGRATION_PREFLIGHT.md`, +510).** It is a design-only preflight. It:

- reconciles open branches and PRs;
- sets out SL-001 through SL-013 as one-PR-each tasks, with Grok dispatching, Codex implementing, Claude reviewing architecture and security, a fresh Cursor session validating, and Mark approving;
- folds my §32 wake patch into SL-001 ("re-implement, do not copy the patch blindly").

I checked its main code claims against master `8c6d83a`, and they hold:

- **SL-002 premise (owner links can be burned).** `redeemOwnerInvite` in `lib/hq/owner-portal.js` runs three separate `q(...)` calls: it marks the invite used, inserts the access row, then links the two. There's no transaction around them. If the insert fails, the link is already marked used.
- **The client API is open on master.** `middleware.js` line 97 opens all of `/hq/api/client/`.
- **SL-001 premise (SL fields would be lost).** `normalizeBaton` (`lib/hq/swarm-contract.js:179`) rebuilds the baton from a fixed field list, so any new SL fields would be dropped.
- **The wake gap is still there.** HTTP replies wake the loop and MCP `room_post` replies don't.

Points for Mark and the author:

1. **Privacy: a person's contact details are in the doc.** Line 264 names a person found by web search, along with their email address and a note that a phone number was found. The doc itself says a name match is not identity proof. A private individual's contact details shouldn't sit in a repo doc. Suggest cutting it to "a public catalog page names a possible contact; identity unverified".
2. **SEOS hosting is confirmed as ambiguous.** Cursor saw `seos.sooklabs.com` served by Vercel, while SEOS main deploys to the droplet (my §33 point 3). Its §8 says the same: Mark names the production host.
3. **Stale pointer.** The doc says the hopeful-edison relay ends at §32 / `ac4ce80`. It now runs to §35 at a later head. This is only a pointer refresh.
4. **SL-001 test plan.** SL-001's acceptance item 5 covers the wake rule. My patch's tests still don't include an end-to-end MCP reply against Postgres; §32 lists it as open. SL-001 should require that test, or make it explicit that the source-scan test is the accepted substitute.
5. **Reviewer role.** The doc assigns Claude as the reviewer for every SL task, and I can do that. Under the stop rules in each brief, I review the PR diff against the brief and don't implement the same task.

I made no PR comments and no edits on #42, #43 or the SEOS branch.

## 36. Loop pass 221 (2026-10-15, 15:28 UTC): #43 rev 2 (head `e07491c`), report only

Cursor pushed two commits to #43: "apply SEOS, rdusa, and sookly verification" and "add JAKA client tasks and the central nervous system". The doc grows to 737 lines and now covers SL-001 through SL-027. SL-001, SL-002 and SL-003 are unchanged, and SL-005 onwards are renumbered.

Of my §35 points:

- **Fixed:**
  - the named person's contact line is gone;
  - the SEOS host is now stated as both facts: the README names Vercel `seos.sooklabs.com`, and a droplet workflow exists.
- **Still open:**
  - the relay pointer still reads §32 / `ac4ce80`;
  - SL-001 still doesn't require an end-to-end MCP reply test against Postgres, or name the source-scan test as the accepted substitute.

New points:

1. **The merge rules contradict each other (most important).** §8 says "Mark still approves merges, production deploys, production migrations, credentials, spend, external publishing, and customer messages", which matches the control plane. But §13 says "Merge and deploy are available for a reversible PR that avoids migrations, credentials, spend, and production data writes", and the SL-016 and SL-017 briefs each say "Merge and deploy are allowed." Agents reading §13 or those briefs could merge and deploy without Mark. One rule needs to win. The control plane and §8 say Mark approves merges.
2. **SL-018 (Xero revenue block).** The design is sound: read-only, no write exports, live credentials wait for Mark. Given #42's new rule against commercial figures in repos, the brief should say the fixture amounts must be synthetic, never copied from real invoices. The handoff already forbids pulling a live invoice; this would make the fixture rule explicit.
3. **A client's business phone number in the doc.** The JAKA rows (around lines 504–507) quote a client's business phone number as an SEO "lock". It's a public business line, not a private person's, but under #42's rule a reference to where the canonical value lives would be safer than the number itself. Low priority.
4. **Privacy work is gated well.** SL-022 (consent and retention required before any identity merge), SL-026 (an email import that refuses unless consent and retention are given) and SL-027 (rdusa: untrack the order runs, list the paths but not the addresses, no history rewrite without Mark) handle personal data well.
5. **More reviews for Claude.** SL-016 asks for my agreement before any new table, and SL-005 asks for a tenant-isolation review where hiding retainer keys with CSS isn't enough: the keys must be absent from the client payload. I can do both, and I won't implement anything I review.

I made no PR comments and no edits on #42, #43 or any branch.

**Correction to §36 point 1 (same pass).** A recheck shows rev 2 also rewrote the "Mark still approves merges…" line in §8. The doc is now consistent with itself:

- its §9 staffing table (line 306) says merge and deploy are allowed where the brief says the change is reversible;
- SL-016, SL-017 and §13 say the same.

So the conflict is with HQ's canonical sources, not inside the doc:

- `docs/HQ-MCP-CONTROL-PLANE.md` line 56 places the gates at "merge, production deploy, migrations, credentials, spend, external publishing and irreversible actions";
- `lib/hq/loop-policy.js` line 69 prohibits "bypassing merge/deploy/migration gates".

A design doc can't loosen those gates. Codex's #42 review applies the same principle: the canonical source wins. If Mark wants agents to merge and deploy reversible PRs, that's a change to the control plane and loop policy for Mark to make himself. Until then, #43 should say Mark approves merges and deploys.

## 37. Loop pass 222 (2026-10-15, 16:03 UTC): Claude architecture and security review of #44 (SL-001), report only

#44, "Record an SL handoff on the existing room seats". Branch `cursor/sl-001-room-handoff-7ae3`, head `1acd5c8`, 15 files, +682/−12. It's marked ready for review, not draft. #43 names Claude as SL-001's architecture and security reviewer, and this is that review against the SL-001 brief. I haven't posted it on the PR.

**How the work was split.** The brief says Codex implements, Claude reviews, a fresh Cursor session validates, and Mark approves. On #44:

- both commits (`7262689`, `1acd5c8`) are authored by "Cursor Agent";
- the "Independent review — PASS" comment comes from `cursor[bot]`, and that review's fixes are commit `1acd5c8` on the same branch.

So no review by a seat that didn't write code on the branch existed before this one. The brief also says "Stop after the draft PR", and #44 isn't a draft.

**What holds. I reproduced these on a disposable Postgres, using an exported copy of the head with no checkout of the branch:**

- **Tests:** 102 passed, 0 failed, 0 skipped with `node --test --test-concurrency=1 lib/hq/*.test.js`. That matches the PR.
- **Wake rule:** `replyWakesLoop` is identical to my §32 patch. HTTP, MCP and the native adapter each call `wakeFromDispatch` once, behind that rule, and `room-mcp.js` uses `after()` the same way the HTTP route does. The new PG tests run the rule on real stored results (first reply true, rejected and replayed false). There's still no test that drives an MCP `room_post` end to end and sees the loop task woken, so the gap §32 lists is narrowed but not closed.
- **SL fields survive.** `slId` and `reviewer` come through `normalizeBaton`, `reviewer === to` is rejected (including callsign variants), and the promotion YAML includes the two fields.
- **Who sets which status:**
  - The assignee can't post `reviewed` or a decision.
  - `reviewed` needs the reviewer seat and a `doc` or `pr` ref.
  - Only `mark` can set `approved`.
  - Authors are stamped from the seat key on both HTTP and MCP.
- **Each SL id is bound to its first baton.** Later posts can't change the assignee or reviewer. On Postgres this check runs inside the advisory lock, and in the file store inside the write.
- **No new table or tool.** No MCP tool was added, and promote and broadcast stay blocked.

**Findings:**

1. **Medium: any seat can claim a new SL id first.** Nothing restricts who posts the *first* baton for an `slId`. I tested `gateStoredSlPost` directly:
   - Seat `codex` posting the first `SL-002` baton with `to: gemini, reviewer: codex, status: dispatched` is accepted.
   - Grok's real dispatch afterwards (`to: codex, reviewer: claude`) is then refused with 403 "already has an assignee and a reviewer".

   So a seat can name itself reviewer of a task it shouldn't review, and block the real handoff. That's the self-approval risk this review is meant to catch. Suggested fix: only the dispatching seats (`grok`, `mark`) may create the binding, meaning the first `dispatched` baton for an id.
2. **Low: an uninvolved seat can change a bound card's status.** In the same test, an uninvolved seat posting `blocked` on a bound card is accepted, so any seat can make a handoff look blocked or claimed. Suggest limiting `claimed`, `in_review` and `blocked` to the assignee and reviewer, plus `grok` or `mark`.
3. **Low: the binding can be lost when history is trimmed.** The binding lives only in room history. The PR notes this for the file store's 500-message cap, and the Postgres path's rejection query depends on the rows staying. Once the first baton is pruned, the id can be bound again. That's acceptable for now if it's written down as a known limit.
4. **Note: statuses can come in any order.** For example, `reviewed` can be posted before any `pr` ref from the assignee, and `approved` before `reviewed`. The brief doesn't require an order, so this is Mark's call, not a defect.

**Verdict.** Approve once finding 1 is fixed and the work split above is acknowledged. Findings 2–4 can follow later. Merging is Mark's call.

I made no PR comment, no review submission and no edits on the branch.

## 38. 2026-10-16 01:48 UTC pass: post-merge state

**HQ.**
- #44 (SL-001) is merged as 5199429, pinned to head 1acd5c8, on Mark's instruction. The post-merge `HQ room MCP` workflow passed. I can't verify the Vercel production deploy because hq.sooklabs.com is unreachable from this sandbox.
- The #44 first-binding finding (§37, finding 1) is still open on master. Any seat can create the first SL binding, and that blocks the real dispatch with a 403. A small fix PR is offered, pending Mark's go-ahead.
- #42 was merged by cursor[bot] as squash 54b4251. Two problems:
  - Head 0ab90b5 was not re-reviewed, and Codex's blocker is still unaddressed. The precedence line in `SOOKLABS_SYSTEM_CONTRACT.md` and the "Acceptance Contract" title of `RDUSA_VERTICAL_SLICE.md` are unchanged.
  - The final commit added a historical commercial figure to `docs/acceptance/RDUSA_VERTICAL_SLICE.md` line 6. That breaks the repo's no-commercial-figures rule, so this relay does not repeat it. A one-line removal PR is offered.

**SEOS.**
- #11 (Prisma migration lock) was merged by cursor[bot]. CI and `deploy-droplet` passed on 49cfbcb.
- #12 was merged by Mark. CI and `deploy-droplet` passed on 0ab82ff.
- The production DB still needs the baseline `prisma migrate resolve --applied 20260716193000_add_authority_tracker`, then `migrate deploy`. The workflow has no migrate step. This is Mark's action.

**Gates.** I made no merges this pass beyond #44. Further merges wait for Mark's explicit per-PR go-ahead. Merging master 54b4251 into this branch was the only repo change.

## 39. 2026-10-19 20:46 UTC pass: SEOS #13 merged; deploy correction

**Correction to §38.** The SEOS `deploy-droplet` runs did not deploy. In the job log for run 39318441609 on 0a38c92, "Check deploy secrets" passed, then checkout, build, SSH, upload and restart were all **skipped**. That is the inert path for when `DROPLET_HOST`/`DROPLET_SSH_KEY` are unset. The runs for #11 (49cfbcb) and #12 (0ab82ff) took about the same 10 s, so they almost certainly skipped too. "Deployed to the droplet" in §38 and Drive doc 44 is therefore wrong. The droplet is still on whatever was last deployed by hand. Vercel status is unverified from here.

**SEOS #13** ("Scheduler auto-publish endpoint + persistent Meta connection") was merged by Mark at 20:17 as 0a38c92. 42 files, about 3.1k lines. CI passed on the branch and on main. Review is report-only, and I made no changes.
- Auth looks sound:
  - `/api/scheduler/posts` GET/POST require `X-API-Key`, at least 24 chars, compared with `safeEqual`.
  - Both cron routes require `CRON_SECRET`, at least 16 chars, sent as Bearer or `X-Cron-Secret`.
  - The OAuth callbacks are not open paths, so they need a session. They also check the HMAC-signed state, its 15-minute expiry and a nonce cookie.
  - Meta tokens are stored with AES-256-GCM using a 32-byte key.
- **Gate note:** `ensureSchedulerSchema()` creates the three scheduler tables on first use at runtime. The DDL is `CREATE … IF NOT EXISTS` only and refuses anything else. It is additive, but it is still a schema change on the production DB outside `prisma migrate deploy`. HQ-MCP-CONTROL-PLANE line 56 gates migrations. Analytics already uses the same pattern (an install POST behind a session), but here the change happens implicitly on any scheduler call. Mark's call whether that counts as approved.
- **Ordering:** migration `20261020030000_add_scheduler_meta` is stamped a day in the future. That's harmless.
- **Still pending, and now two steps:** production needs the baseline `migrate resolve` for the authority tracker before `migrate deploy`, and then this migration applies. If the app has already self-created the tables, the migration's `IF NOT EXISTS` keeps it safe.
- `vercel.json` adds crons every 5 minutes for publish and daily for token health. These only run on Vercel; the droplet needs its own scheduler. `docs/scheduler-cron.workflow.yml.txt` is the template for that.
- New env vars needed: `SCHEDULER_API_KEY`, `CRON_SECRET`, `META_TOKEN_ENCRYPTION_KEY` and the Meta app credentials. Credential setup is Mark's.

HQ: no change (master 54b4251, no PR updates). Drive: no new outbox files.

## 40. 2026-10-20 04:28 UTC pass: SEOS #14 (open) reviewed

SEOS #14, "SL social-loop: analytics + scheduled posts for Claude's improvement loop", is open. Mark authored it on branch `social-loop/init` (c75776f). It adds 31 files under `social-loop/` and changes no code:
- a README loop contract;
- an FB analytics export dated 17 Oct, with a column guide;
- 13 queued posts with first comments, plus `index.csv`;
- one published post and its permalink;
- an empty `iterations/` folder.

I reviewed it read-only and made no comments or edits. I checked the queued posts against the README's own hard rules:
- **Links:** no URLs in any post body. The only URL is in the published permalink file, which is expected. All 13 first comments match the required CTA line exactly.
- **Scarcity framing:** none. The "Founding 10" wording appears only in old posts quoted in the analytics CSV, not in queued copy.
- **Unshipped features:** none claimed (no email channel, website scan or call feature).
- **No RDUSA or JAKA mentions, no medical advice.**
- **Cadence holds:** 3 posts per week per Page for the weeks of 19 Oct and 26 Oct. The two Pages never share a day, and times are 11:00 / 19:00 ICT as specified.
- **Offer wording** matches the README's single allowed form. This relay does not repeat the figures.

Observations for Mark:
- Reach has fallen. Late-August SookLabs posts reached about 20–25; October posts reach 0–7. Click data is blank, so CTR can't be judged.
- The contract tells Claude to submit iteration PRs under `social-loop/iterations/<date>/` only. I won't start that until #14 is merged and Mark asks for it.

HQ: no change. SEOS main is unchanged at 0a38c92.

## 41. 2026-10-20 20:29 UTC pass: SEOS #15 merged (publish cron moved to daily)

SEOS main moved from 0a38c92 to 65ad8b2. Mark merged #15, "vercel.json: run publish cron daily (Hobby plan allows daily crons only)". It is a one-line change: `/api/scheduler/cron/publish` now runs at `0 2 * * *` instead of `*/5 * * * *`. Token-health is unchanged at `0 1 * * *`.

- **CI:** `ci` passed on 65ad8b2.
- **`deploy-droplet` run 5 passed, but did not deploy.** It took 11s, which is the same inert path as before: secrets are not set and the deploy steps were skipped. Hosting appears to be Vercel Hobby.

Impact, from reading the merged code. This is report only; I made no comments or edits.
- **Posts will go out late.** 02:00 UTC is 09:00 ICT. The social-loop contract (#14) schedules posts at 11:00 and 19:00 ICT. With only the daily cron, an 11:00 post goes out about 22h late and a 19:00 post about 14h late. A day's 11:00 and 19:00 posts would then both go out in the same 09:00 ICT run.
- **Retries slow from minutes to days.** `publisher.ts` retries transient Meta errors after 5 and then 15 minutes, up to 3 attempts. Under a daily cron, each retry waits until the next day.
- **The scheduler response promises a time it no longer meets.** The API still returns `next_publish_at = scheduled_for + 5 min` (`validation.ts`). `docs/scheduler-auto-publish.md` still says "Vercel Cron every 5 min".
- **The repo already ships a fix.** `docs/scheduler-cron.workflow.yml.txt` is a GitHub Actions backup trigger running `*/5 * * * *`. It is safe alongside Vercel Cron because posts are claimed atomically. To enable it, Mark would:
  1. copy it to `.github/workflows/scheduler-cron.yml`;
  2. set the repo secrets `SEOS_CRON_URL` and `SEOS_CRON_SECRET`.

  Without those secrets the workflow is inert. Setting secrets is Mark's action.
- **Volume is fine.** The cap of 5 posts per run is enough for the current cadence of 3 posts per week per Page.

Offer to Mark: a small SEOS PR that adds the workflow file (inert until the secrets are set) and corrects the doc and `next_publish_at` wording. It would be opened only on his go-ahead.

HQ: no change (master 54b4251). SEOS #14 is still open at c75776f. Drive: no new outbox files.

## 42. 2026-10-20 21:04 UTC pass: HQ #45, SEOS #16 and #17 merged (content and social record)

Mark merged three PRs between 20:34 and 20:47 UTC. I reviewed all three read-only after the merge. I made no comments or edits.

**HQ #45 → master 7be1921: "Content & Social section, briefing action items, Clients (RDUSA, JAKA)"**
- 12 files changed.
- New pages: `/hq/content`, `/hq/clients` and `/hq/clients/[slug]`.
- New components: `ContentSocialBoard` and `ContentActionItems`.
- `lib/hq/content-summary.js` reads SEOS `/api/hq/content-summary` server-side.
  - It sends `SEOS_HQ_API_TOKEN` as a Bearer token, the same token the Authority and Reports panels use.
  - It never throws; on failure it shows "not configured" or the error.
  - It is read-only, and HQ keeps no copy of the posts.
- `lib/hq/clients.js` holds only public profile facts and marks every system as `connected: false`. No metrics are faked.
- `node --test lib/hq/content-summary.test.js`: 5 of 5 pass locally.

**SEOS #16 → cefe22f: "Record every social post per business + read-only HQ content summary"**
- Migration `20261021030000_add_social_record` is additive only. It adds five nullable columns to `scheduler_posts`, the default `origin='seos'`, and a new `social_businesses` table.
- The runtime installer also runs this DDL on first use. It now checks every statement against `ADDITIVE_STATEMENT_RE`, which allows only `CREATE TABLE/INDEX IF NOT EXISTS` and `ADD COLUMN IF NOT EXISTS`. The runtime-DDL gate question from §39 still applies.
- Auth on the new routes:
  - `/api/hq/content-summary` checks the HQ service token.
  - `/api/scheduler/import` checks `SCHEDULER_API_KEY`.
  - Both are added to the middleware open-path list and enforce their own auth.
  - `/api/social/*` stays behind the session login, and its PUT checks same-site.
- Imported rows are `scheduled`, `blocked` or `skipped`. The publish cron only claims `queued` rows, so imports are never published.
- The import seed data (`src/data/social-imports/*.json`) contains the public marketing copy for each client's Page. It holds no secrets or tokens.

**SEOS #17 → 93a02cf: "Social dashboard: All + per-business tabs with calendar, charts, flags and approvals"**
- UI only, under the session gate.

**Deploy state.** The HQ content panel will show the SEOS 404 hint until SEOS is serving 93a02cf. The §41 publish-cron issue (daily only, posts late) is unchanged and still affects these scheduled posts.

Still open for Mark:
- SEOS #14;
- the 5-minute cron backup PR offer (§41);
- the earlier offers: the #44 first-binding fix and removing the commercial figure from the RDUSA acceptance doc.

Telegram remains on hold.

## 43. 2026-10-21 10:50 UTC pass: SEOS #18 merged (social import fixes)

SEOS main moved from 93a02cf to 4dd5cde. Mark merged #18, "Social import: per-row platform for JAKA (+ jaka-ig.csv), skip bad rows instead of aborting". It changes only two files: `scripts/build-social-import.mjs` and `social.test.ts`.

Review (read-only, after merge; no comments or edits):
- JAKA rows now keep their own platform. Before this, every JAKA row was recorded as `facebook`.
- The importer also reads `social-schedule/jaka-ig.csv`.
- `normStatus` maps more status words to the import statuses: `queued/approved` → scheduled, `pending/draft` → blocked, `removed/cancelled/missed` → skipped, `error` → failed.
- A bad row is now skipped with a warning instead of aborting the whole push. If one business fails to build, the others still post, and the script exits with code 1.
- New tests cover the status mapping, row skipping and the JAKA FB/IG keys.
- **Note: possible stale duplicates.** A JAKA Instagram row now gets the key `jaka:instagram:<stamp>[:llc]`. If an earlier live import pushed the same row as `jaka:facebook:<stamp>[:llc]`, both rows now exist. Import upserts by key and never removes keys that disappeared, so the old row stays. It would show up as an extra Facebook post with a stale status in the SEOS calendar and the HQ content summary.
  - The bundled snapshot is not affected. `src/data/social-imports/jaka.json` has only Facebook rows and no Instagram notes, and none of the `sooklabs.json` keys disagree with their platform.
  - The issue only arises if the import script was run against production between #16 and #18.
  - Check (Mark): `SELECT idempotency_key, status FROM scheduler_posts WHERE idempotency_key LIKE 'import:jaka:facebook:%' AND origin LIKE 'import:%'`, then compare the result with jaka.csv rows whose platform is Instagram. Delete any mismatches by hand, or set their status to `skipped`.

HQ: no change (master 7be1921). SEOS #14 is still open. The §41 publish-cron issue (daily runs only) is unchanged. Drive: no new outbox files.

## 44. 2026-10-21 11:22 UTC pass: SEOS #19 merged (social reporting, delete_keys, account IDs)

SEOS main moved from 4dd5cde to e40bd6d. Mark merged #19, "Social reporting: box publisher heartbeats, last push, days ahead; import can delete stale keys and fill account IDs". It touches 12 files. I reviewed it read-only after the merge and made no comments or edits.

What the PR adds:
- **Migration `20261021120000_add_social_reports`.** It is additive only: one new `social_reports` table. The same SQL is embedded for the runtime installer, and a test keeps the two identical.
- **`POST /api/scheduler/import` takes three new arrays.** The route is still gated by `SCHEDULER_API_KEY`.
  - `reports[]`: publisher heartbeats.
  - `delete_keys[]`: up to 100 keys. It only deletes rows whose origin starts with `import:`, and never a key that is also in the same batch. This is the clean-up path for the stale JAKA `facebook` keys I noted in §43.
  - `accounts[]`: fills Page, IG and Threads IDs.
- **HQ content summary additions:** `daysAhead`, `scheduledThrough`, `reporting.lastPushAt`, `pushStale`, publisher health, and `totals.unhealthyPublishers`.
- **Default account map:** now carries the public RDUSA and JAKA Page, IG and Threads IDs. Both accounts stay `enabled: false`, because the ops box publishes for them, not SEOS.

Findings for Mark:
1. **`accounts[]` widens what the scheduler API key can do.**
   - Before this PR, the key could only queue and import posts. Now it can overwrite the platform IDs of any known account, including enabled accounts that SEOS publishes to (the Sookly / SookLabs Pages).
   - It cannot enable an account or touch tokens. But if the key leaked, the holder could repoint an enabled account's `facebook_page_id` to another Page that the same Meta token can manage. Queued posts would then publish there.
   - **Suggested fix:** only apply `accounts[]` to accounts where `enabled = false`, or only fill fields that are currently null. Either is a one-line guard in `importRecords`.
2. **The bundled snapshot can put deleted keys back.** `syncBundledImports()` re-inserts the committed snapshot on each cold start, in insert mode. If a key passed to `delete_keys` is also in `src/data/social-imports/*.json`, it comes back on the next cold start.
   - The current JAKA snapshot is Facebook-only and correct, so the stale keys from §43 are not affected.
   - It would matter for any future delete of a snapshot key.
   - **Fix options:** have the snapshot sync skip keys that were deleted (a tombstone), or drop keys from the snapshot whenever they are deleted.

Unchanged:
- HQ master is still 7be1921.
- SEOS #14 is still open.
- The publish cron still runs only daily (§41).

Drive: no new outbox files.
