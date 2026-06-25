---
name: sooklabs-design
description: Use this skill to generate well-branded interfaces and assets for SookLabs (and its ecosystem — Sookly, SEOS, RoastMyOpSec, SookLabs Community), either for production or throwaway prototypes/mocks. Contains essential design guidelines, colors, type, fonts, assets, reusable components, and product UI kits for prototyping in the calm "control-room" brand direction.
user-invocable: true
---

# SookLabs Design System

Read **README.md** first — it is the full brand guide (company context, content/voice rules, visual foundations, iconography, and the file manifest). Then explore the files referenced below.

If creating visual artifacts (slides, mocks, throwaway prototypes), copy assets out and create static HTML files for the user to view. If working on production code, copy assets and read the rules here to design as an expert in this brand.

If the user invokes this skill without guidance, ask what they want to build, ask a few focused questions, then act as an expert designer who outputs HTML artifacts **or** production code.

## The one rule
> If a product or feature does not reduce repetition, interruptions, cognitive load, or waiting time, it does not belong in SookLabs.

Brand feeling: a calm control room for intelligent systems — clarity, discipline, precision, operational calm. Dark premium ground, restrained blue/cyan/violet accents, soft glow, fine grid, matte-glass cards. Never loud, never hype.

## What's here
- `styles.css` — the single global stylesheet. Link it and use the CSS custom properties (`--bg-page`, `--surface-card`, `--accent`, `--accent-glow`, `--text-primary`, `--font-display`, `--font-mono`, …). Do NOT hardcode hex values.
- `tokens/` — colors, typography, spacing, effects, fonts (Bricolage Grotesque · DM Sans · DM Mono, all Google-hosted).
- `assets/` — `sooklabs-logo.png` (circular mark), `sooklabs-glyph.png` (waveform mark — the brand origin symbol). Use the glyph as the hero anchor / app icon.
- `components/` — reusable React primitives: `Button`, `IconButton`, `Badge`, `Overline`, `Card`, `Input`, `Switch`, `StatTile`. Each has a `.prompt.md` with usage. Mount via the compiled bundle (`window.<Namespace>`) — see any `components/**/*.card.html`.
- `ui_kits/sooklabs-site/` — the dark ecosystem homepage (hero with the logo-as-origin orbital field, operating rule, four-product ecosystem, philosophy, pillars, mantra).
- `ui_kits/sookly/` — the Sookly omnichat + AI receptionist inbox (interactive 3-pane app).
- `guidelines/cards/` — foundation specimen cards (color, type, spacing, brand).

## Icons
Use **Lucide** (lucide.dev) — thin 1.75-stroke line icons, `currentColor`, sizes 16/20/24. No emoji. The UI-kit JSX files contain inline Lucide-style icon sets you can copy.

## Voice
Calm, direct, minimal, slightly philosophical. Sentence case. Triads and parallel structure ("Reduce the noise. Protect the focus. Build the system. Repeat with discipline."). Plain status words (Built, In progress). Real, modest numbers. No hype words, no exclamation marks, no emoji.

## Source repositories (for deeper work)
- Product codebase: the SookLabs Next.js landing page (light placeholder build) — source of fonts and product copy.
- GitHub: https://github.com/mblackth-ai/SookLabs — explore for the latest product source when iterating.
