# SookLabs internal MCP (v1)

Read-only [Model Context Protocol](https://modelcontextprotocol.io) server for **SookLabs internal use only**. It exposes live GitHub state for **`mblackth-ai/SookLabs`** (hard-locked) and HQ control-plane blockers over **Streamable HTTP** with **OAuth 2.1 resource-server** semantics (RFC 9728 protected-resource metadata, RFC 8707 `resource`, PKCE S256 on the authorization server).

This is **not** the Sookly customer product and does not integrate with Sookly/Jaka/RDUSA apps.

## Tools (read-only)

| Tool | Description |
|------|-------------|
| `project_status` | GitHub: repo, default branch, last push, open issue count, homepage, visibility, `seat` |
| `blockers` | HQ: `getControlPlaneSnapshot().blockers` (`OpsBlocker[]` from ops storage) plus `seat` — not GitHub issues |
| `build_status` | GitHub: default-branch HEAD `sha`, check runs + commit statuses, `seat` |
| `deploy_status` | GitHub: deployment records (no deploy triggers), homepage, `seat` |

No tool accepts `seat`, user, or email arguments. The server derives the room seat from the verified OAuth subject using one configured authorization registry.

### Seat ids vs HQ room

The authorization registry maps verified issuer subjects to `ROOM_SEATS[].id` in `lib/hq/swarm-contract.js` (`mark`, `claude`, `cursor`, `codex`, `grok`, `gemini`, `chatgpt`, `crew`). Legacy comma-separated room seat subjects remain supported. Managed issuers use a JSON object in the same `SOOKLABS_MCP_SEAT_ALLOWLIST` setting: each key is an actual issued JWT `sub`, and its value is an existing room seat id. This is one registry, not a second allowlist. Unknown subjects, malformed JSON and unknown target seats fail closed. Token-supplied seat, email and client-id claims cannot choose the seat.

## Configuration

Set variables in the environment or in repo-root `sooklabs.env.local` (loaded automatically when the process starts; see `sooklabs.env.local.example`).

| Variable | Required | Purpose |
|----------|----------|---------|
| `SOOKLABS_MCP_OAUTH_ISSUER_URL` | **Yes** (with allowlist + resource) | OAuth authorization server issuer URL (HTTPS). Mark provides the issuer for the login he owns. |
| `SOOKLABS_MCP_RESOURCE_IDENTIFIER` | **Yes** | Canonical MCP resource URI / token audience (RFC 8707). Must match the `resource` requested at authorization time. |
| `SOOKLABS_MCP_SEAT_ALLOWLIST` | **Yes** | Explicit subject-to-room-seat JSON registry, or legacy comma-separated room seat subjects. |
| `GITHUB_TOKEN` or `GH_TOKEN` | Recommended | GitHub API token for live reads. Scopes: **`repo`** (private repo) or **`public_repo`** if public-only. |
| `HQ_DATABASE_URL` | When using Postgres ops | Same as HQ UI — blockers read from ops DB. Otherwise `data/hq/ops.json` at repo root. |
| `SOOKLABS_MCP_PORT` | No | Default `3100` |
| `SOOKLABS_MCP_BIND_HOST` | No | Default `127.0.0.1` |
| `SOOKLABS_MCP_PATH` | No | MCP HTTP path; default `/mcp` (must align with `SOOKLABS_MCP_RESOURCE_IDENTIFIER` path) |

**If the issuer or seat allowlist is empty**, every MCP request returns **401** with `WWW-Authenticate` pointing at protected-resource metadata (when `SOOKLABS_MCP_RESOURCE_IDENTIFIER` is set). Do not invent issuer URLs or seats in production.

## Run locally

From repo root (install root deps once so `pg` resolves when using `HQ_DATABASE_URL`):

```bash
npm install
cd services/sooklabs-mcp && npm install && npm start
```

The process `chdir`s to the repo root so ops file paths and HQ data match the Next.js app.

Health check (no auth): `GET /healthz`

MCP endpoint: `POST/GET/DELETE` on `{SOOKLABS_MCP_RESOURCE_IDENTIFIER}` path (default `http://127.0.0.1:3100/mcp` only matches if your resource identifier uses that URL).

## OAuth behavior

- **Unauthenticated** MCP calls → **401** + `WWW-Authenticate: Bearer ... resource_metadata="..."`
- **Protected resource metadata** → `/.well-known/oauth-protected-resource` + MCP path suffix (RFC 9728)
- **Invalid/expired token or wrong audience** → **401** `invalid_token`
- **Valid token missing scope `sooklabs:read`** → **403** `insufficient_scope` (RFC 6750)
- **Valid token, `sub` not on allowlist** → **403** `seat_not_allowed`
- **Successful tool result** → JSON includes `seat` resolved from the verified token subject

Clients must obtain access tokens from the configured issuer using **PKCE S256**, include the **`resource`** parameter (RFC 8707) set to `SOOKLABS_MCP_RESOURCE_IDENTIFIER`, and request scope **`sooklabs:read`** (present in the token’s space-delimited `scope` claim).

## Deployment note

v1 is delivered as a standalone Node service under `services/sooklabs-mcp/`. **Do not deploy to production** until Mark supplies issuer, resource identifier, and seat allowlist. This PR does not wire the server into the Next.js app or Vercel production routes.

**DigitalOcean (recommended host):** App spec template [`deploy/digitalocean-app.template.yaml`](deploy/digitalocean-app.template.yaml). Step-by-step create, DNS (`mcp.sooklabs.com` → DO, not Vercel), secret placeholders, and **A-gate** curls (`/healthz`, unauthenticated `/mcp`): [`docs/DIGITALOCEAN-DEPLOY-RUNBOOK.md`](docs/DIGITALOCEAN-DEPLOY-RUNBOOK.md).

## Recommended issuer: Auth0

Use a dedicated Auth0 tenant/API for HQ rather than reusing customer-product accounts. Auth0 is the managed option recommended here; no tenant, client, credential, paid plan or production DNS has been provisioned by this code change.

1. Register an Auth0 API using the exact HTTPS resource identifier of the deployed standalone MCP service and RS256 signing. Add the `sooklabs:read` permission.
2. Create a separate machine-to-machine client for each worker seat, grant only that API permission, and keep each credential in its worker's secret store. A service client is not the operator's interactive login.
3. Record each real access token subject in `SOOKLABS_MCP_SEAT_ALLOWLIST` as a JSON subject-to-room-seat registry. Do not guess client IDs or copy example values into production. Auth0 machine subjects commonly use the client identity rather than a room seat name.
4. For interactive MCP clients, register an authorization-code/PKCE client with its actual supported callback URL. Verify the client's compatibility with this resource server and its audience/resource flow before calling it connected.
5. Set issuer, resource identifier, registry, GitHub read token and shared HQ storage on the standalone service. Public issuer/resource URLs require HTTPS; loopback HTTP exists only for local acceptance.
6. Run `node --test test/*.test.js`. Then use the real issuer to repeat valid-token, wrong-audience, missing-scope, unknown-subject and cross-seat session denial tests.
7. Prove room handoff separately through the existing room interface. This service has four read-only tools; it does not dispatch workers, post to the room, approve, merge or deploy.

MCP sessions are bound to both authenticated subject and normalized seat. Each initialized session has its own MCP server/transport. Another allowed seat cannot POST, GET or DELETE that session.

### LLM connection acceptance

The HQ room already has all six agent seats. Claude, ChatGPT and Grok have native provider adapters; Cursor and Codex can use authenticated pull or webhook runners; Gemini can also use the existing pull/webhook contract. An adapter setting alone is not live acceptance: each worker must receive a bounded dispatch, claim/acknowledge it, return one linked reply as its own seat and persist a baton/evidence handoff. Start with two distinct seats, then repeat for the remaining four. Obtain provider/runner credentials through secret-safe channels, and do not equate a chat subscription with API or unattended-runner access.

### Evidence boundary

CI uses an isolated local issuer and generated test keys. It tests real HTTP transport, scope checks, subject mappings, shared blocker reads, independent clients and cross-seat denial. It does not prove Auth0 provisioning, public TLS hosting, production persistence, provider credentials, room replies or all-six-seat production acceptance.
