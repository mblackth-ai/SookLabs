# HQ eight-front board

**Date:** 2 Oct 2026

The founder board is `/hq` and `/hq/fronts`. Each front opens `/hq/fronts/<id>`.

Percentages come from Must-row counts or a recorded four-front estimate. The overall 33 is the rounded mean of the eight. Engineering 85 / 80 / 45 / 35 stay on `/hq/engineering/four-fronts`.

The detail page draws a 0–100 timeline. Checklist spacing is not a second percentage. The labeled window is 2–31 Oct 2026 and is not a ship date.

Repo branch cards can Examine, Visualize, Merge, or Remove.

- Examine and Visualize copy a JSON brief with repo, branch, PR, SHA, gates, and finish-line ids. If `NEXT_PUBLIC_HQ_GROK_URL` is an `https` URL, the button also opens that URL. If it is unset, nothing is opened and the page says so.
- Merge records a request in this browser and links to the PR. It does not call GitHub.
- Remove hides the card in this browser. It does not delete the remote branch.

Finish-line criteria: `docs/FINISH_LINE_ACCEPTANCE_ALL_FRONTS.md`. Percent table: `docs/HQ_FRONTS_PROGRESS.md`.
