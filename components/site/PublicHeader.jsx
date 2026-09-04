"use client";

import Link from "next/link";

const GLYPH = "/assets/sooklabs/sooklabs-glyph.png";

export function PublicHeader({ current = "" }) {
  const links = [
    { href: "/blog", label: "Blog", id: "blog" },
    { href: "/resources", label: "Resources", id: "resources" },
    { href: "/audit", label: "Free GEO audit", id: "audit" },
  ];

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
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 32px",
          height: 68,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
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
        <nav aria-label="Section" style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          {links.map((link) => {
            const active = current === link.id;
            return (
              <Link
                key={link.id}
                href={link.href}
                className="sl-navlink"
                aria-current={active ? "page" : undefined}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: active ? "var(--accent-glow)" : "var(--text-muted)",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
