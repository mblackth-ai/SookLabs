export function StatusDot({ status = "neutral", size = "md", pulse = false, label = null }) {
  const colors = {
    active: "var(--color-success)",
    warning: "var(--color-warning)",
    error: "var(--color-error)",
    ai: "var(--accent)",
    neutral: "var(--color-gray-500)",
    offline: "var(--color-gray-600)",
  };

  const sizes = { sm: 6, md: 8, lg: 10 };
  const px = sizes[size];
  const color = colors[status];

  const wrapStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontFamily: "var(--font-sans)",
    fontSize: "var(--text-sm)",
    color: "var(--text-secondary)",
  };

  const dotStyle = {
    width: px,
    height: px,
    borderRadius: "50%",
    background: color,
    flexShrink: 0,
    boxShadow: pulse ? `0 0 0 0 ${color}` : undefined,
    animation: pulse ? "sl-pulse-glow 2s ease-in-out infinite" : undefined,
  };

  return (
    <span style={wrapStyle}>
      <span style={dotStyle} />
      {label && <span>{label}</span>}
    </span>
  );
}
