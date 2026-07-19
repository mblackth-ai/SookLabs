export function Badge({ children, variant = "neutral", size = "md", dot = false, style: styleProp, title }) {
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

  const style = {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    background: v.bg,
    color: v.color,
    border: `1px solid ${v.border}`,
    borderRadius: "var(--radius-full)",
    fontFamily: "var(--font-sans)",
    fontWeight: "var(--weight-semibold)",
    letterSpacing: "var(--tracking-caps)",
    textTransform: "uppercase",
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
