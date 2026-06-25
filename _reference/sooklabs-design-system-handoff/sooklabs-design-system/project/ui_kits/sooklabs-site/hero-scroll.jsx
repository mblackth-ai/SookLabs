// SookLabs hero — scroll-linked "structured intelligence unfolding" scene.
// Lightweight: a single rAF-throttled scroll listener drives transforms only (GPU-cheap).
// No scroll hijacking, no pinning. Respects prefers-reduced-motion (stays at rest state).

function usePrefersReducedMotion() {
  const [reduce, setReduce] = React.useState(false);
  React.useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduce(m.matches);
    on();
    m.addEventListener ? m.addEventListener("change", on) : m.addListener(on);
    return () => { m.removeEventListener ? m.removeEventListener("change", on) : m.removeListener(on); };
  }, []);
  return reduce;
}

// Scroll progress 0→1 over the first ~85vh of scroll (capped). 0 = at rest.
function useScrollProgress(reduce) {
  const [p, setP] = React.useState(0);
  React.useEffect(() => {
    if (reduce) { setP(0); return; }
    let raf = 0;
    const read = () => {
      raf = 0;
      const dist = Math.min((window.innerHeight || 800) * 0.85, 640);
      setP(Math.max(0, Math.min(1, (window.scrollY || window.pageYOffset || 0) / dist)));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(read); };
    window.addEventListener("scroll", onScroll, { passive: true });
    read();
    return () => { window.removeEventListener("scroll", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [reduce]);
  return p;
}

const smooth = (t) => t * t * (3 - 2 * t);
const HERO_PARTICLES = Array.from({ length: 9 }, (_, i) => {
  const ang = (i / 9) * Math.PI * 2 + 0.4;
  return { x: Math.cos(ang), y: Math.sin(ang), s: 0.62 + (i % 4) * 0.12, c: i % 3 === 0 ? "var(--violet-400)" : "var(--cyan-400)" };
});

function HeroScrollScene() {
  const reduce = usePrefersReducedMotion();
  const p = useScrollProgress(reduce);

  // Two overlapping phases: compress (logo → dot), then expand (quiet bloom).
  const a = smooth(Math.min(1, p / 0.5));            // compression
  const b = smooth(Math.max(0, Math.min(1, (p - 0.4) / 0.6))); // expansion

  const glyphScale = 1 - a * 0.8;                     // 1 → 0.2
  const glyphRadius = 22 + a * 30;                    // square → round dot
  const restOpacity = 1 - a;                          // static orbit fades as it compresses
  const dotGlow = 0.32 + a * 0.42 + Math.sin(b * Math.PI) * 0.3;

  const rings = [0, 1, 2].map((i) => {
    const local = Math.max(0, Math.min(1, b * 1.25 - i * 0.2));
    return { scale: 0.18 + local * 2.4, opacity: Math.sin(local * Math.PI) * 0.42 };
  });
  const partR = b * 190;
  const partOpacity = Math.sin(b * Math.PI);

  const ring = (w, extra) => ({ position: "absolute", width: w, height: w, borderRadius: "50%", ...extra });

  return (
    <div aria-hidden style={{ position: "relative", width: 320, height: 320, maxWidth: "82vw", display: "grid", placeItems: "center", margin: "0 auto" }}>
      {/* Resting orbit — fades out as the logo compresses */}
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", opacity: restOpacity, transition: "opacity .1s linear" }}>
        <div style={ring(320, { border: "1px solid var(--border-subtle)" })} />
        <div style={ring(224, { border: "1px solid var(--border-default)" })} />
        <div className="sl-spin" style={ring(224, { border: "1px solid transparent", borderTopColor: "rgba(52,207,234,0.5)", borderRightColor: "rgba(47,124,240,0.25)" })} />
        <div style={ring(130, { border: "1px solid var(--border-default)" })} />
        <div className="sl-spin-slow" style={{ position: "absolute", width: 320, height: 320 }}>
          <span style={{ position: "absolute", top: -4, left: "50%", width: 8, height: 8, borderRadius: 999, background: "var(--cyan-400)", boxShadow: "0 0 12px var(--cyan-400)" }} />
          <span style={{ position: "absolute", bottom: 28, right: 30, width: 6, height: 6, borderRadius: 999, background: "var(--violet-400)", boxShadow: "0 0 10px var(--violet-400)" }} />
        </div>
      </div>

      {/* Expansion rings — the controlled bloom */}
      {rings.map((r, i) => (
        <div key={i} style={ring(220, {
          border: "1px solid rgba(52,207,234,0.55)",
          transform: `scale(${r.scale})`,
          opacity: r.opacity,
          willChange: "transform, opacity",
        })} />
      ))}

      {/* Drifting particles */}
      {HERO_PARTICLES.map((pt, i) => (
        <span key={i} style={{
          position: "absolute", width: 4 * pt.s + 2, height: 4 * pt.s + 2, borderRadius: 999, background: pt.c,
          boxShadow: `0 0 8px ${pt.c}`,
          transform: `translate(${pt.x * partR}px, ${pt.y * partR}px)`,
          opacity: partOpacity * pt.s, willChange: "transform, opacity",
        }} />
      ))}

      {/* Core glow */}
      <div style={ring(220, { background: "radial-gradient(circle, var(--glow-cyan), transparent 65%)", opacity: 0.5 + a * 0.5 })} />

      {/* The logo — origin point. Always present; compresses toward a glowing dot. */}
      <img src={(window.__resources && window.__resources.glyph) || "../../assets/sooklabs-glyph.png"} alt="SookLabs"
        style={{
          position: "relative", width: 92, height: 92, borderRadius: glyphRadius,
          transform: `scale(${glyphScale})`,
          boxShadow: `0 0 0 1px var(--border-strong), var(--shadow-lg), 0 0 ${40 + dotGlow * 60}px rgba(52,207,234,${dotGlow})`,
          willChange: "transform",
        }} />
    </div>
  );
}

// Reveal-on-enter for the project cards. Drives opacity/transform from JS state only —
// NO CSS transition or @keyframes (those timelines freeze in some preview iframes, stranding
// cards at opacity 0). A requestAnimationFrame tween smooths it where the clock runs; a
// setTimeout fallback guarantees the visible end-state everywhere.
function useReveal() {
  const ref = React.useRef(null);
  const [prog, setProg] = React.useState(0); // 0 = hidden, 1 = shown
  React.useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setProg(1); return; }
    const el = ref.current;
    if (!el) { setProg(1); return; }

    const DUR = 560;
    let started = false, rafId = 0, startT = 0, scrollRaf = 0, fallback = 0, hard = 0;

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
      // Guarantee the end-state even if the rAF clock never advances.
      fallback = setTimeout(() => { if (rafId) cancelAnimationFrame(rafId); setProg(1); }, DUR + 200);
      rafId = requestAnimationFrame(tick);
    };
    const inView = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      return r.top < vh * 0.92 && r.bottom > 0;
    };
    const onScroll = () => {
      if (!scrollRaf) scrollRaf = requestAnimationFrame(() => { scrollRaf = 0; if (inView()) start(); });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    if (inView()) start();
    hard = setTimeout(start, 900); // ultimate safety: never leave a card hidden

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

function Reveal({ children, delay = 0 }) {
  const [ref, prog] = useReveal();
  return (
    <div ref={ref} style={{
      display: "flex",
      opacity: prog,
      transform: prog >= 1 ? "none" : `translateY(${(1 - prog) * 16}px)`,
      willChange: "transform, opacity",
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
}

Object.assign(window, { HeroScrollScene, Reveal, usePrefersReducedMotion });
