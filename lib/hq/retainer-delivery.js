import { readFileSync } from "fs";
import { resolve } from "path";

/** Retainer retention rule. This is not the RDUSA Journey pilot Golden Rule. */
export const RETAINER_GOLDEN_RULE =
  "We keep the retainer when promised day/week/month delivery criteria PASS with evidence, and HQ/MCP is the only score source relays may cite.";

export const RETAINER_TIME_ZONE = "Asia/Bangkok";

/** Evidence date for this scorecard. Not the server clock. Mark may move the window. */
export const RETAINER_AS_OF = "2026-10-02";

export const RETAINER_WINDOW = {
  start: "2026-10-01",
  end: "2026-12-29",
  inclusiveDays: 90,
  timeZone: RETAINER_TIME_ZONE,
  label: "Q4 retainer window",
  adjustableBy: "Mark",
  note: "90 inclusive days from 1 Oct 2026 through 29 Dec 2026, Asia/Bangkok. This is not a signed SOW date. Mark may move the window.",
};

export const RETAINER_PERIODS = {
  today: {
    key: "today",
    cadence: "daily",
    id: "2026-10-02",
    label: "Friday 2 Oct 2026",
    start: "2026-10-02",
    end: "2026-10-02",
  },
  thisWeek: {
    key: "thisWeek",
    cadence: "weekly",
    id: "2026-W40",
    label: "Week of 28 Sep–4 Oct 2026",
    start: "2026-09-28",
    end: "2026-10-04",
    note: "Bangkok week, Monday through Sunday. The retainer window starts 1 Oct, so only 1–2 Oct are inside the window. The week is still open on asOf.",
  },
  thisMonth: {
    key: "thisMonth",
    cadence: "monthly",
    id: "2026-10",
    label: "October 2026",
    start: "2026-10-01",
    end: "2026-10-31",
  },
  window90d: {
    key: "window90d",
    cadence: "90d",
    id: "2026-10-01..2026-12-29",
    label: "1 Oct–29 Dec 2026",
    start: "2026-10-01",
    end: "2026-12-29",
  },
};

const SCORECARD_START = "<!-- retainer-scorecard:start -->";
const SCORECARD_END = "<!-- retainer-scorecard:end -->";

export function assertRetainerCadence(cadence) {
  switch (cadence) {
    case "daily":
    case "weekly":
    case "monthly":
    case "90d":
      return cadence;
    default: {
      const unknown = cadence;
      throw new Error(`Unknown retainer cadence: ${String(unknown)}`);
    }
  }
}

export function retainerStatusVariant(status) {
  switch (status) {
    case "PASS":
      return "success";
    case "FAIL":
      return "error";
    case "BLOCKED":
      return "warning";
    case "NOT STARTED":
      return "outline";
    case "UNKNOWN":
      return "neutral";
    default: {
      const unknown = status;
      throw new Error(`Unknown retainer status: ${String(unknown)}`);
    }
  }
}

function periodForCadence(cadence) {
  switch (cadence) {
    case "daily":
      return RETAINER_PERIODS.today;
    case "weekly":
      return RETAINER_PERIODS.thisWeek;
    case "monthly":
      return RETAINER_PERIODS.thisMonth;
    case "90d":
      return RETAINER_PERIODS.window90d;
    default: {
      const unknown = cadence;
      throw new Error(`Unknown retainer cadence: ${String(unknown)}`);
    }
  }
}

export function retainerCriterion(entry) {
  const cadence = assertRetainerCadence(entry.cadence);
  const period = periodForCadence(cadence);
  retainerStatusVariant(entry.status);
  return {
    requiredForHealth: false,
    countsTowardPeriod: true,
    ...entry,
    cadence,
    periodId: period.id,
    periodLabel: period.label,
  };
}

export function countRetainerStatuses(rows) {
  const counts = { PASS: 0, FAIL: 0, BLOCKED: 0, "NOT STARTED": 0, UNKNOWN: 0 };
  for (const row of rows) {
    switch (row.status) {
      case "PASS":
      case "FAIL":
      case "BLOCKED":
      case "NOT STARTED":
      case "UNKNOWN":
        counts[row.status] += 1;
        break;
      default: {
        const unknown = row.status;
        throw new Error(`Unknown retainer status: ${String(unknown)}`);
      }
    }
  }
  return counts;
}

export function rollupRetainerStatus(rows) {
  if (rows.length === 0) return "UNKNOWN";
  if (rows.some((row) => row.status === "FAIL")) return "FAIL";
  if (rows.some((row) => row.status === "BLOCKED")) return "BLOCKED";
  if (rows.some((row) => row.status === "UNKNOWN")) return "UNKNOWN";
  if (rows.some((row) => row.status === "NOT STARTED")) return "NOT STARTED";
  if (rows.every((row) => row.status === "PASS")) return "PASS";
  const unexpected = rows.map((row) => row.status).join(", ");
  throw new Error(`Retainer rollup could not classify: ${unexpected}`);
}

export function buildRetainerPeriods(criteria) {
  const periods = {};
  for (const period of Object.values(RETAINER_PERIODS)) {
    const rows = criteria.filter((row) => row.countsTowardPeriod && row.cadence === period.cadence);
    periods[period.key] = {
      ...period,
      status: rollupRetainerStatus(rows),
      criterionIds: rows.map((row) => row.id),
    };
  }
  return periods;
}

export function isRetainerHealthy(criteria) {
  const required = criteria.filter((row) => row.requiredForHealth);
  return required.length > 0 && required.every((row) => row.status === "PASS");
}

export function isRetainerWindowComplete(criteria) {
  const rows = criteria.filter((row) => row.countsTowardPeriod && row.cadence === "90d");
  return rows.length > 0 && rows.every((row) => row.status === "PASS");
}

export function renderRetainerScorecardMarkdown(snapshot) {
  const lines = [
    "| ID | Criterion | Cadence | Status | Owner | Evidence |",
    "| --- | --- | --- | --- | --- | --- |",
  ];
  for (const row of snapshot.criteria) {
    lines.push(
      `| ${row.id} | ${row.criterion} | ${row.cadence} | ${row.status} | ${row.owner} | ${row.evidence} |`
    );
  }
  const machine = {
    path: snapshot.path,
    clientId: snapshot.clientId,
    asOf: snapshot.asOf,
    retainerHealthy: snapshot.retainerHealthy,
    healthBasis: snapshot.healthBasis,
    windowComplete: snapshot.windowComplete,
    counts: snapshot.counts,
    periods: Object.fromEntries(
      Object.entries(snapshot.periods).map(([key, period]) => [
        key,
        { id: period.id, label: period.label, status: period.status, criterionIds: period.criterionIds },
      ])
    ),
    criticalPath: snapshot.criticalPath,
    nextUnmet: snapshot.nextUnmet,
    criteria: snapshot.criteria.map((row) => ({
      id: row.id,
      criterion: row.criterion,
      cadence: row.cadence,
      periodId: row.periodId,
      status: row.status,
      owner: row.owner,
      requiredForHealth: row.requiredForHealth,
      countsTowardPeriod: row.countsTowardPeriod,
    })),
  };
  return [lines.join("\n"), "", "```json", JSON.stringify(machine, null, 2), "```"].join("\n");
}

function assertSnapshot(snapshot) {
  if (snapshot.goldenRule !== RETAINER_GOLDEN_RULE) {
    throw new Error(`${snapshot.clientId} retainer Golden Rule drifted`);
  }
  if (snapshot.asOf !== RETAINER_AS_OF) {
    throw new Error(`${snapshot.clientId} retainer asOf drifted`);
  }
  if (snapshot.retainerHealthy !== isRetainerHealthy(snapshot.criteria)) {
    throw new Error(`${snapshot.clientId} retainerHealthy must be derived from required criteria`);
  }
  if (snapshot.windowComplete !== isRetainerWindowComplete(snapshot.criteria)) {
    throw new Error(`${snapshot.clientId} windowComplete must be derived from 90d criteria`);
  }
  if (!snapshot.criticalPath || !snapshot.nextUnmet?.id) {
    throw new Error(`${snapshot.clientId} retainer critical path is missing`);
  }
  if (!snapshot.healthBasis || snapshot.healthBasis.includes("|")) {
    throw new Error(`${snapshot.clientId} retainer healthBasis is missing`);
  }

  const ids = new Set();
  for (const row of snapshot.criteria) {
    assertRetainerCadence(row.cadence);
    retainerStatusVariant(row.status);
    if (!row.id || ids.has(row.id)) {
      throw new Error(`Duplicate or empty retainer criterion id: ${row.id}`);
    }
    ids.add(row.id);
    if (!row.owner || row.owner.includes("|")) {
      throw new Error(`Retainer criterion ${row.id} needs an owner without pipe characters`);
    }
    if (!row.evidence || row.evidence.includes("|") || row.criterion.includes("|")) {
      throw new Error(`Retainer criterion ${row.id} needs text without pipe characters`);
    }
    if (row.status === "PASS" && row.evidence.length < 20) {
      throw new Error(`PASS retainer criterion ${row.id} is missing a citation`);
    }
    const period = periodForCadence(row.cadence);
    if (row.periodId !== period.id) {
      throw new Error(`Retainer criterion ${row.id} period does not match its cadence`);
    }
  }

  const next = snapshot.criteria.find((row) => row.id === snapshot.nextUnmet.id);
  if (!next || next.status === "PASS") {
    throw new Error(`${snapshot.clientId} nextUnmet must name a criterion that is not PASS`);
  }

  const counts = snapshot.counts;
  const total = counts.PASS + counts.FAIL + counts.BLOCKED + counts["NOT STARTED"] + counts.UNKNOWN;
  if (total !== snapshot.criteria.length) {
    throw new Error(`${snapshot.clientId} retainer counts do not match the criterion list`);
  }

  for (const period of Object.values(snapshot.periods)) {
    const rows = snapshot.criteria.filter((row) => row.countsTowardPeriod && row.cadence === period.cadence);
    if (period.status !== rollupRetainerStatus(rows)) {
      throw new Error(`${snapshot.clientId} period ${period.key} rollup drifted`);
    }
  }
}

function assertContractDocument(snapshot) {
  if (process.env.RETAINER_SKIP_DOC_ASSERT === "1") return;
  const docPath = resolve(process.cwd(), snapshot.path);
  const doc = readFileSync(docPath, "utf8");
  if (!doc.includes(RETAINER_GOLDEN_RULE)) {
    throw new Error(`${snapshot.path} is missing the retainer Golden Rule verbatim`);
  }
  const start = doc.indexOf(SCORECARD_START);
  const end = doc.indexOf(SCORECARD_END);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`${snapshot.path} is missing the retainer scorecard markers`);
  }
  const actual = doc.slice(start + SCORECARD_START.length, end).trim();
  const expected = renderRetainerScorecardMarkdown(snapshot).trim();
  if (actual !== expected) {
    throw new Error(
      `${snapshot.path} scorecard block does not match its contract module. Regenerate the marked block from renderRetainerScorecardMarkdown().`
    );
  }
}

export function finalizeRetainerSnapshot(snapshot) {
  assertSnapshot(snapshot);
  assertContractDocument(snapshot);
  return snapshot;
}

export function buildRetainerDeliveryIndex(snapshots) {
  return {
    asOf: RETAINER_AS_OF,
    timeZone: RETAINER_TIME_ZONE,
    window: RETAINER_WINDOW,
    goldenRule: RETAINER_GOLDEN_RULE,
    readFirst: true,
    note: "Relays cite this index and the client snapshots on the control plane. generatedAt on the control plane is the server clock. asOf is the score date. Jaka is not an engineering front.",
    clients: snapshots.map((snapshot) => ({
      id: snapshot.clientId,
      name: snapshot.clientName,
      field: snapshot.field,
      path: snapshot.path,
      retainerHealthy: snapshot.retainerHealthy,
      healthBasis: snapshot.healthBasis,
      windowComplete: snapshot.windowComplete,
      fee: snapshot.fee,
      periods: Object.fromEntries(
        Object.entries(snapshot.periods).map(([key, period]) => [key, { id: period.id, status: period.status }])
      ),
      nextUnmet: snapshot.nextUnmet,
    })),
  };
}
