import pg from "pg";

// Durable execution state for the HQ loop. The ops store's executionMode items
// remain the board of record (what each task is and how it is accepted); this
// store holds only execution mechanics: claims, fencing, attempts, wakes,
// side-effect receipts, evidence and the audit trail.
//
// Tables are NOT created on first use. Run scripts/hq-loop-migrate.mjs, which
// is a production migration and needs Mark's approval. Until then every entry
// point reports { installed: false } and nothing runs.

const { Pool } = pg;
let pool;

function getPool() {
  if (!pool) {
    const url = process.env.HQ_DATABASE_URL || process.env.DATABASE_URL;
    if (!url) throw Object.assign(new Error("HQ_DATABASE_URL not configured"), { code: "no-database" });
    pool = new Pool({ connectionString: url, ssl: url.includes("sslmode=require") ? { rejectUnauthorized: false } : undefined });
  }
  return pool;
}

export async function closeLoopPool() {
  if (pool) await pool.end();
  pool = undefined;
}

const q = (text, params) => getPool().query(text, params);

export const LOOP_SCHEMA = [
  `CREATE TABLE IF NOT EXISTS hq_loop_tasks (
    id TEXT PRIMARY KEY,
    front TEXT NOT NULL,
    title TEXT NOT NULL,
    source TEXT NOT NULL,
    ops_item_id TEXT,
    owner_seat TEXT,
    reviewer_seat TEXT,
    deliverable TEXT NOT NULL,
    acceptance JSONB NOT NULL,
    authority JSONB NOT NULL,
    refs JSONB NOT NULL DEFAULT '[]',
    dependencies TEXT[] NOT NULL DEFAULT '{}',
    rationale TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL,
    stage TEXT NOT NULL DEFAULT 'queued',
    next_skill TEXT,
    next_action TEXT NOT NULL DEFAULT '',
    next_wake_at TIMESTAMPTZ NOT NULL,
    priority INTEGER NOT NULL DEFAULT 50,
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 3,
    lease_owner TEXT,
    lease_until TIMESTAMPTZ,
    fence BIGINT NOT NULL DEFAULT 0,
    waiting_on TEXT,
    resource_key TEXT,
    blocker TEXT,
    paused BOOLEAN NOT NULL DEFAULT FALSE,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    review JSONB,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS hq_loop_tasks_eligible ON hq_loop_tasks (status, next_wake_at)`,
  `CREATE TABLE IF NOT EXISTS hq_loop_evidence (
    id BIGSERIAL PRIMARY KEY,
    task_id TEXT NOT NULL,
    kind TEXT NOT NULL,
    environment TEXT NOT NULL,
    label TEXT NOT NULL,
    verdict TEXT NOT NULL,
    revision TEXT,
    url TEXT,
    detail JSONB,
    observed_at TIMESTAMPTZ NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS hq_loop_evidence_task ON hq_loop_evidence (task_id, observed_at)`,
  `CREATE TABLE IF NOT EXISTS hq_loop_events (
    id BIGSERIAL PRIMARY KEY,
    task_id TEXT,
    kind TEXT NOT NULL,
    actor TEXT NOT NULL,
    dedupe_key TEXT UNIQUE,
    payload JSONB,
    created_at TIMESTAMPTZ NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS hq_loop_effects (
    task_id TEXT NOT NULL,
    effect_key TEXT NOT NULL,
    kind TEXT NOT NULL,
    status TEXT NOT NULL,
    ref TEXT,
    created_at TIMESTAMPTZ NOT NULL,
    done_at TIMESTAMPTZ,
    PRIMARY KEY (task_id, effect_key)
  )`,
  `CREATE TABLE IF NOT EXISTS hq_loop_budget (
    day DATE NOT NULL,
    kind TEXT NOT NULL,
    used INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (day, kind)
  )`,
  `CREATE TABLE IF NOT EXISTS hq_loop_workers (
    id TEXT PRIMARY KEY,
    host TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL,
    last_beat_at TIMESTAMPTZ NOT NULL,
    last_result JSONB
  )`,
  `CREATE TABLE IF NOT EXISTS hq_loop_control (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_by TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
  )`,
];

export async function migrateLoop() {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    for (const statement of LOOP_SCHEMA) await client.query(statement);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/** True only when every loop table exists. Never creates anything. */
export async function loopInstalled() {
  if (!(process.env.HQ_DATABASE_URL || process.env.DATABASE_URL)) return false;
  const result = await q(
    `SELECT count(*)::int AS n FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = ANY($1)`,
    [["hq_loop_tasks", "hq_loop_evidence", "hq_loop_events", "hq_loop_effects", "hq_loop_budget", "hq_loop_workers", "hq_loop_control"]]
  );
  return result.rows[0].n === 7;
}

const iso = (v) => (v ? new Date(v).toISOString() : "");

export function mapTask(row) {
  return {
    id: row.id,
    front: row.front,
    title: row.title,
    source: row.source,
    opsItemId: row.ops_item_id || "",
    ownerSeat: row.owner_seat || "",
    reviewerSeat: row.reviewer_seat || "",
    deliverable: row.deliverable,
    acceptance: row.acceptance || {},
    authority: row.authority || {},
    refs: row.refs || [],
    dependencies: row.dependencies || [],
    rationale: row.rationale || "",
    status: row.status,
    stage: row.stage,
    nextSkill: row.next_skill || "",
    nextAction: row.next_action || "",
    nextWakeAt: iso(row.next_wake_at),
    priority: row.priority,
    attempts: row.attempts,
    maxAttempts: row.max_attempts,
    leaseOwner: row.lease_owner || "",
    leaseUntil: iso(row.lease_until),
    fence: Number(row.fence),
    waitingOn: row.waiting_on || "",
    resourceKey: row.resource_key || "",
    blocker: row.blocker || "",
    paused: row.paused === true,
    revoked: row.revoked === true,
    review: row.review || null,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

/** Insert a task once. An existing id keeps all of its runtime state. */
export async function createTask(task) {
  const now = new Date().toISOString();
  const result = await q(
    `INSERT INTO hq_loop_tasks
      (id, front, title, source, ops_item_id, owner_seat, reviewer_seat, deliverable, acceptance, authority, refs,
       dependencies, rationale, status, stage, next_skill, next_action, next_wake_at, priority, max_attempts,
       resource_key, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10::jsonb,$11::jsonb,$12,$13,$14,'queued',$15,$16,$17,$18,$19,$20,$21,$21)
     ON CONFLICT (id) DO NOTHING RETURNING *`,
    [
      task.id,
      task.front,
      task.title,
      task.source,
      task.opsItemId || null,
      task.ownerSeat || null,
      task.reviewerSeat || null,
      task.deliverable,
      JSON.stringify(task.acceptance || {}),
      JSON.stringify(task.authority || {}),
      JSON.stringify(task.refs || []),
      task.dependencies || [],
      task.rationale || "",
      task.status || "active",
      task.nextSkill || "acceptance-gap-triage",
      task.nextAction || "",
      task.nextWakeAt || now,
      task.priority ?? 50,
      task.maxAttempts ?? 3,
      task.resourceKey || null,
      now,
    ]
  );
  return result.rows[0] ? mapTask(result.rows[0]) : null;
}

export async function getTask(id) {
  const result = await q("SELECT * FROM hq_loop_tasks WHERE id = $1", [id]);
  return result.rows[0] ? mapTask(result.rows[0]) : null;
}

export async function listTasks() {
  const result = await q("SELECT * FROM hq_loop_tasks ORDER BY priority ASC, created_at ASC LIMIT 200");
  return result.rows.map(mapTask);
}

/**
 * Claim the next eligible task: active, due, unleased (or lease lapsed), not
 * paused or revoked, dependencies done, and no other live lease on the same
 * resource. SKIP LOCKED lets several workers claim different tasks; the fence
 * increments on every claim so a superseded worker cannot commit.
 */
export async function claimNext({ workerId, leaseMs, now = new Date() }) {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const pick = await client.query(
      `SELECT t.id FROM hq_loop_tasks t
       WHERE t.status = 'active' AND NOT t.paused AND NOT t.revoked
         AND t.next_wake_at <= $1
         AND (t.lease_until IS NULL OR t.lease_until < $1)
         AND NOT EXISTS (
           SELECT 1 FROM hq_loop_tasks d WHERE d.id = ANY(t.dependencies) AND d.status <> 'done')
         AND (t.resource_key IS NULL OR NOT EXISTS (
           SELECT 1 FROM hq_loop_tasks o
           WHERE o.resource_key = t.resource_key AND o.id <> t.id AND o.lease_until > $1))
       ORDER BY t.priority ASC, t.next_wake_at ASC
       LIMIT 1 FOR UPDATE SKIP LOCKED`,
      [now.toISOString()]
    );
    if (!pick.rows[0]) {
      await client.query("COMMIT");
      return null;
    }
    const claimed = await client.query(
      `UPDATE hq_loop_tasks
         SET lease_owner = $2, lease_until = $3, fence = fence + 1, updated_at = $4
       WHERE id = $1 RETURNING *`,
      [pick.rows[0].id, workerId, new Date(now.getTime() + leaseMs).toISOString(), now.toISOString()]
    );
    await client.query("COMMIT");
    return mapTask(claimed.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

const PATCHABLE = {
  status: "status",
  stage: "stage",
  nextSkill: "next_skill",
  nextAction: "next_action",
  nextWakeAt: "next_wake_at",
  attempts: "attempts",
  waitingOn: "waiting_on",
  blocker: "blocker",
  review: "review",
  authority: "authority",
  refs: "refs",
};
const JSON_COLS = new Set(["review", "authority", "refs"]);

function setClause(patch, startAt) {
  const parts = [];
  const values = [];
  for (const [key, value] of Object.entries(patch)) {
    const col = PATCHABLE[key];
    if (!col) throw new Error(`Unpatchable field ${key}`);
    values.push(JSON_COLS.has(col) ? JSON.stringify(value) : value);
    parts.push(`${col} = $${startAt + values.length - 1}${JSON_COLS.has(col) ? "::jsonb" : ""}`);
  }
  return { parts, values };
}

/**
 * Commit a step's outcome only if this worker still holds the claim
 * (same fence and owner). Returns false for a stale worker; nothing is written.
 * Evidence is inserted in the same transaction, so it cannot outlive a rejected commit.
 */
export async function commitStep({ id, fence, workerId, patch, evidence = [], release = true }) {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const { parts, values } = setClause(patch, 4);
    const lease = release ? ", lease_owner = NULL, lease_until = NULL" : "";
    const result = await client.query(
      `UPDATE hq_loop_tasks SET ${[...parts, `updated_at = now()`].join(", ")}${lease}
       WHERE id = $1 AND fence = $2 AND lease_owner = $3 AND NOT revoked`,
      [id, fence, workerId, ...values]
    );
    if (result.rowCount !== 1) {
      await client.query("ROLLBACK");
      return false;
    }
    for (const item of evidence) {
      await client.query(
        `INSERT INTO hq_loop_evidence (task_id, kind, environment, label, verdict, revision, url, detail, observed_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9)`,
        [id, item.kind, item.environment, item.label, item.verdict, item.revision || null, item.url || null, JSON.stringify(item.detail || {}), item.observedAt]
      );
    }
    await client.query("COMMIT");
    return true;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/** Is this claim still ours? Used before any side effect. */
export async function stillHolds({ id, fence, workerId, now = new Date() }) {
  const result = await q(
    `SELECT paused, revoked, status FROM hq_loop_tasks WHERE id = $1 AND fence = $2 AND lease_owner = $3 AND lease_until > $4`,
    [id, fence, workerId, now.toISOString()]
  );
  const row = result.rows[0];
  if (!row) return { ok: false, reason: "lease lost" };
  if (row.revoked) return { ok: false, reason: "revoked" };
  if (row.paused) return { ok: false, reason: "paused" };
  if (row.status !== "active") return { ok: false, reason: `status ${row.status}` };
  return { ok: true };
}

/** Operator / event updates that do not need a claim (pause, resume, wake). */
export async function updateTask(id, patch, extra = {}) {
  const { parts, values } = setClause(patch, 2);
  if (extra.paused !== undefined) {
    values.push(extra.paused);
    parts.push(`paused = $${values.length + 1}`);
  }
  if (extra.revoked !== undefined) {
    values.push(extra.revoked);
    parts.push(`revoked = $${values.length + 1}`);
  }
  if (extra.resetAttempts) parts.push("attempts = 0");
  // Operator actions supersede any in-flight worker: its fenced commit will be rejected.
  if (extra.bumpFence) parts.push("fence = fence + 1", "lease_owner = NULL", "lease_until = NULL");
  const result = await q(`UPDATE hq_loop_tasks SET ${[...parts, "updated_at = now()"].join(", ")} WHERE id = $1 RETURNING *`, [id, ...values]);
  return result.rows[0] ? mapTask(result.rows[0]) : null;
}

export async function listEvidence(taskIds) {
  if (!taskIds.length) return [];
  const result = await q(
    `SELECT * FROM hq_loop_evidence WHERE task_id = ANY($1) ORDER BY observed_at DESC LIMIT 400`,
    [taskIds]
  );
  return result.rows.map((row) => ({
    id: Number(row.id),
    taskId: row.task_id,
    kind: row.kind,
    environment: row.environment,
    label: row.label,
    verdict: row.verdict,
    revision: row.revision || "",
    url: row.url || "",
    detail: row.detail || {},
    observedAt: iso(row.observed_at),
  }));
}

/** Append an audit/observation event. Returns false when dedupeKey was already seen. */
export async function recordEvent({ taskId = null, kind, actor, payload = {}, dedupeKey = null }) {
  const result = await q(
    `INSERT INTO hq_loop_events (task_id, kind, actor, dedupe_key, payload, created_at)
     VALUES ($1,$2,$3,$4,$5::jsonb,now()) ON CONFLICT (dedupe_key) DO NOTHING RETURNING id`,
    [taskId, kind, actor, dedupeKey, JSON.stringify(payload)]
  );
  return result.rowCount === 1;
}

export async function listEvents({ taskId, limit = 50 } = {}) {
  const result = taskId
    ? await q("SELECT * FROM hq_loop_events WHERE task_id = $1 ORDER BY id DESC LIMIT $2", [taskId, limit])
    : await q("SELECT * FROM hq_loop_events ORDER BY id DESC LIMIT $1", [limit]);
  return result.rows.map((row) => ({ id: Number(row.id), taskId: row.task_id, kind: row.kind, actor: row.actor, payload: row.payload, createdAt: iso(row.created_at) }));
}

// ---- side-effect receipts ---------------------------------------------------

export async function getEffect(taskId, key) {
  const result = await q("SELECT * FROM hq_loop_effects WHERE task_id = $1 AND effect_key = $2", [taskId, key]);
  return result.rows[0] ? { status: result.rows[0].status, ref: result.rows[0].ref || "" } : null;
}

export async function beginEffect(taskId, key, kind) {
  await q(
    `INSERT INTO hq_loop_effects (task_id, effect_key, kind, status, created_at) VALUES ($1,$2,$3,'pending',now())
     ON CONFLICT (task_id, effect_key) DO NOTHING`,
    [taskId, key, kind]
  );
}

export async function finishEffect(taskId, key, ref) {
  await q(`UPDATE hq_loop_effects SET status = 'done', ref = $3, done_at = now() WHERE task_id = $1 AND effect_key = $2`, [taskId, key, ref]);
}

// ---- budgets, control, workers ------------------------------------------------

/** Atomically take one unit of a daily budget. Refuses at the limit; never goes over. */
export async function consumeBudget(kind, limit, day = new Date().toISOString().slice(0, 10)) {
  const result = await q(
    `INSERT INTO hq_loop_budget (day, kind, used) VALUES ($1,$2,1)
     ON CONFLICT (day, kind) DO UPDATE SET used = hq_loop_budget.used + 1
       WHERE hq_loop_budget.used < $3
     RETURNING used`,
    [day, kind, limit]
  );
  if (result.rowCount === 1 && result.rows[0].used <= limit) return { ok: true, used: result.rows[0].used };
  const current = await q("SELECT used FROM hq_loop_budget WHERE day = $1 AND kind = $2", [day, kind]);
  return { ok: false, used: current.rows[0]?.used ?? limit };
}

export async function budgetUsage(day = new Date().toISOString().slice(0, 10)) {
  const result = await q("SELECT kind, used FROM hq_loop_budget WHERE day = $1", [day]);
  return Object.fromEntries(result.rows.map((row) => [row.kind, row.used]));
}

export async function getControl(key) {
  const result = await q("SELECT value, updated_by, updated_at FROM hq_loop_control WHERE key = $1", [key]);
  return result.rows[0] ? { value: result.rows[0].value, by: result.rows[0].updated_by, at: iso(result.rows[0].updated_at) } : null;
}

export async function setControl(key, value, by) {
  await q(
    `INSERT INTO hq_loop_control (key, value, updated_by, updated_at) VALUES ($1,$2::jsonb,$3,now())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_by = EXCLUDED.updated_by, updated_at = EXCLUDED.updated_at`,
    [key, JSON.stringify(value), by]
  );
}

export async function workerBeat({ id, host, result = null }) {
  await q(
    `INSERT INTO hq_loop_workers (id, host, started_at, last_beat_at, last_result) VALUES ($1,$2,now(),now(),$3::jsonb)
     ON CONFLICT (id) DO UPDATE SET last_beat_at = now(), last_result = COALESCE(EXCLUDED.last_result, hq_loop_workers.last_result)`,
    [id, host, result ? JSON.stringify(result) : null]
  );
}

export async function listWorkers() {
  const result = await q("SELECT * FROM hq_loop_workers ORDER BY last_beat_at DESC LIMIT 10");
  return result.rows.map((row) => ({ id: row.id, host: row.host, startedAt: iso(row.started_at), lastBeatAt: iso(row.last_beat_at), lastResult: row.last_result }));
}

/** Event wakes: a seat replied to the dispatch a task is waiting on. */
export async function wakeWaitingOn(dispatchId) {
  const result = await q(
    `UPDATE hq_loop_tasks SET next_wake_at = now(), status = CASE WHEN status = 'waiting' THEN 'active' ELSE status END, updated_at = now()
     WHERE waiting_on = $1 AND status IN ('waiting','active') RETURNING id`,
    [dispatchId]
  );
  return result.rows.map((row) => row.id);
}

/** Event wakes: GitHub activity on a repo the task references. */
export async function wakeByRepo(repo) {
  const result = await q(
    `UPDATE hq_loop_tasks SET next_wake_at = LEAST(next_wake_at, now()), updated_at = now()
     WHERE status = 'active' AND EXISTS (SELECT 1 FROM jsonb_array_elements(refs) r WHERE lower(r->>'repo') = lower($1))
     RETURNING id`,
    [repo]
  );
  return result.rows.map((row) => row.id);
}

/** Heartbeat: an active task scheduled beyond the horizon is woken now. */
export async function wakeDistant({ horizon, now = new Date() }) {
  const result = await q(
    `UPDATE hq_loop_tasks SET next_wake_at = $2, updated_at = now()
     WHERE status = 'active' AND NOT paused AND NOT revoked AND next_wake_at > $1 RETURNING id`,
    [horizon.toISOString(), now.toISOString()]
  );
  return result.rows.map((row) => row.id);
}

/**
 * Heartbeat: reactivate a blocked task whose cause has cleared. Matches the
 * exact blocker it classified, so an operator action in between wins.
 */
export async function reviveBlocked({ id, blocker, now = new Date(), nextAction }) {
  const result = await q(
    `UPDATE hq_loop_tasks
       SET status = 'active', blocker = '', attempts = 0, next_wake_at = $3, next_action = $4,
           fence = fence + 1, lease_owner = NULL, lease_until = NULL, updated_at = now()
     WHERE id = $1 AND status = 'blocked' AND blocker = $2 AND NOT paused AND NOT revoked RETURNING *`,
    [id, blocker, now.toISOString(), nextAction]
  );
  return result.rows[0] ? mapTask(result.rows[0]) : null;
}

// ---- room bridge (the loop posts as its own system seat, never as an agent) ----

/** Deterministic message id: a replayed step finds the message it already posted. */
export async function postLoopMessage({ id, body, refs = [], baton = null, kind = "baton" }) {
  const now = new Date().toISOString();
  const result = await q(
    `INSERT INTO hq_room_messages (id, channel, seat_id, kind, body, refs, verified, baton, promoted_sha, created_at, thread_id, hop)
     VALUES ($1,'room','hq',$6,$2,$3::jsonb,false,$4::jsonb,NULL,$5,$1,0)
     ON CONFLICT (id) DO NOTHING RETURNING id`,
    [id, body, JSON.stringify(refs), baton ? JSON.stringify(baton) : null, now, kind]
  );
  return { created: result.rowCount === 1 };
}

export async function roomMessageExists(id) {
  const result = await q("SELECT 1 FROM hq_room_messages WHERE id = $1", [id]);
  return result.rowCount === 1;
}

export async function insertLoopDispatch(row) {
  const result = await q(
    `INSERT INTO hq_room_dispatches
      (id, source_message_id, thread_id, seat_id, origin_seat_id, reason, adapter, status, hop, error, created_at, updated_at)
     VALUES ($1,$2,$2,$3,'hq','loop-task',$4,$5,1,$6,now(),now())
     ON CONFLICT (source_message_id, seat_id) DO NOTHING RETURNING id`,
    [row.id, row.sourceMessageId, row.seatId, row.adapter, row.status, row.error || null]
  );
  if (result.rowCount === 1) return row.id;
  const existing = await q("SELECT id FROM hq_room_dispatches WHERE source_message_id = $1 AND seat_id = $2", [row.sourceMessageId, row.seatId]);
  return existing.rows[0]?.id || null;
}

export async function getDispatch(id) {
  const result = await q("SELECT id, seat_id, status, error, reply_message_id FROM hq_room_dispatches WHERE id = $1", [id]);
  const row = result.rows[0];
  if (!row) return null;
  let reply = null;
  if (row.reply_message_id) {
    const message = await q("SELECT id, body, refs, created_at FROM hq_room_messages WHERE id = $1", [row.reply_message_id]);
    if (message.rows[0]) reply = { id: message.rows[0].id, body: message.rows[0].body, refs: message.rows[0].refs || [], createdAt: iso(message.rows[0].created_at) };
  }
  return { id: row.id, seatId: row.seat_id, status: row.status, error: row.error || "", reply };
}

export async function seatLastSeen(seatId) {
  const result = await q("SELECT last_seen_at FROM hq_room_seats WHERE id = $1", [seatId]);
  return iso(result.rows[0]?.last_seen_at);
}
