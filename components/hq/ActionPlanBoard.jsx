"use client";

import { useEffect, useState } from "react";
import { useOpsData } from "./useOpsData";
import { Card } from "./Card";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { newId } from "@/lib/hq/ops-shared";

const STATUSES = ["todo", "doing", "blocked", "done"];
const PRIORITIES = ["P0", "P1", "P2"];

function StreamColumn({
  streamKey,
  stream,
  idPrefix,
  onUpdate,
  onPromote,
  saving,
  openPriorityCount,
  hideDone,
}) {
  const [draft, setDraft] = useState("");
  const [titleDrafts, setTitleDrafts] = useState({});

  const visibleItems = (stream.items || []).filter((item) => !(hideDone && item.status === "done"));
  const doneCount = (stream.items || []).filter((item) => item.status === "done").length;

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

  function titleValue(item) {
    return titleDrafts[item.id] !== undefined ? titleDrafts[item.id] : item.title;
  }

  return (
    <Card padding="md" style={{ height: "100%" }}>
      <div className="hq-card-header" style={{ marginBottom: "var(--space-4)" }}>
        <div className="hq-card-title">{stream.label}</div>
        {doneCount > 0 ? (
          <Badge variant="outline" size="sm">
            {hideDone ? `${doneCount} done hidden` : `${doneCount} done`}
          </Badge>
        ) : null}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {visibleItems.map((item) => (
          <div key={item.id} id={`item-${item.id}`} className="hq-board-card">
            <input
              className="hq-board-title-input"
              value={titleValue(item)}
              disabled={saving}
              onChange={(e) => setTitleDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))}
              onBlur={() => {
                const next = titleDrafts[item.id];
                if (next === undefined || next === item.title) return;
                setTitleDrafts((prev) => {
                  const copy = { ...prev };
                  delete copy[item.id];
                  return copy;
                });
                updateItem(item.id, { title: next });
              }}
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
                defaultValue={item.owner || ""}
                key={`${item.id}-owner-${item.owner || ""}`}
                onBlur={(e) => {
                  if (e.target.value === (item.owner || "")) return;
                  updateItem(item.id, { owner: e.target.value });
                }}
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
                onClick={() => onPromote(item, streamKey)}
                title={openPriorityCount >= 3 ? "Already 3 open priorities" : "Add to today’s priorities"}
              >
                → Today
              </Button>
              <Button variant="ghost" size="sm" disabled={saving} onClick={() => removeItem(item.id)}>
                Delete
              </Button>
            </div>
            {item.notes ? (
              <p style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", margin: "8px 0 0", lineHeight: 1.45 }}>
                {item.notes}
              </p>
            ) : null}
            {item.links?.length > 0 && (
              <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                {item.links.map((link) => (
                  <a
                    key={`${link.url}-${link.label}`}
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
        {!visibleItems.length ? (
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", margin: 0 }}>
            {hideDone && doneCount ? "All open items done — toggle Show done to review." : "No tasks yet."}
          </p>
        ) : null}
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

const HIDE_DONE_KEY = "hq-board-hide-done";

/**
 * @param {{ initialData: object, streamKeys: string[], columns?: 1|2|3 }} props
 */
export function ActionPlanBoard({ initialData, streamKeys, columns = 2 }) {
  const { data, save, saving, error } = useOpsData(initialData);
  const keys = streamKeys || ["sooklyWebsite", "sooklyApp"];
  const openPriorityCount = (data.todayPriorities || []).filter((p) => !p.done).length;
  const [hideDone, setHideDone] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(HIDE_DONE_KEY);
      if (saved === "0") setHideDone(false);
      else if (saved === "1") setHideDone(true);
    } catch {
      /* ignore */
    }
  }, []);

  function toggleHideDone() {
    setHideDone((v) => {
      const next = !v;
      try {
        localStorage.setItem(HIDE_DONE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const focus = params.get("focus");
    if (!focus) return;
    const el = document.getElementById(`item-${focus}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("hq-board-card--focus");
      setTimeout(() => el.classList.remove("hq-board-card--focus"), 2400);
    }
  }, [data.updatedAt]);

  async function updateStream(streamKey, items) {
    const existing = data.workstreams[streamKey] || {};
    return save({
      workstreams: {
        [streamKey]: { ...existing, items },
      },
    });
  }

  async function promote(item, streamKey) {
    if (openPriorityCount >= 3) return;
    const boardHref = data.workstreams?.[streamKey]?.boardHref || "";
    const todayPriorities = [
      ...(data.todayPriorities || []),
      {
        id: newId("tp"),
        title: item.title,
        done: false,
        stream: streamKey || "board",
        sourceItemId: item.id,
        boardHref: boardHref ? `${boardHref}?focus=${encodeURIComponent(item.id)}` : "",
      },
    ];
    await save({ todayPriorities });
  }

  const gridClass = columns >= 3 ? "hq-grid-3" : columns === 1 ? "" : "hq-grid-2";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
        <Button variant="ghost" size="sm" onClick={toggleHideDone}>
          {hideDone ? "Show done" : "Hide done"}
        </Button>
      </div>
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
              hideDone={hideDone}
            />
          );
        })}
      </div>
    </div>
  );
}
