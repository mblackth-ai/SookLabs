# SookLabs Design System

> Calm digital systems that reduce repetition, interruptions, cognitive load, and waiting time.

This repository is the brand + product design system for **SookLabs** and its ecosystem. It contains the visual foundations (color, type, spacing, effects), reusable React components, product UI kits, and brand assets needed to design on-brand interfaces and artifacts.

---

## 1. The company

**SookLabs** builds quiet infrastructure for people and businesses who need fewer repeated conversations, clearer workflows, better systems, and more time to focus. It is the parent company behind a small ecosystem of practical products:

| Product | What it is |
|---|---|
| **Sookly** | Omnichat + AI receptionist for service businesses. Handles enquiries, routes messages, reduces missed leads, gives teams one calm inbox. |
| **SEOS** | Search Expansion Operating System — SEO diagnostics, website audits, content systems, and growth operations. |
| **RoastMyOpSec** | Website + SaaS security auditor. Plain-English exposure checks for founders and small teams. |
| **SookLabs Community** | A focused builder community around technology, psychology, and investment. |

**Core operating principle** — the single rule everything is measured against:
> If a product or feature does not reduce repetition, interruptions, cognitive load, or waiting time, it does not belong in SookLabs.

**The feeling:** a calm control room for intelligent systems. Clarity, discipline, precision, intelligence, focus, restraint, depth, operational calm, long-term thinking. Revolutionary, but never loud — something powerful being built carefully.

---

## 2. Sources used to build this system

These were the inputs. The reader may not have access, but they are recorded so the design can be improved against source-of-truth later.

- **Product codebase** — `Sooklabs web/` (Next.js 14 + Tailwind landing page). Source of the **font choices** (Bricolage Grotesque display + DM Sans body), the product copy, and the Sookly inbox / SEO snapshot UI patterns. Note: the codebase is an early **light-theme placeholder** build (logo is a placeholder `SL` badge, founder note is unfilled). This design system follows the **dark, premium control-room direction** specified in the brand brief, not the placeholder light theme.
- **Logo** — `uploads/sooklabs logo.jpg` → processed into `assets/sooklabs-logo.png` (circular, transparent) and `assets/sooklabs-glyph.png` (waveform mark).
- **GitHub** — [github.com/mblackth-ai/SookLabs](https://github.com/mblackth-ai/SookLabs) ("Compress the Diamond"). Currently empty at time of build; explore it for future updates to do a better job building against the real product. Related repos under the same owner: `sookly-omnichat`, `sookly-inbox-custom`, `sookly-site-mockup` (private).

> **Reader:** explore the GitHub repositories above for richer source material when iterating on this system.

---

## 3. Content fundamentals (voice & copy)

The voice is **calm, direct, intelligent, minimal, grounded, and slightly philosophical — never hype-driven.** It should read like a research lab or an operating-system changelog, not a marketing agency.

**Person & address.** Speak to the reader as **"you"** ("more time to focus", "know what is leaking before someone else does"). Refer to the company as **"SookLabs"** or **"we"** sparingly. Avoid first-person founder bravado.

**Casing.** Sentence case for everything — headlines, buttons, labels. Never Title Case marketing headers. Mono overlines/eyebrows are the *only* uppercase, and they are short, spaced labels (`OPERATING RULE`, `CURRENT PROJECTS`).

**Sentence shape.** Short, declarative, confident. Often built as triads and parallel structure — the brand cadence:
- *"Reduce the noise. Protect the focus. Build the system. Repeat with discipline."*
- *"Capture first, route second, follow up always."*
- *"repetition, interruptions, cognitive load, and waiting time"*

**Headline register.** Systems language, not feature language:
- *"Systems that turn repetition into infrastructure."*
- *"Boring is the point."*
- *"Reduce the noise. Protect the focus. Build the system."*

**What to avoid.** No hype words (revolutionary*, game-changing, supercharge, 10x, unleash), no vague AI talk ("powered by AI"), no exclamation marks, no emoji in copy, no growth-hacky urgency. *(\*The brand IS quietly revolutionary — it shows this through restraint, never by saying the word.)*

**Honesty motif.** Status is stated plainly: `Built`, `In progress`, `Principle`. Numbers are real and modest ("3 systems", "2 data sources, 1 clear goal") — never inflated vanity metrics. "Real outputs. No filler metrics."

**Examples (on-brand):**
- Eyebrow: `SOOKLABS — QUIET INFRASTRUCTURE`
- CTA: `Explore the ecosystem` · `Request a snapshot` · `Run an OpSec check`
- Product one-liner: *"Sookly — one calm inbox for every channel."*

---

## 4. Visual foundations

The beauty comes from **order, restraint, depth, and precision** — never decoration. Think operating system / strategic-infrastructure company.

### Backgrounds
- **Dark premium ground.** Deep charcoal-navy base (`--bg-page` `#0A0E16`, `--bg-void` `#06090F`). Never pure black, never light.
- **Soft radial glow fields** behind hero/focal areas — low-opacity blue + cyan + violet ellipses (`--glow-blue/cyan/violet`), heavily feathered. Light comes from *within* the system, like instrument glow.
- **Fine hairline grid** (`--grid-line`, ~5% silver) as an optional control-room backdrop — subtle, precise, never dominant.
- **Subtle orbital geometry + controlled particles** are on-brand motifs for the hero (the logo as origin point of an unfolding ecosystem). Keep them quiet and structured — never chaotic.
- No loud gradients, no neon overload, no crypto aesthetics, no 3D clutter.

### Color
- **Neutrals do the work**: ink (charcoal-navy) surfaces + silver text carry ~90% of the UI.
- **Accents are restrained signals**: blue `#2F7CF0` (primary), cyan `#34CFEA` (the logo waveform / glow / live pulse), violet `#9A85F8` (secondary depth). Use accent sparingly — a single point of focus per view.
- High contrast but **soft edges** — text is near-white silver on deep ink; borders are low-opacity hairlines, not hard lines.

### Typography
- **Display:** Bricolage Grotesque (bold, tight tracking, large). **Body/UI:** DM Sans. **Mono:** DM Mono for technical labels, metrics, overlines, status — the OS/lab register.
- Large display, tight leading (`--leading-tight` 1.08) and negative tracking on headlines. Generous, calm body leading (1.5–1.65). Uppercase + wide tracking reserved for mono overlines only.

### Spacing & layout
- 4px base grid. Generous vertical rhythm (`--section-y` 112px). Content max ~1200px. Precise, roomy, never cramped — whitespace is a feature.

### Cards (matte glass)
- Base `--surface-card` `#161D30` (or `--glass-bg` with `backdrop-filter: blur(16px)` over glow), **hairline border** (`--border-default`), radius `--radius-lg/xl` (16–22px), `--card-shadow` (deep soft shadow + a 5%-white inset top edge that catches the light). No colored-left-border cards, no heavy drop shadows.

### Borders & radii
- Borders are translucent silver hairlines (8–22% opacity). Radii are soft: 12–22px for cards/buttons, `--radius-full` for pills/dots/avatars. Soft edges, high contrast — never sharp boxy corners.

### Shadows & glow
- Elevation = **deep soft black shadows** (`--shadow-md/lg`) because the canvas is dark. "Light" = **accent glow** (`--glow-md/lg`, `--focus-ring`) on the focal/active element only. Inputs and active states get a blue glow ring, not a heavy shadow.

### Motion
- **Calm, controlled, no bounce.** `--ease-out` / `--ease-in-out`, durations 140–400ms for UI, up to 700ms for the hero "unfold". Fades, gentle translate/scale, glow pulses. The hero concept — logo compresses to a glowing point, then expands outward like a *controlled* big bang revealing the ecosystem — should feel like structured intelligence unfolding, never frantic.

### States
- **Hover:** lift to a lighter surface (`--surface-hover`) and/or raise shadow; accent text/borders brighten toward `--accent-hover`. Subtle.
- **Press:** darken toward `--accent-press` and a tiny scale-down (~0.98) — quiet, tactile.
- **Focus:** `--focus-ring` blue glow.
- **Transparency & blur:** used for sticky headers and matte-glass cards floating over glow — `backdrop-filter: blur()` with translucent ink. Not everywhere; reserved for floating/overlay surfaces.

### Imagery vibe
- Cool, dark, technical. Deep blues/charcoal, soft instrument glow, fine geometry. If photography is used: cool-toned, low-key, restrained. No warm stock-photo SaaS imagery, no cartoon illustration.

---

## 5. Iconography

- **System:** [**Lucide**](https://lucide.dev) — thin, consistent 1.5–2px stroke line icons. They match the control-room register: precise, geometric, calm, technical. Load from CDN (see SKILL.md / component cards).
- **Substitution flagged:** the product codebase used **emoji** (💬 📊 ⚙️ 📋) and ad-hoc hand-drawn SVG (hamburger, arrows). Both are off-brand for the dark precise direction, so this system standardizes on Lucide instead. *Swap to a bespoke icon set later if desired.*
- **Stroke & sizing:** default `1.75` stroke width, `currentColor`, sizes 16 / 20 / 24. Icons inherit text color; accent color only on active/focal icons.
- **Emoji:** not used in product UI or marketing copy. **Unicode arrows** (`→`) are acceptable inline in CTAs ("Explore the ecosystem →"), matching the codebase convention.
- **The waveform glyph** (`assets/sooklabs-glyph.png`) is the brand mark — a cyan→blue signal waveform. It is the origin symbol, not a UI icon; use it as the logo / hero anchor, not inline.

---

## 6. Index / manifest

**Root**
- `styles.css` — global entry point (imports only). Consumers link this.
- `readme.md` — this file.
- `SKILL.md` — Agent-Skill manifest for downloading into Claude Code.

**`tokens/`** — `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `effects.css`, `base.css`

**`assets/`** — `sooklabs-logo.jpg` (original), `sooklabs-logo.png` (circular transparent), `sooklabs-glyph.png` (waveform mark)

**`components/`** — reusable React primitives (`export function`, with `.d.ts` + `.prompt.md` + a `.card.html`)
- `core/` — `Button`, `IconButton`, `Badge`, `Tag`, `Overline`, `Card`
- `forms/` — `Input`, `Switch`
- `data/` — `StatTile`

Namespace: `window.SookLabsDesignSystem_9aa38b` (reported by the compiler; also shown in any `*.card.html`).

Mount in a card / consuming page via the compiled bundle: `const { Button } = window.<Namespace>` (the namespace is reported by the compiler — see any `*.card.html`). Each component reads the CSS custom properties, so it inherits the brand automatically once `styles.css` is linked.

**`ui_kits/`** — full-screen product recreations
- `sooklabs-site/` — the SookLabs ecosystem homepage (dark control-room): hero with the logo-as-origin orbital field, operating rule, four-product ecosystem, why, philosophy, pillars, mantra, footer.
- `sookly/` — the Sookly omnichat + AI receptionist inbox (interactive 3-pane app: channel rail, conversation list, thread with AI-suggested replies and a composer).

**`SKILL.md`** — Agent-Skill manifest (download to use this system inside Claude Code).

**Foundation cards** live alongside the tokens and populate the Design System tab (groups: Brand, Colors, Type, Spacing, Components).

---

*Built carefully. Reduce the noise. Protect the focus. Build the system. Repeat with discipline.*
