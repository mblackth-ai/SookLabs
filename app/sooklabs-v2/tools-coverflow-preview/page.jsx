"use client";

import Link from "next/link";
import { Space_Grotesk, DM_Sans, IBM_Plex_Mono } from "next/font/google";
import "../sooklabs-v2.css";
import { ToolsNavDropdown, ToolsNavAccordion } from "@/components/nav/ToolsNav";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--sl-font-display",
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--sl-font-body",
  weight: ["400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--sl-font-mono",
  weight: ["400", "500", "600"],
});

export default function ToolsCoverflowPreviewPage() {
  return (
    <main
      className={`sl-v2-root ${spaceGrotesk.variable} ${dmSans.variable} ${ibmPlexMono.variable}`}
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(52,207,234,0.08), transparent 55%), #0a0e16",
        color: "var(--text-primary)",
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(10,14,22,0.72)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            height: 68,
            padding: "0 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 18,
                letterSpacing: "-0.02em",
              }}
            >
              SookLabs
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--cyan-300, #34cfea)",
                border: "1px solid rgba(52,207,234,0.35)",
                borderRadius: 999,
                padding: "3px 8px",
              }}
            >
              Cover-flow preview
            </span>
          </div>

          <nav
            className="sl-desk"
            style={{ display: "flex", alignItems: "center", gap: 28 }}
          >
            <span className="sl-navlink" style={{ color: "var(--text-muted)", fontSize: 14 }}>
              Ecosystem
            </span>
            <span className="sl-navlink" style={{ color: "var(--text-muted)", fontSize: 14 }}>
              Philosophy
            </span>
            <ToolsNavDropdown variant="coverflow" />
          </nav>

          <Link
            href="/sooklabs-v2"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 13,
              color: "var(--text-secondary)",
              textDecoration: "none",
            }}
          >
            ← Live page (grid)
          </Link>
        </div>
      </header>

      <section
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "56px 28px 80px",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--cyan-300, #34cfea)",
            marginBottom: 12,
          }}
        >
          Local preview only — not deployed
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(28px, 4vw, 40px)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            margin: "0 0 14px",
          }}
        >
          Tools cover-flow carousel
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 16,
            lineHeight: 1.6,
            color: "var(--text-secondary)",
            margin: "0 0 28px",
            maxWidth: 540,
          }}
        >
          Hover or click <strong style={{ color: "var(--text-primary)" }}>Tools</strong> in the
          nav above. Production still uses the grid until you approve this.
        </p>

        <ul
          style={{
            margin: "0 0 40px",
            padding: "18px 20px",
            listStyle: "none",
            borderRadius: 14,
            border: "1px solid var(--border-subtle)",
            background: "rgba(255,255,255,0.02)",
            display: "grid",
            gap: 10,
            fontFamily: "var(--font-body)",
            fontSize: 14,
            color: "var(--text-secondary)",
            lineHeight: 1.5,
          }}
        >
          <li>Desktop: wheel / trackpad scrolls the cylinder; drag either way; snap to centre.</li>
          <li>Active card scales up with cyan glow; neighbours fade and tilt inward.</li>
          <li>Click neighbour to centre it; click the centred live card to open the tool.</li>
          <li>Mobile: open the accordion below and swipe with momentum.</li>
          <li>Infinite loop both directions; respects prefers-reduced-motion.</li>
        </ul>

        <div
          style={{
            borderRadius: 14,
            border: "1px solid var(--border-subtle)",
            background: "rgba(10,14,22,0.85)",
            padding: 18,
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              margin: "0 0 12px",
            }}
          >
            Mobile Tools accordion
          </p>
          <ToolsNavAccordion variant="coverflow" />
        </div>
      </section>
    </main>
  );
}
