const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://sooklabs.com";

export default function robots() {
  const disallowHq = ["/hq", "/hq/", "/sooklabs-v2", "/sooklabs-v2/"];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: disallowHq,
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "Google-Extended",
          "PerplexityBot",
          "ClaudeBot",
          "Applebot-Extended",
          "CCBot",
        ],
        allow: ["/", "/llms.txt", "/llms-full.txt", "/blog", "/sitemap.xml"],
        disallow: disallowHq,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
