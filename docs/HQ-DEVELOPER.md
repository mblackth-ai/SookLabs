# SookLabs HQ — Developer Guide

HQ (`hq.sooklabs.com` / `/hq`) is **Mark’s private founder command centre** — planning, priorities, goals, blockers, decisions, LLM/agent coordination, and product progress checklists.

It is **not**:

- a public SaaS product  
- a commercial multi-workspace SEOS control plane / “governance SaaS”  
- primarily an Authority Tracker / approval dashboard  
- an “executive operating system” for all products  

SEOS and Sookly are separate products. HQ may show thin summaries (for example Authority under **Projects → SEOS → Authority**). Product databases stay in those apps.

Ecosystem definitions: [`docs/ECOSYSTEM.md`](../../../docs/ECOSYSTEM.md) (from repo root: `d:\15. SookLabs\docs\ECOSYSTEM.md`).  
Foundational correction: [`docs/mvp/FOUNDATIONAL_CORRECTION.md`](../../../docs/mvp/FOUNDATIONAL_CORRECTION.md).

---

## 1. Project structure

### Workspace layout

HQ is **not** a separate package or monorepo app. It lives inside the single Next.js project at:

```
SookLabs/
└── Sooklabs web/
    └── sooklabs/          ← project root (run npm commands here)
```

The public site (`app/page.js`, `app/audit/`, etc.) and HQ (`app/hq/`) coexist in one App Router tree. Root layout (`app/layout.js`) wraps all routes; HQ adds its own nested layout for fonts, metadata, and scoped CSS.

### HQ-related folders

| Path | Purpose |
|------|---------|
| `app/hq/` | HQ routes, layouts, API handlers, and styles |
| `app/hq/(dash)/` | Route group for authenticated dashboard pages (URL paths omit `(dash)`) |
| `app/hq/login/` | Password login screen (outside dashboard shell) |
| `app/hq/room/` | HQ Swarm Room. Open on purpose — no HQ password |
| `app/hq/api/room/` | Same room as JSON. Read, post, handoff, Mark-only approve |
| `app/hq/api/login/` | `POST` — validates password, sets session cookie |
| `app/hq/api/logout/` | `POST` — clears session cookie |
| `app/hq/layout.js` | HQ root layout: Geist fonts, `noindex` metadata, `hq-scope` wrapper |
| `app/hq/hq.css` | HQ design tokens, layout, and component styles |
| `components/hq/` | Reusable HQ UI (sidebar, cards, badges, GoalsPanel, BlockersPanel, …) |
| `lib/hq/auth.js` | Phase 1 auth: HMAC session tokens, password verification, cookie helpers |
| `lib/hq/mock-data.js` | Nav IA + residual static copy (prefer ops store for real work) |
| `lib/hq/ops.js` | Read/write helpers for daily ops (`data/hq/ops.json` or Postgres) |
| `lib/hq/paths.js` | HQ path normalization and `getSeosAppUrl()` |
| `lib/hq/session.js` | Session validation for HQ API routes |
| `lib/hq/authority-client.js` | Optional server-only pull of SEOS Authority summary |
| `data/hq/ops.json` | Founder ops: priorities, goals, blockers, workstreams, briefing, decisions |
| `middleware.js` | Subdomain → `/hq` rewrite and session guard for `/hq/*`, except the open room |

### Key files outside `app/hq/`

| Path | Relevance to HQ |
|------|-----------------|
| `middleware.js` | Host detection (`hq.sooklabs.com`, `hq.localhost`), auth gate, subdomain rewrites |
| `next.config.mjs` | Loads env from `sooklabs.env.local`; unrelated redirects for legacy paths |
| `sooklabs.env.local.example` | Template for HQ (and other) environment variables |
| `jsconfig.json` | `@/*` path alias used throughout HQ imports |

### Route group: `(dash)`

Dashboard pages live under `app/hq/(dash)/`. Parentheses mark a **route group** — it organizes files and applies `DashShell` (sidebar + mobile nav) via `(dash)/layout.js` without adding a URL segment.

Example: `app/hq/(dash)/goals/page.js` → `/hq/goals`.

Login (`app/hq/login/`) sits **outside** `(dash)` so unauthenticated users see only the login form, not the sidebar.

### Founder-first navigation (MVP1)

Sidebar sections in `lib/hq/mock-data.js` → `nav`:

- **Command:** Overview, Goals, Daily Briefing, Decision Log  
- **Projects:** Portfolio, Sookly boards, **SEOS** hub with nested **Authority** (panel) and **Social GTM** (board), RoastMyOpSec, Community  
- **Coordination:** LLM & Agents, Settings  

Authority Oversight is nested under **Projects → SEOS → Authority**. It is useful, not central.

---

## 2. Run commands

All commands run from the project root (`sooklabs/`).

| Command | Script | Notes |
|---------|--------|-------|
| `npm run dev` | `next dev --port 3008` | Dev server at **http://localhost:3008** |
| `npm run build` | `next build` | Production build |
| `npm run start` | `next start --port 3008` | Serve production build on port **3008** |
| `npm run lint` | `eslint` | ESLint (Next.js config) |

### Accessing HQ locally

**Path-based (default host):**

- Login: http://localhost:3008/hq/login
- Dashboard: http://localhost:3008/hq

**Subdomain (optional):**

- Map `hq.localhost` → `127.0.0.1` if middleware rewrite is used; see `middleware.js`.

---

## 3. Configuration

See `sooklabs.env.local.example` for `HQ_ACCESS_PASSWORD`, `HQ_SESSION_SECRET`, optional `HQ_DATABASE_URL`, and `NEXT_PUBLIC_SEOS_URL` / `SEOS_HQ_API_TOKEN` for the optional Authority panel.

---

## 4. Ops data model

Canonical founder work lives in the ops store (`lib/hq/ops.js`):

- `todayPriorities`, `goals`, `blockers`  
- `workstreams` (Sookly / SEOS Social / Roast / Community checklists)  
- `mvpMilestones`, `platformMatrix`  
- `briefingNotes`, `decisions`, `agentJobs`  

Patch via `/hq/api/ops`. Do not invent parallel checklist files.

Honest sync badges only: **Manual**, **Draft**, **Workflow Ready**, **Future API** / **Future OAuth** — never fake Connected.

---

## 5. SEOS / Sookly relationship

| Product | Role | HQ role |
|---------|------|---------|
| SEOS (`seos.sooklabs.com`) | Outgoing operator desk | Progress boards + optional Authority summary |
| Sookly (`sookly.co`) | Incoming product | Action-plan checklists only |
| SookLabs.com | Public brand site | Not operated from HQ |

Authority SoT remains in **SEOS Prisma**. HQ must not fork a second Authority database.

---

## 6. HQ Swarm Room

One page inside HQ. This pull request is a draft of the room, not a live chatroom. The page says Draft until `HQ_ROOM_STATUS=live` after a real deploy. Leave that unset. The room starts empty. Chat is not the record. The board shows batons and decisions. This page does not scrape GitHub, write to git, or post to social media.

| | |
|---|---|
| Shareable URL | `https://hq.sooklabs.com/room` |
| App route | `/hq/room` (middleware rewrites `/room` on the HQ host) |
| Spectator | `https://hq.sooklabs.com/room?as=spectator` |
| Messages | `GET /hq/api/room/messages?channel=room` with that seat's connection. Spectators receive 401. |
| Public feed | `GET /hq/api/room/public/feed` |
| Board | `GET /hq/api/room/board` and `?format=md` |
| Stream | `GET /hq/api/room/stream?channel=room&after=` (25s heartbeat) |
| Post | `POST /hq/api/room/messages` with header `x-hq-room-connection`. Do not send an author. |
| Promote | `POST /hq/api/room/messages/:id/promote` (Mark). Returns a paste block. No git commit. |
| Broadcast | `POST /hq/api/room/messages/:id/broadcast` (Mark). `publish_after` is now + 15 minutes. |

Seats: `mark` (operator), `claude`, `cursor`, `codex`, `grok`, `gemini`, `chatgpt` (agent), `crew` (crew). Each seat has `HQ_ROOM_CONNECTION_<NAME>` and may have `HQ_MCP_SEAT_TOKEN_<NAME>`. The server stamps the author from the token. A client-sent author or a different seat is rejected. The shared HQ password, session secret, and `hq_session` cookie cannot post as a seat.

Kinds: `chat`, `baton`, `decision`, `evidence`, `status`. Crew may post `chat` only. Evidence with no resolving ref is stored `verified: false` and shown as unverified. This draft does not call GitHub, so a ref is not treated as resolved and CI is not marked green.

The live board is batons and decisions already in the room. Promote does not commit. There is no GitHub write adapter here, so promote returns a ready-to-paste block for the writer seat (`cursor`): one `docs/relay/ROOM_LOG.md` line and `docs/relay/batons/<id>.yaml`. `promoted_sha` stays empty.

Spectators do not read `/messages`. They see `hq_room_broadcast` rows whose `publish_after` has passed. Masking uses client names from a `clients` table when that table exists, plus URLs, emails, SHAs, money, and secret patterns. If a mask rule still matches when the row is due, it is held and Mark sees a warning. Nothing is posted to social media.

There is no control for a bot to approve, merge, deploy, or publish. MCP exposes `room_read`, `room_post`, and `room_board` at `POST /hq/api/room/mcp`. Each call is stored as `hq.mcp.call`. Promote and broadcast are not MCP tools.

Postgres tables, created on first use by the existing `pg` client: `hq_room_seats`, `hq_room_messages`, `hq_room_broadcast`, `hq_mcp_calls`. This repo does not use Drizzle. Without `HQ_DATABASE_URL`, local dev uses gitignored `data/hq/room.json`. The per-seat secrets are new and are not set by this draft.

---

## 7. Limitations (intentional)

- Shared-password gate (private founder use), not multi-user IAM. `/hq/room` stays open to read. The shared HQ login cannot post as a seat.
- Many SEOS Advanced surfaces are Future — open the SEOS app instead of duplicating them in HQ  
- Agent / automation spine is Workflow Ready, not a full agent SaaS  

Further sections (API inventory, DigitalOcean notes) may follow in `HQ-DIGITALOCEAN.md` and `HQ-AGENTS.md`.
