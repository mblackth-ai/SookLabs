import assert from "node:assert/strict";
import test from "node:test";
import { JOIN_GUIDE, invitePromptFor, joinGuideFor, joinUrlFor } from "./join-guide.js";

test("each agent seat gets its own join link and prompt", () => {
  assert.equal(joinUrlFor("claude"), "https://hq.sooklabs.com/hq/join/claude");
  const prompt = invitePromptFor("cursor");
  assert.match(prompt, /"cursor" seat/);
  assert.ok(prompt.includes("https://hq.sooklabs.com/hq/join/cursor"));
  assert.match(prompt, /never print it/);
});

test("the seat guide names the seat and fills it into the commands", () => {
  const guide = joinGuideFor("gemini");
  assert.match(guide, /^# You are the "gemini" seat/);
  assert.ok(guide.includes("node scripts/hq-seat-enroll.mjs gemini"));
  assert.ok(!guide.includes("<seat>"));
  assert.ok(guide.endsWith(JOIN_GUIDE.replaceAll("<seat>", "gemini")));
});

test("operator, crew and unknown seats have no join guide", () => {
  for (const seat of ["mark", "crew", "nobody", ""]) assert.equal(joinGuideFor(seat), null);
});

test("links and prompts never carry a key", () => {
  for (const seat of ["claude", "cursor", "codex", "grok", "gemini", "chatgpt"]) {
    const text = joinUrlFor(seat) + invitePromptFor(seat) + joinGuideFor(seat);
    assert.ok(!/HQ_ROOM_CONNECTION=\S/.test(text));
    assert.ok(!/Bearer [A-Za-z0-9]{12,}/.test(text));
  }
});
