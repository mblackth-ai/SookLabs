"use client";

import Image from "next/image";
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
      const path = window.location.pathname.replace(/\/$/, "") || "/";
      const onLoginPath = path === "/hq/login" || path === "/login";
      if (onLoginPath) {
        window.location.assign(path.startsWith("/hq") ? "/hq" : "/");
      } else {
        window.location.reload();
      }
    } catch {
      setError("Sign in failed.");
      setLoading(false);
    }
  }

  return (
    <div className="hq-login-page">
      <form onSubmit={onSubmit} className="hq-login-form">
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2-5)" }}>
          <Image
            src={GLYPH}
            alt="SookLabs"
            width={32}
            height={32}
            priority
            style={{ borderRadius: "var(--radius-lg)", objectFit: "cover" }}
          />
          <span
            style={{
              fontSize: "var(--text-base)",
              fontWeight: "var(--weight-semibold)",
              letterSpacing: "var(--tracking-snug)",
              color: "var(--text-primary)",
            }}
          >
            SookLabs HQ
          </span>
        </div>

        <div>
          <div
            style={{
              fontSize: "var(--text-lg)",
              fontWeight: "var(--weight-semibold)",
              letterSpacing: "var(--tracking-snug)",
              color: "var(--text-primary)",
            }}
          >
            Restricted access
          </div>
          <p
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--text-tertiary)",
              marginTop: "var(--space-1)",
              lineHeight: "var(--leading-normal)",
            }}
          >
            Enter the access password to continue.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1-5)" }}>
          <label
            htmlFor="hq-password"
            style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-secondary)" }}
          >
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
              padding: "var(--space-2) var(--space-3)",
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
              fontSize: "var(--text-xs)",
              color: "var(--color-error)",
              background: "var(--color-error-muted)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "var(--radius-md)",
              padding: "var(--space-2) var(--space-2-5)",
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
