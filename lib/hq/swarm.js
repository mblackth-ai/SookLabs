import "server-only";
import {
  BROADCAST_DELAY_MS,
  ROOM_HISTORY_LIMIT,
  ROOM_SEATS,
  displayFor,
  isDuplicateRoomMessage,
  promotePaste,
  roomSeat,
  ulid,
  verifiedFor,
} from "./swarm-contract";
import { maskStillMatches, maskText } from "./room-mask";
import { readRoomFile, writeRoomFile } from "./swarm-file";
import { loadClientNames, readRoomPg, writeRoomPg } from "./swarm-pg";

function usePostgres() {
  const url = process.env.HQ_DATABASE_URL || process.env.DATABASE_URL;
  return Boolean(url?.trim());
}

export function getRoomStorageMode() {
  return usePostgres() ? "postgres" : "file";
}

async function loadStore() {
  return usePostgres() ? readRoomPg() : readRoomFile();
}

async function saveStore(store) {
  const next = {
    ...store,
    messages: store.messages.slice(-ROOM_HISTORY_LIMIT),
    broadcasts: store.broadcasts.slice(-ROOM_HISTORY_LIMIT),
    mcpCalls: store.mcpCalls.slice(-ROOM_HISTORY_LIMIT),
  };
  if (usePostgres()) return writeRoomPg(next);
  writeRoomFile(next);
  return next;
}

export function presentMessage(message) {
  const seat = roomSeat(message.seatId);
  const verified = message.verified === true;
  return {
    id: message.id,
    channel: message.channel,
    seatId: message.seatId,
    seat: seat?.callsign || message.seatId,
    role: seat?.role || "",
    kind: message.kind,
    body: message.body,
    refs: message.refs || [],
    verified,
    display: displayFor(message.kind, verified),
    baton: message.baton || null,
    promotedSha: message.promotedSha || null,
    createdAt: message.createdAt,
  };
}

export function presentSeat(row) {
  const spec = roomSeat(row.id) || ROOM_SEATS.find((seat) => seat.id === row.id);
  return {
    id: row.id,
    callsign: spec?.callsign || row.callsign,
    glyph: spec?.glyph || row.glyph,
    hue: spec?.hue || row.hue,
    role: spec?.role || "",
    tier: spec?.tier || row.tier,
    lastSeenAt: row.lastSeenAt || "",
  };
}

function touchSeat(store, seatId, hash, seenAt) {
  const spec = roomSeat(seatId);
  const next = {
    id: spec.id,
    callsign: spec.callsign,
    glyph: spec.glyph,
    hue: spec.hue,
    tier: spec.tier,
    tokenHash: hash || "",
    lastSeenAt: seenAt,
  };
  const index = store.seats.findIndex((seat) => seat.id === spec.id);
  if (index === -1) store.seats.push(next);
  else store.seats[index] = { ...store.seats[index], ...next };
}

export async function readClientNames() {
  return loadClientNames();
}

export async function listRoomMessages({ channel, after, limit }) {
  const store = await loadStore();
  let messages = store.messages.filter((message) => !channel || message.channel === channel);
  if (after) messages = messages.filter((message) => message.createdAt > after);
  if (limit) messages = messages.slice(-limit);
  return messages.map(presentMessage);
}

export async function listRoomSeats() {
  const store = await loadStore();
  return ROOM_SEATS.map((seat) => {
    const row = store.seats.find((item) => item.id === seat.id);
    return presentSeat(row || { ...seat, lastSeenAt: "" });
  });
}

export async function postRoomRecord({ seatId, tokenHash: hash, channel, kind, body, refs, baton }) {
  const verified = verifiedFor(kind, refs);
  const store = await loadStore();
  const createdAt = new Date().toISOString();
  const message = {
    id: ulid(),
    channel,
    seatId,
    kind,
    body,
    refs,
    verified,
    baton,
    promotedSha: null,
    createdAt,
  };
  const latest = store.messages[store.messages.length - 1] || null;
  if (isDuplicateRoomMessage(latest, message)) {
    return { message: presentMessage(latest), deduped: true, storage: getRoomStorageMode() };
  }
  store.messages.push(message);
  touchSeat(store, seatId, hash, createdAt);
  await saveStore(store);
  return { message: presentMessage(message), deduped: false, storage: getRoomStorageMode() };
}

export async function findRoomMessage(id) {
  const store = await loadStore();
  return store.messages.find((message) => message.id === id) || null;
}

export async function promoteRoomRecord(id) {
  const store = await loadStore();
  const message = store.messages.find((item) => item.id === id);
  if (!message) return null;
  if (message.kind !== "baton" && message.kind !== "decision") {
    const error = new Error("Only a baton or a decision can be promoted.");
    error.status = 400;
    throw error;
  }
  const presented = presentMessage(message);
  return {
    message: presented,
    wrote: false,
    promotedSha: null,
    forSeat: "cursor",
    paste: promotePaste(presented),
    storage: getRoomStorageMode(),
  };
}

export async function broadcastRoomRecord(id, clientNames) {
  const store = await loadStore();
  const message = store.messages.find((item) => item.id === id);
  if (!message) return null;
  const masked = maskText(message.body, clientNames);
  const held = maskStillMatches(masked, clientNames);
  const createdAt = new Date().toISOString();
  const row = {
    id: ulid(),
    sourceMessageId: message.id,
    maskedBody: masked,
    approvedBy: "mark",
    publishAfter: new Date(Date.now() + BROADCAST_DELAY_MS).toISOString(),
    createdAt,
    held,
    holdReason: held ? "A mask rule still matches. Held for Mark." : "",
  };
  store.broadcasts.push(row);
  await saveStore(store);
  return { broadcast: publicBroadcast(row, false), storage: getRoomStorageMode() };
}

function publicBroadcast(row, includeBody) {
  return {
    id: row.id,
    sourceMessageId: row.sourceMessageId,
    maskedBody: includeBody ? row.maskedBody : undefined,
    approvedBy: row.approvedBy,
    publishAfter: row.publishAfter,
    createdAt: row.createdAt,
    held: row.held === true,
    warning: row.holdReason || "",
  };
}

export async function readPublicFeed({ now = Date.now(), clientNames = [], review = false }) {
  const store = await loadStore();
  let changed = false;
  const visible = [];
  const held = [];
  for (const row of store.broadcasts) {
    const due = Date.parse(row.publishAfter) <= now;
    const still = maskStillMatches(row.maskedBody, clientNames);
    if (still && !row.held) {
      row.held = true;
      row.holdReason = "A mask rule still matches. Held for Mark.";
      changed = true;
    }
    if (row.held || still) {
      held.push(publicBroadcast(row, false));
      continue;
    }
    if (!due) continue;
    visible.push({ ...publicBroadcast(row, true), maskedBody: row.maskedBody });
  }
  if (changed) await saveStore(store);
  return { feed: visible, held: review ? held : [], storage: getRoomStorageMode() };
}

export async function recordMcpCall({ tool, seatId }) {
  const store = await loadStore();
  const call = {
    id: ulid(),
    event: "hq.mcp.call",
    tool,
    seatId: seatId || "",
    createdAt: new Date().toISOString(),
  };
  store.mcpCalls.push(call);
  await saveStore(store);
  return call;
}
