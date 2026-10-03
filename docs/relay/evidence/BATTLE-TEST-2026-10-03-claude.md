# Battle test — full SookLabs draft stack, merged locally (2026-10-03)

Agent: Claude · run 2026-10-03 ~12:15–12:40 UTC · local container, **not production, not a deploy**.

## What was tested

One integration tree, merged in the order the PRs stack:

| Layer | Ref | Commit |
| ----- | --- | ------ |
| PR #7 (contains #6, #5, master) | `cursor/hq-tl-readonly-git-graph-df16` | `d47927a` |
| + PR #9 | `docs/master-operating-model-2026-10-03` | `af1ca4a` |
| + Claude B | `claude/hq-timeline-fixes` | `a14e4e3` |
| + Claude C | `claude/sl-content-001` | `910d6b2` |
| + Claude A | `claude/hq-visual-pass` | `f9f229c` |

All four merges were **clean** (no conflicts). Shared fixes in A and B landed once (link rule ×1, badge nowrap ×1).

## CI steps (same as `.github/workflows/ci.yml`)

| Step | Result |
| ---- | ------ |
| `npm ci` | PASS |
| `npm run lint` | PASS — 0 errors, 10 warnings (same as #7 base) |
| `npm run build` (Turbopack) | PASS — 1 warning, also on #7 base (see findings) |
| `node scripts/verify-repo-graph.mjs` | PASS — "103 commits, mainline 51, open 6, merged 6" (needs a full clone with `origin/*` refs for every branch, as CI's `fetch-depth: 0` gives) |

## Runtime (production build: `next start`, file-mode ops)

| Check | Result |
| ----- | ------ |
| 9 interaction flows (login states, nav/back/forward, mobile drawer, keyboard focus, banner, repo timeline desktop + mobile, branch cards, sign-out) | 9/9 PASS |
| Secret-auth inbound route (`/hq/api/agents/callback`) | 200 with secret, 401 with wrong secret |
| 39 routes × 3 viewports (117 loads) | all 200; overflow/clipped-badge/default-link flags 0 |
| Console / failed requests | 234 = 117 × 2, all `/_vercel/insights/script.js` 404 — Vercel Analytics only exists on Vercel. 0 app errors. |
| Slowest page (prod build, local) | 1.9 s (`/hq/sookly/action-plan`, mobile) |

## Findings

1. **Deploy bundle warning (pre-existing, P2, Cursor):** Turbopack: "Encountered unexpected file in NFT list … the whole project was traced unintentionally" from `next.config.mjs`. Its `loadSooklabsEnv()` reads `sooklabs.env.local` with `fs` at config time, so Vercel functions may bundle the whole repo. Suggest: load that file only when `process.env.VERCEL` is unset, or move local env to `.env.local`. Same warning on `d47927a` without Claude's commits.
2. Earlier "Turbopack build fails on next/font" in this container no longer reproduces; CI and local Turbopack builds pass.

## Not verified (BLOCKED / UNVERIFIED)

- **Deploy:** Vercel preview URLs and `hq.sooklabs.com` are blocked from this container. A passing local prod build does not prove the Vercel deploy works.
- **Postgres mode:** all runs used file-mode ops; `HQ_DATABASE_URL` path untested.
- **Real GitHub data in the timeline:** container gets GitHub 401/403 server-side; timeline exercised in its local-git fallback.
- **SEOS, sookly-omnichat:** no repo access.
