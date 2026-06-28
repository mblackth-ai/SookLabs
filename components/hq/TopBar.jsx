export function TopBar({ title, subtitle, actions }) {
  return (
    <div
      style={{
        padding: "20px 32px 0",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
      }}
    >
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.025em", color: "var(--text-primary)", lineHeight: 1.2 }}>
          {title}
        </h1>
        {subtitle && <p style={{ fontSize: 13, color: "var(--text-tertiary)", marginTop: 4 }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>{actions}</div>}
    </div>
  );
}
