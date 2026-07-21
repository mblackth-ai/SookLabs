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
        <div className="hq-login-brand">
          <Image
            src={GLYPH}
            alt="SookLabs"
            width={36}
            height={36}
            priority
            className="hq-login-glyph"
          />
          <div>
            <div className="hq-login-brand-name">SookLabs HQ</div>
            <div className="hq-login-brand-tag">Private founder command centre</div>
          </div>
        </div>

        <div className="hq-login-intro">
          <h1 className="hq-login-heading">Restricted access</h1>
          <p className="hq-login-lead">Enter the access password to continue.</p>
        </div>

        <div className="hq-login-field">
          <label htmlFor="hq-password" className="hq-login-label">
            Password
          </label>
          <input
            id="hq-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            autoComplete="current-password"
            className="hq-login-input"
            placeholder="Access password"
          />
        </div>

        {error ? <div className="hq-login-error" role="alert">{error}</div> : null}

        <Button type="submit" variant="primary" size="md" fullWidth loading={loading}>
          Sign in
        </Button>

        <p className="hq-login-footnote">Session ends when you sign out from the sidebar.</p>
      </form>
    </div>
  );
}
