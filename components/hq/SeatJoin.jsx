"use client";

import { useState } from "react";
import { ago, inviteFor, linkMessage } from "@/components/hq/SeatSetup";

// Opened from a seat's blocker card: a one-time join link for that seat (Mark
// only; same link as Seat setup), the prompt to paste into the LLM, Done
// (invite sent) and Refresh. The status lines come from the room's read model
// (seat strip, dispatches, messages). Without a link, the prompt points at the
// public guide. Nothing here holds a key; "invite sent" is kept in this browser only.

const INVITED_PREFIX = "hq-room-invited:";
function readInvited(seatId) {
  try {
    return window.localStorage.getItem(INVITED_PREFIX + seatId) || "";
  } catch {
    return "";
  }
}
function writeInvited(seatId, value) {
  try {
    if (value) window.localStorage.setItem(INVITED_PREFIX + seatId, value);
    else window.localStorage.removeItem(INVITED_PREFIX + seatId);
  } catch {
    // Private mode: the note just isn't kept.
  }
}

function availability(row) {
  if (!row) return "Not loaded yet.";
  if (row.adapter === "none" || String(row.missing || "").startsWith("HQ_SEAT_ADAPTER_")) return "Not connected. It gets no dispatches.";
  if (!row.ready) return `Connected, but ${row.missing} is not set yet, so it can't answer.`;
  if (row.adapter === "pull") {
    if (!row.lastSeenAt) return "Key is set. It hasn't checked in yet.";
    return row.online ? "Available: checked in recently." : "Key is set, but it hasn't checked in lately.";
  }
  return `Available through the ${row.adapter} adapter.`;
}

export function SeatJoin({ row, callsign, stateLabel, latestDispatch, lastPost, onRefresh, onLink, busy }) {
  const seatId = row?.seatId;
  const [copied, setCopied] = useState("");
  const [invitedAt, setInvitedAt] = useState(() => readInvited(seatId));
  const [refreshing, setRefreshing] = useState(false);
  const [refreshedAt, setRefreshedAt] = useState("");
  const [refreshError, setRefreshError] = useState("");
  const [link, setLink] = useState(null);
  const [linkError, setLinkError] = useState("");
  const prompt = link ? linkMessage(seatId, link.url) : inviteFor(seatId);

  async function makeLink() {
    setLinkError("");
    try {
      setLink(await onLink(seatId));
      setCopied("");
    } catch (err) {
      setLinkError(err?.message || "The link could not be made.");
    }
  }

  async function copy(what, text) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
    } catch {
      setCopied(`fail:${what}`);
    }
  }

  async function refresh() {
    setRefreshing(true);
    setRefreshError("");
    try {
      await onRefresh();
      setRefreshedAt(new Date().toISOString());
    } catch (err) {
      setRefreshError(err?.message || "Could not refresh.");
    } finally {
      setRefreshing(false);
    }
  }

  function done() {
    const now = new Date().toISOString();
    writeInvited(seatId, now);
    setInvitedAt(now);
    refresh();
  }

  function clearInvite() {
    writeInvited(seatId, "");
    setInvitedAt("");
  }

  return (
    <div className="hq-sj" aria-label={`Join ${callsign}`}>
      {onLink ? (
        <div className="hq-sj-step">
          <span className="hq-cc-muted">1. One-time join link for {callsign} (one use, 30 minutes; a new one replaces the old)</span>
          {link ? (
            <>
              <a className="hq-sj-link" href={link.url} target="_blank" rel="noreferrer">
                {link.url.replace("https://", "")}
              </a>
              <span className="hq-cc-muted">expires {new Date(link.expiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </>
          ) : null}
          <button type="button" className={`hq-cc-btn${link ? " hq-cc-btn--quiet" : ""}`} disabled={busy} onClick={makeLink}>
            {link ? "New link" : "Generate one-time link"}
          </button>
          {linkError ? <span className="hq-room-error" role="alert">{linkError}</span> : null}
        </div>
      ) : null}
      <div className="hq-sj-step">
        <span className="hq-cc-muted">
          {onLink ? "2. " : ""}Paste this prompt into {callsign}
          {link ? "" : onLink ? " (no link yet: it points at the public guide)" : ""}
        </span>
        <button type="button" className="hq-cc-btn" onClick={() => copy("prompt", prompt)}>
          {copied === "prompt" ? "Prompt copied" : "Copy prompt"}
        </button>
        {copied.startsWith("fail:") ? (
          <textarea className="hq-ss-invite" readOnly rows={4} value={prompt} onFocus={(event) => event.target.select()} />
        ) : null}
      </div>
      <div className="hq-sj-actions">
        <button type="button" className="hq-cc-btn" onClick={done}>
          {invitedAt ? "Done ✓" : "Done"}
        </button>
        <button type="button" className="hq-cc-btn hq-cc-btn--quiet" disabled={refreshing} onClick={refresh}>
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
        {invitedAt ? (
          <button type="button" className="hq-cc-btn hq-cc-btn--quiet" onClick={clearInvite}>
            Clear
          </button>
        ) : null}
      </div>
      <dl className="hq-sj-status" aria-live="polite">
        <dt>Now</dt>
        <dd>
          <strong>{stateLabel}</strong> · {availability(row)}
        </dd>
        <dt>Last seen</dt>
        <dd>{row?.lastSeenAt ? ago(row.lastSeenAt) : "never"}</dd>
        <dt>Last dispatch</dt>
        <dd>{latestDispatch ? `${latestDispatch.status} · ${ago(latestDispatch.updatedAt || latestDispatch.createdAt)}` : "none yet"}</dd>
        <dt>Last post</dt>
        <dd>{lastPost ? `${ago(lastPost.createdAt)}: ${String(lastPost.body || "").slice(0, 120)}` : "none yet"}</dd>
        {invitedAt ? (
          <>
            <dt>Invite</dt>
            <dd>
              sent {ago(invitedAt)}
              {row?.lastSeenAt && Date.parse(row.lastSeenAt) >= Date.parse(invitedAt) ? " · it has checked in since" : " · waiting for it to check in"}
            </dd>
          </>
        ) : null}
      </dl>
      {refreshError ? <p className="hq-cc-muted" role="alert">{refreshError}</p> : null}
      {refreshedAt ? <p className="hq-cc-muted">Refreshed {ago(refreshedAt)}. The room also refreshes itself every few seconds.</p> : null}
    </div>
  );
}
