# SookLabs HQ — Developer Guide

SookLabs HQ is an internal executive dashboard embedded in the main SookLabs Next.js app. It shares the same deployment, build pipeline, and repository as the public marketing site (`sooklabs.com`). HQ is mounted under the `/hq` route subtree and can also be served from the `hq.sooklabs.com` subdomain via middleware rewrites.

This document covers structure, commands, configuration, routing, current limitations, and suggested next steps for developers new to the HQ area.

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
| `app/hq/api/login/` | `POST` — validates password, sets session cookie |
| `app/hq/api/logout/` | `POST` — clears session cookie |
| `app/hq/layout.js` | HQ root layout: Geist fonts, `noindex` metadata, `hq-scope` wrapper |
| `app/hq/hq.css` | HQ design tokens, layout, and component styles |
| `components/hq/` | Reusable HQ UI (sidebar, cards, badges, `ComingSoon`, etc.) |
| `lib/hq/auth.js` | Phase 1 auth: HMAC session tokens, password verification, cookie helpers |
| `lib/hq/mock-data.js` | Static mock content for Phase 1 pages (nav, metrics, agents, products, …) |
| `lib/hq/ops.js` | Read/write helpers for git-tracked daily ops (`data/hq/ops.json`) |
| `lib/hq/paths.js` | HQ path normalization and `getSeosAppUrl()` |
| `lib/hq/session.js` | Session validation for HQ API routes |
| `data/hq/ops.json` | Canonical daily ops: priorities, workstreams, briefing notes, decisions |
| `lib/hq/icons.js` | Inline SVG icon strings for sidebar navigation |
| `middleware.js` | Subdomain → `/hq` rewrite and session guard for all `/hq/*` routes |

### Key files outside `app/hq/`

| Path | Relevance to HQ |
|------|-----------------|
| `middleware.js` | Host detection (`hq.sooklabs.com`, `hq.localhost`), auth gate, subdomain rewrites |
| `next.config.mjs` | Loads env from `sooklabs.env.local`; unrelated redirects for legacy paths |
| `sooklabs.env.local.example` | Template for HQ (and other) environment variables |
| `jsconfig.json` | `@/*` path alias used throughout HQ imports |

### Route group: `(dash)`

Dashboard pages live under `app/hq/(dash)/`. Parentheses mark a **route group** — it organizes files and applies `DashShell` (sidebar + mobile nav) via `(dash)/layout.js` without adding a URL segment.

Example: `app/hq/(dash)/agents/page.js` → `/hq/agents`.

Login (`app/hq/login/`) sits **outside** `(dash)` so unauthenticated users see only the login form, not the sidebar.

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

**Subdomain (mirrors production behavior):**

- http://hq.localhost:3008/ → rewritten to `/hq`
- http://hq.localhost:3008/agents → rewritten to `/hq/agents`

Middleware treats `hq.localhost` the same as `hq.sooklabs.com` for path rewriting.

---

## 3. Environment variables

### Env file loading

This project does **not** use a standard `.env.example` at the repo root. Instead:

1. Copy `sooklabs.env.local.example` → `sooklabs.env.local`
2. `next.config.mjs` loads `sooklabs.env.local` at build/dev startup (only keys not already set in the process environment)

For Vercel, add the same keys in **Project → Settings → Environment Variables**.

### HQ-specific variables

Both variables are **required** for HQ login to work. If either is missing, empty, a placeholder (`change-me…`), or invalid, login returns **503** with `"HQ access is not configured."` and protected routes remain locked.

| Variable | Required | Purpose |
|----------|----------|---------|
| `HQ_ACCESS_PASSWORD` | Yes | Single shared password for the HQ login screen. Must not match the placeholder pattern (`change-me`). Compared via SHA-256 hashing for constant-time verification. |
| `HQ_SESSION_SECRET` | Yes | Secret used to HMAC-sign the `hq_session` cookie. Must be **at least 32 characters** and must not match the placeholder pattern. |
| `NEXT_PUBLIC_SEOS_URL` | No | SEOS product app URL for "Open SEOS app" links from HQ intel views. Defaults to `http://localhost:3000`. |
| `HQ_DATABASE_URL` | Prod | DigitalOcean Postgres connection string. When set, ops data persists in `hq_ops` table instead of ephemeral filesystem. |
| `HQ_CRON_SECRET` | Automation | Bearer secret for `POST /hq/api/cron/morning` (DO cron or worker). |
| `ANTHROPIC_API_KEY` | Automation | Claude API key for Ask AI and morning briefing generation. |
| `HQ_LLM_MODEL` | No | Anthropic model id (default: `claude-sonnet-4-20250514`). |
| `HQ_CRON_URL` | Worker | Full URL for `scripts/hq-morning-worker.mjs` HTTP mode. |

### Other env vars (not HQ-specific, but in the same file)

These appear in `sooklabs.env.local.example` for the public site contact form and are unrelated to HQ auth:

- `RESEND_API_KEY`
- `CONTACT_TO_EMAIL`
- `CONTACT_FROM_EMAIL` (optional)

`NEXT_PUBLIC_SITE_URL` is referenced in `app/layout.js` for public-site metadata only.

### Runtime behavior tied to env

| Concern | Behavior |
|---------|----------|
| Session cookie name | `hq_session` (`HQ_COOKIE` in `lib/hq/auth.js`) |
| Session TTL | 7 days (`SESSION_MAX_AGE_SEC`) |
| Cookie `secure` flag | Set when `NODE_ENV === "production"` **or** `VERCEL === "1"` |
| Placeholder rejection | `resolveAccessPassword()` and `resolveSessionSecret()` reject values starting with `change-me` (case-insensitive) |

### Example `sooklabs.env.local` entries

```bash
# HQ — both required; use real values, not placeholders
HQ_ACCESS_PASSWORD=your-strong-shared-password-here
HQ_SESSION_SECRET=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456

# Generate a session secret (32+ bytes hex):
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Never commit `sooklabs.env.local`. The example file uses intentional placeholders that the app rejects at runtime.

---

## 4. Routing

### Subdomain behavior

Production HQ is intended for **`hq.sooklabs.com`**. Middleware:

1. Detects HQ host (`hq.sooklabs.com` or `hq.localhost`)
2. Rewrites bare paths into the `/hq` subtree (e.g. `/agents` → `/hq/agents`, `/` → `/hq`)
3. Applies the same auth rules as path-based `/hq/*` access

The public marketing site on other hosts is unaffected: non-`/hq` paths on non-HQ hosts pass through middleware unchanged.

### All HQ routes

| URL path | Auth | Page / handler |
|----------|------|----------------|
| `/hq` | Protected | Executive overview — live priorities, top open items, quick links |
| `/hq/briefing` | Protected | Daily briefing — editable notes + priorities |
| `/hq/sookly/action-plan` | Protected | Sookly website + app workstream tracker |
| `/hq/decision-log` | Protected | Decision log (read/write via ops data) |
| `/hq/api/ops` | Protected | `GET` / `PATCH` — session-guarded ops data |
| `/hq/api/briefing/ask` | Protected | `POST` — Claude briefing from ops context |
| `/hq/api/cron/morning` | Cron secret | `POST` / `GET` — morning briefing automation |
| `/hq/agents` | Protected | AI Agents grid (mock agent list) |
| `/hq/portfolio` | Protected | Portfolio products (mock product cards) |
| `/hq/automation` | Protected | Coming soon placeholder |
| `/hq/sookly` | Protected | Coming soon placeholder |
| `/hq/marketing` | Protected | Coming soon placeholder |
| `/hq/engineering` | Protected | Coming soon placeholder |
| `/hq/integrations` | Protected | Coming soon placeholder |
| `/hq/settings` | Protected | Coming soon placeholder |
| `/hq/login` | **Open** | Password login form |
| `/hq/api/login` | **Open** | `POST` — authenticate, set cookie |
| `/hq/api/logout` | **Open** | `POST` — clear cookie |

On the HQ subdomain, the same routes are reachable without the `/hq` prefix in the browser (middleware rewrites internally).

---

## Daily workflow (HQ Readiness v1)

1. Open **Overview** (`/hq`) — check off today's priorities and review top open P0/P1 items.
2. Open **Sookly Action Plan** — update website and app task status as you work.
3. Open **Daily Briefing** — jot priorities focus, risks, and decisions to make (auto-saved on blur).
4. **Decision Log** — append architecture and business decisions as you make them.
5. **SEOS / Sookly intel** pages are read-only mirrors; edit canonical truth in the SEOS app (`NEXT_PUBLIC_SEOS_URL`).

Ops data persists in `data/hq/ops.json` (local) or **Postgres** when `HQ_DATABASE_URL` is set.

### Automation (DigitalOcean cron)

On a DO Droplet or App Platform worker, schedule:

```bash
# 06:00 daily (UTC) — HTTP mode
0 6 * * * HQ_CRON_URL=https://hq.sooklabs.com/hq/api/cron/morning HQ_CRON_SECRET=... node /path/to/scripts/hq-morning-worker.mjs
```

Or run direct mode with `HQ_DATABASE_URL` + `ANTHROPIC_API_KEY` (no HTTP).

Verify deploy: `npm run hq:verify-deploy`

Init Postgres schema: `npm run hq:init-db`

### Protected vs open routes

**Open** (no valid session / cron secret required at middleware):

- `/hq/login`
- `/hq/api/login`
- `/hq/api/logout`
- `/hq/api/cron/morning` (authorized by `HQ_CRON_SECRET` inside the route)

**Protected** (valid `hq_session` cookie required):

- Every other `/hq/*` route

When an unauthenticated user hits a protected route, middleware **rewrites** (does not redirect) to `/hq/login` so the browser URL stays on the originally requested path. After login, the client reloads or navigates to `/hq` if the user was on the login page.

### Auth flow (Phase 1)

```
User → POST /hq/api/login { password }
  → resolveAccessPassword() + resolveSessionSecret()
  → verifyPassword() (SHA-256 compare)
  → createSessionToken() (HMAC-SHA256, 7-day expiry)
  → Set httpOnly hq_session cookie

Subsequent requests → middleware → verifySessionToken()
  → valid: serve page
  → invalid: rewrite to /hq/login
```

Sign-out: sidebar calls `POST /hq/api/logout`, then client navigates to `/hq/login`.

### SEO / indexing

`app/hq/layout.js` sets `robots: { index: false, follow: false }` for all HQ pages.

---

## 5. Known limitations (from current code)

These are factual constraints of the Phase 1 implementation:

- **Single shared password** — no user accounts, roles, OAuth, or database-backed auth (`lib/hq/auth.js` comments and implementation).
- **Placeholder env rejection** — default example values disable HQ until real secrets are configured.
- **Git-tracked / Postgres ops** — priorities, workstreams, briefing notes, decisions, and `agentJobs` via `/hq/api/ops`. Prefer `HQ_DATABASE_URL` in production. Portfolio metrics remain reference placeholders.
- **Non-functional export button** — "Export PDF" remains disabled until PDF export ships. **Ask AI** is live when `ANTHROPIC_API_KEY` is set.
- **Hardcoded user** — sidebar footer shows `currentUser` from mock data (`James Sook`, `Founder · CEO`), not the authenticated identity.
- **HQ APIs** — login/logout, `/hq/api/ops`, `/hq/api/briefing/ask`, `/hq/api/cron/morning`.
- **Search engine exclusion** — HQ layout metadata sets `noindex, nofollow`.
- **Shared deployment** — HQ ships in the same Next.js app as the public site; middleware scope is limited to `/hq` paths.

---

## 6. Next milestones (recommendations)

These are sensible follow-ups based on the current codebase state. They are **recommendations**, not commitments or a roadmap.

1. **Replace Phase 1 password auth** — Move to proper identity (e.g. SSO, magic link, or multi-user auth provider) with per-user sessions and audit logging.
2. **Wire real data sources** — Replace `lib/hq/mock-data.js` with API routes or server actions backed by databases and integrations (Stripe, GitHub, analytics, support tools).
3. **Implement coming-soon sections** — Build out Automation, department views, Integrations, Settings, and the Sookly product dashboard behind the existing nav structure.
4. **Connect action buttons** — Hook up Export, Ask AI, Configure, and similar controls to real workflows or disable them until implemented.
5. **Dynamic user context** — Derive sidebar user info from the authenticated session instead of mock `currentUser`.
6. **HQ-specific env documentation in deploy** — Ensure `HQ_ACCESS_PASSWORD` and `HQ_SESSION_SECRET` are set in all Vercel environments where `hq.sooklabs.com` is active; rotate `HQ_SESSION_SECRET` if compromised (invalidates all sessions).
7. **Integration tests for middleware** — Cover subdomain rewrites, open vs protected paths, expired tokens, and misconfigured env vars.
8. **Optional: split subdomain config** — Document or automate DNS / Vercel domain setup for `hq.sooklabs.com` (not defined in this repo’s config files).

---

## Quick reference for new developers

1. Copy `sooklabs.env.local.example` → `sooklabs.env.local` and set real `HQ_*` values.
2. Run `npm run dev` and open http://localhost:3008/hq/login (or http://hq.localhost:3008/login).
3. Add dashboard pages under `app/hq/(dash)/<name>/page.js` so they inherit `DashShell`.
4. Register nav entries in `lib/hq/mock-data.js` → `nav` array.
5. Reuse components from `components/hq/` and styles from `app/hq/hq.css` (`hq-scope` wrapper).

For auth or middleware changes, edit `lib/hq/auth.js` and `middleware.js` together and verify both path-based and subdomain access.
