// SookLabs site — Header + Hero (logo as origin point of the ecosystem)
const { Overline, Button, Container } = window;

function Header() {
  const [open, setOpen] = React.useState(false);
  const links = [
    { label: "Ecosystem", href: "#ecosystem" },
    { label: "Philosophy", href: "#philosophy" },
    { label: "Pillars", href: "#pillars" },
    { label: "Community", href: "#community" },
  ];
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(10,14,22,0.72)",
      backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", borderBottom: "1px solid var(--border-subtle)" }}>
      <Container style={{ height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="#" style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <img src={(window.__resources && window.__resources.glyph) || "../../assets/sooklabs-glyph.png"} alt="" style={{ width: 30, height: 30, borderRadius: 8 }} />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 19, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>SookLabs</span>
        </a>
        <nav style={{ display: "flex", alignItems: "center", gap: 30 }} className="sl-desk">
          {links.map((l) => (
            <a key={l.label} href={l.href} className="sl-navlink"
              style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 500, color: "var(--text-muted)" }}>{l.label}</a>
          ))}
        </nav>
        <div className="sl-desk" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Button variant="ghost" size="sm">Sign in</Button>
          <Button variant="primary" size="sm" iconRight={<Icons.Arrow size={15} />}>Explore Sookly</Button>
        </div>
        <button className="sl-mob" onClick={() => setOpen(!open)} aria-label="Menu"
          style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: 6 }}>
          {open ? <Icons.Close /> : <Icons.Menu />}
        </button>
      </Container>
      {open && (
        <div className="sl-mob" style={{ borderTop: "1px solid var(--border-subtle)", padding: "16px 32px", display: "flex", flexDirection: "column", gap: 14 }}>
          {links.map((l) => <a key={l.label} href={l.href} onClick={() => setOpen(false)} style={{ color: "var(--text-secondary)", fontSize: 15 }}>{l.label}</a>)}
          <Button variant="primary" size="sm">Explore Sookly</Button>
        </div>
      )}
    </header>
  );
}

function OrbitField() {
  // Subtle orbital geometry + the glyph as the origin point.
  return (
    <div className="sl-orbit" aria-hidden style={{ position: "relative", width: 320, height: 320, display: "grid", placeItems: "center", margin: "0 auto" }}>
      <div className="sl-ring" style={{ position: "absolute", width: 320, height: 320, borderRadius: "50%", border: "1px solid var(--border-subtle)" }} />
      <div className="sl-ring" style={{ position: "absolute", width: 224, height: 224, borderRadius: "50%", border: "1px solid var(--border-default)" }} />
      <div className="sl-ring sl-spin" style={{ position: "absolute", width: 224, height: 224, borderRadius: "50%", border: "1px solid transparent", borderTopColor: "rgba(52,207,234,0.5)", borderRightColor: "rgba(47,124,240,0.25)" }} />
      <div className="sl-ring" style={{ position: "absolute", width: 130, height: 130, borderRadius: "50%", border: "1px solid var(--border-default)" }} />
      {/* orbiting nodes */}
      <div className="sl-spin-slow" style={{ position: "absolute", width: 320, height: 320 }}>
        <span style={{ position: "absolute", top: -4, left: "50%", width: 8, height: 8, borderRadius: 999, background: "var(--cyan-400)", boxShadow: "0 0 12px var(--cyan-400)" }} />
        <span style={{ position: "absolute", bottom: 28, right: 30, width: 6, height: 6, borderRadius: 999, background: "var(--violet-400)", boxShadow: "0 0 10px var(--violet-400)" }} />
      </div>
      {/* glow + glyph */}
      <div style={{ position: "absolute", width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, var(--glow-cyan), transparent 65%)" }} />
      <img className="sl-glyph-pulse" src={(window.__resources && window.__resources.glyph) || "../../assets/sooklabs-glyph.png"} alt="SookLabs"
        style={{ position: "relative", width: 92, height: 92, borderRadius: 22, boxShadow: "0 0 0 1px var(--border-strong), var(--shadow-lg), 0 0 50px rgba(52,207,234,0.35)" }} />
    </div>
  );
}

function Hero() {
  return (
    <section style={{ position: "relative", overflow: "hidden", paddingTop: 64, paddingBottom: 96 }}>
      <div aria-hidden className="sl-grid-bg" />
      <div aria-hidden style={{ position: "absolute", top: -120, left: "50%", transform: "translateX(-50%)", width: 1000, height: 620,
        background: "radial-gradient(ellipse at center, var(--glow-blue), transparent 68%)", pointerEvents: "none" }} />
      <Container style={{ position: "relative", textAlign: "center" }}>
        <div className="sl-fade" style={{ display: "flex", justifyContent: "center", marginBottom: 40 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "6px 14px", borderRadius: 999,
            border: "1px solid var(--border-default)", background: "var(--surface-card)" }}>
            <Overline dot tone="accent">SookLabs — quiet infrastructure</Overline>
          </span>
        </div>
        <div className="sl-fade sl-d1"><HeroScrollScene /></div>
        <h1 className="sl-fade sl-d2" style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(40px, 6vw, 72px)",
          lineHeight: 1.05, letterSpacing: "-0.035em", color: "var(--text-primary)", maxWidth: 880, margin: "36px auto 0", textWrap: "balance" }}>
          Systems that turn repetition into infrastructure.
        </h1>
        <p className="sl-fade sl-d3" style={{ fontFamily: "var(--font-body)", fontSize: "clamp(16px, 2vw, 20px)", lineHeight: 1.6,
          color: "var(--text-secondary)", maxWidth: 620, margin: "24px auto 0" }}>
          SookLabs builds calm digital systems for businesses, operators, and builders who need
          fewer interruptions, clearer workflows, and more time to focus.
        </p>
        <div className="sl-fade sl-d4" style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 36, flexWrap: "wrap" }}>
          <Button variant="primary" size="lg" iconRight={<Icons.Arrow size={18} />}>Explore the ecosystem</Button>
          <Button variant="secondary" size="lg">Read the operating rule</Button>
        </div>
      </Container>
    </section>
  );
}

Object.assign(window, { Header, Hero });
