# HQ Reports and owner rooms

## Reports (Mark)

`/hq/reports` (Projects → Reports) shows every business SEOS manages: keyword groups (average position, top 10, ranking, clicks, up/down, monthly trend), totals, latest sessions, source status and the work underway. Data comes from SEOS `GET /api/analytics/hq-summary` with the existing `SEOS_HQ_API_TOKEN` (same token and URL as the Authority panel). SEOS stays the source of truth; HQ stores none of it.

## Owner rooms

A business owner gets a private page with their own rankings and the work underway, nothing else.

| Step | What happens |
|---|---|
| Switch on (once) | Reports → Owner rooms → **Create owner tables on the live database**. Runs `CREATE TABLE` on the live HQ database for `hq_owner_invites` and `hq_owner_access` only. Existing tables stay as they are. This is a production database change. |
| Invite | Type the owner's name, **Invite owner**. The link is shown once, works once and expires in 7 days. Send it to the owner directly, never in the room. |
| Owner opens it | The page shows who invited them. Opening it with GET never uses it (chat-app link previews can't burn it). **Open my reports** uses it and sets an httpOnly owner cookie for 90 days. |
| Owner room | `hq.sooklabs.com/client`. The business comes from the owner's key, never the URL. No HQ navigation, no SEOS link, no setup details, no internal notes, scores, risks or approvals. |
| Revoke | Reports → Owner rooms → **Revoke** (access) or **Cancel link** (unused invite). Takes effect on the owner's next page load. |

Only hashes of links and keys are stored. Owner pages (`/hq/client`, `/hq/client/*`) and two routes (`/hq/api/client/redeem`, `/hq/api/client/logout`) are open in the middleware and check the owner cookie or one-time link themselves. Any other `/hq/api/client` route stays behind Mark's session. `/hq/api/owners` needs Mark's HQ session and blocks cross-site posts. A failed redeem sends the join page an error code (`used`, `expired`, `cancelled`, `unknown`, `unavailable`); the page shows fixed text for those codes and ignores anything else in the URL.

What owners see as "work underway": SEOS authority task titles only, as "Done in the last 30 days" (completed/won) or "In progress" (any other active state). Not started, parked, blocked and rejected tasks are not shown. Keep task titles client-appropriate.

## Tests

```
HQ_TEST_DATABASE_URL=postgres://… node --test lib/hq/owner-portal.test.js
node --test lib/hq/analytics-summary.test.js
```

## Rollback

Revert the PR. Owner links and keys stop working at once (the routes are gone). Drop the tables only if Mark asks: `DROP TABLE hq_owner_invites, hq_owner_access;`
