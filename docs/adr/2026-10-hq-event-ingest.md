# ADR 2026-10: HQ event ingest — clients, retainers, tasks, transcripts

- Status: **Proposed** (spec only; implement after #5 merges and Journey is live)
- Date: 2026-10-02
- Builds on: [#5](https://github.com/mblackth-ai/SookLabs/pull/5), [`HQ-MCP-CONTROL-PLANE.md`](../HQ-MCP-CONTROL-PLANE.md)
- First source: [`integrations/quo.md`](../integrations/quo.md)

## Context

HQ today has two kinds of truth:

1. **Code-defined contracts** — retainer scorecards in
   `lib/hq/rdusa-retainer-contract.js` and `lib/hq/jaka-retainer-contract.js`
   (each with a `clientId`), indexed by `lib/hq/retainer-delivery.js` and read
   through `getControlPlaneSnapshot()`. #5 makes these the only retainer score
   source relays may cite.
2. **The `hq_ops` row** — one JSONB document (`lib/hq/ops-pg.js`) holding
   priorities, workstream items (`todo|doing|blocked|done`), blockers and the
   last 20 agent jobs. It is read and rewritten whole on every patch.

External events (Quo calls now; SEOS status and others later) don't fit
either: they're high-volume, append-mostly, contain client data, and must be
idempotent and replayable.

## Decision

### 1. Clients and retainers stay code-defined

- No `clients` or `retainers` table. The set of clients is the set of
  `clientId`s in the retainer contracts. Add `lib/hq/clients.js` that derives
  `[{ clientId, label }]` from those contracts for routing and filters.
- Retainer criteria, periods and PASS/FAIL stay in the contract files, changed
  only by reviewed PRs with evidence — exactly as #5 defines.
- Ingested data may be **linked** from a criterion's evidence later, by a
  human, in a PR. It never changes a status by itself.

### 2. Ingested data goes in dedicated Postgres tables, not `hq_ops`

Created by `scripts/hq-init-db.mjs` with `CREATE TABLE IF NOT EXISTS`
(same pattern as `ensureOpsSchema`). Production creation is a migration and
needs Mark's approval like any other.

```sql
-- Every inbound event, raw. Idempotency + replay.
CREATE TABLE IF NOT EXISTS hq_events (
  id           TEXT PRIMARY KEY,           -- provider event id
  source       TEXT NOT NULL,              -- 'quo' (later: 'seos', …)
  type         TEXT NOT NULL,
  received_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status       TEXT NOT NULL DEFAULT 'received', -- received|processed|ignored|error
  error        TEXT,
  payload      JSONB NOT NULL
);
CREATE INDEX IF NOT EXISTS hq_events_source_idx ON hq_events (source, received_at DESC);

-- One row per call, assembled from call / transcript / summary events.
CREATE TABLE IF NOT EXISTS hq_calls (
  call_id          TEXT PRIMARY KEY,       -- Quo call id
  client_id        TEXT,                   -- contract clientId or NULL (unassigned)
  client_source    TEXT,                   -- 'route' | 'manual'
  phone_number_id  TEXT,
  conversation_id  TEXT,
  direction        TEXT,
  status           TEXT,
  started_at       TIMESTAMPTZ,
  completed_at     TIMESTAMPTZ,
  duration_sec     INTEGER,
  dialogue         JSONB,                  -- transcript lines
  summary          JSONB,                  -- string[]
  next_steps       JSONB,                  -- string[]
  quo_link         TEXT,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS hq_calls_client_idx ON hq_calls (client_id, completed_at DESC);

-- Client tasks. Separate from hq_ops workstream items (internal build work).
CREATE TABLE IF NOT EXISTS hq_tasks (
  id           TEXT PRIMARY KEY,
  client_id    TEXT,
  title        TEXT NOT NULL,
  status       TEXT NOT NULL,              -- proposed|todo|doing|blocked|done|rejected
  priority     TEXT,                       -- P0|P1|P2
  owner        TEXT,
  due          DATE,
  source       TEXT NOT NULL,              -- 'quo-call' | 'manual'
  source_ref   TEXT,                       -- call_id for quo-call
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (source, source_ref, title)       -- replay can't duplicate
);
```

- **Transcripts** are the `dialogue` column on `hq_calls` — no separate table
  until there's a second transcript source.
- **Task statuses** reuse `todo|doing|blocked|done` from `ops-shared.js` and
  add `proposed` (from an integration, not yet accepted) and `rejected`.
  `proposed`/`rejected` never appear in `getTopOpenItems`.
- Client tasks stay out of `hq_ops.workstreams`: those are SookLabs build
  items with owners like James; client tasks are per-client delivery work.

### 3. One read model for UI and MCP

New functions in `lib/hq/calls-pg.js` / `lib/hq/tasks-pg.js` back both the HQ
routes and the MCP tools. `getControlPlaneSnapshot()` gains a small summary
field (counts only, no transcript text):

```js
clientActivity: {
  asOf,                               // server clock
  callsLast7d: { rdusa: 0, jaka: 0, unassigned: 0 },
  proposedTasks: { rdusa: 0, jaka: 0, unassigned: 0 },
  openTasks:     { rdusa: 0, jaka: 0, unassigned: 0 },
}
```

### 4. Writes stay human

The only writes in this slice are via the signed-in HQ session: assign a call
to a client, accept/reject/update a task. MCP stays read-only, per
`HQ-MCP-CONTROL-PLANE.md`.

## Consequences

- + Idempotent, replayable ingest; the `hq_ops` blob stays small.
- + Retainer scoring is unchanged and still cites only contract snapshots.
- + The same `hq_events` table takes SEOS events later without a new design.
- − Postgres is now required for this feature (file mode can't hold it);
  the routes return `503` when `HQ_DATABASE_URL` is unset.
- − Client list changes need a contract PR. That's intended.

## Retention (proposed, Mark to confirm)

Keep `dialogue` 180 days, then null it and keep `summary`/`next_steps`.
Keep `hq_events.payload` 30 days after `processed`.

## Alternatives rejected

- **Put calls/tasks in `hq_ops`** — whole-document rewrites, 20-item caps,
  and client transcripts mixed into the ops blob.
- **`clients`/`retainers` tables** — a second retainer source of truth,
  contradicting #5.
- **Auto-create `todo` tasks** — would let an integration create commitments
  without Mark's review.
