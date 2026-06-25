// SookLabs site — body sections
const { Overline: OL, Card: KCard, Badge: KBadge, Button: KBtn, Container: Ct } = window;

function SectionHead({ eyebrow, title, sub, align = "center", max = 640 }) {
  return (
    <div style={{ textAlign: align, marginBottom: 56, maxWidth: align === "center" ? max : "none", marginLeft: align === "center" ? "auto" : 0, marginRight: align === "center" ? "auto" : 0 }}>
      <OL dot tone="accent" style={{ marginBottom: 18 }}>{eyebrow}</OL>
      <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(30px, 4vw, 44px)", lineHeight: 1.1,
        letterSpacing: "-0.03em", color: "var(--text-primary)", textWrap: "balance" }}>{title}</h2>
      {sub && <p style={{ fontFamily: "var(--font-body)", fontSize: 18, lineHeight: 1.6, color: "var(--text-secondary)", marginTop: 18, maxWidth: max, marginInline: align === "center" ? "auto" : 0 }}>{sub}</p>}
    </div>
  );
}

// 2 — Operating rule
function OperatingRule() {
  return (
    <section style={{ padding: "96px 0", borderTop: "1px solid var(--border-subtle)", background: "var(--bg-section-alt)" }}>
      <Ct>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 0.9fr)", gap: 56, alignItems: "center" }} className="sl-2col">
          <div>
            <OL dot tone="accent" style={{ marginBottom: 20 }}>The operating rule</OL>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(26px, 3.4vw, 38px)", lineHeight: 1.22, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
              If it does not reduce <span style={{ color: "var(--accent-glow)" }}>repetition</span>, <span style={{ color: "var(--accent-glow)" }}>interruptions</span>, <span style={{ color: "var(--accent-glow)" }}>cognitive load</span>, or <span style={{ color: "var(--accent-glow)" }}>waiting time</span> — it does not belong in SookLabs.
            </p>
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            {[
              { icon: <Icons.Workflow size={18} />, t: "Repetition", d: "Turned into infrastructure, not redone by hand." },
              { icon: <Icons.Inbox size={18} />, t: "Interruptions", d: "Captured, routed, and quieted into one place." },
              { icon: <Icons.Brain size={18} />, t: "Cognitive load", d: "Removed through clear systems and defaults." },
              { icon: <Icons.Clock size={18} />, t: "Waiting time", d: "Compressed — answers arrive before the ask." },
            ].map((r) => (
              <div key={r.t} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "14px 16px", borderRadius: 14, background: "var(--surface-card)", border: "1px solid var(--border-subtle)" }}>
                <span style={{ display: "grid", placeItems: "center", width: 38, height: 38, borderRadius: 10, background: "rgba(52,207,234,0.10)", color: "var(--accent-glow)", flex: "none" }}>{r.icon}</span>
                <div>
                  <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 15, color: "var(--text-primary)" }}>{r.t}</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-muted)", marginTop: 2 }}>{r.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Ct>
    </section>
  );
}

// 3 — Ecosystem (current projects)
const PRODUCTS = [
  { key: "Sookly", icon: Icons.Sookly, tone: "cyan", status: "Live", tag: "Omnichat · AI receptionist",
    desc: "Handles enquiries, routes messages, reduces missed leads, and gives teams one calm inbox." },
  { key: "SEOS", icon: Icons.Seos, tone: "blue", status: "In progress", tag: "Search Expansion OS",
    desc: "SEO diagnostics, website audits, content systems, and growth operations — measurable visibility." },
  { key: "RoastMyOpSec", icon: Icons.Roast, tone: "violet", status: "In progress", tag: "Security auditor",
    desc: "Plain-English exposure checks for founders and small teams. Know what is leaking, first." },
  { key: "SookLabs Community", icon: Icons.Community, tone: "neutral", status: "Open", tag: "Builder community",
    desc: "A focused community around technology, psychology, and investment. Sharper thinking, long-term leverage." },
];

function Ecosystem() {
  const accent = { cyan: "var(--cyan-400)", blue: "var(--blue-400)", violet: "var(--violet-400)", neutral: "var(--silver-300)" };
  const glow = { cyan: "var(--glow-cyan)", blue: "var(--glow-blue)", violet: "var(--glow-violet)", neutral: "rgba(174,187,206,0.10)" };
  return (
    <section id="ecosystem" style={{ padding: "96px 0" }}>
      <Ct>
        <SectionHead eyebrow="Current projects" title="One principle. Four systems unfolding."
          sub="Everything begins from one central rule. From that point, the SookLabs ecosystem expands — each product a quiet system that returns time to focus." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {PRODUCTS.map((p, i) => (
            <Reveal key={p.key} delay={i * 90}>
            <KCard appearance="solid" hover padding={26} style={{ height: "100%", boxSizing: "border-box" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <span style={{ display: "grid", placeItems: "center", width: 46, height: 46, borderRadius: 13,
                  background: glow[p.tone], color: accent[p.tone], border: "1px solid var(--border-subtle)" }}>
                  <p.icon size={22} />
                </span>
                <KBadge tone={p.tone === "neutral" ? "neutral" : p.tone} mono dot>{p.status}</KBadge>
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 8 }}>{p.tag}</div>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, letterSpacing: "-0.02em", color: "var(--text-primary)", marginBottom: 10 }}>{p.key}</h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.55, color: "var(--text-muted)", marginBottom: 20 }}>{p.desc}</p>
              <a href="#" className="sl-cardlink" style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 600, color: accent[p.tone] }}>
                Open {p.key.split(" ")[0]} <Icons.Arrow size={15} />
              </a>
            </KCard>
            </Reveal>
          ))}
        </div>
      </Ct>
    </section>
  );
}

// 4 — Why SookLabs exists
function WhySection() {
  return (
    <section style={{ padding: "96px 0", background: "var(--bg-section-alt)", borderTop: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)" }}>
      <Ct>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,0.9fr) minmax(0,1.1fr)", gap: 56, alignItems: "center" }} className="sl-2col">
          <SectionHead align="left" eyebrow="Why SookLabs exists"
            title="Businesses don't need more noise. They need clearer systems."
            sub="Most software adds surface area: more tabs, more pings, more dashboards to check. SookLabs moves the other way — fewer repeated conversations, fewer places to look, fewer decisions to carry." />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { v: "4", l: "Systems", c: "Sookly · SEOS · RoastMyOpSec · Community" },
              { v: "1", l: "Operating rule", c: "Applied to every feature, without exception" },
              { v: "0", l: "Hype", c: "No vague AI, no loud gradients, no noise" },
              { v: "∞", l: "Discipline", c: "Reduce. Protect. Build. Repeat." },
            ].map((s) => (
              <div key={s.l} style={{ padding: "20px 18px", borderRadius: 16, background: "var(--surface-card)", border: "1px solid var(--border-subtle)", boxShadow: "var(--inset-top)" }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 38, color: "var(--text-primary)", lineHeight: 1 }}>{s.v}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--accent-glow)", margin: "8px 0 6px" }}>{s.l}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.45 }}>{s.c}</div>
              </div>
            ))}
          </div>
        </div>
      </Ct>
    </section>
  );
}

// 5 — Product philosophy
function Philosophy() {
  return (
    <section id="philosophy" style={{ padding: "96px 0" }}>
      <Ct style={{ maxWidth: 920 }}>
        <div style={{ textAlign: "center" }}>
          <OL dot tone="accent" style={{ marginBottom: 24 }}>Product philosophy</OL>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(32px, 4.6vw, 56px)", lineHeight: 1.08, letterSpacing: "-0.035em", color: "var(--text-primary)" }}>
            Boring is the point.
          </p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 19, lineHeight: 1.65, color: "var(--text-secondary)", maxWidth: 620, margin: "24px auto 0" }}>
            Reliable systems should feel obvious, dependable, and easy to trust. No theatre, no surprises — just infrastructure that quietly does its job, every time.
          </p>
        </div>
      </Ct>
    </section>
  );
}

// 6 — Pillars
function Pillars() {
  const items = [
    { icon: Icons.Layers, t: "Technology", d: "Calm infrastructure: omnichat, audits, automation, security. Tools that compound." },
    { icon: Icons.Brain, t: "Psychology", d: "How attention, trust, and habit actually work — designed for, not against." },
    { icon: Icons.Trend, t: "Investment", d: "Long-term leverage over short-term noise. Build assets, not interruptions." },
  ];
  return (
    <section id="pillars" style={{ padding: "96px 0", background: "var(--bg-section-alt)", borderTop: "1px solid var(--border-subtle)" }}>
      <Ct>
        <SectionHead eyebrow="The three pillars" title="Technology, psychology, investment." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {items.map((p) => (
            <div key={p.t} style={{ padding: 30, borderRadius: 20, background: "var(--surface-card)", border: "1px solid var(--border-subtle)", boxShadow: "var(--inset-top)" }}>
              <span style={{ display: "grid", placeItems: "center", width: 48, height: 48, borderRadius: 14, background: "rgba(47,124,240,0.10)", color: "var(--accent)", marginBottom: 22 }}><p.icon size={24} /></span>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 21, letterSpacing: "-0.02em", color: "var(--text-primary)", marginBottom: 10 }}>{p.t}</h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 14.5, lineHeight: 1.55, color: "var(--text-muted)" }}>{p.d}</p>
            </div>
          ))}
        </div>
      </Ct>
    </section>
  );
}

// 7 — Mantra + CTA
function Mantra() {
  const lines = ["Reduce the noise.", "Protect the focus.", "Build the system.", "Repeat with discipline."];
  return (
    <section id="community" style={{ padding: "112px 0", position: "relative", overflow: "hidden" }}>
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 120%, var(--glow-violet), transparent 60%)" }} />
      <Ct style={{ position: "relative", textAlign: "center" }}>
        <img src={(window.__resources && window.__resources.glyph) || "../../assets/sooklabs-glyph.png"} alt="" style={{ width: 56, height: 56, borderRadius: 16, marginBottom: 32, boxShadow: "0 0 40px rgba(52,207,234,0.4)" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {lines.map((l, i) => (
            <span key={l} style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(28px, 4vw, 46px)", letterSpacing: "-0.03em", lineHeight: 1.16,
              color: i === lines.length - 1 ? "var(--accent-glow)" : "var(--text-primary)" }}>{l}</span>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 44, flexWrap: "wrap" }}>
          <KBtn variant="primary" size="lg" iconRight={<Icons.Arrow size={18} />}>Join the community</KBtn>
          <KBtn variant="secondary" size="lg">Explore Sookly</KBtn>
        </div>
      </Ct>
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
      <Ct>
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr", gap: 40 }} className="sl-foot">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 14 }}>
              <img src={(window.__resources && window.__resources.glyph) || "../../assets/sooklabs-glyph.png"} alt="" style={{ width: 28, height: 28, borderRadius: 8 }} />
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--text-primary)" }}>SookLabs</span>
            </div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, lineHeight: 1.55, color: "var(--text-muted)", maxWidth: 260 }}>
              Calm digital systems that reduce repetition, interruptions, cognitive load, and waiting time.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.h}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 16 }}>{c.h}</div>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 11 }}>
                {c.links.map((l) => <li key={l}><a href="#" className="sl-navlink" style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)" }}>{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid var(--border-subtle)", marginTop: 40, paddingTop: 22, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-faint)" }}>© 2026 SookLabs — Compress the diamond.</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-faint)" }}>Reduce · Protect · Build · Repeat</span>
        </div>
      </Ct>
    </footer>
  );
}

Object.assign(window, { OperatingRule, Ecosystem, WhySection, Philosophy, Pillars, Mantra, Footer });
