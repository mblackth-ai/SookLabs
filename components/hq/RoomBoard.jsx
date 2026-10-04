"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AcceptancePanel } from "@/components/hq/AcceptancePanel";
import { SeatRequests } from "@/components/hq/SeatRequests";
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
  boardMarkdown,
} from "@/lib/hq/swarm-contract";

// HQ Swarm Room as a command center. Live metrics are loaded from the room API
// (messages, dispatches, seat strip, PR field) or the HQ control-plane snapshot
// (/hq/api/room/summary); seat names, roles and UI labels are configured
// client-side, and unloaded metrics show "—".

const DISPATCH_LABEL = {
  queued: "Queued",
  dispatching: "Sending",
  thinking: "Thinking",
  responded: "Responded",
  failed: "Failed",
  offline: "Offline",
  timed_out: "Timed out",
};

const SEAT_STATE_LABEL = {
  ...DISPATCH_LABEL,
  online: "Online",
  ready: "Ready",
  idle: "Idle",
  unknown: "Not loaded",
};

const OPEN_STATES = ["queued", "dispatching", "thinking"];
const AGENT_SEATS = ROOM_SEATS.filter((seat) => seat.tier === "agent");
const SUMMARY_EVERY_MS = 30000;

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

const THREAD_FILTERS = [
  { id: "all", label: "All" },
  { id: "decision", label: "Decisions" },
  { id: "baton", label: "Batons" },
  { id: "evidence", label: "Evidence" },
];

function formatStamp(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${STAMP.format(date)} ICT`;
}

function storageLabel(storage) {
  if (storage === "postgres") return "Saved in Postgres";
  if (storage === "file") return "Saved in the local file";
  return "";
}

function tone(state) {
  if (state === "offline" || state === "unknown") return "off";
  if (state === "failed") return "bad";
  if (state === "idle" || state === "timed_out" || state === "queued") return "warn";
  if (state === "thinking" || state === "dispatching") return "busy";
  return "on";
}

function seatName(id) {
  return ROOM_SEATS.find((seat) => seat.id === id)?.callsign || id;
}

function ciMark(state) {
  if (state === "pass") return "CI ✓";
  if (state === "fail") return "CI ✗";
  if (state === "pending") return "CI …";
  return "CI ?";
}

// "Remember on this device": a seat key kept in this browser's localStorage only
// (never sent anywhere except as the room header). Forget clears it; a saved key
// that stops working is removed automatically.
const REMEMBER_PREFIX = "hq-room-key:";
function readRemembered(seatId) {
  try {
    return window.localStorage.getItem(REMEMBER_PREFIX + seatId) || "";
  } catch {
    return "";
  }
}
function writeRemembered(seatId, value) {
  try {
    if (value) window.localStorage.setItem(REMEMBER_PREFIX + seatId, value);
    else window.localStorage.removeItem(REMEMBER_PREFIX + seatId);
    return true;
  } catch {
    return false;
  }
}

export function RoomBoard({ tier, draft = true, connections = [], initialFeed = [], loadError = "" }) {
  const seats = seatsForTier(tier);
  const kinds = kindsForTier(tier);
  const [messages, setMessages] = useState([]);
  const [roomSeats, setRoomSeats] = useState(ROOM_SEATS);
  const [strip, setStrip] = useState([]);
  const [dispatches, setDispatches] = useState([]);
  const [summary, setSummary] = useState(null);
  const [feed, setFeed] = useState(initialFeed);
  const [held, setHeld] = useState([]);
  const [roomStorage, setRoomStorage] = useState("");
  const [seat, setSeat] = useState(seats[0]?.id || "mark");
  const [connectionToken, setConnectionToken] = useState("");
  const [opened, setOpened] = useState(false);
  const [remember, setRemember] = useState(false);
  const [remembered, setRemembered] = useState(false);
  const [autoLoad, setAutoLoad] = useState(false);
  const [mode, setMode] = useState("chat");
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
  const [seatFilter, setSeatFilter] = useState("");
  const [kindFilter, setKindFilter] = useState("all");
  const [view, setView] = useState("room");
  const feedRef = useRef(null);
  const textRef = useRef(null);
  const copiedTimer = useRef(null);
  const summaryAt = useRef(0);
  const canPost = tier !== "spectator";
  const isOperator = tier === "operator";
  const connectionName = connectionForSeat(seat)?.name || "seat";
  const configuredCount = connections.filter((item) => item.configured).length;
  const board = useMemo(() => roomBoardRows(messages), [messages]);
  const delayMinutes = Math.round(BROADCAST_DELAY_MS / 60000);

  // Thread view: a dispatch reply sits under the message it answers.
  const ids = useMemo(() => new Set(messages.map((message) => message.id)), [messages]);
  const repliesBySource = useMemo(() => {
    const map = new Map();
    for (const message of messages) {
      if (message.replyTo && ids.has(message.replyTo)) map.set(message.replyTo, [...(map.get(message.replyTo) || []), message]);
    }
    return map;
  }, [messages, ids]);
  const dispatchesBySource = useMemo(() => {
    const map = new Map();
    for (const row of dispatches) map.set(row.sourceMessageId, [...(map.get(row.sourceMessageId) || []), row]);
    return map;
  }, [dispatches]);
  const latestDispatchBySeat = useMemo(() => {
    const map = new Map();
    for (const row of dispatches) {
      const prev = map.get(row.seatId);
      if (!prev || (row.updatedAt || row.createdAt) > (prev.updatedAt || prev.createdAt)) map.set(row.seatId, row);
    }
    return map;
  }, [dispatches]);
  const topLevel = messages.filter((message) => !(message.replyTo && ids.has(message.replyTo)));

  function seatState(seatId) {
    const row = strip.find((item) => item.seatId === seatId);
    const latest = latestDispatchBySeat.get(seatId);
    if (latest && OPEN_STATES.includes(latest.status)) return latest.status;
    if (!row) return "unknown";
    if (!row.ready) return "offline";
    if (latest) return latest.status;
    if (row.adapter === "pull") return row.online ? "online" : "idle";
    return "ready";
  }

  const visibleThread = topLevel.filter((message) => {
    if (kindFilter !== "all") {
      const kind = message.kind === "evidence" ? "evidence" : message.kind;
      if (kind !== kindFilter) return false;
    }
    if (!seatFilter) return true;
    if (message.seatId === seatFilter) return true;
    if ((dispatchesBySource.get(message.id) || []).some((row) => row.seatId === seatFilter)) return true;
    return (repliesBySource.get(message.id) || []).some((reply) => reply.seatId === seatFilter);
  });

  // Header stats, all from loaded data.
  const latestBaton = messages
    .filter((message) => message.kind === "baton" && message.baton?.to)
    .reduce((latest, message) => (!latest || message.createdAt > latest.createdAt ? message : latest), null);
  const readySeats = strip.filter((row) => row.ready);
  const liveSeats = strip.filter((row) => row.ready && (row.adapter !== "pull" || row.online));
  const offlineSeats = strip.filter((row) => !row.ready);
  const seatBlockers = offlineSeats.map((row) => {
    const noAdapter = String(row.missing || "").startsWith("HQ_SEAT_ADAPTER_");
    const awaitingKey = row.adapter === "pull" && String(row.missing || "").startsWith("HQ_ROOM_CONNECTION_");
    return {
      id: `seat-${row.seatId}`,
      seatId: row.seatId,
      title: awaitingKey ? `${row.callsign} connected, waiting for its key` : `${row.callsign} offline`,
      detail: awaitingKey
        ? `Ask ${row.callsign} to run the pairing step, then approve its code in Seat key requests.`
        : `${row.missing} is not set, so this seat gets no dispatches.`,
      action: noAdapter ? "connect" : awaitingKey ? "disconnect" : "",
      href: "",
    };
  });
  const blockers = [...(summary?.blockers || []), ...seatBlockers];
  // Never claim "no blockers" while the control-plane half is missing.
  const controlPlaneBlockers = !summary ? "loading" : summary.error ? "unavailable" : "ok";

  const authHeaders = useCallback(() => {
    const headers = { accept: "application/json" };
    if (connectionToken) headers["x-hq-room-connection"] = connectionToken;
    return headers;
  }, [connectionToken]);

  const loadRoom = useCallback(async () => {
    const res = await fetch("/hq/api/room/messages?channel=room", { headers: authHeaders(), cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) throw new Error(data.error || "Could not load the room.");
    setMessages(Array.isArray(data.messages) ? data.messages : []);
    if (Array.isArray(data.seats)) setRoomSeats(data.seats);
    if (Array.isArray(data.strip)) setStrip(data.strip);
    if (Array.isArray(data.dispatches)) setDispatches(data.dispatches);
    if (data.storage) setRoomStorage(data.storage);
    setOpened(true);
    setError("");
    if (Date.now() - summaryAt.current > SUMMARY_EVERY_MS) {
      summaryAt.current = Date.now();
      const [prs, sum] = await Promise.all([
        fetch("/hq/api/room/prs", { headers: authHeaders(), cache: "no-store" }),
        fetch("/hq/api/room/summary", { headers: authHeaders(), cache: "no-store" }),
      ]);
      const prData = await prs.json().catch(() => ({}));
      setPrField(prs.ok && prData.ok ? prData : { prs: [], freshness: "source unavailable", error: prData.error || "" });
      const sumData = await sum.json().catch(() => ({}));
      setSummary(sum.ok && sumData.ok ? sumData : { error: sumData.error || "The HQ summary could not be loaded." });
    }
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
  }, [feed]);

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

  // Restore a key saved on this device for the chosen seat, then open the room.
  useEffect(() => {
    if (tier === "spectator") return undefined;
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      const stored = readRemembered(seat);
      setRemembered(Boolean(stored));
      setRemember(Boolean(stored));
      if (stored) {
        setConnectionToken(stored);
        setAutoLoad(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [seat, tier]);

  useEffect(() => {
    if (!autoLoad || !connectionToken) return undefined;
    let cancelled = false;
    Promise.resolve().then(async () => {
      if (cancelled) return;
      setAutoLoad(false);
      try {
        await loadRoom();
      } catch {
        writeRemembered(seat, "");
        setRemembered(false);
        setRemember(false);
        setConnectionToken("");
        setError("The key saved on this device no longer works, so it was removed. Enter the current key.");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [autoLoad, connectionToken, loadRoom, seat]);

  async function openRoom() {
    try {
      await loadRoom();
      if (remember) setRemembered(writeRemembered(seat, connectionToken));
    } catch (err) {
      setError(err.message);
    }
  }

  // Mark only: connect an agent seat as `pull` from the room (no secret; the agent still needs an approved key).
  async function connectSeat(target, connected) {
    setPosting(true);
    setError("");
    try {
      const res = await fetch("/hq/api/room/enroll/connect", {
        method: "POST",
        headers: { ...authHeaders(), "content-type": "application/json" },
        body: JSON.stringify({ seat, target, connected }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "That seat could not be connected.");
      await loadRoom();
    } catch (err) {
      setError(err.message);
    } finally {
      setPosting(false);
    }
  }

  function forgetKey() {
    writeRemembered(seat, "");
    setRemembered(false);
    setRemember(false);
    setConnectionToken("");
    setOpened(false);
  }

  function selectSeat(next) {
    setSeat(next);
    setConnectionToken("");
    setOpened(false);
    setMessages([]);
    setDispatches([]);
    setStrip([]);
    setSummary(null);
    setPrField(null);
    summaryAt.current = 0;
    setPaste("");
    setMode("chat");
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

  function toggleMode(next) {
    setMode((current) => (current === next ? "chat" : next));
  }

  function insertMention(name) {
    const tag = `@${name}`;
    setText((current) => (current.includes(tag) ? current : `${tag} ${current}`.trimEnd() + (current ? "" : " ")));
    textRef.current?.focus();
  }

  function replyTo(message) {
    if (message.seatId === seat) return;
    setMode("chat");
    setText(`@${message.seatId} `);
    textRef.current?.focus();
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (!canPost || posting) return;
    setPosting(true);
    setError("");
    const kind = kinds.includes(mode) ? mode : "chat";
    const refs = refUrl.trim() ? [{ type: refType, url: refUrl.trim(), ref: refUrl.trim() }] : [];
    const baton = kind === "baton" ? { to: batonTo, task: batonTask, next: batonNext, status: batonStatus } : undefined;
    try {
      const data = await postJson("/hq/api/room/messages", { channel: "room", kind, body: text, refs, baton });
      setText("");
      setRefUrl("");
      setBatonTask("");
      setBatonNext("");
      setBatonStatus("");
      setMode("chat");
      setOpened(true);
      if (data.storage) setRoomStorage(data.storage);
      if (data.message) {
        setMessages((current) => (current.some((item) => item.id === data.message.id) ? current : current.concat(data.message)));
      }
      if (Array.isArray(data.dispatches) && data.dispatches.length) {
        setDispatches((current) => current.concat(data.dispatches.filter((row) => !current.some((item) => item.id === row.id))));
      }
      if (data.routeNote) setError(data.routeNote);
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
      if (data.message) setMessages((current) => current.map((item) => (item.id === data.message.id ? data.message : item)));
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
    record: topLevel.filter((m) => m.kind === "baton" || m.kind === "decision"),
    chat: topLevel.filter((m) => m.kind !== "baton" && m.kind !== "decision"),
    board,
    feed,
  };

  // ---- pieces -----------------------------------------------------------------

  function renderDispatchGrid(message) {
    const rows = dispatchesBySource.get(message.id);
    if (!rows?.length) return null;
    return (
      <ul className="hq-cc-dispatch-grid" aria-label="Sent to">
        {rows.map((row) => (
          <li key={row.id} className={`hq-cc-dispatch hq-cc-tone--${tone(row.status)}`} title={row.error || row.reason}>
            <span>{seatName(row.seatId)}</span>
            <strong>{DISPATCH_LABEL[row.status] || row.status}</strong>
          </li>
        ))}
      </ul>
    );
  }

  function kindBadge(message) {
    if (message.seatId === "mark" && message.kind === "chat" && dispatchesBySource.has(message.id)) return "Command";
    return message.display || message.kind;
  }

  function renderCard(message, nested = false) {
    const replies = repliesBySource.get(message.id) || [];
    const isMark = message.seatId === "mark";
    const badge = kindBadge(message);
    return (
      <div key={message.id} className={nested ? "hq-cc-reply" : "hq-cc-threadroot"}>
        <article className={`hq-cc-card hq-cc-msg hq-cc-msg--${message.display || message.kind}`}>
          <header className="hq-cc-msg-head">
            <span className={`hq-cc-author${isMark ? " hq-cc-author--mark" : ""}`}>{isMark ? "MARK" : message.seat}</span>
            <span className={`hq-cc-badge hq-cc-badge--${String(badge).toLowerCase()}`}>{badge}</span>
            <time dateTime={message.createdAt}>{formatStamp(message.createdAt)}</time>
          </header>
          {message.kind === "baton" && message.baton ? (
            <div className="hq-cc-baton">
              <p className="hq-cc-baton-route">
                {message.seat} → {message.baton.to ? seatName(message.baton.to) : "anyone"}
                {message.baton.status ? <span className="hq-cc-muted"> · {message.baton.status}</span> : null}
              </p>
              <p className="hq-cc-body">{message.body}</p>
              <dl className="hq-cc-facts">
                {message.baton.task ? (
                  <>
                    <dt>Task</dt>
                    <dd>{message.baton.task}</dd>
                  </>
                ) : null}
                {message.baton.next ? (
                  <>
                    <dt>Next</dt>
                    <dd>{message.baton.next}</dd>
                  </>
                ) : null}
              </dl>
            </div>
          ) : (
            <p className="hq-cc-body">{message.body}</p>
          )}
          {message.refs?.length ? (
            <dl className="hq-cc-facts hq-cc-facts--boxed">
              {message.refs.map((ref) => (
                <div key={`${ref.type}:${ref.ref}`} className="hq-cc-fact">
                  <dt>{ref.type}</dt>
                  <dd>
                    {ref.url ? <a href={ref.url}>{ref.ref}</a> : ref.ref}
                    {ref.resolves === true ? " ✓ checked" : ref.resolves === false ? " ✗ not found or not green" : ""}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
          {renderDispatchGrid(message)}
          {canPost ? (
            <div className="hq-cc-actions">
              {isOperator && (message.kind === "baton" || message.kind === "decision") ? (
                <button type="button" className="hq-cc-btn" onClick={() => promote(message.id)} disabled={posting || Boolean(message.promotedSha)}>
                  {message.promotedSha ? `Promoted ${message.promotedSha.slice(0, 7)}` : `Promote ${message.kind}`}
                </button>
              ) : null}
              {message.seatId !== seat && AGENT_SEATS.some((item) => item.id === message.seatId) ? (
                <button type="button" className="hq-cc-btn" onClick={() => replyTo(message)}>
                  Reply
                </button>
              ) : null}
              {isOperator ? (
                <button type="button" className="hq-cc-btn hq-cc-btn--quiet" onClick={() => queueBroadcast(message.id)} disabled={posting}>
                  Queue broadcast
                </button>
              ) : null}
            </div>
          ) : null}
        </article>
        {replies.length ? <div className="hq-cc-replies">{replies.map((reply) => renderCard(reply, true))}</div> : null}
      </div>
    );
  }

  function renderPulse() {
    const cx = 160;
    const cy = 104;
    const nodes = AGENT_SEATS.map((item, index) => {
      const angle = (-150 + (index * 360) / AGENT_SEATS.length) * (Math.PI / 180);
      return { ...item, x: cx + Math.cos(angle) * 122, y: cy + Math.sin(angle) * 74, state: seatState(item.id) };
    });
    return (
      <svg className="hq-cc-pulse" viewBox="0 0 320 208" role="img" aria-label="Seats connected to the HQ router">
        {nodes.map((node) => (
          <line
            key={`l-${node.id}`}
            x1={cx}
            y1={cy}
            x2={node.x}
            y2={node.y}
            className={`hq-cc-pulse-line hq-cc-tone--${tone(node.state)}${OPEN_STATES.includes(node.state) ? " hq-cc-pulse-line--active" : ""}`}
          />
        ))}
        <circle cx={cx} cy={cy} r="30" className="hq-cc-pulse-hub" />
        <text x={cx} y={cy - 2} className="hq-cc-pulse-hubtext">
          HQ
        </text>
        <text x={cx} y={cy + 11} className="hq-cc-pulse-hubsub">
          ROUTER
        </text>
        {nodes.map((node) => (
          <g key={node.id}>
            <circle cx={node.x} cy={node.y} r="19" className={`hq-cc-pulse-node hq-cc-tone--${tone(node.state)}`} />
            <text x={node.x} y={node.y + 3.5} className="hq-cc-pulse-label">
              {node.callsign}
            </text>
            <title>{`${node.callsign}: ${SEAT_STATE_LABEL[node.state] || node.state}`}</title>
          </g>
        ))}
      </svg>
    );
  }

  // ---- spectator ----------------------------------------------------------------

  if (tier === "spectator") {
    return (
      <div className="hq-room">
        <div className="hq-room-matrix" aria-hidden="true" />
        <script id="hq-room" type="application/json" dangerouslySetInnerHTML={{ __html: roomJsonScript(transcript) }} />
        <header className="hq-room-header">
          <div>
            <p className="hq-room-kicker">SookLabs HQ</p>
            <h1>HQ Swarm Room</h1>
            <p className="hq-room-lead">
              Spectating. A separate masked feed, {delayMinutes} minutes after Mark queues it. Posting is off.
            </p>
          </div>
          <div className="hq-room-header-actions">
            <Button type="button" variant="secondary" size="sm" onClick={copyLink}>
              {copied ? "Copied" : "Copy link"}
            </Button>
          </div>
        </header>
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
        {error ? (
          <p className="hq-room-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  // ---- command center ----------------------------------------------------------

  const percent = summary && typeof summary.finishLine?.percent === "number" ? summary.finishLine.percent : null;
  const waiting = summary?.approvals ? summary.approvals.length : null;
  const primaryLabel = isOperator && mode === "chat" ? "Dispatch command" : "Post";

  return (
    <div className={`hq-room hq-cc hq-cc--view-${view}`}>
      <div className="hq-room-matrix" aria-hidden="true" />
      <script id="hq-room" type="application/json" dangerouslySetInnerHTML={{ __html: roomJsonScript(transcript) }} />

      <div className="hq-cc-layout">
        <section className="hq-cc-card hq-cc-hero" aria-label="Command center">
          <p className="hq-cc-kicker">SookLabs HQ / Swarm control</p>
          <h1>Finish Line Command Center</h1>
          <p className="hq-cc-lead">One instruction. Shared context. Specialized execution.</p>
          <div className="hq-cc-pills">
            <span className={`hq-cc-pill${draft ? " hq-cc-pill--draft" : " hq-cc-pill--live"}`}>
              <span className="hq-cc-dot" aria-hidden="true" />
              {draft ? "Draft" : "Room live"}
            </span>
            {storageLabel(roomStorage) ? <span className="hq-cc-pill">{storageLabel(roomStorage)}</span> : null}
            <button type="button" className="hq-cc-pill hq-cc-pill--button" onClick={copyLink}>
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
          {draft ? (
            <p className="hq-cc-note" role="status">
              Draft until HQ_ROOM_STATUS=live.
              {configuredCount === 0 ? " No seat connection is configured, so nobody can post." : ""}
            </p>
          ) : null}
          <dl className="hq-cc-stats">
            <div>
              <dt>Finish-line estimate</dt>
              <dd className="hq-cc-big">{percent === null ? "—" : `${percent}%`}</dd>
              {percent !== null ? (
                <div className="hq-cc-bar" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
                  <span style={{ width: `${percent}%` }} />
                </div>
              ) : null}
              <dd className="hq-cc-sub" title={summary?.finishLine?.basis || ""}>
                {percent === null ? (opened ? summary?.error || "Loading…" : "Load the room") : "Four-front control-plane estimate; not a percentage of all acceptance rows."}
              </dd>
            </div>
            <div>
              <dt>Baton holder</dt>
              <dd className="hq-cc-big hq-cc-big--text">{latestBaton ? seatName(latestBaton.baton.to) : "—"}</dd>
              <dd className="hq-cc-sub">{latestBaton ? latestBaton.baton.task || latestBaton.body : opened ? "No baton yet" : "Load the room"}</dd>
            </div>
            <div>
              <dt>Awaiting Mark</dt>
              <dd className="hq-cc-big">{waiting === null ? "—" : waiting}</dd>
              <dd className="hq-cc-sub">approval gates</dd>
            </div>
            <div>
              <dt>Live / ready seats</dt>
              <dd className="hq-cc-big">{strip.length ? `${liveSeats.length}/${strip.length}` : "—"}</dd>
              <dd className="hq-cc-sub" title="Live = a server-side adapter with credentials, or a polling seat seen in the last 5 minutes.">
                {strip.length
                  ? `${liveSeats.length} live · ${readySeats.length - liveSeats.length} idle · ${offlineSeats.length} offline`
                  : "Load the room"}
              </dd>
            </div>
          </dl>
        </section>

        <nav className="hq-cc-tabs" aria-label="Room views">
          <button type="button" className={`hq-cc-chip${view === "room" ? " hq-cc-chip--active" : ""}`} aria-pressed={view === "room"} onClick={() => setView("room")}>
            Room
          </button>
          <button
            type="button"
            className={`hq-cc-chip${view === "acceptance" ? " hq-cc-chip--active" : ""}`}
            aria-pressed={view === "acceptance"}
            onClick={() => setView("acceptance")}
          >
            Acceptance &amp; Sources
          </button>
        </nav>

        <section className="hq-cc-card hq-cc-pulsecard" aria-label="System pulse">
          <header className="hq-cc-cardhead">
            <h2>System pulse</h2>
            <span className="hq-cc-muted">{opened ? "live state" : "not loaded"}</span>
          </header>
          {renderPulse()}
        </section>

        <section className="hq-cc-card hq-cc-seatscard" aria-label="Swarm seats">
          <header className="hq-cc-cardhead">
            <div>
              <h2>Swarm seats</h2>
              <p className="hq-cc-muted">Tap a seat to filter the mission thread.</p>
            </div>
            <button type="button" className="hq-cc-btn" onClick={() => setSeatFilter("")} aria-pressed={!seatFilter}>
              Show all
            </button>
          </header>
          <div className="hq-cc-seatgrid">
            {AGENT_SEATS.map((item) => {
              const state = seatState(item.id);
              const row = strip.find((entry) => entry.seatId === item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`hq-cc-seat${seatFilter === item.id ? " hq-cc-seat--active" : ""}`}
                  aria-pressed={seatFilter === item.id}
                  onClick={() => setSeatFilter((current) => (current === item.id ? "" : item.id))}
                  title={row ? (row.ready ? `${row.adapter} adapter` : `Not connected: ${row.missing}`) : ""}
                >
                  <span className="hq-cc-seat-name">
                    {item.callsign}
                    <span className={`hq-cc-dot hq-cc-tone--${tone(state)}`} aria-hidden="true" />
                  </span>
                  <span className="hq-cc-seat-role">{item.role}</span>
                  <span className="hq-cc-seat-state">{(SEAT_STATE_LABEL[state] || state).toLowerCase()}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="hq-cc-card hq-cc-threadhead" aria-label="Mission thread filters">
          <h2>Live mission thread</h2>
          <p className="hq-cc-muted">Mark → fan-out → seat replies → baton → evidence</p>
          <div className="hq-cc-chips" role="group" aria-label="Filter">
            {THREAD_FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`hq-cc-chip${kindFilter === item.id ? " hq-cc-chip--active" : ""}`}
                aria-pressed={kindFilter === item.id}
                onClick={() => setKindFilter(item.id)}
              >
                {item.label}
              </button>
            ))}
            {seatFilter ? (
              <button type="button" className="hq-cc-chip hq-cc-chip--active" onClick={() => setSeatFilter("")}>
                {seatName(seatFilter)} ✕
              </button>
            ) : null}
          </div>
        </section>

        <section className="hq-cc-thread" aria-label="Mission thread" aria-live="polite">
          {!opened ? <p className="hq-cc-card hq-cc-empty">Choose your seat and enter its key below to load the room.</p> : null}
          {opened && visibleThread.length === 0 ? (
            <p className="hq-cc-card hq-cc-empty">{messages.length ? "Nothing matches this filter." : "No posts yet."}</p>
          ) : null}
          {visibleThread.map((message) => renderCard(message))}
        </section>

        <form className="hq-cc-card hq-cc-composer" onSubmit={onSubmit} aria-label="Command composer">
          <div className="hq-cc-seatpick" role="group" aria-label="Post as">
            {seats.map((item) => {
              const live = roomSeats.find((row) => row.id === item.id);
              const silent = seatPresence(live?.lastSeenAt) === "silent";
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`hq-cc-chip${seat === item.id ? " hq-cc-chip--active" : ""}`}
                  aria-pressed={seat === item.id}
                  onClick={() => selectSeat(item.id)}
                  title={silent ? "No post in the last 15 minutes" : item.role}
                >
                  {item.callsign}
                </button>
              );
            })}
          </div>
          <div className="hq-cc-keyrow">
            <label htmlFor="room-connection">
              {connectionName} key
              <input
                id="room-connection"
                type="password"
                autoComplete="off"
                spellCheck={false}
                value={connectionToken}
                onChange={(event) => setConnectionToken(event.target.value)}
              />
            </label>
            <button
              type="button"
              className="hq-cc-btn"
              onClick={openRoom}
              disabled={posting || !connectionToken}
            >
              {opened ? "Refresh" : "Load"}
            </button>
          </div>
          <div className="hq-cc-remember">
            {remembered ? (
              <>
                <span className="hq-cc-muted">{connectionName} key saved on this device.</span>
                <button type="button" className="hq-cc-btn hq-cc-btn--quiet" onClick={forgetKey}>
                  Forget
                </button>
              </>
            ) : (
              <label>
                <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
                Remember on this device (your own phone or computer only)
              </label>
            )}
          </div>

          <div className="hq-cc-chips" role="group" aria-label="Address">
            {["all", ...AGENT_SEATS.map((item) => item.id)].map((name) => (
              <button key={name} type="button" className="hq-cc-chip" onClick={() => insertMention(name)}>
                @{name}
              </button>
            ))}
          </div>

          <label className="hq-cc-command" htmlFor="room-text">
            {mode === "chat" ? "Command" : mode === "baton" ? "Baton note" : mode === "evidence" ? "Evidence" : "Decision"}
            <textarea
              id="room-text"
              ref={textRef}
              value={text}
              maxLength={ROOM_TEXT_MAX}
              rows={3}
              placeholder={isOperator ? "Tell the swarm what needs to happen next…" : "Reply, hand off, or attach evidence…"}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={onTextKeyDown}
            />
          </label>

          {mode === "baton" ? (
            <div className="hq-cc-fields">
              <label>
                Baton to
                <select value={batonTo} onChange={(event) => setBatonTo(event.target.value)}>
                  <option value="">Anyone</option>
                  {AGENT_SEATS.filter((item) => item.id !== seat).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.callsign}
                    </option>
                  ))}
                </select>
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
            </div>
          ) : null}
          {mode === "evidence" || mode === "baton" ? (
            <div className="hq-cc-fields">
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
                <input value={refUrl} onChange={(event) => setRefUrl(event.target.value)} placeholder="https://github.com/…" />
              </label>
            </div>
          ) : null}

          <div className="hq-cc-composer-bar">
            {kinds.includes("baton") ? (
              <button type="button" className={`hq-cc-btn${mode === "baton" ? " hq-cc-btn--on" : ""}`} aria-pressed={mode === "baton"} onClick={() => toggleMode("baton")}>
                + Baton
              </button>
            ) : null}
            {kinds.includes("evidence") ? (
              <button
                type="button"
                className={`hq-cc-btn${mode === "evidence" ? " hq-cc-btn--on" : ""}`}
                aria-pressed={mode === "evidence"}
                onClick={() => toggleMode("evidence")}
              >
                + Evidence
              </button>
            ) : null}
            {kinds.includes("decision") ? (
              <button
                type="button"
                className={`hq-cc-btn${mode === "decision" ? " hq-cc-btn--on" : ""}`}
                aria-pressed={mode === "decision"}
                onClick={() => toggleMode("decision")}
              >
                + Decision
              </button>
            ) : null}
            <Button type="submit" variant="primary" loading={posting} disabled={!text.trim() || !connectionToken}>
              {primaryLabel}
            </Button>
          </div>
          {error ? (
            <p className="hq-room-error" role="alert">
              {error}
            </p>
          ) : (
            <p className="hq-cc-muted">
              The server stamps the author from the key. A plain message from Mark goes to every connected agent; @seat narrows it.
            </p>
          )}
        </form>

        <aside className="hq-cc-side">
          {isOperator ? <SeatRequests connectionToken={connectionToken} opened={opened} seat={seat} /> : null}
          <AcceptancePanel connectionToken={connectionToken} opened={opened} isOperator={isOperator} />

          <section className="hq-cc-card" aria-label="Approval gates">
            <header className="hq-cc-cardhead">
              <h2>Approval gates</h2>
              {waiting !== null ? <span className="hq-cc-pill">{waiting} waiting</span> : null}
            </header>
            {!summary ? (
              <p className="hq-cc-muted">Loads with the room.</p>
            ) : summary.error ? (
              <p className="hq-cc-muted">{summary.error}</p>
            ) : summary.approvals.length === 0 ? (
              <p className="hq-cc-muted">Nothing is waiting on Mark.</p>
            ) : (
              <ul className="hq-cc-list">
                {summary.approvals.map((item) => (
                  <li key={item.id}>
                    <span className="hq-cc-muted">
                      {item.type || "Agent job"}
                      {item.provider ? ` · ${item.provider}` : ""}
                    </span>
                    <strong>{item.summary || item.id}</strong>
                    <a className="hq-cc-btn" href="/hq/automation">
                      Review in HQ
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <p className="hq-cc-muted">Merges, deploys, and publishing are approved by Mark outside this room.</p>
          </section>

          <section className="hq-cc-card" aria-label="PR field">
            <header className="hq-cc-cardhead">
              <h2>PR field</h2>
              {prField ? <span className="hq-cc-muted">{prField.freshness}</span> : null}
            </header>
            {!prField ? (
              <p className="hq-cc-muted">Loads with the room.</p>
            ) : prField.prs?.length ? (
              <ul className="hq-cc-list">
                {prField.prs.map((pr) => (
                  <li key={`${pr.repo}#${pr.number}`} className="hq-cc-pr">
                    <a href={pr.url}>
                      <strong>
                        #{pr.number} {pr.title}
                      </strong>
                    </a>
                    <span className="hq-cc-muted">{pr.merged ? "merged" : pr.draft ? "draft" : pr.state}</span>
                    <span className={`hq-cc-ci hq-cc-ci--${pr.ciState}`}>{ciMark(pr.ciState)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="hq-cc-muted">
                No PRs to show.{prField.freshness === "source unavailable" ? " HQ has no GitHub token yet." : ""}
                {prField.error ? ` ${prField.error}` : ""}
              </p>
            )}
          </section>

          <section className="hq-cc-card" aria-label="Current blockers">
            <h2>Current blockers</h2>
            {opened && controlPlaneBlockers !== "ok" ? (
              <p className="hq-cc-muted" role="status">
                {controlPlaneBlockers === "loading" ? "Loading control-plane blockers…" : "Control-plane blockers unavailable."}
              </p>
            ) : null}
            {!opened ? (
              <p className="hq-cc-muted">Loads with the room.</p>
            ) : blockers.length === 0 ? (
              controlPlaneBlockers === "ok" ? <p className="hq-cc-muted">No open blockers.</p> : null
            ) : (
              <ul className="hq-cc-list">
                {blockers.map((item) => (
                  <li key={item.id}>
                    <strong>{item.href ? <a href={item.href}>{item.title}</a> : item.title}</strong>
                    {item.detail ? <span className="hq-cc-muted">{item.detail}</span> : null}
                    {isOperator && item.action === "connect" ? (
                      <button type="button" className="hq-cc-btn" disabled={posting} onClick={() => connectSeat(item.seatId, true)}>
                        Connect
                      </button>
                    ) : null}
                    {isOperator && item.action === "disconnect" ? (
                      <button type="button" className="hq-cc-btn hq-cc-btn--quiet" disabled={posting} onClick={() => connectSeat(item.seatId, false)}>
                        Disconnect
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {promoted ? (
            <section className="hq-cc-card" aria-label="Promoted">
              <h2>Promoted</h2>
              <p className="hq-cc-muted">
                Committed to <code>{promoted.branch}</code>: <a href={promoted.url}>{String(promoted.sha).slice(0, 7)}</a>
              </p>
            </section>
          ) : null}
          {held.length > 0 ? (
            <section className="hq-cc-card" aria-label="Held broadcasts">
              <h2>Held broadcasts</h2>
              <ul className="hq-cc-list">
                {held.map((row) => (
                  <li key={row.id}>{row.warning || "Held. Not on the public feed."}</li>
                ))}
              </ul>
            </section>
          ) : null}
          {paste ? (
            <section className="hq-cc-card" aria-label="Ready to paste">
              <h2>Ready to paste</h2>
              <p className="hq-cc-muted">For the writer seat. This room did not commit.</p>
              <pre className="hq-room-paste">{paste}</pre>
            </section>
          ) : null}

          <details className="hq-cc-card hq-cc-details">
            <summary>Live board (.md)</summary>
            <pre className="hq-room-paste">{boardMarkdown(board)}</pre>
          </details>

          <details className="hq-cc-card hq-cc-details">
            <summary>Roles pact and views</summary>
            <ul className="hq-cc-list">
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
            <nav className="hq-cc-chips" aria-label="Viewing tiers">
              {TIER_LINKS.map((item) => (
                <a key={item.id} className={`hq-cc-chip${tier === item.id ? " hq-cc-chip--active" : ""}`} href={item.href} aria-current={tier === item.id ? "page" : undefined}>
                  {item.label}
                </a>
              ))}
              <a className="hq-cc-chip" href="/hq">
                HQ home
              </a>
            </nav>
          </details>
        </aside>
      </div>
    </div>
  );
}
