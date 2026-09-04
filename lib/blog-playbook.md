# SookLabs public blog playbook

Status badge for the pipeline: **Workflow Ready** (markdown in-repo). Production go-live is **Manual** until deploy. Never fake **Connected**.

Model the structure, length, and SEO behaviour of the Retail Display USA blog: comparison-first titles, a direct-answer lead, decision sections, honest caveats, and a commercial path to a real product page.

## Length and SEO metrics

- **1,800–2,800 words** (never a thin recap)
- **Title = the query** (often `X vs Y` or `X for Y: … Guide`)
- **Lead = the answer** in 40–90 words. No throat-clearing.
- **7–12 H2s** that match sub-queries a buyer would ask
- **One comparison table**
- **When A is better / When B is better** (explicit)
- **FAQ** as `## FAQ` then `###` questions (5–8). Answers must be usable as snippets.
- **Natural product paths**, not ads: Sookly, SEOS / free GEO audit, RoastMyOpSec, Resources, Discord
- Repeat the money phrase in the title, first paragraph, one H2, and the close — not in every sentence
- Honest claims only. No fake sync, no invented rankings, no “Connected”

## Voice

Calm operator/buyer guide. Reduce noise. Decide from the job, not the category photo.

## Originality

Rephrase industry news into SookLabs ecosystem decisions. Do not copy source articles. Do not fork SEOS Knowledge Base — the blog is organic proof, not a second FAQ store.

## File contract

Write `data/blog/posts/<slug>.md` with frontmatter:

```
title, slug, description, date, updated, category, tags, products
```

Categories: `visibility` | `automation` | `inbound` | `security` | `knowledge` | `industry`

Then mark the queue item `published` in `data/blog/queue.json` and update `data/blog/loop-state.json`.
