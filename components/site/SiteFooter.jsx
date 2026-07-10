"use client";

import { CONTACT_EMAIL, ORG_SUMMARY, SOCIAL_PROFILES } from "@/lib/site";

const GLYPH = "/assets/sooklabs/sooklabs-glyph.png";

function SocialIcon({ id }) {
  const common = {
    width: 18,
    height: 18,
    fill: "currentColor",
    "aria-hidden": true,
  };
  if (id === "instagram") {
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm-5 3.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zm0 2a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM18 6.2a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z" />
      </svg>
    );
  }
  if (id === "facebook") {
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <path d="M13.5 22v-8.2h2.8l.4-3.3h-3.2V8.6c0-1 .3-1.7 1.7-1.7H17V4.1c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H7.8v3.3h2.5V22h3.2z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" {...common}>
      <path d="M16.5 3h-3.2l-.2 1.8c-.1.9-.5 1.7-1.5 1.7H9.8v3.2h1.6l-.1 9.5h4.1l.1-9.5h3.5l.3-3.2h-3.5V8.1c0-1 .2-1.6 1.6-1.6H17V3h-.5z" />
    </svg>
  );
}

function Container({ children, style }) {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px", ...style }}>{children}</div>
  );
}

export function SiteFooter() {
  const linkHref = {
    Sookly: "https://sookly.co",
    SEOS: "/audit",
    "Operating rule": "/#operating-rule",
    Philosophy: "/#philosophy",
    Pillars: "/#pillars",
    Contact: `mailto:${CONTACT_EMAIL}`,
    "Free GEO audit": "/audit",
    "Privacy Policy": "/privacy",
    "Terms of Service": "/terms",
  };
  const cols = [
    {
      h: "Ecosystem",
      links: ["Sookly", "SEOS", "RoastMyOpSec (TBA)", "Community (on hold)"],
    },
    { h: "Company", links: ["Operating rule", "Philosophy", "Pillars", "Contact"] },
    {
      h: "Resources",
      links: ["Free GEO audit", "Documentation (soon)", "Changelog (soon)"],
    },
    { h: "Legal", links: ["Privacy Policy", "Terms of Service"] },
  ];

  return (
    <footer style={{ borderTop: "1px solid var(--border-subtle)", padding: "56px 0 36px" }}>
      <Container>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1fr",
            gap: 40,
          }}
          className="sl-foot"
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 14 }}>
              <img src={GLYPH} alt="SookLabs" style={{ width: 28, height: 28, borderRadius: 8, objectFit: "cover" }} />
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 18,
                  color: "var(--text-primary)",
                }}
              >
                SookLabs
              </span>
            </div>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 13.5,
                lineHeight: 1.55,
                color: "var(--text-muted)",
                maxWidth: 260,
                marginBottom: 16,
              }}
            >
              {ORG_SUMMARY}
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }} aria-label="Social profiles">
              {SOCIAL_PROFILES.map((profile) => (
                <a
                  key={profile.id}
                  href={profile.url}
                  target="_blank"
                  rel="me noopener noreferrer"
                  aria-label={profile.label}
                  className="sl-navlink"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <SocialIcon id={profile.id} />
                </a>
              ))}
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.h}>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--text-faint)",
                  marginBottom: 16,
                }}
              >
                {c.h}
              </div>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 11 }}>
                {c.links.map((l) => {
                  const href = linkHref[l];
                  const isExternal = href?.startsWith("http") || href?.startsWith("mailto");
                  return (
                    <li key={l}>
                      {href ? (
                        <a
                          href={href}
                          className="sl-navlink"
                          {...(isExternal
                            ? {
                                target: href.startsWith("http") ? "_blank" : undefined,
                                rel: href.startsWith("http") ? "noopener noreferrer" : undefined,
                              }
                            : {})}
                          style={{
                            fontFamily: "var(--font-body)",
                            fontSize: 13.5,
                            color: "var(--text-secondary)",
                          }}
                        >
                          {l}
                        </a>
                      ) : (
                        <span style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-faint)" }}>
                          {l}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        <div
          style={{
            borderTop: "1px solid var(--border-subtle)",
            marginTop: 40,
            paddingTop: 22,
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-faint)" }}>
            © 2026 SookLabs — Compress the diamond.
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-faint)" }}>
            Reduce · Protect · Build · Repeat
          </span>
        </div>
      </Container>
    </footer>
  );
}
