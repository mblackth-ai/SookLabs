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
