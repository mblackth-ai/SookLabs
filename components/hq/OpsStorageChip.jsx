"use client";

import { useEffect, useState } from "react";

/**
 * Honest ops storage indicator for sidebar / settings — fetches /hq/api/ops/health once.
 */
export function OpsStorageChip() {
  const [storage, setStorage] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/hq/api/ops/health")
      .then((r) => r.json())
      .then((j) => {
        if (!cancelled && j.ok) setStorage(j.storage);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!storage) return null;

  const isPg = storage === "postgres";
  return (
    <span
      className="hq-sidebar-nav-badge"
      title={isPg ? "Ops persisted in Postgres" : "Ops on file — set HQ_DATABASE_URL on Vercel"}
      style={{
        background: isPg ? "rgba(34,197,94,.15)" : "rgba(234,179,8,.15)",
        color: isPg ? "rgb(34,197,94)" : "rgb(234,179,8)",
      }}
    >
      {isPg ? "PG" : "File"}
    </span>
  );
}
