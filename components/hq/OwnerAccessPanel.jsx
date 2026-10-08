"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Card } from "./Card";

const inputStyle = {
  background: "var(--bg-subtle)",
  border: "1px solid var(--border-default)",
  borderRadius: "var(--radius-md)",
  color: "var(--text-primary)",
  padding: "6px 10px",
  fontSize: "var(--text-sm)",
  minWidth: 0,
  flex: "1 1 180px",
};

function when(value) {
  return value ? new Date(value).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "never";
}

/** Mark only: invite a business owner to their own room, see who has access, revoke. */
export function OwnerAccessPanel({ businesses }) {
  const [state, setState] = useState({ loading: true, installed: false, invites: [], access: [], error: "" });
  const [labels, setLabels] = useState({});
  const [fresh, setFresh] = useState(null);
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/hq/api/owners", { cache: "no-store" });
    const body = await res.json().catch(() => ({}));
    setState({ loading: false, installed: !!body.installed, invites: body.invites || [], access: body.access || [], error: res.ok ? "" : body.error || "Unavailable" });
  }, []);

  useEffect(() => {
    let alive = true;
    fetch("/hq/api/owners", { cache: "no-store" })
      .then((res) => res.json().then((body) => ({ res, body })))
      .then(({ res, body }) => {
        if (alive) setState({ loading: false, installed: !!body.installed, invites: body.invites || [], access: body.access || [], error: res.ok ? "" : body.error || "Unavailable" });
      })
      .catch(() => alive && setState((s) => ({ ...s, loading: false, error: "Unavailable" })));
    return () => {
      alive = false;
    };
  }, []);

  async function post(body) {
    setBusy(body.action + (body.business || body.id || ""));
    try {
      const res = await fetch("/hq/api/owners", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) setState((s) => ({ ...s, error: payload.error || "Failed" }));
      return payload;
    } finally {
      setBusy("");
      await load();
    }
  }

  async function invite(business) {
    const payload = await post({ action: "invite", business, label: labels[business] || "Owner" });
    if (payload.ok) setFresh({ business, link: payload.link, expiresAt: payload.invite.expiresAt, copied: false });
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(fresh.link);
      setFresh((f) => ({ ...f, copied: true }));
    } catch {
      /* the link stays visible to copy by hand */
    }
  }

  if (state.loading) return null;

  return (
    <Card padding="md">
      <div style={{ display: "grid", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "var(--text-base)", color: "var(--text-primary)" }}>Owner rooms</h2>
          <p style={{ margin: "4px 0 0", fontSize: "var(--text-sm)", color: "var(--text-tertiary)" }}>
            Invite a business owner to see their own rankings and the work underway, nothing else. Links work once and expire in 7 days. Send them directly, not in the room.
          </p>
        </div>
        {state.error && <p role="alert" style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--color-error)" }}>{state.error}</p>}

        {!state.installed ? (
          <div>
            <Button size="sm" loading={busy === "install"} onClick={() => post({ action: "install" })}>
              Switch on owner rooms
            </Button>
            <p style={{ margin: "6px 0 0", fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
              Adds two tables to the HQ database (invites, owner access). Changes nothing else.
            </p>
          </div>
        ) : (
          <>
            {fresh && (
              <Card padding="sm" accent>
                <div style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
                    New link for {businesses.find((b) => b.slug === fresh.business)?.name || fresh.business}: shown once, expires {when(fresh.expiresAt)}
                  </span>
                  <code style={{ fontSize: "var(--text-xs)", wordBreak: "break-all", color: "var(--text-primary)" }}>{fresh.link}</code>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button size="sm" variant="secondary" onClick={copy}>{fresh.copied ? "Copied" : "Copy link"}</Button>
                    <Button size="sm" variant="ghost" onClick={() => setFresh(null)}>Done</Button>
                  </div>
                </div>
              </Card>
            )}
            {businesses.map((b) => {
              const access = state.access.filter((a) => a.business === b.slug);
              const invites = state.invites.filter((i) => i.business === b.slug);
              return (
                <div key={b.slug} style={{ display: "grid", gap: 6, borderTop: "1px solid var(--border-subtle)", paddingTop: 10 }}>
                  <strong style={{ fontSize: "var(--text-sm)", color: "var(--text-primary)" }}>{b.name}</strong>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    <input
                      aria-label={`Owner name for ${b.name}`}
                      placeholder="Owner name (e.g. Jane, RDUSA)"
                      value={labels[b.slug] || ""}
                      onChange={(e) => setLabels((l) => ({ ...l, [b.slug]: e.target.value }))}
                      style={inputStyle}
                    />
                    <Button size="sm" loading={busy === `invite${b.slug}`} onClick={() => invite(b.slug)}>
                      Invite owner
                    </Button>
                  </div>
                  {access.map((a) => (
                    <div key={a.id} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                      <Badge variant="success" size="sm">Has access</Badge>
                      <span>{a.label}</span>
                      <span style={{ color: "var(--text-tertiary)" }}>last seen {when(a.lastSeenAt)}</span>
                      <Button size="sm" variant="ghost" loading={busy === `revoke${a.id}`} onClick={() => post({ action: "revoke", id: a.id })}>
                        Revoke
                      </Button>
                    </div>
                  ))}
                  {invites.map((i) => (
                    <div key={i.id} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                      <Badge variant="outline" size="sm">Link sent</Badge>
                      <span>{i.label}</span>
                      <span style={{ color: "var(--text-tertiary)" }}>expires {when(i.expiresAt)}</span>
                      <Button size="sm" variant="ghost" loading={busy === `revoke${i.id}`} onClick={() => post({ action: "revoke", id: i.id })}>
                        Cancel link
                      </Button>
                    </div>
                  ))}
                </div>
              );
            })}
          </>
        )}
      </div>
    </Card>
  );
}
