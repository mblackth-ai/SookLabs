"use client";

import { useEffect, useMemo, useState } from "react";
import { suggestedActionForCase } from "@/lib/sookly/journey-model";

export function SooklyJourneyKanban() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/hq/api/sookly/journey", { headers: { accept: "application/json" }, cache: "no-store" })
      .then((res) => res.json())
      .then((body) => {
        if (cancelled) return;
        if (!body.ok) throw new Error(body.error || "Could not load journey.");
        setData(body);
        setError("");
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const byStage = useMemo(() => {
    const map = new Map();
    for (const col of data?.columns || []) map.set(col.id, []);
    for (const row of data?.cases || []) {
      if (!map.has(row.stageId)) map.set(row.stageId, []);
      map.get(row.stageId).push(row);
    }
    return map;
  }, [data]);

  if (error) {
    return (
      <p className="hq-room-error" role="alert">
        {error}
      </p>
    );
  }
  if (!data) return <p className="hq-cc-muted">Loading journey…</p>;

  return (
    <div className="hq-sj">
      {data.checkpoint ? (
        <div className="hq-sj-checkpoint" role="status">
          <strong>Journey checkpoint: {data.checkpoint.percent}%</strong>
          <span className="hq-cc-muted">
            Current: {data.checkpoint.currentCheckpointLabel} — next: {data.checkpoint.nextMainCheckpoint}
          </span>
          <div className="hq-sj-checkpoint-bar" aria-hidden="true">
            <div className="hq-sj-checkpoint-fill" style={{ width: `${data.checkpoint.percent}%` }} />
          </div>
        </div>
      ) : null}
      <p className="hq-cc-muted">{data.honest?.message}</p>
      <div className="hq-sj-board" role="region" aria-label="Journey kanban">
        {(data.columns || []).map((col) => (
          <section key={col.id} className="hq-sj-col">
            <header className="hq-sj-colhead">
              <h3>{col.label}</h3>
              <span className="hq-cc-pill">{col.automationTier}</span>
            </header>
            <ul className="hq-sj-cards">
              {(byStage.get(col.id) || []).map((card) => (
                <li key={card.id}>
                  <button type="button" className="hq-sj-card" onClick={() => setSelected(card)}>
                    <strong>{card.contact}</strong>
                    <span className="hq-cc-muted">{card.channel}</span>
                    {card.blocker ? <span className="hq-sj-blocker">{card.blocker}</span> : null}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      {data.actionsDue?.length ? (
        <section className="hq-cc-card" style={{ marginTop: 16 }}>
          <h3 className="hq-card-title">Suggested next actions</h3>
          <ul className="hq-ss-list">
            {data.actionsDue.map((row) => (
              <li key={row.caseId} className="hq-ss-row">
                <strong>{row.contact}</strong>
                <span className="hq-cc-pill">{row.tier}</span>
                {row.supplierLoopActive ? <span className="hq-cc-pill">Supplier loop</span> : null}
                <p className="hq-cc-muted" style={{ margin: 0 }}>
                  {row.action}
                </p>
                {row.xero ? (
                  <p className="hq-cc-muted" style={{ margin: "4px 0 0" }}>
                    Xero: {row.xero.suggest}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <section className="hq-cc-card" style={{ marginTop: 16 }}>
        <h3 className="hq-card-title">Integrations</h3>
        <ul className="hq-ss-list">
          {(data.integrations || []).map((row) => (
            <li key={row.id} className="hq-ss-row">
              <strong>{row.label}</strong>
              <span className="hq-cc-muted">{row.statusLabel}</span>
              <p className="hq-cc-muted" style={{ margin: 0 }}>
                {row.hqNote}
              </p>
            </li>
          ))}
        </ul>
      </section>
      {data.signalRoutingExamples?.length ? (
        <section className="hq-cc-card" style={{ marginTop: 16 }}>
          <h3 className="hq-card-title">Signal routing (pilot logic)</h3>
          <p className="hq-cc-muted">Email, Quo, and calendar events map to stages before live app ingestion.</p>
          <ul className="hq-ss-list">
            {data.signalRoutingExamples.map((ex) => (
              <li key={ex.label} className="hq-ss-row">
                <strong>{ex.label}</strong>
                <p className="hq-cc-muted" style={{ margin: 0 }}>
                  → {ex.transition.suggestedStageId}: {ex.transition.reason}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {selected ? (
        <aside className="hq-cc-card hq-sj-detail" aria-live="polite">
          <h3>{selected.contact}</h3>
          <p className="hq-cc-muted">Stage: {selected.stage?.label || selected.stageId}</p>
          <p>{suggestedActionForCase(selected).action}</p>
          {selected.guidance?.xero ? (
            <p className="hq-cc-muted">
              Xero: {selected.guidance.xero.suggest} — {selected.guidance.xero.when}
            </p>
          ) : null}
          <button type="button" className="hq-cc-btn hq-cc-btn--quiet" onClick={() => setSelected(null)}>
            Close
          </button>
        </aside>
      ) : null}
    </div>
  );
}
