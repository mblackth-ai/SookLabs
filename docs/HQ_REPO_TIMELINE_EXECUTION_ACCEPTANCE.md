# HQ Live Repo Timeline — Execution Acceptance Task

**Task id:** HQ-TL-001  
**As of:** 2 Oct 2026 (Asia/Bangkok)  
**Parent architecture:** `docs/HQ_LIVE_REPO_TIMELINE.md`  
**Relay protocol:** `docs/AGENT_RELAY_PROTOCOL.md`

```yaml
relay:
  relay_id: hq.repo.timeline.v1
  task_id: HQ-TL-001
  current_stage: 2
  current_owner: chatgpt
  status: done
  previous_owner: grok-cos
  next_owner: cursor
  handoff_ready: true
  evidence:
    - pr: 6
    - branch: chatgpt/hq-live-oversight-repo-timeline
  gates:
    - no_merge
    - no_deploy
    - no_branch_delete
    - no_credentials
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
**Status:** WAITING FOR HANDOFF / EXECUTION

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
