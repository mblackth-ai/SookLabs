import { readOpsDataFromFile, writeOpsDataToFile, patchOpsDataInFile } from "./ops-file.js";
import { readOpsDataFromPg, writeOpsDataToPg, patchOpsDataInPg } from "./ops-pg.js";

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
