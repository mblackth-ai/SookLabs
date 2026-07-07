"use client";

import { useState } from "react";
import { useOpsData } from "./useOpsData";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { newId } from "@/lib/hq/ops-shared";

const STATUSES = ["todo", "doing", "blocked", "done"];
const PRIORITIES = ["P0", "P1", "P2"];

function StreamColumn({ streamKey, stream, onUpdate, saving }) {
  const [draft, setDraft] = useState("");

  async function updateItem(itemId, patch) {
    const items = stream.items.map((item) => (item.id === itemId ? { ...item, ...patch } : item));
    await onUpdate(streamKey, items);
  }

  async function addItem(e) {
    e.preventDefault();
    const title = draft.trim();
    if (!title) return;
    const items = [
      ...stream.items,
      {
        id: newId(streamKey === "sooklyWebsite" ? "sw" : "sa"),
        title,
        status: "todo",
        priority: "P1",
        owner: "James",
        due: "",
        links: [],
      },
    ];
    const ok = await onUpdate(streamKey, items);
    if (ok) setDraft("");
  }

  return (
    <Card padding="md" style={{ height: "100%" }}>
      <div className="hq-card-title" style={{ marginBottom: "var(--space-4)" }}>
        {stream.label}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {stream.items.map((item) => (
          <div
            key={item.id}
            style={{
              padding: 12,
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-subtle)",
              background: "var(--bg-surface)",
            }}
          >
            <div style={{ fontSize: "var(--text-sm)", fontWeight: 500, marginBottom: 8, lineHeight: 1.45 }}>{item.title}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              <select
                value={item.status}
                onChange={(e) => updateItem(item.id, { status: e.target.value })}
                disabled={saving}
                style={selectStyle}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                value={item.priority}
                onChange={(e) => updateItem(item.id, { priority: e.target.value })}
                disabled={saving}
                style={selectStyle}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <Badge variant={item.status === "done" ? "success" : item.status === "blocked" ? "error" : "neutral"} size="sm">
                {item.status}
              </Badge>
            </div>
            {(item.due || item.owner) && (
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginTop: 8 }}>
                {item.owner}
                {item.due ? ` · due ${item.due}` : ""}
              </div>
            )}
            {item.links?.length > 0 && (
              <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                {item.links.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: "var(--text-xs)", color: "var(--text-accent)" }}
                  >
                    {link.label} ↗
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <form onSubmit={addItem} style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`Add ${stream.label} task…`}
          style={inputStyle}
        />
        <button type="submit" disabled={saving} style={addBtnStyle}>
          Add
        </button>
      </form>
    </Card>
  );
}

const selectStyle = {
  fontSize: "var(--text-xs)",
  padding: "4px 8px",
  background: "var(--bg-base)",
  border: "1px solid var(--border-default)",
  borderRadius: "var(--radius-md)",
  color: "var(--text-primary)",
};

const inputStyle = {
  flex: 1,
  padding: "7px 10px",
  fontSize: "var(--text-sm)",
  background: "var(--bg-base)",
  border: "1px solid var(--border-default)",
  borderRadius: "var(--radius-lg)",
  color: "var(--text-primary)",
};

const addBtnStyle = {
  padding: "7px 12px",
  fontSize: "var(--text-sm)",
  background: "var(--bg-raised)",
  border: "1px solid var(--border-default)",
  borderRadius: "var(--radius-lg)",
  color: "var(--text-primary)",
  cursor: "pointer",
};

export function ActionPlanBoard({ initialData }) {
  const { data, save, saving, error } = useOpsData(initialData);

  async function updateStream(streamKey, items) {
    await save({
      workstreams: {
        [streamKey]: { ...data.workstreams[streamKey], items },
      },
    });
  }

  return (
    <div>
      {error && <p style={{ color: "var(--color-error)", fontSize: "var(--text-sm)", marginBottom: 12 }}>{error}</p>}
      <div className="hq-grid-2" style={{ alignItems: "start" }}>
        <StreamColumn
          streamKey="sooklyWebsite"
          stream={data.workstreams.sooklyWebsite}
          onUpdate={updateStream}
          saving={saving}
        />
        <StreamColumn
          streamKey="sooklyApp"
          stream={data.workstreams.sooklyApp}
          onUpdate={updateStream}
          saving={saving}
        />
      </div>
    </div>
  );
}
