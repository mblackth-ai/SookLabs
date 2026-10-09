import { MCP_PROTOCOL_VERSIONS, MCP_SERVER_INFO } from "@/lib/hq/room-mcp-rpc";
import { pingPg } from "@/lib/hq/swarm-pg";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Public "is the room MCP up?" signal (reliability plan P1). JSON only, never
 * cached, no seat names, counts or secrets. 503 when the room database does
 * not answer. A healthy response is not acceptance: it says the deployment
 * is serving and can reach its store.
 */
export async function GET() {
  const pg = Boolean((process.env.HQ_DATABASE_URL || process.env.DATABASE_URL || "").trim());
  const db = pg ? ((await pingPg(2000)) ? "ok" : "down") : "file";
  const body = {
    ok: db !== "down",
    service: MCP_SERVER_INFO.name,
    protocol: MCP_PROTOCOL_VERSIONS,
    auth: "bearer",
    deployment: process.env.VERCEL_DEPLOYMENT_ID || "",
    commit: process.env.VERCEL_GIT_COMMIT_SHA || "",
    db,
    checkedAt: new Date().toISOString(),
  };
  return Response.json(body, { status: body.ok ? 200 : 503, headers: { "cache-control": "no-store" } });
}
