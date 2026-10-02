import { FOUR_FRONTS, FRONT_PLAN, PLAN_HORIZON } from "./four-fronts";
import { scorecardPercent } from "./hq-fronts";
import { getRdusaPilotContractSnapshot } from "./rdusa-pilot-contract";
import { getRdusaRetainerContractSnapshot } from "./rdusa-retainer-contract";

const FINISH_LINE = "docs/FINISH_LINE_ACCEPTANCE_ALL_FRONTS.md";
const REVIEW = `${PLAN_HORIZON.start}–${PLAN_HORIZON.end}`;

function recordedFront(id) {
  const front = FOUR_FRONTS.find((item) => item.id === id);
  if (!front) throw new Error(`Missing four-front record ${id}`);
  return front;
}

function mustPercent(rows) {
  return scorecardPercent(rows.filter((row) => row.status === "PASS").length, rows.length);
}

function hereNode(progress, label) {
  return {
    id: "here",
    label,
    at: progress,
    windowLabel: "2–31 Oct 2026 review",
    kind: "here",
  };
}

function checklistNodes(rows) {
  return rows.map((row, index) => ({
    id: row.id,
    label: row.id,
    at: Math.round((100 * (index + 1)) / (rows.length + 1)),
    windowLabel: row.status,
    kind: row.status === "PASS" ? "done" : "open",
  }));
}

function branchFromFront(front, summary) {
  return {
    id: `${front.repo}#${front.pr.number}`,
    repo: front.repo,
    branch: front.branch,
    prNumber: front.pr.number,
    prUrl: front.pr.url,
    sha: front.evidenceSha,
    state: front.pr.state,
    merged: front.pr.merged,
    summary,
    openGates: (front.gates || []).filter((gate) => !gate.met).map((gate) => gate.label),
  };
}

function buildEightFronts() {
  const pilot = getRdusaPilotContractSnapshot();
  const pilotMajors = pilot.criteria.filter((row) => row.level === "major");
  const pilotPass = pilotMajors.filter((row) => row.status === "PASS").length;
  const pilotProgress = scorecardPercent(pilotPass, pilotMajors.length);
  const journey = recordedFront("sookly-journey");
  const seos = recordedFront("seos-social");
  const ledger = recordedFront("rdusa-internal");
  const mcp = recordedFront("hq-mcp");
  const rdusaFee = getRdusaRetainerContractSnapshot().fee;

  const hqMust = [
    { id: "HQ-1", criterion: "Clients section for RDUSA and Jaka", status: "NOT STARTED", evidence: "No /clients/rdusa or /clients/jaka route." },
    { id: "HQ-2", criterion: "SookLabs and Sookly stay founder boards", status: "PASS", evidence: "Founder boards exist. No client portal exists for those products." },
    { id: "HQ-3", criterion: "Candy parked under Upcoming / Not Yet Released", status: "PASS", evidence: "The shell section uses that title and starts collapsed." },
    { id: "HQ-4", criterion: "Eight fronts with live percentages", status: "PASS", evidence: "This board lists eight fronts. Each percentage is a Must count or a recorded estimate." },
    { id: "HQ-5", criterion: "Clickable detail", status: "PASS", evidence: "Each front opens /hq/fronts/[id] with the five detail sections." },
    { id: "HQ-6", criterion: "Approval trigger cards", status: "NOT STARTED", evidence: "Approve, Request changes, and Hold are not interactive cards." },
    { id: "HQ-7", criterion: "UI and MCP read one snapshot", status: "NOT STARTED", evidence: "The signed-in UI reads /hq/api/control-plane. The MCP tools in the control-plane note are planned, not shipped." },
  ];
  const swarmMust = [
    { id: "SW-1", criterion: "Claude copy seat", status: "NOT STARTED", evidence: "No copy seat writes draft cards." },
    { id: "SW-2", criterion: "Codex posting after approval", status: "NOT STARTED", evidence: "No posting seat is wired." },
    { id: "SW-3", criterion: "Cursor implements from specs", status: "NOT STARTED", evidence: "Draft PRs exist. That is not a scored seat contract." },
    { id: "SW-4", criterion: "Approval layer", status: "NOT STARTED", evidence: "Trigger cards are specified and not built." },
    { id: "SW-5", criterion: "Repo contracts on HQ after deploy", status: "NOT STARTED", evidence: "Scorecards render in this draft. They are not on live hq.sooklabs.com." },
    { id: "SW-6", criterion: "No model API as the product path", status: "NOT STARTED", evidence: "The constraint is written. It is not a shipped product proof." },
  ];
  const mcpMust = [
    { id: "MCP-1", criterion: "HQ read tools", status: "NOT STARTED", evidence: "hq_status and the other read tools are planned in docs/HQ-MCP-CONTROL-PLANE.md." },
    { id: "MCP-2", criterion: "Social relay", status: "NOT STARTED", evidence: "No MCP social queue is shipped." },
    { id: "MCP-3", criterion: "Quo transcription ingest", status: "NOT STARTED", evidence: "No Quo route or transcript store." },
    { id: "MCP-4", criterion: "Sookly CRM relay fields", status: "NOT STARTED", evidence: "Day-one relay fields are not a shipped connector." },
    { id: "MCP-5", criterion: "Controlled writes", status: "NOT STARTED", evidence: "Write tools are planned and not implemented." },
    { id: "MCP-6", criterion: "Streamable HTTP and stdio", status: "NOT STARTED", evidence: "Transport is specified and not running from this repo." },
  ];
  const wedgeMust = [
    { id: "WDG-1", criterion: "Public wedge narrative", status: "NOT STARTED", evidence: "No sookly.co checklist row in this repo." },
    { id: "WDG-2", criterion: "Embed path", status: "NOT STARTED", evidence: "No embed receipt is stored here." },
    { id: "WDG-3", criterion: "Founding cap and Checkout", status: "NOT STARTED", evidence: "No founding-lock scorecard row." },
    { id: "WDG-4", criterion: "Organic channel order", status: "NOT STARTED", evidence: "No channel-order scorecard row." },
    { id: "WDG-5", criterion: "Chat data lands in CRM", status: "NOT STARTED", evidence: "Depends on MCP-4, which is not shipped." },
  ];
  const revenueMust = [
    { id: "REV-1", criterion: "Fee band on both contracts", status: "BLOCKED", evidence: `RDUSA fee is ${rdusaFee.label}. Jaka amountUsd is null.` },
    { id: "REV-2", criterion: "RDUSA flagship scope", status: "NOT STARTED", evidence: "The contract scope is SEO, content, social media and growth support. It does not list 40 posts, analytics, or competitive ranking." },
    { id: "REV-3", criterion: "Jaka month-2 fee confirmed", status: "BLOCKED", evidence: "Jaka fee.confirmed is false." },
    { id: "REV-4", criterion: "Delivery scorecards on /hq/retainers", status: "PASS", evidence: "The retainers page shows day, week, month, and 90-day rows from the contract snapshots." },
    { id: "REV-5", criterion: "Blocked Graph rows stay blocked", status: "PASS", evidence: "rdusa-daily-ig-publish and rdusa-90d-ig-toward-100 are BLOCKED." },
    { id: "REV-6", criterion: "A score does not publish", status: "PASS", evidence: "No retainer control posts from a PASS row." },
  ];
  const jpMust = [
    { id: "JP-1", criterion: "Per-tenant connector config", status: "NOT STARTED", evidence: "No connector settings surface." },
    { id: "JP-2", criterion: "External CRM sync", status: "NOT STARTED", evidence: "No sync audit in this repo." },
    { id: "JP-3", criterion: "Phone and email identity", status: "NOT STARTED", evidence: "No identity-match receipt." },
    { id: "JP-4", criterion: "Pipeline indicator and next action", status: "NOT STARTED", evidence: "No Journey Prisma contact UI on HQ." },
    { id: "JP-5", criterion: "HQ visual oversight", status: "NOT STARTED", evidence: "This detail is the spec. It does not show sync health." },
    { id: "JP-6", criterion: "Automation off until approval", status: "NOT STARTED", evidence: "No automation switch is shipped. Absence is not a tested gate." },
  ];
  const seosMust = [
    { id: "SE-1", criterion: "Visual editing", status: "NOT STARTED", evidence: "No editable block surface in HQ. Operator work stays in SEOS." },
    { id: "SE-2", criterion: "Honest connector badges", status: "PASS", evidence: "Social GTM badges stay Manual, Draft, or Future OAuth." },
    { id: "SE-3", criterion: "Social queue from ops", status: "PASS", evidence: "/hq/seos/social-gtm reads the ops social board." },
    { id: "SE-4", criterion: "Movable blocks", status: "NOT STARTED", evidence: "Unchecked in the Business Suite map." },
    { id: "SE-5", criterion: "Per-business pages", status: "NOT STARTED", evidence: "No distinct RDUSA and Jaka SEOS pages in this repo." },
    { id: "SE-6", criterion: "Scheduling calendar", status: "NOT STARTED", evidence: "Unchecked in the Business Suite map." },
    { id: "SE-7", criterion: "Reporting from real metrics", status: "NOT STARTED", evidence: "No GA-backed charts." },
    { id: "SE-8", criterion: "GA, GSC, and GBP pathways", status: "NOT STARTED", evidence: "Unchecked. Not claimed live." },
  ];
  const appMust = [
    { id: "APP-1", criterion: "Omnichannel inbox", status: "NOT STARTED", evidence: "No live inbox receipt in this repo." },
    { id: "APP-2", criterion: "Migrate, deploy, smoke, live pilot", status: "BLOCKED", evidence: "pilotReady is false. Production migrate and deploy are open." },
    { id: "APP-3", criterion: "Pilot golden rule", status: "BLOCKED", evidence: "Major rows merge-pr-60, prod-migrate, and production-deploy are not PASS." },
    { id: "APP-4", criterion: "Founding and pricing locks", status: "NOT STARTED", evidence: "No Checkout lock row in HQ." },
    { id: "APP-5", criterion: "No fake product proof", status: "NOT STARTED", evidence: "The rule is written. It is not a scored artifact." },
  ];

  const hqProgress = mustPercent(hqMust);
  const revenueProgress = mustPercent(revenueMust);

  return [
    {
      id: "hq",
      name: "HQ",
      progress: hqProgress,
      progressKind: "must",
      formula: `${hqMust.filter((row) => row.status === "PASS").length} of ${hqMust.length} Must rows PASS`,
      tracker: FINISH_LINE,
      holdingBack: "Clients routes are missing. Approval trigger cards are not built. MCP tools do not yet read this snapshot.",
      landing: "mblackth-ai/SookLabs · /hq · hq.sooklabs.com after Mark merges PR #5 and HQ is deployed.",
      going: "Founder command centre with parked candy, eight fronts, and a later Clients section.",
      must: hqMust,
      roadmap: [
        { id: "hq-merge-5", title: "Mark merges draft PR #5", window: "2–8 Oct 2026", owner: "Mark", status: "ready" },
        { id: "hq-clients", title: "Clients routes for RDUSA and Jaka", window: "9–31 Oct 2026", owner: "Mark", status: "blocked" },
        { id: "hq-triggers", title: "Approval trigger cards", window: "9–31 Oct 2026", owner: "Cursor", status: "queued" },
      ],
      branches: [branchFromFront(mcp, "SookLabs draft PR #5 holds this HQ evidence. Merging it is a separate Mark gate.")],
      engineeringNote: `The engineering HQ/MCP track stays ${mcp.progress}. That figure is not this Must ratio.`,
    },
    {
      id: "seos",
      name: "SEOS",
      progress: seos.progress,
      progressKind: "recorded",
      formula: "Recorded four-front estimate for seos-social. Not a count of SE-1…SE-8.",
      tracker: "lib/hq/four-fronts.js#seos-social",
      holdingBack: seos.blocker,
      landing: `${seos.repo} · ${seos.pr.url} · seos.sooklabs.com after Mark's merge and deploy.`,
      going: "Visual OS for schedule, produce, and report. This percentage is the social control-plane draft, not that OS.",
      must: seosMust,
      mustNote: `${seosMust.filter((row) => row.status === "PASS").length} of ${seosMust.length} finish-line rows PASS. That ratio is not the badge.`,
      roadmap: [
        { id: "seos-merge-2", title: "Mark merge yes on SEOS #2", window: "2–8 Oct 2026", owner: "Mark", status: "ready" },
        { id: "seos-visual", title: "Calendar, movable blocks, and GA/GSC/GBP", window: "9–31 Oct 2026", owner: "Mark", status: "queued" },
      ],
      branches: [branchFromFront(seos, seos.evidence)],
      engineeringNote: null,
    },
    {
      id: "swarm",
      name: "Swarm",
      progress: mustPercent(swarmMust),
      progressKind: "must",
      formula: `${swarmMust.filter((row) => row.status === "PASS").length} of ${swarmMust.length} Must rows PASS`,
      tracker: "docs/RDUSA_JOURNEY_PRISM_SWARM_SEQUENCING.md",
      holdingBack: "Approval trigger cards are not built. Seats are named in docs and are not a shipped loop.",
      landing: "Repo contracts, then HQ approval cards. No live seat runner.",
      going: "Draft, critique, implement, approve, act. Approve stays a named human signal.",
      must: swarmMust,
      roadmap: [
        { id: "swarm-cards", title: "Build approval trigger cards", window: "9–31 Oct 2026", owner: "Cursor", status: "queued" },
        { id: "swarm-linkedin", title: "LinkedIn triple-agent only after Mark unlocks it", window: REVIEW, owner: "Mark", status: "blocked" },
      ],
      branches: [],
      engineeringNote: "No engineering percentage is borrowed for this front.",
    },
    {
      id: "mcp",
      name: "MCP",
      progress: mustPercent(mcpMust),
      progressKind: "must",
      formula: `${mcpMust.filter((row) => row.status === "PASS").length} of ${mcpMust.length} Must rows PASS`,
      tracker: "docs/HQ-MCP-CONTROL-PLANE.md",
      holdingBack: "Read and write tools are planned. Quo ingest and the Sookly relay are not built.",
      landing: "SookLabs MCP surface. Not running from this repo.",
      going: "Same control-plane snapshot for the UI and for tools, then controlled writes.",
      must: mcpMust,
      roadmap: [
        { id: "mcp-reads", title: "Ship the planned read tools against the control plane", window: "9–31 Oct 2026", owner: "Cursor", status: "queued" },
        { id: "mcp-quo", title: "Quo transcript path", window: REVIEW, owner: "Mark", status: "blocked" },
      ],
      branches: [branchFromFront(mcp, `Engineering track ${mcp.progress} on ${mcp.branch}. That ${mcp.progress} is not this Must ratio.`)],
      engineeringNote: `Engineering HQ/MCP progress stays ${mcp.progress}. Merging PR #5 does not raise either number by itself.`,
    },
    {
      id: "sookly-app",
      name: "Sookly app",
      progress: pilotProgress,
      progressKind: "pilot",
      formula: `${pilotPass} of ${pilotMajors.length} pilot major criteria PASS. pilotReady is false.`,
      tracker: "docs/RDUSA_PILOT_ACCEPTANCE_CONTRACT.md",
      holdingBack: "pilotReady is false. Merge, production migrate, and production deploy are open. This percentage is not the engineering board.",
      landing: "mblackth-ai/sookly-omnichat · app.sookly.co after a separate migrate and deploy.",
      going: "Omnichannel inbox and Journey for a founding pilot. Not claimed live.",
      must: appMust,
      mustNote: "APP-1…APP-5 are not the badge. The badge is the pilot major ratio.",
      roadmap: FRONT_PLAN.filter((item) => item.frontId === "sookly-journey").map((item) => ({
        id: item.id,
        title: item.title,
        window: item.window.label,
        owner: item.owner,
        status: item.status,
      })),
      branches: [branchFromFront(journey, journey.evidence)],
      engineeringNote: `Engineering Sookly Journey stays ${journey.progress}. That is not this ${pilotProgress}, and neither number means pilot ready.`,
    },
    {
      id: "sookly-wedge",
      name: "Sookly chat SaaS",
      progress: mustPercent(wedgeMust),
      progressKind: "must",
      formula: `${wedgeMust.filter((row) => row.status === "PASS").length} of ${wedgeMust.length} Must rows PASS`,
      tracker: FINISH_LINE,
      holdingBack: "No wedge, embed, or founding-lock scorecard row exists in this repo.",
      landing: "sookly.co and the app embed path. Not scored here.",
      going: "Sellable chat wedge after Mark's cap and Checkout locks.",
      must: wedgeMust,
      roadmap: [
        { id: "wedge-spec", title: "Write the wedge checklist against sookly.co", window: REVIEW, owner: "Mark", status: "queued" },
      ],
      branches: [],
      engineeringNote: "The pilot ratio is not this front.",
    },
    {
      id: "revenue",
      name: "Revenue",
      progress: revenueProgress,
      progressKind: "must",
      formula: `${revenueMust.filter((row) => row.status === "PASS").length} of ${revenueMust.length} Must rows PASS`,
      tracker: "docs/RDUSA_RETAINER_DELIVERY_CONTRACT.md",
      holdingBack: "Jaka's fee is unconfirmed. The RDUSA contract does not list the 40-post flagship scope. Graph publish stays blocked.",
      landing: "/hq/retainers · RDUSA and Jaka delivery contracts.",
      going: "Explicit retainer economics without invented fees or auto-posting.",
      must: revenueMust,
      roadmap: [
        { id: "revenue-fee", title: "Mark confirms the Jaka fee", window: REVIEW, owner: "Mark", status: "blocked" },
        { id: "revenue-token", title: "Remint META_PAGE_TOKEN_RDUSA before any publish", window: REVIEW, owner: "Mark", status: "blocked" },
      ],
      branches: [branchFromFront(ledger, "RDUSA ledger draft. Only SEO/GEO is verified. This branch is not the retainer percentage.")],
      engineeringNote: `The ledger engineering track stays ${ledger.progress}. Retainer period rows are a different board.`,
    },
    {
      id: "journey-prisma",
      name: "Journey Prisma",
      progress: mustPercent(jpMust),
      progressKind: "must",
      formula: `${jpMust.filter((row) => row.status === "PASS").length} of ${jpMust.length} Must rows PASS`,
      tracker: FINISH_LINE,
      holdingBack: "JP-1 through JP-6 have no product or HQ receipt. Visual oversight is not built.",
      landing: "sookly-omnichat Journey Prisma, then an HQ Clients or Journey view.",
      going: "Custom CRM connectivity with identity match and a next action. Automation stays off until an approval gate exists.",
      must: jpMust,
      roadmap: [
        { id: "jp-oversight", title: "HQ view of sync health before any automation", window: "9–31 Oct 2026", owner: "Cursor", status: "queued" },
        { id: "jp-pilot", title: "Pilot ready still follows the RDUSA pilot contract", window: REVIEW, owner: "Mark", status: "blocked" },
      ],
      branches: [branchFromFront(journey, "Same sookly-omnichat branch as the app front. It does not close JP-1…JP-6.")],
      engineeringNote: `Pilot majors are ${pilotProgress} and engineering Journey is ${journey.progress}. Neither is this front.`,
    },
  ];
}

export function getEightFronts() {
  return buildEightFronts();
}

export function getEightFront(id) {
  return getEightFronts().find((front) => front.id === id) || null;
}

export function getEightFrontsOverall() {
  const fronts = getEightFronts();
  return Math.round(fronts.reduce((sum, front) => sum + front.progress, 0) / fronts.length);
}

export const EIGHT_FRONTS_BASIS =
  "Overall is the rounded mean of the eight front percentages. A Must-row ratio and a recorded four-front estimate are never averaged together inside one front.";

export function getFrontTimeline(front) {
  return [
    { id: "start", label: "Start", at: 0, windowLabel: PLAN_HORIZON.start, kind: "axis" },
    ...checklistNodes(front.must),
    hereNode(front.progress, `${front.progress}%`),
    { id: "finish", label: "Finish", at: 100, windowLabel: "No ship date", kind: "axis" },
  ];
}

export function buildGrokHandoff(front, branch, intent) {
  switch (intent) {
    case "examine":
    case "visualize":
      break;
    default: {
      const unknown = intent;
      throw new Error(`Unknown Grok handoff intent: ${String(unknown)}`);
    }
  }
  return {
    intent,
    frontId: front.id,
    frontName: front.name,
    progress: front.progress,
    formula: front.formula,
    blockers: front.holdingBack,
    landing: front.landing,
    finishLineIds: front.must.map((row) => row.id),
    roadmap: front.roadmap.map((item) => ({
      title: item.title,
      window: item.window,
      status: item.status,
      owner: item.owner,
    })),
    branch: branch
      ? {
          repo: branch.repo,
          branch: branch.branch,
          prNumber: branch.prNumber,
          prUrl: branch.prUrl,
          sha: branch.sha,
          summary: branch.summary,
          openGates: branch.openGates,
        }
      : null,
    note: intent === "visualize"
      ? "Diagram this branch on the percentage timeline. Do not treat node spacing as a second percentage."
      : "Work this branch from the recorded gates. Do not merge, deploy, or publish.",
  };
}

function assertStatus(status) {
  switch (status) {
    case "PASS":
    case "BLOCKED":
    case "NOT STARTED":
      return;
    default: {
      const unknown = status;
      throw new Error(`Unknown Must status: ${String(unknown)}`);
    }
  }
}

function assertEightFronts() {
  const fronts = getEightFronts();
  const expected = {
    hq: 57,
    seos: 80,
    swarm: 0,
    mcp: 0,
    "sookly-app": 76,
    "sookly-wedge": 0,
    revenue: 50,
    "journey-prisma": 0,
  };
  if (fronts.length !== 8) throw new Error(`Expected 8 fronts, found ${fronts.length}`);
  for (const front of fronts) {
    if (front.progress !== expected[front.id]) {
      throw new Error(`${front.id} progress is ${front.progress}, expected ${expected[front.id]}`);
    }
    if (front.progress < 0 || front.progress >= 100) {
      throw new Error(`${front.id} progress ${front.progress} is not an open honest percentage`);
    }
    for (const row of front.must) assertStatus(row.status);
    for (const item of front.roadmap) {
      switch (item.status) {
        case "ready":
        case "blocked":
        case "queued":
          break;
        default: {
          const unknown = item.status;
          throw new Error(`Unknown roadmap status: ${String(unknown)}`);
        }
      }
    }
    for (const branch of front.branches) {
      if (branch.merged) throw new Error(`${branch.id} is marked merged`);
    }
  }
  if (getEightFrontsOverall() !== 33) {
    throw new Error(`Eight-front overall is ${getEightFrontsOverall()}`);
  }
}

assertEightFronts();
