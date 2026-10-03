import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { commitCiState, commitPromotion, parseRef, resolveRefs, verifyWebhookSignature } from "./github.js";
import { promotionFiles } from "./swarm-contract.js";

const REPO = "mblackth-ai/SookLabs";

function fakeGitHub(routes) {
  const calls = [];
  const fetchImpl = async (url, init = {}) => {
    const path = url.replace("https://api.github.com", "");
    const method = init.method || "GET";
    calls.push({ method, path, body: init.body ? JSON.parse(init.body) : undefined });
    const handler = routes[`${method} ${path}`];
    const [status, body] = handler ? handler(init.body ? JSON.parse(init.body) : undefined) : [404, {}];
    return { ok: status < 400, status, json: async () => body };
  };
  return { fetchImpl, calls };
}

test("parseRef reads PR, commit, CI, run and file refs", () => {
  assert.deepEqual(parseRef({ type: "pr", ref: "#12" }, REPO), { kind: "pr", repo: REPO, number: 12 });
  assert.deepEqual(parseRef({ type: "pr", url: `https://github.com/${REPO}/pull/13/files` }, REPO), {
    kind: "pr",
    repo: REPO,
    number: 13,
  });
  assert.deepEqual(parseRef({ type: "ci", url: `https://github.com/${REPO}/pull/13` }, REPO), {
    kind: "ci-pr",
    repo: REPO,
    number: 13,
  });
  assert.deepEqual(parseRef({ type: "commit", ref: "81C3ECB" }, REPO), { kind: "commit", repo: REPO, sha: "81c3ecb" });
  assert.deepEqual(parseRef({ type: "ci", ref: "a/b@abcdef1" }, REPO), { kind: "ci", repo: "a/b", sha: "abcdef1" });
  assert.deepEqual(parseRef({ type: "ci", url: `https://github.com/${REPO}/actions/runs/42` }, REPO), {
    kind: "run",
    repo: REPO,
    id: 42,
  });
  assert.deepEqual(parseRef({ type: "file", url: `https://github.com/${REPO}/blob/master/docs/a b.md` }, REPO), {
    kind: "file",
    repo: REPO,
    ref: "master",
    path: "docs/a b.md",
  });
  assert.equal(parseRef({ type: "doc", ref: "https://docs.google.com/x" }, REPO), null);
  assert.equal(parseRef({ type: "pr", ref: "twelve" }, REPO), null);
});

test("webhook signature must match the raw bytes exactly", () => {
  const raw = Buffer.from('{"zen":"ok"}');
  const good = `sha256=${createHmac("sha256", "s3cret").update(raw).digest("hex")}`;
  assert.equal(verifyWebhookSignature(raw, good, "s3cret"), true);
  assert.equal(verifyWebhookSignature(Buffer.from('{"zen": "ok"}'), good, "s3cret"), false);
  assert.equal(verifyWebhookSignature(raw, good, "other"), false);
  assert.equal(verifyWebhookSignature(raw, "sha256=00", "s3cret"), false);
  assert.equal(verifyWebhookSignature(raw, good, ""), false);
});

test("CI state: any failure fails, anything running is pending, nothing is unknown", async () => {
  const state = (checkRuns, status) =>
    commitCiState({
      repo: REPO,
      sha: "abc1234",
      token: "t",
      ...fakeGitHub({
        [`GET /repos/${REPO}/commits/abc1234/check-runs?per_page=100`]: () => [200, { check_runs: checkRuns }],
        [`GET /repos/${REPO}/commits/abc1234/status`]: () => [200, status],
      }),
    });
  assert.equal(await state([{ status: "completed", conclusion: "success" }], { total_count: 0 }), "pass");
  assert.equal(
    await state([{ status: "completed", conclusion: "success" }, { status: "completed", conclusion: "failure" }], { total_count: 0 }),
    "fail"
  );
  assert.equal(await state([{ status: "in_progress", conclusion: null }], { total_count: 0 }), "pending");
  assert.equal(await state([], { total_count: 1, state: "success" }), "pass");
  assert.equal(await state([{ status: "completed", conclusion: "success" }], { total_count: 1, state: "error" }), "fail");
  assert.equal(await state([], { total_count: 0 }), "unknown");
});

test("resolveRefs leaves refs untouched without a token and checks them with one", async () => {
  const refs = [{ type: "pr", ref: "#12", url: "" }];
  assert.deepEqual(await resolveRefs(refs, { env: {} }), refs);
  const { fetchImpl } = fakeGitHub({ [`GET /repos/${REPO}/pulls/12`]: () => [200, { number: 12 }] });
  const checked = await resolveRefs(
    [...refs, { type: "pr", ref: "#99", url: "" }, { type: "doc", ref: "x", url: "" }],
    { env: { HQ_GITHUB_TOKEN: "t" }, fetchImpl }
  );
  assert.deepEqual(
    checked.map((ref) => ref.resolves),
    [true, false, false]
  );
});

const message = {
  id: "01JTEST",
  seatId: "mark",
  kind: "decision",
  body: "Ship it:\nnow",
  refs: [{ type: "pr", ref: "#13" }],
  baton: null,
  createdAt: "2026-10-03T15:22:00.000Z",
};

function promoteRoutes({ logExists = false, logText = "", moved = false } = {}) {
  let patches = 0;
  return {
    [`GET /repos/${REPO}/git/ref/heads/room/log`]: () => [200, { object: { sha: patches && moved ? "head2" : "head1" } }],
    [`GET /repos/${REPO}/contents/docs/relay/ROOM_LOG.md?ref=room%2Flog`]: () =>
      logExists ? [200, { content: Buffer.from(logText).toString("base64") }] : [404, {}],
    [`GET /repos/${REPO}/git/commits/head1`]: () => [200, { tree: { sha: "tree1" } }],
    [`GET /repos/${REPO}/git/commits/head2`]: () => [200, { tree: { sha: "tree2" } }],
    [`POST /repos/${REPO}/git/trees`]: () => [201, { sha: "newtree" }],
    [`POST /repos/${REPO}/git/commits`]: () => [201, { sha: `commit${patches + 1}` }],
    [`PATCH /repos/${REPO}/git/refs/heads/room/log`]: () => {
      patches += 1;
      return moved && patches === 1 ? [422, { message: "not a fast forward" }] : [200, {}];
    },
  };
}

test("promote writes one commit with the log line and the baton file", async () => {
  const { fetchImpl, calls } = fakeGitHub(promoteRoutes());
  const files = promotionFiles(message);
  assert.match(files.line, /^- 2026-10-03T15:22:00.000Z 01JTEST mark decision Ship it: now refs=pr:#13$/);
  assert.match(files.yaml, /^body: "Ship it:\\nnow"$/m);
  const result = await commitPromotion({ id: message.id, ...files, env: { HQ_GITHUB_TOKEN: "t" }, fetchImpl });
  assert.equal(result.sha, "commit1");
  const tree = calls.find((call) => call.path.endsWith("/git/trees")).body;
  assert.equal(tree.base_tree, "tree1");
  assert.deepEqual(
    tree.tree.map((entry) => entry.path),
    ["docs/relay/ROOM_LOG.md", "docs/relay/batons/01JTEST.yaml"]
  );
  assert.ok(tree.tree[0].content.endsWith(`${files.line}\n`));
  const patch = calls.find((call) => call.method === "PATCH");
  assert.equal(patch.body.force, false);
});

test("promote is idempotent and rebuilds once if the branch moved", async () => {
  const files = promotionFiles(message);
  const already = fakeGitHub(promoteRoutes({ logExists: true, logText: `# Room log\n\n${files.line}\n` }));
  const again = await commitPromotion({ id: message.id, ...files, env: { HQ_GITHUB_TOKEN: "t" }, fetchImpl: already.fetchImpl });
  assert.equal(again.already, true);
  assert.equal(already.calls.filter((call) => call.method !== "GET").length, 0);

  const moved = fakeGitHub(promoteRoutes({ moved: true }));
  const result = await commitPromotion({ id: message.id, ...files, env: { HQ_GITHUB_TOKEN: "t" }, fetchImpl: moved.fetchImpl });
  assert.equal(result.sha, "commit2");
  assert.equal(moved.calls.filter((call) => call.method === "PATCH").length, 2);
});
