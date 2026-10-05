# HQ MCP reliability: master plan (proposal for Cursor to confirm)

Status: **PROPOSAL.** Nothing here is implemented, merged, deployed or accepted. It does not change `docs/HQ-MCP-CONTROL-PLANE.md`, which stays the canonical authority. If confirmed, the "Subordinate document manifest" there gets one row pointing at this file.

Authority and gates: every item below is reversible repository work unless marked **GATE**. Gates (production env/secrets, DNS/alias changes, production migrations, spend, external publishing) stay with Mark. Nothing here adds an MCP write tool.

## 1. What happened (evidence, 2026-10-05)

Reported: the one-hour MVP1 sweep ended and deleted itself; seats could not loop because "HQ room MCP is down". POST returned 405 / a cached page, and earlier a 404 "deployment not found". Newest production deploy was the PR #20 build.

Probed from outside (no credentials, read-only):

| Probe | Result | Meaning |
|---|---|---|
| `POST /hq/api/room/mcp` `initialize`, no key | `401`, JSON-RPC error, `WWW-Authenticate: Bearer realm="sooklabs-hq-room"`, `x-matched-path: /hq/api/room/mcp` | The route is deployed and answering correctly. |
| Same, wrong key | `403` + same challenge | Auth path works. |
| `GET` same URL | `405`, `allow: POST` | By design (stateless server). A client or human using GET sees "405". |
| `GET /` on `hq.sooklabs.com` | `200` HTML, `x-matched-path: /hq/login`, `age` ~6900s | Cached login page. Looks like an outage to anyone who opens the host. |
| `GET /.well-known/oauth-protected-resource`, `oauth-authorization-server`, `openid-configuration` | `200` **HTML** (the login page) | OAuth discovery gets a success status with the wrong content type. Clients that probe OAuth after a 401 can fail or hang. |
| Cursor connector `sooklabs-hq` | `mcp_auth` timed out; namespace stays in `error` | The connector tried OAuth; this endpoint only accepts a static bearer key. |
| Vercel API via the available connection | team has the `sooklabs.com` domain, but **0 projects, 0 deployments, 0 aliases** | We cannot read alias or deploy evidence through that connection. The alias claim was never verified, in either direction. |

Conclusion: on 2026-10-05 the MCP route was **up**. The failures that stopped the loop were (a) the connector speaking OAuth to a bearer-only endpoint, (b) misleading signals (405, cached HTML, earlier 404) with no single place that says "up / degraded / down and why", and (c) no deploy-to-alias evidence we can read. The earlier "404 deployment not found" is unexplained; it is consistent with a transient alias or deployment gap, and we have no log to confirm it. Treat it as unproven.

## 2. Direct problems and fixes

### P1. No honest, unauthenticated "is MCP up?" signal

Fix: add `GET /hq/api/room/mcp/health` (open path in `middleware.js`). Returns JSON only, never HTML, `cache-control: no-store`:

```json
{ "ok": true, "service": "sooklabs-hq-room", "protocol": ["2025-06-18","2025-03-26","2024-11-05"],
  "auth": "bearer", "deployment": "<VERCEL_DEPLOYMENT_ID>", "commit": "<VERCEL_GIT_COMMIT_SHA>",
  "db": "ok|degraded|down", "checkedAt": "<iso>" }
```

No seat names, counts or secrets. `db` is a bounded `select 1` with a short timeout. Acceptance: returns JSON `200` when healthy, `503` JSON when the database is down, never a login page.

### P2. OAuth discovery returns the HQ login page

Fix: in `middleware.js`, on HQ host, `/.well-known/*` returns `404` JSON (`{"error":"not_found"}`) and is not rewritten into `/hq/login`. Keep the existing `WWW-Authenticate: Bearer` challenge. When PR #14 (OAuth resource server) lands, serve real protected-resource metadata from the same path instead. Acceptance: `curl` on those three paths returns non-HTML and non-200 (or real JSON once OAuth exists).

### P3. Connector registered the wrong way

Fix (doc plus script, no code risk): `docs/HQ-MCP-LAUNCH.md` gets a "Cursor connector" section: register `sooklabs-hq` as a **static-header** server with `Authorization: Bearer ${env:HQ_ROOM_CONNECTION}`, never through the OAuth/`mcp_auth` flow. For Cursor Cloud agents the key is a Cursor Dashboard secret (Cloud Agents > Secrets), injected as an environment variable. Use `scripts/hq-seat-enroll.mjs` (pairing code, approver) so no one pastes a key. Extend `scripts/hq-mcp-check.mjs` to print one of: `up`, `auth-rejected`, `oauth-probe-risk` (well-known returns HTML), `unreachable`, `wrong-host-content` (HTML where JSON-RPC was expected). **GATE:** creating or rotating the real Cursor seat key.

### P4. Deploy evidence and alias drift are invisible

Fix:
1. Extend `scripts/verify-hq-deploy.mjs` with an MCP stage: `GET /health`, then unauthenticated `initialize` must return `401` JSON-RPC with `WWW-Authenticate`; well-known paths must not be HTML. Today it has no MCP check at all.
2. New workflow `hq-prod-smoke.yml`, triggered by `deployment_status` (production, success) and `workflow_dispatch`, running the stage above against `https://hq.sooklabs.com`. It records the deploy id and commit from `/health` and compares the commit with the deployment's SHA. A mismatch is reported as "alias not serving the newest production deploy".
3. Store the smoke result as loop evidence (`production_accepted` input), not as a status claim. Per the control-plane rules only a passing production smoke sets acceptance; CI alone never does.
4. Give a read-capable Vercel token (project: `sooklabs`, scope: read deployments/domains) to the evidence job only. **GATE:** token creation and storage as a repo secret. Until it exists the job reports "alias unverified", not "ok".

### P5. Seats stop when MCP blips

Fix, in the seat tooling (`scripts/hq-room.mjs`, `hq-mcp-check.mjs`, loop worker), not the server:
- Client retry with exponential backoff and jitter on `5xx`, network errors and non-JSON responses; never retry `401/403`.
- Classify failures with the same labels as P3 so a seat reports *why* it is idle.
- A seat that cannot reach MCP for N minutes writes a `degraded` heartbeat through its fallback channel (pull/webhook, which the room already supports) so routing marks it offline and does not answer on its behalf.
- `hq-loop-wake.yml` already ticks every 5 minutes with leases, so recovery needs no operator.

Acceptance: killing the endpoint for 10 minutes in a disposable environment leaves seats in `degraded`, no duplicate replies, and they resume on recovery without human action.

### P6. Time-boxed sweeps vanish with no result

The MVP1 sweep deleted itself. Rule: **a sweep is a loop task, not a scheduled agent.** It is created through the existing ops/room interface with Owner, Deliverable, Authority, Acceptance Test, and a budget (end time). At expiry it writes a final summary baton and evidence rows to the room log and marks itself `completed`, `expired-incomplete` or `blocked`. It never deletes its own record. Acceptance: after expiry the room shows the sweep's final state and last evidence, and the operator can re-run it from that record.

### P7. Review queue is invisible to the operator

Draft PRs #76 / #77 and SookLabs #32 / #33 waited on review with no signal. Fix: the room's existing PR/CI projection gets a "waiting on review > 24h" filter and a baton to the named reviewer. This is surfacing, not auto-approval: **merge stays Mark's decision.**

### P8. Cost of ambiguity: one reliable status vocabulary

All of the above emit the same four states in the room: `up`, `degraded` (reachable, something wrong), `down`, `unverified` (we cannot read the evidence). `unverified` is never displayed as green. This follows the "Manual / Workflow Ready / Future API" honesty rule.

## 3. Order of work

| Phase | Items | Risk | Gate |
|---|---|---|---|
| 1 | P1, P2, P3 docs and `hq-mcp-check` classification | Low: one open path, one 404 rule, docs and a script | None |
| 2 | P4 smoke stage in `verify-hq-deploy.mjs` and workflow (reports `unverified` for alias until token exists) | Low | Vercel read token for alias proof |
| 3 | P5 seat retry and heartbeat | Medium: touches seat tooling | None |
| 4 | P6 sweep-as-loop-task, P7 review surfacing | Medium: touches ops/room state | Uses existing ops interface; no production migration unless a new column is needed (then **GATE**) |
| 5 | P2 follow-up: real OAuth metadata with PR #14 | Higher | Issuer provisioning (**GATE**) |

Phase 1 plus 2 closes the incident class seen on 2026-10-05. Do not start Phase 5 before PR #14 converges with the room auth model (control-plane "convergence rule": integrate, do not build competing auth).

## 4. Acceptance for the whole plan

1. `GET /health` returns JSON, includes deployment id and commit, and is never HTML.
2. The three `.well-known` paths on the HQ host are not HTML.
3. `hq-mcp-check` names the failure class for wrong key, unreachable host, HTML-instead-of-JSON and OAuth-probe risk.
4. Post-deploy smoke runs on every production deploy and its result is stored as evidence; alias-vs-deploy mismatch is detected, or reported `unverified`.
5. A simulated 10-minute outage causes degraded seats and clean recovery with no duplicate replies.
6. An expired sweep leaves a readable final record.
7. Existing contracts unchanged: stateless Streamable HTTP, bearer seat keys, no merge/deploy/publish tools, `hq_mcp_calls` audit.

Evidence for each item must be a command output, workflow run or room record, not a seat's statement that it is done.

## 5. Questions for Cursor to confirm

1. Approve Phase 1 and 2 as written? They need no new secrets except the optional Vercel read token.
2. Should `/health` expose the commit SHA publicly? Proposed yes (a SHA is not secret); drop it if you disagree.
3. Which Vercel project and team actually owns `hq.sooklabs.com`? The connection we used lists no projects, so we could not confirm.
4. The "Grok bots analysis" request in the originating message was not defined. Confirm whether it means an analysis of the Grok seat, a Grok-written report, or something else before it is scoped.
5. Is the earlier "404 deployment not found" captured in any log (Vercel runtime/edge logs)? If so attach it so P4 can be tested against the real failure.
