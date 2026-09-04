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

const HSTS = "max-age=63072000; includeSubDomains; preload";

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://vitals.vercel-insights.com https://va.vercel-scripts.com https://www.google-analytics.com https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com",
  "frame-src 'self' https://discord.com https://*.discord.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Strict-Transport-Security", value: HSTS },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  outputFileTracingIncludes: {
    "/blog": ["./data/blog/**/*"],
    "/blog/[slug]": ["./data/blog/**/*"],
    "/blog/rss.xml": ["./data/blog/**/*"],
    "/sitemap.xml": ["./data/blog/**/*"],
    "/llms.txt": ["./data/blog/**/*"],
    "/llms-full.txt": ["./data/blog/**/*"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
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
      {
        source: "/sooklabs-v2/resources",
        destination: "/resources",
        permanent: false,
      },
      {
        source: "/news",
        destination: "/blog",
        permanent: false,
      },
      {
        source: "/news/:slug",
        destination: "/blog/:slug",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
