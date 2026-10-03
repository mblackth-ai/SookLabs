import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "fs";
import { resolve } from "path";

const ROOM_DIR = resolve(process.cwd(), "data/hq");
const ROOM_PATH = resolve(ROOM_DIR, "room.json");

function emptyStore() {
  return { seats: [], messages: [], broadcasts: [], mcpCalls: [], ingest: [], prs: [], kv: {} };
}

function readStore() {
  if (!existsSync(ROOM_PATH)) return emptyStore();
  const data = JSON.parse(readFileSync(ROOM_PATH, "utf8"));
  if (!data || typeof data !== "object" || Array.isArray(data)) return emptyStore();
  return {
    seats: Array.isArray(data.seats) ? data.seats : [],
    messages: Array.isArray(data.messages) ? data.messages : [],
    broadcasts: Array.isArray(data.broadcasts) ? data.broadcasts : [],
    mcpCalls: Array.isArray(data.mcpCalls) ? data.mcpCalls : [],
    ingest: Array.isArray(data.ingest) ? data.ingest : [],
    prs: Array.isArray(data.prs) ? data.prs : [],
    kv: data.kv && typeof data.kv === "object" && !Array.isArray(data.kv) ? data.kv : {},
  };
}

function writeStore(store) {
  if (!existsSync(ROOM_DIR)) mkdirSync(ROOM_DIR, { recursive: true });
  const tmp = `${ROOM_PATH}.tmp`;
  writeFileSync(tmp, JSON.stringify(store, null, 2), "utf8");
  renameSync(tmp, ROOM_PATH);
}

export function readRoomFile() {
  return readStore();
}

export function writeRoomFile(store) {
  writeStore(store);
  return store;
}
