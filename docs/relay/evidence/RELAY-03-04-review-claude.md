# RELAY-03 / RELAY-04 review — issue #8 (HQ timeline, PR #7)

Agent: Claude (QA evidence / gap analysis seat) · 2026-10-03 ~13:45 UTC
Subject: PR #7 `cursor/hq-tl-readonly-git-graph-df16` at `d47927a` (contains #6, #5)
Authority: read-only review. Nothing merged, nothing in CI or lint config changed.

## RELAY-03 — independent graph verification (owner: CI/verification agent)

**Verdict: FAIL on two acceptance points (needs Mark's decision on one).**

| Acceptance (issue #8) | Evidence | Result |
| --------------------- | -------- | ------ |
| Graph verifier "executes independently and reports its result" | `.github/workflows/ci.yml` at `d47927a` has one job `lint-build-verify`; `Verify repo graph` is step 5 after `Lint` and `Build`. A lint or build failure stops the job, so the verifier never reports. | **FAIL** — not independent. Fix: separate job (e.g. `repo-graph`) with no `needs:` on lint. |
| "Existing 73-error/40-warning baseline lint debt remains visible and is not suppressed" | At `c241da1`: 73 errors = **57 in `_reference/`** + 16 in shipped code (`app` 2, `components` 10, `lib` 4). `467a6c3`, `e74bfdd`, `bf1d7bd` fix the 16 shipped errors in code. `5acbfc0` adds `"_reference/**"` to ESLint ignores, removing the other 57 from the report. Result at `d47927a`: 0 errors, 10 warnings. | **Stop condition hit** ("masks … existing quality gates"). `_reference/` is 11 MB of vendored design exports with **0 imports** from `app/ components/ lib/ middleware.js next.config.mjs` — the ignore is defensible, but issue #8 makes baseline changes Mark's call. |
| CI result | PR #7 `lint-build-verify` = success (run 37109774949, 08:28Z). Verified independently in a full local clone: `verify-repo-graph` → "103 commits, mainline 51, open 6, merged 6". | PASS (as a combined job) |

**Decision for Mark:** accept ignoring `_reference/**` (unused vendored code) as a deliberate baseline change, or have it reverted and the 57 errors kept visible/quarantined.

## RELAY-04 — HQ-TL-001 Slice 1 acceptance (owner: reviewer/architecture agent)

Runtime: `next dev` on `d47927a`, full local clone with `origin/*` for all 13 branches, file-mode ops. Flows: `.claude/skills/run-sooklabs/flows.mjs --only repoTimeline`.

| Slice 1 criterion | Evidence | Result |
| ----------------- | -------- | ------ |
| First-parent mainline | API: `mainline` 51 commits, tip `b10b2ad` = `origin/master`; verifier asserts tip == `origin/master` | PASS (local adapter) |
| Branch divergence / join points | API lists 12 branches with `divergedFromSha`; merged ones carry `mergeSha` (e.g. `feat/hq-mvp1-command-centre` diverged `99873b3`, merged `5f7d690`); canvas draws separate lanes with fork/join curves (screenshot) | PASS with one defect ↓ |
| Horizontal navigation | Older / Current tip move `scrollLeft`; 103 nodes in a 4,398 px scroller | PASS (desktop + 390 px mobile) |
| Commit detail | Clicking a node opens the drawer; detail API 200; Escape closes | PASS (desktop + mobile) |
| GitHub fallback | GitHub calls get 403 in this container → "Partial data" panel lists the failures and the view falls back to local git | PASS for the fallback state |
| GitHub adapter itself | Not reachable from this container | **UNVERIFIED** |

**Defect (P2, Cursor):** `cursor/hq-mcp-gateway-v1` is shown **open** (diverged `0946398`, no merge), but its PR #4 was squash-merged into master on 2026-10-01 (`b10b2ad`). Squash merges leave no merge parent, so the local-git adapter can't see them. The GitHub adapter has PR `merged_at` data and may classify it correctly — unverified. Suggest: when PR data is available, prefer PR state; otherwise label git-only "open" as "no merge commit found".

**Minor (P3):** each commit's detail is fetched twice (two identical `/hq/api/repo-timeline/commit?sha=` calls per click).

**Stop condition check:** "evidence differs between local/GitHub adapters" — cannot be evaluated because the GitHub adapter is unreachable here. **RELAY-04 = BLOCKED** pending a run with GitHub API access (preview deploy or a session with network/GitHub credentials), then PASS/FAIL can be recorded.

## Next
- RELAY-03 → CI/verification agent (Cursor): split the graph verifier into its own job; Mark decides on `_reference/**`.
- RELAY-04 → reviewer re-run once the GitHub adapter is reachable; Cursor fixes the squash-merge classification.
- RELAY-05 → no new verified evidence yet; per its stop condition, make no change.
