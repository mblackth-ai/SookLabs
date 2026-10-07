# HQ MCP production activation (SookLabs internal)

Canonical architecture: [`HQ-MCP-CONTROL-PLANE.md`](./HQ-MCP-CONTROL-PLANE.md). HQ room + adapters: [`HQ-DEVELOPER.md`](./HQ-DEVELOPER.md). Service README: [`../services/sooklabs-mcp/README.md`](../services/sooklabs-mcp/README.md).

**Two MCP surfaces (do not conflate):**

| Surface | URL / package | Auth | Tools (v1) |
| --- | --- | --- | --- |
| HQ room MCP (merged on Vercel HQ) | `https://hq.sooklabs.com/hq/api/room/mcp` — see [`HQ-MCP-LAUNCH.md`](./HQ-MCP-LAUNCH.md) | Per-seat `HQ_ROOM_CONNECTION` bearer | `room_read`, `room_board`, `room_inbox`, `room_claim`, `room_post` |
| Standalone read-only resource server (this PR) | `services/sooklabs-mcp` → `https://mcp.sooklabs.com/mcp` | OAuth access token (`sooklabs:read`) + subject→seat registry | `project_status`, `blockers`, `build_status`, `deploy_status` |

Room MCP executes dispatch; the standalone service is read-only GitHub + HQ control-plane snapshot and never dispatches workers.

## Fixed production target

| Item | Value |
|------|--------|
| Resource identifier / audience | `https://mcp.sooklabs.com/mcp` |
| Scope | `sooklabs:read` only |
| Issuer | Dedicated **Auth0** tenant (Mark-owned) |
| Host | Standalone Node service on **DigitalOcean** (HTTPS) |
| HQ room | **Vercel** (`hq.sooklabs.com`) — unchanged |

Empty issuer or empty seat registry → **401** `mcp_not_configured` (fail closed).

## Subject → seat registry (one env var)

Set **`SOOKLABS_MCP_SEAT_ALLOWLIST`** to JSON mapping each real Auth0 access-token **`sub`** to an HQ room seat id from `ROOM_SEATS[].id` in `lib/hq/swarm-contract.js`:

```json
{
  "<auth0-sub-for-claude-m2m>": "claude",
  "<auth0-sub-for-cursor-m2m>": "cursor",
  "<auth0-sub-for-codex-m2m>": "codex",
  "<auth0-sub-for-grok-m2m>": "grok",
  "<auth0-sub-for-gemini-m2m>": "gemini",
  "<auth0-sub-for-chatgpt-m2m>": "chatgpt"
}
```

Obtain each **`sub`** only from a real token (client credentials + `resource=https://mcp.sooklabs.com/mcp`). **Never** commit subjects, client secrets, or tokens.

Tool results expose **`seat`** = resolved room id. Room dispatch uses **`HQ_ROOM_CONNECTION_*`** / existing adapters — the MCP service does not dispatch workers.

Also set on the MCP host (secret store): `SOOKLABS_MCP_OAUTH_ISSUER_URL`, `SOOKLABS_MCP_RESOURCE_IDENTIFIER`, `GITHUB_TOKEN`, `HQ_DATABASE_URL` (same ops DB as HQ for `blockers` parity).

## Activation gates (before merge/deploy)

Operational runbook (create DO app, env, DNS, A-gate curls without Auth0): [`services/sooklabs-mcp/docs/DIGITALOCEAN-DEPLOY-RUNBOOK.md`](../services/sooklabs-mcp/docs/DIGITALOCEAN-DEPLOY-RUNBOOK.md).

1. **DNS** — `mcp.sooklabs.com` must route to the DO MCP app, not an empty Vercel project (`x-vercel-error: DEPLOYMENT_NOT_FOUND` is a blocker).
2. **Auth0** — API identifier `https://mcp.sooklabs.com/mcp`; permission `sooklabs:read`; six M2M clients.
3. **Deploy** — `services/sooklabs-mcp` on DO; `GET /healthz` → 200.
4. **HTTP acceptance** — valid read, invalid/expired token, wrong audience, missing scope, unknown subject, cross-seat session denial (see CI `MCP authentication checks` + production smoke with real tokens via env, never logged).
5. **Room** — two-seat dispatch + baton handoff, then all six agent seats with persisted evidence on production HQ Postgres.

## Rollback

Redeploy previous DO revision; revert DNS if needed. Record deployed git SHA and `/healthz` response.

## Evidence table (fill in production)

| Gate | Status | Link / note |
|------|--------|-------------|
| DNS → DO | | |
| Auth0 API + six M2M | | |
| Registry populated | | |
| Production MCP acceptance | | |
| Two-seat room baton | | |
| Six-seat MCP + room | | |
