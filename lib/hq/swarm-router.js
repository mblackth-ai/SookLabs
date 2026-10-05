import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { createHmac } from "crypto";
import { ROOM_SEATS, ulid } from "./swarm-contract";
import {
  adapterFor,
  agentSeats,
  buildEnvelope,
  clipReply,
  decideRoute,
  DEFAULT_TIMEOUT_MS,
  promptFromEnvelope,
  seatPresenceFor,
} from "./swarm-routing";
import { seatEnv } from "./seat-auth";
import {
  findDispatch,
  findRoomMessage,
  insertDispatches,
  listDispatches,
  listRoomMessages,
  listRoomPrs,
  postRoomRecord,
  presentMessage,
  sweepDispatches,
  transitionDispatch,
} from "./swarm";

// Anti-switchboard router: message → routing decision → dispatch rows →
// seat adapter → agent → reply into the room under the agent's own seat.
//
// Dispatch rows are created after the message is committed, in their own
// writes, so an unavailable provider can never take Mark's message with it.

const PUSH = ["webhook", "anthropic", "openai", "xai"];
const LEASE_MS = 120 * 1000;
const MAX_ATTEMPTS = 3;

function timeoutMs() {
  const value = Number.parseInt(process.env.HQ_ROOM_DISPATCH_TIMEOUT_MS || "", 10);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_TIMEOUT_MS;
}

/** Create the dispatch rows a persisted message calls for. Idempotent per (message, seat). */
export async function routeMessage(message) {
  const env = await seatEnv();
  const decision = decideRoute(message, { env });
  if (!decision.targets.length) return { dispatches: [], note: decision.note };
  const createdAt = new Date().toISOString();
  const rows = decision.targets.map(({ seatId, reason }) => {
    const adapter = adapterFor(seatId, env);
    return {
      id: ulid(),
      sourceMessageId: message.id,
      threadId: message.threadId || message.id,
      seatId,
      originSeatId: message.seatId,
      reason,
      adapter: adapter.kind,
      status: adapter.ready ? "queued" : "offline",
      hop: decision.hop,
      error: adapter.ready ? "" : `Not connected. ${adapter.missing} is not set.`,
      createdAt,
    };
  });
  const dispatches = await insertDispatches(rows);
  return { dispatches, note: decision.note };
}

/** Route, then run push adapters. Never throws: the message is already posted. */
export async function routeAndProcess(message) {
  try {
    const { dispatches } = await routeMessage(message);
    await processQueued({ ids: dispatches.filter((row) => PUSH.includes(row.adapter) && row.status === "queued").map((row) => row.id) });
  } catch (error) {
    console.error("room routing failed", error?.message || "");
  }
}

/** Expire stale work, then run queued push dispatches (all of them, or just `ids`). */
export async function processQueued({ ids } = {}) {
  await sweepDispatches({ timeoutMs: timeoutMs() });
  const rows = ids
    ? (await Promise.all(ids.map((id) => findDispatch(id)))).filter(Boolean)
    : await listDispatches({ statuses: ["queued"], limit: 20 });
  await Promise.all(rows.filter((row) => PUSH.includes(row.adapter) && row.status === "queued").map((row) => processDispatch(row.id)));
}

async function envelopeFor(dispatch) {
  const raw = await findRoomMessage(dispatch.sourceMessageId);
  if (!raw) return null;
  const source = presentMessage(raw);
  const recent = await listRoomMessages({ channel: source.channel, limit: 30 });
  const baton =
    [...recent].reverse().find((m) => m.kind === "baton" && m.baton && (!m.baton.to || m.baton.to === dispatch.seatId))?.baton ||
    null;
  let prs = [];
  try {
    prs = (await listRoomPrs({ reconcile: false })).prs.filter((pr) => pr.state === "open");
  } catch {
    prs = [];
  }
  return buildEnvelope({ dispatch, source, recent, baton, prs, seats: ROOM_SEATS });
}

/** Claim one queued dispatch and hand it to its seat's adapter. A second caller gets nothing. */
export async function processDispatch(id) {
  const claimed = await transitionDispatch(id, { from: ["queued"], to: "dispatching", leaseMs: LEASE_MS, bumpAttempt: true });
  if (!claimed) return null;
  const fail = (error) => transitionDispatch(id, { from: ["dispatching", "thinking"], to: "failed", error, expectedAttempt: claimed.attempts });
  try {
    const envelope = await envelopeFor(claimed);
    if (!envelope) return fail("The source message is gone.");
    if (claimed.adapter === "webhook") return sendWebhook(claimed, envelope);
    const thinking = await transitionDispatch(id, {
      from: ["dispatching"], to: "thinking", leaseMs: LEASE_MS, expectedAttempt: claimed.attempts,
    });
    if (!thinking) return null;
    const text = await askModel(claimed, envelope);
    if (!text) return fail("The provider returned no text.");
    const reply = await postRoomRecord({
      seatId: claimed.seatId,
      tokenHash: `adapter:${claimed.adapter}`,
      channel: "room",
      kind: "chat",
      body: clipReply(text),
      refs: [],
      baton: null,
      dispatchId: claimed.id,
      expectedAttempt: claimed.attempts,
    });
    if (reply.error) return fail(reply.error.error);
    // The reply is an agent post: it only reaches others by explicit @mention or baton.
    if (!reply.deduped) await routeAndProcess(reply.message);
    // An execution-loop task may be waiting on this dispatch (dynamic import avoids a cycle).
    if (!reply.deduped) await import("./loop-service").then((m) => m.wakeFromDispatch(claimed.id)).catch(() => {});
    return reply.message;
  } catch (error) {
    console.error("room dispatch failed", claimed.seatId, claimed.adapter, error?.status || "");
    return fail(providerError(error));
  }
}

function providerError(error) {
  if (error?.status === 401 || error?.status === 403) return `Provider refused the credentials (${error.status}).`;
  if (error?.status === 429) return "Provider rate limit (429).";
  if (error?.name === "TimeoutError" || error?.name === "AbortError") return "Provider timed out.";
  return error?.status ? `Provider error (${error.status}).` : "Provider request failed.";
}

const SYSTEM = (envelope) => envelope.rules.join("\n");

function model(seatId, fallback) {
  return (process.env[`HQ_SEAT_MODEL_${seatId.toUpperCase()}`] || fallback).trim();
}

async function askModel(dispatch, envelope) {
  const prompt = promptFromEnvelope(envelope);
  if (dispatch.adapter === "anthropic") {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 50_000, maxRetries: 1 });
    const response = await client.beta.messages.create({
      model: model(dispatch.seatId, "claude-opus-5-5"),
      max_tokens: 4000,
      output_config: { effort: "medium" },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SYSTEM(envelope),
      messages: [{ role: "user", content: prompt }],
    });
    if (response.stop_reason === "refusal") throw Object.assign(new Error("refused"), { status: "refusal" });
    return response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();
  }
  const endpoints = {
    openai: { url: "https://api.openai.com/v1/chat/completions", key: "OPENAI_API_KEY", model: "gpt-4o" },
    xai: { url: "https://api.x.ai/v1/chat/completions", key: "XAI_API_KEY", model: "grok-4" },
  };
  const target = endpoints[dispatch.adapter];
  const res = await fetch(target.url, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${process.env[target.key]}` },
    body: JSON.stringify({
      model: model(dispatch.seatId, target.model),
      max_tokens: 4000,
      messages: [
        { role: "system", content: SYSTEM(envelope) },
        { role: "user", content: prompt },
      ],
    }),
    signal: AbortSignal.timeout(50_000),
  });
  if (!res.ok) throw Object.assign(new Error("provider"), { status: res.status });
  const data = await res.json();
  return String(data?.choices?.[0]?.message?.content || "").trim();
}

/**
 * Webhook seats (n8n, a local runner, a cloud agent): HQ posts the envelope,
 * signed with that seat's webhook secret, and the agent replies later with its
 * own room connection. 2xx means it took the job.
 */
async function sendWebhook(dispatch, envelope) {
  const key = dispatch.seatId.toUpperCase();
  const url = process.env[`HQ_SEAT_WEBHOOK_URL_${key}`];
  const secret = process.env[`HQ_SEAT_WEBHOOK_SECRET_${key}`] || "";
  const body = JSON.stringify(envelope);
  const headers = { "content-type": "application/json", "x-hq-dispatch-id": dispatch.id };
  if (secret) headers["x-hq-signature-256"] = `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
  try {
    const res = await fetch(url, { method: "POST", headers, body, signal: AbortSignal.timeout(10_000) });
    if (res.ok) return transitionDispatch(dispatch.id, { from: ["dispatching"], to: "thinking", expectedAttempt: dispatch.attempts });
    throw Object.assign(new Error("webhook"), { status: res.status });
  } catch (error) {
    if (dispatch.attempts < MAX_ATTEMPTS) {
      return transitionDispatch(dispatch.id, { from: ["dispatching"], to: "queued", error: providerError(error), expectedAttempt: dispatch.attempts });
    }
    return transitionDispatch(dispatch.id, { from: ["dispatching"], to: "failed", error: providerError(error), expectedAttempt: dispatch.attempts });
  }
}

// ---- Pull seats (Cursor, Codex, Claude Code, a CLI) -------------------------

/** The seat's own open dispatches, each with its envelope. */
export async function inboxFor(seatId) {
  await sweepDispatches({ timeoutMs: timeoutMs() });
  const rows = await listDispatches({ seatId, statuses: ["queued", "thinking"], limit: 20 });
  return Promise.all(rows.map(async (row) => ({ ...row, envelope: await envelopeFor(row) })));
}

/** queued → thinking for the seat that owns it; a second claim returns null. */
export async function claimDispatch(id, seatId) {
  const row = await findDispatch(id);
  if (!row || row.seatId !== seatId) return { error: { status: 403, error: "That dispatch is not for this seat." } };
  const claimed = await transitionDispatch(id, { from: ["queued"], to: "thinking", bumpAttempt: true });
  if (!claimed) return { error: { status: 409, error: `Already ${row.status}.` } };
  return { dispatch: claimed };
}

export async function failDispatch(id, seatId, reason) {
  const row = await findDispatch(id);
  if (!row || row.seatId !== seatId) return { error: { status: 403, error: "That dispatch is not for this seat." } };
  const failed = await transitionDispatch(id, {
    from: ["queued", "dispatching", "thinking"],
    to: "failed",
    error: String(reason || "The agent reported a failure.").slice(0, 300),
  });
  if (!failed) return { error: { status: 409, error: `Already ${row.status}.` } };
  return { dispatch: failed };
}

/** Connected-seat strip: adapter kind and online state per agent seat. No secrets, only setting names. */
export function seatStrip(seats = [], env = process.env) {
  return agentSeats(ROOM_SEATS).map((seat) => {
    const lastSeenAt = seats.find((row) => row.id === seat.id)?.lastSeenAt || "";
    return { ...seatPresenceFor(seat, { env, lastSeenAt }), callsign: seat.callsign, role: seat.role, lastSeenAt };
  });
}
