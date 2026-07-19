"use client";

import Link from "next/link";
import { useState } from "react";

export function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = "left",
  onClick,
  type = "button",
  fullWidth = false,
  href,
  external = false,
  style: styleProp,
  title,
}) {
  const [hovered, setHovered] = useState(false);
  const isDisabled = disabled || loading;

  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    fontFamily: "var(--font-sans)",
    fontWeight: "var(--weight-medium)",
    letterSpacing: "-0.01em",
    borderRadius: "var(--radius-lg)",
    border: "1px solid transparent",
    cursor: isDisabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.4 : 1,
    textDecoration: "none",
    transition:
      "background-color 100ms var(--ease-default), color 100ms var(--ease-default), border-color 100ms var(--ease-default), box-shadow 100ms var(--ease-default)",
    whiteSpace: "nowrap",
    flexShrink: 0,
    width: fullWidth ? "100%" : undefined,
    userSelect: "none",
  };

  const sizes = {
    sm: { fontSize: "var(--text-sm)", padding: "5px 12px", height: "28px" },
    md: { fontSize: "var(--text-sm)", padding: "7px 14px", height: "32px" },
    lg: { fontSize: "var(--text-base)", padding: "9px 20px", height: "38px" },
  };

  const variants = {
    primary: { background: "var(--accent)", color: "#080808", borderColor: "transparent" },
    secondary: { background: "var(--bg-raised)", color: "var(--text-primary)", borderColor: "var(--border-default)" },
    ghost: { background: "transparent", color: "var(--text-secondary)", borderColor: "transparent" },
    danger: { background: "var(--color-error-muted)", color: "var(--color-error)", borderColor: "rgba(239,68,68,0.2)" },
    accent: { background: "var(--accent-muted)", color: "var(--text-accent)", borderColor: "var(--border-accent)" },
  };

  const hoverOverrides =
    hovered && !isDisabled
      ? {
          primary: { background: "var(--color-cyan-300)", boxShadow: "var(--shadow-glow-sm)" },
          secondary: { background: "var(--bg-overlay)", borderColor: "var(--border-strong)" },
          ghost: { background: "var(--bg-surface)", color: "var(--text-primary)" },
          danger: { background: "rgba(239,68,68,0.18)", borderColor: "rgba(239,68,68,0.3)" },
          accent: { background: "var(--accent-muted-hover)", borderColor: "var(--border-accent)" },
        }[variant]
      : {};

  const finalStyle = { ...base, ...sizes[size], ...variants[variant], ...hoverOverrides, ...styleProp };

  const content = (
    <>
      {loading && (
        <span
          style={{
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            border: "2px solid currentColor",
            borderTopColor: "transparent",
            animation: "sl-spin 0.7s linear infinite",
            display: "inline-block",
          }}
        />
      )}
      {icon && iconPosition === "left" && !loading && (
        <span style={{ display: "flex", alignItems: "center" }} dangerouslySetInnerHTML={{ __html: icon }} />
      )}
      {children}
      {icon && iconPosition === "right" && !loading && (
        <span style={{ display: "flex", alignItems: "center" }} dangerouslySetInnerHTML={{ __html: icon }} />
      )}
    </>
  );

  if (href && !isDisabled) {
    const isExternal = external || /^https?:\/\//i.test(href);
    if (isExternal) {
      return (
        <a
          href={href}
          style={finalStyle}
          title={title}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={onClick}
        >
          {content}
        </a>
      );
    }
    return (
      <Link
        href={href}
        style={finalStyle}
        title={title}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onClick}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      style={finalStyle}
      disabled={isDisabled}
      onClick={!isDisabled ? onClick : undefined}
      type={type}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {content}
    </button>
  );
}
