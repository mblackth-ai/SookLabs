"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const ASK_AI_PROVIDERS = [
  { id: "cursor", label: "Cursor" },
  { id: "codex", label: "Codex" },
  { id: "claude", label: "Claude" },
];

export const ASK_AI_FOCUS_PRESETS = [
  { id: "sookly-p0", label: "Sookly P0", value: "Sookly MVP1 P0 — what should ship next on the action plan?" },
  { id: "seos", label: "SEOS", value: "SEOS Social GTM — top content and distribution gaps this week" },
  { id: "blockers", label: "Blockers", value: "HQ blockers — what is stuck and what unblocks it today?" },
  { id: "portfolio", label: "Portfolio", value: "Portfolio scan — risks across Sookly, SEOS, Community, RoastMyOpSec" },
];

const STORAGE_KEY = "hq-agent-provider";
const FOCUS_KEY = "hq-ask-ai-focus";

export function useAskAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [provider, setProvider] = useState("cursor");
  const [followUp, setFollowUp] = useState("");
  const router = useRouter();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && ASK_AI_PROVIDERS.some((p) => p.id === saved)) setProvider(saved);
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

  return {
    loading,
    error,
    message,
    provider,
    followUp,
    onProviderChange,
    onFocusChange,
    applyPreset,
    runAsk,
  };
}
