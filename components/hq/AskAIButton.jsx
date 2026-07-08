"use client";

import { useState } from "react";
import { Button } from "./Button";
import { useRouter } from "next/navigation";

export function AskAIButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function runAsk() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/hq/api/briefing/ask", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error || "Ask AI failed");
        return;
      }
      router.refresh();
    } catch {
      setError("Ask AI failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <Button variant="accent" size="sm" loading={loading} onClick={runAsk} title="Generate briefing draft from ops context via Claude">
        Ask AI
      </Button>
      {error && <span style={{ fontSize: 11, color: "var(--color-error)" }}>{error}</span>}
    </span>
  );
}
