"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Space_Grotesk, DM_Sans, IBM_Plex_Mono } from "next/font/google";
import "./sooklabs-v2.css";

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

const GLYPH = "/assets/sooklabs/sooklabs-glyph.png";
const LOGO = "/assets/sooklabs/sooklabs-logo.png";

function Icon({ d, size = 20, stroke = 1.75, children, viewBox = "0 0 24 24", style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      {children || <path d={d} />}
    </svg>
  );
}

const Icons = {
  Sookly: (p) => (
    <Icon {...p}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </Icon>
  ),
  Seos: (p) => (
    <Icon {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2a10 10 0 0 1 10 10" />
      <path d="M12 6a6 6 0 0 1 6 6" />
      <path d="M2 12a10 10 0 0 0 10 10" />
    </Icon>
  ),
  Roast: (p) => (
    <Icon {...p}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </Icon>
  ),
  Community: (p) => (
    <Icon {...p}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </Icon>
  ),
  Arrow: (p) => <Icon {...p} d="M5 12h14M13 6l6 6-6 6" />,
  Menu: (p) => <Icon {...p} d="M3 6h18M3 12h18M3 18h18" />,
  Close: (p) => <Icon {...p} d="M18 6 6 18M6 6l12 12" />,
  Inbox: (p) => (
    <Icon {...p}>
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </Icon>
  ),
  Workflow: (p) => (
    <Icon {...p}>
      <rect x="3" y="3" width="6" height="6" rx="1" />
      <rect x="15" y="15" width="6" height="6" rx="1" />
      <path d="M6 9v3a3 3 0 0 0 3 3h6" />
    </Icon>
  ),
  Clock: (p) => (
    <Icon {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Icon>
  ),
  Layers: (p) => (
    <Icon {...p}>
      <path d="m12 2 9 5-9 5-9-5 9-5z" />
      <path d="m3 12 9 5 9-5" />
      <path d="m3 17 9 5 9-5" />
    </Icon>
  ),
  Brain: (p) => (
    <Icon {...p}>
      <path d="M12 5a3 3 0 0 0-5.9-.6 3 3 0 0 0-1.9 5A2.5 2.5 0 0 0 4 14a3 3 0 0 0 4 2.8A2.5 2.5 0 0 0 12 19zM12 5a3 3 0 0 1 5.9-.6 3 3 0 0 1 1.9 5A2.5 2.5 0 0 1 20 14a3 3 0 0 1-4 2.8A2.5 2.5 0 0 1 12 19z" />
    </Icon>
  ),
  Trend: (p) => (
    <Icon {...p}>
      <path d="M22 7 13.5 15.5l-5-5L2 17" />
      <path d="M16 7h6v6" />
    </Icon>
  ),
};

function Overline({ children, dot, tone = "muted", style }) {
  const c =
    { muted: "var(--text-muted)", accent: "var(--accent-glow)" }[tone] ||
    "var(--text-muted)";
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
        color: c,
        ...style,
      }}
    >
      {dot && (
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: 999,
            background: "var(--accent-glow)",
            boxShadow: "0 0 8px var(--accent-glow)",
          }}
        />
      )}
      {children}
    </span>
  );
}

function Button({
  children,
  variant = "primary",
  size = "md",
  iconRight,
  iconLeft,
  onClick,
  href,
  style,
}) {
  const [h, setH] = useState(false);
  const [a, setA] = useState(false);
  const S = { sm: { p: "9px 16px", f: 13, r: 11 }, md: { p: "12px 22px", f: 14, r: 13 }, lg: { p: "15px 28px", f: 15, r: 14 } }[size];
  const V = {
    primary: {
      background: h ? "var(--accent-hover)" : "var(--accent)",
      color: "#fff",
      boxShadow: h
        ? "0 0 0 1px var(--border-accent), 0 10px 30px rgba(47,124,240,0.32)"
        : "0 1px 2px rgba(0,0,0,.35)",
      border: "1px solid transparent",
    },
    secondary: {
      background: h ? "var(--surface-hover)" : "var(--surface-card)",
      color: "var(--text-primary)",
      border: "1px solid var(--border-default)",
      boxShadow: "var(--inset-top)",
    },
    ghost: {
      background: h ? "rgba(174,187,206,.06)" : "transparent",
      color: h ? "var(--text-primary)" : "var(--text-secondary)",
      border: "1px solid transparent",
    },
  }[variant];
  const sharedStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    padding: S.p,
    fontFamily: "var(--font-body)",
    fontSize: S.f,
    fontWeight: 600,
    borderRadius: S.r,
    cursor: "pointer",
    whiteSpace: "nowrap",
    outline: "none",
    textDecoration: "none",
    transform: a ? "scale(0.98)" : "scale(1)",
    transition:
      "background .2s var(--ease-out), box-shadow .2s var(--ease-out), color .2s var(--ease-out), transform .14s var(--ease-out)",
    ...V,
    ...style,
  };
  const handlers = {
    onMouseEnter: () => setH(true),
    onMouseLeave: () => {
      setH(false);
      setA(false);
    },
    onMouseDown: () => setA(true),
    onMouseUp: () => setA(false),
  };
  if (href) {
    return (
      <Link href={href} onClick={onClick} style={sharedStyle} {...handlers}>
        {iconLeft}
        {children}
        {iconRight}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} style={sharedStyle} {...handlers}>
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}

function Card({
  children,
  appearance = "solid",
  glow,
  hover,
  padding = 24,
  radius = "var(--radius-xl)",
  style,
}) {
  const [h, setH] = useState(false);
  const A = {
    glass: {
      background: "var(--glass-bg)",
      backdropFilter: "blur(var(--blur-md))",
      WebkitBackdropFilter: "blur(var(--blur-md))",
      border: "1px solid var(--glass-border)",
    },
    solid: {
      background: "var(--surface-card)",
      border: "1px solid var(--border-default)",
    },
    outline: {
      background: "transparent",
      border: "1px solid var(--border-default)",
    },
  }[appearance];
  const lift = hover && h;
  return (
    <div
      onMouseEnter={() => hover && setH(true)}
      onMouseLeave={() => hover && setH(false)}
      style={{
        position: "relative",
        padding,
        borderRadius: radius,
        boxShadow: lift
          ? "var(--shadow-lg), var(--inset-top)"
          : "var(--shadow-md), var(--inset-top)",
        borderColor: lift ? "var(--border-strong)" : undefined,
        transform: lift ? "translateY(-3px)" : "none",
        transition:
          "box-shadow .25s var(--ease-out), border-color .25s var(--ease-out), transform .25s var(--ease-out)",
        ...A,
        ...style,
      }}
    >
      {glow && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: radius,
            pointerEvents: "none",
            background:
              "radial-gradient(120% 80% at 50% -10%, var(--glow-blue), transparent 60%)",
            opacity: 0.7,
          }}
        />
      )}
      <div style={{ position: "relative" }}>{children}</div>
    </div>
  );
}

function Badge({ children, tone = "neutral", dot, mono, style }) {
  const T = {
    neutral: ["var(--silver-300)", "rgba(174,187,206,.10)", "var(--silver-400)"],
    blue: ["var(--blue-300)", "rgba(47,124,240,.14)", "var(--blue-400)"],
    cyan: ["var(--cyan-300)", "rgba(52,207,234,.13)", "var(--cyan-400)"],
    violet: ["var(--violet-300)", "rgba(124,99,238,.15)", "var(--violet-400)"],
    success: ["var(--success-400)", "rgba(33,184,132,.14)", "var(--success-400)"],
  }[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 11px",
        borderRadius: 999,
        fontFamily: mono ? "var(--font-mono)" : "var(--font-body)",
        fontSize: mono ? 11 : 12,
        fontWeight: mono ? 500 : 600,
        letterSpacing: mono ? "0.10em" : 0,
        textTransform: mono ? "uppercase" : "none",
        color: T[0],
        background: T[1],
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: 999,
            background: T[2],
          }}
        />
      )}
      {children}
    </span>
  );
}

function Container({ children, style }) {
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", ...style }}>
      {children}
    </div>
  );
}

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduce(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return reduce;
}

function useHeroPinProgress(pinRef, reduce) {
  const [p, setP] = useState(0);
  useEffect(() => {
    if (reduce) {
      setP(0);
      return;
    }
    let raf = 0;
    const read = () => {
      raf = 0;
      const el = pinRef.current;
      if (!el) return;
      const pinTravel = el.offsetHeight - window.innerHeight;
      if (pinTravel <= 0) {
        setP(0);
        return;
      }
      const scrolled = -el.getBoundingClientRect().top;
      setP(Math.max(0, Math.min(1, scrolled / pinTravel)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    read();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pinRef, reduce]);
  return p;
}

/** Viewport heights of scroll consumed while hero is pinned (animation plays). */
const HERO_PIN_SCROLL_VH = 3.6;
const HERO_PIN_SCROLL_MOBILE_VH = 2.6;

const smooth = (t) => t * t * (3 - 2 * t);
const clamp01 = (v) => Math.max(0, Math.min(1, v));

const TOKEN_RADIUS = { large: 250, medLarge: 215, med: 170, smallMed: 120 };

const WORD_TOKENS = [
  {
    key: "Sookly",
    label: "Sookly",
    sub: "Omnichat",
    kind: "product",
    accent: "cyan",
    weight: "high",
    angle: 35,
    radius: TOKEN_RADIUS.large,
    start: 0.28,
    end: 0.46,
  },
  {
    key: "SEOS",
    label: "SEOS",
    sub: "Search Expansion",
    kind: "product",
    accent: "blue",
    weight: "med-high",
    angle: 145,
    radius: TOKEN_RADIUS.medLarge,
    start: 0.31,
    end: 0.49,
  },
  {
    key: "RoastMyOpSec",
    label: "RoastMyOpSec",
    sub: "Security Audit",
    kind: "product",
    accent: "violet",
    weight: "med-high",
    angle: 320,
    radius: TOKEN_RADIUS.medLarge,
    start: 0.34,
    end: 0.52,
  },
  {
    key: "Automation",
    label: "Automation",
    kind: "support",
    accent: "silver",
    weight: "medium",
    angle: 205,
    radius: TOKEN_RADIUS.med,
    start: 0.2,
    end: 0.36,
  },
  {
    key: "AI",
    label: "AI Consultancy",
    kind: "support",
    accent: "silver",
    weight: "low-medium",
    angle: 80,
    radius: TOKEN_RADIUS.smallMed,
    start: 0.16,
    end: 0.32,
  },
  {
    key: "Systems",
    label: "Systems",
    kind: "support",
    accent: "silver",
    weight: "medium",
    angle: 240,
    radius: TOKEN_RADIUS.med,
    start: 0.18,
    end: 0.34,
  },
];

const MOBILE_TOKEN_SLOTS = {
  AI: { x: 0, y: -118 },
  Sookly: { x: 0, y: -62 },
  Systems: { x: 0, y: -8 },
  SEOS: { x: -52, y: 52 },
  Automation: { x: 52, y: 52 },
  RoastMyOpSec: { x: 0, y: 108 },
};

function desktopTokenXY(angleDeg, radius) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: radius * Math.cos(rad) * 1.25,
    y: -radius * Math.sin(rad) * 0.8,
  };
}

function useMobileConstellation() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 560px)");
    const on = () => setMobile(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return mobile;
}

function LogoOrbitMark({ size = 92, scale = 1, glowOpacity = 0.35, animate = true }) {
  const arcSize = size + 18;

  return (
    <div
      className="sl-logo-orbit-mark"
      style={{
        position: "relative",
        zIndex: 2,
        width: arcSize,
        height: arcSize,
        display: "grid",
        placeItems: "center",
        transform: `scale(${scale})`,
        willChange: "transform",
      }}
    >
      {animate && (
        <div
          className="sl-logo-orbit"
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background:
              "conic-gradient(from 0deg, transparent 0 68%, var(--cyan-400) 84%, var(--cyan-300) 90%, transparent 100%)",
            WebkitMask:
              "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
            mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
            opacity: 0.85,
          }}
        />
      )}
      <div
        style={{
          position: "relative",
          width: size,
          height: size,
          borderRadius: "50%",
          overflow: "hidden",
          boxShadow: `0 0 0 1px var(--border-strong), var(--shadow-lg), 0 0 ${40 + glowOpacity * 60}px rgba(52,207,234,${glowOpacity})`,
        }}
      >
        <img
          src={LOGO}
          alt="SookLabs"
          width={size}
          height={size}
          style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    </div>
  );
}

function HeroWordToken({ token, lp, tx, ty, reduce }) {
  const isProduct = token.kind === "product";
  const opacity = reduce ? 1 : lp;
  const scale = reduce ? 1 : 0.6 + 0.4 * lp;
  const blurPx = reduce ? 0 : 8 * (1 - lp);
  const accentClass = isProduct ? `sl-token-product sl-token-${token.accent}` : "sl-token-support";
  const weightClass =
    token.weight === "high"
      ? "sl-token-weight-high"
      : token.weight === "med-high"
        ? "sl-token-weight-med-high"
        : token.weight === "low-medium"
          ? "sl-token-weight-low"
          : "sl-token-weight-medium";

  return (
    <span
      className={`sl-hero-token ${accentClass} ${weightClass}`}
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(${scale})`,
        opacity,
        filter: blurPx > 0.1 ? `blur(${blurPx}px)` : "none",
        willChange: "transform, opacity, filter",
        pointerEvents: isProduct ? "auto" : "none",
      }}
    >
      <span className="sl-hero-token-label">{token.label}</span>
      {token.sub && <span className="sl-hero-token-sub">{token.sub}</span>}
    </span>
  );
}

function HeroScrollScene({ p = 0, reduce = false }) {
  const mobile = useMobileConstellation();
  const a = smooth(clamp01(p / 0.16));
  const b = smooth(clamp01((p - 0.06) / 0.24));
  const c = smooth(clamp01((p - 0.16) / 0.34));
  const glyphScale = 1 - a * 0.8;
  const restOpacity = 1 - a;
  const dotGlow = 0.32 + a * 0.42 + Math.sin(b * Math.PI) * 0.3;
  const rings = [0, 1, 2].map((i) => {
    const local = clamp01(b * 1.25 - i * 0.2);
    return { scale: 0.18 + local * 2.4, opacity: Math.sin(local * Math.PI) * 0.42 };
  });
  const releaseRing = clamp01((c - 0.05) / 0.35);
  const partR = b * 190;
  const partOpacity = Math.sin(b * Math.PI) * (1 - c * 0.85);
  const sceneW = mobile ? 320 : 680;
  const sceneH = mobile ? 360 : 480;

  const ring = (w, extra) => ({
    position: "absolute",
    width: w,
    height: w,
    borderRadius: "50%",
    ...extra,
  });

  return (
    <div
      className="sl-hero-scene"
      style={{
        position: "relative",
        width: sceneW,
        height: sceneH,
        maxWidth: "92vw",
        margin: "0 auto",
      }}
      aria-label="SookLabs origin and ecosystem tokens"
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 320,
          height: 320,
          transform: "translate(-50%, -50%)",
          display: "grid",
          placeItems: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            opacity: restOpacity,
            transition: "opacity .1s linear",
          }}
        >
          <div style={ring(320, { border: "1px solid var(--border-subtle)" })} />
          <div style={ring(224, { border: "1px solid var(--border-default)" })} />
          <div
            className="sl-spin"
            style={ring(224, {
              border: "1px solid transparent",
              borderTopColor: "rgba(52,207,234,0.5)",
              borderRightColor: "rgba(47,124,240,0.25)",
            })}
          />
          <div style={ring(130, { border: "1px solid var(--border-default)" })} />
          <div className="sl-spin-slow" style={{ position: "absolute", width: 320, height: 320 }}>
            <span
              style={{
                position: "absolute",
                top: -4,
                left: "50%",
                width: 8,
                height: 8,
                borderRadius: 999,
                background: "var(--cyan-400)",
                boxShadow: "0 0 12px var(--cyan-400)",
              }}
            />
            <span
              style={{
                position: "absolute",
                bottom: 28,
                right: 30,
                width: 6,
                height: 6,
                borderRadius: 999,
                background: "var(--violet-400)",
                boxShadow: "0 0 10px var(--violet-400)",
              }}
            />
          </div>
        </div>
        {rings.map((r, i) => (
          <div
            key={i}
            style={ring(220, {
              border: "1px solid rgba(52,207,234,0.55)",
              transform: `scale(${r.scale})`,
              opacity: r.opacity,
              willChange: "transform, opacity",
            })}
          />
        ))}
        <div
          style={ring(240, {
            border: "1px solid rgba(79,225,236,0.35)",
            transform: `scale(${0.2 + releaseRing * 2.2})`,
            opacity: Math.sin(releaseRing * Math.PI) * 0.35,
            willChange: "transform, opacity",
          })}
        />
        {Array.from({ length: 9 }, (_, i) => {
          const ang = (i / 9) * Math.PI * 2 + 0.4;
          const pt = {
            x: Math.cos(ang),
            y: Math.sin(ang),
            s: 0.62 + (i % 4) * 0.12,
            c: i % 3 === 0 ? "var(--violet-400)" : "var(--cyan-400)",
          };
          return (
            <span
              key={i}
              style={{
                position: "absolute",
                width: 4 * pt.s + 2,
                height: 4 * pt.s + 2,
                borderRadius: 999,
                background: pt.c,
                boxShadow: `0 0 8px ${pt.c}`,
                transform: `translate(${pt.x * partR}px, ${pt.y * partR}px)`,
                opacity: partOpacity * pt.s,
                willChange: "transform, opacity",
              }}
            />
          );
        })}
        <div
          style={ring(220, {
            background: "radial-gradient(circle, var(--glow-cyan-fill), transparent 65%)",
            opacity: 0.5 + a * 0.5,
          })}
        />
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "grid",
            placeItems: "center",
          }}
        >
          <LogoOrbitMark
            size={92}
            scale={glyphScale}
            glowOpacity={dotGlow}
            animate={!reduce && c < 0.15}
          />
        </div>
      </div>

      <div
        className="sl-hero-token-field"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
        }}
      >
        {WORD_TOKENS.map((token) => {
          const { x, y } = mobile
            ? MOBILE_TOKEN_SLOTS[token.key]
            : desktopTokenXY(token.angle, token.radius);
          const lp = reduce
            ? 1
            : smooth(clamp01((p - token.start) / (token.end - token.start)));
          const tx = x * lp;
          const ty = y * lp;
          return (
            <HeroWordToken
              key={token.key}
              token={token}
              lp={lp}
              tx={tx}
              ty={ty}
              reduce={reduce}
            />
          );
        })}
      </div>
    </div>
  );
}

function useReveal() {
  const ref = useRef(null);
  const [prog, setProg] = useState(0);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setProg(1);
      return;
    }
    const el = ref.current;
    if (!el) {
      setProg(1);
      return;
    }
    const DUR = 560;
    let started = false;
    let rafId = 0;
    let startT = 0;
    let scrollRaf = 0;
    let fallback = 0;
    let hard = 0;
    const tick = (now) => {
      if (!startT) startT = now;
      const t = Math.min(1, (now - startT) / DUR);
      setProg(t < 1 ? 0.001 + t * 0.999 : 1);
      if (t < 1) rafId = requestAnimationFrame(tick);
    };
    const start = () => {
      if (started) return;
      started = true;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      clearTimeout(hard);
      fallback = setTimeout(() => {
        if (rafId) cancelAnimationFrame(rafId);
        setProg(1);
      }, DUR + 200);
      rafId = requestAnimationFrame(tick);
    };
    const inView = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      return r.top < vh * 0.92 && r.bottom > 0;
    };
    const onScroll = () => {
      if (!scrollRaf)
        scrollRaf = requestAnimationFrame(() => {
          scrollRaf = 0;
          if (inView()) start();
        });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    if (inView()) start();
    hard = setTimeout(start, 900);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      clearTimeout(fallback);
      clearTimeout(hard);
    };
  }, []);
  return [ref, prog];
}

function Reveal({ children }) {
  const [ref, prog] = useReveal();
  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        opacity: prog,
        transform: prog >= 1 ? "none" : `translateY(${(1 - prog) * 16}px)`,
        willChange: "transform, opacity",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const links = [
    { label: "Ecosystem", href: "#ecosystem" },
    { label: "Philosophy", href: "#philosophy" },
    { label: "Pillars", href: "#pillars" },
    { label: "Community", href: "#community" },
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
      <Container
        style={{
          height: 68,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <a href="#" style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <img src={GLYPH} alt="" style={{ width: 30, height: 30, borderRadius: 8 }} />
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
        </a>
        <nav
          style={{ display: "flex", alignItems: "center", gap: 30 }}
          className="sl-desk"
        >
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="sl-navlink"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 14,
                fontWeight: 500,
                color: "var(--text-muted)",
              }}
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="sl-desk" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Button variant="ghost" size="sm">
            Sign in
          </Button>
          <Button variant="primary" size="sm" iconRight={<Icons.Arrow size={15} />}>
            Explore Sookly
          </Button>
        </div>
        <button
          type="button"
          className="sl-mob"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
          style={{
            background: "none",
            border: "none",
            color: "var(--text-secondary)",
            cursor: "pointer",
            padding: 6,
          }}
        >
          {open ? <Icons.Close /> : <Icons.Menu />}
        </button>
      </Container>
      {open && (
        <div
          className="sl-mob"
          style={{
            borderTop: "1px solid var(--border-subtle)",
            padding: "16px 32px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{ color: "var(--text-secondary)", fontSize: 15 }}
            >
              {l.label}
            </a>
          ))}
          <Button variant="primary" size="sm">
            Explore Sookly
          </Button>
        </div>
      )}
    </header>
  );
}

function Hero() {
  const reduce = usePrefersReducedMotion();
  const mobile = useMobileConstellation();
  const pinRef = useRef(null);
  const p = useHeroPinProgress(pinRef, reduce);
  const pinScrollVh = mobile ? HERO_PIN_SCROLL_MOBILE_VH : HERO_PIN_SCROLL_VH;

  return (
    <section
      ref={pinRef}
      className="sl-hero-pin"
      style={
        reduce
          ? { position: "relative", overflow: "hidden" }
          : { height: `${(1 + pinScrollVh) * 100}vh` }
      }
    >
      <div
        className="sl-hero-sticky"
        style={{
          position: reduce ? "relative" : "sticky",
          top: reduce ? undefined : 68,
          minHeight: reduce ? undefined : "calc(100vh - 68px)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: reduce ? "64px 0 96px" : "48px 0",
        }}
      >
      <div aria-hidden className="sl-grid-bg" />
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: -120,
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
        <div className="sl-fade" style={{ display: "flex", justifyContent: "center", marginBottom: 40 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
              padding: "6px 14px",
              borderRadius: 999,
              border: "1px solid var(--border-default)",
              background: "var(--surface-card)",
            }}
          >
            <Overline dot tone="accent">
              SookLabs — quiet infrastructure
            </Overline>
          </span>
        </div>
        <div className="sl-fade sl-d1">
          <HeroScrollScene p={p} reduce={reduce} />
        </div>
        <h1
          className="sl-fade sl-d2"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "clamp(40px, 6vw, 72px)",
            lineHeight: 1.05,
            letterSpacing: "-0.035em",
            color: "var(--text-primary)",
            maxWidth: 880,
            margin: "36px auto 0",
            textWrap: "balance",
          }}
        >
          Systems that turn repetition into infrastructure.
        </h1>
        <p
          className="sl-fade sl-d3"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "clamp(16px, 2vw, 20px)",
            lineHeight: 1.6,
            color: "var(--text-secondary)",
            maxWidth: 620,
            margin: "24px auto 0",
          }}
        >
          SookLabs builds calm digital systems for businesses, operators, and builders who need
          fewer interruptions, clearer workflows, and more time to focus.
        </p>
        <div
          className="sl-fade sl-d4"
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 12,
            marginTop: 36,
            flexWrap: "wrap",
          }}
        >
          <Button variant="primary" size="lg" iconRight={<Icons.Arrow size={18} />}>
            Explore the ecosystem
          </Button>
          <Button variant="secondary" size="lg">
            Read the operating rule
          </Button>
        </div>
      </Container>
      </div>
    </section>
  );
}

function SectionHead({ eyebrow, title, sub, align = "center", max = 640 }) {
  return (
    <div
      style={{
        textAlign: align,
        marginBottom: 56,
        maxWidth: align === "center" ? max : "none",
        marginLeft: align === "center" ? "auto" : 0,
        marginRight: align === "center" ? "auto" : 0,
      }}
    >
      <Overline dot tone="accent" style={{ marginBottom: 18 }}>
        {eyebrow}
      </Overline>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "clamp(30px, 4vw, 44px)",
          lineHeight: 1.1,
          letterSpacing: "-0.03em",
          color: "var(--text-primary)",
          textWrap: "balance",
        }}
      >
        {title}
      </h2>
      {sub && (
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 18,
            lineHeight: 1.6,
            color: "var(--text-secondary)",
            marginTop: 18,
            maxWidth: max,
            marginInline: align === "center" ? "auto" : 0,
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

function OperatingRule() {
  return (
    <section
      style={{
        padding: "96px 0",
        borderTop: "1px solid var(--border-subtle)",
        background: "var(--bg-section-alt)",
      }}
    >
      <Container>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 0.9fr)",
            gap: 56,
            alignItems: "center",
          }}
          className="sl-2col"
        >
          <div>
            <Overline dot tone="accent" style={{ marginBottom: 20 }}>
              The operating rule
            </Overline>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "clamp(26px, 3.4vw, 38px)",
                lineHeight: 1.22,
                letterSpacing: "-0.02em",
                color: "var(--text-primary)",
              }}
            >
              If it does not reduce{" "}
              <span style={{ color: "var(--accent-glow)" }}>repetition</span>,{" "}
              <span style={{ color: "var(--accent-glow)" }}>interruptions</span>,{" "}
              <span style={{ color: "var(--accent-glow)" }}>cognitive load</span>, or{" "}
              <span style={{ color: "var(--accent-glow)" }}>waiting time</span> — it does not
              belong in SookLabs.
            </p>
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            {[
              {
                icon: <Icons.Workflow size={18} />,
                t: "Repetition",
                d: "Turned into infrastructure, not redone by hand.",
              },
              {
                icon: <Icons.Inbox size={18} />,
                t: "Interruptions",
                d: "Captured, routed, and quieted into one place.",
              },
              {
                icon: <Icons.Brain size={18} />,
                t: "Cognitive load",
                d: "Removed through clear systems and defaults.",
              },
              {
                icon: <Icons.Clock size={18} />,
                t: "Waiting time",
                d: "Compressed — answers arrive before the ask.",
              },
            ].map((r) => (
              <div
                key={r.t}
                style={{
                  display: "flex",
                  gap: 14,
                  alignItems: "flex-start",
                  padding: "14px 16px",
                  borderRadius: 14,
                  background: "var(--surface-card)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <span
                  style={{
                    display: "grid",
                    placeItems: "center",
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: "rgba(52,207,234,0.10)",
                    color: "var(--accent-glow)",
                    flex: "none",
                  }}
                >
                  {r.icon}
                </span>
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 600,
                      fontSize: 15,
                      color: "var(--text-primary)",
                    }}
                  >
                    {r.t}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: 13.5,
                      color: "var(--text-muted)",
                      marginTop: 2,
                    }}
                  >
                    {r.d}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

const PRODUCTS = [
  {
    key: "Sookly",
    icon: Icons.Sookly,
    tone: "cyan",
    status: "Live",
    tag: "Omnichat · AI receptionist",
    desc: "Handles enquiries, routes messages, reduces missed leads, and gives teams one calm inbox.",
  },
  {
    key: "SEOS",
    icon: Icons.Seos,
    tone: "blue",
    status: "In progress",
    tag: "Search Expansion OS",
    desc: "SEO diagnostics, website audits, content systems, and growth operations — measurable visibility.",
  },
  {
    key: "RoastMyOpSec",
    icon: Icons.Roast,
    tone: "violet",
    status: "To be announced",
    tag: "Security auditor",
    desc: "Plain-English exposure checks for founders and small teams. Know what is leaking, first.",
  },
  {
    key: "SookLabs Community",
    icon: Icons.Community,
    tone: "neutral",
    status: "To be announced",
    tag: "Builder community",
    desc: "A focused community around technology, psychology, and investment. Sharper thinking, long-term leverage.",
  },
];

function Ecosystem() {
  const accent = {
    cyan: "var(--cyan-400)",
    blue: "var(--blue-400)",
    violet: "var(--violet-400)",
    neutral: "var(--silver-300)",
  };
  const glow = {
    cyan: "var(--tint-cyan)",
    blue: "var(--tint-blue)",
    violet: "var(--tint-violet)",
    neutral: "rgba(174,187,206,0.10)",
  };
  return (
    <section id="ecosystem" style={{ padding: "96px 0" }}>
      <Container>
        <SectionHead
          eyebrow="Current projects"
          title="One principle. Four systems unfolding."
          sub="Everything begins from one central rule. From that point, the SookLabs ecosystem expands — each product a quiet system that returns time to focus."
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {PRODUCTS.map((p) => (
            <Reveal key={p.key}>
              <Card appearance="solid" hover padding={26} style={{ height: "100%", boxSizing: "border-box" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 20,
                  }}
                >
                  <span
                    style={{
                      display: "grid",
                      placeItems: "center",
                      width: 46,
                      height: 46,
                      borderRadius: 13,
                      background: glow[p.tone],
                      color: accent[p.tone],
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <p.icon size={22} />
                  </span>
                  <Badge tone={p.tone === "neutral" ? "neutral" : p.tone} mono dot>
                    {p.status}
                  </Badge>
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--text-faint)",
                    marginBottom: 8,
                  }}
                >
                  {p.tag}
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: 22,
                    letterSpacing: "-0.02em",
                    color: "var(--text-primary)",
                    marginBottom: 10,
                  }}
                >
                  {p.key}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 14,
                    lineHeight: 1.55,
                    color: "var(--text-muted)",
                    marginBottom: 20,
                  }}
                >
                  {p.desc}
                </p>
                {p.status !== "To be announced" && (
                  <a
                    href="#"
                    className="sl-cardlink"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      fontFamily: "var(--font-body)",
                      fontSize: 13.5,
                      fontWeight: 600,
                      color: accent[p.tone],
                    }}
                  >
                    Open {p.key.split(" ")[0]} <Icons.Arrow size={15} />
                  </a>
                )}
              </Card>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function WhySection() {
  return (
    <section
      style={{
        padding: "96px 0",
        background: "var(--bg-section-alt)",
        borderTop: "1px solid var(--border-subtle)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <Container>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,0.9fr) minmax(0,1.1fr)",
            gap: 56,
            alignItems: "center",
          }}
          className="sl-2col"
        >
          <SectionHead
            align="left"
            eyebrow="Why SookLabs exists"
            title="Businesses don't need more noise. They need clearer systems."
            sub="Most software adds surface area: more tabs, more pings, more dashboards to check. SookLabs moves the other way — fewer repeated conversations, fewer places to look, fewer decisions to carry."
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { v: "4", l: "Systems", c: "Sookly · SEOS · RoastMyOpSec · Community" },
              { v: "1", l: "Operating rule", c: "Applied to every feature, without exception" },
              { v: "0", l: "Hype", c: "No vague AI, no loud gradients, no noise" },
              { v: "∞", l: "Discipline", c: "Reduce. Protect. Build. Repeat." },
            ].map((s) => (
              <div
                key={s.l}
                style={{
                  padding: "20px 18px",
                  borderRadius: 16,
                  background: "var(--surface-card)",
                  border: "1px solid var(--border-subtle)",
                  boxShadow: "var(--inset-top)",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: 38,
                    color: "var(--text-primary)",
                    lineHeight: 1,
                  }}
                >
                  {s.v}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--accent-glow)",
                    margin: "8px 0 6px",
                  }}
                >
                  {s.l}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 12.5,
                    color: "var(--text-muted)",
                    lineHeight: 1.45,
                  }}
                >
                  {s.c}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

function Philosophy() {
  return (
    <section id="philosophy" style={{ padding: "96px 0" }}>
      <Container style={{ maxWidth: 920 }}>
        <div style={{ textAlign: "center" }}>
          <Overline dot tone="accent" style={{ marginBottom: 24 }}>
            Product philosophy
          </Overline>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(32px, 4.6vw, 56px)",
              lineHeight: 1.08,
              letterSpacing: "-0.035em",
              color: "var(--text-primary)",
            }}
          >
            Boring is the point.
          </p>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 19,
              lineHeight: 1.65,
              color: "var(--text-secondary)",
              maxWidth: 620,
              margin: "24px auto 0",
            }}
          >
            Reliable systems should feel obvious, dependable, and easy to trust. No theatre, no
            surprises — just infrastructure that quietly does its job, every time.
          </p>
        </div>
      </Container>
    </section>
  );
}

function Pillars() {
  const items = [
    {
      icon: Icons.Layers,
      t: "Technology",
      d: "Calm infrastructure: omnichat, audits, automation, security. Tools that compound.",
    },
    {
      icon: Icons.Brain,
      t: "Psychology",
      d: "How attention, trust, and habit actually work — designed for, not against.",
    },
    {
      icon: Icons.Trend,
      t: "Investment",
      d: "Long-term leverage over short-term noise. Build assets, not interruptions.",
    },
  ];
  return (
    <section
      id="pillars"
      style={{
        padding: "96px 0",
        background: "var(--bg-section-alt)",
        borderTop: "1px solid var(--border-subtle)",
      }}
    >
      <Container>
        <SectionHead eyebrow="The three pillars" title="Technology, psychology, investment." />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {items.map((p) => (
            <div
              key={p.t}
              style={{
                padding: 30,
                borderRadius: 20,
                background: "var(--surface-card)",
                border: "1px solid var(--border-subtle)",
                boxShadow: "var(--inset-top)",
              }}
            >
              <span
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: "rgba(47,124,240,0.10)",
                  color: "var(--accent)",
                  marginBottom: 22,
                }}
              >
                <p.icon size={24} />
              </span>
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
                {p.t}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 14.5,
                  lineHeight: 1.55,
                  color: "var(--text-muted)",
                }}
              >
                {p.d}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Mantra() {
  const lines = [
    "Reduce the noise.",
    "Protect the focus.",
    "Build the system.",
    "Repeat with discipline.",
  ];
  return (
    <section id="community" style={{ padding: "112px 0", position: "relative", overflow: "hidden" }}>
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 120%, rgba(142,131,242,0.16), transparent 60%)",
        }}
      />
      <Container style={{ position: "relative", textAlign: "center" }}>
        <img
          src={GLYPH}
          alt=""
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            marginBottom: 32,
            boxShadow: "0 0 40px rgba(52,207,234,0.4)",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {lines.map((l, i) => (
            <span
              key={l}
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "clamp(28px, 4vw, 46px)",
                letterSpacing: "-0.03em",
                lineHeight: 1.16,
                color: i === lines.length - 1 ? "var(--accent-glow)" : "var(--text-primary)",
              }}
            >
              {l}
            </span>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 12,
            marginTop: 44,
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="primary"
            size="lg"
            href="/audit"
            iconRight={<Icons.Arrow size={18} />}
          >
            Get a free audit now
          </Button>
          <Button variant="secondary" size="lg">
            Explore Sookly
          </Button>
        </div>
      </Container>
    </section>
  );
}

function Footer() {
  const cols = [
    { h: "Ecosystem", links: ["Sookly", "SEOS", "RoastMyOpSec", "Community"] },
    { h: "Company", links: ["Operating rule", "Philosophy", "Pillars", "Contact"] },
    { h: "Resources", links: ["Clinic SEO Snapshot", "Documentation", "Changelog"] },
  ];
  return (
    <footer style={{ borderTop: "1px solid var(--border-subtle)", padding: "56px 0 36px" }}>
      <Container>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.6fr 1fr 1fr 1fr",
            gap: 40,
          }}
          className="sl-foot"
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 14 }}>
              <img src={GLYPH} alt="" style={{ width: 28, height: 28, borderRadius: 8 }} />
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
              }}
            >
              Calm digital systems that reduce repetition, interruptions, cognitive load, and waiting
              time.
            </p>
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
              <ul
                style={{
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  display: "grid",
                  gap: 11,
                }}
              >
                {c.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="sl-navlink"
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: 13.5,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {l}
                    </a>
                  </li>
                ))}
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

export default function SookLabsV2Page() {
  useRouteCanvas();
  return (
    <div
      className={`sl-v2-root ${spaceGrotesk.variable} ${dmSans.variable} ${ibmPlexMono.variable}`}
    >
      <Header />
      <Hero />
      <OperatingRule />
      <Ecosystem />
      <WhySection />
      <Philosophy />
      <Pillars />
      <Mantra />
      <Footer />
    </div>
  );
}
