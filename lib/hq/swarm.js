import "server-only";
import { dispatchReplyError } from "./dispatch-guard.js";
import {
  BROADCAST_DELAY_MS,
  ROOM_HISTORY_LIMIT,
  ROOM_SEATS,
  displayFor,
  isDuplicateRoomMessage,
  promotePaste,
  promotionFiles,
  replyChannel,
  roomSeat,
  ulid,
  verifiedFor,
} from "./swarm-contract";
import { commitCiState, commitPromotion, fetchOpenPrs, githubConfig, prFromApi, resolveRefs } from "./github";
import { maskStillMatches, maskText } from "./room-mask";
import { readRoomFile, writeRoomFile } from "./swarm-file";
import {
  findDispatchPg,
  findMessagePg,
  finishIngestPg,
  insertDispatchesPg,
  listDispatchesPg,
  sweepDispatchesPg,
  touchSeatPg,
  transitionDispatchPg,
  getKvPg,
  holdBroadcastPg,
  insertBroadcastPg,
  insertMcpCallPg,
  insertMessagePg,
  listBroadcastsPg,
  listMessagesPg,
  listPrsPg,
  listSeatsPg,
  loadClientNames,
  recordIngestPg,
  setKvPg,
  setPrCiPg,
  setPromotedShaPg,
  upsertPrPg,
} from "./swarm-pg";

// Room storage. Postgres writes are row-level (see swarm-pg.js). The file store
// is for local dev only: one process, read-modify-write of data/hq/room.json.

const PR_RECONCILE_MS = 10 * 60 * 1000;

function isPostgres() {
  const url = process.env.HQ_DATABASE_URL || process.env.DATABASE_URL;
  return Boolean(url?.trim());
}

export function getRoomStorageMode() {
  return isPostgres() ? "postgres" : "file";
}

function updateFile(mutate) {
  const store = readRoomFile();
  const result = mutate(store);
  store.messages = store.messages.slice(-ROOM_HISTORY_LIMIT);
  store.broadcasts = store.broadcasts.slice(-ROOM_HISTORY_LIMIT);
  store.mcpCalls = store.mcpCalls.slice(-ROOM_HISTORY_LIMIT);
  store.ingest = store.ingest.slice(-ROOM_HISTORY_LIMIT);
  store.dispatches = store.dispatches.slice(-ROOM_HISTORY_LIMIT * 4);
  writeRoomFile(store);
  return result;
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
    threadId: message.threadId || message.id,
    replyTo: message.replyTo || null,
    sourceMessageId: message.replyTo || null,
    dispatchId: message.dispatchId || null,
    hop: message.hop || 0,
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

function seatRow(seatId, hash, seenAt) {
  const spec = roomSeat(seatId);
  return {
    id: spec.id,
    callsign: spec.callsign,
    glyph: spec.glyph,
    hue: spec.hue,
    tier: spec.tier,
    tokenHash: hash || "",
    lastSeenAt: seenAt,
  };
}

export async function readClientNames() {
  return loadClientNames();
}

export async function listRoomMessages({ channel, after, limit }) {
  if (isPostgres()) {
    return (await listMessagesPg({ channel, after, limit: limit || ROOM_HISTORY_LIMIT })).map(presentMessage);
  }
  let messages = readRoomFile().messages.filter((message) => !channel || message.channel === channel);
  if (after) messages = messages.filter((message) => message.createdAt > after);
  if (limit) messages = messages.slice(-limit);
  return messages.map(presentMessage);
}

export async function listRoomSeats() {
  const rows = isPostgres() ? await listSeatsPg() : readRoomFile().seats;
  return ROOM_SEATS.map((seat) => {
    const row = rows.find((item) => item.id === seat.id);
    return presentSeat(row || { ...seat, lastSeenAt: "" });
  });
}

/**
 * Persist one message. With dispatchId it is that dispatch's reply: the seat
 * must match, the thread is inherited, and a second reply returns the first.
 * Returns { error } (status + text) when the dispatch check fails.
 */
// touchSeat: false for relayed posts (the Drive bridge), so a relay never makes a seat look checked in.
export async function postRoomRecord({ seatId, tokenHash: hash, channel, kind, body, refs, baton, dispatchId = null, expectedAttempt = null, touchSeat = true }) {
  // Only evidence is verified, so only evidence pays for the GitHub lookups.
  if (dispatchId) {
    // Server-side truth: answer in the source message's channel (an adapter or MCP reply may not say which).
    const dispatch = await findDispatch(dispatchId);
    channel = replyChannel(channel, dispatch ? await findRoomMessage(dispatch.sourceMessageId) : null);
  }
  const checked = kind === "evidence" ? await resolveRefs(refs) : refs;
  const createdAt = new Date().toISOString();
  const message = {
    id: ulid(),
    channel,
    seatId,
    kind,
    body,
    refs: checked,
    verified: verifiedFor(kind, checked),
    baton,
    promotedSha: null,
    createdAt,
  };
  const seat = touchSeat ? seatRow(seatId, hash, createdAt) : null;
  if (isPostgres()) {
    const saved = await insertMessagePg({ message, seat, isDuplicate: isDuplicateRoomMessage, keep: ROOM_HISTORY_LIMIT, dispatchId, expectedAttempt });
    if (saved.error) return { error: saved.error };
    return { message: presentMessage(saved.message), deduped: saved.deduped, storage: "postgres" };
  }
  return updateFile((store) => {
    if (dispatchId) {
      const dispatch = store.dispatches.find((row) => row.id === dispatchId);
      if (!dispatch || dispatch.seatId !== seatId) return { error: { status: 403, error: "That dispatch is not for this seat." } };
      if (dispatch.replyMessageId) {
        const prior = store.messages.find((row) => row.id === dispatch.replyMessageId);
        return prior
          ? { message: presentMessage(prior), deduped: true, storage: "file" }
          : { error: { status: 409, error: "That dispatch already has a reply." } };
      }
      const replyError = dispatchReplyError(dispatch, { seatId, expectedAttempt });
      if (replyError) return { error: replyError };
      Object.assign(message, { threadId: dispatch.threadId, replyTo: dispatch.sourceMessageId, dispatchId: dispatch.id, hop: dispatch.hop });
      Object.assign(dispatch, { status: "responded", replyMessageId: message.id, leaseUntil: "", updatedAt: createdAt });
    }
    const latest = store.messages[store.messages.length - 1] || null;
    if (!dispatchId && isDuplicateRoomMessage(latest, message)) {
      return { message: presentMessage(latest), deduped: true, storage: "file" };
    }
    store.messages.push(message);
    if (seat) {
      const index = store.seats.findIndex((row) => row.id === seat.id);
      if (index === -1) store.seats.push(seat);
      else store.seats[index] = { ...store.seats[index], ...seat };
    }
    return { message: presentMessage(message), deduped: false, storage: "file" };
  });
}

export async function touchRoomSeat(seatId, hash) {
  const seat = seatRow(seatId, hash, new Date().toISOString());
  if (isPostgres()) return touchSeatPg(seat);
  return updateFile((store) => {
    const index = store.seats.findIndex((row) => row.id === seat.id);
    if (index === -1) store.seats.push(seat);
    else store.seats[index] = { ...store.seats[index], ...seat };
  });
}

// ---- Dispatches (anti-switchboard) ------------------------------------------

export async function insertDispatches(rows) {
  if (isPostgres()) return insertDispatchesPg(rows);
  return updateFile((store) => {
    const created = [];
    for (const row of rows) {
      if (store.dispatches.some((item) => item.sourceMessageId === row.sourceMessageId && item.seatId === row.seatId)) continue;
      const full = { attempts: 0, leaseUntil: "", replyMessageId: null, error: "", ...row, updatedAt: row.createdAt };
      store.dispatches.push(full);
      created.push({ ...full });
    }
    return created;
  });
}

export async function findDispatch(id) {
  if (isPostgres()) return findDispatchPg(id);
  return readRoomFile().dispatches.find((row) => row.id === id) || null;
}

export async function listDispatches({ sourceIds, seatId, statuses, limit = 200 } = {}) {
  if (isPostgres()) return listDispatchesPg({ sourceIds, seatId, statuses, limit });
  return readRoomFile()
    .dispatches.filter(
      (row) =>
        (!sourceIds || sourceIds.includes(row.sourceMessageId)) &&
        (!seatId || row.seatId === seatId) &&
        (!statuses || statuses.includes(row.status))
    )
    .slice(0, limit);
}

export async function transitionDispatch(id, { from, to, leaseMs = null, error = null, bumpAttempt = false, expectedAttempt = null }) {
  if (isPostgres()) return transitionDispatchPg(id, { from, to, leaseMs, error, bumpAttempt, expectedAttempt });
  return updateFile((store) => {
    const row = store.dispatches.find((item) => item.id === id);
    if (!row || !from.includes(row.status)) return null;
    const now = Date.now();
    if (expectedAttempt !== null &&
        (row.attempts !== expectedAttempt || (row.leaseUntil && Date.parse(row.leaseUntil) <= now))) return null;
    Object.assign(row, {
      status: to,
      updatedAt: new Date(now).toISOString(),
      error: error ?? row.error,
      leaseUntil: leaseMs == null ? "" : new Date(now + leaseMs).toISOString(),
      attempts: row.attempts + (bumpAttempt ? 1 : 0),
    });
    return { ...row };
  });
}

export async function sweepDispatches({ timeoutMs }) {
  if (isPostgres()) return sweepDispatchesPg({ timeoutMs });
  return updateFile((store) => {
    const now = Date.now();
    for (const row of store.dispatches) {
      if (["queued", "dispatching", "thinking"].includes(row.status) && now - Date.parse(row.createdAt) > timeoutMs) {
        Object.assign(row, { status: "timed_out", leaseUntil: "", error: row.error || "No reply before the deadline." });
      } else if (row.status === "dispatching" && row.leaseUntil && Date.parse(row.leaseUntil) < now) {
        Object.assign(row, { status: "queued", leaseUntil: "" });
      }
    }
  });
}

export async function findRoomMessage(id) {
  if (isPostgres()) return findMessagePg(id);
  return readRoomFile().messages.find((message) => message.id === id) || null;
}

async function savePromotedSha(id, sha) {
  if (isPostgres()) return setPromotedShaPg(id, sha);
  return updateFile((store) => {
    const message = store.messages.find((item) => item.id === id);
    if (message && !message.promotedSha) message.promotedSha = sha;
    return message?.promotedSha || null;
  });
}

/**
 * Commit a baton or decision to the room log branch when HQ has GitHub write.
 * Without write (or if GitHub refuses) Mark gets the paste block for the writer seat.
 */
export async function promoteRoomRecord(id) {
  const message = await findRoomMessage(id);
  if (!message) return null;
  if (message.kind !== "baton" && message.kind !== "decision") {
    const error = new Error("Only a baton or a decision can be promoted.");
    error.status = 400;
    throw error;
  }
  const presented = presentMessage(message);
  const base = { forSeat: "cursor", storage: getRoomStorageMode() };
  if (message.promotedSha) {
    return { ...base, message: presented, wrote: true, promotedSha: message.promotedSha, paste: "", writeError: "" };
  }
  const { token, repo, logBranch } = githubConfig();
  if (!token) {
    return { ...base, message: presented, wrote: false, promotedSha: null, paste: promotePaste(presented), writeError: "" };
  }
  try {
    const files = promotionFiles(presented);
    const result = await commitPromotion({ id: presented.id, ...files });
    const sha = await savePromotedSha(id, result.sha);
    return {
      ...base,
      message: { ...presented, promotedSha: sha },
      wrote: true,
      promotedSha: sha,
      commitUrl: `https://github.com/${repo}/commit/${sha}`,
      branch: logBranch,
      paste: "",
      writeError: "",
    };
  } catch (error) {
    const reason = `GitHub refused the commit (${error?.status || "network"}).`;
    console.error("room promote commit failed", error?.status || "");
    return { ...base, message: presented, wrote: false, promotedSha: null, paste: promotePaste(presented, reason), writeError: reason };
  }
}

export async function broadcastRoomRecord(id, clientNames) {
  const message = await findRoomMessage(id);
  if (!message) return null;
  const masked = maskText(message.body, clientNames);
  const held = maskStillMatches(masked, clientNames);
  const row = {
    id: ulid(),
    sourceMessageId: message.id,
    maskedBody: masked,
    approvedBy: "mark",
    publishAfter: new Date(Date.now() + BROADCAST_DELAY_MS).toISOString(),
    createdAt: new Date().toISOString(),
    held,
    holdReason: held ? "A mask rule still matches. Held for Mark." : "",
  };
  if (isPostgres()) await insertBroadcastPg(row);
  else updateFile((store) => store.broadcasts.push(row));
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
  const rows = isPostgres() ? await listBroadcastsPg() : readRoomFile().broadcasts;
  const newlyHeld = [];
  const visible = [];
  const held = [];
  for (const row of rows) {
    const due = Date.parse(row.publishAfter) <= now;
    const still = maskStillMatches(row.maskedBody, clientNames);
    if (still && !row.held) {
      row.held = true;
      row.holdReason = "A mask rule still matches. Held for Mark.";
      newlyHeld.push(row);
    }
    if (row.held || still) {
      held.push(publicBroadcast(row, false));
      continue;
    }
    if (!due) continue;
    visible.push({ ...publicBroadcast(row, true), maskedBody: row.maskedBody });
  }
  if (newlyHeld.length) {
    if (isPostgres()) {
      for (const row of newlyHeld) await holdBroadcastPg(row.id, row.holdReason);
    } else {
      updateFile((store) => {
        for (const row of newlyHeld) {
          const target = store.broadcasts.find((item) => item.id === row.id);
          if (target) Object.assign(target, { held: true, holdReason: row.holdReason });
        }
      });
    }
  }
  return { feed: visible, held: review ? held : [], storage: getRoomStorageMode() };
}

export async function recordMcpCall({ tool, seatId }) {
  const call = {
    id: ulid(),
    event: "hq.mcp.call",
    tool,
    seatId: seatId || "",
    createdAt: new Date().toISOString(),
  };
  console.info(JSON.stringify({ event: call.event, tool: call.tool, seat: call.seatId || null, at: call.createdAt }));
  if (isPostgres()) await insertMcpCallPg(call);
  else updateFile((store) => store.mcpCalls.push(call));
  return call;
}

// ---- GitHub projection: PR field ------------------------------------------

async function upsertPr(pr) {
  if (isPostgres()) return upsertPrPg(pr);
  return updateFile((store) => {
    const index = store.prs.findIndex((row) => row.repo === pr.repo && row.number === pr.number);
    if (index === -1) store.prs.push(pr);
    else if (store.prs[index].updatedAt <= pr.updatedAt) {
      const keepCi = pr.ciState === "unknown" && store.prs[index].headSha === pr.headSha;
      store.prs[index] = { ...pr, ciState: keepCi ? store.prs[index].ciState : pr.ciState };
    }
  });
}

async function setPrCi({ repo, headSha, ciState }) {
  if (isPostgres()) return setPrCiPg({ repo, headSha, ciState });
  return updateFile((store) => {
    for (const row of store.prs) if (row.repo === repo && row.headSha === headSha) row.ciState = ciState;
  });
}

async function getKv(key) {
  return isPostgres() ? getKvPg(key) : readRoomFile().kv[key] ?? null;
}

async function setKv(key, value) {
  if (isPostgres()) return setKvPg(key, value);
  return updateFile((store) => {
    store.kv[key] = value;
  });
}

/** Pull open PRs from GitHub into the projection. Safe to call repeatedly. */
export async function reconcilePrs() {
  const prs = await fetchOpenPrs();
  for (const pr of prs) await upsertPr(pr);
  await setKv("github.reconciledAt", new Date().toISOString());
  return { count: prs.length };
}

/**
 * PR field rows. Webhooks keep it current; when the last reconcile is older
 * than 10 minutes and HQ has a token, refresh before answering.
 */
export async function listRoomPrs({ reconcile = true } = {}) {
  const { token } = githubConfig();
  let reconciledAt = await getKv("github.reconciledAt");
  let reconcileError = "";
  if (reconcile && token && (!reconciledAt || Date.now() - Date.parse(reconciledAt) > PR_RECONCILE_MS)) {
    try {
      await reconcilePrs();
      reconciledAt = new Date().toISOString();
    } catch (error) {
      reconcileError = `GitHub read failed (${error?.status || "network"}).`;
    }
  }
  const prs = isPostgres() ? await listPrsPg() : readRoomFile().prs.slice().sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1));
  const stale = !reconciledAt || Date.now() - Date.parse(reconciledAt) > PR_RECONCILE_MS * 3;
  return {
    prs,
    source: token ? "github" : "unavailable",
    reconciledAt: reconciledAt || "",
    freshness: !token ? "source unavailable" : stale ? "stale" : "fresh",
    error: reconcileError,
  };
}

const CI_EVENT_STATE = (conclusion, status) => {
  if (status && status !== "completed") return "pending";
  if (["failure", "cancelled", "timed_out", "action_required", "startup_failure", "stale"].includes(conclusion)) return "fail";
  return conclusion ? "pass" : "unknown";
};

/**
 * Record a verified GitHub delivery once and project it. Returns
 * { duplicate } when GitHub redelivers the same X-GitHub-Delivery.
 */
export async function ingestGithubEvent({ deliveryId, eventType, payload, payloadSha256 }) {
  const repo = payload?.repository?.full_name || "";
  const event = { provider: "github", deliveryId, eventType, repo, payloadSha256, receivedAt: new Date().toISOString() };
  let fresh;
  if (isPostgres()) fresh = await recordIngestPg(event);
  else {
    fresh = updateFile((store) => {
      if (store.ingest.some((row) => row.provider === "github" && row.deliveryId === deliveryId)) return false;
      store.ingest.push(event);
      return true;
    });
  }
  if (!fresh) return { duplicate: true };
  let error = "";
  try {
    const linked = githubConfig().repos.map((value) => value.toLowerCase());
    if (repo && linked.includes(repo.toLowerCase())) {
      if (eventType === "pull_request" && payload.pull_request) {
        await upsertPr(prFromApi(payload.pull_request, repo));
      } else if ((eventType === "check_suite" && payload.check_suite) || (eventType === "status" && payload.sha)) {
        // One suite or status is not the whole picture: with a token, re-read every check on the commit.
        const headSha = eventType === "status" ? payload.sha : payload.check_suite.head_sha;
        const fromEvent =
          eventType === "status"
            ? payload.state === "success"
              ? "pass"
              : payload.state === "pending"
                ? "pending"
                : "fail"
            : CI_EVENT_STATE(payload.check_suite.conclusion, payload.check_suite.status);
        const { token } = githubConfig();
        const ciState = token ? await commitCiState({ repo, sha: headSha, token }) : fromEvent;
        await setPrCi({ repo, headSha, ciState });
      }
    }
  } catch (err) {
    error = err?.message?.slice(0, 200) || "projection failed";
  }
  if (isPostgres()) await finishIngestPg({ provider: "github", deliveryId, error });
  else {
    updateFile((store) => {
      const row = store.ingest.find((item) => item.deliveryId === deliveryId);
      if (row) Object.assign(row, { processedAt: new Date().toISOString(), error });
    });
  }
  return { duplicate: false, error };
}
