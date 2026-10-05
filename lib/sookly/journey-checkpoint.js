// HQ milestone tracker for the Sookly journey front (honest, file-based).

export const SOOKLY_JOURNEY_CHECKPOINTS = [
  {
    id: "m0-schema",
    label: "Journey schema + RDUSA stages",
    opsTaskId: "sa-j1",
    weight: 20,
    satisfiedBy: ["lib/sookly/journey-model.js", "lib/sookly/journey-events-schema.js"],
  },
  {
    id: "m1-signal-router",
    label: "Email / Quo signal routing",
    opsTaskId: "sa-j4",
    weight: 15,
    satisfiedBy: ["lib/sookly/journey-signal-router.js"],
  },
  {
    id: "m2-ingest-api",
    label: "Ingest contract (dry-run API)",
    opsTaskId: "sa-j3",
    weight: 20,
    satisfiedBy: ["lib/sookly/journey-ingest.js", "app/hq/api/sookly/journey/signals/route.js"],
  },
  {
    id: "m3-kanban",
    label: "Contacts kanban pilot in HQ",
    opsTaskId: "sa-j2",
    weight: 15,
    satisfiedBy: ["components/hq/SooklyJourneyKanban.jsx"],
  },
  {
    id: "m4-integrations-doc",
    label: "Integration spec (Quo, Resend, Xero, calendar)",
    opsTaskId: null,
    weight: 10,
    satisfiedBy: ["docs/SOOKLY-INTEGRATIONS.md"],
  },
  {
    id: "m5-app-sync",
    label: "Live app.sookly.com case sync",
    opsTaskId: null,
    weight: 20,
    satisfiedBy: [],
    manual: true,
  },
];

/**
 * @param {{ filesPresent?: (path: string) => boolean }} [deps]
 */
export function computeSooklyJourneyCheckpoint(deps = {}) {
  const exists = deps.filesPresent || (() => true);
  const items = SOOKLY_JOURNEY_CHECKPOINTS.map((cp) => {
    const autoDone = cp.satisfiedBy.length > 0 && cp.satisfiedBy.every((path) => exists(path));
    const done = cp.manual ? false : autoDone;
    return { ...cp, done, status: done ? "done" : cp.manual ? "blocked_external" : "in_progress" };
  });
  const totalWeight = items.reduce((s, i) => s + i.weight, 0);
  const earned = items.filter((i) => i.done).reduce((s, i) => s + i.weight, 0);
  const percent = totalWeight ? Math.round((earned / totalWeight) * 100) : 0;
  const current = items.find((i) => !i.done && !i.manual) || items.find((i) => !i.done) || items.at(-1);
  return {
    percent,
    currentCheckpointId: current?.id || null,
    currentCheckpointLabel: current?.label || "",
    nextMainCheckpoint: items.find((i) => i.manual)?.label || "Ship ingest to app repo with persistence",
    items,
  };
}
