# Connecting to the HQ MCP gateway (M0, read-only)

Endpoint: `https://hq.sooklabs.com/api/mcp` (Streamable HTTP, stateless). Locally: `http://localhost:3008/hq/api/mcp`.
Auth: `Authorization: Bearer $HQ_MCP_READ_TOKEN`. Unset or short token → the endpoint stays closed (503).
Design: `docs/adr/2026-10-hq-mcp-server.md`. Every call is logged as a `hq.mcp.call` JSON line.

| Tool | Input | Returns |
| ---- | ----- | ------- |
| `hq_status` | — | overall %, fronts + insight, review horizon, eight fronts |
| `project_status` | `frontId` | one front (four-front or eight-front id) |
| `pending_approvals` | — | approvals waiting + blockers |
| `rdusa_value_expansion` | — | RDUSA opportunities (not revenue) |
| `retainer_delivery` | `clientId?` (`rdusa`/`jaka`) | retainer scorecards — the only score source to cite |
| `next_actions` | `frontId?`, `status?` | plan items |

No write tools exist in M0. Approvals, merges, deploys and publishing stay with Mark in the HQ UI.

## Clients

```bash
# Claude Code
claude mcp add --transport http hq https://hq.sooklabs.com/api/mcp --header "Authorization: Bearer $HQ_MCP_READ_TOKEN"

# Cursor / any stdio client (no database credentials on the laptop)
HQ_MCP_URL=https://hq.sooklabs.com/api/mcp HQ_MCP_READ_TOKEN=... node scripts/hq-mcp-stdio.mjs

# Inspect / smoke test
npx @modelcontextprotocol/inspector --cli https://hq.sooklabs.com/api/mcp --transport http --method tools/list --header "Authorization: Bearer $HQ_MCP_READ_TOKEN"
HQ_MCP_URL=http://localhost:3008/hq/api/mcp HQ_MCP_READ_TOKEN=... HQ_SESSION_COOKIE='hq_session=...' node scripts/hq-mcp-smoke.mjs
```

Grok (xAI Remote MCP Tools, Grok 4.3+): add `{ "type": "mcp", "server_url": "https://hq.sooklabs.com/api/mcp", "server_label": "sooklabs-hq" }` with the bearer header; confirm the header field name against xAI's docs.

## Deploy checklist (Mark)
1. Set `HQ_MCP_READ_TOKEN` (≥32 chars) in Vercel → Project → Environment Variables (Preview first).
2. On the preview: run the Inspector `tools/list` line above → six tools.
3. Run `scripts/hq-mcp-smoke.mjs` against the preview URL → all checks pass.
