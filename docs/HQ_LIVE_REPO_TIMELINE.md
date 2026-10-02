# HQ Live Repo Timeline + Cursor execution bridge

**As of:** 2 Oct 2026 (Asia/Bangkok)  
**Status:** architecture contract on a draft branch. No merge, deploy, branch delete, production migration, credential change, or external publish is authorized by this document.

## Purpose

Give Mark a visual, chronological view of each repository under the HQ fronts so Git history becomes understandable without living inside GitHub or a chat window.

The interface should answer:

1. What was the mainline at any point in time?
2. Which branches came off it, why, and from which commit?
3. Which branches merged back, which are still open, and which are stale or superseded?
4. What acceptance criteria, PRs, deployments, approvals, and evidence attach to each point?
5. What safe action can be proposed next, and which agent or human owns it?

HQ is the decision and visual-control surface. Git remains the source of repository history. Cursor remains the coding/execution surface.

## Visual model

Each repo renders as a horizontally pannable timeline.

- Main branch is the spine.
- Commit, merge, release, deployment, acceptance, and approval events are clickable nodes.
- Feature branches grow from the commit where they diverged.
- Merged branches reconnect at their merge point.
- Unmerged branches remain visibly open.
- Superseded or abandoned branches remain visible but can be collapsed.
- The current tip is visually distinct.
- Timeline position represents time. Progress percentage remains a separate concept and must not be inferred from branch geometry.

Selecting a node or branch opens a detail drawer with:

- repo
- branch
- base SHA
- tip SHA
- commit / PR links
- created / updated / merged timestamps
- changed paths
- unique commits relative to main
- merge/conflict state when known
- linked finish-line IDs
- linked approval gates
- evidence receipts
- current owner / seat
- status: active | merged | stale | superseded | archived-candidate
- next safe actions

Motion for React may animate layout, branch growth, merge reconnection, expansion, and collapse. Animation must never imply an operation succeeded before a repository receipt exists.

## Action model

The timeline is read-first. Every write begins as a proposal.

### Read actions

- Examine
- Visualize
- Compare to current main
- Show unique work
- Show acceptance impact
- Show likely superseded work
- Open PR / commit

### Controlled action proposals

- Send to Cursor
- Propose merge
- Propose rebase / reconcile
- Propose archive
- Propose recovery branch from checkpoint
- Propose revert commit

Delete remote branch, merge to protected branch, production migrate, production deploy, credential changes, spend, and external publishing remain explicit gated actions.

A historical checkpoint is never a one-click "rewind production" control. Recovery means create/compare/revert through normal Git semantics with receipts and human approval.

## Cursor connection model

There are three supported lanes.

### Lane A: Cursor deeplink, human-reviewed

HQ can generate a Cursor prompt deeplink containing a bounded task package. Cursor opens with the prompt pre-filled and the user reviews and confirms it. Deeplinks do not silently execute.

Use this for simple handoffs such as:

- examine branch X against main
- inspect folder Y
- explain unmerged unique work
- prepare a merge/rebase plan

Do not include secrets in deeplinks.

### Lane B: local ACP bridge, interactive

For the strongest "HQ button -> Cursor agent" experience, run a small trusted local companion on Mark's machine that speaks Cursor ACP.

Flow:

```
HQ action card
  -> signed request to local companion
  -> companion starts/uses Cursor CLI `agent acp`
  -> ACP session scoped to the selected repo cwd
  -> HQ sends bounded prompt + branch/path context
  -> Cursor streams plan/result
  -> permission requests are surfaced back to Mark
  -> receipt returns to HQ
```

ACP is the reverse-control lane: a custom client talks to Cursor CLI over stdio / JSON-RPC. It is distinct from MCP.

The local companion may also open the repo in Cursor after a successful handoff. Exact file/folder desktop navigation should use supported local editor/CLI behavior rather than inventing an undocumented web deeplink.

### Lane C: Cursor Cloud Agent / Automation

For remote/background repository work, HQ may emit a signed server-side event or webhook to a Cursor Automation / Cloud Agent. The task must still carry:

- repo
- base branch
- target branch
- bounded prompt
- allowed paths
- finish-line IDs
- required tests
- forbidden actions
- approval policy

A Cloud Agent may open a PR. It does not get implicit authority to merge, deploy, publish, spend, or change credentials.

## MCP relationship

MCP remains the read/control-plane bridge **into** Cursor:

```
Cursor -> HQ MCP -> status / blockers / approvals / acceptance / next actions
```

ACP or Cursor Automation is the reverse execution bridge:

```
HQ -> ACP / Automation -> Cursor agent
```

This avoids treating one protocol as bidirectional when it has a different job.

## Action receipt

Every requested action should create an immutable receipt before execution:

```json
{
  "actionId": "hq.repo.<repo>.<timestamp>",
  "requestedBy": "mark",
  "frontId": "hq",
  "repo": "mblackth-ai/SookLabs",
  "branch": "example",
  "baseSha": "…",
  "target": "cursor",
  "mode": "examine",
  "allowedPaths": [],
  "finishLineIds": [],
  "requiresApproval": true,
  "status": "proposed"
}
```

Lifecycle:

`proposed -> approved -> dispatched -> running -> completed | failed | cancelled`

The receipt must store returned branch/PR/commit identifiers when the action changes repository state.

## Safety / authority

1. Browser UI never contains Cursor, GitHub, MCP, or deployment secrets.
2. Default action mode is read-only.
3. Cursor gets the smallest repo/path scope practical.
4. Mark-only gates remain Mark-only.
5. Grok CoS may orchestrate and recommend; it cannot silently override human gates.
6. Live Oversight may challenge stale state or conflicting evidence; it does not merge or deploy merely because it detects the inconsistency.
7. A visual state changes to "done" only from a verifiable receipt.
8. Branch delete must be separate from hide/archive in HQ.
9. "Send to Cursor" and "Approve execution" are separate events for destructive or protected actions.
10. Production state is never inferred solely from Git history.

## Data pipeline

### Repository ingest

GitHub data should normalize into an HQ graph model:

- refs / branches
- commit ancestry
- pull requests
- merge commits
- workflow checks
- tags/releases where relevant
- branch ahead/behind
- changed paths
- deployment evidence when available

### HQ enrichment

Join repository graph nodes to:

- eight-front / successor front definitions
- finish-line acceptance IDs
- pilot and retainer contracts
- approval trigger cards
- agent job receipts
- deploy/migration receipts
- evidence SHA references

### Derived hygiene

HQ may surface, but never auto-delete:

- open branch older than threshold
- branch with zero unique commits
- branch whose unique commits already exist on main
- branch behind main
- branch with conflicts
- branch with no linked acceptance criterion
- branch linked to an unfinished criterion
- branch superseded by a newer PR

## MVP slices

### Slice 1: truthful visualization

- real Git graph adapter for one repo
- horizontal pan/zoom
- branch/merge nodes
- node drawer
- no writes

### Slice 2: acceptance overlay

- front ownership
- finish-line IDs
- blockers / approvals / evidence
- stale/superseded analysis

### Slice 3: Cursor handoff

- deeplink handoff first
- bounded prompt envelope
- action receipt

### Slice 4: ACP local bridge

- local companion
- signed HQ request
- Cursor ACP session
- permission relay
- streamed result + receipt

### Slice 5: controlled writes

- propose merge/rebase/archive/recovery/revert
- double confirmation where required
- GitHub/Cursor receipt validation

## Definition of done for this feature

The feature is not done because an animated tree exists.

It is done when Mark can select a repo/front, visually understand the mainline and every material branch, click any node for evidence and acceptance context, identify orphaned work, and send a bounded task to Cursor with an auditable approval and result path without granting HQ silent destructive authority.
