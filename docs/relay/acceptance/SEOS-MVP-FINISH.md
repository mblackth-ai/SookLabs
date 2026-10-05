# SEOS MVP finish line — acceptance sheet

**Authority (SEOS repo):** `docs/SEOS-MVP-1.md`, `docs/mvp-smoke-checklist.md`, `docs/agent/DECISIONS.md`.

Repo: https://github.com/mblackth-ai/SEOS  
Spark reconciles checklist **wording** with Mark when product copy changed on purpose (see baton 11 / Claude check-in).

## Lifecycle (4 stages)

| Stage | Intent | Status | Evidence |
| --- | --- | --- | --- |
| seos.stage.setup | Domain / operator access setup | UNRUN | |
| seos.stage.seed | Clean tenant seed; no demo bleed | UNRUN | |
| seos.stage.edit | Identity edit persists to KB used by export | UNRUN | |
| seos.stage.export | Downloads: correct filenames + MIME; honest badges | UNRUN | |

## Smoke checklist rows (canonical ids — verify against live checklist SHA)

| ID | Criterion | Owner | Status | Evidence |
| --- | --- | --- | --- | --- |
| mvp1.wizard | Setup wizard completes or skip path honest | cursor | UNRUN | |
| mvp1.seed-export | Seed produces exportable KB | cursor | UNRUN | |
| mvp1.identity-edit | `#seos-business-name` edit → reload persists | cursor | UNRUN | Codex patch in baton 11 |
| mvp1.exports.tabs | llms.txt, schema, knowledge.json names correct | cursor | UNRUN | |
| mvp1.exports.copy-download | Copy/download matches generator output | cursor | UNRUN | |
| mvp1.smoke.exit | Runner fails on NOT_MET/UNRUN required checks | codex | UNRUN | |
| mvp1.hq.local | HQ cross-link after **HQ login** session | cursor | UNRUN | |
| mvp1.hq.prod | Production HQ ↔ SEOS link | mark | BLOCKED | operator gate |
| mvp1.ci.install | `npm ci` green on integration branch / main | cursor | UNRUN | @swc/helpers |
| mvp1.badges | Manual / Workflow Ready only; no fake Connected | all | UNRUN | DECISIONS.md |

## Known defects (implementation baton 11 — close before MVP sign-off)

| Defect | File | Fix owner |
| --- | --- | --- |
| Identity not synced to export store | `knowledge-base.tsx` | cursor |
| Wrong export filename | `knowledge-exports.tsx` | cursor |
| Bad type import | `lib/knowledge/generators/llms.ts` | cursor |
| Smoke harness swallows failures | `scripts/smoke.mjs` (or equivalent) | codex + cursor |

## Report back

`docs/reports/REPORT_SEOS_<YYYYMMDD>_<seat>.md` in **SEOS repo** (preferred) or SookLabs relay copy linking PR.
