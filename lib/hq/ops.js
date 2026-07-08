import "server-only";
import { getTopOpenItems, newId, mergeOpsPatch } from "./ops-shared";
import { DEFAULT_OPS } from "./ops-default";
import { readOpsDataFromFile, writeOpsDataToFile, patchOpsDataInFile } from "./ops-file";
import { readOpsDataFromPg, writeOpsDataToPg, patchOpsDataInPg } from "./ops-pg";

export { getTopOpenItems, newId, DEFAULT_OPS, mergeOpsPatch };

function usePostgres() {
  const url = process.env.HQ_DATABASE_URL || process.env.DATABASE_URL;
  return Boolean(url?.trim());
}

export async function readOpsData() {
  if (usePostgres()) return readOpsDataFromPg();
  return readOpsDataFromFile();
}

export async function writeOpsData(data) {
  if (usePostgres()) return writeOpsDataToPg(data);
  return writeOpsDataToFile(data);
}

export async function patchOpsData(partial) {
  if (usePostgres()) return patchOpsDataInPg(partial);
  return patchOpsDataInFile(partial);
}

export function getOpsStorageMode() {
  return usePostgres() ? "postgres" : "file";
}
