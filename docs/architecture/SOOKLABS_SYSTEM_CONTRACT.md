# SookLabs System Contract
Status: PROPOSED, approval required
Version: 0.1.0
Date: 2026-10-15

## Principle and boundary
SookLabs sells relief from repetitive conversation, interruption, waiting and cognitive load. Build only features that demonstrably remove at least one of these costs. AI is a reasoning layer, not an authority on SOPs, policies, commercial facts or publication. Human-maintained documented rules and evidence remain authoritative.

This contract governs **cross-repository boundaries** after founder approval and merge. Domain-level acceptance and release criteria retain authority inside their own repositories. A plan is not proof of implementation.

| System | Owns | Does not own |
| --- | --- | --- |
| HQ (SookLabs) | Founder oversight, client-scoped views and approvals, multi-system reporting projections, audit, HQ Rooms/agent task evidence | Joomla content, Sookly CRM, SEOS specialist editing |
| SEOS | Content lifecycle, Knowledge Base and approved claims, Joomla draft review, SEO/social planning, analytics, connector jobs | Founder operations, arbitrary CRM changes, autonomous publishing |
| Sookly | Customer communications, receptionist, approved Contact CRM and customer journey; separate internal Ops Assistant role | Marketing publishing or unverified operating policy |
| RDUSA | Client facts, contract scope, editorial QA, source records and current retainer execution | Platform-wide product decisions |
| External platforms | Their original content/metrics/communications records | HQ authority or approvals |

### Roles and truth
- HQ is founder command and client reporting; SEOS is specialist execution; the client portal is a tenant-scoped projection with permitted approval/feedback actions, not a second content database.
- Sookly Receptionist and Ops Assistant have separate permissions, tone and guardrails. Ops answers require retrieval of the relevant versioned human-maintained SOP; missing or ambiguous SOP means abstain/escalate.
- Joomla remains the CMS publication source of truth. GSC, GA4 and social platforms are the metric sources. Sookly owns its approved Contact CRM. The separately mentioned Andrew-built CRM is **unidentified** until evidence establishes its name, sign-in, API, and rights.
- Access does not equal assigned ownership or contractual responsibility. RDUSA's retainer scope is not expanded by proposed features.
- Tenant scoping is enforced server-side on data, APIs, callbacks, reports, exports and background jobs.
- All consequential actions carry actor, role, source ID/version, decision, timestamp, system outcome and objective evidence. Chat summaries are not PASS evidence.

### Non-negotiable safety
- Drafting/research by AI is allowed within permissions. Agents cannot self-approve, invent policy, change SOPs, publish, send customer communications, merge, deploy, migrate, spend or provision credentials without the appropriate explicitly recorded authority.
- Untrusted Sookly contacts must follow current human review/quarantine rules, not a generic automatic CRM insertion rule.
- Encrypted, least-privilege server-side credentials only. No tokens in code, client storage, reports, Rooms or LLM prompts.
- Provider webhooks and scheduled polling feed durable, idempotent jobs with bounded retries, replay/deduplication and failure recovery.
- MCP exposes bounded tools and agent task/evidence coordination, not an alternative analytics pipeline.
- No mock Connected badge or invented live analytics; show source, reporting period, comparison, capture date and missing/stale state.
- Database-backed client workflows need proven persistence; ephemeral SQLite on serverless is not an acceptable production authority store.
- Every write action, including Joomla updates, must handle stale source revisions and re-approval after edits.

## RDUSA commercial boundary and integration overlay (2026-10-15 correction)
- Current working baseline: **USD 1,500 per month** under the existing RDUSA retainer. Do not claim any additional fee has been accepted.
- **No longer part of proposed expansion:** outsourced phone coverage, receptionist shifts, or takeover of general day-to-day operations. Earlier USD 3,000/month 90-day operations documents are historical proposals only, not a current agreement.
- **Proposed new work, separately priced and approved:** integrate Andolw's existing CRM and a minimally invasive business overlay across permitted contact, enquiry, quote, order, communications, Joomla content and measurement systems. Connect existing source systems rather than build a duplicate CRM.
- Record onboarding fee versus ongoing integration/support work, exact permissions, responsibilities, deliverables, service levels and start date in a new written agreement before representing it as committed.
- Identify Andolw's CRM and verify documented APIs and data rights before planning migrations or bidirectional sync.

## RDUSA first proven vertical slice
1. Audit deployments, database durability, current docs and granted scopes.
2. Connect Joomla unpublished articles read-only, preserving article ID/revision.
3. Preview, propose revisions, comment, and request authorised approval in SEOS.
4. Publish/write back only after explicit authorisation and stale-revision check; record outcome and resulting URL.
5. Reconnect verified GSC/GA4 read-only analytics and add enquiry attribution where approval exists.
6. Project only RDUSA's permitted approval and reporting information in HQ client view.
7. Prove source-to-decision-to-publication-to-measurement without duplicate data entry.
8. After pilot: phased social APIs, Quo and external CRM, only on verified API/consent terms.

Existing SEOS Refactor Studio closure criteria remain separate; a future social integration does not retroactively block Refactor completion.

## Roadmap
P0: reconcile documentation and prove current environments.
P1: RDUSA Joomla approval/publish + source-linked reporting and tenant-safe client view.
P2: identify and securely integrate Andolw's existing external CRM and authorised Quo workflow; verified social connections follow bounded provider-specific approvals.
P3: expand HQ Rooms model collaboration after shared-state/security acceptance.
P4: generalise proven client onboarding (Jaka next candidate).

## Decision and change process
Precedence: approved legal/client agreements and human permissions > this cross-system contract (after merge) > domain canonical specs and tests > actual runtime evidence of status > historical/speculative reports.
Conflicts must be recorded, not resolved by document recency or an agent's confidence.

Any departure requires an ADR recording: problem, measurable load removed, owner, impacted systems, data source, alternatives, permission changes, acceptance IDs, test evidence, rollback and founder decision. No feature-sprawl PRs.

See [Document Authority Register](./DOCUMENT_AUTHORITY_REGISTER.md) and [RDUSA acceptance](../acceptance/RDUSA_VERTICAL_SLICE.md).
