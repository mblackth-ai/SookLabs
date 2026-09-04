import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { DEFAULT_COMMAND_CENTER } from "./command-center-default";
import { mergeCommandCenterPatch, normalizeCommandCenterData } from "./command-center-shared";

const DATA_DIR = resolve(process.cwd(), "data/seos");
const DATA_PATH = resolve(DATA_DIR, "command-center.json");

function ensureDataFile() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(DATA_PATH)) {
    const seed = normalizeCommandCenterData({
      ...DEFAULT_COMMAND_CENTER,
      updatedAt: new Date().toISOString(),
    });
    writeFileSync(DATA_PATH, JSON.stringify(seed, null, 2), "utf8");
    return seed;
  }
  return null;
}

export function readCommandCenterFromFile() {
  ensureDataFile();
  try {
    const data = JSON.parse(readFileSync(DATA_PATH, "utf8"));
    return normalizeCommandCenterData(data);
  } catch {
    return normalizeCommandCenterData({
      ...DEFAULT_COMMAND_CENTER,
      updatedAt: new Date().toISOString(),
    });
  }
}

export function writeCommandCenterToFile(data) {
  ensureDataFile();
  const next = normalizeCommandCenterData({
    ...data,
    updatedAt: new Date().toISOString(),
  });
  writeFileSync(DATA_PATH, JSON.stringify(next, null, 2), "utf8");
  return next;
}

export function patchCommandCenterInFile(partial) {
  const current = readCommandCenterFromFile();
  return writeCommandCenterToFile(mergeCommandCenterPatch(current, partial));
}
