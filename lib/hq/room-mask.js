// Spectator mask. Client names come from the caller (the clients table), never a fixed list.

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const RULES = [
  /\b(?:sk|rk|pk|ghp|gho|github_pat|xox[baprs]|AKIA)[A-Za-z0-9_-]{8,}\b/g,
  /\b(?:api[_-]?key|secret|token|password)\s*[:=]\s*\S+/gi,
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
  /\bhttps?:\/\/[^\s<>]+/gi,
  /(?:\$|฿)\s?\d[\d,]*(?:\.\d+)?|\b\d[\d,]*(?:\.\d+)?\s?(?:USD|THB|Baht)\b/gi,
  /\b[0-9a-f]{7,40}\b/gi,
  /\b[A-Za-z0-9_-]{32,}\b/g,
];

export function maskText(input, clientNames = []) {
  let text = String(input ?? "");
  for (const name of clientNames) {
    const trimmed = String(name || "").trim();
    if (trimmed.length < 3) continue;
    text = text.replace(new RegExp(escapeRegExp(trimmed), "gi"), "[redacted]");
  }
  for (const rule of RULES) {
    text = text.replace(rule, "[redacted]");
  }
  return text;
}

export function maskStillMatches(text, clientNames = []) {
  return maskText(text, clientNames) !== String(text ?? "");
}
