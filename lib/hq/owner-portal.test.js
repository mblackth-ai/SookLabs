import assert from "node:assert/strict";
import test from "node:test";

const url = process.env.HQ_TEST_DATABASE_URL;
const opts = { skip: !url && "set HQ_TEST_DATABASE_URL" };

async function setup() {
  process.env.HQ_DATABASE_URL = url;
  const owners = await import("./owner-portal.js");
  await owners.migrateOwnerPortal();
  const { default: Pg } = await import("pg");
  const admin = new Pg.Client({ connectionString: url });
  await admin.connect();
  await admin.query("TRUNCATE hq_owner_invites, hq_owner_access");
  const done = async () => {
    await admin.end();
    await owners.closeOwnerPool();
  };
  return { owners, admin, done };
}

test("owner invite: one use, opens exactly one business, revocable", opts, async () => {
  const { owners, admin, done } = await setup();
  try {
    assert.equal(await owners.ownerPortalInstalled(), true);
    const inv = await owners.createOwnerInvite({ business: "retail-display-usa", label: "  Jane   (RDUSA owner) ", by: "mark" });
    assert.match(inv.token, /^hqi_/);
    assert.equal(inv.label, "Jane (RDUSA owner)");

    // Only hashes are stored.
    const stored = await admin.query("SELECT token_hash FROM hq_owner_invites");
    assert.notEqual(stored.rows[0].token_hash, inv.token);

    // Peeking never consumes it.
    assert.equal((await owners.peekOwnerInvite(inv.token)).state, "ready");
    assert.equal((await owners.peekOwnerInvite(inv.token)).state, "ready");

    const used = await owners.redeemOwnerInvite({ token: inv.token });
    assert.match(used.key, /^hqo_/);
    assert.equal(used.business, "retail-display-usa");

    const again = await owners.redeemOwnerInvite({ token: inv.token });
    assert.equal(again.error.status, 410);
    assert.equal(again.error.code, "used");
    assert.match(again.error.error, /already used/);

    const who = await owners.ownerForKey(used.key);
    assert.deepEqual({ business: who.business, label: who.label }, { business: "retail-display-usa", label: "Jane (RDUSA owner)" });
    assert.equal(await owners.ownerForKey("hqo_wrong"), null);
    assert.equal(await owners.ownerForKey(inv.token), null, "an invite token is not a key");

    const list = await owners.listOwners();
    assert.equal(list.access.length, 1);
    assert.equal(list.invites.length, 0);
    assert.equal(JSON.stringify(list).includes("hqo_"), false, "keys never listed");
    assert.ok(list.access[0].lastSeenAt);

    assert.deepEqual(await owners.revokeOwner({ id: who.accessId, by: "mark" }), { ok: true });
    assert.equal(await owners.ownerForKey(used.key), null);
  } finally {
    await done();
  }
});

test("owner invite: expiry, replacement, cancel, bad input", opts, async () => {
  const { owners, done } = await setup();
  try {
    const now = new Date("2026-10-01T00:00:00Z");
    const old = await owners.createOwnerInvite({ business: "jaka-transportation", label: "Owner", by: "mark", now });
    const late = new Date(now.getTime() + owners.OWNER_INVITE_TTL_MS + 1000);
    const expired = await owners.redeemOwnerInvite({ token: old.token, now: late });
    assert.equal(expired.error.status, 410);
    assert.equal(expired.error.code, "expired");

    const first = await owners.createOwnerInvite({ business: "jaka-transportation", label: "Owner", by: "mark" });
    const second = await owners.createOwnerInvite({ business: "jaka-transportation", label: "Owner", by: "mark" });
    const replaced = await owners.redeemOwnerInvite({ token: first.token });
    assert.match(replaced.error.error, /replaced or cancelled/);
    assert.equal(replaced.error.code, "cancelled");

    assert.deepEqual(await owners.revokeOwner({ id: second.id, by: "mark" }), { ok: true });
    assert.equal((await owners.redeemOwnerInvite({ token: second.token })).error.status, 410);

    assert.equal((await owners.createOwnerInvite({ business: "../etc", label: "x", by: "mark" })).error.status, 400);
    const nope = await owners.redeemOwnerInvite({ token: "nope" });
    assert.equal(nope.error.status, 404);
    assert.equal(nope.error.code, "unknown");
    assert.deepEqual(await owners.revokeOwner({ id: "anything", by: "mark" }), { ok: false });
  } finally {
    await done();
  }
});
