import { NextResponse } from "next/server";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { authenticateMcpRequest } from "@/lib/hq/mcp/auth";
import { createHqMcpServer } from "@/lib/hq/mcp/server";

// Remote HQ MCP endpoint (Streamable HTTP, stateless). On hq.sooklabs.com it is
// served at /api/mcp. Open in middleware; authenticates by bearer token here.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function deny(auth) {
  return NextResponse.json(
    { jsonrpc: "2.0", error: { code: -32001, message: auth.error }, id: null },
    { status: auth.status, headers: auth.status === 401 ? { "WWW-Authenticate": "Bearer" } : undefined }
  );
}

export async function POST(request) {
  const auth = authenticateMcpRequest(request);
  if (!auth.ok) return deny(auth);

  // Stateless: a fresh server and transport per request (no session affinity on Vercel).
  const server = createHqMcpServer({ scopes: auth.scopes, caller: auth.caller });
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  await server.connect(transport);
  try {
    return await transport.handleRequest(request);
  } finally {
    await server.close().catch(() => {});
  }
}

// Stateless servers have no server-initiated stream or session to delete.
function methodNotAllowed(request) {
  const auth = authenticateMcpRequest(request);
  if (!auth.ok) return deny(auth);
  return NextResponse.json(
    { jsonrpc: "2.0", error: { code: -32000, message: "Method not allowed." }, id: null },
    { status: 405, headers: { Allow: "POST" } }
  );
}

export const GET = methodNotAllowed;
export const DELETE = methodNotAllowed;
