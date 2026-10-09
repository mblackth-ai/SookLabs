import assert from "node:assert/strict";
import test from "node:test";
import { bodyHash, canEditBody, checkTransition, parseDraft, validateDraft } from "./content-draft.js";

const sample = `---
joomla_id:            # empty for a new article
site: rdusa
category: "Display Fixtures"
status: draft
source_brief: 01M46PGWW18G663R12T98R4JTA
author_seat: gemini
editor_seat: claude
last_modified: 2026-10-05T19:50:00Z
---
# Acrylic risers

Body text.
`;

test("parse: Gemini's front matter fields, comments and quotes handled; body kept", () => {
  const { meta, body, hasFrontMatter } = parseDraft(sample);
  assert.equal(hasFrontMatter, true);
  assert.deepEqual(meta, {
    joomla_id: "",
    site: "rdusa",
    category: "Display Fixtures",
    status: "draft",
    source_brief: "01M46PGWW18G663R12T98R4JTA",
    author_seat: "gemini",
    editor_seat: "claude",
    last_modified: "2026-10-05T19:50:00Z",
  });
  assert.match(body, /^# Acrylic risers/);
  assert.deepEqual(validateDraft(meta), []);
  assert.equal(parseDraft("no front matter").hasFrontMatter, false);
});

test("validate: site, status, brief and ids are enforced", () => {
  const errors = validateDraft({ site: "other", status: "live", category: "", joomla_id: "abc" });
  assert.equal(errors.length, 5);
  assert.ok(validateDraft({ site: "sooklabs", category: "c", status: "published", source_brief: "b" }).some((e) => /joomla_id/.test(e)));
});

test("the pipeline runs gemini → claude → mark → codex, and no seat can skip a step", () => {
  const { meta, body } = parseDraft(sample);
  assert.equal(checkTransition(meta, "ready-for-review", { seat: "gemini" }).ok, false);
  const review = checkTransition(meta, "ready-for-review", { seat: "claude" });
  assert.equal(review.ok, true);
  const inReview = { ...meta, ...review.set };

  assert.equal(checkTransition(inReview, "approved", { seat: "claude", decisionRef: "m1", body }).ok, false);
  assert.match(checkTransition(inReview, "approved", { seat: "mark", body }).error, /decision/);
  const approved = checkTransition(inReview, "approved", { seat: "mark", decisionRef: "dec-1", body });
  assert.equal(approved.ok, true);
  assert.equal(approved.set.approved_hash, bodyHash(body));
  const ready = { ...inReview, ...approved.set };

  assert.equal(checkTransition(meta, "published", { seat: "codex", body, joomlaId: "42" }).ok, false);
  assert.equal(checkTransition(ready, "published", { seat: "claude", body, joomlaId: "42" }).ok, false);
  assert.match(checkTransition(ready, "published", { seat: "codex", body }).error, /Joomla article id/);
  const published = checkTransition(ready, "published", { seat: "codex", body, joomlaId: "42" });
  assert.deepEqual(published, { ok: true, set: { status: "published", joomla_id: "42" } });
  assert.deepEqual(validateDraft({ ...ready, ...published.set }), []);
});

test("approval binds to the exact text: an edit after approval blocks publishing", () => {
  const { meta, body } = parseDraft(sample);
  const approved = { ...meta, status: "approved", approved_hash: bodyHash(body) };
  assert.match(checkTransition(approved, "published", { seat: "codex", body: `${body}\nOne more line.`, joomlaId: "7" }).error, /changed after Mark approved/);
  assert.equal(checkTransition(approved, "published", { seat: "codex", body: body.replace(/\n/g, "\r\n") + "   ", joomlaId: "7" }).ok, true);
});

test("writer fence: only author or editor edit, and only while it is a draft", () => {
  const { meta } = parseDraft(sample);
  assert.equal(canEditBody(meta, "gemini"), true);
  assert.equal(canEditBody(meta, "claude"), true);
  assert.equal(canEditBody(meta, "codex"), false);
  assert.equal(canEditBody({ ...meta, status: "approved" }, "claude"), false);
  assert.equal(checkTransition({ status: "approved" }, "draft", { seat: "claude" }).ok, false);
  assert.equal(checkTransition({ status: "ready-for-review" }, "draft", { seat: "gemini" }).ok, true);
  assert.equal(checkTransition({}, "draft", { seat: "claude" }).ok, false);
});
