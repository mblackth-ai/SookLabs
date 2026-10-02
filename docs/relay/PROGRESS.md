# Agent progress (read by Grok on every push)

## Current — Claude, 2026-10-03, branch `claude/hq-visual-pass`

**FRONT:** HQ / MCP Gateway — visual inspection of the running HQ UI.

**FINDING** (seen in a real browser; full record in `docs/relay/visual-inspection-2026-10-02.md`)
- 321 page loads (master+#5 and both git-UI branches × 3 viewports): all 200, zero console/page errors.
- 9 interaction flows PASS (login states, nav/back/forward, mobile drawer, keyboard, banner, sign-out, repo timeline, branch-card actions).
- P1: same product shows 3 different progress numbers across Overview / Eight fronts / Portfolio; branch-card "Merge"/"Delete remote branch" only write to this browser.
- P2: logout doesn't revoke token; badges spill/clip on mobile (one cause, `Badge.jsx`); default-blue links at 2.0:1 contrast; commit drawer clips content; Knowledge Usage table overflow (fixed on branches); stale P0 dates on seed data.
- SEOS: BLOCKED — repo not readable, `seos.sooklabs.com` blocked by network policy.

**PROPOSED SLICE** (inspection only — no application code changed)
- `docs/relay/visual-inspection-2026-10-02.md` — inventory, findings, operating-model notes.
- `.claude/skills/run-sooklabs/inspect.mjs`, `flows.mjs`; `driver.mjs` stop fix; SKILL.md gotchas.

**OUT OF SCOPE:** any fix (waits for Mark's go); SEOS; merge/deploy/PR.

**QUESTIONS FOR MARK:** go-ahead on P2 fixes (Badge, link colour, drawer wrap)? Which progress number is canonical per product (P1-1)? Should "Merge" on branch cards exist (P1-2)? Revoke-on-logout (P2-1)?

**ANSWERS TO GROK:** (none yet)

## History

### Earlier — Claude, 2026-10-02, branch `claude/hq-quo-ingest-spec`

**FRONT:** HQ / MCP Gateway (SookLabs), on top of #5 (`392874c`).

**FINDING**
- HQ already has the patterns needed: `getControlPlaneSnapshot()` as the
  single read model; retainer contracts with `clientId` (`rdusa`, `jaka`);
  secret-authenticated inbound routes (`agents/callback`); a token pull
  client for SEOS (`lib/hq/authority-client.js`).
- `hq_ops` is one JSONB row with capped lists, rewritten on every save — not
  fit for calls or transcripts.
- Quo `2026-03-30` call events (completed / transcript / summary) arrive in
  any order → ingest must upsert by call id and be replayable.
- SEOS has no Publication Job read endpoint yet, and no SEOS business →
  `clientId` mapping. SEOS repo not readable by Claude yet.

**PROPOSED SLICE** (docs only, no code)
- `docs/integrations/quo.md` — events, signature, client mapping, guardrails, acceptance.
- `docs/adr/2026-10-hq-event-ingest.md` — clients/retainers stay code-defined;
  new `hq_events` / `hq_calls` / `hq_tasks`; tasks start `proposed`.
- `docs/openapi/hq-mcp-read-tools.yaml` — 10 read-only tool contracts.
- `docs/integrations/seos-schedule-mirror-gap.md` — 7 gaps (SookLabs-only view).
- `docs/adr/2026-10-hq-mcp-server.md` — how the HQ MCP is formed (tools / server /
  transports), federates SEOS and Sookly by calling them, connects Claude,
  Cursor and Grok (xAI Remote MCP), gates writes on Mark; phases M0–M3.
- Skills: `.claude/skills/run-sooklabs/` (driver: start, login, api, ss,
  callback, stop — verified) and `.claude/skills/hq-relay/`.
- Relay: `.github/workflows/grok-review.yml`, `scripts/grok-review.mjs`,
  `docs/relay/` — Grok reviews each push automatically.

**OUT OF SCOPE:** code, migrations, PR/merge/deploy; SEOS and
sookly-omnichat repos; `scheduled_posts` tool; `docs/LLM_LANE_MAP.md` (next
docs PR); dashboard UI; Sookly embed; writes to Quo.

**QUESTIONS FOR MARK:** Quo lines for RDUSA/Jaka; Sookly's own line in
scope?; transcript retention (proposed 180 days); MCP read token.

**ANSWERS TO GROK:** (none yet — first run)


(none yet)
