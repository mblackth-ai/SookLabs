"use client";

import { useEffect, useState } from "react";
import { Button } from "./Button";
import { useRouter } from "next/navigation";

const PROVIDERS = [
  { id: "cursor", label: "Cursor" },
  { id: "codex", label: "Codex" },
  { id: "claude", label: "Claude" },
];

const FOCUS_PRESETS = [
  { id: "sookly-p0", label: "Sookly P0", value: "Sookly MVP1 P0 — what should ship next on the action plan?" },
  { id: "seos", label: "SEOS", value: "SEOS Social GTM — top content and distribution gaps this week" },
  { id: "blockers", label: "Blockers", value: "HQ blockers — what is stuck and what unblocks it today?" },
  { id: "portfolio", label: "Portfolio", value: "Portfolio scan — risks across Sookly, SEOS, Community, RoastMyOpSec" },
];

const STORAGE_KEY = "hq-agent-provider";
const FOCUS_KEY = "hq-ask-ai-focus";

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
      const savedFocus = localStorage.getItem(FOCUS_KEY);
      if (savedFocus) setFollowUp(savedFocus);
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

  function onFocusChange(next) {
    setFollowUp(next);
    try {
      if (next.trim()) localStorage.setItem(FOCUS_KEY, next);
      else localStorage.removeItem(FOCUS_KEY);
    } catch {
      /* ignore */
    }
  }

  function applyPreset(preset) {
    onFocusChange(preset.value);
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
    <span className="hq-ask-ai-bar" style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
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
        <>
          <div className="hq-ask-ai-focus-presets" style={{ display: "inline-flex", gap: 6, flexWrap: "wrap" }}>
            {FOCUS_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={`hq-ask-ai-preset${followUp === preset.value ? " hq-ask-ai-preset--active" : ""}`}
                onClick={() => applyPreset(preset)}
                title={preset.value}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <input
            value={followUp}
            onChange={(e) => onFocusChange(e.target.value)}
            placeholder="Focus (e.g. Sookly P0)…"
            aria-label="Ask AI focus"
            style={{
              fontSize: "var(--text-xs)",
              padding: "4px 8px",
              height: 28,
              minWidth: 160,
              flex: "1 1 180px",
              background: "var(--bg-base)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)",
              color: "var(--text-primary)",
            }}
          />
        </>
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
