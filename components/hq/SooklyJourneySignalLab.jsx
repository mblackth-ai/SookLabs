"use client";

import { useState } from "react";

const SAMPLE_EMAIL = {
  source: "email",
  caseId: "case-rdusa-003",
  currentStageId: "inquiry",
  payload: {
    direction: "inbound",
    subject: "Quote for 12 display stands",
    body: "Need pricing and delivery to Dallas.",
  },
};

const SAMPLE_QUO = {
  source: "quo",
  caseId: "case-rdusa-002",
  currentStageId: "delivery_confirm",
  payload: {
    type: "call.transcript.completed",
    data: {
      callId: "call_demo",
      summary: "Customer said two cartons were damaged",
      context: { contacts: { ids: ["ct_demo"] } },
    },
  },
};

export function SooklyJourneySignalLab() {
  const [raw, setRaw] = useState(JSON.stringify(SAMPLE_EMAIL, null, 2));
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function runDryRun() {
    setError("");
    setResult(null);
    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      setError("Invalid JSON.");
      return;
    }
    try {
      const res = await fetch("/hq/api/sookly/journey/signals", {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Ingest failed.");
      setResult(data);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="hq-cc-card hq-sj-lab">
      <h3 className="hq-card-title">Signal ingest lab (dry-run)</h3>
      <p className="hq-cc-muted">Tests the same router the app will use — nothing is saved.</p>
      <div className="hq-sj-lab-actions">
        <button type="button" className="hq-cc-btn hq-cc-btn--quiet" onClick={() => setRaw(JSON.stringify(SAMPLE_EMAIL, null, 2))}>
          Load email sample
        </button>
        <button type="button" className="hq-cc-btn hq-cc-btn--quiet" onClick={() => setRaw(JSON.stringify(SAMPLE_QUO, null, 2))}>
          Load Quo sample
        </button>
        <button type="button" className="hq-cc-btn" onClick={runDryRun}>
          Run ingest
        </button>
      </div>
      <textarea className="hq-sj-lab-json" value={raw} onChange={(e) => setRaw(e.target.value)} rows={12} spellCheck={false} />
      {error ? (
        <p className="hq-room-error" role="alert">
          {error}
        </p>
      ) : null}
      {result ? (
        <pre className="hq-sj-lab-out">{JSON.stringify(result.transition, null, 2)}</pre>
      ) : null}
    </section>
  );
}
