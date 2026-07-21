/** Honesty/sync labels stay caps; counts, priorities, and status stay sentence case. */
export function isHonestyBadgeLabel(text) {
  const t = String(text ?? "").trim();
  if (!t) return false;
  if (/^(manual|draft export|workflow ready|future api|future oauth|draft)$/i.test(t)) return true;
  if (/^manual\s·/i.test(t)) return true;
  if (/^demo\s·/i.test(t)) return true;
  if (/^manual\s·\s*0/i.test(t)) return true;
  return false;
}

export function Badge({ children, variant = "neutral", size = "md", dot = false, caps, style: styleProp, title }) {
  const variants = {
    neutral: { bg: "var(--bg-float)", color: "var(--text-secondary)", border: "var(--border-subtle)" },
    accent: { bg: "var(--accent-muted)", color: "var(--text-accent)", border: "var(--border-accent)" },
    success: { bg: "var(--color-success-muted)", color: "var(--color-success)", border: "rgba(34,197,94,0.2)" },
    warning: { bg: "var(--color-warning-muted)", color: "var(--color-warning)", border: "rgba(245,158,11,0.2)" },
    error: { bg: "var(--color-error-muted)", color: "var(--color-error)", border: "rgba(239,68,68,0.2)" },
    outline: { bg: "transparent", color: "var(--text-secondary)", border: "var(--border-default)" },
  };

  const sizes = {
    sm: { fontSize: "var(--text-xs)", padding: "2px 6px", height: "18px" },
    md: { fontSize: "var(--text-xs)", padding: "3px 8px", height: "20px" },
  };

  const v = variants[variant];
  const s = sizes[size];
  const useCaps = caps ?? isHonestyBadgeLabel(children);

  const style = {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    background: v.bg,
    color: v.color,
    border: `1px solid ${v.border}`,
    borderRadius: "var(--radius-full)",
    fontFamily: "var(--font-sans)",
    fontWeight: useCaps ? "var(--weight-semibold)" : "var(--weight-medium)",
    letterSpacing: useCaps ? "var(--tracking-caps)" : "var(--tracking-snug)",
    textTransform: useCaps ? "uppercase" : "none",
    ...s,
    ...styleProp,
  };

  return (
    <span style={style} title={title}>
      {dot && (
        <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: v.color, flexShrink: 0 }} />
      )}
      {children}
    </span>
  );
}
