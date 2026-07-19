"use client";

import { useCallback, useEffect, useState } from "react";

export function useOpsData(initialData) {
  const [data, setData] = useState(initialData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setData(initialData);
  }, [initialData?.updatedAt]);

  const save = useCallback(async (partial) => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/hq/api/ops", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partial),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error || "Save failed");
        return false;
      }
      setData(json.data);
      return true;
    } catch {
      setError("Save failed");
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  return { data, setData, save, saving, error };
}
