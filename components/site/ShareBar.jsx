"use client";

import { useState, useSyncExternalStore } from "react";
import { publicHttpUrl } from "@/lib/resources";

function subscribeShare() {
  return () => {};
}

function getShareSnapshot() {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

function getShareServerSnapshot() {
  return false;
}

function buildIntents({ url, title, text }) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title || "");
  const body = encodeURIComponent(text || title || url);
  return [
    {
      id: "x",
      label: "X",
      href: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
    },
    {
      id: "facebook",
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    },
    {
      id: "reddit",
      label: "Reddit",
      href: `https://www.reddit.com/submit?url=${u}&title=${t}`,
    },
    {
      id: "email",
      label: "Email",
      href: `mailto:?subject=${t}&body=${body}%0A%0A${u}`,
    },
  ];
}

/**
 * Universal share: Web Share API when available, then intent fallbacks + copy.
 * No counters or tracking pixels. Share API is detected after mount to avoid hydration mismatch.
 */
export function ShareBar({
  url,
  title = "SookLabs Resources",
  text = "",
  label = "Share",
  compact = false,
}) {
  const [copied, setCopied] = useState(false);
  const canNative = useSyncExternalStore(subscribeShare, getShareSnapshot, getShareServerSnapshot);
  const safeUrl = publicHttpUrl(url);

  if (!safeUrl) return null;

  const intents = buildIntents({ url: safeUrl, title, text: text || title });

  async function onNativeShare() {
    if (typeof navigator === "undefined" || !navigator.share) return;
    try {
      await navigator.share({ title, text: text || title, url: safeUrl });
    } catch {
      /* user cancelled */
    }
  }

  async function onCopyLink() {
    try {
      await navigator.clipboard.writeText(safeUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  const btn = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: compact ? "7px 10px" : "8px 12px",
    borderRadius: 10,
    border: "1px solid var(--border-subtle)",
    background: "var(--surface-card)",
    color: "var(--text-secondary)",
    fontFamily: "var(--font-body)",
    fontSize: compact ? 12 : 13,
    fontWeight: 500,
    cursor: "pointer",
    textDecoration: "none",
    lineHeight: 1.2,
  };

  return (
    <div
      className="sl-sharebar"
      role="group"
      aria-label={label}
      style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}
    >
      {!compact && (
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--text-faint)",
            marginRight: 4,
          }}
        >
          {label}
        </span>
      )}
      {canNative && (
        <button type="button" onClick={onNativeShare} style={btn}>
          Share…
        </button>
      )}
      <span className="sl-sharebar-intents" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {intents.map((item) => (
          <a
            key={item.id}
            href={item.href}
            target={item.id === "email" ? undefined : "_blank"}
            rel={item.id === "email" ? undefined : "noopener noreferrer"}
            style={btn}
          >
            {item.label}
          </a>
        ))}
      </span>
      <button
        type="button"
        onClick={onCopyLink}
        style={{ ...btn, color: copied ? "var(--cyan-400)" : btn.color }}
      >
        {copied ? "Link copied" : "Copy link"}
      </button>
    </div>
  );
}
