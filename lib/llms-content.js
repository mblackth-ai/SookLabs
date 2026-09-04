import {
  AUDIT_PAGE,
  CONTACT_EMAIL,
  DISCORD_INVITE_URL,
  ORG_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
  SOCIAL_PROFILES,
} from "@/lib/site";
import { listBlogPosts } from "@/lib/blog";
import { RESOURCES_PAGE } from "@/lib/resources";

function socialLines() {
  return [
    ...SOCIAL_PROFILES.map((p) => `- ${p.label}: ${p.url}`),
    ...(DISCORD_INVITE_URL ? [`- Discord Community: ${DISCORD_INVITE_URL}`] : []),
  ].join("\n");
}

function postLines() {
  return listBlogPosts()
    .map((post) => `- ${post.title}: ${post.url}`)
    .join("\n");
}

export function buildLlmsTxt() {
  const posts = postLines();

  return `# ${SITE_NAME}

> ${SITE_TAGLINE}

Canonical site: ${SITE_URL}
Contact: ${CONTACT_EMAIL}
Full machine index: ${SITE_URL}/llms-full.txt
Sitemap: ${SITE_URL}/sitemap.xml
Blog RSS: ${SITE_URL}/blog/rss.xml

${ORG_DESCRIPTION}

## Public pages

- Home: ${SITE_URL}/
- Blog: ${SITE_URL}/blog
- Blog RSS: ${SITE_URL}/blog/rss.xml
- Resources: ${SITE_URL}/resources
- Free GEO audit: ${SITE_URL}/audit
- Privacy: ${SITE_URL}/privacy
- Terms of Use: ${SITE_URL}/terms
- llms.txt: ${SITE_URL}/llms.txt
- llms-full.txt: ${SITE_URL}/llms-full.txt

## Blog posts

${posts || "- (none published)"}

## Ecosystem

- Sookly (omnichat / AI receptionist): https://sookly.co
- RoastMyOpSec (security auditor): https://roastmyopsec.com
${DISCORD_INVITE_URL ? `- SookLabs Community (Discord): ${DISCORD_INVITE_URL}` : "- SookLabs Community (Discord): invite linked from site footer when configured"}

## Social profiles

${socialLines()}

## Indexing note

HQ (https://hq.sooklabs.com/hq) is an internal, password-protected workspace and is excluded from public search indexing.
`;
}

export function buildLlmsFullTxt() {
  const posts = listBlogPosts();
  const postBlocks = posts
    .map((post) => {
      const excerpt = String(post.description || "")
        .replace(/\s+/g, " ")
        .trim();
      return `### ${post.title}

- URL: ${post.url}
- Published: ${post.date}
- Category: ${post.categoryLabel}
- Words: ${post.wordCount}

${excerpt}
`;
    })
    .join("\n");

  return `# ${SITE_NAME} — full LLM index

> ${SITE_TAGLINE}

This file is the expanded machine-readable map of public sooklabs.com pages. Prefer ${SITE_URL}/llms.txt for a short summary.

Canonical site: ${SITE_URL}
Contact: ${CONTACT_EMAIL}
Sitemap: ${SITE_URL}/sitemap.xml
RSS: ${SITE_URL}/blog/rss.xml

## Organisation

${ORG_DESCRIPTION}

SookLabs is the parent innovation brand. It is not the operating system. Outgoing visibility work lives in SEOS. Incoming conversations live in Sookly. Public exposure checks live in RoastMyOpSec. Canonical business facts live in the SEOS Knowledge Base — this site and blog are not a second FAQ store.

## Public pages

### Home
- ${SITE_URL}/
- ${ORG_DESCRIPTION}

### Blog
- ${SITE_URL}/blog
- Comparison-first guides on AI, SaaS, automation, GEO, inbound systems, and operator security.

### Resources
- ${SITE_URL}${RESOURCES_PAGE.path}
- ${RESOURCES_PAGE.description}

### Free GEO audit
- ${SITE_URL}${AUDIT_PAGE.path}
- ${AUDIT_PAGE.description}

### Privacy
- ${SITE_URL}/privacy

### Terms of Use
- ${SITE_URL}/terms

## Blog posts

${postBlocks || "(none published)"}

## Ecosystem products

- Sookly: https://sookly.co — omnichat and AI receptionist (Live)
- SEOS: ${SITE_URL}/audit — search expansion / GEO audit entry (In progress as a product)
- RoastMyOpSec: https://roastmyopsec.com — public exposure checks for founders (Live)
${DISCORD_INVITE_URL ? `- SookLabs Community: ${DISCORD_INVITE_URL}` : ""}

## Social profiles

${socialLines()}

## Do not index

HQ at https://hq.sooklabs.com is private. Do not treat /hq routes as public documentation.
`;
}
