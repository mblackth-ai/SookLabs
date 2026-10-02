# HQ Live Repo Timeline — Execution Acceptance Task

**Task id:** HQ-TL-001  
**As of:** 2 Oct 2026 (Asia/Bangkok)  
**Parent architecture:** `docs/HQ_LIVE_REPO_TIMELINE.md`  
**Relay protocol:** `docs/AGENT_RELAY_PROTOCOL.md`

```yaml
relay:
  relay_id: hq.repo.timeline.v1
  task_id: HQ-TL-001
  current_stage: 3
  current_owner: cursor
  status: review
  previous_owner: chatgpt
  next_owner: codex
  handoff_ready: false
  evidence:
    - pr: 7
    - branch: cursor/hq-tl-readonly-git-graph-df16
    - commit: 1fa671693d56d7d78cb06eac0de38249ae00197e
  gates:
    - no_merge
    - no_deploy
    - no_branch_delete
    - no_credentials
    - no_write_git_actions_in_ui
  updated_at: 2026-10-02T21:37:00+07:00

work_items:
  - id: 2A
    title: Truthful read-only Git graph adapter (one repo)
    owner: cursor
    status: done
    depends_on: [1B]
    next: 2B
    evidence:
      - pr: 7
      - branch: cursor/hq-tl-readonly-git-graph-df16
      - commit: 1fa671693d56d7d78cb06eac0de38249ae00197e
  - id: 2B
    title: code and visual QA
    owner: codex
    status: waiting
    depends_on: [2A]
    next: 3A
    evidence: []
```

## Finish line

Mark can open one HQ front, expand its repo timeline, move horizontally through real Git history, inspect branch/merge/checkpoint nodes, understand orphaned work, and prepare a bounded Cursor action from the selected repo context without HQ silently mutating the repository.

## Stage 1 — CoS scope lock

**Owner:** Grok CoS  
**Status:** DONE when the bounded task, dependencies, and forbidden actions are fixed.

Acceptance:
- one initial repo only;
- no production or external side effects;
- finish-line IDs linked;
- no parallel second coding job unless Mark explicitly unlocks it.

## Stage 2 — Architecture and acceptance

**Owner:** Live Oversight / ChatGPT  
**Status:** DONE

Acceptance:
- Git graph and timeline model specified;
- MCP vs ACP/Automation direction specified;
- approval receipts specified;
- visual animation separated from truth state;
- destructive actions explicitly gated;
- relay protocol defined.

Evidence:
- `docs/HQ_LIVE_REPO_TIMELINE.md`
- `docs/HQ-AGENTS.md`
- `docs/HQ-MCP-CONTROL-PLANE.md`
- `docs/AGENT_RELAY_PROTOCOL.md`

## Stage 3 — Truthful implementation

**Owner:** Cursor  
**Status:** REVIEW — implementation committed. Codex QA has not started.

Required output:
- real repository graph adapter for one repo;
- chronological mainline;
- branch divergence and merge points;
- PR/commit/check state where available;
- horizontal pan/scroll;
- clickable node drawer;
- explicit loading/error/partial-data states;
- no write action yet.

Acceptance:
- graph is derived from repository evidence, not hard-coded demo nodes;
- merged and unmerged branches are distinguishable;
- current tip is visible;
- node timestamps and SHAs are inspectable;
- no branch geometry is interpreted as completion percentage;
- existing HQ progress/acceptance surfaces remain intact.

Evidence for 2A (checkable, not a Live Oversight PASS):

| Row | Where to look |
| --- | --- |
| Graph comes from repository evidence | `node scripts/verify-repo-graph.mjs`. Mainline matches `git log --first-parent origin/master`. |
| Divergence and merge points | Same script. Open branches use `git merge-base`. `feat/hq-mvp1-command-centre` joins at `5f7d690`. |
| Merged and unmerged are distinguishable | Timeline branch list states `open` and `merged`. A squash-merged PR whose tip is not an ancestor of master is labeled as such. |
| Current tip is visible | Current tip control. Master tip at this receipt is `b10b2ad`. |
| SHA and timestamps are inspectable | Commit drawer. Times render in Asia/Bangkok. |
| Horizontal navigation | Older, Newer, Current tip, and horizontal scroll. |
| Loading, error, and partial states | Expand shows a reading state, Retry on failure, and a partial banner when `partialReasons` is non-empty. |
| Branch geometry is not a percentage | The card says so. The 0–100 percentage timeline above it is unchanged. |
| Existing HQ surfaces remain | Must rows, percentage timeline, and repo branch cards stay on `/hq/fronts/hq`. Other fronts, including `/hq/fronts/seos`, do not render this graph. |
| No write Git actions | The timeline has no merge, rebase, or delete control. `GET` only on `/hq/api/repo-timeline`. |

Receipt: draft PR #7, branch `cursor/hq-tl-readonly-git-graph-df16`, implementation commit `1fa671693d56d7d78cb06eac0de38249ae00197e`. Codex work-item 2B remains waiting.

## Stage 4 — Visual and code QA

**Owner:** Codex  
**Status:** WAITING

Required review:
- interaction bugs;
- graph edge cases;
- layout on narrow/wide screens;
- Motion for React usage where animation improves comprehension;
- reduced-motion support;
- no animation that falsely signals successful writes;
- tests/build/type checks appropriate to the repo;
- code duplication / brittle data mapping.

Codex may make bounded fixes only if the relay explicitly hands it implementation authority. Otherwise it returns findings to Cursor.

## Stage 5 — Acceptance reconciliation

**Owner:** Live Oversight / ChatGPT  
**Status:** WAITING

Acceptance:
- implementation checked against this file and the architecture contract;
- repo truth compared with HQ labels;
- stale percentages/branch states called out;
- no unsupported PASS;
- unresolved gaps returned to the owning seat.

## Stage 6 — Mark gate

**Owner:** Mark  
**Status:** WAITING

Mark chooses whether to:
- merge;
- request changes;
- hold;
- authorize the next slice.

No deploy is implied by merge approval.

## Later slices, not part of Stage 3

1. acceptance/evidence overlay;
2. Cursor deeplink handoff;
3. action receipts;
4. local ACP companion;
5. controlled merge/rebase/archive/recovery/revert proposals;
6. multi-repo / all-front graph aggregation.

These remain NOT STARTED until the truthful one-repo graph is evidenced.
