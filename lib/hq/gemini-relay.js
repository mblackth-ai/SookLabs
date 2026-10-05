import { createHash } from "node:crypto";

// Cursor-side contract for landing Gemini Spark Drive docs into the repo.
// The production room post still goes through postRoomRecord as seat gemini.
// This module only decides identity, secrecy, and the markdown envelope.

export const RELAY_FOLDER_ID = "1vE51KLf3dkoMNVjdrCiE1pMvV26xeKS7";

const SECRET_RULES = [
  /Bearer\s+[A-Za-z0-9._~+/-]{12,}/,
  /HQ_ROOM_CONNECTION[_A-Z0-9]*\s*=\s*\S+/,
  /\b(?:sk|rk|pk|ghp|gho|github_pat|xox[baprs]|AKIA)[A-Za-z0-9_-]{8,}\b/,
];

export function relayDedupeKey(fileId, revisionId, entryIndex = 0) {
  const material = `${String(fileId || "").trim()}:${String(revisionId || "").trim()}:${Number(entryIndex) || 0}`;
  return createHash("sha256").update(material).digest("hex");
}

export function relaySecretHit(text) {
  return SECRET_RULES.some((rule) => rule.test(String(text ?? "")));
}

export function relayDocument({ title, body, fileId, revisionId, entryIndex = 0, viewUrl = "", modifiedTime = "" }) {
  const safeTitle = String(title || "").trim();
  const safeBody = String(body || "").trim();
  if (!safeTitle || !safeBody || !String(fileId || "").trim() || !String(revisionId || "").trim()) {
    return { ok: false, error: "A relay document needs a title, body, file id, and revision id." };
  }
  if (relaySecretHit(safeTitle) || relaySecretHit(safeBody)) {
    return { ok: false, error: "Refusing to write a relay document that contains a secret." };
  }
  const index = Number(entryIndex) || 0;
  const dedupeKey = relayDedupeKey(fileId, revisionId, index);
  const markdown = [
    "---",
    "source: gemini-spark",
    `driveFileId: ${JSON.stringify(String(fileId).trim())}`,
    `revisionId: ${JSON.stringify(String(revisionId).trim())}`,
    `entryIndex: ${index}`,
    `dedupeKey: ${dedupeKey}`,
    `modifiedTime: ${JSON.stringify(String(modifiedTime || ""))}`,
    `viewUrl: ${JSON.stringify(String(viewUrl || ""))}`,
    "ingestedBy: cursor",
    "claim: Gemini Spark document. Not production acceptance.",
    "---",
    "",
    `# ${safeTitle}`,
    "",
    safeBody,
    "",
  ].join("\n");
  return { ok: true, dedupeKey, markdown };
}
