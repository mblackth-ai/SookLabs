# SookLabs Swarm Runtime

**As of:** 2 Oct 2026  
**Status:** architecture / execution acceptance. No production automation is authorized by this document.

## Thesis

SookLabs agents do not need to talk to one another conversationally.

They coordinate through a durable repo ledger:

```
intent
 -> bounded work item
 -> owner queue
 -> agent execution
 -> evidence commit
 -> baton transition
 -> next queue
 -> approval or next agent
```

The repository records truth. A small orchestrator observes state changes and wakes the next seat.

## Components

### 1. Repo ledger

Canonical files contain:

- relay id
- work item coordinates
- owner
- status
- dependencies
- evidence
- next owner
- gates
- timestamps

### 2. Queue processor

Responsibilities:

- watch relay changes;
- reject malformed or contradictory handoffs;
- verify dependencies are DONE;
- enqueue the next owner;
- avoid duplicate dispatch;
- respect one-coding-seat rules;
- stop at Mark-only gates;
- emit HQ attention events.

### 3. Agent adapters

Adapters translate one queue item into the invocation method for that seat.

Examples:

- Grok CoS: orchestration seat / manual or supported runner
- ChatGPT Live Oversight: invoked review/acceptance seat
- Cursor: ACP, Automation, Cloud Agent, or local runner
- Codex: bounded code/QA invocation
- Claude: critique/copy review lane

The adapter is not the source of truth. The ledger is.

### 4. HQ visual control plane

HQ renders:

- current baton;
- queues by seat;
- blocked / approval-required items;
- repo graph and branch state;
- evidence receipts;
- front acceptance progress;
- waiting time;
- next safe action.

When Mark is the next owner, HQ makes that explicit instead of allowing the swarm to appear mysteriously stalled.

## Event model

Minimal relay events:

```text
WORK_CREATED
WORK_STARTED
WORK_BLOCKED
WORK_COMPLETED
HANDOFF_READY
HANDOFF_DISPATCHED
APPROVAL_REQUIRED
APPROVED
CHANGES_REQUESTED
HELD
CANCELLED
```

Every event includes:

```yaml
event_id: ...
relay_id: ...
work_item: 2A
from: chatgpt
to: cursor
repo: mblackth-ai/SookLabs
branch: ...
evidence: [...]
created_at: ...
```

## Dispatch policy

A seat may be invoked only when:

1. it owns the next work item;
2. all dependencies are DONE;
3. no Mark-only gate blocks it;
4. there is no duplicate active execution for the same work item;
5. its invocation adapter is available.

If the adapter is unavailable, the task stays queued and HQ shows the missing connection.

## Approval policy

The orchestrator must stop before:

- protected merge;
- production deploy;
- production migration;
- secret / credential change;
- paid spend;
- destructive branch deletion;
- external publish;
- customer-visible send where policy requires approval.

The queue processor emits an HQ attention item and waits.

## Success condition

The swarm runtime is successful when a work item can travel from CoS scope to implementation, QA, acceptance and Mark gate without any model needing to reconstruct the entire project history or ask another model whether it has finished.
