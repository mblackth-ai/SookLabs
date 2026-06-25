// Lightweight presentational primitives for the SookLabs site kit — mirror the
// design-system components (Button, Card, Overline, Badge) using the shared tokens.
// Self-contained so the kit renders without the compiled bundle.

function Overline({ children, dot, tone = "muted", style }) {
  const c = { muted: "var(--text-muted)", accent: "var(--accent-glow)" }[tone] || "var(--text-muted)";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 9, fontFamily: "var(--font-mono)",
      fontSize: 12, fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", color: c, ...style }}>
      {dot && <span style={{ width: 5, height: 5, borderRadius: 999, background: "var(--accent-glow)", boxShadow: "0 0 8px var(--accent-glow)" }} />}
      {children}
    </span>
  );
}

function Button({ children, variant = "primary", size = "md", iconRight, iconLeft, onClick, style }) {
  const [h, setH] = React.useState(false);
  const [a, setA] = React.useState(false);
  const S = { sm: { p: "9px 16px", f: 13, r: 11 }, md: { p: "12px 22px", f: 14, r: 13 }, lg: { p: "15px 28px", f: 15, r: 14 } }[size];
  const V = {
    primary: { background: h ? "var(--accent-hover)" : "var(--accent)", color: "#fff",
      boxShadow: h ? "0 0 0 1px var(--border-accent), 0 10px 30px rgba(47,124,240,0.32)" : "0 1px 2px rgba(0,0,0,.35)", border: "1px solid transparent" },
    secondary: { background: h ? "var(--surface-hover)" : "var(--surface-card)", color: "var(--text-primary)",
      border: "1px solid var(--border-default)", boxShadow: "var(--inset-top)" },
    ghost: { background: h ? "rgba(174,187,206,.06)" : "transparent", color: h ? "var(--text-primary)" : "var(--text-secondary)", border: "1px solid transparent" },
  }[variant];
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => { setH(false); setA(false); }}
      onMouseDown={() => setA(true)} onMouseUp={() => setA(false)}
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9, padding: S.p, fontFamily: "var(--font-body)",
        fontSize: S.f, fontWeight: 600, borderRadius: S.r, cursor: "pointer", whiteSpace: "nowrap", outline: "none",
        transform: a ? "scale(0.98)" : "scale(1)",
        transition: "background .2s var(--ease-out), box-shadow .2s var(--ease-out), color .2s var(--ease-out), transform .14s var(--ease-out)", ...V, ...style }}>
      {iconLeft}{children}{iconRight}
    </button>
  );
}

function Card({ children, appearance = "solid", glow, hover, padding = 24, radius = "var(--radius-xl)", style }) {
  const [h, setH] = React.useState(false);
  const A = {
    glass: { background: "var(--glass-bg)", backdropFilter: "blur(var(--blur-md))", WebkitBackdropFilter: "blur(var(--blur-md))", border: "1px solid var(--glass-border)" },
    solid: { background: "var(--surface-card)", border: "1px solid var(--border-default)" },
    outline: { background: "transparent", border: "1px solid var(--border-default)" },
  }[appearance];
  const lift = hover && h;
  return (
    <div onMouseEnter={() => hover && setH(true)} onMouseLeave={() => hover && setH(false)}
      style={{ position: "relative", padding, borderRadius: radius,
        boxShadow: lift ? "var(--shadow-lg), var(--inset-top)" : "var(--shadow-md), var(--inset-top)",
        borderColor: lift ? "var(--border-strong)" : undefined, transform: lift ? "translateY(-3px)" : "none",
        transition: "box-shadow .25s var(--ease-out), border-color .25s var(--ease-out), transform .25s var(--ease-out)", ...A, ...style }}>
      {glow && <div aria-hidden style={{ position: "absolute", inset: 0, borderRadius: radius, pointerEvents: "none",
        background: "radial-gradient(120% 80% at 50% -10%, var(--glow-blue), transparent 60%)", opacity: .7 }} />}
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
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 11px", borderRadius: 999,
      fontFamily: mono ? "var(--font-mono)" : "var(--font-body)", fontSize: mono ? 11 : 12, fontWeight: mono ? 500 : 600,
      letterSpacing: mono ? "0.10em" : 0, textTransform: mono ? "uppercase" : "none", color: T[0], background: T[1], whiteSpace: "nowrap", ...style }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: 999, background: T[2] }} />}{children}
    </span>
  );
}

const Container = ({ children, style }) => (
  <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", ...style }}>{children}</div>
);

Object.assign(window, { Overline, Button, Card, Badge, Container });
