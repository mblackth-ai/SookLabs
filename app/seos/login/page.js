"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/hq/Button";
import { seosPath } from "@/lib/seos/paths";

const GLYPH = "/assets/sooklabs/sooklabs-glyph.png";

export default function SeosLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(seosPath("/api/login"), {
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
      const onLoginPath = path === "/seos/login" || path === "/login";
      if (onLoginPath) {
        window.location.assign(seosPath("/command-center"));
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
        <div className="hq-login-brand">
          <Image src={GLYPH} alt="SookLabs" width={36} height={36} priority className="hq-login-glyph" />
          <div>
            <div className="hq-login-brand-name">SookLabs Expansion OS</div>
            <div className="hq-login-brand-tag">SEOS operator access</div>
          </div>
        </div>

        <div className="hq-login-intro">
          <h1 className="hq-login-heading">Operator access</h1>
          <p className="hq-login-lead">
            Sign in with the SEOS access password. Command Center lists projects, connections, and agent workflows.
          </p>
        </div>

        <div className="hq-login-field">
          <label htmlFor="seos-password" className="hq-login-label">
            Password
          </label>
          <input
            id="seos-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            autoComplete="current-password"
            className="hq-login-input"
            placeholder="SEOS access password"
          />
        </div>

        {error ? (
          <div className="hq-login-error" role="alert">
            {error}
          </div>
        ) : null}

        <Button type="submit" variant="primary" size="md" fullWidth loading={loading}>
          Sign in
        </Button>

        <p className="hq-login-footnote">
          MVP 1 Simple Mode · Manual / Draft Export badges stay honest — no fake Connected.
        </p>
      </form>
    </div>
  );
}
