"use client";

import { useState } from "react";
import { useOpsData } from "./useOpsData";
import { Card } from "./Card";
import { Button } from "./Button";
import { newId } from "@/lib/hq/ops-shared";

const STATUSES = ["todo", "doing", "blocked", "done"];
const PRIORITIES = ["P0", "P1", "P2"];

function StreamColumn({ streamKey, stream, idPrefix, onUpdate, onPromote, saving, openPriorityCount }) {
  const [draft, setDraft] = useState("");

  async function updateItem(itemId, patch) {
    const items = stream.items.map((item) => (item.id === itemId ? { ...item, ...patch } : item));
    await onUpdate(streamKey, items);
  }

  async function removeItem(itemId) {
    await onUpdate(
      streamKey,
      stream.items.filter((item) => item.id !== itemId)
    );
  }

  async function addItem(e) {
    e.preventDefault();
    const title = draft.trim();
    if (!title) return;
    const items = [
      ...stream.items,
      {
        id: newId(idPrefix || streamKey.slice(0, 2)),
        title,
        status: "todo",
        priority: "P1",
        owner: "Mark",
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
        {(stream.items || []).map((item) => (
          <div key={item.id} className="hq-board-card">
            <input
              className="hq-board-title-input"
              value={item.title}
              disabled={saving}
              onChange={(e) => updateItem(item.id, { title: e.target.value })}
            />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              <select
                value={item.status}
                onChange={(e) => updateItem(item.id, { status: e.target.value })}
                disabled={saving}
                style={selectStyle}
                aria-label="Status"
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
                aria-label="Priority"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <input
                value={item.owner || ""}
                onChange={(e) => updateItem(item.id, { owner: e.target.value })}
                disabled={saving}
                placeholder="Owner"
                style={{ ...selectStyle, width: 72 }}
                aria-label="Owner"
              />
              <input
                type="date"
                value={item.due || ""}
                onChange={(e) => updateItem(item.id, { due: e.target.value })}
                disabled={saving}
                style={selectStyle}
                aria-label="Due"
              />
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
              <Button
                variant="ghost"
                size="sm"
                disabled={saving || openPriorityCount >= 3 || item.status === "done"}
                onClick={() => onPromote(item)}
                title={openPriorityCount >= 3 ? "Already 3 open priorities" : "Add to today’s priorities"}
              >
                → Today
              </Button>
              <Button variant="ghost" size="sm" disabled={saving} onClick={() => removeItem(item.id)}>
                Delete
              </Button>
            </div>
            {item.links?.length > 0 && (
              <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                {item.links.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target={link.url.startsWith("http") ? "_blank" : undefined}
                    rel={link.url.startsWith("http") ? "noreferrer" : undefined}
                    style={{ fontSize: "var(--text-xs)", color: "var(--text-accent)" }}
                  >
                    {link.label} {link.url.startsWith("http") ? "↗" : "→"}
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
        <Button type="submit" variant="secondary" size="sm" disabled={saving}>
          Add
        </Button>
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

const ID_PREFIX = {
  sooklyWebsite: "sw",
  sooklyApp: "sa",
  seosSocial: "ss",
  roastMyOpSec: "rm",
  community: "cm",
  personal: "pe",
};

/**
 * @param {{ initialData: object, streamKeys: string[], columns?: 1|2|3 }} props
 */
export function ActionPlanBoard({ initialData, streamKeys, columns = 2 }) {
  const { data, save, saving, error } = useOpsData(initialData);
  const keys = streamKeys || ["sooklyWebsite", "sooklyApp"];
  const openPriorityCount = (data.todayPriorities || []).filter((p) => !p.done).length;

  async function updateStream(streamKey, items) {
    const existing = data.workstreams[streamKey] || {};
    await save({
      workstreams: {
        [streamKey]: { ...existing, items },
      },
    });
  }

  async function promote(item) {
    if (openPriorityCount >= 3) return;
    const todayPriorities = [
      ...(data.todayPriorities || []),
      { id: newId("tp"), title: item.title, done: false, stream: item.priority || "board" },
    ];
    await save({ todayPriorities });
  }

  const gridClass = columns >= 3 ? "hq-grid-3" : columns === 1 ? "" : "hq-grid-2";

  return (
    <div>
      {error && <p style={{ color: "var(--color-error)", fontSize: "var(--text-sm)", marginBottom: 12 }}>{error}</p>}
      <div
        className={gridClass}
        style={{ alignItems: "start", display: columns === 1 ? "grid" : undefined, gap: columns === 1 ? 16 : undefined }}
      >
        {keys.map((streamKey) => {
          const stream = data.workstreams?.[streamKey];
          if (!stream) return null;
          return (
            <StreamColumn
              key={streamKey}
              streamKey={streamKey}
              stream={stream}
              idPrefix={ID_PREFIX[streamKey] || "ws"}
              onUpdate={updateStream}
              onPromote={promote}
              saving={saving}
              openPriorityCount={openPriorityCount}
            />
          );
        })}
      </div>
    </div>
  );
}
