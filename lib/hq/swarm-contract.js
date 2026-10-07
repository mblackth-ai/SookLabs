// HQ room contract. Safe for client and server.
// The share link is open. The server stamps the author from that seat's connection.

export const ROOM_SHARE_URL = "https://hq.sooklabs.com/room";
export const ROOM_PATH = "/hq/room";
export const ROOM_API_PATH = "/hq/api/room";
export const ROOM_CHANNEL = "room";
export const ROOM_KINDS = ["chat", "baton", "decision", "evidence", "status"];
export const ROOM_TIERS = ["operator", "agent", "crew", "spectator"];
export const ROOM_REF_TYPES = ["pr", "commit", "ci", "file", "doc"];
export const ROOM_TEXT_MAX = 4096;
export const ROOM_HISTORY_LIMIT = 500;
export const ROOM_READ_DEFAULT = 200;
export const ROOM_DEDUPE_MS = 5000;
export const BROADCAST_DELAY_MS = 15 * 60 * 1000;
/** How long a seat stays present after real work. Rest pings are not posted. */
export const NO_REST_WINDOW_MS = 30 * 60 * 1000;
export const SILENT_AFTER_MS = NO_REST_WINDOW_MS;
export const WRITER_SEAT = "cursor";
export const SSE_HEARTBEAT_MS = 25000;

export const ROOM_SEATS = [
  { id: "mark", callsign: "Mark", glyph: "M", hue: "cyan", role: "Operator", tier: "operator" },
  { id: "claude", callsign: "Claude", glyph: "C", hue: "amber", role: "Backend", tier: "agent" },
  { id: "cursor", callsign: "Cursor", glyph: "Cu", hue: "violet", role: "Writer", tier: "agent" },
  { id: "codex", callsign: "Codex", glyph: "Cx", hue: "green", role: "Tests", tier: "agent" },
  { id: "grok", callsign: "Grok", glyph: "G", hue: "blue", role: "Chief of Staff", tier: "agent", orchestrator: true },
  { id: "gemini", callsign: "Gemini", glyph: "Ge", hue: "teal", role: "Specs", tier: "agent" },
  { id: "chatgpt", callsign: "ChatGPT", glyph: "Ch", hue: "slate", role: "Agent", tier: "agent" },
  { id: "crew", callsign: "Crew", glyph: "Cr", hue: "stone", role: "Crew", tier: "crew" },
];

export const ROOM_CONNECTIONS = ROOM_SEATS.map((seat) => ({ seat: seat.id, name: seat.id }));

export const ROOM_PACT = {
  edit: "Each seat posts only through its own named connection. The server stamps the author.",
  stayOff:
    "Spectators get a separate delayed masked feed. The shared HQ login cannot post as a seat. This page does not post to social media and does not write to git.",
  merge: "This room does not merge, deploy, or publish. Mark can queue a broadcast. Promote commits to the room log branch when HQ has GitHub write, and returns a paste block otherwise.",
};

const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export function ulid(now = Date.now()) {
  let time = now;
  let timePart = "";
  for (let i = 0; i < 10; i += 1) {
    timePart = CROCKFORD[time % 32] + timePart;
    time = Math.floor(time / 32);
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let rand = "";
  for (let i = 0; i < 16; i += 1) rand += CROCKFORD[bytes[i] % 32];
  return timePart + rand;
}

export function roomSeat(id) {
  const raw = String(id ?? "").trim().toLowerCase();
  if (!raw) return null;
  return ROOM_SEATS.find((seat) => seat.id === raw || seat.callsign.toLowerCase() === raw) || null;
}

export function connectionForSeat(seat) {
  const parsed = roomSeat(seat);
  if (!parsed) return null;
  return ROOM_CONNECTIONS.find((item) => item.seat === parsed.id) || null;
}

export function connectionEnvKey(name) {
  return `HQ_ROOM_CONNECTION_${String(name || "").toUpperCase()}`;
}

export function mcpSeatEnvKey(name) {
  return `HQ_MCP_SEAT_TOKEN_${String(name || "").toUpperCase()}`;
}

export function normalizeTier(raw) {
  const tier = String(raw ?? "").trim().toLowerCase();
  return ROOM_TIERS.includes(tier) ? tier : "agent";
}

export function seatsForTier(tier) {
  const view = normalizeTier(tier);
  if (view === "spectator") return [];
  return ROOM_SEATS.filter((seat) => seat.tier === view);
}

export function kindsForTier(tier) {
  const view = normalizeTier(tier);
  if (view === "spectator") return [];
  if (view === "crew") return ["chat"];
  if (view === "operator") return ROOM_KINDS;
  return ROOM_KINDS.filter((kind) => kind !== "decision");
}

export function clampRoomLimit(raw, fallback = ROOM_READ_DEFAULT) {
  if (raw == null || raw === "") return fallback;
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(ROOM_HISTORY_LIMIT, Math.max(1, Math.floor(n)));
}

export function normalizeChannel(raw) {
  const channel = String(raw ?? "").trim().toLowerCase();
  if (!channel) return ROOM_CHANNEL;
  if (!/^[a-z0-9-]{1,32}$/.test(channel)) return null;
  return channel;
}

export function normalizeKind(raw) {
  const kind = String(raw ?? "").trim().toLowerCase();
  if (!ROOM_KINDS.includes(kind)) {
    return { ok: false, status: 400, error: "Kind must be chat, baton, decision, evidence, or status." };
  }
  return { ok: true, kind };
}

export function normalizeBody(raw) {
  const body = String(raw ?? "")
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .trim();
  if (!body) return { ok: false, status: 400, error: "Message is required." };
  if (new TextEncoder().encode(body).length > ROOM_TEXT_MAX) {
    return { ok: false, status: 400, error: "Message is too long." };
  }
  return { ok: true, body };
}

export function normalizeRefs(raw) {
  if (raw == null || raw === "") return { ok: true, refs: [] };
  const list = Array.isArray(raw) ? raw : [raw];
  if (list.length > 8) return { ok: false, status: 400, error: "Too many refs." };
  const refs = [];
  for (const item of list) {
    if (!item || typeof item !== "object") return { ok: false, status: 400, error: "A ref must be an object." };
    const type = String(item.type || "").trim().toLowerCase();
    if (!ROOM_REF_TYPES.includes(type)) {
      return { ok: false, status: 400, error: "Ref type must be pr, commit, ci, file, or doc." };
    }
    const url = String(item.url || "").trim();
    const ref = String(item.ref || url).trim();
    if (!ref || ref.length > 300 || (url && url.length > 300)) {
      return { ok: false, status: 400, error: "Ref is too long." };
    }
    refs.push({ type, ref, url });
  }
  return { ok: true, refs };
}

export function verifiedFor(kind, refs) {
  if (kind !== "evidence") return false;
  if (!Array.isArray(refs) || refs.length === 0) return false;
  return refs.every((ref) => ref && ref.resolves === true);
}

export function displayFor(kind, verified) {
  if (kind === "evidence" && !verified) return "unverified";
  return kind;
}

export function normalizeBaton(raw, kind) {
  if (kind !== "baton") return { ok: true, baton: null };
  const source = raw && typeof raw === "object" ? raw : {};
  const word = (value) =>
    String(value ?? "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 160);
  const toSeat = source.to ? roomSeat(source.to) : null;
  if (source.to && !toSeat) return { ok: false, status: 400, error: "Baton target is not a seat." };
  return {
    ok: true,
    baton: {
      to: toSeat ? toSeat.id : "",
      status: word(source.status),
      task: word(source.task),
      next: word(source.next),
      approval: null,
    },
  };
}

export function gateRoomKind(seat, kind) {
  const spec = roomSeat(seat);
  if (!spec) return { ok: false, status: 400, error: "Unknown seat." };
  if (spec.tier === "crew" && kind !== "chat") {
    return { ok: false, status: 403, error: "Crew can post chat replies only, not batons." };
  }
  if (kind === "decision" && spec.tier !== "operator") {
    return { ok: false, status: 403, error: "Only Mark can post a decision." };
  }
  return { ok: true, tier: spec.tier };
}

export function seatPresence(lastSeenAt, now = Date.now()) {
  const at = Date.parse(lastSeenAt || "");
  if (!Number.isFinite(at)) return "silent";
  return now - at > SILENT_AFTER_MS ? "silent" : "seen";
}

const REST_HEARTBEAT =
  /^(?:(?::\s*)?(?:heartbeat|rest|ping|pong|no_reply|no-reply|noreply|keepalive|keep-alive|still here|i'm here|im here|online|alive))[.!]?$/i;

/** A status post whose whole body is a presence ping. Real status text is kept. */
export function isRestHeartbeat(message) {
  const kind = message && typeof message === "object" ? message.kind : "status";
  const body = message && typeof message === "object" ? message.body : message;
  if (kind !== "status") return false;
  return REST_HEARTBEAT.test(String(body ?? "").trim());
}

export function gateRestHeartbeat(kind, body) {
  if (!isRestHeartbeat({ kind, body })) return { ok: true };
  return {
    ok: false,
    status: 400,
    error: "Rest heartbeats are not posted. A seat stays present for 30 minutes after real work.",
  };
}

export function roomBoardRows(messages) {
  return (messages || [])
    .filter((message) => message.kind === "baton" || message.kind === "decision")
    .slice()
    .reverse()
    .map((message) => ({
      id: message.id,
      seat: message.seat,
      task: message.baton?.task || message.body,
      state: message.baton?.status || message.kind,
      evidence: (message.refs || []).find((ref) => ref.url)?.url || "",
      at: message.createdAt,
    }));
}

function mdCell(value) {
  return String(value ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
}

export function boardMarkdown(rows) {
  const header = "| Seat | Task | State | Evidence | When |";
  const rule = "| --- | --- | --- | --- | --- |";
  const lines = (rows || []).map(
    (row) => `| ${mdCell(row.seat)} | ${mdCell(row.task)} | ${mdCell(row.state)} | ${mdCell(row.evidence)} | ${mdCell(row.at)} |`
  );
  return [header, rule, ...lines].join("\n");
}

const oneLine = (value) => String(value ?? "").replace(/\s+/g, " ").trim();

/** The two files a promote writes: one ROOM_LOG.md line and one baton YAML (all values JSON-quoted). */
export function promotionFiles(message) {
  const refs = (message.refs || []).map((ref) => `${ref.type}:${oneLine(ref.ref)}`).join(",");
  const line = `- ${message.createdAt} ${message.id} ${message.seatId} ${message.kind} ${oneLine(message.body)}${refs ? ` refs=${refs}` : ""}`;
  const baton = message.baton || {};
  const yaml = [
    `id: ${JSON.stringify(message.id)}`,
    `seat: ${JSON.stringify(message.seatId)}`,
    `kind: ${JSON.stringify(message.kind)}`,
    `body: ${JSON.stringify(message.body)}`,
    `to: ${JSON.stringify(baton.to || "")}`,
    `status: ${JSON.stringify(baton.status || "")}`,
    `task: ${JSON.stringify(baton.task || "")}`,
    `next: ${JSON.stringify(baton.next || "")}`,
    `approved_by: "mark"`,
    `created_at: ${JSON.stringify(message.createdAt)}`,
  ].join("\n");
  return { line, yamlPath: `docs/relay/batons/${message.id}.yaml`, yaml };
}

export function promotePaste(message, reason = "GitHub write is missing.") {
  const { line, yamlPath, yaml } = promotionFiles(message);
  return [
    `${reason} Ready to paste for the writer seat (cursor).`,
    "This room did not commit.",
    "",
    "docs/relay/ROOM_LOG.md",
    line,
    "",
    yamlPath,
    yaml,
  ].join("\n");
}

export function isDuplicateRoomMessage(latest, next, windowMs = ROOM_DEDUPE_MS) {
  if (!latest || !next) return false;
  if (latest.seatId !== next.seatId || latest.body !== next.body || latest.kind !== next.kind) return false;
  const delta = Date.parse(next.createdAt) - Date.parse(latest.createdAt);
  return Number.isFinite(delta) && delta >= 0 && delta < windowMs;
}

export function roomJsonScript(payload) {
  return JSON.stringify(payload).replace(/</g, "\\u003c");
}
