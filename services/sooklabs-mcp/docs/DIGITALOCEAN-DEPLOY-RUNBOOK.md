# DigitalOcean App Platform — SookLabs internal MCP (deploy + A-gates)

Standalone read-only MCP (`services/sooklabs-mcp`) on **DigitalOcean App Platform** in **`sgp`**, public URL **`https://mcp.sooklabs.com`**. This runbook proves **Spec A-gates** (health + unauthenticated MCP fail-closed) **before** Mark supplies Auth0 issuer, seat registry, or other secrets.

Architecture context: [`docs/HQ-MCP-ACTIVATION.md`](../../../docs/HQ-MCP-ACTIVATION.md). Service config reference: [`README.md`](../README.md). App spec template: [`deploy/digitalocean-app.template.yaml`](../deploy/digitalocean-app.template.yaml).

**Do not** point `mcp.sooklabs.com` at Vercel. HQ stays on Vercel (`hq.sooklabs.com`); only the MCP host moves to DO.

---

## What this runbook covers vs Mark (Auth0)

| Item | Who / when |
|------|------------|
| DO app, region `sgp`, port `3100`, `deploy_on_push: false` | This runbook |
| Non-secret `SOOKLABS_MCP_RESOURCE_IDENTIFIER=https://mcp.sooklabs.com/mcp` | In template + DO env |
| DNS `mcp.sooklabs.com` → DO app | This runbook |
| `GET /healthz` → **200** | A-gate (no Auth0) |
| `POST /mcp` without `Authorization` → **401** + `WWW-Authenticate` with `resource_metadata` | A-gate (no Auth0) |
| `SOOKLABS_MCP_OAUTH_ISSUER_URL` (Auth0 tenant issuer, HTTPS) | **Mark** — do not invent |
| Auth0 API identifier = resource URI; permission **`sooklabs:read`** | **Mark** |
| M2M clients per worker seat | **Mark** |
| `SOOKLABS_MCP_SEAT_ALLOWLIST` (real JWT `sub` → room seat JSON) | **Mark** — from live tokens only |
| `GITHUB_TOKEN` / `GH_TOKEN` (read-only GitHub) | **Mark** (secret store) |
| `HQ_DATABASE_URL` (same ops DB as HQ for `blockers` parity) | **Mark** (secret store) |
| Live-issuer smoke, valid-token tool calls, two-seat room baton | **After** Auth0 + registry |

Empty issuer or empty seat registry must remain **401** on MCP (`mcp_not_configured`). Do not run live-token or real-issuer acceptance until Mark configures Auth0.

---

## Prerequisites

- DigitalOcean account with App Platform access.
- [`doctl`](https://docs.digitalocean.com/reference/doctl/) installed and authenticated (`doctl auth init`), **or** use the DO control panel.
- GitHub access to `mblackth-ai/SookLabs` (app clones this repo).
- DNS control for `sooklabs.com` (registrar or DO DNS).

---

## 1. Create the app from the template

Source of truth: [`deploy/digitalocean-app.template.yaml`](../deploy/digitalocean-app.template.yaml).

| Constraint | Template value |
|------------|----------------|
| Region | `sgp` |
| `source_dir` | `services/sooklabs-mcp` |
| HTTP port | `3100` (`SOOKLABS_MCP_PORT`) |
| `deploy_on_push` | `false` |
| Health check | `GET /healthz` |

### Option A — Control panel

1. **Apps** → **Create App** → **GitHub** → repository **`mblackth-ai/SookLabs`**, branch **`master`**.
2. **Edit your app spec** (or import YAML) and paste the template contents. Confirm:
   - Component **source directory** = `services/sooklabs-mcp`
   - **Build command** = `npm ci`
   - **Run command** = `npm start`
   - **HTTP port** = `3100`
   - **Region** = Singapore (`sgp`)
   - **Autodeploy** = off (`deploy_on_push: false`)
3. Create the app. Note the default hostname: `https://<app-name>-<hash>.ondigitalocean.app`.

### Option B — `doctl` (spec apply)

From a clone of this repo at the commit you intend to run:

```bash
# Validate spec (no deploy)
doctl apps spec validate --spec services/sooklabs-mcp/deploy/digitalocean-app.template.yaml

# Create app (first time)
doctl apps create --spec services/sooklabs-mcp/deploy/digitalocean-app.template.yaml --wait

# List apps and capture APP_ID
doctl apps list
```

**Secrets:** The template declares secret *keys* only (`SOOKLABS_MCP_OAUTH_ISSUER_URL`, `SOOKLABS_MCP_SEAT_ALLOWLIST`, `GITHUB_TOKEN`, `HQ_DATABASE_URL`). For A-gates, leave them unset or empty in DO until Mark provides values. The process still starts; MCP stays fail-closed.

To update an existing app from an edited spec:

```bash
doctl apps update APP_ID --spec services/sooklabs-mcp/deploy/digitalocean-app.template.yaml --wait
```

Set runtime secrets in the UI (**Settings** → **App-Level Environment Variables** / component env) or via DO API — **never** commit values to git.

---

## 2. Non-secret environment (verify in DO)

These are set in the template and should appear as plain env vars on the `mcp` service:

| Key | Value |
|-----|--------|
| `SOOKLABS_MCP_BIND_HOST` | `0.0.0.0` |
| `SOOKLABS_MCP_PORT` | `3100` |
| `SOOKLABS_MCP_PATH` | `/mcp` |
| `SOOKLABS_MCP_RESOURCE_IDENTIFIER` | `https://mcp.sooklabs.com/mcp` |

`SOOKLABS_MCP_RESOURCE_IDENTIFIER` must stay aligned with the public URL path (`/mcp`) even before DNS cutover; use the same value when testing via the `*.ondigitalocean.app` URL (TLS terminates at DO; the identifier is the canonical audience URI, not the temporary hostname).

---

## 3. Secret placeholders (names only — Mark fills 1:1)

| Secret key | Purpose |
|------------|---------|
| `SOOKLABS_MCP_OAUTH_ISSUER_URL` | Auth0 (or other) authorization server issuer URL (HTTPS). |
| `SOOKLABS_MCP_SEAT_ALLOWLIST` | JSON map of real access-token `sub` → HQ room seat id (`mark`, `claude`, `cursor`, …). |
| `GITHUB_TOKEN` | GitHub API read token (`repo` or `public_repo`). Alias `GH_TOKEN` also works if set instead. |
| `HQ_DATABASE_URL` | Postgres URL for HQ ops (same as HQ UI) when not using file-backed `data/hq/ops.json`. |

Do not invent issuer URLs, client IDs, subjects, or tokens. See [`README.md`](../README.md) and [`docs/HQ-MCP-ACTIVATION.md`](../../../docs/HQ-MCP-ACTIVATION.md).

---

## 4. DNS cutover: `mcp.sooklabs.com` → DigitalOcean (off Vercel)

1. In the DO app, **Settings** → **Domains** → add **`mcp.sooklabs.com`**. DO shows the required DNS record (typically **CNAME** to `*.ondigitalocean.app` or an **A/AAAA** alias depending on product generation).
2. At your DNS host, **remove** any `mcp` record pointing at **Vercel** (or delete the `mcp` project on Vercel if it only served this hostname).
3. Wait for TLS provisioning on DO (certificate for `mcp.sooklabs.com`).
4. **Blocker check:** `curl -sI https://mcp.sooklabs.com/healthz` must **not** return `x-vercel-error: DEPLOYMENT_NOT_FOUND` or other Vercel error headers.

Until DNS propagates, run A-gate curls against the default `https://<your-app>.ondigitalocean.app` hostname (health + MCP path).

---

## 5. Prove A-gates (no Bearer token, no Auth0)

Replace `BASE` with `https://mcp.sooklabs.com` after cutover, or `https://<app>.ondigitalocean.app` beforehand.

### Gate A1 — Health (no auth)

```bash
BASE="https://mcp.sooklabs.com"
curl -sS -D - "${BASE}/healthz" -o /tmp/sooklabs-mcp-healthz.json
cat /tmp/sooklabs-mcp-healthz.json
```

**Pass:** HTTP **200**, JSON includes `"ok": true`, `"authConfigured": false` (until Mark configures OAuth + registry), `"githubRepo": "mblackth-ai/SookLabs"`.

Save evidence: status line, response headers, and body (screenshot or paste into the activation evidence table in [`HQ-MCP-ACTIVATION.md`](../../../docs/HQ-MCP-ACTIVATION.md)).

### Gate A2 — MCP without Bearer (fail-closed)

```bash
BASE="https://mcp.sooklabs.com"
curl -sS -D /tmp/sooklabs-mcp-unauth-headers.txt -X POST "${BASE}/mcp" \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"a-gate","version":"0"}}}' \
  -o /tmp/sooklabs-mcp-unauth.json
grep -i '^HTTP/' /tmp/sooklabs-mcp-unauth-headers.txt
grep -i '^www-authenticate:' /tmp/sooklabs-mcp-unauth-headers.txt
cat /tmp/sooklabs-mcp-unauth.json
```

**Pass:**

- HTTP **401**
- Response body JSON includes `"error": "mcp_not_configured"` (issuer and/or seat registry still empty)
- Response header **`WWW-Authenticate`** includes **`resource_metadata="https://mcp.sooklabs.com/.well-known/oauth-protected-resource/mcp"`** (RFC 9728 discovery URL derived from `SOOKLABS_MCP_RESOURCE_IDENTIFIER`)

Optional metadata check (no auth; may return minimal or error until issuer is set — header above is the A-gate requirement):

```bash
curl -sS "${BASE}/.well-known/oauth-protected-resource/mcp" | head
```

---

## 6. Deploy / rollback notes

- **Manual deploy:** With `deploy_on_push: false`, trigger **Deploy** in DO from the desired git commit (or `doctl apps create-deployment APP_ID`).
- **Rollback:** Redeploy the previous active deployment in DO; revert DNS only if the hostname was pointed incorrectly.
- Record deployed **git SHA** and `/healthz` body in the evidence table.

---

## 7. After Mark configures Auth0 (out of scope for A-gates)

1. Set `SOOKLABS_MCP_OAUTH_ISSUER_URL`, `SOOKLABS_MCP_SEAT_ALLOWLIST`, `GITHUB_TOKEN`, and `HQ_DATABASE_URL` in DO secrets.
2. Redeploy. Confirm `/healthz` shows `"authConfigured": true`.
3. Run production acceptance from [`HQ-MCP-ACTIVATION.md`](../../../docs/HQ-MCP-ACTIVATION.md): valid token with `sooklabs:read`, wrong audience, missing scope, unknown subject, cross-seat session denial.
4. Prove **two-seat** room dispatch + baton on production HQ, then remaining seats.

Do **not** log tokens or paste secrets into tickets.
