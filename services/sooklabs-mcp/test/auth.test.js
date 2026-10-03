import assert from "node:assert/strict";
import { createServer } from "node:http";
import { once } from "node:events";
import { test } from "node:test";
import { exportJWK, generateKeyPair, SignJWT } from "jose";
import { createJwtAccessTokenVerifier } from "../src/auth.js";

test("JWT acceptance rejects invalid credentials and preserves authenticated seat identity", async (t) => {
  const { privateKey, publicKey } = await generateKeyPair("RS256");
  const jwk = { ...await exportJWK(publicKey), kid: "test-key", alg: "RS256", use: "sig" };
  const server = createServer((_req, res) => {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ keys: [jwk] }));
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
    server.closeAllConnections();
  }));
  const issuer = "https://issuer.example.test";
  const resource = new URL("https://mcp.example.test/mcp");
  const verifier = createJwtAccessTokenVerifier({
    issuer,
    jwksUri: `http://127.0.0.1:${server.address().port}/jwks`,
    expectedResource: resource,
  });
  const sign = (overrides = {}, key = privateKey) => new SignJWT({
    sub: "codex",
    scope: "sooklabs:read",
    client_id: "test-client",
    iss: issuer,
    aud: resource.href,
    exp: Math.floor(Date.now() / 1000) + 300,
    ...overrides,
  }).setProtectedHeader({ alg: "RS256", kid: "test-key" }).sign(key);
  await t.test("valid token retains subject, scope and resource", async () => {
    const result = await verifier.verifyAccessToken(await sign());
    assert.equal(result.extra.sub, "codex");
    assert.deepEqual(result.scopes, ["sooklabs:read"]);
    assert.equal(result.resource.href, resource.href);
  });
  for (const [name, claims] of [
    ["wrong audience", { aud: "https://other.example.test/mcp" }],
    ["wrong issuer", { iss: "https://other-issuer.example.test" }],
    ["expired token", { exp: Math.floor(Date.now() / 1000) - 60 }],
    ["missing subject", { sub: undefined }],
  ]) {
    await t.test(name, async () => {
      await assert.rejects(verifier.verifyAccessToken(await sign(claims)));
    });
  }
  await t.test("invalid signature", async () => {
    const other = await generateKeyPair("RS256");
    await assert.rejects(verifier.verifyAccessToken(await sign({}, other.privateKey)));
  });
  await t.test("malformed token", async () => {
    await assert.rejects(verifier.verifyAccessToken("not-a-jwt"));
  });
});
