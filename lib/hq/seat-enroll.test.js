import assert from "node:assert/strict";
import test from "node:test";

const url = process.env.HQ_TEST_DATABASE_URL;
const opts = { skip: !url && "set HQ_TEST_DATABASE_URL" };

async function setup() {
  process.env.HQ_DATABASE_URL = url;
  const enroll = await import("./seat-enroll.js");
  const auth = await import("./seat-auth.js");
  const routing = await import("./swarm-routing.js");
  await enroll.migrateEnroll();
  const { default: Pg } = await import("pg");
  const admin = new Pg.Client({ connectionString: url });
  await admin.connect();
  await admin.query("TRUNCATE hq_seat_enrollments");
  const done = async () => {
    await admin.end();
    await enroll.closeEnrollPool();
  };
  return { enroll, auth, routing, admin, done };
}

const env = { HQ_ROOM_CONNECTION_MARK: "mark-env-key" };

test("enroll: inactive until approved with the right code; then it identifies exactly that seat", opts, async () => {
  const { enroll, auth, routing, done } = await setup();
  try {
    const req = await enroll.requestEnrollment({ seat: "codex", client: "codex-cli <script>" });
    assert.match(req.key, /^hqk_/);
    assert.match(req.pairingCode, /^[A-Z2-9]{4}-[A-Z2-9]{4}$/);

    const pending = await auth.identifySeatAny({ token: req.key, env });
    assert.equal(pending.ok, false);
    assert.match(pending.error, /waiting for approval/);

    // Only approvers; never self-approval; the code must match.
    assert.equal((await enroll.decideEnrollment({ id: req.id, code: req.pairingCode, approve: true, approver: "grok", env })).error.status, 403);
    const wrong = await enroll.decideEnrollment({ id: req.id, code: "AAAA-AAAA", approve: true, approver: "mark", env });
    assert.match(wrong.error.error, /Wrong pairing code/);
    const ok = await enroll.decideEnrollment({ id: req.id, code: req.pairingCode.toLowerCase().replace("-", " "), approve: true, approver: "mark", env });
    assert.equal(ok.enrollment.status, "active");

    const who = await auth.identifySeatAny({ token: req.key, env });
    assert.equal(who.ok, true);
    assert.equal(who.seat, "codex");
    assert.equal((await auth.identifySeatAny({ token: req.key, claimedSeat: "claude", env })).ok, false);
    const list = await enroll.listEnrollments();
    assert.ok(list.every((row) => !("key" in row) && !("code_hash" in row)));
    assert.equal(list.find((row) => row.id === req.id).client, "codex-cli script");

    // A pull seat with an approved issued key counts as connected; the marker is not a secret.
    const effective = await auth.seatEnv({ HQ_SEAT_ADAPTER_CODEX: "pull" });
    assert.equal(effective.HQ_SEAT_ISSUED_CODEX, "1");
    assert.equal(routing.adapterFor("codex", effective).ready, true);
    assert.equal(routing.adapterFor("codex", { HQ_SEAT_ADAPTER_CODEX: "pull" }).ready, false);
    assert.equal((await auth.identifySeatAny({ token: "1", env: effective })).ok, false);

    // A newer approved key for the same seat replaces the older one.
    const again = await enroll.requestEnrollment({ seat: "codex" });
    await enroll.decideEnrollment({ id: again.id, code: again.pairingCode, approve: true, approver: "mark", env });
    assert.equal((await auth.identifySeatAny({ token: req.key, env })).ok, false);
    assert.equal((await auth.identifySeatAny({ token: again.key, env })).seat, "codex");

    // Revocation.
    await enroll.revokeSeatKeys({ seat: "codex", by: "mark" });
    const revoked = await auth.identifySeatAny({ token: again.key, env });
    assert.equal(revoked.ok, false);
    assert.match(revoked.error, /revoked/);
  } finally {
    await done();
  }
});

test("enroll: delegation, lockout, caps, expiry and non-agent seats", opts, async () => {
  const { enroll, done } = await setup();
  try {
    const delegated = { HQ_SEAT_ENROLL_APPROVERS: "grok, nobody" };
    assert.deepEqual(enroll.enrollApprovers(delegated), ["mark", "grok"]);
    const forCodex = await enroll.requestEnrollment({ seat: "codex" });
    assert.equal((await enroll.decideEnrollment({ id: forCodex.id, code: forCodex.pairingCode, approve: true, approver: "grok", env: delegated })).enrollment.decidedBy, "grok");
    const forGrok = await enroll.requestEnrollment({ seat: "grok" });
    assert.match((await enroll.decideEnrollment({ id: forGrok.id, code: forGrok.pairingCode, approve: true, approver: "grok", env: delegated })).error.error, /own key/);

    // Five wrong codes deny the request.
    const locked = await enroll.requestEnrollment({ seat: "cursor" });
    for (let i = 0; i < 5; i += 1) await enroll.decideEnrollment({ id: locked.id, code: "ZZZZ-ZZZZ", approve: true, approver: "mark" });
    assert.match((await enroll.decideEnrollment({ id: locked.id, code: locked.pairingCode, approve: true, approver: "mark" })).error.error, /denied/);

    // Per-seat pending cap.
    for (let i = 0; i < 3; i += 1) assert.ok((await enroll.requestEnrollment({ seat: "gemini" })).key);
    assert.equal((await enroll.requestEnrollment({ seat: "gemini" })).error.status, 429);

    // Expired requests cannot be approved.
    const old = await enroll.requestEnrollment({ seat: "chatgpt", now: new Date(Date.now() - 16 * 60_000) });
    assert.match((await enroll.decideEnrollment({ id: old.id, code: old.pairingCode, approve: true, approver: "mark" })).error.error, /expired/);

    // Mark and crew keys are never self-enrolled.
    assert.equal((await enroll.requestEnrollment({ seat: "mark" })).error.status, 400);
    assert.equal((await enroll.requestEnrollment({ seat: "crew" })).error.status, 400);
  } finally {
    await done();
  }
});
