import { FOUR_FRONTS } from "./four-fronts";
import { getJakaRetainerContractSnapshot } from "./jaka-retainer-contract";
import { getRdusaPilotContractSnapshot } from "./rdusa-pilot-contract";
import { getRdusaRetainerContractSnapshot } from "./rdusa-retainer-contract";

export function scorecardPercent(passCount, total) {
  if (!Number.isInteger(passCount) || !Number.isInteger(total) || total <= 0) return null;
  if (passCount < 0 || passCount > total) {
    throw new Error(`Pass count ${passCount} is outside 0..${total}`);
  }
  return Math.round((100 * passCount) / total);
}

function recordedFront(id) {
  const front = FOUR_FRONTS.find((item) => item.id === id);
  if (!front) throw new Error(`Missing four-front record ${id}`);
  return front;
}

function periodRows(snapshot) {
  return snapshot.criteria.filter((row) => row.countsTowardPeriod);
}

function passCount(rows) {
  return rows.filter((row) => row.status === "PASS").length;
}

function buildFronts() {
  const pilot = getRdusaPilotContractSnapshot();
  const rdusa = getRdusaRetainerContractSnapshot();
  const jaka = getJakaRetainerContractSnapshot();
  const pilotMajors = pilot.criteria.filter((row) => row.level === "major");
  const pilotPass = passCount(pilotMajors);
  const rdusaPeriods = periodRows(rdusa);
  const jakaPeriods = periodRows(jaka);
  const graphRows = rdusa.criteria.filter((row) => row.id === "rdusa-daily-ig-publish" || row.id === "rdusa-90d-ig-toward-100");
  const seos = recordedFront("seos-social");
  const ledger = recordedFront("rdusa-internal");
  const mcp = recordedFront("hq-mcp");
  const journeyBoard = recordedFront("sookly-journey");

  return [
    {
      id: "journey-rdusa-pilot",
      name: "Sookly Journey / RDUSA pilot",
      progress: scorecardPercent(pilotPass, pilotMajors.length),
      formula: `${pilotPass} of ${pilotMajors.length} major criteria PASS`,
      tracker: "docs/RDUSA_PILOT_ACCEPTANCE_CONTRACT.md",
      code: "lib/hq/rdusa-pilot-contract.js",
      stopping: "pilotReady is false. Scorecard majors merge-pr-60, prod-migrate, and production-deploy are BLOCKED. live-pilot-10-20 is NOT STARTED.",
      goingOn: "Product path, operator rail, scenarios A/B/C, and the product-facing VA SOP are PASS at cf3d866.",
      landing: "sookly-omnichat, then a droplet only after a separate production migrate and deploy.",
      looseEnds: "phone-va-workspace, four-dimensions-in-product, ai-safety-product, staging-smoke, and controlled-prod-smoke are NOT STARTED. The swarm note records PR #60 as merged on 1 Oct 2026. This scorecard row is still BLOCKED and was not rewritten.",
      edgeCases: `A sub-gate PASS does not close its parent. The engineering four-front board records ${journeyBoard.progress} for Sookly Journey. That figure is not this major-criterion ratio.`,
    },
    {
      id: "rdusa-retainer",
      name: "RDUSA retainer delivery",
      progress: scorecardPercent(passCount(rdusaPeriods), rdusaPeriods.length),
      formula: `${passCount(rdusaPeriods)} of ${rdusaPeriods.length} period rows PASS`,
      tracker: "docs/RDUSA_RETAINER_DELIVERY_CONTRACT.md",
      code: "lib/hq/rdusa-retainer-contract.js",
      stopping: "retainerHealthy is false. Daily Instagram is BLOCKED because META_PAGE_TOKEN_RDUSA expired about 25 Sep 2026. The weekly commercial scorecard is NOT STARTED. Weekly growth support is BLOCKED.",
      goingOn: "The SEO/GEO weekly row is PASS and does not count toward the period rollup, so it is outside this percentage.",
      landing: "/hq/retainers",
      looseEnds: "October, the 90-day scorecard habit, and Threads/Facebook have no current artifact. The 100-post goal does not use the old 50/57 baseline.",
      edgeCases: "UNKNOWN testimonial, brand-lock, and optional phone rows are excluded from this percentage.",
    },
    {
      id: "jaka-retainer",
      name: "Jaka retainer delivery",
      progress: scorecardPercent(passCount(jakaPeriods), jakaPeriods.length),
      formula: `${passCount(jakaPeriods)} of ${jakaPeriods.length} period rows PASS`,
      tracker: "docs/JAKA_RETAINER_DELIVERY_CONTRACT.md",
      code: "lib/hq/jaka-retainer-contract.js",
      stopping: "The 90-day window is not complete. October cadence is NOT STARTED. Hire board, site go-live, and Craigslist/Nextdoor rows are BLOCKED.",
      goingOn: "Required day and week rows PASS: Facebook buffer, blog-draft buffer, and the SEO pack rule.",
      landing: "/hq/retainers",
      looseEnds: "Instagram/Threads and live blog are BLOCKED and do not fail the Facebook day. The fee is unconfirmed.",
      edgeCases: "Required-row health can pass while this period percentage stays below 100. Do not read the percentage as a finished retainer.",
    },
    {
      id: "seos-social",
      name: "SEOS social control plane",
      progress: seos.progress,
      formula: "Recorded four-front estimate, not a PASS/total ratio",
      tracker: "lib/hq/four-fronts.js#seos-social",
      code: "lib/hq/four-fronts.js",
      stopping: seos.blocker,
      goingOn: seos.evidence,
      landing: seos.pr.url,
      looseEnds: "The Business Suite map's SEOS visual calendar, movable blocks, and GA/GSC/GBP boxes are unchecked. They are not included in this percentage.",
      edgeCases: "Draft PR #2 is unmerged. This is not a live visual OS score.",
    },
    {
      id: "rdusa-ledger",
      name: "RDUSA internal ledger",
      progress: ledger.progress,
      formula: "Recorded four-front estimate, not a PASS/total ratio",
      tracker: "lib/hq/four-fronts.js#rdusa-internal",
      code: "lib/hq/four-fronts.js",
      stopping: ledger.blocker,
      goingOn: ledger.evidence,
      landing: ledger.pr.url,
      looseEnds: "Only the SEO/GEO row is verified. Other ledger rows are OPEN for Mark and Andrew.",
      edgeCases: "This is separate from the retainer period percentage.",
    },
    {
      id: "hq-mcp",
      name: "HQ MCP gateway",
      progress: mcp.progress,
      formula: "Recorded four-front estimate, not a PASS/total ratio",
      tracker: "lib/hq/four-fronts.js#hq-mcp",
      code: "lib/hq/four-fronts.js",
      stopping: mcp.blocker,
      goingOn: mcp.evidence,
      landing: mcp.pr.url,
      looseEnds: "Quo ingest is a separate front and has no implementation in this repo.",
      edgeCases: "Merging PR #5 does not by itself raise this percentage.",
    },
    {
      id: "quo-ingest",
      name: "Quo ingest",
      progress: 0,
      formula: "No Quo route, contract, or scorecard row in this repo",
      tracker: "docs/BUSINESS_SUITE_MVP_MAP.md",
      code: null,
      stopping: "Quo to HQ ingest is SPEC. There is no webhook or transcript store here.",
      goingOn: "The MVP map names a future read-only Quo contract and Sookly relay.",
      landing: "Not built. No /hq route.",
      looseEnds: "Caller alias QO means Quo. No transcript search tool exists.",
      edgeCases: "0 means unbuilt, not a measured fail of a live ingest.",
    },
    {
      id: "clients-rdusa",
      name: "Clients RDUSA",
      progress: 0,
      formula: "No /clients/rdusa route",
      tracker: "docs/BUSINESS_SUITE_MVP_MAP.md",
      code: null,
      stopping: "Client HQ is SPEC until Mark unlocks a build.",
      goingOn: "RDUSA work that exists is the retainer board and the pilot scorecard, not a client portal.",
      landing: "Intended /clients/rdusa. Not built.",
      looseEnds: "Approval trigger cards for that portal are specified in the swarm note and are not UI.",
      edgeCases: "Do not treat /hq/retainers as the client portal.",
    },
    {
      id: "clients-jaka",
      name: "Clients Jaka",
      progress: 0,
      formula: "No /clients/jaka route",
      tracker: "docs/BUSINESS_SUITE_MVP_MAP.md",
      code: null,
      stopping: "Same SPEC hold as RDUSA. The Jaka brief is thinner.",
      goingOn: "Jaka delivery is scored on /hq/retainers.",
      landing: "Intended /clients/jaka. Not built.",
      looseEnds: "No client filter sidebar.",
      edgeCases: "Jaka is not a fifth engineering front.",
    },
    {
      id: "meta-graph",
      name: "Meta / social Graph",
      progress: scorecardPercent(passCount(graphRows), graphRows.length),
      formula: `${passCount(graphRows)} of ${graphRows.length} Graph rows PASS`,
      tracker: "docs/RDUSA_RETAINER_DELIVERY_CONTRACT.md#rdusa-daily-ig-publish",
      code: "lib/hq/rdusa-retainer-contract.js",
      stopping: "META_PAGE_TOKEN_RDUSA expired about 25 Sep 2026. Daily Instagram publish is BLOCKED. No publish is authorized from this work.",
      goingOn: "The retainer records the block. It does not hold a current post count.",
      landing: "Remint is a Mark credential gate, then a human publish path.",
      looseEnds: "The 90-day Instagram row is also BLOCKED. Threads and Facebook are NOT STARTED.",
      edgeCases: "50/57 is a prior baseline and is not this percentage.",
    },
    {
      id: "resend-email",
      name: "Resend / email on droplet",
      progress: null,
      formula: "No HQ scorecard row",
      tracker: "docs/RDUSA_JOURNEY_PRISM_SWARM_SEQUENCING.md",
      code: null,
      stopping: "Droplet env is not fully proven. The swarm note says the MCP connector key is invalid.",
      goingOn: "The same note records a box API key and a test send as OK. This HQ repo does not store that as a criterion row, so there is no percentage.",
      landing: "Sookly droplet env, after Mark. Not a customer send from this slice.",
      looseEnds: "Forgot-password probe was CSRF-blocked in that note.",
      edgeCases: "A missing percentage is not a zero and not a pass.",
    },
    {
      id: "business-suite-map",
      name: "Business Suite MVP map",
      progress: 0,
      formula: "0 of 21 acceptance checkboxes checked",
      tracker: "docs/BUSINESS_SUITE_MVP_MAP.md",
      code: null,
      stopping: "The map is architecture. Its acceptance boxes are open, including Clients, approval cards, SEOS visual OS, and Quo tools.",
      goingOn: "The file is on draft PR #5. It is not the live hq.sooklabs.com document set until that PR merges and HQ deploys.",
      landing: "docs/BUSINESS_SUITE_MVP_MAP.md",
      looseEnds: "SEOS acceptance is still marked draft-with-Mark.",
      edgeCases: "Checking a box in the map without a code change would leave this 0 stale until the formula is updated.",
    },
    {
      id: "os-story-llm",
      name: "OS Story / LLM lanes",
      progress: null,
      formula: "docs/LLM_STATUS.md and docs/LLM_LANE_MAP.md are not on this branch",
      tracker: "docs/HQ-AGENTS.md",
      code: null,
      stopping: "There is no living FRONT board file to score.",
      goingOn: "HQ agent dispatch, callback, and the LLM & Agents page are a separate connected ops surface.",
      landing: "docs/HQ-AGENTS.md describes webhook wiring. It is not an OS Story percentage.",
      looseEnds: "The MVP map names those two missing docs.",
      edgeCases: "Do not borrow the HQ MCP 35 for this row.",
    },
  ];
}

export function getHqFronts() {
  return buildFronts();
}

export function getHqFront(id) {
  return getHqFronts().find((front) => front.id === id) || null;
}

function assertHqFronts() {
  const fronts = getHqFronts();
  const ids = new Set();
  for (const front of fronts) {
    if (ids.has(front.id)) throw new Error(`Duplicate front ${front.id}`);
    ids.add(front.id);
    if (front.progress != null && (front.progress < 0 || front.progress >= 100)) {
      throw new Error(`${front.id} progress ${front.progress} is not an open honest percentage`);
    }
  }
  const expect = {
    "journey-rdusa-pilot": 76,
    "rdusa-retainer": 0,
    "jaka-retainer": 33,
    "seos-social": 80,
    "rdusa-ledger": 45,
    "hq-mcp": 35,
    "quo-ingest": 0,
    "clients-rdusa": 0,
    "clients-jaka": 0,
    "meta-graph": 0,
    "resend-email": null,
    "business-suite-map": 0,
    "os-story-llm": null,
  };
  for (const [id, progress] of Object.entries(expect)) {
    const front = fronts.find((item) => item.id === id);
    if (!front) throw new Error(`Missing front ${id}`);
    if (front.progress !== progress) {
      throw new Error(`${id} progress is ${front.progress}, expected ${progress}`);
    }
  }
}

assertHqFronts();
