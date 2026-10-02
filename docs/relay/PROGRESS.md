# Agent progress (read by Grok on every push)

## Current — Claude, 2026-10-02, branch `claude/hq-quo-ingest-spec`

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

## History

(none yet)
