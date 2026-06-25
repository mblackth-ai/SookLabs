# Claude Design MCP Import

**Project ID:** `9aa38ba7-ce35-40ff-bc02-f99427bd9e0c`  
**Preview URL:** https://claude.ai/design/p/9aa38ba7-ce35-40ff-bc02-f99427bd9e0c  
**Imported:** 2026-06-25

## Import method

Live `claude_design` MCP tools were not exposed in the Cursor agent session (endpoint `https://api.anthropic.com/v1/design/mcp` returns 401 without OAuth). This folder was populated from the canonical handoff bundle for the same project (exported from Claude Design), plus the production homepage HTML bundle.

## Contents

| Path | Description |
|------|-------------|
| `sooklabs-design-system/` | Full design-system handoff (tokens, components, ui_kits) |
| `homepage-html/SookLabs Homepage.html` | Production bundler wrapper with embedded React kit |

## Homepage module graph (sooklabs-site)

Load order from `ui_kits/sooklabs-site/index.html`:

1. `icons.jsx`
2. `kit-ui.jsx`
3. `hero-scroll.jsx` — `HeroScrollScene`, `Reveal`
4. `sections-hero.jsx` — `Header`, `Hero`
5. `sections-body.jsx` — body sections + `Footer`

## Implementation target

Next.js route: `app/sooklabs-v2/page.jsx` + `app/sooklabs-v2/sooklabs-v2.css`
