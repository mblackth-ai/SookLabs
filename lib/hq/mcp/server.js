import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getControlPlaneSnapshot } from "@/lib/hq/control-plane";
import { HQ_READ_TOOLS, ToolInputError } from "./tools";

export const HQ_MCP_SERVER_INFO = { name: "sooklabs-hq", version: "0.1.0-m0" };

// One audit line per call. M0 logs to the server log; hq_events persistence
// arrives with the event-ingest tables (docs/adr/2026-10-hq-event-ingest.md).
function audit(entry) {
  console.info(JSON.stringify({ event: "hq.mcp.call", at: new Date().toISOString(), ...entry }));
}

/**
 * Build an MCP server exposing the tools the caller's scopes allow.
 * M0 ships read tools only; write tools (M3) will require scope "write".
 */
export function createHqMcpServer({ scopes = ["read"], caller = "unknown" } = {}) {
  const server = new McpServer(HQ_MCP_SERVER_INFO, {
    instructions:
      "SookLabs HQ control plane. Read-only. Numbers come from the same snapshot the HQ UI renders; cite retainer_delivery for retainer scores. Nothing here merges, deploys, publishes or approves.",
  });

  if (!scopes.includes("read")) return server;

  for (const tool of HQ_READ_TOOLS) {
    server.registerTool(
      tool.name,
      {
        title: tool.title,
        description: tool.description,
        inputSchema: tool.inputSchema,
        annotations: { readOnlyHint: true, openWorldHint: false },
      },
      async (args = {}) => {
        const started = Date.now();
        try {
          const snapshot = await getControlPlaneSnapshot();
          const result = tool.handler(snapshot, args);
          audit({ tool: tool.name, caller, ok: true, ms: Date.now() - started });
          return { content: [{ type: "text", text: JSON.stringify(result ?? null) }] };
        } catch (error) {
          const message = error instanceof ToolInputError ? error.message : "HQ snapshot unavailable";
          audit({ tool: tool.name, caller, ok: false, ms: Date.now() - started, error: message });
          return { isError: true, content: [{ type: "text", text: message }] };
        }
      }
    );
  }

  return server;
}
