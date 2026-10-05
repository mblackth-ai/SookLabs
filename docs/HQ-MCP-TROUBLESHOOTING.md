# HQ room MCP — troubleshooting

## Live check (from any shell)

```bash
# Must be POST — GET on the API without Accept: text/event-stream returns JSON discovery (after routing fix deploy).
curl -sS -X POST https://hq.sooklabs.com/hq/api/room/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"initialize","id":1,"params":{}}'
```

**Healthy without a key:** HTTP **401** + JSON-RPC error `Send this seat's connection as Authorization: Bearer <key>.`

**Broken:** HTTP **405** + `text/html` (usually wrong path — see below).

With a seat key:

```bash
HQ_ROOM_CONNECTION=<key> node scripts/hq-mcp-check.mjs
```

## Wrong URL → 405 HTML

| URL | Result |
|-----|--------|
| `https://hq.sooklabs.com/hq/api/room/mcp` | Correct |
| `https://hq.sooklabs.com/api/room/mcp` | OK on HQ subdomain (rewrites to API) |
| `https://hq.sooklabs.com/room/mcp` | **Was broken** (HTML 405); middleware now rewrites to API |

Never use `/room/mcp` in MCP config — that path is the **browser room**, not MCP.

## Cursor / Cloud Agent `sooklabs-hq` connector

1. **Project MCP** (`.cursor/mcp.json` in repo):

   ```json
   {
     "mcpServers": {
       "sooklabs-hq": {
         "url": "https://hq.sooklabs.com/hq/api/room/mcp",
         "headers": {
           "Authorization": "Bearer ${env:HQ_ROOM_CONNECTION}"
         }
       }
     }
   }
   ```

2. Set **`HQ_ROOM_CONNECTION`** in Cursor (user env or Cloud Agent secrets) to **this seat's** key from Vercel `HQ_ROOM_CONNECTION_<SEAT>` or enroll flow (`docs/HQ-MCP-LAUNCH.md`).

3. Reload MCP / restart agent. Discovery failure with no env var is expected until the key is set.

## Vercel / domain

Production alias **`hq.sooklabs.com`** must point at the **SookLabs** Vercel project production deployment (same as PR #20+ merge). In dashboard:

- **Project → Settings → Domains** — `hq.sooklabs.com` assigned, no conflicting redirect to a deleted deployment.
- **Deployments** — latest production is **Ready**; promote if alias stuck on old ID (symptom: intermittent `DEPLOYMENT_NOT_FOUND`).

This repo cannot change Vercel domain bindings from code; merge deploy fixes routing middleware only.

## Still down after deploy

- Confirm `x-matched-path: /hq/api/room/mcp` on POST response headers.
- Room UI → **Re-check MCP** (after PR with probe UI merges).
- Escalate: Mark rotates seat key if leaked; check `HQ_ROOM_CONNECTION_*` still set in Vercel production env.
