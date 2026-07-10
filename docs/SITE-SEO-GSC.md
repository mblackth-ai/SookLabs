# SookLabs public site — Search Console and social backlinks

Repeatable steps after deploying public-site changes to production (`https://sooklabs.com`).

## Google Search Console

1. Open [Google Search Console](https://search.google.com/search-console) and confirm the `https://sooklabs.com` property is verified (DNS TXT via Vercel or HTML tag).
2. Submit the sitemap: `https://sooklabs.com/sitemap.xml`
3. Use **URL Inspection** and request indexing for:
   - `https://sooklabs.com/`
   - `https://sooklabs.com/audit`
   - `https://sooklabs.com/privacy`
   - `https://sooklabs.com/terms`
4. Confirm `https://sooklabs.com/llms.txt` is fetchable (optional but useful for AI crawlers).
5. Do **not** submit `hq.sooklabs.com` or `/hq` paths for indexing — HQ remains `noindex` and is disallowed in `robots.txt`.

## Social profile backlinks (manual)

Set the website / link in bio on each verified profile to `https://sooklabs.com`:

| Platform | Profile | Where to edit |
|----------|---------|---------------|
| Instagram | https://www.instagram.com/sooklabs/ | Edit profile → Links / website |
| Facebook | https://www.facebook.com/sooklabs | Page → About → Website |
| TikTok | https://www.tiktok.com/@sooklabs | Edit profile → bio link |

This completes the backlink loop: site footer links out to social profiles (`rel="me"`), and social bios link back to the canonical site.

## Post-deploy checks

- Footer shows Instagram, Facebook, and TikTok on `/` and `/audit` (desktop and mobile).
- `/privacy` and `/terms` render and are linked from the footer Legal column.
- View page source on `/`: Organization JSON-LD includes `sameAs` with the three social URLs.
- `/sitemap.xml` lists `/`, `/audit`, `/privacy`, `/terms` only (no HQ routes).
