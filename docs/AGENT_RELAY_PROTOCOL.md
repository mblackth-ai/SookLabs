# Agent Relay Protocol

**As of:** 2 Oct 2026 (Asia/Bangkok)  
**Purpose:** give every model one deterministic place to see who owns the task now, what was completed, what evidence proves it, and who receives the baton next.

## Relay bar

Human-readable view:

```
GROK CoS     CHATGPT        CURSOR         CODEX          QA / REVIEW     MARK
   ✓     ->     ✓      ->    ACTIVE    ->   WAITING   ->    WAITING    ->  WAITING
```

The bar is only a visualization. The machine-readable block below is authoritative.

## Machine-readable relay block

Every active swarm task document should contain one block near the top:

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
    - commit: 42355d32ce04b62cee73ad666383f276b52daeff
  input:
    - docs/HQ_LIVE_REPO_TIMELINE.md
    - docs/HQ-AGENTS.md
  output_expected:
    - truthful read-only Git graph adapter
    - one-repo horizontal timeline
    - node detail drawer
  gates:
    - no_merge
    - no_deploy
    - no_branch_delete
    - no_credentials
  updated_at: 2026-10-02T20:18:00+07:00
```

## State vocabulary

Use only:

- `waiting` — not this seat's turn
- `active` — this seat owns the baton
- `blocked` — this seat cannot finish; blocker must be recorded
- `review` — implementation finished; evidence awaits the next reviewer
- `done` — seat's bounded responsibility is complete and evidence is attached
- `cancelled` — Mark or the CoS explicitly stopped this task

Do not use vague states such as "mostly done", "working on it", or "almost there" in the authoritative field.

## Handoff rule

An agent may hand off only when all four are true:

1. its bounded acceptance rows are complete or explicitly blocked;
2. evidence is attached;
3. `current_owner`, `next_owner`, and `status` are updated atomically;
4. a short handoff note says what the next seat must do and what it must not redo.

The outgoing seat changes:

```
status: active
handoff_ready: false
```

to:

```
status: done
handoff_ready: true
```

and assigns the next stage:

```
previous_owner: <outgoing>
current_owner: <incoming>
next_owner: <following seat or mark>
status: active
handoff_ready: false
```

The repository commit containing that transition is the baton receipt.

## Reader rule

Every swarm seat does this before work:

1. read the relay block;
2. if `current_owner` is not that seat, do not begin implementation;
3. read only the referenced inputs and evidence first;
4. inspect wider context only if needed to resolve a contradiction;
5. perform the bounded output;
6. run its acceptance checks;
7. update the relay block and commit the handoff.

This is what prevents every model from rereading the entire project and independently deciding what the task is.

## Role order for HQ repo timeline

Default sequence:

```
Grok CoS
  -> Live Oversight / ChatGPT
  -> Cursor implementation
  -> Codex code/visual QA
  -> Live Oversight acceptance reconciliation
  -> Mark approval gate
```

Roles are responsibilities, not model prestige:

- **Grok CoS:** chooses the next bounded task, checks dependencies, prevents parallel thrash.
- **Live Oversight / ChatGPT:** turns intent into architecture/acceptance, detects contradictions, validates repo truth.
- **Cursor:** owns implementation integration and repo-context correctness.
- **Codex:** reviews code paths, fixes bounded defects when delegated, verifies visual/interaction quality and tests.
- **Live Oversight acceptance:** compares delivered evidence with the acceptance contract and flags gaps.
- **Mark:** owns protected merge/deploy/migrate/credential/spend/publish gates.

If Mark changes the seat order for a task, the relay block is updated rather than creating a competing hidden process.

## Failure recovery

If an incoming agent finds the previous handoff false or incomplete:

- do not silently repair the history;
- set `status: blocked`;
- record `blocker_reason`;
- attach contradicting evidence;
- return the baton to the CoS or named previous owner.

Example:

```yaml
status: blocked
blocker_reason: "claimed graph adapter exists, but no implementation path or test receipt is present"
return_to: grok-cos
```

## Why the repo is the relay

This protocol intentionally does not require one model to call another model's API.

The communication primitive is:

```
agent work
  -> repo commit
  -> relay state changes
  -> next agent reads
```

Webhooks, MCP, ACP, or Cursor Automations may accelerate notification/execution later, but the repo remains the durable handoff record.

## Acceptance

The relay protocol is working when:

- only one seat is ACTIVE for a bounded coding task unless Mark explicitly permits parallel work;
- the next seat can identify its job without reconstructing the entire conversation;
- every DONE state points to evidence;
- stale or contradictory handoffs become BLOCKED, not silently accepted;
- HQ can render the relay bar directly from the same machine-readable state;
- agent status and repo/action receipts remain auditable after the chat that created them is gone.
