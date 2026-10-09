import { createHash } from "node:crypto";

// Content pipeline draft contract (Gemini baton 14, ratified from Claude
// check-in 10): Codex briefs → Gemini drafts in Drive → Claude edits → Mark
// decides → only then may Codex publish. Every stage checks a draft against
// this one contract. Pure: no Drive, Joomla or database access here.

export const DRAFT_SITES = ["rdusa", "sooklabs"];
export const DRAFT_STATUSES = ["draft", "ready-for-review", "approved", "published"];
export const DRAFT_ROLES = { author: "gemini", editor: "claude", approver: "mark", publisher: "codex" };

/** Split "---\nkey: value\n---\nbody" into front matter and body. Flat `key: value` lines only. */
export function parseDraft(text) {
  const source = String(text ?? "").replace(/^﻿/, "");
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: source, hasFrontMatter: false };
  const meta = {};
  for (const raw of match[1].split(/\r?\n/)) {
    const line = raw.replace(/\s+#.*$/, "").trim();
    if (!line || line.startsWith("#")) continue;
    const at = line.indexOf(":");
    if (at <= 0) continue;
    const key = line.slice(0, at).trim();
    const value = line.slice(at + 1).trim().replace(/^(["'])(.*)\1$/, "$2");
    meta[key] = value;
  }
  return { meta, body: match[2], hasFrontMatter: true };
}

/** sha256 of the body with line endings and trailing space normalised, so an approval binds to the exact text. */
export function bodyHash(body) {
  const normal = String(body ?? "").replace(/\r\n/g, "\n").replace(/[ \t]+$/gm, "").trim();
  return createHash("sha256").update(normal).digest("hex");
}

/** Field errors for a draft's front matter (empty array = valid). */
export function validateDraft(meta) {
  const errors = [];
  if (!DRAFT_SITES.includes(meta.site)) errors.push(`site must be ${DRAFT_SITES.join(" or ")}`);
  if (!String(meta.category || "").trim()) errors.push("category is required");
  if (!DRAFT_STATUSES.includes(meta.status)) errors.push(`status must be one of ${DRAFT_STATUSES.join(", ")}`);
  if (!String(meta.source_brief || "").trim()) errors.push("source_brief (the room message id of Codex's brief) is required");
  if (meta.joomla_id && !/^\d+$/.test(meta.joomla_id)) errors.push("joomla_id must be a number or empty for a new article");
  if (meta.status === "published" && !meta.joomla_id) errors.push("a published draft must carry its joomla_id");
  if (meta.last_modified && Number.isNaN(Date.parse(meta.last_modified))) errors.push("last_modified must be an ISO date");
  if ((meta.status === "approved" || meta.status === "published") && !/^[0-9a-f]{64}$/.test(meta.approved_hash || "")) {
    errors.push("approved and published drafts need approved_hash (the body hash Mark approved)");
  }
  return errors;
}

/** Who may change the body: only while it is a draft, and only its author or editor. Approved text is frozen. */
export function canEditBody(meta, seat) {
  if (meta.status !== "draft") return false;
  return seat === (meta.author_seat || DRAFT_ROLES.author) || seat === (meta.editor_seat || DRAFT_ROLES.editor);
}

/**
 * Check one status move. ctx: { seat, decisionRef, body, joomlaId }.
 * Returns { ok: true, set } with the front-matter fields to write, or { ok: false, error }.
 */
export function checkTransition(meta, to, ctx = {}) {
  const from = meta.status || "";
  const seat = String(ctx.seat || "");
  const author = meta.author_seat || DRAFT_ROLES.author;
  const editor = meta.editor_seat || DRAFT_ROLES.editor;
  const deny = (error) => ({ ok: false, error });
  if (!DRAFT_STATUSES.includes(to)) return deny(`Unknown status "${to}".`);

  if (to === "draft") {
    if (from && from !== "ready-for-review") return deny(`Only a new or in-review draft can return to draft (it is ${from}).`);
    if (!from && seat !== author) return deny(`Only the author seat (${author}) starts a draft.`);
    if (from && seat !== author && seat !== editor) return deny("Only the author or editor can send a draft back.");
    return { ok: true, set: { status: "draft" } };
  }
  if (to === "ready-for-review") {
    if (from !== "draft") return deny(`Only a draft can go to review (it is ${from || "new"}).`);
    if (seat !== editor) return deny(`Only the editor seat (${editor}) marks a draft ready for review.`);
    return { ok: true, set: { status: "ready-for-review" } };
  }
  if (to === "approved") {
    if (from !== "ready-for-review") return deny(`Only a draft in review can be approved (it is ${from || "new"}).`);
    if (seat !== DRAFT_ROLES.approver) return deny("Only Mark approves. Publishing is an escalation gate.");
    if (!String(ctx.decisionRef || "").trim()) return deny("Approval needs Mark's room decision message id.");
    return { ok: true, set: { status: "approved", approved_hash: bodyHash(ctx.body), approval_ref: String(ctx.decisionRef).trim() } };
  }
  // published
  if (from !== "approved") return deny(`Only an approved draft can be published (it is ${from || "new"}).`);
  if (seat !== DRAFT_ROLES.publisher) return deny(`Only the publisher seat (${DRAFT_ROLES.publisher}) publishes.`);
  if (!meta.approved_hash || bodyHash(ctx.body) !== meta.approved_hash) {
    return deny("The text changed after Mark approved it. Send it back to draft for a new approval.");
  }
  if (!/^\d+$/.test(String(ctx.joomlaId || meta.joomla_id || ""))) return deny("Publishing must record the Joomla article id.");
  return { ok: true, set: { status: "published", joomla_id: String(ctx.joomlaId || meta.joomla_id) } };
}
