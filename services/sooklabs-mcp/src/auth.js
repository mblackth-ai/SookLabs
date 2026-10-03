import { createRemoteJWKSet, jwtVerify } from "jose";

/**
 * @param {string} issuerUrl
 */
export async function fetchAuthorizationServerMetadata(issuerUrl) {
  const issuer = issuerUrl.replace(/\/$/, "");
  const candidates = [
    `${issuer}/.well-known/oauth-authorization-server`,
    `${issuer}/.well-known/openid-configuration`,
  ];
  let lastError = null;
  for (const url of candidates) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        lastError = new Error(`HTTP ${response.status} from ${url}`);
        continue;
      }
      const metadata = await response.json();
      if (metadata?.issuer && metadata?.jwks_uri) {
        return metadata;
      }
      lastError = new Error(`Incomplete metadata from ${url}`);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error("Could not load authorization server metadata");
}

/**
 * @param {{ issuer: string; jwksUri: string; expectedResource: URL }} options
 */
export function createJwtAccessTokenVerifier({ issuer, jwksUri, expectedResource }) {
  const jwks = createRemoteJWKSet(new URL(jwksUri));

  return {
    /**
     * @param {string} token
     */
    async verifyAccessToken(token) {
      const { payload } = await jwtVerify(token, jwks, {
        issuer,
        audience: expectedResource.href,
      });

      const sub = payload.sub;
      if (typeof sub !== "string" || !sub) {
        const error = new Error("Token is missing subject");
        error.name = "InvalidTokenError";
        throw error;
      }

      const scopeRaw = payload.scope;
      const scopes =
        typeof scopeRaw === "string"
          ? scopeRaw.split(/\s+/).filter(Boolean)
          : Array.isArray(scopeRaw)
            ? scopeRaw.map(String)
            : [];

      return {
        token,
        clientId: typeof payload.client_id === "string" ? payload.client_id : sub,
        scopes,
        expiresAt: payload.exp,
        resource: expectedResource,
        extra: { sub },
      };
    },
  };
}
