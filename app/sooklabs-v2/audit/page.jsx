"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Space_Grotesk, DM_Sans, IBM_Plex_Mono } from "next/font/google";
import "../sooklabs-v2.css";

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
          <img src={GLYPH} alt="" style={{ width: 30, height: 30, borderRadius: 8, objectFit: "cover" }} />
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
          href="#audit-form"
          className="sl-navlink"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--accent-glow)",
          }}
        >
          Get the audit
        </Link>
      </Container>
    </header>
  );
}

function Hero() {
  return (
    <section style={{ position: "relative", overflow: "hidden", padding: "96px 0 72px" }}>
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
          background:
            "radial-gradient(ellipse at center, var(--glow-blue-fill), transparent 68%)",
          pointerEvents: "none",
        }}
      />
      <Container style={{ position: "relative", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "6px 14px",
              borderRadius: 999,
              border: "1px solid var(--border-default)",
              background: "var(--surface-card)",
            }}
          >
            <Overline>Free GEO audit</Overline>
          </span>
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "clamp(38px, 5.6vw, 66px)",
            lineHeight: 1.06,
            letterSpacing: "-0.035em",
            color: "var(--text-primary)",
            maxWidth: 900,
            margin: "0 auto",
            textWrap: "balance",
          }}
        >
          The search bar is being replaced. Find out if your website survives the shift.
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "clamp(16px, 2vw, 20px)",
            lineHeight: 1.6,
            color: "var(--text-secondary)",
            maxWidth: 660,
            margin: "24px auto 0",
          }}
        >
          For twenty years, visibility meant ranking in a list of blue links. That era is ending.
          AI answer engines now decide who gets recommended — and most websites are invisible to
          them. Our free audit shows you exactly where you stand, and what to fix first.
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 12,
            marginTop: 36,
            flexWrap: "wrap",
          }}
        >
          <a
            href="#audit-form"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
              padding: "15px 28px",
              borderRadius: 14,
              fontFamily: "var(--font-body)",
              fontSize: 15,
              fontWeight: 600,
              background: "var(--accent)",
              color: "#fff",
              textDecoration: "none",
              boxShadow: "0 1px 2px rgba(0,0,0,.35)",
            }}
          >
            Get a free audit now →
          </a>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "15px 28px",
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
            Back to SookLabs
          </Link>
        </div>
      </Container>
    </section>
  );
}

function ShiftSection() {
  const stages = [
    {
      tag: "Yesterday",
      title: "Keywords → list of links",
      desc: "You optimised pages for a query, competed for position, and hoped for the click. Search rewarded matching words.",
    },
    {
      tag: "Now",
      title: "Context → a single answer",
      desc: "Gemini, ChatGPT, and Perplexity read the web, then hand the user one synthesised answer. There is no page two. Often there is no list at all.",
    },
    {
      tag: "The risk",
      title: "Recommended, or invisible",
      desc: "If the models cannot understand and trust your business, they recommend someone else. Traffic does not drop gradually — it is simply never offered.",
    },
  ];
  return (
    <section
      style={{
        padding: "80px 0",
        borderTop: "1px solid var(--border-subtle)",
        background: "var(--bg-section-alt)",
      }}
    >
      <Container>
        <div style={{ textAlign: "center", maxWidth: 660, margin: "0 auto 48px" }}>
          <Overline style={{ marginBottom: 16 }}>What changed</Overline>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(28px, 4vw, 42px)",
              lineHeight: 1.12,
              letterSpacing: "-0.03em",
              color: "var(--text-primary)",
            }}
          >
            From search engine optimisation to generative engine optimisation.
          </h2>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {stages.map((s) => (
            <div
              key={s.title}
              style={{
                padding: 28,
                borderRadius: 18,
                background: "var(--surface-card)",
                border: "1px solid var(--border-subtle)",
                boxShadow: "var(--inset-top)",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--accent-glow)",
                  marginBottom: 14,
                }}
              >
                {s.tag}
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 21,
                  letterSpacing: "-0.02em",
                  color: "var(--text-primary)",
                  marginBottom: 10,
                }}
              >
                {s.title}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 14.5,
                  lineHeight: 1.55,
                  color: "var(--text-muted)",
                }}
              >
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function AuditContents() {
  const items = [
    {
      t: "Generative visibility check",
      d: "We test how today's leading AI engines describe your business, your category, and your competitors — and whether you appear at all.",
    },
    {
      t: "Authority & trust signals",
      d: "How credible does your brand look to a model that is weighing who to recommend? We map the signals that build machine trust.",
    },
    {
      t: "Structured data readiness",
      d: "Whether your content is shaped so an answer engine can cleanly extract, attribute, and quote it back to a buyer.",
    },
    {
      t: "Content gap map",
      d: "Where your site answers a query versus where it merely mentions a keyword — and the highest-leverage gaps to close first.",
    },
    {
      t: "Competitor contrast",
      d: "Who the engines currently favour in your space, and the specific reasons they are being surfaced ahead of you.",
    },
    {
      t: "Prioritised action list",
      d: "A short, ranked set of fixes — no 90-page report. The few moves that move the needle, in order.",
    },
  ];
  return (
    <section style={{ padding: "80px 0" }}>
      <Container>
        <div style={{ textAlign: "center", maxWidth: 660, margin: "0 auto 48px" }}>
          <Overline style={{ marginBottom: 16 }}>What the audit covers</Overline>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(28px, 4vw, 42px)",
              lineHeight: 1.12,
              letterSpacing: "-0.03em",
              color: "var(--text-primary)",
            }}
          >
            A clear read on whether AI will recommend you.
          </h2>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 18,
              lineHeight: 1.6,
              color: "var(--text-secondary)",
              marginTop: 18,
            }}
          >
            Built for website-dependent companies that cannot afford to quietly disappear as
            buyers move from searching to asking.
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {items.map((it, i) => (
            <div
              key={it.t}
              style={{
                padding: 26,
                borderRadius: 16,
                background: "var(--surface-card)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: "var(--accent-glow)",
                  marginBottom: 12,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  fontSize: 18,
                  letterSpacing: "-0.02em",
                  color: "var(--text-primary)",
                  marginBottom: 8,
                }}
              >
                {it.t}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: "var(--text-muted)",
                }}
              >
                {it.d}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function WhyNow() {
  return (
    <section
      style={{
        padding: "80px 0",
        background: "var(--bg-section-alt)",
        borderTop: "1px solid var(--border-subtle)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <Container style={{ maxWidth: 820, textAlign: "center" }}>
        <Overline style={{ marginBottom: 18 }}>Why now</Overline>
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: "clamp(24px, 3.4vw, 36px)",
            lineHeight: 1.25,
            letterSpacing: "-0.02em",
            color: "var(--text-primary)",
          }}
        >
          The companies that adapt early will be the ones AI keeps recommending.
          The rest will spend 2026 wondering where their traffic went.
        </p>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 17,
            lineHeight: 1.65,
            color: "var(--text-secondary)",
            marginTop: 22,
          }}
        >
          This is the same discipline behind everything SookLabs builds: reduce the noise, find
          the few things that actually matter, and fix them with intent. The audit is where it
          starts.
        </p>
      </Container>
    </section>
  );
}

function AuditForm() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType: "audit",
          subject: "Free audit request",
          name: data.get("name"),
          email: data.get("email"),
          website: data.get("website"),
          context: data.get("context"),
        }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(
          body.error ||
            "Something went wrong. Email sooklabs.th@gmail.com directly."
        );
        return;
      }

      setSent(true);
      form.reset();
    } catch {
      setError("Network error. Email sooklabs.th@gmail.com directly.");
    } finally {
      setSubmitting(false);
    }
  };
  const field = {
    width: "100%",
    padding: "13px 15px",
    borderRadius: 12,
    background: "var(--surface)",
    border: "1px solid var(--border-default)",
    color: "var(--text-primary)",
    fontFamily: "var(--font-body)",
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box",
  };
  const labelStyle = {
    display: "block",
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "var(--text-faint)",
    marginBottom: 6,
  };
  return (
    <section id="audit-form" style={{ padding: "88px 0 104px" }}>
      <Container style={{ maxWidth: 560 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Overline style={{ marginBottom: 16 }}>Request your audit</Overline>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(26px, 3.6vw, 38px)",
              lineHeight: 1.14,
              letterSpacing: "-0.03em",
              color: "var(--text-primary)",
            }}
          >
            Get a free audit now.
          </h2>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 16,
              lineHeight: 1.6,
              color: "var(--text-secondary)",
              marginTop: 14,
            }}
          >
            Tell us where to look. We will send back a focused read on your generative
            visibility — no obligation.
          </p>
        </div>

        {sent ? (
          <div
            style={{
              padding: 32,
              borderRadius: 18,
              background: "var(--surface-card)",
              border: "1px solid var(--border-default)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 22,
                color: "var(--text-primary)",
                marginBottom: 8,
              }}
            >
              Request received.
            </div>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 15,
                color: "var(--text-muted)",
              }}
            >
              We will be in touch shortly with your audit details.
            </p>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            style={{
              display: "grid",
              gap: 14,
              padding: 28,
              borderRadius: 18,
              background: "var(--surface-card)",
              border: "1px solid var(--border-default)",
              boxShadow: "var(--inset-top)",
            }}
          >
            <label style={{ display: "block" }}>
              <span style={labelStyle}>Name</span>
              <input style={field} type="text" name="name" placeholder="Your name" required />
            </label>
            <label style={{ display: "block" }}>
              <span style={labelStyle}>Email</span>
              <input style={field} type="email" name="email" placeholder="Work email" required />
            </label>
            <label style={{ display: "block" }}>
              <span style={labelStyle}>Website</span>
              <input style={field} type="url" name="website" placeholder="Website URL" required />
            </label>
            <label style={{ display: "block" }}>
              <span style={labelStyle}>Context (optional)</span>
              <textarea
                style={{ ...field, minHeight: 90, resize: "vertical" }}
                name="context"
                placeholder="What does your business sell, and who are your main competitors?"
              />
            </label>
            <button
              type="submit"
              disabled={submitting}
              style={{
                marginTop: 4,
                padding: "14px 22px",
                borderRadius: 13,
                border: "1px solid transparent",
                background: "var(--accent)",
                color: "#fff",
                fontFamily: "var(--font-body)",
                fontSize: 15,
                fontWeight: 600,
                cursor: submitting ? "wait" : "pointer",
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? "Sending…" : "Get a free audit now →"}
            </button>
            {error && (
              <p
                role="alert"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 14,
                  color: "var(--danger-500, #ed6b8a)",
                  textAlign: "center",
                  marginTop: 4,
                }}
              >
                {error}{" "}
                <a href="mailto:sooklabs.th@gmail.com" style={{ color: "var(--accent-glow)" }}>
                  sooklabs.th@gmail.com
                </a>
              </p>
            )}
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.04em",
                color: "var(--text-faint)",
                textAlign: "center",
                marginTop: 4,
              }}
            >
              No spam. We only use this to prepare your audit.
            </p>
          </form>
        )}
      </Container>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border-subtle)", padding: "40px 0" }}>
      <Container
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src={GLYPH} alt="" style={{ width: 26, height: 26, borderRadius: 8, objectFit: "cover" }} />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 16,
              color: "var(--text-primary)",
            }}
          >
            SookLabs
          </span>
        </Link>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-faint)" }}>
          © 2026 SookLabs — Reduce · Protect · Build · Repeat
        </span>
      </Container>
    </footer>
  );
}

export default function AuditPage() {
  useRouteCanvas();
  return (
    <div
      className={`sl-v2-root ${spaceGrotesk.variable} ${dmSans.variable} ${ibmPlexMono.variable}`}
    >
      <Header />
      <Hero />
      <ShiftSection />
      <AuditContents />
      <WhyNow />
      <AuditForm />
      <Footer />
    </div>
  );
}
