# SookLabs Document Authority Register
Status: Initial sampled audit, not complete verification
Date: 2026-10-15

## Policy
Preserve historical notes, source evidence, architecture decisions and acceptance contracts. Do not mass-delete or overwrite. Each older direction document gets a classification: ACTIVE_DOMAIN, PROPOSED, HISTORICAL, SUPERSEDED, BLOCKED or UNKNOWN, with a superseding link and human decision. “Ratified by an AI” is not a substitute for founder approval.

After approval/merge, [System Contract](./SOOKLABS_SYSTEM_CONTRACT.md) controls cross-repository roles. More specific active domain criteria retain domain scope. Actual deployed behaviour is established by code SHA and runtime tests, not prose.

## Sampled source register
| Source | Treatment | Follow-up |
| --- | --- | --- |
| HQ `docs/HQ-MCP-CONTROL-PLANE.md` | ACTIVE_DOMAIN | Link new contract, verify live Rooms separately |
| HQ `docs/HQ-AGENTS.md`, `docs/HQ-MCP-ACTIVATION.md` | ACTIVE_DOMAIN runbooks | Verify claimed endpoints and seats before calling Connected |
| SEOS `docs/SEOS-MVP-1.md`, `docs/agent/DECISIONS.md` | ACTIVE_DOMAIN | Keep actual MVP scope; differentiate manual and connected |
| SEOS `docs/REFACTOR_STUDIO_FINAL_ACCEPTANCE.md` | ACTIVE_DOMAIN acceptance | Keep Refactor closure independent of social expansion |
| SEOS `docs/authority-durability.md` | ACTIVE_DOMAIN runbook | Confirm production DB persistence |
| Sookly `sookly-control/release-matrix.md`, `current-state.md`, `decision-log.md` | ACTIVE_DOMAIN | Preserve release gate, contact human review and scope isolation |
| RDUSA `rdusa-retainer-growth-system-v2/00_INDEX/RDUSA_RETAINER_GROWTH_SYSTEM_INDEX.md` | ACTIVE_DOMAIN | Retain client-specific promise map and QC |
| RDUSA `docs/RDUSA_MASTER_AUDIT_SCOPE_AUTHORITY_ACCOUNTABILITY_2026-10-01.md` | ACTIVE_DOMAIN | Respect accountability and approvals |
| Drive `SOOKLABS_OS_MASTER_RELAY_SPEC.md` | PROPOSED historical architecture | Mark superseded *for cross-system direction only after contract approval*; archive and link |
| Drive `12 — SEOS Connection Architecture & Social Workflow Specification` | PROPOSED design | Compare OAuth examples and status claims to provider docs and real code |
| Drive `13 — SookLabs HQ MCP Gateway & Agent Swarm Protocol Specification` | PROPOSED design | Check MCP tool inventory and live runtime |
| Drive `SookLabs Growth OS — PRD (phased) — Grok complete draft` | PROPOSED | Reconcile against client-first roadmap |
| RDUSA September report | HISTORICAL performance evidence | Dates and data freshness cannot be silently treated as current |
| HQ PRs #5, #9, #10, #11, #12 | UNKNOWN | Decision needed (merge / close / supersede) |
| HQ `docs/HQ-MCP-CONTROL-PLANE.md` §RDUSA value-expansion item 2 | PROPOSED | Must not imply Sookly CRM replaces Andolw's CRM |
| `mblackth-ai/websitev1.1` (Cascade CRM) | UNKNOWN | Identify whether this is Andolw's CRM; live URL 404 on 2026-10-15 |
| sookly-omnichat #83 | ACTIVE_DOMAIN | Release gates G1–G13 binding |

## 2026-10-15 RDUSA commercial correction
The former operations takeover page in Notion is a **historical proposal**, not current engagement authority. Existing client commercial terms are confidential and maintained outside repositories. The new overlay/CRM integration is proposed as separately approved work; outsourced phones and day-to-day business operations are excluded. Never include confidential retainer figures or personal accounting in any code, README, issue, PR or design file. Refer to the updated Notion RDUSA page (URL to be confirmed by Mark; not verified). Verify any later signed agreement before changing terms.

## Confirmed direction conflicts to resolve
1. Drive relay describes immediate lead creation; Sookly requires untrusted capture quarantine/pending human review. **Preserve Sookly restriction.**
2. Conceptual social and MCP connection examples do not prove production credentials, active API permissions or live operation. **Connected requires runtime evidence.**
3. SEOS contains both localStorage MVP state and DB-backed concepts. **Audit actual persistence per feature.**
4. Existing HQ and RDUSA documents already establish ownership and acceptance. **Do not create competing approval or commercial-scope authorities.**
5. Sookly Contact CRM is documented; **Andolw (name/spelling to be confirmed)'s separately referenced CRM name and login are not confirmed**.

## Full reconciliation backlog
Inventory all normative .md/.mdc/AGENTS/CLAUDE files on relevant branches and Drive references. For every conflict record: path, date, original claim, implementing commit, deployment evidence, owner, proposed classification, superseding reference, approver, PR, decision date. Only then patch specific obsolete headers with “Superseded by ...”; preserve their bodies for traceability.

Acceptance states: OPEN, IN_PROGRESS, BLOCKED, PASS (evidence linked), DEFERRED. Merge is not production PASS. Follow up with doc-link/authority CI and the existing HQ execution board; do not create a parallel runtime task store.
