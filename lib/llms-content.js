import {
  CONTACT_EMAIL,
  DISCORD_INVITE_URL,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
  SOCIAL_PROFILES,
} from "@/lib/site";

export function buildLlmsTxt() {
  const socialLines = [
    ...SOCIAL_PROFILES.map((p) => `- ${p.label}: ${p.url}`),
    ...(DISCORD_INVITE_URL ? [`- Discord Community: ${DISCORD_INVITE_URL}`] : []),
  ].join("\n");

  return `# ${SITE_NAME}

> ${SITE_TAGLINE}

Canonical site: ${SITE_URL}
Contact: ${CONTACT_EMAIL}

## Public pages

- Home: ${SITE_URL}/
- Free GEO audit: ${SITE_URL}/audit
- Privacy: ${SITE_URL}/privacy
- Terms of Use: ${SITE_URL}/terms

## Ecosystem

- Sookly (omnichat / AI receptionist): https://sookly.co
${DISCORD_INVITE_URL ? `- SookLabs Community (Discord): ${DISCORD_INVITE_URL}` : "- SookLabs Community (Discord): invite linked from site footer when configured"}

## Social profiles

${socialLines}

## Indexing note

HQ (https://hq.sooklabs.com/hq) is an internal, password-protected workspace and is excluded from public search indexing.
`;
}
