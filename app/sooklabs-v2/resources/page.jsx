"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Space_Grotesk, DM_Sans, IBM_Plex_Mono } from "next/font/google";
import "../sooklabs-v2.css";
import "./resources.css";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ShareBar } from "@/components/site/ShareBar";
import { CopyEmbed } from "@/components/site/CopyEmbed";
import { LlmsTxtTool } from "@/components/resources/LlmsTxtTool";
import { GeoChecklistTool } from "@/components/resources/GeoChecklistTool";
import { FaqEmbedTool } from "@/components/resources/FaqEmbedTool";
import { CiteShareTool } from "@/components/resources/CiteShareTool";
import { CURATED_SHELF, RESOURCE_TOOLS, resourcesShareUrl } from "@/lib/resources";

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

function Container({ children, style }) {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px", ...style }}>
      {children}
    </div>
  );
}

function Overline({ children, style }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 9,
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        fontWeight: 500,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: "var(--accent-glow)",
        ...style,
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: 999,
          background: "var(--accent-glow)",
          boxShadow: "0 0 8px var(--accent-glow)",
        }}
      />
      {children}
    </span>
  );
}

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

function Header() {
  return (
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
      <Container
        style={{
          height: 68,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <img
            src={GLYPH}
            alt=""
            style={{ width: 30, height: 30, borderRadius: 8, objectFit: "cover" }}
          />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 19,
              letterSpacing: "-0.02em",
              color: "var(--text-primary)",
            }}
          >
            SookLabs
          </span>
        </Link>
        <Link
          href="/audit"
          className="sl-navlink"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--accent-glow)",
          }}
        >
          Free GEO audit
        </Link>
      </Container>
    </header>
  );
}

function Hero() {
  return (
    <section style={{ position: "relative", overflow: "hidden", padding: "88px 0 56px" }}>
      <div aria-hidden className="sl-grid-bg" />
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: -160,
          left: "50%",
          transform: "translateX(-50%)",
          width: 1000,
          height: 620,
          background: "radial-gradient(ellipse at center, var(--glow-blue-fill), transparent 68%)",
          pointerEvents: "none",
        }}
      />
      <Container style={{ position: "relative", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
          <Overline>Resources</Overline>
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "clamp(36px, 5.4vw, 62px)",
            lineHeight: 1.06,
            letterSpacing: "-0.035em",
            color: "var(--text-primary)",
            maxWidth: 880,
            margin: "0 auto",
            textWrap: "balance",
          }}
        >
          SookLabs
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "clamp(16px, 2vw, 19px)",
            lineHeight: 1.6,
            color: "var(--text-secondary)",
            maxWidth: 620,
            margin: "18px auto 0",
          }}
        >
          Free on-page tools for llms.txt, GEO readiness, FAQ paste embeds, and citations—plus a
          curated docs shelf. Honest badges only.
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 12,
            marginTop: 28,
            flexWrap: "wrap",
          }}
        >
          <a
            href="#llms-txt"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "14px 26px",
              borderRadius: 14,
              fontFamily: "var(--font-body)",
              fontSize: 15,
              fontWeight: 600,
              background: "var(--accent)",
              color: "#fff",
              textDecoration: "none",
            }}
          >
            Open llms.txt tool →
          </a>
          <a
            href="#shelf"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "14px 26px",
              borderRadius: 14,
              fontFamily: "var(--font-body)",
              fontSize: 15,
              fontWeight: 600,
              background: "var(--surface-card)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-default)",
              textDecoration: "none",
            }}
          >
            Curated shelf
          </a>
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 28 }}>
          <ShareBar
            url={resourcesShareUrl()}
            title="SookLabs Resources"
            text="Free tools for llms.txt, GEO checklists, FAQ embeds, and citations."
            compact
          />
        </div>
      </Container>
    </section>
  );
}

function JumpNav() {
  return (
    <Container style={{ paddingBottom: 28 }}>
      <nav
        aria-label="Resource tools"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          justifyContent: "center",
        }}
      >
        {RESOURCE_TOOLS.map((tool) => (
          <a
            key={tool.id}
            href={`#${tool.id}`}
            className="sl-navlink"
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid var(--border-subtle)",
              background: "var(--surface-card)",
              fontFamily: "var(--font-body)",
              fontSize: 13,
              color: "var(--text-secondary)",
              textDecoration: "none",
            }}
          >
            {tool.title}
          </a>
        ))}
      </nav>
    </Container>
  );
}

function Shelf() {
  return (
    <section id="shelf" style={{ padding: "48px 0 80px", scrollMarginTop: 88 }}>
      <Container>
        <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 36px" }}>
          <Overline style={{ marginBottom: 14 }}>Curated shelf</Overline>
          <h2
            style={{
              margin: 0,
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(26px, 3.6vw, 36px)",
              letterSpacing: "-0.03em",
              color: "var(--text-primary)",
            }}
          >
            Official docs worth linking
          </h2>
          <p
            style={{
              margin: "12px 0 0",
              fontFamily: "var(--font-body)",
              fontSize: 15,
              lineHeight: 1.55,
              color: "var(--text-secondary)",
            }}
          >
            Outbound references only—copy a link snippet or share. No iframe embeds.
          </p>
        </div>
        <div style={{ display: "grid", gap: 14 }}>
          {CURATED_SHELF.map((item) => {
            const markdown = `[${item.title}](${item.url})`;
            const html = `<a href="${item.url}">${item.title}</a>`;
            return (
              <div
                key={item.id}
                style={{
                  padding: 22,
                  borderRadius: 16,
                  border: "1px solid var(--border-subtle)",
                  background: "var(--surface-card)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    gap: 12,
                    marginBottom: 8,
                  }}
                >
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 600,
                      fontSize: 18,
                      color: "var(--text-primary)",
                      textDecoration: "none",
                    }}
                  >
                    {item.title} ↗
                  </a>
                  <ShareBar url={item.url} title={item.title} compact />
                </div>
                <p
                  style={{
                    margin: "0 0 14px",
                    fontFamily: "var(--font-body)",
                    fontSize: 14,
                    color: "var(--text-secondary)",
                    lineHeight: 1.5,
                  }}
                >
                  {item.description}
                </p>
                <CopyEmbed html={html} markdown={markdown} plain={`${item.title}\n${item.url}`} height={88} />
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

export default function ResourcesPage() {
  useRouteCanvas();

  return (
    <div
      className={`sl-v2-root ${spaceGrotesk.variable} ${dmSans.variable} ${ibmPlexMono.variable}`}
      style={{
        minHeight: "100vh",
        background: "var(--bg-page)",
        color: "var(--text-primary)",
        fontFamily: "var(--font-body)",
      }}
    >
      <Header />
      <Hero />
      <JumpNav />
      <Container style={{ display: "grid", gap: 22, paddingBottom: 24 }}>
        <LlmsTxtTool />
        <GeoChecklistTool />
        <FaqEmbedTool />
        <CiteShareTool />
      </Container>
      <Shelf />
      <SiteFooter />
    </div>
  );
}
