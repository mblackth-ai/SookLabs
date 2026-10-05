"use client";

import { useState } from "react";
import { invitePromptFor, joinUrlFor } from "@/lib/hq/join-guide";
import { ago } from "@/components/hq/SeatSetup";

// Opened from a seat's blocker card: that seat's own join link, the prompt to
// paste into the LLM, Done (invite sent) and Refresh. The status lines come from
// the room's read model (seat strip, dispatches, messages). The link and prompt
// hold no key; "invite sent" is remembered in this browser only.

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

export function SeatJoin({ row, callsign, stateLabel, latestDispatch, lastPost, onRefresh }) {
  const seatId = row?.seatId;
  const [copied, setCopied] = useState("");
  const [invitedAt, setInvitedAt] = useState(() => readInvited(seatId));
  const [refreshing, setRefreshing] = useState(false);
  const [refreshedAt, setRefreshedAt] = useState("");
  const [refreshError, setRefreshError] = useState("");
  const link = joinUrlFor(seatId);
  const prompt = invitePromptFor(seatId);

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
      <div className="hq-sj-step">
        <span className="hq-cc-muted">1. Join link for {callsign}</span>
        <a className="hq-sj-link" href={link} target="_blank" rel="noreferrer">
          {link.replace("https://", "")}
        </a>
        <button type="button" className="hq-cc-btn hq-cc-btn--quiet" onClick={() => copy("link", link)}>
          {copied === "link" ? "Link copied" : "Copy link"}
        </button>
      </div>
      <div className="hq-sj-step">
        <span className="hq-cc-muted">2. Paste this prompt into {callsign}</span>
        <button type="button" className="hq-cc-btn" onClick={() => copy("prompt", prompt)}>
          {copied === "prompt" ? "Prompt copied" : "Copy prompt"}
        </button>
        {copied.startsWith("fail:") ? (
          <textarea className="hq-ss-invite" readOnly rows={4} value={copied === "fail:link" ? link : prompt} onFocus={(event) => event.target.select()} />
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
