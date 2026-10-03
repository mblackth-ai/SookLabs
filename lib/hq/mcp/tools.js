import { z } from "zod";
import { FRONT_PLAN } from "@/lib/hq/four-fronts";

// HQ MCP read tools (M0). One definition per tool; handlers only read the
// control-plane snapshot the HQ UI renders, so MCP and UI cannot disagree.
// Contract: docs/openapi/hq-mcp-read-tools.yaml · Design: docs/adr/2026-10-hq-mcp-server.md

export class ToolInputError extends Error {}

function pick(snapshot, keys) {
  return Object.fromEntries(keys.filter((key) => key in snapshot).map((key) => [key, snapshot[key]]));
}

function findFront(snapshot, frontId) {
  const front =
    (snapshot.fronts || []).find((item) => item.id === frontId) ||
    (snapshot.eightFronts || []).find((item) => item.id === frontId);
  if (!front) {
    const known = [...(snapshot.fronts || []), ...(snapshot.eightFronts || [])].map((item) => item.id);
    throw new ToolInputError(`Unknown frontId "${frontId}". Known: ${[...new Set(known)].join(", ")}`);
  }
  return front;
}

export const HQ_READ_TOOLS = [
  {
    name: "hq_status",
    title: "HQ status",
    description:
      "Overall progress, every front with its insight, the review horizon, and the eight-front board. Read-only.",
    inputSchema: {},
    handler: (snapshot) =>
      pick(snapshot, [
        "generatedAt",
        "overallProgress",
        "progressBasis",
        "fronts",
        "schedule",
        "eightFronts",
        "eightFrontsOverall",
        "eightFrontsBasis",
      ]),
  },
  {
    name: "project_status",
    title: "Project status",
    description: "One front: progress, gates, evidence, next step and blocker. Accepts four-front or eight-front ids.",
    inputSchema: { frontId: z.string().min(1).describe("Front id, e.g. seos-social, hq, mcp") },
    handler: (snapshot, { frontId }) => findFront(snapshot, frontId),
  },
  {
    name: "pending_approvals",
    title: "Pending approvals",
    description: "Agent jobs waiting on approval, and merged blockers. Approving happens in the HQ UI only.",
    inputSchema: {},
    handler: (snapshot) => ({ approvals: snapshot.approvals || [], blockers: snapshot.blockers || [] }),
  },
  {
    name: "rdusa_value_expansion",
    title: "RDUSA value expansion",
    description: "RDUSA expansion opportunities. Opportunities, not revenue.",
    inputSchema: {},
    handler: (snapshot) => snapshot.rdusaValueExpansion,
  },
  {
    name: "retainer_delivery",
    title: "Retainer delivery",
    description:
      "Retainer scorecards, the only score source relays may cite. Omit clientId for the index of all clients.",
    inputSchema: { clientId: z.enum(["rdusa", "jaka"]).optional().describe("Retainer client id") },
    handler: (snapshot, { clientId }) => {
      if (!clientId) return snapshot.retainerDelivery;
      return clientId === "rdusa" ? snapshot.rdusaRetainerContract : snapshot.jakaRetainerContract;
    },
  },
  {
    name: "next_actions",
    title: "Next actions",
    description: "Plan items for the review horizon, optionally filtered by front or status.",
    inputSchema: {
      frontId: z.string().optional().describe("Filter by front id"),
      status: z.string().optional().describe("Filter by plan status, e.g. ready, queued, blocked"),
    },
    handler: (_snapshot, { frontId, status } = {}) => ({
      items: FRONT_PLAN.filter((item) => (!frontId || item.frontId === frontId) && (!status || item.status === status)),
    }),
  },
];

