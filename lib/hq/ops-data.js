import { readOpsDataFromFile, writeOpsDataToFile, patchOpsDataInFile } from "./ops-file.js";
import { readOpsDataFromPg, writeOpsDataToPg, patchOpsDataInPg } from "./ops-pg.js";
import { expireStaleAgentJobs } from "./agent-jobs.js";

function isPostgresConfigured() {
  const url = process.env.HQ_DATABASE_URL || process.env.DATABASE_URL;
  return Boolean(url?.trim());
}

export async function readOpsData() {
  const data = isPostgresConfigured() ? await readOpsDataFromPg() : readOpsDataFromFile();
  // Jobs whose callback never arrived would otherwise show "running" forever; time them out and persist that.
  const { jobs, expired } = expireStaleAgentJobs(data.agentJobs);
  if (!expired) return data;
  const next = { ...data, agentJobs: jobs };
  try {
    return await writeOpsData(next);
  } catch {
    return next;
  }
}

export async function writeOpsData(data) {
  if (isPostgresConfigured()) return writeOpsDataToPg(data);
  return writeOpsDataToFile(data);
}

export async function patchOpsData(partial) {
  if (isPostgresConfigured()) return patchOpsDataInPg(partial);
  return patchOpsDataInFile(partial);
}

export function getOpsStorageMode() {
  return isPostgresConfigured() ? "postgres" : "file";
}
