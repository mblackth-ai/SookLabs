# Implementation reports (agent → Spark)

Agents write **`REPORT_<FRONT>_<YYYYMMDD>_<seat>.md`** here after each sprint.

**Schema:** [docs/relay/MARKDOWN-BATON-PROTOCOL.md](../relay/MARKDOWN-BATON-PROTOCOL.md)  
**Templates:** [docs/relay/templates/REPORT-TEMPLATE.md](../relay/templates/REPORT-TEMPLATE.md)

Spark verifies PASS rows against CI/logs, then appends [00_ROOM_EVENT_FEED](https://docs.google.com/document/d/1pAiSqJJsIEZQARpZG5qgIVwK_Hkm6amM7BdbQkKqO60/edit).

Do not commit secrets. SEOS-specific reports may live in the SEOS repo; link them from baton acceptance tables.
