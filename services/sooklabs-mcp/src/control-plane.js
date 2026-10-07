import { getControlPlaneSnapshot } from "../../../lib/hq/control-plane.js";

export async function readControlPlaneBlockers() {
  const snapshot = await getControlPlaneSnapshot();
  return snapshot.blockers;
}
