# SookLabs internal MCP (v1)

Read-only [Model Context Protocol](https://modelcontextprotocol.io) server for **SookLabs internal use only**. It exposes live GitHub state for this repository (`mblackth-ai/SookLabs`) over **Streamable HTTP** with **OAuth 2.1 resource-server** semantics (RFC 9728 protected-resource metadata, RFC 8707 `resource`, PKCE S256 on the authorization server).

This is **not** the Sookly customer product and does not integrate with Sookly/Jaka/RDUSA apps.

## Tools (read-only)

| Tool | Description |
|------|-------------|
| `project_status` | Repo, default branch, last push, open issue count, homepage, visibility, `seat` |
| `blockers` | Open issues with repo `blocker` label when that label exists on the repo; `label_missing: true` only when the label is absent from the repo |
| `build_status` | Default-branch HEAD `sha`, check runs + commit statuses, `seat` |
| `deploy_status` | GitHub deployment records (no deploy triggers), homepage, `seat` |

No tool accepts `seat`, user, or email arguments. The seat is always the OAuth token `sub`.

## Configuration

Set variables in the environment or in repo-root `sooklabs.env.local` (loaded automatically when the process starts; see `sooklabs.env.local.example`).

All tools read **only** from GitHub repo **`mblackth-ai/SookLabs`** (hard-coded; no override).

| Variable | Required | Purpose |
|----------|----------|---------|
| `SOOKLABS_MCP_OAUTH_ISSUER_URL` | **Yes** (with allowlist + resource) | OAuth authorization server issuer URL (HTTPS). Mark provides the issuer for the login he owns. |
| `SOOKLABS_MCP_RESOURCE_IDENTIFIER` | **Yes** | Canonical MCP resource URI / token audience (RFC 8707). Must match the `resource` requested at authorization time. |
| `SOOKLABS_MCP_SEAT_ALLOWLIST` | **Yes** | Comma- or whitespace-separated OAuth `sub` values allowed to call tools. |
| `GITHUB_TOKEN` or `GH_TOKEN` | Recommended | GitHub API token for live reads. Scopes: **`repo`** (private repo) or **`public_repo`** if public-only. |
| `SOOKLABS_MCP_PORT` | No | Default `3100` |
| `SOOKLABS_MCP_BIND_HOST` | No | Default `127.0.0.1` |
| `SOOKLABS_MCP_PATH` | No | MCP HTTP path; default `/mcp` (must align with `SOOKLABS_MCP_RESOURCE_IDENTIFIER` path) |

**If the issuer or seat allowlist is empty**, every MCP request returns **401** with `WWW-Authenticate` pointing at protected-resource metadata (when `SOOKLABS_MCP_RESOURCE_IDENTIFIER` is set). Do not invent issuer URLs or seats in production.

## Run locally

```bash
cd services/sooklabs-mcp
npm install
npm start
```

Health check (no auth): `GET /healthz`

MCP endpoint: `POST/GET/DELETE` on `{SOOKLABS_MCP_RESOURCE_IDENTIFIER}` path (default `http://127.0.0.1:3100/mcp` only matches if your resource identifier uses that URL).

## OAuth behavior

- **Unauthenticated** MCP calls → **401** + `WWW-Authenticate: Bearer ... resource_metadata="..."`
- **Protected resource metadata** → `/.well-known/oauth-protected-resource` + MCP path suffix (RFC 9728)
- **Invalid/expired token or wrong audience** → **401** `invalid_token`
- **Valid token missing scope `sooklabs:read`** → **403** `insufficient_scope` (RFC 6750)
- **Valid token, `sub` not on allowlist** → **403** `seat_not_allowed`
- **Successful tool result** → JSON includes `seat` equal to token `sub`

Clients must obtain access tokens from the configured issuer using **PKCE S256**, include the **`resource`** parameter (RFC 8707) set to `SOOKLABS_MCP_RESOURCE_IDENTIFIER`, and request scope **`sooklabs:read`** (present in the token’s space-delimited `scope` claim).

## Deployment note

v1 is delivered as a standalone Node service under `services/sooklabs-mcp/`. **Do not deploy to production** until Mark supplies issuer, resource identifier, and seat allowlist. This PR does not wire the server into the Next.js app or Vercel production routes.
