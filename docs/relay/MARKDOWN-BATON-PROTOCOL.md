# Markdown baton & report protocol

Frictionless **Gemini Spark ↔ Cursor / Claude / Codex ↔ repo** loop. Every artifact is a normal `.md` file with YAML frontmatter.

## Baton (Spark → implementers)

**Filename:** `docs/relay/batons/NN-<slug>.md` (repo) and/or Drive doc `NN — Title` in [Relay Outbox](https://drive.google.com/drive/folders/1vE51KLf3dkoMNVjdrCiE1pMvV26xeKS7).

```yaml
---
baton_id: SPARK-2026-10-06-SEOS-EDIT
number: 12
author: gemini
seat: gemini
status: ACTIVE | SUPERSEDED | DONE
target_seats: [cursor, codex]
target_repos:
  - mblackth-ai/SEOS
  - mblackth-ai/SookLabs
canonical_authority:
  - docs/SEOS-MVP-1.md
  - docs/mvp-smoke-checklist.md
single_writer: cursor
expires_at: 2026-10-06T20:00:00Z
---
```

### Required sections

1. **Purpose** — one paragraph.
2. **Acceptance rows** — table: `check_id | criterion | owner | status | evidence_url`.
3. **Implementation package** — literal file paths and intent (not full secrets).
4. **Out of scope** — explicit.
5. **Report back** — which report filename implementer must produce.

Status values for acceptance rows: `PASS` | `NOT_MET` | `UNRUN` | `BLOCKED` (human gate).

## Report (implementer → Spark → room)

**Filename:** `docs/reports/REPORT_<FRONT>_<YYYYMMDD>_<seat>.md`  
Examples: `REPORT_SEOS_20261005_cursor.md`, `REPORT_HQ_20261005_claude.md`.

```yaml
---
report_id: CURSOR-REPORT-20261005-SEOS-SMOKE
author: cursor
seat: cursor
target_repo: mblackth-ai/SEOS
tested_revision: <full git sha>
branch: cursor/...
status: READY_FOR_REVIEW | PARTIAL | BLOCKED
related_baton: SPARK-2026-10-06-SEOS-EDIT
---
```

### Required sections

1. **Executive summary** (≤ 8 lines).
2. **Checklist** — bullet per canonical check id:

   ```markdown
   - [PASS] mvp1.identity-edit: tradingName persists after reload; selector #seos-business-name
   - [NOT_MET] mvp1.hq.prod: blocked — Mark production gate
   - [UNRUN] mvp1.seed-export: not in this PR scope
   ```

3. **Evidence** — PR URL, commit SHA, CI run URL, screenshot or log path (no tokens).
4. **Honest badges** — what is Manual / Workflow Ready / Future API.
5. **Next action** — single bounded step + owner seat.

## Spark verification pass

After a report lands:

1. Cross-check `tested_revision` matches PR head.
2. Cross-check each `PASS` against CI or attached log — downgrade to `NOT_MET` if unverified.
3. Append to [00_ROOM_EVENT_FEED](https://docs.google.com/document/d/1pAiSqJJsIEZQARpZG5qgIVwK_Hkm6amM7BdbQkKqO60/edit):

   ```text
   [ISO8601] [VERIFIED|DISPUTED] [gemini-spark] report_id — one line summary + link to report/PR
   ```

4. Optional: `room_post` as `gemini` with `kind: evidence` and refs `doc:docs/reports/...` + `pr:#N` when MCP is live.

## Prohibited in any relay `.md` or Drive doc

- `HQ_ROOM_CONNECTION_*`, API keys, webhook secrets, customer PII, raw session cookies.
- “Connected” or “production accepted” without environment-named proof.
- Checklist rows marked PASS without a linked artifact.

## Templates

- [templates/BATON-TEMPLATE.md](./templates/BATON-TEMPLATE.md)
- [templates/REPORT-TEMPLATE.md](./templates/REPORT-TEMPLATE.md)
- [templates/GEMINI-RULING-TEMPLATE.md](./templates/GEMINI-RULING-TEMPLATE.md)
