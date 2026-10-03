# Visual inspection — SookLabs HQ (and SEOS: blocked)

Date: 2026-10-02/03 (UTC / Asia/Bangkok). Agent: Claude. **Inspection only — no application code changed.**
Harness: `.claude/skills/run-sooklabs/` (`driver.mjs`, `inspect.mjs`, `flows.mjs`), Playwright + Chromium, local `next dev`, file-mode ops (no production data).

## Coverage

| Build | Commit | Routes | Viewports | Page loads | Console / page errors | Failed requests |
| ----- | ------ | ------ | --------- | ---------- | --------------------- | --------------- |
| master + #5 + spec commits | `5fd4cb8` | 29 | 1440×900, 834×1112, 390×844 | 87 | 0 / 0 | 0 (Vercel Analytics blocked by container proxy — environmental) |
| `chatgpt/hq-live-oversight-repo-timeline` | `e7af98e` | 39 (+ `/hq/fronts`, 8 × `/hq/fronts/[id]`, `/hq/sooklabs`) | same | 117 | 0 / 0 | 0 |
| `cursor/hq-tl-readonly-git-graph-df16` | `c241da1` | 39 + repo timeline | same | 117 | 0 / 0 | 0 |

`cursor/…` = `chatgpt/…` + 3 commits (git timeline, its API, CI). The two branches render identically on every route except `/hq/fronts/hq`, where the cursor branch adds the Repo timeline.

**SEOS: BLOCKED.** Not inspected. Missing: (1) `mblackth-ai/SEOS` is not readable by this session's GitHub credential, so it can't be run locally; (2) `seos.sooklabs.com` and `hq.sooklabs.com` are refused by the environment's network policy (proxy 403). Nothing about SEOS UI below is claimed as seen.

## Flows exercised (all PASS)

| Flow | Result |
| ---- | ------ |
| Login: unauthenticated `/hq`, empty submit, wrong password, correct password | Login form served at the requested URL (middleware rewrite); "Incorrect password." alert; lands on `/hq` |
| Desktop nav, active state, back/forward, hover | Retainers → Portfolio → SEOS → Settings; active item follows; Back/Forward correct; hover background appears |
| Mobile nav drawer (390px) | Opens with `aria-expanded=true`, closes on navigation and on Escape |
| Keyboard | Skip link first, then nav; 2px cyan focus ring on every stop |
| Ops file-store banner | Dismiss hides it for the session, survives reload |
| Sign out + Back | Back shows login form, no dashboard data |
| SEOS Authority panel, unconfigured | Clear "requires configuration" state with Settings / Open SEOS actions |
| Repo timeline (cursor branch), desktop + mobile | Skeleton → 30 commits in ~1s; commit drawer opens, Escape closes; Older / Current tip scroll; GitHub failure renders a clear "Partial data" panel and falls back to the local clone |
| Branch card Merge / Remove / Delete remote (cursor + chatgpt) | Zero outbound requests; confirm copy says GitHub is not called |

## Findings

Severity: P0 broken/dangerous · P1 major obstruction · P2 meaningful usability/clarity · P3 polish.

### P1-1 Same product, three different progress numbers
- **Surface:** Overview Four Fronts, Eight fronts board, Portfolio "Build boards"
- **Route/URL:** `/hq` (all builds), `/hq/fronts` (branches), `/hq/portfolio`
- **Viewport:** all
- **Observed:** Sookly is 85% on `/hq`, 76% ("Sookly app") on `/hq/fronts`, 0% on `/hq/portfolio`. SEOS is 80% on `/hq` and `/hq/fronts`, 31% on `/hq/portfolio`. Overall is 61% on `/hq` and 33% on `/hq/fronts`. Each caption is accurate in isolation.
- **Expected:** a viewer can tell at a glance which number is the truth for a product, or the screens name the measure in the number itself (e.g. "build board 0/10 tasks" vs "pilot criteria 13/17").
- **Evidence:** `01-overview__desktop.png`, `05-eight-fronts__desktop__33pct.png`, `06-portfolio__desktop__0pct-stale-p0.png`
- **Source:** `lib/hq/four-fronts.js`, `lib/hq/hq-fronts.js` (branches), portfolio summary from ops store (`getPortfolioSummary` in `lib/hq/ops-shared.js`)
- **Human approval:** YES — which measure is canonical is Mark's call.

### P1-2 Branch card buttons named like git actions but only write to this browser (branches only)
- **Surface:** Repo branches card on `/hq/fronts/hq`
- **Viewport:** desktop (also tablet/mobile)
- **Observed:** Buttons read **Merge**, **Remove**, and then **Delete remote branch**. They only write to `localStorage`; "Record merge request" is visible to nobody else and never reaches GitHub, Mark's queue, or the relay. Confirm copy is honest, but the primary labels sit next to "Merging it is a separate Mark gate".
- **Expected:** labels that describe the effect ("Note: want merged (this browser)", "Hide card"), or a request that actually lands somewhere Mark sees (e.g. HQ approvals).
- **Evidence:** `07-branch-card__merge-confirm.png`, `08-branch-card__delete-remote.png`
- **Source:** `components/hq/RepoBranchLayer.jsx:108-150`
- **Human approval:** YES — product decision on whether a merge request should exist.

### P2-1 Sign out doesn't revoke the session token
- **Surface:** auth
- **Observed:** after `POST /hq/api/logout`, a token copied before logout still returns full `/hq/api/control-plane` data (verified with curl). Logout only clears the cookie; tokens are stateless HMAC with 7-day expiry.
- **Expected:** signing out ends the session server-side, or the 7-day window is shortened.
- **Source:** `app/hq/api/logout/route.js`, `lib/hq/auth.js` (`createSessionToken`, `SESSION_MAX_AGE_SEC`)
- **Human approval:** YES — security design change.

### P2-2 Badges spill or get pushed off-screen at narrow widths
- **Surface:** status badges across HQ
- **Route/URL:** `/hq` ("61% overall"), `/hq/engineering/four-fronts` ("Not pilot ready" pushed to x=412 on a 390px screen and cut; "3 ready · 4 blocked · 2 queued"), `/hq/retainers` ("Not retainer healthy", "NOT STARTED" ×5), `/hq/roastmyopsec`, `/hq/sookly/receptionist-readiness`, `/hq/fronts`
- **Viewport:** mobile (also tablet on four-fronts and fronts)
- **Observed:** text wraps inside a fixed 16–20px-high pill and overflows its border; on four-fronts the badge is clipped by the screen edge.
- **Expected:** badge keeps one line (or grows), and the header row wraps the badge below the title.
- **Evidence:** `02-overview__mobile__pill-spill-blue-link-frame.png`, `03-four-fronts__mobile__badge-clipped.png`
- **Source:** `components/hq/Badge.jsx:23-24` (fixed `height`, no `white-space: nowrap`) — one fix covers all six routes.

### P2-3 Unstyled default-blue links fail contrast
- **Surface:** inline links
- **Route/URL:** `/hq` ("RDUSA pilot contract"), `/hq/retainers` ("Open the contract" ×2), `/hq/engineering/four-fronts` (contract links, PR #60/#2/#3/#5 links), `/hq/fronts` (branches)
- **Viewport:** all
- **Observed:** browser default `#0000EE` on the `#111` card — measured **2.0:1**, below WCAG AA (4.5:1). Hard to read on the dark theme.
- **Expected:** themed link colour like the "Open retainers" / "Settings →" links elsewhere.
- **Evidence:** `02-overview__mobile__pill-spill-blue-link-frame.png`, `03-four-fronts__mobile__badge-clipped.png`
- **Source:** `components/hq/FourFrontsSummary.jsx:26`, `app/hq/(dash)/engineering/four-fronts/page.js`, `components/hq/RetainerDeliveryBoard.jsx`

### P2-4 Commit drawer content cut off (cursor branch)
- **Surface:** Repo timeline commit drawer, `/hq/fronts/hq`
- **Viewport:** desktop and mobile
- **Observed:** long commit title, full SHA and changed paths run past the drawer's right edge and are clipped (mobile: title, SHA and paths all cut).
- **Expected:** wrap or ellipsis with the full value available.
- **Evidence:** `09-timeline__desktop__drawer-clipped.png`, `10-timeline__mobile__drawer-clipped.png`
- **Source:** `components/hq/RepoTimeline.jsx` (`CommitDrawer`), `app/hq/hq.css` `.hq-repo-drawer*` (no `overflow-wrap` / `min-width: 0`)

### P2-5 Knowledge Usage table runs off-screen on mobile (master + #5 only)
- **Route/URL:** `/hq/sookly/knowledge-usage`, 390px
- **Observed:** table is 408px wide in a 390px screen; "Sync (honest status)" column cut ("MANUA…"), not horizontally scrollable.
- **Evidence:** `04-knowledge-usage__mobile__table-overflow.png` vs `04b-…fixed-on-branch.png`
- **Note:** both git-UI branches already fix this. No separate fix needed if they merge.

### P2-6 Stale P0 items shown as current
- **Route/URL:** `/hq/portfolio` "Top open P0–P2"
- **Observed:** P0 items due 2026-07-14 … 2026-08-05 (≈2–3 months past) with no overdue marking, while Overview shows Blockers 0 in green.
- **Caveat:** seen on the file-mode seed data (`lib/hq/ops-default.js`); production Postgres may hold different items. Verify on prod before acting.
- **Evidence:** `06-portfolio__desktop__0pct-stale-p0.png`

### P3 (polish — not to be worked while P1/P2 open)
- **P3-1** 8px white frame around every HQ page (body default margin, no html/body background). All routes, all viewports. Likely cause: `app/globals.css` uses Tailwind v3 `@tailwind base` while the project is on Tailwind v4 — to confirm in fix phase. Evidence: any screenshot's top/left edge.
- **P3-2** "Overview" appears twice in the sidebar (Today and Command) and both highlight on `/hq`. `components/hq/DashShell.jsx`.
- **P3-3** Percentage timeline end labels clipped ("Start" → "art", "Finish / No ship" → "Fin No shi") on `/hq/fronts/hq`, all viewports (branches). Evidence `11-…`.
- **P3-4** "Good morning." is hard-coded (`app/hq/(dash)/page.js:49`); shown at 22:31 UTC. The date line correctly follows the viewer's timezone (`15-overview__bangkok-0531.png`).
- **P3-5** Empty password submit round-trips and says "Incorrect password." (input has no `required`). `app/hq/login/page.js:72`.
- **P3-6** Unauthenticated API calls get the login page as HTML with 200, not 401 JSON (`middleware.js:60-65` rewrite). Matters for the Quo webhook and MCP routes: they must be in `isOpenPath`.
- **P3-7** Timeline requests each commit's detail twice (identical `/hq/api/repo-timeline/commit?sha=` calls).
- **Unconfirmed:** one React hydration-mismatch warning on the first `/hq` load after a cold compile; not reproduced in 6 later loads (UTC and Asia/Bangkok).

## After — fixes applied 2026-10-03 (Mark's go-ahead)

| Finding | Status | Change | Verified |
| ------- | ------ | ------ | -------- |
| P2-2 badges spill/clip | **PASS** | `components/hq/Badge.jsx`: `minHeight`, `nowrap`, `flexShrink: 0`; four-fronts title column may wrap the long contract path | wrappedBadges 0, pastRight 0 on all routes × 3 viewports (A: 87 loads, B: 117) |
| P2-3 default-blue links | **PASS** | `app/hq/hq.css`: `.hq-dash-main a:not([class])` uses `--text-accent` | defaultBlueLinks 0 everywhere; measured 2.0:1 → **10.25:1** |
| P2-4 commit drawer clipping (branch) | **PASS** | `app/hq/hq.css` (cursor branch): drawer grid `minmax(0, 1fr)`, `overflow-wrap: anywhere` on title, values, paths | timeline flow PASS desktop + mobile; full title, SHA and paths visible |
| P1-1 conflicting progress numbers | **PASS (labelled)** | Text only: "four-front estimate" (Overview, Four Fronts), "build-board tasks done" (Portfolio), "eight-front mean" (Eight fronts, branch). No numbers or calculations changed | screenshots after |

Builds: A = `claude/hq-visual-pass` (on #5), B = `claude/hq-timeline-fixes` (on `cursor/hq-tl-readonly-git-graph-df16`, with A's commit cherry-picked). Both `next build --webpack` pass; lint unchanged (A 72 errors, B 73 — same as each base). All 9 flows PASS on B; 7 PASS + 2 SKIP (branch-only) on A.

Still open, deliberately not changed: P1-2 (branch-card Merge labels — Mark's call), P2-1 (logout revocation — security decision), P2-5 (Knowledge Usage table on master — already fixed on the branches), P2-6 (stale P0s — check prod), all P3, SEOS (blocked).

## Not verifiable here (environment)
- Branch visualisation with real PRs/branches: the server's GitHub calls get 401/403 in this container (placeholder `GITHUB_TOKEN`; unauthenticated Node fetch isn't proxied), so the timeline shows its local-clone fallback (master only). The fallback state itself is verified.
- Production data on `hq.sooklabs.com` (blocked host).

## Operating model (SEOS → Sookly → HQ)

- **Supported:** SEOS sub-pages say "operated in SEOS, no parallel scores in HQ" and link out — HQ as oversight, not a second SEOS. Authority panel reads from SEOS. Knowledge Usage states "edit truth in SEOS KB; Sookly consumes exports" — the one screen that shows SEOS feeding Sookly. Retainers are explicitly separate from engineering fronts.
- **Invisible:** no screen shows the flow outbound (SEOS) → inbound (Sookly) → oversight (HQ). Sidebar lists Sookly and SEOS as peer "Projects" in reverse order. RDUSA retainer criteria that are SEOS work (e.g. Instagram publishing) don't link to SEOS; nothing links Sookly conversations back to the SEOS activity that caused them.
- **Misleading:** Portfolio calls Sookly 0% while fronts say 76–85% (P1-1) — a reader could conclude Sookly hasn't started. Eight fronts mixes products (SEOS, Sookly app) with infrastructure (Swarm, MCP, Revenue), which blurs which system owns which outcome.

## Reproduce

```bash
D=.claude/skills/run-sooklabs
node $D/driver.mjs start && node $D/driver.mjs login
node $D/inspect.mjs                 # every route × 3 viewports → /tmp/run-sooklabs/inspect/
node $D/flows.mjs                   # interaction flows → /tmp/run-sooklabs/flows/
node $D/driver.mjs stop
```
