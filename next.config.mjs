import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

function loadSooklabsEnv() {
  const envPath = resolve(process.cwd(), "sooklabs.env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadSooklabsEnv();

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/sooklabs-v2",
        destination: "/",
        permanent: false,
      },
      {
        source: "/sooklabs-v2/audit",
        destination: "/audit",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
