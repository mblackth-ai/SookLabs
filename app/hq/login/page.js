"use client";

import { useState } from "react";
import { Button } from "@/components/hq/Button";

const GLYPH = "/assets/sooklabs/sooklabs-glyph.png";

export default function HqLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/hq/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(data.error || "Sign in failed.");
        setLoading(false);
        return;
      }
      // Middleware rewrites protected URLs to this page while preserving the
      // original URL. Reloading now passes the auth gate; if the user is on the
      // literal login path, send them to the dashboard.
      if (window.location.pathname === "/hq/login") {
        window.location.assign("/hq");
      } else {
        window.location.reload();
      }
    } catch {
      setError("Sign in failed.");
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-base)",
        padding: 24,
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          width: "100%",
          maxWidth: 360,
          background: "var(--bg-surface)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-lg)",
          padding: 28,
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src={GLYPH} alt="SookLabs" style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover" }} />
          <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
            SookLabs HQ
          </span>
        </div>

        <div>
          <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
            Restricted access
          </div>
          <p style={{ fontSize: 13, color: "var(--text-tertiary)", marginTop: 4, lineHeight: 1.5 }}>
            Enter the access password to continue.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label htmlFor="hq-password" style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)" }}>
            Password
          </label>
          <input
            id="hq-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            autoComplete="current-password"
            style={{
              width: "100%",
              padding: "8px 12px",
              fontSize: "var(--text-sm)",
              fontFamily: "var(--font-sans)",
              color: "var(--text-primary)",
              background: "var(--bg-base)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-lg)",
              outline: "none",
            }}
          />
        </div>

        {error && (
          <div
            style={{
              fontSize: 12,
              color: "var(--color-error)",
              background: "var(--color-error-muted)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "var(--radius-md)",
              padding: "8px 10px",
            }}
          >
            {error}
          </div>
        )}

        <Button type="submit" variant="primary" size="md" fullWidth loading={loading}>
          Sign in
        </Button>
      </form>
    </div>
  );
}
