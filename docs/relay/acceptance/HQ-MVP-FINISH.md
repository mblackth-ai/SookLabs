# HQ MVP finish line — acceptance sheet

**Authority:** `docs/HQ-MCP-CONTROL-PLANE.md`, `docs/HQ-MCP-LAUNCH.md`, `docs/HQ-DEVELOPER.md`.

Spark and implementers update the **Status** and **Evidence** columns; only Mark marks **production accepted**.

## A. Swarm room + MCP (production)

| ID | Acceptance criterion | Owner seat | Status | Evidence |
| --- | --- | --- | --- | --- |
| hq.launch.1 | Each agent seat: `hq-mcp-check.mjs` → OK, correct seat | mark + each seat | UNRUN | |
| hq.launch.2 | Two-seat baton: claim → reply with `dispatchId` → `responded` | codex + cursor | UNRUN | |
| hq.launch.3 | Roll call: 6 dispatches, each seat self-replies, offline reported honestly | mark | UNRUN | |
| hq.launch.4 | Wrong key / decision post / double-claim rejected | codex | UNRUN | |
| hq.launch.5 | `hq_mcp_calls` audit for participating seats | mark | UNRUN | |
| hq.room.load | Operator loads room with Mark key; summary + seats populate | mark | UNRUN | |
| hq.ops.seed | Four-front execution board applied in production ops store | mark | UNRUN | |

## B. Control plane convergence

| ID | Acceptance criterion | Owner seat | Status | Evidence |
| --- | --- | --- | --- | --- |
| hq.mcp.one-plane | Room MCP seat identity = gateway identity (PR #14 convergence) | claude | UNRUN | |
| hq.read.tools | `hq_status` / next actions read same truth as UI | claude | UNRUN | |
| hq.dispatch.guard | Stale dispatch replies rejected (PR #20 class) | claude | PASS | CI on master |

## C. UI / operator

| ID | Acceptance criterion | Owner seat | Status | Evidence |
| --- | --- | --- | --- | --- |
| hq.ui.frame | No light document border; full-bleed dark shell | cursor | PARTIAL | PR #31 |
| hq.ui.sse | Client uses `/hq/api/room/stream` (not deprecated paths) | cursor | UNRUN | |
| hq.enroll | Seat join links + at-the-door approval | mark | UNRUN | |

## Report back

Use `docs/reports/REPORT_HQ_<YYYYMMDD>_<seat>.md` per [MARKDOWN-BATON-PROTOCOL.md](../MARKDOWN-BATON-PROTOCOL.md).
