import "server-only";
import {
  DEFAULT_COMMAND_CENTER,
  getProjectRollup,
  mergeCommandCenterPatch,
  normalizeCommandCenterData,
} from "./command-center-shared";
import {
  patchCommandCenterInFile,
  readCommandCenterFromFile,
  writeCommandCenterToFile,
} from "./command-center-file";

export {
  DEFAULT_COMMAND_CENTER,
  getProjectRollup,
  mergeCommandCenterPatch,
  normalizeCommandCenterData,
};

export async function readCommandCenterData() {
  return readCommandCenterFromFile();
}

export async function writeCommandCenterData(data) {
  return writeCommandCenterToFile(data);
}

export async function patchCommandCenterData(partial) {
  return patchCommandCenterInFile(partial);
}

export async function getCommandCenterRollups() {
  const data = await readCommandCenterData();
  return (data.projects || []).map(getProjectRollup);
}

export async function getCommandCenterProject(projectId) {
  const data = await readCommandCenterData();
  return (data.projects || []).find((p) => p.id === projectId) || null;
}
