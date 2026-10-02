---
name: run-sooklabs
description: Run, start, build, lint, screenshot, and drive SookLabs HQ (hq.sooklabs.com, Next.js on :3008) locally — log in, call HQ API routes like /hq/api/control-plane, screenshot /hq or /hq/retainers, and smoke-test secret-authenticated inbound routes (agents/callback, and later the Quo webhook and MCP endpoint). Use when asked to run HQ, check a change in the real app, or verify a route.
---

# Run SookLabs HQ

HQ is the private control plane inside this Next.js app (`/hq/**`, password
session). Agents drive it with **`driver.mjs`**: it starts `next dev`, logs in,
calls routes with the session cookie, takes Playwright screenshots, and cleans
up after itself. All paths below are relative to the SookLabs repo root.

## Prerequisites

Node 22 (Next 16 needs ≥ 20.9). Chromium for screenshots: in Claude cloud
containers it's already at `/opt/pw-browsers`; elsewhere the driver installs
`playwright-core` into `~/.cache/run-sooklabs` on first `ss` and uses
Playwright's own browser (set `CHROMIUM_PATH` to override).

```bash
npm ci
```

## Run (agent path)

```bash
D=.claude/skills/run-sooklabs/driver.mjs
node $D start                              # throwaway sooklabs.env.local if none, next dev on :3008 (~8s)
node $D login                              # saves hq_session cookie
node $D api GET /hq/api/control-plane      # status + JSON; exit 1 on >=400
node $D ss /hq                             # → /tmp/run-sooklabs/ss-hq.png
node $D ss /hq/retainers                   # → /tmp/run-sooklabs/ss-hq_retainers.png
node $D callback                           # signed POST to /hq/api/agents/callback: 200, then wrong secret → 401
node $D stop                               # kill server, delete throwaway env, restore data/hq/ops.json
```

Look at the PNGs (Read tool). A good `/hq` shot shows "Good morning.", the
Four Fronts cards, Client retainers, and an **Ops: File** badge.

State (pid, cookie, `dev.log`, screenshots) is in `/tmp/run-sooklabs`
(`RUN_SOOKLABS_STATE` overrides). Server log: `/tmp/run-sooklabs/dev.log`.

### Testing a new inbound route (Quo webhook, MCP endpoint)

Follow `callback`'s pattern in `driver.mjs`: read the secret from
`sooklabs.env.local`, POST with it, then POST with a wrong one and expect
`401`. New open routes must also be added to `isOpenPath` in `middleware.js`,
or the request is redirected to `/hq/login` before your route runs.

### HQ MCP (not built yet)

Design and M0 acceptance are in `docs/adr/2026-10-hq-mcp-server.md`. When M0
lands, add its verified commands here (MCP Inspector CLI against
`http://localhost:3008/hq/api/mcp`).

### Visual inspection sweep and interaction flows

```bash
node $D start && node $D login
node .claude/skills/run-sooklabs/inspect.mjs    # every /hq route × desktop/tablet/mobile (~4 min)
node .claude/skills/run-sooklabs/flows.mjs      # login, nav, mobile drawer, keyboard, banner, sign-out (+ timeline on branches)
node $D stop
```

`inspect.mjs` screenshots each route (viewport + scrolled main panel) to
`/tmp/run-sooklabs/inspect/` and flags page overflow, elements past the right
edge, badge text spilling out of fixed-height pills, default-blue links,
console/page errors and failed requests; details in `report.json`. It never
clicks. Narrow it with `--routes /hq,/hq/retainers --viewports mobile`.
`flows.mjs` drives real controls and prints PASS/FAIL per flow with what it
saw; `--only mobileNav,signOut` to pick. Look at the PNGs — the flags find
candidates, the screenshot decides. Last full report:
`docs/relay/visual-inspection-2026-10-02.md`.

**Another branch side by side:** use a worktree, a real `npm ci` in it, and a
separate port + state dir:

```bash
git worktree add /home/user/hq-wt-x <branch> && (cd /home/user/hq-wt-x && npm ci)
cd /home/user/hq-wt-x && export PORT=3009 RUN_SOOKLABS_STATE=/tmp/run-sooklabs-x
node /path/to/sooklabs/.claude/skills/run-sooklabs/driver.mjs start   # likewise login / inspect / flows / stop
```

## Build, lint

```bash
npx next build --webpack     # ~35s, passes
npm run lint                 # exits 1: 72 pre-existing errors (see Gotchas)
```

## Run (human path)

`npm run dev`, open http://localhost:3008/hq/login, enter
`HQ_ACCESS_PASSWORD` from `sooklabs.env.local`. Ctrl-C to stop.

## Gotchas

- **Env file is `sooklabs.env.local`, not `.env.local`.** `next.config.mjs`
  loads it into `process.env`. Values starting with `change-me` (the example
  file's defaults) **disable login** (`lib/hq/auth.js`), and the session secret
  must be ≥ 32 chars — so copying the example file gives a 503 on login.
- **No Postgres needed locally.** Without `HQ_DATABASE_URL`, ops data is read
  and written to the tracked `data/hq/ops.json`. Any write (e.g. `callback`)
  dirties git. The driver backs it up on `start` and restores on `stop`; if
  you skip `stop`, run `git checkout -- data/hq/ops.json`.
- **`npm run build` (Turbopack) fails here** with
  `next/font/google queries have exactly one entry` on the DM Sans font,
  even though fonts.googleapis.com is reachable. `next build --webpack`
  succeeds. Treat a Turbopack-only font failure as environmental unless it
  also fails with `--webpack`.
- **`npm run lint` already fails on master+#5** (72 errors, 40 warnings —
  e.g. `react-hooks/rules-of-hooks` flags `usePostgres()` in
  `lib/hq/ops.js`). Compare counts before/after your change instead of
  expecting exit 0.
- **Screenshots are viewport-height.** The dashboard scrolls inside its own
  panel, so `fullPage` only captures 1440×900. Screenshot the sub-page you
  need (e.g. `/hq/retainers`) rather than expecting one long image.
- **Unauthenticated requests are rewritten, not redirected.** `/hq` without a
  session serves the login form at the same URL with status 200 — and API
  routes return that HTML too, not 401. Assert on the password field, not
  the URL. New inbound routes must be in `isOpenPath`.
- **Sidebar links are client-side navigation.** After clicking, wait for the
  URL (`page.waitForURL`), not `networkidle`, or you'll read the old page.
- **Don't symlink `node_modules` into a worktree.** Turbopack fails with
  `Symlink [project]/node_modules is invalid, it points out of the filesystem
  root` and the server never becomes ready; run `npm ci` in the worktree.
- **Repo timeline shows "Partial data" in Claude cloud containers.** The
  container sets a placeholder `GITHUB_TOKEN` (GitHub 401), and without it
  Node's fetch isn't proxied (403), so the timeline falls back to the
  shallow local clone (master only). Real branch/PR geometry needs a real
  token or a normal network.
- **Sign-out doesn't revoke the token** (stateless HMAC, 7 days), so the
  driver's saved cookie keeps working after a `signOut` flow.
- **`stop` kills the process group.** `next dev` runs as npx → next →
  workers; killing only the npx pid leaves :3008 bound.

## Troubleshooting

| Symptom | Fix |
| ------- | --- |
| `login failed: 503 … HQ access is not configured` | `sooklabs.env.local` has a `change-me…` value or a short `HQ_SESSION_SECRET`. Delete the file and `start` again (driver writes a valid one). |
| `ss` prints `landed on the login page` | Cookie missing/expired: `node $D login`. |
| `server not ready after 180s` | Read `/tmp/run-sooklabs/dev.log`; usually port 3008 busy — `node $D stop`, then `start`. |
| `server not ready` in a worktree, log says `Symlink … node_modules is invalid` | `rm node_modules && npm ci` in the worktree. |
| A flow reports the old URL after clicking a nav link | Wait with `page.waitForURL(...)`; navigation is client-side. |
| `git status` shows `M data/hq/ops.json` | You wrote ops data without `stop`; `git checkout -- data/hq/ops.json`. |
