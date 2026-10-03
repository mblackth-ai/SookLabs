"use client";

import { useEffect, useRef, useState } from "react";

const DISMISS_KEY = "hq-storage-warn-dismissed";

/**
 * File-backed ops warning — dismissible for the browser session only.
 */
export function OverviewStorageWarn() {
  const [dismissed, setDismissed] = useState(true);
  const initial = useRef(true);

  useEffect(() => {
    try {
      initial.current = sessionStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      initial.current = false;
    }
    setDismissed(initial.current);
  }, []);

  if (dismissed) return null;

  function dismiss() {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  }

  return (
    <p className="hq-storage-warn">
      Ops store is file-backed. On Vercel/ephemeral hosts, set <code>HQ_DATABASE_URL</code> (Postgres) so
      priorities and boards survive deploys.{" "}
      <a href="/hq/settings">Settings →</a>{" "}
      <button type="button" className="hq-storage-warn-dismiss" onClick={dismiss}>
        Dismiss for session
      </button>
    </p>
  );
}
