# RDUSA First Vertical Slice: Acceptance Contract
Status: PROPOSED, no production changes authorised
Date: 2026-10-15
Scope: Demonstrate one complete article and measurement loop, then a separate permissioned existing-CRM overlay slice. Existing client commercial terms are kept confidential outside repositories; overlay scope and support boundaries require written client approval. No outsourced phones or operations takeover.

| ID | Positive acceptance | Proof |
| --- | --- | --- |
| GOV-01 | Repo and Drive direction documents are classified, conflicts decided and entrypoints aligned. | Reviewed PRs and authority register |
| GOV-02 | For each app, deployed commit, host, database durability, identity rules and connected states are verified. | Environment-specific smoke and deploy stamp |
| GOV-03 | RDUSA publication, reporting, client permissions and commercial scope have assigned owners. | Approved authority matrix |
| RD-01 | Authorised operator can read a real unpublished Joomla article including immutable provider ID and source revision. | API test and content fixture |
| RD-02 | SEOS shows an article preview and records proposed edits/feedback in the correct tenant without publishing. | Browser walkthrough and test |
| RD-03 | Only the authorised reviewer can approve the exact revision; later edits revoke approval. | Role and stale-approval tests |
| RD-04 | Joomla write/publish requires fresh approval, permission, idempotency and source revision check. | Conflict, replay and fail-closed tests |
| RD-05 | Outcome records source revision, final URL, decision actor, timestamp and error recovery path. | Evidence event and rollback demonstration |
| RD-06 | GSC/GA4 read-only reporting indicates property, period, last successful pull and stale/unavailable values. | Provider reconciliation |
| RD-07 | Work completed is reported separately from business outcomes; enquiries require actual event tracking. | Source-matched metric report |
| RD-08 | Client can only view/approve/comment inside RDUSA. Founder and other tenants cannot be reached. | Negative access tests at API and UI |
| RD-09 | Article -> review -> approval -> Joomla result -> metrics -> HQ client report works without manual duplicate entry. | End-to-end pilot recording |
| RD-10 | Reduced retyping, interruptions or waiting is measured relative to baseline. | Before/after operational evidence |

Subsequent acceptance (not part of current article pilot): identify and verify Andolw's external CRM access/API; map contact, lead, quote and order authorities; demonstrate read-only mapping, authorised scoped sync, deduplication and correction audit; prove enquiry-to-quote status without replacing his CRM. Quo ingestion and social publishing require separate provider approval. Generalised multi-client provisioning and expanded model swarm remain deferred.
Existing SEOS Refactor Studio acceptance remains in force; this pilot does not redefine its release gate.
PASS requires objective evidence from the intended environment. Migrations, publication, external sends, credential changes and production deployments require human authorisation.
