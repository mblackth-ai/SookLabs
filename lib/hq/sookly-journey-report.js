import { readOpsData } from "./ops.js";
import { buildSooklyJourneySnapshot } from "../sookly/journey-snapshot.js";

export { PILOT_CASES, buildSooklyJourneySnapshot } from "../sookly/journey-snapshot.js";

export async function getSooklyJourneySnapshot() {
  const ops = await readOpsData();
  return buildSooklyJourneySnapshot(ops);
}
