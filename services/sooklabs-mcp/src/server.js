import { randomUUID } from "node:crypto";
import { metadataHandler } from "@modelcontextprotocol/sdk/server/auth/handlers/metadata.js";
import { requireBearerAuth } from "@modelcontextprotocol/sdk/server/auth/middleware/bearerAuth.js";
import { InvalidTokenError } from "@modelcontextprotocol/sdk/server/auth/errors.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import {
  createJwtAccessTokenVerifier,
  fetchAuthorizationServerMetadata,
} from "./auth.js";
import { createGitHubClient } from "./github.js";
import { createMcpServer } from "./tools.js";

/**
 * @param {import('./config.js').loadConfig extends () => infer R ? R : never} config
 */
export function buildWwwAuthenticate(config, errorCode, description) {
  let header = `Bearer error="${errorCode}", error_description="${description}"`;
  if (config.protectedResourceMetadataUrl) {
    header += `, resource_metadata="${config.protectedResourceMetadataUrl}"`;
  }
  return header;
}

/**
 * @param {ReturnType<import('./config.js').loadConfig>} config
 */
export function createConfigRefusalMiddleware(config) {
  return (_req, res, _next) => {
    res.set(
      "WWW-Authenticate",
      buildWwwAuthenticate(
        config,
        "invalid_request",
        "SookLabs MCP OAuth is not configured (issuer and seat allowlist required)"
      )
    );
    res.status(401).json({
      error: "mcp_not_configured",
      error_description:
        "Set SOOKLABS_MCP_OAUTH_ISSUER_URL, SOOKLABS_MCP_RESOURCE_IDENTIFIER, and SOOKLABS_MCP_SEAT_ALLOWLIST before calling this server.",
    });
  };
}

/**
 * @param {ReturnType<import('./config.js').loadConfig>} config
 */
export function createSeatAllowlistMiddleware(config) {
  const allowlist = new Set(config.seatAllowlist);
  return (req, res, next) => {
    const sub = req.auth?.extra?.sub;
    if (typeof sub !== "string" || !allowlist.has(sub)) {
      res.set(
        "WWW-Authenticate",
        buildWwwAuthenticate(config, "insufficient_scope", "Seat is not on the MCP allowlist")
      );
      res.status(403).json({
        error: "seat_not_allowed",
        error_description: "Token subject is not authorized for this MCP server.",
      });
      return;
    }
    next();
  };
}

/**
 * @param {ReturnType<import('./config.js').loadConfig>} config
 */
export async function createApp(config) {
  const app = createMcpExpressApp({
    host: config.bindHost,
    allowedHosts:
      config.bindHost === "0.0.0.0" || config.bindHost === "::"
        ? undefined
        : undefined,
  });

  if (config.resourceServerUrl && config.oauthIssuerUrl) {
    const protectedResourceMetadata = {
      resource: config.resourceServerUrl.href,
      authorization_servers: [config.oauthIssuerUrl.replace(/\/$/, "")],
      resource_name: "SookLabs Internal MCP",
    };
    const rsPath =
      config.resourceServerUrl.pathname && config.resourceServerUrl.pathname !== "/"
        ? config.resourceServerUrl.pathname
        : "";
    app.use(
      `/.well-known/oauth-protected-resource${rsPath}`,
      metadataHandler(protectedResourceMetadata)
    );
  }

  const github = createGitHubClient({
    token: config.githubToken,
    repo: config.githubRepo,
  });
  const mcpServer = createMcpServer(github);

  const refusal = createConfigRefusalMiddleware(config);
  /** @type {import('express').RequestHandler[]} */
  const mcpMiddleware = [refusal];

  if (config.isAuthConfigured && config.resourceServerUrl) {
    const asMetadata = await fetchAuthorizationServerMetadata(config.oauthIssuerUrl);
    const verifier = createJwtAccessTokenVerifier({
      issuer: asMetadata.issuer,
      jwksUri: asMetadata.jwks_uri,
      expectedResource: config.resourceServerUrl,
    });

    const wrappedVerifier = {
      verifyAccessToken: async (token) => {
        try {
          return await verifier.verifyAccessToken(token);
        } catch (error) {
          throw new InvalidTokenError(
            error instanceof Error ? error.message : "Invalid access token"
          );
        }
      },
    };

    mcpMiddleware.length = 0;
    mcpMiddleware.push(
      requireBearerAuth({
        verifier: wrappedVerifier,
        resourceMetadataUrl: config.protectedResourceMetadataUrl ?? undefined,
        expectedResource: config.resourceServerUrl,
      }),
      createSeatAllowlistMiddleware(config)
    );
  }

  const sessions = new Map();
  const IDLE_MS = 30 * 60_000;
  const MAX_SESSIONS = 500;

  const trackResponse = (session, res) => {
    if (!res.socket || res.destroyed) return;
    session.open += 1;
    res.on("close", () => {
      session.open -= 1;
      session.lastActive = Date.now();
    });
  };

  setInterval(() => {
    const cutoff = Date.now() - IDLE_MS;
    for (const [sessionId, session] of sessions) {
      if (session.open === 0 && session.lastActive < cutoff) {
        session.transport.close().catch(() => {});
        sessions.delete(sessionId);
      }
    }
  }, 60_000).unref();

  const mcpPostHandler = async (req, res) => {
    const sessionId = req.headers["mcp-session-id"];
    try {
      const existing = sessionId ? sessions.get(String(sessionId)) : undefined;
      let transport;
      if (existing) {
        transport = existing.transport;
        trackResponse(existing, res);
      } else if (!sessionId && isInitializeRequest(req.body)) {
        if (sessions.size >= MAX_SESSIONS) {
          res.status(503).json({
            jsonrpc: "2.0",
            error: { code: -32000, message: "Too many open sessions" },
            id: null,
          });
          return;
        }
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (id) => {
            sessions.set(id, { transport, open: 0, lastActive: Date.now() });
          },
        });
        transport.onclose = () => {
          const sid = transport.sessionId;
          if (sid) sessions.delete(sid);
        };
        await mcpServer.connect(transport);
        await transport.handleRequest(req, res, req.body);
        return;
      } else if (sessionId) {
        res.status(404).json({
          jsonrpc: "2.0",
          error: { code: -32001, message: "Session not found" },
          id: null,
        });
        return;
      } else {
        res.status(400).json({
          jsonrpc: "2.0",
          error: { code: -32000, message: "Bad Request: No valid session ID provided" },
          id: null,
        });
        return;
      }
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error("MCP POST error:", error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: { code: -32603, message: "Internal server error" },
          id: null,
        });
      }
    }
  };

  const mcpGetHandler = async (req, res) => {
    const sessionId = req.headers["mcp-session-id"];
    if (!sessionId) {
      res.status(400).send("Missing session ID");
      return;
    }
    const session = sessions.get(String(sessionId));
    if (!session) {
      res.status(404).json({
        jsonrpc: "2.0",
        error: { code: -32001, message: "Session not found" },
        id: null,
      });
      return;
    }
    trackResponse(session, res);
    await session.transport.handleRequest(req, res);
  };

  const mcpDeleteHandler = async (req, res) => {
    const sessionId = req.headers["mcp-session-id"];
    if (!sessionId) {
      res.status(400).send("Missing session ID");
      return;
    }
    const session = sessions.get(String(sessionId));
    if (!session) {
      res.status(404).json({
        jsonrpc: "2.0",
        error: { code: -32001, message: "Session not found" },
        id: null,
      });
      return;
    }
    trackResponse(session, res);
    await session.transport.handleRequest(req, res);
  };

  app.post(config.mcpPath, ...mcpMiddleware, mcpPostHandler);
  app.get(config.mcpPath, ...mcpMiddleware, mcpGetHandler);
  app.delete(config.mcpPath, ...mcpMiddleware, mcpDeleteHandler);

  app.get("/healthz", (_req, res) => {
    res.json({
      ok: true,
      authConfigured: config.isAuthConfigured,
      githubRepo: config.githubRepo,
      githubTokenPresent: Boolean(config.githubToken),
    });
  });

  return app;
}
