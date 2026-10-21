import { getRdusaRetainerContractSnapshot } from "./rdusa-retainer-contract.js";
import { getJakaRetainerContractSnapshot } from "./jaka-retainer-contract.js";

const SNAPSHOTS = { rdusa: getRdusaRetainerContractSnapshot, jaka: getJakaRetainerContractSnapshot };

/** Retainer contract snapshot for a client's `retainer` key, or null when the client has no retainer contract. */
export function getRetainerSnapshot(key) {
  const fn = key ? SNAPSHOTS[key] : null;
  return fn ? fn() : null;
}

export function retainerKeys() {
  return Object.keys(SNAPSHOTS);
}
