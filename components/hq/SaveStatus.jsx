"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

const SaveStatusContext = createContext({ status: "idle", setStatus: () => {} });

export function SaveStatusProvider({ children }) {
  const [status, setStatusRaw] = useState("idle"); // idle | saving | saved | error
  const timer = useRef(null);

  const setStatus = useCallback((next) => {
    setStatusRaw(next);
    if (timer.current) clearTimeout(timer.current);
    if (next === "saved") {
      timer.current = setTimeout(() => setStatusRaw("idle"), 2000);
    }
  }, []);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const value = useMemo(() => ({ status, setStatus }), [status, setStatus]);

  return <SaveStatusContext.Provider value={value}>{children}</SaveStatusContext.Provider>;
}

export function useSaveStatus() {
  return useContext(SaveStatusContext);
}

export function SaveStatusChip() {
  const { status } = useSaveStatus();
  if (status === "idle") return null;
  const label = status === "saving" ? "Saving…" : status === "saved" ? "Saved" : "Save failed";
  return (
    <span className={`hq-save-chip hq-save-chip--${status}`} role="status" aria-live="polite">
      {label}
    </span>
  );
}
