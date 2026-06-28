"use client";

import { useState } from "react";

export function Card({
  children,
  padding = "md",
  interactive = false,
  selected = false,
  accent = false,
  onClick,
  style: styleProp,
}) {
  const [hovered, setHovered] = useState(false);

  const paddings = {
    none: "0",
    sm: "var(--padding-card-sm)",
    md: "var(--padding-card)",
    lg: "var(--padding-card-lg)",
  };

  const style = {
    background: hovered && interactive ? "var(--bg-raised)" : "var(--bg-surface)",
    border: `1px solid ${
      selected
        ? "var(--border-accent)"
        : accent
        ? "var(--border-accent)"
        : hovered && interactive
        ? "var(--border-strong)"
        : "var(--border-default)"
    }`,
    borderRadius: "var(--radius-lg)",
    padding: paddings[padding],
    boxShadow: selected || accent ? "var(--shadow-glow-sm)" : "var(--card-shadow)",
    cursor: interactive ? "pointer" : "default",
    transition:
      "background 120ms var(--ease-default), border-color 120ms var(--ease-default), box-shadow 120ms var(--ease-default)",
    ...styleProp,
  };

  return (
    <div
      style={style}
      onClick={onClick}
      onMouseEnter={interactive ? () => setHovered(true) : undefined}
      onMouseLeave={interactive ? () => setHovered(false) : undefined}
    >
      {children}
    </div>
  );
}
