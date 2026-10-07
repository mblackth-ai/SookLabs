import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { readControlPlaneBlockers } from "./control-plane.js";
import { projectStatus, buildStatus, deployStatus } from "./github.js";

const emptyInput = {};

/**
 * @param {ReturnType<import('./github.js').createGitHubClient>} github
 */
export function createMcpServer(github) {
  const server = new McpServer(
    {
      name: "sooklabs-internal-mcp",
      version: "1.0.0",
    },
    {
      instructions:
        "Read-only SookLabs internal MCP. GitHub repo status for mblackth-ai/SookLabs; HQ control-plane blockers for the room list. Seat identity comes from the configured registry for the verified OAuth subject.",
    }
  );

  function seatFromExtra(extra) {
    const sub = extra?.authInfo?.extra?.seat;
    if (typeof sub !== "string" || !sub) {
      throw new Error("Authenticated seat is missing from token");
    }
    return sub;
  }

  function toolResult(structuredContent) {
    return {
      content: [{ type: "text", text: JSON.stringify(structuredContent, null, 2) }],
      structuredContent,
    };
  }

  server.registerTool(
    "project_status",
    {
      description:
        "Live GitHub summary for the SookLabs repo: default branch, last push, open issue count, homepage, visibility.",
      inputSchema: emptyInput,
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async (_args, extra) => {
      const seat = seatFromExtra(extra);
      return toolResult(await projectStatus(github, seat));
    }
  );

  server.registerTool(
    "blockers",
    {
      description:
        "HQ control-plane blocker list (getControlPlaneSnapshot().blockers) as stored in ops — not GitHub issues.",
      inputSchema: emptyInput,
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async (_args, extra) => {
      const seat = seatFromExtra(extra);
      const blockers = await readControlPlaneBlockers();
      return toolResult({ blockers, seat });
    }
  );

  server.registerTool(
    "build_status",
    {
      description:
        "Default-branch HEAD SHA plus GitHub check runs and commit statuses (empty list if none).",
      inputSchema: emptyInput,
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async (_args, extra) => {
      const seat = seatFromExtra(extra);
      return toolResult(await buildStatus(github, seat));
    }
  );

  server.registerTool(
    "deploy_status",
    {
      description:
        "Recent GitHub deployments for this repo (read-only; does not trigger or probe live deploy targets).",
      inputSchema: emptyInput,
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async (_args, extra) => {
      const seat = seatFromExtra(extra);
      return toolResult(await deployStatus(github, seat));
    }
  );

  return server;
}
