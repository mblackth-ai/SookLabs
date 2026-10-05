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
