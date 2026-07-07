import Image from "next/image";

export function Avatar({ name = "", src = null, size = "md", status = null, isAI = false }) {
  const sizes = { xs: 20, sm: 24, md: 32, lg: 40, xl: 56 };
  const px = sizes[size] || sizes.md;

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const statusColors = {
    online: "var(--color-success)",
    away: "var(--color-warning)",
    offline: "var(--color-gray-500)",
    busy: "var(--color-error)",
  };

  const wrapStyle = { position: "relative", width: px, height: px, flexShrink: 0, display: "inline-flex" };

  const avatarStyle = {
    width: px,
    height: px,
    borderRadius: isAI ? "var(--radius-lg)" : "50%",
    background: src ? undefined : "var(--accent-muted)",
    border: isAI ? "1px solid var(--border-accent)" : "1px solid var(--border-subtle)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: px * 0.36,
    fontWeight: "var(--weight-semibold)",
    fontFamily: "var(--font-sans)",
    color: isAI ? "var(--text-accent)" : "var(--text-secondary)",
    overflow: "hidden",
    boxShadow: isAI ? "var(--shadow-glow-sm)" : undefined,
    flexShrink: 0,
  };

  const statusDotSize = Math.max(6, px * 0.25);
  const statusStyle = {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: statusDotSize,
    height: statusDotSize,
    borderRadius: "50%",
    background: statusColors[status],
    border: "2px solid var(--bg-base)",
  };

  return (
    <span style={wrapStyle}>
      <span style={avatarStyle}>
        {src ? (
          <Image
            src={src}
            alt={name}
            width={px}
            height={px}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : isAI ? (
          <span style={{ fontSize: px * 0.28, fontFamily: "var(--font-mono)", fontWeight: 500, color: "var(--text-accent)" }}>
            AI
          </span>
        ) : (
          initials
        )}
      </span>
      {status && <span style={statusStyle} />}
    </span>
  );
}
