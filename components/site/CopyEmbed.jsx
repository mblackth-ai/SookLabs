"use client";

import { useMemo, useState } from "react";

const TAB_ORDER = ["html", "markdown", "plain"];

const TAB_LABELS = {
  html: "HTML",
  markdown: "Markdown",
  plain: "Plain",
};

/**
 * Tabbed copy surface for paste embeds. Only shows tabs that have non-empty content.
 */
export function CopyEmbed({ html, markdown, plain, height = 180, label = "Copy" }) {
  const available = useMemo(
    () =>
      TAB_ORDER.filter((key) => {
        const value = key === "html" ? html : key === "markdown" ? markdown : plain;
        return typeof value === "string" && value.length > 0;
      }),
    [html, markdown, plain]
  );

  const [tab, setTab] = useState(available[0] || "plain");
  const [copied, setCopied] = useState(false);
  const active = available.includes(tab) ? tab : available[0];

  const value =
    active === "html" ? html || "" : active === "markdown" ? markdown || "" : plain || "";

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  if (!available.length) return null;

  return (
    <div
      style={{
        borderRadius: 14,
        border: "1px solid var(--border-subtle)",
        background: "var(--surface-inset, var(--ink-600))",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          padding: "8px 10px",
          borderBottom: "1px solid var(--border-subtle)",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }} role="tablist" aria-label={label}>
          {available.map((key) => {
            const selected = key === active;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setTab(key)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: selected
                    ? "1px solid var(--border-default, var(--line))"
                    : "1px solid transparent",
                  background: selected ? "var(--surface-card)" : "transparent",
                  color: selected ? "var(--text-primary)" : "var(--text-faint)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.06em",
                  cursor: "pointer",
                }}
              >
                {TAB_LABELS[key]}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={onCopy}
          style={{
            padding: "7px 12px",
            borderRadius: 9,
            border: "1px solid var(--border-subtle)",
            background: copied ? "var(--tint-cyan)" : "var(--surface-card)",
            color: copied ? "var(--cyan-300)" : "var(--text-secondary)",
            fontFamily: "var(--font-body)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            transition: "background 180ms ease, color 180ms ease",
          }}
        >
          {copied ? "Copied" : label}
        </button>
      </div>
      <pre
        style={{
          margin: 0,
          padding: 14,
          maxHeight: height,
          overflow: "auto",
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          lineHeight: 1.55,
          color: "var(--text-secondary)",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {value}
      </pre>
    </div>
  );
}
