"use client";

import { useEffect, useState } from "react";
import { Button } from "./Button";
import { useRouter } from "next/navigation";

const PROVIDERS = [
  { id: "cursor", label: "Cursor" },
  { id: "codex", label: "Codex" },
  { id: "claude", label: "Claude" },
];

const STORAGE_KEY = "hq-agent-provider";

export function AskAIButton({ showFocus = false }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [provider, setProvider] = useState("cursor");
  const [followUp, setFollowUp] = useState("");
  const router = useRouter();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && PROVIDERS.some((p) => p.id === saved)) setProvider(saved);
    } catch {
      /* ignore */
    }
  }, []);

  function onProviderChange(next) {
    setProvider(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }

  async function runAsk() {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/hq/api/briefing/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, followUp: followUp.trim() || undefined }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error || "Ask AI failed");
        return;
      }
      if (json.status === "running") {
        setMessage(json.summary || `Dispatched to ${provider} — waiting for callback`);
        // Keep founder on Briefing; AgentJobLog below + Automation for complete
      } else if (json.lastGeneratedAt || json.summary) {
        setMessage(json.summary || `Updated ${json.lastGeneratedAt || ""}`);
      } else {
        setMessage("Job recorded — check Agent jobs below");
      }
      router.refresh();
    } catch {
      setError("Ask AI failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <select
        aria-label="Agent provider"
        value={provider}
        onChange={(e) => onProviderChange(e.target.value)}
        style={{
          fontSize: "var(--text-xs)",
          fontFamily: "var(--font-sans)",
          color: "var(--text-secondary)",
          background: "var(--bg-base)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-md)",
          padding: "4px 8px",
          height: 28,
        }}
      >
        {PROVIDERS.map((p) => (
          <option key={p.id} value={p.id}>
            {p.label}
          </option>
        ))}
      </select>
      {showFocus && (
        <input
          value={followUp}
          onChange={(e) => setFollowUp(e.target.value)}
          placeholder="Focus (e.g. Sookly P0)…"
          aria-label="Ask AI focus"
          style={{
            fontSize: "var(--text-xs)",
            padding: "4px 8px",
            height: 28,
            minWidth: 160,
            background: "var(--bg-base)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)",
            color: "var(--text-primary)",
          }}
        />
      )}
      <Button
        variant="accent"
        size="sm"
        loading={loading}
        onClick={runAsk}
        title="Dispatch briefing job to selected agent (webhook / pending queue — no API key required)"
      >
        Ask AI
      </Button>
      {message && (
        <span style={{ fontSize: 11, color: "var(--text-tertiary)", maxWidth: 360 }}>
          {message}
          {message.toLowerCase().includes("dispatch") || message.toLowerCase().includes("waiting") ? (
            <>
              {" · "}
              <a href="/hq/automation" style={{ color: "var(--text-accent)" }}>
                Automation →
              </a>
            </>
          ) : null}
        </span>
      )}
      {error && <span style={{ fontSize: 11, color: "var(--color-error)" }}>{error}</span>}
    </span>
  );
}
