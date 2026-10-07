// Anti-switchboard routing rules. Pure: no I/O, safe for client and server.
//
// Mark writes once; the router decides which agent seats get a dispatch.
// Agent posts never fan out on their own — only an explicit @seat, an
// orchestrator's @all, or a baton handoff reaches another agent, and every
// hop is counted so a reply chain cannot run away.

import { ROOM_SEATS, ROOM_TEXT_MAX, roomSeat } from "./swarm-contract.js";

export const DISPATCH_STATES = ["queued", "dispatching", "thinking", "responded", "failed", "offline", "timed_out"];
export const DISPATCH_FINAL = ["responded", "failed", "offline", "timed_out"];
export const ADAPTER_KINDS = ["pull", "webhook", "anthropic", "openai", "xai"];
export const DEFAULT_MAX_HOPS = 3;
export const DEFAULT_TIMEOUT_MS = 30 * 60 * 1000;
export const ONLINE_WINDOW_MS = 5 * 60 * 1000;
export const ENVELOPE_RECENT = 12;
export const ENVELOPE_CHARS = 8000;

const PROVIDER_KEYS = { anthropic: "ANTHROPIC_API_KEY", openai: "OPENAI_API_KEY", xai: "XAI_API_KEY" };

export function agentSeats(seats = ROOM_SEATS) {
  return seats.filter((seat) => seat.tier === "agent");
}

/** @mentions in order, lower-cased. "all" is kept as a keyword. Emails and code are not mentions. */
export function parseMentions(body) {
  const out = [];
  const pattern = /(^|[\s(,;:])@([a-z][a-z0-9-]{1,31})\b/gi;
  let match;
  while ((match = pattern.exec(String(body || "")))) {
    const name = match[2].toLowerCase();
    if (!out.includes(name)) out.push(name);
  }
  return out;
}

export function maxHops(env = {}) {
  const value = Number.parseInt(env.HQ_ROOM_MAX_HOPS || "", 10);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_MAX_HOPS;
}

/**
 * Who should be dispatched for one persisted message.
 * Returns { hop, targets: [{ seatId, reason }], note }.
 */
export function decideRoute(message, { seats = ROOM_SEATS, env = {} } = {}) {
  const author = seats.find((seat) => seat.id === message.seatId);
  const none = (note) => ({ hop: 0, targets: [], note });
  if (!author || author.tier === "crew") return none("Crew and unknown seats do not dispatch.");

  const agents = agentSeats(seats).filter((seat) => seat.id !== author.id);
  const byId = new Map(agents.map((seat) => [seat.id, seat]));
  const mentions = parseMentions(message.body);
  const targets = new Map();
  const add = (seatId, reason) => {
    if (byId.has(seatId) && !targets.has(seatId)) targets.set(seatId, reason);
  };
  const named = mentions.filter((name) => name !== "all").map((name) => roomSeat(name)?.id).filter(Boolean);
  const batonTo = message.kind === "baton" ? message.baton?.to || "" : "";

  if (author.tier === "operator") {
    if (mentions.includes("all")) agents.forEach((seat) => add(seat.id, "all"));
    named.forEach((seatId) => add(seatId, "mention"));
    if (batonTo) add(batonTo, "baton");
    if (targets.size === 0 && message.kind === "chat" && mentions.length === 0) {
      agents.forEach((seat) => add(seat.id, "mark-default"));
    }
    const list = [...targets].map(([seatId, reason]) => ({ seatId, reason }));
    return { hop: 1, targets: list, note: list.length ? "" : "Mark's message was not addressed to an agent." };
  }

  // Agent seat: never a default fan-out.
  const hop = (message.hop || 0) + 1;
  if (hop > maxHops(env)) return none(`Hop limit ${maxHops(env)} reached; posted to the room only.`);
  if (mentions.includes("all") && author.orchestrator) agents.forEach((seat) => add(seat.id, "orchestrator"));
  named.forEach((seatId) => add(seatId, "mention"));
  if (batonTo) add(batonTo, "baton");
  const list = [...targets].map(([seatId, reason]) => ({ seatId, reason }));
  return {
    hop,
    targets: list,
    note: list.length ? "" : mentions.includes("all") ? "Only an orchestrator seat may use @all." : "",
  };
}

/** Which adapter backs a seat, and whether its credentials are present. Never returns a secret. */
export function adapterFor(seatId, env = {}) {
  const key = String(seatId).toUpperCase();
  const kind = String(env[`HQ_SEAT_ADAPTER_${key}`] || "").trim().toLowerCase();
  if (!kind) return { kind: "none", ready: false, missing: `HQ_SEAT_ADAPTER_${key}` };
  if (!ADAPTER_KINDS.includes(kind)) return { kind, ready: false, missing: `HQ_SEAT_ADAPTER_${key} (unknown adapter)` };
  if (kind === "pull") {
    // HQ_SEAT_ISSUED_<SEAT> is a readiness marker set by seatEnv() for an approved self-enrolled key; never a secret.
    const has = Boolean(String(env[`HQ_ROOM_CONNECTION_${key}`] || env[`HQ_MCP_SEAT_TOKEN_${key}`] || env[`HQ_SEAT_ISSUED_${key}`] || "").trim());
    return { kind, ready: has, missing: has ? "" : `HQ_ROOM_CONNECTION_${key}` };
  }
  if (kind === "webhook") {
    const has = Boolean(String(env[`HQ_SEAT_WEBHOOK_URL_${key}`] || "").trim());
    return { kind, ready: has, missing: has ? "" : `HQ_SEAT_WEBHOOK_URL_${key}` };
  }
  const providerKey = PROVIDER_KEYS[kind];
  const has = Boolean(String(env[providerKey] || "").trim());
  return { kind, ready: has, missing: has ? "" : providerKey };
}

/** Seat strip row: online means a reply can actually come back now. */
export function seatPresenceFor(seat, { env = {}, lastSeenAt = "", now = Date.now() } = {}) {
  const adapter = adapterFor(seat.id, env);
  let online = false;
  if (adapter.ready && adapter.kind === "pull") {
    const seen = Date.parse(lastSeenAt || "");
    online = Number.isFinite(seen) && now - seen <= ONLINE_WINDOW_MS;
  } else if (adapter.ready) {
    online = true;
  }
  return { seatId: seat.id, adapter: adapter.kind, ready: adapter.ready, online, missing: adapter.ready ? "" : adapter.missing };
}

const clip = (text, max) => {
  const value = String(text ?? "");
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
};

/**
 * The bounded context an agent receives. Recent messages are capped by count
 * and characters; nothing secret is included (refs are the poster's own).
 */
export function buildEnvelope({ dispatch, source, recent = [], baton = null, prs = [], seats = ROOM_SEATS }) {
  const seat = seats.find((item) => item.id === dispatch.seatId) || { id: dispatch.seatId, callsign: dispatch.seatId, role: "" };
  const from = seats.find((item) => item.id === source.seatId) || { id: source.seatId, callsign: source.seatId };
  const window = [];
  let used = 0;
  for (const message of recent.filter((item) => item.id !== source.id).slice(-ENVELOPE_RECENT).reverse()) {
    const line = { seat: message.seat || message.seatId, kind: message.kind, body: clip(message.body, 600), createdAt: message.createdAt };
    used += line.body.length + 40;
    if (used > ENVELOPE_CHARS) break;
    window.unshift(line);
  }
  return {
    version: 1,
    dispatchId: dispatch.id,
    threadId: dispatch.threadId,
    sourceMessageId: source.id,
    reason: dispatch.reason,
    hop: dispatch.hop,
    seat: { id: seat.id, callsign: seat.callsign, role: seat.role || "" },
    from: { id: from.id, callsign: from.callsign },
    request: source.body,
    channel: source.channel || "room",
    refs: source.refs || [],
    activeBaton: baton ? { to: baton.to, status: baton.status, task: baton.task, next: baton.next } : null,
    prs: prs.slice(0, 5).map((pr) => ({ number: pr.number, repo: pr.repo, title: pr.title, ciState: pr.ciState, url: pr.url })),
    recent: window,
    reply: {
      method: "POST",
      path: "/hq/api/room/messages",
      header: "x-hq-room-connection: <this seat's own connection>",
      body: { dispatchId: dispatch.id, channel: source.channel || "room", kind: "chat", body: "<your answer>" },
    },
    rules: [
      `You are ${seat.callsign} (${seat.role || "agent"}) in channel ${source.channel || "room"}. Answer as yourself, never as Mark.`,
      "Reply once, on this same channel. Your reply is not sent to other agents unless you @mention a seat or hand off a baton.",
      "You have no authority to merge, deploy, publish, change billing or credentials. Ask Mark for those.",
      "Say what you verified and what you did not. Do not invent results.",
    ],
  };
}

/** Plain-text prompt for model-backed seats. */
export function promptFromEnvelope(envelope) {
  const lines = [
    `Request from ${envelope.from.callsign} on channel ${envelope.channel || "room"} (dispatch ${envelope.dispatchId}, thread ${envelope.threadId}):`,
    envelope.request,
  ];
  if (envelope.activeBaton) {
    lines.push("", `Active baton: to ${envelope.activeBaton.to || "—"} · ${envelope.activeBaton.status || "—"} · ${envelope.activeBaton.task || "—"}`);
  }
  if (envelope.refs.length) lines.push("", "Refs:", ...envelope.refs.map((ref) => `- ${ref.type}: ${ref.url || ref.ref}`));
  if (envelope.prs.length) lines.push("", "Open PRs:", ...envelope.prs.map((pr) => `- ${pr.repo}#${pr.number} ${pr.title} (CI ${pr.ciState})`));
  if (envelope.recent.length) {
    lines.push("", "Recent room messages (oldest first):", ...envelope.recent.map((m) => `- ${m.seat} [${m.kind}]: ${m.body}`));
  }
  return lines.join("\n");
}

export function clipReply(text) {
  return clip(String(text || "").trim(), ROOM_TEXT_MAX - 8);
}
