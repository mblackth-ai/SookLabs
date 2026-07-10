const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://sooklabs.com";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/hq", "/hq/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
