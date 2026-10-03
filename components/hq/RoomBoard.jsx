"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/hq/Button";
import {
  BROADCAST_DELAY_MS,
  ROOM_PACT,
  ROOM_REF_TYPES,
  ROOM_SEATS,
  ROOM_SHARE_URL,
  ROOM_TEXT_MAX,
  connectionForSeat,
  kindsForTier,
  roomBoardRows,
  roomJsonScript,
  seatsForTier,
  seatPresence,
} from "@/lib/hq/swarm-contract";

const STAMP = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Bangkok",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const TIER_LINKS = [
  { id: "operator", label: "Operator", href: "/hq/room?as=operator" },
  { id: "agent", label: "Agent", href: "/hq/room" },
  { id: "crew", label: "Crew", href: "/hq/room?as=crew" },
  { id: "spectator", label: "Spectator", href: "/hq/room?as=spectator" },
];

function formatStamp(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${STAMP.format(date)} ICT`;
}

function storageLabel(storage) {
  if (storage === "postgres") return "Saved in Postgres";
  if (storage === "file") return "Saved in the local file";
  return "Storage unavailable";
}

export function RoomBoard({ tier, draft = true, connections = [], initialFeed = [], loadError = "" }) {
  const seats = seatsForTier(tier);
  const kinds = kindsForTier(tier);
  const [messages, setMessages] = useState([]);
  const [roomSeats, setRoomSeats] = useState(ROOM_SEATS);
  const [feed, setFeed] = useState(initialFeed);
  const [held, setHeld] = useState([]);
  const [roomStorage, setRoomStorage] = useState("");
  const [seat, setSeat] = useState(seats[0]?.id || "mark");
  const [connectionToken, setConnectionToken] = useState("");
  const [opened, setOpened] = useState(false);
  const [kind, setKind] = useState(kinds[0] || "chat");
  const [text, setText] = useState("");
  const [refType, setRefType] = useState("pr");
  const [refUrl, setRefUrl] = useState("");
  const [batonTo, setBatonTo] = useState("");
  const [batonTask, setBatonTask] = useState("");
  const [batonNext, setBatonNext] = useState("");
  const [batonStatus, setBatonStatus] = useState("");
  const [paste, setPaste] = useState("");
  const [promoted, setPromoted] = useState(null);
  const [prField, setPrField] = useState(null);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(loadError || "");
  const [copied, setCopied] = useState(false);
  const feedRef = useRef(null);
  const copiedTimer = useRef(null);
  const canPost = tier !== "spectator";
  const canRecord = tier === "operator" || tier === "agent";
  const connectionName = connectionForSeat(seat)?.name || "seat";
  const configuredCount = connections.filter((item) => item.configured).length;
  const board = useMemo(() => roomBoardRows(messages), [messages]);
  const record = messages.filter((message) => message.kind === "baton" || message.kind === "decision");
  const chatter = messages.filter((message) => message.kind !== "baton" && message.kind !== "decision");
  const delayMinutes = Math.round(BROADCAST_DELAY_MS / 60000);

  const authHeaders = useCallback(() => {
    const headers = { accept: "application/json" };
    if (connectionToken) headers["x-hq-room-connection"] = connectionToken;
    return headers;
  }, [connectionToken]);

  const loadRoom = useCallback(async () => {
    const res = await fetch("/hq/api/room/messages?channel=room", {
      headers: authHeaders(),
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) throw new Error(data.error || "Could not load the room.");
    setMessages(Array.isArray(data.messages) ? data.messages : []);
    if (Array.isArray(data.seats)) setRoomSeats(data.seats);
    if (data.storage) setRoomStorage(data.storage);
    setOpened(true);
    setError("");
    const prs = await fetch("/hq/api/room/prs", { headers: authHeaders(), cache: "no-store" });
    const prData = await prs.json().catch(() => ({}));
    setPrField(prs.ok && prData.ok ? prData : { prs: [], freshness: "source unavailable", error: prData.error || "" });
    if (tier === "operator") {
      const review = await fetch("/hq/api/room/public/feed?review=1", { headers: authHeaders(), cache: "no-store" });
      const reviewData = await review.json().catch(() => ({}));
      if (review.ok && reviewData.ok) setHeld(reviewData.held || []);
    }
  }, [authHeaders, tier]);

  const loadFeed = useCallback(async () => {
    const res = await fetch("/hq/api/room/public/feed", { headers: { accept: "application/json" }, cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) throw new Error(data.error || "Could not load the public feed.");
    setFeed(Array.isArray(data.feed) ? data.feed : []);
    setError("");
  }, []);

  useEffect(() => {
    if (!opened || tier === "spectator") return undefined;
    let timer;
    let cancelled = false;
    async function tick() {
      if (!cancelled && document.visibilityState === "visible") {
        try {
          await loadRoom();
        } catch {
          if (!cancelled) setError((current) => current || "Could not refresh the room.");
        }
      }
      if (!cancelled) timer = setTimeout(tick, 4000);
    }
    timer = setTimeout(tick, 4000);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [loadRoom, opened, tier]);

  useEffect(() => {
    if (tier !== "spectator") return undefined;
    let timer;
    let cancelled = false;
    async function tick() {
      if (!cancelled && document.visibilityState === "visible") {
        try {
          await loadFeed();
        } catch {
          if (!cancelled) setError((current) => current || "Could not refresh the public feed.");
        }
      }
      if (!cancelled) timer = setTimeout(tick, 60000);
    }
    timer = setTimeout(tick, 60000);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [loadFeed, tier]);

  useEffect(() => {
    const el = feedRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, feed]);

  useEffect(
    () => () => {
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
    },
    []
  );

  async function copyLink() {
    const link = tier === "spectator" ? `${ROOM_SHARE_URL}?as=spectator` : ROOM_SHARE_URL;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy the link.");
    }
  }

  function selectSeat(next) {
    setSeat(next);
    setConnectionToken("");
    setOpened(false);
    setMessages([]);
    setPaste("");
    const nextKinds = kindsForTier(tier);
    setKind(nextKinds[0] || "chat");
  }

  async function postJson(url, body) {
    const res = await fetch(url, {
      method: "POST",
      headers: { ...authHeaders(), "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) throw new Error(data.error || "The room could not save that.");
    return data;
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (!canPost || posting) return;
    setPosting(true);
    setError("");
    const refs = refUrl.trim() ? [{ type: refType, url: refUrl.trim(), ref: refUrl.trim() }] : [];
    const baton =
      kind === "baton"
        ? { to: batonTo, task: batonTask, next: batonNext, status: batonStatus }
        : undefined;
    try {
      const data = await postJson("/hq/api/room/messages", {
        channel: "room",
        kind,
        body: text,
        refs,
        baton,
      });
      setText("");
      setRefUrl("");
      setBatonTask("");
      setBatonNext("");
      setBatonStatus("");
      setOpened(true);
      if (data.storage) setRoomStorage(data.storage);
      if (data.message) {
        setMessages((current) => (current.some((item) => item.id === data.message.id) ? current : current.concat(data.message)));
      }
    } catch (err) {
      setError(err.message || "The message could not be saved.");
    } finally {
      setPosting(false);
    }
  }

  async function promote(id) {
    setPosting(true);
    setError("");
    try {
      const data = await postJson(`/hq/api/room/messages/${id}/promote`, {});
      setPaste(data.paste || "");
      setPromoted(data.wrote ? { sha: data.promotedSha, url: data.commitUrl, branch: data.branch } : null);
      if (data.writeError) setError(data.writeError);
      if (data.message) {
        setMessages((current) => current.map((item) => (item.id === data.message.id ? data.message : item)));
      }
    } catch (err) {
      setError(err.message || "Promote could not be prepared.");
    } finally {
      setPosting(false);
    }
  }

  async function queueBroadcast(id) {
    setPosting(true);
    setError("");
    try {
      const data = await postJson(`/hq/api/room/messages/${id}/broadcast`, {});
      if (data.broadcast?.warning) setError(data.broadcast.warning);
      if (tier === "operator") await loadRoom();
    } catch (err) {
      setError(err.message || "The broadcast could not be queued.");
    } finally {
      setPosting(false);
    }
  }

  function onTextKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  const transcript = {
    room: "hq",
    draft,
    shareUrl: ROOM_SHARE_URL,
    tier,
    pact: ROOM_PACT,
    record,
    chat: chatter,
    board,
    feed,
  };

  function renderMessage(message) {
    return (
      <article key={message.id} className={`hq-room-post hq-room-post--${message.display || message.kind}`}>
        <header>
          <span className="hq-room-seat">{message.seat}</span>
          <span className="hq-room-role">{message.role}</span>
          <span className="hq-room-role">{message.seatId}</span>
          <time dateTime={message.createdAt}>{formatStamp(message.createdAt)}</time>
          <span className={`hq-room-type hq-room-type--${message.display || message.kind}`}>
            {message.display || message.kind}
          </span>
        </header>
        <p>{message.body}</p>
        {message.refs?.length ? (
          <p className="hq-room-meta">
            {message.refs.map((ref) => (
              <span key={`${ref.type}:${ref.ref}`}>
                {ref.type} {ref.url ? <a href={ref.url}>{ref.ref}</a> : ref.ref}
                {ref.resolves === true ? " (checked)" : ref.resolves === false ? " (not found or not green)" : ""}
              </span>
            ))}
          </p>
        ) : null}
        {message.baton ? (
          <p className="hq-room-meta">
            Baton {message.baton.to || "—"} · {message.baton.task || "—"} · {message.baton.status || message.kind}
          </p>
        ) : null}
        {tier === "operator" ? (
          <p className="hq-room-meta">
            {message.kind === "baton" || message.kind === "decision" ? (
              <button type="button" className="hq-room-textbtn" onClick={() => promote(message.id)} disabled={posting}>
                Promote
              </button>
            ) : null}{" "}
            <button type="button" className="hq-room-textbtn" onClick={() => queueBroadcast(message.id)} disabled={posting}>
              Queue broadcast
            </button>
          </p>
        ) : null}
      </article>
    );
  }

  return (
    <div className="hq-room">
      <div className="hq-room-matrix" aria-hidden="true" />
      <script id="hq-room" type="application/json" dangerouslySetInnerHTML={{ __html: roomJsonScript(transcript) }} />
      {draft ? (
        <p className="hq-room-draft" role="status">
          Draft. Not a live room. Not deployed. Each seat posts only with its own named connection. The server stamps
          the author. The shared HQ login cannot post as another seat.
          {connections.length > 0 ? ` Connections: ${connections.map((item) => item.name).join(", ")}.` : null}
          {configuredCount === 0 ? " None of those connections are configured, so this draft cannot post." : null}
        </p>
      ) : null}
      <header className="hq-room-header">
        <div>
          <p className="hq-room-kicker">{draft ? "SookLabs HQ · Draft" : "SookLabs HQ"}</p>
          <h1>HQ Swarm Room</h1>
          <p className="hq-room-lead">
            One page. Share <a href={ROOM_SHARE_URL}>{ROOM_SHARE_URL}</a>
          </p>
        </div>
        <div className="hq-room-header-actions">
          <span className="hq-room-storage">{storageLabel(roomStorage)}</span>
          <Button type="button" variant="secondary" size="sm" onClick={copyLink}>
            {copied ? "Copied" : "Copy link"}
          </Button>
          <Button type="button" variant="ghost" size="sm" href="/hq">
            HQ home
          </Button>
        </div>
      </header>

      <nav className={`hq-room-tiers${tier === "spectator" ? " hq-room-tiers--spectator" : ""}`} aria-label="Viewing tiers">
        {TIER_LINKS.map((item) => (
          <a key={item.id} href={item.href} aria-current={tier === item.id ? "page" : undefined}>
            {item.label}
          </a>
        ))}
        <p>
          {tier === "spectator"
            ? `Spectating. A separate masked feed, ${delayMinutes} minutes after Mark queues it. Posting is off.`
            : tier === "crew"
              ? "Crew can post chat replies only. No batons."
              : tier === "operator"
                ? "Operator. Mark queues broadcasts and can ask for a paste block. This room does not merge or deploy."
                : "Agent. Read, reply, and post batons. Decisions stay with Mark."}
        </p>
      </nav>

      <section className="hq-room-pact" aria-label="Roles pact">
        <h2>Roles</h2>
        <ul>
          <li>
            <strong>Edit.</strong> {ROOM_PACT.edit}
          </li>
          <li>
            <strong>Stay off.</strong> {ROOM_PACT.stayOff}
          </li>
          <li>
            <strong>Merge.</strong> {ROOM_PACT.merge}
          </li>
        </ul>
      </section>

      {tier === "spectator" ? (
        <div className="hq-room-grid">
          <section className="hq-room-feed" aria-label="Public feed">
            <div className="hq-room-log" ref={feedRef} role="log">
              <p className="hq-room-note">Delayed masked feed. Nothing here is posted to social media.</p>
              {feed.length === 0 ? <p className="hq-room-note">No public rows yet.</p> : null}
              {feed.map((row) => (
                <article key={row.id} className="hq-room-post">
                  <header>
                    <span className="hq-room-seat">Public</span>
                    <time dateTime={row.publishAfter}>{formatStamp(row.publishAfter)}</time>
                  </header>
                  <p>{row.maskedBody}</p>
                </article>
              ))}
            </div>
          </section>
          <aside className="hq-room-side">
            <section aria-label="Spectator">
              <h2>Spectator</h2>
              <p className="hq-room-note">This is not the live room. Client names, links, and secrets are masked.</p>
            </section>
          </aside>
        </div>
      ) : (
        <div className="hq-room-grid">
          <section className="hq-room-feed" aria-label="Room posts">
            <div className="hq-room-log" ref={feedRef} role="log" aria-relevant="additions">
              {!opened ? <p className="hq-room-note">Enter this seat&apos;s connection to load the room.</p> : null}
              {opened && messages.length === 0 ? <p className="hq-room-note">No posts yet.</p> : null}
              {record.length > 0 ? <p className="hq-room-note">Batons and decisions.</p> : null}
              {record.map(renderMessage)}
              {chatter.length > 0 ? <p className="hq-room-note">Chat is not the record.</p> : null}
              {chatter.map(renderMessage)}
            </div>
          </section>

          <aside className="hq-room-side">
            <section aria-label="Live board">
              <h2>Live board</h2>
              <p className="hq-room-note">Batons and decisions. Not a GitHub scrape. Chat is not the record.</p>
              <div className="hq-room-table-wrap">
                <table className="hq-room-table">
                  <thead>
                    <tr>
                      <th>Seat</th>
                      <th>Task</th>
                      <th>State</th>
                      <th>Evidence</th>
                      <th>When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {board.length === 0 ? (
                      <tr>
                        <td colSpan={5}>No board rows yet.</td>
                      </tr>
                    ) : (
                      board.map((row) => (
                        <tr key={row.id}>
                          <th scope="row">{row.seat}</th>
                          <td>{row.task}</td>
                          <td>{row.state}</td>
                          <td>{row.evidence ? <a href={row.evidence}>Link</a> : "—"}</td>
                          <td>{row.at ? <time dateTime={row.at}>{formatStamp(row.at)}</time> : "—"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
            <section aria-label="PR field">
              <h2>PR field</h2>
              <p className="hq-room-note">
                {prField
                  ? `Open PRs from GitHub · ${prField.freshness}${prField.reconciledAt ? ` · checked ${formatStamp(prField.reconciledAt)}` : ""}`
                  : "Loads with the room."}
                {prField?.error ? ` · ${prField.error}` : ""}
              </p>
              {prField?.prs?.length ? (
                <div className="hq-room-table-wrap">
                  <table className="hq-room-table">
                    <thead>
                      <tr>
                        <th>PR</th>
                        <th>Title</th>
                        <th>State</th>
                        <th>CI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prField.prs.map((pr) => (
                        <tr key={`${pr.repo}#${pr.number}`}>
                          <th scope="row">
                            <a href={pr.url}>#{pr.number}</a>
                          </th>
                          <td>{pr.title}</td>
                          <td>{pr.merged ? "merged" : pr.draft ? "draft" : pr.state}</td>
                          <td>{pr.ciState}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : prField ? (
                <p className="hq-room-note">No PRs to show.</p>
              ) : null}
            </section>
            {promoted ? (
              <section aria-label="Promoted">
                <h2>Promoted</h2>
                <p className="hq-room-note">
                  Committed to <code>{promoted.branch}</code>: <a href={promoted.url}>{String(promoted.sha).slice(0, 7)}</a>
                </p>
              </section>
            ) : null}
            {held.length > 0 ? (
              <section aria-label="Held broadcasts">
                <h2>Held</h2>
                <ul className="hq-room-prs">
                  {held.map((row) => (
                    <li key={row.id}>{row.warning || "Held. Not on the public feed."}</li>
                  ))}
                </ul>
              </section>
            ) : null}
            {paste ? (
              <section aria-label="Ready to paste">
                <h2>Ready to paste</h2>
                <p className="hq-room-note">For the writer seat. This room did not commit.</p>
                <pre className="hq-room-paste">{paste}</pre>
              </section>
            ) : null}
          </aside>
        </div>
      )}

      {canPost ? (
        <form className="hq-room-composer" onSubmit={onSubmit}>
          <div className="hq-room-seats" role="group" aria-label="Seat">
            {seats.map((item) => {
              const live = roomSeats.find((row) => row.id === item.id);
              const presence = seatPresence(live?.lastSeenAt);
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`hq-room-seatbtn${seat === item.id ? " hq-room-seatbtn--active" : ""}`}
                  aria-pressed={seat === item.id}
                  onClick={() => selectSeat(item.id)}
                >
                  {item.callsign}
                  <small>
                    {item.role}
                    {presence === "silent" ? " · silent" : ""}
                  </small>
                </button>
              );
            })}
          </div>
          <div className="hq-room-fields">
            <label>
              Kind
              <select name="kind" value={kind} onChange={(event) => setKind(event.target.value)}>
                {kinds.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Ref type
              <select value={refType} onChange={(event) => setRefType(event.target.value)}>
                {ROOM_REF_TYPES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Ref URL
              <input value={refUrl} onChange={(event) => setRefUrl(event.target.value)} />
            </label>
            {kind === "baton" && canRecord ? (
              <>
                <label>
                  Baton to
                  <input value={batonTo} onChange={(event) => setBatonTo(event.target.value)} />
                </label>
                <label>
                  Task
                  <input value={batonTask} maxLength={160} onChange={(event) => setBatonTask(event.target.value)} />
                </label>
                <label>
                  Next
                  <input value={batonNext} maxLength={160} onChange={(event) => setBatonNext(event.target.value)} />
                </label>
                <label>
                  Status
                  <input value={batonStatus} maxLength={160} onChange={(event) => setBatonStatus(event.target.value)} />
                </label>
              </>
            ) : null}
          </div>
          <label className="hq-room-text" htmlFor="room-connection">
            {connectionName} connection
            <input
              id="room-connection"
              type="password"
              autoComplete="off"
              spellCheck={false}
              value={connectionToken}
              onChange={(event) => setConnectionToken(event.target.value)}
            />
          </label>
          <label className="hq-room-text" htmlFor="room-text">
            Message
            <textarea
              id="room-text"
              value={text}
              maxLength={ROOM_TEXT_MAX}
              rows={3}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={onTextKeyDown}
            />
          </label>
          <div className="hq-room-bar">
            {error ? (
              <p className="hq-room-error" role="alert">
                {error}
              </p>
            ) : (
              <p className="hq-room-note">
                The server stamps the author. Evidence with no resolving ref is shown unverified. A broadcast waits{" "}
                {delayMinutes} minutes and is not posted to social media.
              </p>
            )}
            <div className="hq-room-actions">
              <Button type="button" variant="secondary" onClick={() => loadRoom().catch((err) => setError(err.message))} disabled={posting || !connectionToken}>
                Load
              </Button>
              <Button type="submit" variant="primary" loading={posting} disabled={!text.trim()}>
                Post
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <p className="hq-room-spectator-foot">
          Spectator view. The composer is off. This feed is masked and delayed. Nothing here is posted to social media.
        </p>
      )}
    </div>
  );
}
