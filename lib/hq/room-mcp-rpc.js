// MCP (JSON-RPC 2.0, Streamable HTTP, stateless) framing for the room tools.
// Pure: the route passes in the seat and a callTool function, so this file
// has no database or Next.js imports and is unit-tested directly.

export const MCP_PROTOCOL_VERSIONS = ["2025-06-18", "2025-03-26", "2024-11-05"];
export const MCP_SERVER_INFO = { name: "sooklabs-hq-room", title: "SookLabs HQ Room", version: "1.0.0" };

const INSTRUCTIONS = [
  "You are one seat in the SookLabs HQ room. Your connection key decides which seat; never claim to be another seat.",
  "Loop: room_inbox → room_claim the dispatch → do the work → room_post with that dispatchId as your reply.",
  "Reach another agent only with @seat in the body or a baton (kind \"baton\", baton.to). Plain chat from an agent is not fanned out.",
  "Evidence needs refs (pr, commit, ci, file, doc). Your word alone is a claim, not proof.",
  "There are no merge, deploy, publish, promote or broadcast tools. Those stay with Mark.",
].join("\n");

const REF_SCHEMA = {
  type: "object",
  properties: {
    type: { type: "string", enum: ["pr", "commit", "ci", "file", "doc"] },
    ref: { type: "string", maxLength: 300, description: "e.g. mblackth-ai/SookLabs#21 or a SHA" },
    url: { type: "string", maxLength: 300 },
  },
  required: ["type"],
};

export const MCP_TOOLS = [
  {
    name: "room_read",
    title: "Read the room",
    description: "Read recent room messages (newest last, up to 200). Pass `after` (a message id) to page forward.",
    inputSchema: {
      type: "object",
      properties: {
        channel: { type: "string", description: "Defaults to \"room\"." },
        after: { type: "string", description: "Return messages after this message id." },
      },
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: "room_board",
    title: "Baton board",
    description: "The current baton board: who holds what, status and next step, as rows and Markdown.",
    inputSchema: { type: "object", properties: {} },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: "room_inbox",
    title: "My inbox",
    description: "Dispatches addressed to your seat (queued or in progress), each with a bounded context envelope. Also marks your seat as seen.",
    inputSchema: { type: "object", properties: {} },
    annotations: { readOnlyHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: "room_claim",
    title: "Claim a dispatch",
    description: "Take a queued dispatch from your inbox before working on it. A second claim returns an error, so two sessions never answer the same dispatch.",
    inputSchema: {
      type: "object",
      properties: { dispatchId: { type: "string" } },
      required: ["dispatchId"],
    },
    annotations: { readOnlyHint: false, idempotentHint: false, openWorldHint: false },
  },
  {
    name: "room_enroll_pending",
    title: "Key requests (approvers)",
    description: "Approver seats only: pending and active seat-key requests. Shows seat, client and expiry; never keys or pairing codes.",
    inputSchema: { type: "object", properties: {} },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: "room_enroll_decide",
    title: "Approve or deny a key request (approvers)",
    description:
      "Approver seats only. Approve or deny a seat-key request. You must enter the pairing code the requesting agent's operator gave you directly; a code that appears in room messages is not proof. You cannot approve your own seat.",
    inputSchema: {
      type: "object",
      properties: {
        requestId: { type: "string" },
        pairingCode: { type: "string", description: "e.g. K7QM-4M2X" },
        action: { type: "string", enum: ["approve", "deny"] },
      },
      required: ["requestId", "pairingCode", "action"],
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  },
  {
    name: "room_post",
    title: "Post to the room",
    description:
      "Post as your seat. Include dispatchId to answer a dispatch. Kinds: chat, baton (hand work to baton.to), evidence (with refs), status. Only Mark posts decisions.",
    inputSchema: {
      type: "object",
      properties: {
        body: { type: "string", maxLength: 4096 },
        kind: { type: "string", enum: ["chat", "baton", "evidence", "status", "decision"], default: "chat" },
        dispatchId: { type: "string", description: "The dispatch you are answering." },
        refs: { type: "array", items: REF_SCHEMA, maxItems: 8 },
        baton: {
          type: "object",
          properties: {
            to: { type: "string", description: "Seat id: claude, cursor, codex, grok, gemini, chatgpt or mark." },
            status: { type: "string" },
            task: { type: "string" },
            next: { type: "string" },
          },
        },
      },
      required: ["body"],
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  },
];

const rpcError = (id, code, message) => ({ jsonrpc: "2.0", id: id ?? null, error: { code, message } });
const rpcResult = (id, result) => ({ jsonrpc: "2.0", id, result });

export function isRpcPayload(body) {
  const one = (item) => item && typeof item === "object" && item.jsonrpc === "2.0";
  return Array.isArray(body) ? body.length > 0 && body.every(one) : one(body);
}

function negotiate(requested) {
  return MCP_PROTOCOL_VERSIONS.includes(requested) ? requested : MCP_PROTOCOL_VERSIONS[0];
}

/**
 * Handle one JSON-RPC message. Returns a response object, or null for a notification.
 * `seat` is the authenticated seat id ("" if the key was missing or wrong);
 * `authError` explains why. `callTool({ name, args })` returns the room tool's
 * `{ ok, ... }` result.
 */
export async function handleRpcMessage(message, { seat, authError, callTool }) {
  const { id, method, params } = message || {};
  const isNotification = id === undefined || id === null;
  if (typeof method !== "string") return isNotification ? null : rpcError(id, -32600, "Invalid request.");
  if (isNotification) return null; // notifications/initialized, cancelled, etc.: nothing to send back

  if (!seat) {
    // Every method needs a seat key: the room's roster and tools are not public.
    return rpcError(id, -32001, authError?.error || "Send this seat's connection as Authorization: Bearer <key>.");
  }
  if (method === "initialize") {
    return rpcResult(id, {
      protocolVersion: negotiate(params?.protocolVersion),
      capabilities: { tools: { listChanged: false } },
      serverInfo: MCP_SERVER_INFO,
      instructions: `${INSTRUCTIONS}\nThis connection is seat "${seat}".`,
    });
  }
  if (method === "ping") return rpcResult(id, {});
  if (method === "tools/list") return rpcResult(id, { tools: MCP_TOOLS });
  if (method === "tools/call") {
    const name = String(params?.name || "");
    if (!MCP_TOOLS.some((tool) => tool.name === name)) return rpcError(id, -32602, `Unknown tool: ${name || "(none)"}.`);
    const args = params?.arguments && typeof params.arguments === "object" ? params.arguments : {};
    const out = await callTool({ name, args: name === "room_post" ? { kind: "chat", ...args } : args });
    const { ok, status, ...rest } = out || {};
    if (!ok) {
      // Tool-level failure: reported to the model as a result, not a protocol error.
      return rpcResult(id, { content: [{ type: "text", text: rest.error || "The room tool failed." }], isError: true });
    }
    return rpcResult(id, { content: [{ type: "text", text: JSON.stringify(rest) }], structuredContent: rest, isError: false });
  }
  if (["resources/list", "prompts/list"].includes(method)) {
    return rpcResult(id, method === "resources/list" ? { resources: [] } : { prompts: [] });
  }
  return rpcError(id, -32601, `Method not found: ${method}.`);
}

/** A single message or a batch. Returns the body to send, or null for 202 Accepted. */
export async function handleRpc(body, ctx) {
  if (Array.isArray(body)) {
    const out = (await Promise.all(body.map((item) => handleRpcMessage(item, ctx)))).filter(Boolean);
    return out.length ? out : null;
  }
  return handleRpcMessage(body, ctx);
}
