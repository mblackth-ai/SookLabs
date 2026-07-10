"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Space_Grotesk, DM_Sans, IBM_Plex_Mono } from "next/font/google";
import "@/app/sooklabs-v2/sooklabs-v2.css";
import { SiteFooter } from "@/components/site/SiteFooter";

const GLYPH = "/assets/sooklabs/sooklabs-glyph.png";

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

function useRouteCanvas() {
  useEffect(() => {
    const prevBody = document.body.style.backgroundColor;
    const prevHtml = document.documentElement.style.backgroundColor;
    document.body.style.backgroundColor = "#0b0e13";
    document.documentElement.style.backgroundColor = "#0b0e13";
    return () => {
      document.body.style.backgroundColor = prevBody;
      document.documentElement.style.backgroundColor = prevHtml;
    };
  }, []);
}

export function LegalPageShell({ title, lastUpdated, children }) {
  useRouteCanvas();

  return (
    <div
      className={`sl-v2-root ${spaceGrotesk.variable} ${dmSans.variable} ${ibmPlexMono.variable}`}
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <header
        style={{
          borderBottom: "1px solid var(--border-subtle)",
          background: "rgba(10,14,22,0.72)",
          backdropFilter: "blur(14px)",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px", height: 68, display: "flex", alignItems: "center" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <img src={GLYPH} alt="" style={{ width: 30, height: 30, borderRadius: 8, objectFit: "cover" }} />
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 19, color: "var(--text-primary)" }}>
              SookLabs
            </span>
          </Link>
        </div>
      </header>

      <main id="main-content" style={{ flex: 1, padding: "56px 0 72px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 32px" }}>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--text-faint)",
              marginBottom: 12,
            }}
          >
            Last updated: {lastUpdated}
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 4vw, 2.5rem)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: "var(--text-primary)",
              marginBottom: 28,
            }}
          >
            {title}
          </h1>
          <div className="sl-legal-prose">{children}</div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
