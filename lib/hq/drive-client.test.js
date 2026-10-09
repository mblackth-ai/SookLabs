import assert from "node:assert/strict";
import { createVerify, generateKeyPairSync } from "node:crypto";
import test from "node:test";
import { changedQuery, createDriveClient, serviceAccountAssertion } from "./drive-client.js";

const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const credentials = { client_email: "bridge@example.iam.gserviceaccount.com", private_key: privateKey.export({ type: "pkcs8", format: "pem" }) };

test("assertion: RS256 JWT for the token endpoint, read-only scope, 1 h, verifiable signature", () => {
  const jwt = serviceAccountAssertion(credentials, 1_000_000);
  const [h, c, sig] = jwt.split(".");
  assert.deepEqual(JSON.parse(Buffer.from(h, "base64url")), { alg: "RS256", typ: "JWT" });
  const claims = JSON.parse(Buffer.from(c, "base64url"));
  assert.deepEqual(claims, { iss: credentials.client_email, scope: "https://www.googleapis.com/auth/drive.readonly", aud: "https://oauth2.googleapis.com/token", iat: 1_000_000, exp: 1_003_600 });
  assert.equal(createVerify("RSA-SHA256").update(`${h}.${c}`).verify(publicKey, Buffer.from(sig, "base64url")), true);
});

test("query: folder + not trashed + changed after, with quotes escaped", () => {
  assert.equal(changedQuery("F1", "2026-10-05T00:00:00Z"), "'F1' in parents and trashed = false and modifiedTime > '2026-10-05T00:00:00Z'");
  assert.equal(changedQuery("a'b", "x"), "'a\\'b' in parents and trashed = false and modifiedTime > 'x'");
});

test("client: one token for many calls, pages followed, Docs exported, markdown downloaded, others skipped", async () => {
  const calls = [];
  const reply = (body, ok = true, status = 200) => ({ ok, status, json: async () => body, text: async () => body });
  const fetchImpl = async (url, init = {}) => {
    calls.push({ url: String(url), auth: init.headers?.authorization || "" });
    const u = new URL(url);
    if (u.href.startsWith("https://oauth2.googleapis.com/token")) {
      assert.equal(new URLSearchParams(init.body).get("grant_type"), "urn:ietf:params:oauth:grant-type:jwt-bearer");
      return reply({ access_token: "tok", expires_in: 3600 });
    }
    if (u.pathname === "/drive/v3/files" && !u.searchParams.get("pageToken")) {
      assert.equal(u.searchParams.get("supportsAllDrives"), "true");
      return reply({ nextPageToken: "p2", files: [{ id: "d1", name: "13 — ruling", mimeType: "application/vnd.google-apps.document", modifiedTime: "2026-10-05T19:00:00Z", webViewLink: "https://docs.google.com/document/d/d1/edit" }] });
    }
    if (u.pathname === "/drive/v3/files") {
      return reply({ files: [
        { id: "m1", name: "draft.md", mimeType: "text/markdown", modifiedTime: "2026-10-05T19:05:00Z" },
        { id: "p1", name: "scan.pdf", mimeType: "application/pdf", modifiedTime: "2026-10-05T19:06:00Z" },
      ] });
    }
    if (u.pathname.endsWith("/d1/export")) return reply("Doc text");
    if (u.pathname.endsWith("/m1")) return reply("---\nstatus: draft\n---\nBody");
    return reply({}, false, 404);
  };
  const client = createDriveClient({ credentials, folderId: "F1", fetchImpl, now: () => 1_700_000_000_000 });
  const files = await client.changedFiles("2026-10-05T00:00:00Z");
  assert.deepEqual(files.map((f) => [f.fileId, f.text]), [["d1", "Doc text"], ["m1", "---\nstatus: draft\n---\nBody"]]);
  assert.equal(files[0].viewUrl, "https://docs.google.com/document/d/d1/edit");
  assert.equal(calls.filter((c) => c.url.startsWith("https://oauth2")).length, 1);
  assert.ok(calls.filter((c) => !c.url.startsWith("https://oauth2")).every((c) => c.auth === "Bearer tok"));
});

test("client: a failed token exchange or request throws without leaking the key", async () => {
  const client = createDriveClient({ credentials, folderId: "F1", fetchImpl: async () => ({ ok: false, status: 401, json: async () => ({}) }) });
  await assert.rejects(client.changedFiles("x"), (error) => /token exchange failed \(HTTP 401\)/.test(error.message) && !error.message.includes("PRIVATE"));
});
