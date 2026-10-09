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
