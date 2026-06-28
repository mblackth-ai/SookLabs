export function AttentionRow({ sev, title, time, tag, action }) {
  const color = sev === "error" ? "var(--color-error)" : "var(--color-warning)";
  const bg = sev === "error" ? "var(--color-error-muted)" : "var(--color-warning-muted)";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 0",
        borderBottom: "1px solid var(--border-faint)",
      }}
    >
      <div
        style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0, boxShadow: `0 0 6px ${color}` }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            color: "var(--text-primary)",
            letterSpacing: "-0.01em",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 3, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{time}</span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color,
              background: bg,
              padding: "1px 6px",
              borderRadius: 99,
            }}
          >
            {tag}
          </span>
        </div>
      </div>
      <span
        style={{
          fontSize: 12,
          color: "var(--text-secondary)",
          background: "transparent",
          border: "1px solid var(--border-subtle)",
          borderRadius: 6,
          padding: "4px 10px",
          whiteSpace: "nowrap",
        }}
      >
        {action} →
      </span>
    </div>
  );
}
