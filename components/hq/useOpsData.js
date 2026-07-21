"use client";

import { useCallback, useEffect, useState } from "react";
import { useSaveStatus } from "./SaveStatus";

export function useOpsData(initialData) {
  const [data, setData] = useState(initialData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const saveStatus = useSaveStatus();

  useEffect(() => {
    setData(initialData);
  }, [initialData?.updatedAt]);

  const save = useCallback(
    async (partial) => {
      setSaving(true);
      setError("");
      saveStatus.setStatus?.("saving");
      try {
        const res = await fetch("/hq/api/ops", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(partial),
        });
        const json = await res.json();
        if (!res.ok || !json.ok) {
          setError(json.error || "Save failed");
          saveStatus.setStatus?.("error");
          return false;
        }
        setData(json.data);
        saveStatus.setStatus?.("saved");
        return true;
      } catch {
        setError("Save failed");
        saveStatus.setStatus?.("error");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [saveStatus]
  );

  return { data, setData, save, saving, error };
}
