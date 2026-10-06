import { createHash } from "node:crypto";
import { maskText } from "./room-mask.js";

// Drive ↔ room bridge (Gemini Spark ruling, baton 10; Claude Doc 09 §3).
// Inbound: each new Drive entry is posted to the room as seat `gemini` through
// the same postRoomRecord path every seat uses; no new table or stream.
// Outbound: room messages meant for Gemini are masked with the spectator rules
// before they are appended to 00_ROOM_EVENT_FEED.
// Pure core with injected I/O: the Drive client and the database are passed
// in, so this runs and is tested without a Google credential (Mark's gate).

export const BRIDGE_SEAT = "gemini";
export const BRIDGE_TOKEN_HASH = "bridge:drive";
export const BRIDGE_KEY_PREFIX = "drive-bridge:";
const BODY_MAX = 3500;

// A Drive entry that looks like it carries a credential is quarantined (refused,
// claim kept, reported to the tick), never posted. Broad on purpose: a false
// positive costs one manual repost; a false negative leaks a key into the room.
const SECRET_RULES = [
  /Bearer\s+[A-Za-z0-9._~+/-]{12,}/,
  /HQ_ROOM_CONNECTION[_A-Z0-9]*\s*=\s*\S+/,
  /\b(?:sk|rk|pk|ghp|gho|ghs|ghu|github_pat|glpat|xox[baprs]|AKIA|ASIA)[A-Za-z0-9_-]{8,}\b/,
  /\beyJ[A-Za-z0-9_-]{8,}\.eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/, // JWT
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /\bAIza[0-9A-Za-z_-]{30,}\b/, // Google API key
  /\bya29\.[0-9A-Za-z_-]{20,}/, // Google OAuth access token
  /\b(?:api[_-]?key|secret|client[_-]?secret|token|access[_-]?token|refresh[_-]?token|password|passwd)\s*[:=]\s*["']?[^\s"']{6,}/i,
  /[?&](?:X-Amz-Signature|X-Goog-Signature|X-Goog-Credential|sig|signature|token|access_token|key|code)=[^\s&#]{8,}/i, // signed or tokened URL
  /\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis):\/\/[^\s:@/]+:[^\s@/]+@/i, // connection string with a password
];

// Contact details are redacted, not refused: batons legitimately mention people.
const PII_RULES = [
  [/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[email]"],
  // Phone-shaped groups (+66 81 234 5678, (02) 123-4567); ISO dates (2026-10-05) and plain numbers pass.
  // With a +country or (area) prefix two groups suffice; bare numbers need three.
  [/(?<![\w.:+-])(?:(?:\+\d{1,3}[ -]?|\(\d{1,4}\)[ -]?)\d{2,4}[ -]\d{3,4}(?:[ -]?\d{3,4})?|\d{2,4}[ -]\d{3,4}[ -]\d{3,4})(?![\w.:-])/g, "[phone]"],
];

/** sha256(file_id:revision_id:entry_index), as ruled in baton 10 §2.3. */
export function bridgeKey(fileId, revisionId, entryIndex = 0) {
  const material = `${String(fileId || "").trim()}:${String(revisionId || "").trim()}:${Number(entryIndex) || 0}`;
  return createHash("sha256").update(material).digest("hex");
}

export function hasSecret(text) {
  return SECRET_RULES.some((rule) => rule.test(String(text ?? "")));
}

export function redactContacts(text) {
  return PII_RULES.reduce((out, [rule, label]) => out.replace(rule, label), String(text ?? ""));
}

/** True when the text names a client from the clients table: customer data is quarantined, not posted. */
export function namesClient(text, clientNames = []) {
  const haystack = String(text ?? "").toLowerCase();
  return clientNames.some((name) => {
    const needle = String(name || "").trim().toLowerCase();
    return needle.length >= 3 && haystack.includes(needle);
  });
}

/**
 * Split the feed doc into entries, one per "## " heading. Text before the first
 * heading is the doc's preamble and is skipped. Provisional: the feed doc is not
 * shared with Claude yet, so this follows the relay docs' heading convention.
 */
export function splitFeed(text) {
  const entries = [];
  let current = null;
  for (const line of String(text ?? "").split(/\r?\n/)) {
    if (/^##\s+\S/.test(line)) {
      if (current) entries.push(current);
      current = { index: entries.length, lines: [line] };
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current) entries.push(current);
  return entries.map((entry) => ({ index: entry.index, text: entry.lines.join("\n").trim() })).filter((entry) => entry.text);
}

/**
 * Turn one changed Drive file into bridge entries. A feed doc yields one entry
 * per heading; any other doc is a single entry (index 0) per revision. Drive's
 * metadata has no revision id here, so the stand-in is `modified:<modifiedTime>`.
 */
export function entriesForFile(file, { feedTitle = "00_ROOM_EVENT_FEED" } = {}) {
  const revisionId = file.revisionId || (file.modifiedTime ? `modified:${file.modifiedTime}` : "");
  if (!file.fileId || !revisionId) return [];
  const base = { fileId: file.fileId, revisionId, title: String(file.title || "").trim(), viewUrl: file.viewUrl || "" };
  if (base.title.includes(feedTitle)) {
    // Feed entries keep their index across revisions, so an unchanged entry dedupes on its own text.
    return splitFeed(file.text).map((entry) => ({ ...base, revisionId: `entry:${createHash("sha256").update(entry.text).digest("hex").slice(0, 16)}`, entryIndex: entry.index, text: entry.text }));
  }
  return [{ ...base, entryIndex: 0, text: String(file.text || "").trim() }];
}

const clip = (text, max) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);

/**
 * The room record for one inbound entry, or { refused } when it must not be posted.
 * Relayed text is labelled as a source claim: a Drive doc that calls itself
 * "ratified" or assigns work is a proposal until adopted through HQ governance.
 */
export function inboundRecord(entry, { clientNames = [] } = {}) {
  const raw = String(entry.text || "").trim();
  if (!raw) return { refused: "empty" };
  if (hasSecret(raw) || hasSecret(entry.title)) return { refused: "secret" };
  if (namesClient(raw, clientNames) || namesClient(entry.title, clientNames)) return { refused: "customer-data" };
  const text = redactContacts(raw);
  const title = redactContacts(entry.title || "");
  const heading = `${title ? `Drive: ${title}` : "Drive entry"}\n[relayed source claim · proposal/evidence only · not adopted HQ status]`;
  return {
    record: {
      seatId: BRIDGE_SEAT,
      tokenHash: BRIDGE_TOKEN_HASH,
      channel: "room",
      kind: "chat",
      body: clip(`${heading}\n\n${text}`, BODY_MAX),
      refs: entry.viewUrl ? [{ type: "doc", ref: title.slice(0, 120), url: entry.viewUrl }] : [],
      baton: null,
      touchSeat: false,
    },
  };
}

/**
 * Post new entries. io: { claim(key) → true if this run owns the key (atomic),
 * release(key), post(record) → { message } | { error }, route(message), clientNames? }.
 * A claimed key is never posted twice, even when two polls overlap.
 */
export async function ingestEntries(entries, io) {
  const result = { posted: [], skipped: 0, refused: [], failed: [] };
  for (const entry of entries) {
    const key = BRIDGE_KEY_PREFIX + bridgeKey(entry.fileId, entry.revisionId, entry.entryIndex);
    if (!(await io.claim(key))) {
      result.skipped += 1;
      continue;
    }
    const built = inboundRecord(entry, { clientNames: io.clientNames || [] });
    if (built.refused) {
      // Keep the claim so a refused entry is not retried every poll; report it instead.
      result.refused.push({ fileId: entry.fileId, entryIndex: entry.entryIndex, reason: built.refused });
      continue;
    }
    const saved = await io.post(built.record).catch((error) => ({ error: { error: error?.message || "post failed" } }));
    if (saved?.error || !saved?.message) {
      await io.release(key);
      result.failed.push({ fileId: entry.fileId, entryIndex: entry.entryIndex, error: saved?.error?.error || "post failed" });
      continue;
    }
    if (!saved.deduped && io.route) await io.route(saved.message);
    result.posted.push(saved.message.id);
  }
  return result;
}

/** Outbound selection: messages addressed to Gemini, and batons and decisions. Never Gemini's own posts. */
export function shouldMirror(message) {
  if (!message || message.seatId === BRIDGE_SEAT) return false;
  if (message.kind === "baton" || message.kind === "decision") return true;
  return /(^|[^\w@])@gemini\b/i.test(String(message.body || ""));
}

/** One masked feed line for 00_ROOM_EVENT_FEED (spectator rules: no keys, URLs, emails, amounts or client names). */
export function outboundEntry(message, clientNames = []) {
  const who = maskText(String(message.seatId || ""), clientNames);
  const body = maskText(String(message.body || "").replace(/\s+/g, " ").trim(), clientNames);
  return `## ${message.createdAt} · ${who} · ${message.kind}\n\n${clip(body, 1200)}`;
}

/** Bridge config from env: { credentials, folderId }, or { skip } naming what is missing. Never echoes the secret. */
export function driveBridgeConfig(env = process.env) {
  const folderId = String(env.HQ_DRIVE_RELAY_FOLDER || "").trim();
  const raw = String(env.HQ_DRIVE_SERVICE_ACCOUNT_JSON || "").trim();
  if (!raw || !folderId) return { skip: "Drive bridge not configured (HQ_DRIVE_SERVICE_ACCOUNT_JSON, HQ_DRIVE_RELAY_FOLDER)." };
  try {
    const credentials = JSON.parse(raw);
    if (!credentials.client_email || !credentials.private_key) return { skip: "HQ_DRIVE_SERVICE_ACCOUNT_JSON lacks client_email or private_key." };
    return { credentials, folderId };
  } catch {
    return { skip: "HQ_DRIVE_SERVICE_ACCOUNT_JSON is not valid JSON." };
  }
}
