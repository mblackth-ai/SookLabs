"use client";

import { useCallback, useEffect, useState } from "react";

// Acceptance & Sources: the four fronts, their canonical sources, and every
// loop task with owner, authority, acceptance, stage, evidence, blocker and
// next action. Everything shown is read from /hq/api/room/loop/board; when the
// read fails or the loop is not installed, the panel says so.

const STAGES = [
  ["queued", "Queued"],
  ["working", "Working"],
  ["tested", "Tested"],
  ["reviewed", "Reviewed"],
  ["merged", "Merged"],
  ["deployed", "Deployed"],
  ["production_accepted", "Production accepted"],
];
const REFRESH_MS = 30000;
const AGENT_SEATS = ["claude", "cursor", "codex", "grok", "gemini", "chatgpt"];

function ago(iso) {
  const t = Date.parse(iso || "");
  if (!Number.isFinite(t)) return "never";
  const s = Math.max(0, Math.round((Date.now() - t) / 1000));
  if (s < 90) return `${s}s ago`;
  if (s < 5400) return `${Math.round(s / 60)} min ago`;
  if (s < 172800) return `${Math.round(s / 3600)} h ago`;
  return `${Math.round(s / 86400)} d ago`;
}

function key() {
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

export function AcceptancePanel({ connectionToken, opened, isOperator }) {
  const [board, setBoard] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ front: "hq-mcp", title: "", deliverable: "", acceptanceTest: "", environment: "production", ownerSeat: "claude", smokeUrl: "", smokeText: "", refs: "" });

  const headers = useCallback(() => {
    const h = { accept: "application/json" };
    if (connectionToken) h["x-hq-room-connection"] = connectionToken;
    return h;
  }, [connectionToken]);

  const load = useCallback(async () => {
    const res = await fetch("/hq/api/room/loop/board", { headers: headers(), cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      setError(data.error || "Execution state could not be read.");
      return;
    }
    setBoard(data);
    setError("");
  }, [headers]);

  useEffect(() => {
    if (!opened) return undefined;
    let cancelled = false;
    let timer;
    const run = async () => {
      if (!cancelled && document.visibilityState === "visible") await load().catch(() => setError("Execution state could not be read."));
      if (!cancelled) timer = setTimeout(run, REFRESH_MS);
    };
    run();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [opened, load]);

  async function post(url, body) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(url, { method: "POST", headers: { ...headers(), "content-type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "That did not save.");
      await load();
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setBusy(false);
    }
  }

  const control = (id, action) => post(`/hq/api/room/loop/tasks/${encodeURIComponent(id)}/control`, { action, idempotencyKey: key() });

  async function submitTask(event) {
    event.preventDefault();
    const refs = form.refs
      .split(/[\s,]+/)
      .map((text) => text.match(/([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)#(\d+)/))
      .filter(Boolean)
      .map((m) => ({ repo: m[1], pr: Number(m[2]) }));
    const saved = await post("/hq/api/room/loop/tasks", { ...form, refs });
    if (saved) setForm((f) => ({ ...f, title: "", deliverable: "", acceptanceTest: "", smokeUrl: "", smokeText: "", refs: "" }));
  }

  if (!opened) {
    return (
      <section className="hq-cc-card hq-ap" aria-label="Acceptance and sources">
        <h2>Acceptance &amp; Sources</h2>
        <p className="hq-cc-muted">Loads with the room.</p>
      </section>
    );
  }

  const worker = board?.worker;
  const loopState = !board
    ? error
      ? "unavailable"
      : "loading"
    : !board.installed
      ? "not installed"
      : board.paused
        ? "paused"
        : worker?.health === "ok"
          ? "worker ok"
          : worker?.health === "stale"
            ? "worker stale"
            : "worker never ran";

  return (
    <section className="hq-cc-card hq-ap" aria-label="Acceptance and sources">
      <header className="hq-cc-cardhead">
        <div>
          <h2>Acceptance &amp; Sources</h2>
          <p className="hq-cc-muted">Policy {board?.policyVersion || "—"} · refreshed every 30 s</p>
        </div>
        <span className={`hq-cc-pill hq-ap-state hq-ap-state--${loopState.replace(/\s+/g, "-")}`}>{loopState}</span>
      </header>

      {error ? (
        <p className="hq-room-error" role="alert">
          {error}
        </p>
      ) : null}
      {board && !board.installed ? <p className="hq-cc-note">{board.note}</p> : null}
      {board && !board.installed && isOperator ? (
        <button type="button" className="hq-cc-btn" disabled={busy} onClick={() => post("/hq/api/room/loop/install", {})}>
          Install loop tables
        </button>
      ) : null}

      {board?.installed ? (
        <dl className="hq-ap-health">
          <div>
            <dt>Last tick</dt>
            <dd title={worker?.lastWorker || ""}>{ago(worker?.lastBeatAt)}</dd>
          </div>
          <div>
            <dt>Dispatches today</dt>
            <dd>
              {board.budget.dispatch.used}/{board.budget.dispatch.limit}
            </dd>
          </div>
          <div>
            <dt>GitHub reads today</dt>
            <dd>
              {board.budget.githubRead.used}/{board.budget.githubRead.limit}
            </dd>
          </div>
        </dl>
      ) : null}

      {isOperator && board?.installed ? (
        <div className="hq-cc-actions">
          <button type="button" className="hq-cc-btn" disabled={busy} onClick={() => post("/hq/api/room/loop/control", { action: board.paused ? "resume-all" : "pause-all", idempotencyKey: key() })}>
            {board.paused ? "Resume loop" : "Pause loop"}
          </button>
          <button type="button" className="hq-cc-btn hq-cc-btn--quiet" disabled={busy} onClick={() => post("/hq/api/room/loop/seed", {})}>
            Load ops board items
          </button>
        </div>
      ) : null}

      {(board?.fronts || []).map((front) => (
        <article key={front.id} className="hq-ap-front">
          <header>
            <h3>{front.name}</h3>
            <p className="hq-cc-muted">{front.goal}</p>
          </header>
          <ul className="hq-ap-sources" aria-label={`${front.name} canonical sources`}>
            {front.sources.map((src) => (
              <li key={src.path}>
                <span className="hq-ap-role">{src.role}</span>
                <a href={src.url} title={`${src.repo}/${src.path}`}>
                  {src.path.split("/").pop()}
                </a>
                <span className={`hq-ap-src hq-ap-src--${src.status === "resolved" ? "ok" : src.status === "unchecked" ? "idle" : "bad"}`}>
                  {src.status === "resolved" ? src.sha.slice(0, 7) : src.status}
                </span>
              </li>
            ))}
          </ul>
          {board.installed && front.tasks.length === 0 ? <p className="hq-cc-muted">No loop task on this front yet.</p> : null}
          {front.tasks.map((task) => {
            const reached = STAGES.findIndex(([id]) => id === task.stage);
            return (
              <div key={task.id} className={`hq-ap-task hq-ap-task--${task.status}`}>
                <div className="hq-ap-taskhead">
                  <strong>{task.title}</strong>
                  <span className={`hq-ap-status hq-ap-status--${task.status}`}>{task.paused ? "paused" : task.status}</span>
                </div>
                <ol className="hq-ap-stages" aria-label="Stage">
                  {STAGES.map(([id, label], index) => (
                    <li key={id} className={index <= reached ? "hq-ap-stage--done" : ""} aria-current={index === reached ? "step" : undefined}>
                      {label}
                    </li>
                  ))}
                </ol>
                <dl className="hq-cc-facts">
                  <dt>Owner</dt>
                  <dd>{task.ownerSeat || "unassigned"}</dd>
                  <dt>Deliverable</dt>
                  <dd>{task.deliverable}</dd>
                  <dt>Authority</dt>
                  <dd>
                    {task.authority?.approvedBy || "—"} · {task.authority?.approvalRef || "—"}
                  </dd>
                  <dt>Acceptance</dt>
                  <dd>
                    {task.acceptance?.test || "—"}
                    {task.acceptance?.environment ? ` (${task.acceptance.environment})` : ""}
                    {task.acceptance?.smoke?.url ? ` · smoke ${task.acceptance.smoke.url}` : " · no production smoke defined"}
                  </dd>
                  <dt>Next</dt>
                  <dd>{task.nextAction || "—"}</dd>
                  {task.blocker ? (
                    <>
                      <dt>Blocker</dt>
                      <dd className="hq-ap-blocker">{task.blocker}</dd>
                    </>
                  ) : null}
                  <dt>Updated</dt>
                  <dd>{ago(task.updatedAt)}</dd>
                </dl>
                {task.evidence?.length ? (
                  <ul className="hq-ap-evidence" aria-label="Evidence">
                    {task.evidence.slice(0, 4).map((ev) => (
                      <li key={ev.id} className={`hq-ap-ev hq-ap-ev--${ev.verdict}`}>
                        {ev.url ? <a href={ev.url}>{ev.label}</a> : ev.label}
                        <span className="hq-cc-muted">
                          {" "}
                          · {ev.environment}
                          {ev.revision ? ` · ${ev.revision.slice(0, 7)}` : ""} · {ago(ev.observedAt)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="hq-cc-muted">No evidence yet.</p>
                )}
                {isOperator ? (
                  <div className="hq-cc-actions">
                    {task.status === "proposed" ? (
                      <button type="button" className="hq-cc-btn" disabled={busy} onClick={() => control(task.id, "approve")}>
                        Approve proposal
                      </button>
                    ) : null}
                    <button type="button" className="hq-cc-btn" disabled={busy} onClick={() => control(task.id, task.paused ? "resume" : "pause")}>
                      {task.paused ? "Resume" : "Pause"}
                    </button>
                    {task.status === "blocked" ? (
                      <button type="button" className="hq-cc-btn" disabled={busy} onClick={() => control(task.id, "retry")}>
                        Retry
                      </button>
                    ) : null}
                    {!["done", "cancelled"].includes(task.status) ? (
                      <button type="button" className="hq-cc-btn hq-cc-btn--quiet" disabled={busy} onClick={() => control(task.id, "cancel")}>
                        Cancel
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </article>
      ))}

      {board?.installed ? (
        <details className="hq-ap-new">
          <summary>{isOperator ? "New task" : "Propose a task"}</summary>
          <form className="hq-cc-composer hq-ap-form" onSubmit={submitTask}>
            <div className="hq-cc-fields">
              <label>
                Front
                <select value={form.front} onChange={(e) => setForm({ ...form, front: e.target.value })}>
                  {(board.fronts || []).map((front) => (
                    <option key={front.id} value={front.id}>
                      {front.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Owner seat
                <select value={form.ownerSeat} onChange={(e) => setForm({ ...form, ownerSeat: e.target.value })}>
                  {AGENT_SEATS.map((seat) => (
                    <option key={seat} value={seat}>
                      {seat}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              Title
              <input value={form.title} maxLength={200} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </label>
            <label>
              Deliverable
              <input value={form.deliverable} maxLength={500} onChange={(e) => setForm({ ...form, deliverable: e.target.value })} />
            </label>
            <label>
              Acceptance test
              <input value={form.acceptanceTest} maxLength={500} onChange={(e) => setForm({ ...form, acceptanceTest: e.target.value })} />
            </label>
            <div className="hq-cc-fields">
              <label>
                Environment
                <input value={form.environment} maxLength={80} onChange={(e) => setForm({ ...form, environment: e.target.value })} />
              </label>
              <label>
                Refs (owner/repo#pr)
                <input value={form.refs} onChange={(e) => setForm({ ...form, refs: e.target.value })} placeholder="mblackth-ai/SookLabs#19" />
              </label>
              <label>
                Production smoke URL
                <input value={form.smokeUrl} onChange={(e) => setForm({ ...form, smokeUrl: e.target.value })} placeholder="https://hq.sooklabs.com/room" />
              </label>
              <label>
                Smoke expects text
                <input value={form.smokeText} onChange={(e) => setForm({ ...form, smokeText: e.target.value })} />
              </label>
            </div>
            <button type="submit" className="hq-cc-btn hq-cc-btn--on" disabled={busy || !form.title.trim() || !form.deliverable.trim() || !form.acceptanceTest.trim()}>
              {isOperator ? "Add to the board" : "Send proposal"}
            </button>
          </form>
        </details>
      ) : null}
    </section>
  );
}
