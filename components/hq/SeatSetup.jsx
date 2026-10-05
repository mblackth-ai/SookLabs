"use client";

import { useState } from "react";

// Per-seat enrollment flow for Mark: each agent seat with its four steps and
// the one next action. Everything shown comes from the room's own read model
// (seat strip, messages, dispatches); nothing here is a guess.

const JOIN_URL = "https://hq.sooklabs.com/hq/join";
const API_ROUTE = { grok: "xai + XAI_API_KEY", chatgpt: "openai + OPENAI_API_KEY", claude: "anthropic + ANTHROPIC_API_KEY" };

function ago(iso) {
  const t = Date.parse(iso || "");
  if (!Number.isFinite(t)) return "";
  const s = Math.max(0, Math.round((Date.now() - t) / 1000));
  if (s < 90) return `${s}s ago`;
  if (s < 5400) return `${Math.round(s / 60)} min ago`;
  if (s < 172800) return `${Math.round(s / 3600)} h ago`;
  return `${Math.round(s / 86400)} d ago`;
}

export function inviteFor(seatId) {
  return `Read ${JOIN_URL} and join the SookLabs HQ room as the "${seatId}" seat. Your key is (or will be) in the HQ_ROOM_CONNECTION environment variable; never print it. Then answer my roll call.`;
}

export function linkMessage(seatId, url) {
  return `Join the SookLabs HQ room as the "${seatId}" seat with this one-time link. Open it first for instructions (opening does not use it up), then join exactly as it says, never print your key, and answer my roll call: ${url}`;
}

export function seatSteps(row, rollCall) {
  const connected = row.adapter !== "none" && !String(row.missing || "").startsWith("HQ_SEAT_ADAPTER_");
  const keyed = connected && row.ready;
  const pull = row.adapter === "pull";
  const checkedIn = keyed && (!pull || Boolean(row.lastSeenAt));
  const answered = rollCall?.status === "responded";
  let next = "";
  if (!connected) next = "connect";
  else if (!keyed) next = pull ? "key" : "provider";
  else if (!checkedIn) next = "checkin";
  else if (!rollCall) next = "rollcall";
  else if (!answered) next = "answer";
  return { connected, keyed, checkedIn, answered, next };
}

export function SeatSetup({ strip, messages, dispatches, onConnect, onLink, busy }) {
  const [copied, setCopied] = useState("");
  const [links, setLinks] = useState({});
  const [linkError, setLinkError] = useState("");

  async function makeLink(seatId) {
    setLinkError("");
    try {
      const link = await onLink(seatId);
      setLinks((prev) => ({ ...prev, [seatId]: link }));
    } catch (err) {
      setLinkError(err.message);
    }
  }

  async function copyLink(seatId) {
    const link = links[seatId];
    try {
      await navigator.clipboard.writeText(linkMessage(seatId, link.url));
      setCopied(`link:${seatId}`);
    } catch {
      setCopied(`linkfail:${seatId}`);
    }
  }
  const lastCall = [...messages].reverse().find((message) => message.seatId === "mark" && dispatches.some((row) => row.sourceMessageId === message.id));

  async function copy(seatId) {
    try {
      await navigator.clipboard.writeText(inviteFor(seatId));
      setCopied(seatId);
    } catch {
      setCopied(`fail:${seatId}`);
    }
  }

  if (!strip.length) return null;
  const done = strip.filter((row) => seatSteps(row, dispatches.find((d) => d.sourceMessageId === lastCall?.id && d.seatId === row.seatId)).answered).length;

  return (
    <section className="hq-cc-card hq-ss" aria-label="Seat setup">
      <header className="hq-cc-cardhead">
        <div>
          <h2>Seat setup</h2>
          <p className="hq-cc-muted">Each LLM: Connect → key → check in → answer your roll call.</p>
        </div>
        <span className="hq-cc-pill">
          {done}/{strip.length} answered
        </span>
      </header>
      <ul className="hq-ss-list">
        {strip.map((row) => {
          const call = lastCall ? dispatches.find((d) => d.sourceMessageId === lastCall.id && d.seatId === row.seatId) : null;
          const s = seatSteps(row, call);
          const steps = [
            ["Connected", s.connected],
            ["Key", s.keyed],
            ["Checked in", s.checkedIn],
            ["Roll call", s.answered],
          ];
          return (
            <li key={row.seatId} className="hq-ss-row">
              <div className="hq-ss-head">
                <strong>{row.callsign}</strong>
                <span className="hq-cc-muted">{row.adapter === "none" ? "not connected" : row.adapter}{row.lastSeenAt ? ` · seen ${ago(row.lastSeenAt)}` : ""}</span>
              </div>
              <ol className="hq-ss-steps" aria-label={`${row.callsign} setup steps`}>
                {steps.map(([label, ok]) => (
                  <li key={label} className={ok ? "hq-ss-ok" : "hq-ss-todo"}>
                    {ok ? "✓" : "○"} {label}
                  </li>
                ))}
              </ol>
              <div className="hq-ss-next">
                {s.next === "connect" ? (
                  <>
                    <button type="button" className="hq-cc-btn" disabled={busy} onClick={() => onConnect(row.seatId)}>
                      Connect
                    </button>
                    {API_ROUTE[row.seatId] ? <span className="hq-cc-muted">Chat app with no secret field? Use Vercel instead: {API_ROUTE[row.seatId]}.</span> : null}
                  </>
                ) : null}
                {s.next === "key" ? (
                  <span className="hq-cc-muted">
                    Put its key in the app&apos;s secret/env settings as HQ_ROOM_CONNECTION, or have it self-enroll and approve its pairing code in Seat key requests.
                  </span>
                ) : null}
                {s.next === "provider" ? <span className="hq-cc-muted">{row.missing} is not set in Vercel.</span> : null}
                {s.next === "checkin" ? (
                  <span className="hq-cc-muted">
                    Key is set. Send it the invite so it checks in.
                    {row.seatId === "cursor" ? " In Cursor: open this repo (`.cursor/mcp.json`), set HQ_ROOM_CONNECTION, then use MCP tools room_inbox / room_post or run scripts/hq-mcp-check.mjs." : null}
                    {row.seatId === "codex" ? " Codex: ~/.codex/config.toml → sooklabs_hq URL + HQ_ROOM_CONNECTION." : null}
                  </span>
                ) : null}
                {s.next === "rollcall" ? <span className="hq-cc-muted">Ready. Post a roll call in the Room tab.</span> : null}
                {s.next === "answer" ? <span className="hq-cc-muted">Roll call is {call?.status || "pending"}. Ask it to check its inbox.</span> : null}
                {s.next && s.next !== "connect" && s.next !== "provider" ? (
                  <button type="button" className="hq-cc-btn hq-cc-btn--quiet" onClick={() => copy(row.seatId)}>
                    {copied === row.seatId ? "Invite copied" : "Copy invite"}
                  </button>
                ) : null}
              </div>
              {copied === `fail:${row.seatId}` ? <textarea className="hq-ss-invite" readOnly rows={3} value={inviteFor(row.seatId)} /> : null}
              {!s.keyed && row.adapter !== "openai" && row.adapter !== "xai" && row.adapter !== "anthropic" ? (
                <div className="hq-ss-link">
                  {links[row.seatId] ? (
                    <>
                      <span className="hq-cc-muted">One-time link ready · expires {new Date(links[row.seatId].expiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      <button type="button" className="hq-cc-btn" onClick={() => copyLink(row.seatId)}>
                        {copied === `link:${row.seatId}` ? "Link copied" : "Copy link message"}
                      </button>
                      {copied === `linkfail:${row.seatId}` ? (
                        <textarea className="hq-ss-invite" readOnly rows={4} value={linkMessage(row.seatId, links[row.seatId].url)} />
                      ) : null}
                    </>
                  ) : (
                    <button type="button" className="hq-cc-btn" disabled={busy} onClick={() => makeLink(row.seatId)}>
                      Generate one-time link
                    </button>
                  )}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
      {linkError ? <p className="hq-room-error" role="alert">{linkError}</p> : null}
      <p className="hq-cc-muted">
        One-time links work once, for one seat, for 30 minutes; a new link replaces the old one. The invite contains no key. Agents read the public guide at {JOIN_URL}.
      </p>
    </section>
  );
}
