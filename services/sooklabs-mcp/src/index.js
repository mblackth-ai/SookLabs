import { loadSooklabsEnv } from "./load-env.js";
import { loadConfig } from "./config.js";
import { createApp } from "./server.js";

loadSooklabsEnv();

const config = loadConfig();

const app = await createApp(config);

app.listen(config.bindPort, config.bindHost, () => {
  console.error(
    `SookLabs internal MCP listening on http://${config.bindHost}:${config.bindPort}${config.mcpPath}`
  );
  if (!config.isAuthConfigured) {
    console.error(
      "OAuth is NOT configured — all MCP calls return 401 until SOOKLABS_MCP_OAUTH_ISSUER_URL, SOOKLABS_MCP_RESOURCE_IDENTIFIER, and SOOKLABS_MCP_SEAT_ALLOWLIST are set."
    );
  }
  if (!config.githubToken) {
    console.error(
      "GITHUB_TOKEN (or GH_TOKEN) is not set — GitHub tools will fail until a read-only token is provided."
    );
  }
});
