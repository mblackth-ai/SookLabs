# SookLabs public site — Search Console, GA4, and crawler files

Repeatable steps after deploying public-site changes to production (`https://sooklabs.com`).

## Machine files (always public)

| URL | Role |
|-----|------|
| `https://sooklabs.com/robots.txt` | Allow public site; disallow `/hq` and `/sooklabs-v2`; points at sitemap |
| `https://sooklabs.com/sitemap.xml` | Home, blog, posts, resources, audit, legal, `llms.txt`, `llms-full.txt`, RSS |
| `https://sooklabs.com/llms.txt` | Short AI/crawler summary + post list |
| `https://sooklabs.com/llms-full.txt` | Full LLM index (pages + post descriptions) |
| `https://sooklabs.com/blog/rss.xml` | Blog feed |

Ping after deploy (no login required):

- Google: `https://www.google.com/ping?sitemap=https://sooklabs.com/sitemap.xml`
- Bing: `https://www.bing.com/ping?sitemap=https://sooklabs.com/sitemap.xml`

## GA4

Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` (form `G-XXXXXXXX`) in Vercel → Environment Variables for Production. The site loads gtag only when that value is present. Vercel Analytics stays on regardless.

Link the GA4 property to the Search Console property (GA4 Admin → Product links → Search Console).

## Google Search Console

1. Confirm the `https://sooklabs.com` property is verified (DNS TXT via Vercel, or HTML tag via `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`).
2. Submit sitemap: `https://sooklabs.com/sitemap.xml`
3. URL Inspection → request indexing for `/`, `/blog`, each `/blog/<slug>`, `/resources`, `/audit`, `/llms.txt`, `/llms-full.txt`.
4. Confirm `robots.txt` and RSS fetch in GSC.
5. Do **not** submit `hq.sooklabs.com` or `/hq`.

## Social profile backlinks (manual)

Set the website / link in bio on each verified profile to `https://sooklabs.com`:

| Platform | Profile | Where to edit |
|----------|---------|---------------|
| Instagram | https://www.instagram.com/sooklabs/ | Edit profile → Links / website |
| Facebook | https://www.facebook.com/sooklabs | Page → About → Website |
| TikTok | https://www.tiktok.com/@sooklabs | Edit profile → bio link |

## Post-deploy checks

- `/sitemap.xml` lists `/`, `/blog`, posts, `/resources`, `/audit`, `/privacy`, `/terms`, `/llms.txt`, `/llms-full.txt`, `/blog/rss.xml` (no HQ).
- `/llms.txt` and `/llms-full.txt` list the same public posts.
- Footer social `rel="me"` still present.
