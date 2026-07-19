import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { DEFAULT_OPS } from "./ops-default";
import { mergeOpsPatch, normalizeOpsData } from "./ops-shared";

const OPS_DIR = resolve(process.cwd(), "data/hq");
const OPS_PATH = resolve(OPS_DIR, "ops.json");

function ensureOpsFile() {
  if (!existsSync(OPS_DIR)) mkdirSync(OPS_DIR, { recursive: true });
  if (!existsSync(OPS_PATH)) {
    const seed = normalizeOpsData({ ...DEFAULT_OPS, updatedAt: new Date().toISOString() });
    writeFileSync(OPS_PATH, JSON.stringify(seed, null, 2), "utf8");
    return seed;
  }
  return null;
}

export function readOpsDataFromFile() {
  ensureOpsFile();
  try {
    const data = JSON.parse(readFileSync(OPS_PATH, "utf8"));
    return normalizeOpsData(data);
  } catch {
    return normalizeOpsData({ ...DEFAULT_OPS, updatedAt: new Date().toISOString() });
  }
}

export function writeOpsDataToFile(data) {
  ensureOpsFile();
  const next = normalizeOpsData({ ...data, updatedAt: new Date().toISOString() });
  writeFileSync(OPS_PATH, JSON.stringify(next, null, 2), "utf8");
  return next;
}

export function patchOpsDataInFile(partial) {
  const current = readOpsDataFromFile();
  return writeOpsDataToFile(mergeOpsPatch(current, partial));
}
