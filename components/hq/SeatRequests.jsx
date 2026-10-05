"use client";

import { useCallback, useEffect, useState } from "react";

// Join requests for approvers. Shows seat, client and expiry from
// /hq/api/room/enroll; never a key. Mark sees each pending request's code and
// accepts only if it matches the code the agent shows him in its own chat
// (numeric comparison, like Bluetooth pairing). Delegated approvers don't see
// codes: they type the code the agent's operator gives them directly.

const REFRESH_MS = 20000;

function until(iso) {
  const ms = Date.parse(iso || "") - Date.now();
  if (!Number.isFinite(ms)) return "";
  if (ms <= 0) return "expired";
  return `${Math.ceil(ms / 60000)} min left`;
}

export function SeatRequests({ connectionToken, opened, seat, onPending }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [codes, setCodes] = useState({});
  const [busy, setBusy] = useState("");
  const [note, setNote] = useState("");

  const headers = useCallback(() => {
    const h = { accept: "application/json", "content-type": "application/json" };
    if (connectionToken) h["x-hq-room-connection"] = connectionToken;
    return h;
  }, [connectionToken]);

  const load = useCallback(async () => {
    const res = await fetch("/hq/api/room/enroll", { headers: headers(), cache: "no-store" });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.ok) {
      setData(null);
      setError(body.error || "Key requests could not be read.");
      return;
    }
    setData(body);
    setError("");
  }, [headers]);

  useEffect(() => {
    if (!opened || !connectionToken) return undefined;
    let cancelled = false;
    let timer;
    const run = async () => {
      if (!cancelled && document.visibilityState === "visible") await load().catch(() => setError("Key requests could not be read."));
      if (!cancelled) timer = setTimeout(run, REFRESH_MS);
    };
    run();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [opened, connectionToken, load]);

  async function decide(id, action, code = codes[id] || "") {
    setBusy(id);
    setNote("");
    const res = await fetch(`/hq/api/room/enroll/${id}/decide`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ seat, action, code }),
    });
    const body = await res.json().catch(() => ({}));
    setBusy("");
    if (!res.ok || !body.ok) {
      setNote(body.error || "That did not go through.");
      return;
    }
    setNote(`${body.request.seat}: ${body.request.status}.`);
    setCodes((prev) => ({ ...prev, [id]: "" }));
    load();
  }

  async function post(path, payload, done) {
    setBusy(path);
    setNote("");
    const res = await fetch(path, { method: "POST", headers: headers(), body: JSON.stringify({ seat, ...payload }) });
    const body = await res.json().catch(() => ({}));
    setBusy("");
    if (!res.ok || !body.ok) {
      setNote(body.error || "That did not go through.");
      return;
    }
    setNote(done(body));
    load();
  }

  const pendingCount = (data?.requests || []).filter((row) => row.status === "pending").length;
  useEffect(() => {
    onPending?.(pendingCount);
  }, [pendingCount, onPending]);

  if (!opened) return null;
  const isMark = seat === "mark";
  const grokApproves = (data?.approvers || []).includes("grok");
  const pending = (data?.requests || []).filter((row) => row.status === "pending");
  const active = (data?.requests || []).filter((row) => row.status === "active");

  return (
    <section className="hq-cc-card hq-sr" aria-label="Seat key requests">
      <header className="hq-cc-cardhead">
        <div>
          <h2>Seat key requests</h2>
          <p className="hq-cc-muted">An agent runs scripts/hq-seat-enroll.mjs; you enter the pairing code it shows its operator.</p>
        </div>
        <span className="hq-cc-pill">{pending.length} pending</span>
      </header>
      {error ? <p className="hq-cc-note">{error}</p> : null}
      {note ? (
        <p className="hq-cc-note" role="status">
          {note}
        </p>
      ) : null}
      {data?.installed === false ? (
        <div className="hq-sr-install">
          <p className="hq-cc-note">Join requests are not switched on (or need a one-column update). This only adds to the HQ database and changes nothing else.</p>
          {isMark ? (
            <button type="button" className="hq-cc-btn" disabled={Boolean(busy)} onClick={() => post("/hq/api/room/enroll/install", {}, (b) => (b.created ? "Seat key requests are on." : "Already on."))}>
              Switch on seat key requests
            </button>
          ) : null}
        </div>
      ) : null}
      {data?.installed && isMark ? (
        <label className="hq-sr-delegate">
          <input
            type="checkbox"
            checked={grokApproves}
            disabled={Boolean(busy)}
            onChange={(event) =>
              post("/hq/api/room/enroll/approvers", { approvers: event.target.checked ? ["grok"] : [] }, (b) => `Approvers: ${b.approvers.join(", ")}.`)
            }
          />
          Let Grok (Chief of Staff) approve key requests
        </label>
      ) : null}
      {data?.installed && !pending.length ? <p className="hq-cc-muted">No pending requests.</p> : null}
      <ul className="hq-sr-list">
        {pending.map((row) => (
          <li key={row.id} className="hq-sr-row">
            <div className="hq-sr-who">
              <strong>{row.seat}</strong>
              <span className="hq-cc-muted">
                {row.client || "unnamed client"} · {until(row.expiresAt)}
                {row.attempts ? ` · ${row.attempts} wrong code${row.attempts === 1 ? "" : "s"}` : ""}
              </span>
            </div>
            {row.pairingCode ? (
              <>
                <p className="hq-sr-ask">
                  <strong>{row.seat}</strong> wants to join. Does {row.seat}&apos;s chat show this exact code?
                </p>
                <p className="hq-sr-bigcode" aria-label="Pairing code">
                  {row.pairingCode}
                </p>
                <div className="hq-sr-actions">
                  <button type="button" className="hq-cc-btn" disabled={busy === row.id} onClick={() => decide(row.id, "approve", row.pairingCode)}>
                    Yes, accept
                  </button>
                  <button type="button" className="hq-cc-btn hq-cc-btn--quiet" disabled={busy === row.id} onClick={() => decide(row.id, "deny", row.pairingCode)}>
                    No, deny
                  </button>
                </div>
              </>
            ) : (
              <>
            <label className="hq-sr-code">
              Pairing code
              <input
                value={codes[row.id] || ""}
                onChange={(event) => setCodes((prev) => ({ ...prev, [row.id]: event.target.value }))}
                placeholder="XXXX-XXXX"
                autoComplete="off"
                spellCheck={false}
                maxLength={12}
              />
            </label>
            <div className="hq-sr-actions">
              <button type="button" className="hq-cc-btn" disabled={busy === row.id || !(codes[row.id] || "").trim()} onClick={() => decide(row.id, "approve")}>
                Approve
              </button>
              <button type="button" className="hq-cc-btn hq-cc-btn--quiet" disabled={busy === row.id || !(codes[row.id] || "").trim()} onClick={() => decide(row.id, "deny")}>
                Deny
              </button>
            </div>
              </>
            )}
          </li>
        ))}
      </ul>
      {active.length ? (
        <p className="hq-cc-muted">
          Active self-enrolled keys: {active.map((row) => `${row.seat} (approved by ${row.decidedBy})`).join(", ")}
        </p>
      ) : null}
    </section>
  );
}
