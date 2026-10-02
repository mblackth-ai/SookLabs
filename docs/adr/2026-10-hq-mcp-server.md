# ADR 2026-10: The HQ MCP server — how it is formed, built, and runs the show

- Status: **Proposed** (design only; M0 implementation is a separate slice after #5 merges)
- Date: 2026-10-02
- Builds on: [`HQ-MCP-CONTROL-PLANE.md`](../HQ-MCP-CONTROL-PLANE.md), [`2026-10-hq-event-ingest.md`](./2026-10-hq-event-ingest.md)
- Tool contracts: [`../openapi/hq-mcp-read-tools.yaml`](../openapi/hq-mcp-read-tools.yaml)

## Decision in one paragraph

SookLabs HQ ships **one** MCP server — the SookLabs MCP — and it is the only
front door every agent uses (Claude Code, Cursor, Grok, n8n). Its tools are
thin wrappers over HQ's existing read model, so the MCP and the HQ UI can
never disagree. HQ does not copy SEOS or Sookly data; its tools **call**
those products through service tokens and combine the answers. Reads are
open to any token holder; every write becomes a pending approval that Mark
accepts in HQ before anything happens.

## Shape

```
 Claude Code ─┐                     ┌─ lib/hq/control-plane.js  (fronts, retainers, approvals)
 Cursor ──────┤  Streamable HTTP    │
 Grok (xAI) ──┼──▶ /api/mcp ──▶ server.js ──▶ tools/*.js ──┼─ lib/hq/calls-pg.js / tasks-pg.js (Quo ingest, M1)
 n8n ─────────┘   (bearer token)    │                      ├─ SEOS  (service token, M2) — SEOS stays SoT
 laptops ── stdio bridge ──▶ remote │                      └─ Sookly (service token, later) — Sookly stays SoT
                                    └─ every call → hq_events (source='mcp')
```

## How it is formed (three layers, transport/auth kept apart from domain)

| Layer | Path | Responsibility |
| ----- | ---- | -------------- |
| Tools | `lib/hq/mcp/tools/<tool>.js` | One file per tool: `name`, `description`, `inputSchema` (zod), `scope` (`read`/`write`), `handler(input, ctx)`. Handlers call existing functions only — `getControlPlaneSnapshot()`, `buildRetainerDeliveryIndex()`, `FRONT_PLAN`, and (M1) the ingest read functions. No SQL or fetch in a tool file except through those modules. |
| Server | `lib/hq/mcp/server.js` | `createHqMcpServer({ scopes })` builds an `McpServer` (`@modelcontextprotocol/sdk`, 1.31.x at time of writing) and registers only tools whose `scope` the caller holds. Wraps each handler with audit logging and error mapping (`isError: true`). |
| Transports | `app/hq/api/mcp/route.js` | Remote. Stateless Streamable HTTP (`POST`/`GET`/`DELETE`), new server per request — fits Vercel serverless, no session affinity. Added to `isOpenPath` in `middleware.js`; the route authenticates the bearer token itself (same pattern as `agents/callback`). Served at `https://hq.sooklabs.com/api/mcp`. |
| | `scripts/hq-mcp-stdio.mjs` | Local stdio bridge for Cursor / Claude CLI. Forwards to the remote endpoint with the caller's token — **no database credentials on laptops**. |

Tool names and input/output shapes are exactly those in
`docs/openapi/hq-mcp-read-tools.yaml`. A tool change updates that file in the
same PR.

## How it runs the show

1. **One read model.** UI pages and MCP tools call the same functions. A
   number on `/hq/retainers` and the `retainer_delivery` tool are the same
   object. Retainer PASS/FAIL still only changes through a reviewed contract
   PR (#5).
2. **HQ calls the other products; it doesn't copy them.**
   - SEOS: HQ tools call SEOS read endpoints with `SEOS_HQ_API_TOKEN`, as
     `lib/hq/authority-client.js` already does for Authority. When SEOS ships
     its own thin MCP (list businesses / jobs / results), HQ calls that
     instead of re-implementing it. SEOS Publication Jobs stay the scheduler
     of record — see [`seos-schedule-mirror-gap.md`](../integrations/seos-schedule-mirror-gap.md).
   - Sookly (app.sookly.co): same pattern once its API and tenancy are
     settled. No embed or write until auth is clear.
   - Every downstream call degrades like `readAuthoritySummary()`:
     `configured:false` / `ok:false`, never a thrown 500 to the agent.
3. **Every agent connects once, to the same server.**

   | Agent | Connection |
   | ----- | ---------- |
   | Claude Code | `claude mcp add --transport http hq https://hq.sooklabs.com/api/mcp --header "Authorization: Bearer $HQ_MCP_READ_TOKEN"` |
   | Cursor | `.cursor/mcp.json` → `{ "mcpServers": { "hq": { "url": "https://hq.sooklabs.com/api/mcp", "headers": { "Authorization": "Bearer …" } } } }`, or the stdio bridge |
   | Grok | xAI Remote MCP Tools (Grok 4.3+; Streamable HTTP/SSE): add `{ "type": "mcp", "server_url": "https://hq.sooklabs.com/api/mcp", "server_label": "sooklabs-hq" }` to the request's `tools`. `scripts/grok-review.mjs` can then query HQ live instead of judging from the diff alone. Confirm the exact model id and auth-header field against xAI docs when wiring it. |
   | n8n (`hooks.sookly.co`) | MCP client node or plain HTTP to the same endpoint; replaces ad-hoc HQ reads. |

4. **Writes go through Mark.** M3 write tools (`dispatch_bounded_agent_job`,
   `record_decision`, `update_project_status`, `approve_action`) never act
   directly. Each one inserts a pending approval (shown with the existing
   `approvals` in the control plane) and returns its id. Mark accepts in the
   HQ UI; only then does HQ perform the action and record the receipt. No
   tool can bypass merge, deploy, production migration, credential,
   billing/spend, or external-publishing gates — `guardrails` in the
   snapshot stays the contract.
5. **Everything is auditable.** Each tool call writes an `hq_events` row
   (`source='mcp'`, tool name, caller token id, input hash, duration,
   outcome). No transcript text or secrets in the audit row.

## Access

| Token (env) | Scope | Who |
| ----------- | ----- | --- |
| `HQ_MCP_READ_TOKEN` | `read` | Claude, Cursor, Grok, n8n |
| `HQ_MCP_WRITE_TOKEN` (M3 only) | `read` + `write` (approval-gated) | Mark-issued, per agent |

Separate from `HQ_AGENT_CALLBACK_SECRET` and `SEOS_HQ_API_TOKEN`. Rotating
one never breaks another. OAuth can replace static tokens later without
touching tools (transport layer only).

## Release phases (each one bounded slice; ships only when Mark merges)

| Phase | Ships | Depends on |
| ----- | ----- | ---------- |
| **M0** | route, server, stdio bridge, audit; tools `hq_status`, `project_status`, `pending_approvals`, `retainer_delivery`, `next_actions`, `rdusa_value_expansion` | #5 merged. No new data. |
| **M1** | `client_calls`, `call_detail`, `search_calls`, `client_tasks` | Quo ingest slice ([`integrations/quo.md`](../integrations/quo.md)) |
| **M2** | `scheduled_posts` and other SEOS reads via SEOS API / SEOS MCP | SEOS gaps 1–3 closed |
| **M3** | approval-gated write tools | M0 audit live; Mark signs off the approval flow |

## M0 acceptance

1. MCP Inspector CLI (`npx @modelcontextprotocol/inspector --cli <url> --method tools/list`) against local dev lists exactly the six M0 tools.
2. `tools/call retainer_delivery` returns the same object as `GET /hq/api/control-plane` → `data.retainerDelivery`.
3. No token / wrong token → `401`, no tool list.
4. Each call writes one `hq_events` row with `source='mcp'`.
5. Claude Code connects with the `claude mcp add` line above and can call `hq_status`.
6. `npm run lint` and `npm run build` pass.

## Alternatives rejected

- **One MCP per product, agents connect to all of them.** Three auth setups
  per agent and no single view; HQ's job is the single view.
- **HQ mirrors SEOS/Sookly databases.** Creates a second source of truth,
  which `HQ-DEVELOPER.md` §5 already forbids for Authority.
- **Direct write tools with "be careful" prompts.** Writes need receipts
  from Mark, not model discipline.
- **Stateful sessions on Vercel.** Serverless instances don't share memory;
  stateless Streamable HTTP avoids session affinity.
