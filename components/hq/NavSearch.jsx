"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { icons } from "@/lib/hq/icons";
import { filterNavPages, navPages } from "@/lib/hq/nav";

const PAGES = navPages();
const MAX_RESULTS = 8;

/** Top-bar search: filters HQ pages from the nav client-side (no server search exists yet). */
export function NavSearch({ expanded = false, onExpandedChange }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const wrapRef = useRef(null);
  const baseId = useId();
  const listId = `${baseId}-results`;

  // Narrow screens: the field is hidden until the top bar expands it; focus it once it is visible.
  useEffect(() => {
    if (expanded) inputRef.current?.focus();
  }, [expanded]);

  const results = useMemo(() => filterNavPages(query, PAGES).slice(0, MAX_RESULTS), [query]);
  const showList = open && query.trim().length > 0;

  useEffect(() => {
    function onKey(e) {
      const t = e.target;
      const typing = t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
      if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        onExpandedChange?.(true);
        inputRef.current?.focus();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onExpandedChange?.(true);
        inputRef.current?.focus();
      }
    }
    function onPointer(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        onExpandedChange?.(false);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [onExpandedChange]);

  function go(page) {
    if (!page) return;
    setOpen(false);
    setQuery("");
    onExpandedChange?.(false);
    inputRef.current?.blur();
    router.push(page.href);
  }

  function onKeyDown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
    } else if (e.key === "Enter") {
      if (showList && results.length) {
        e.preventDefault();
        go(results[Math.min(active, results.length - 1)]);
      }
    } else if (e.key === "Escape") {
      if (query) setQuery("");
      else onExpandedChange?.(false);
      setOpen(false);
    }
  }

  const activeId = showList && results.length ? `${baseId}-opt-${Math.min(active, results.length - 1)}` : undefined;

  return (
    <div className="hq-search" ref={wrapRef}>
      <label htmlFor={`${baseId}-input`} className="hq-visually-hidden">
        Search HQ pages
      </label>
      <span className="hq-search-icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: icons.search }} />
      <input
        ref={inputRef}
        id={`${baseId}-input`}
        className="hq-search-input"
        type="search"
        placeholder="Search pages…"
        autoComplete="off"
        spellCheck={false}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showList}
        aria-controls={listId}
        aria-activedescendant={activeId}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />
      <kbd className="hq-search-kbd" aria-hidden="true">/</kbd>
      <div className="hq-search-pop" hidden={!showList}>
        <ul id={listId} role="listbox" aria-label="Matching pages" className="hq-search-list">
          {results.map((p, i) => (
            <li
              key={p.href}
              id={`${baseId}-opt-${i}`}
              role="option"
              aria-selected={i === active}
              className={`hq-search-option${i === active ? " hq-search-option--active" : ""}`}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => go(p)}
            >
              <span className="hq-search-option-label">{p.label}</span>
              {p.trail.length > 1 ? <span className="hq-search-option-trail">{p.trail.slice(0, -1).join(" › ")}</span> : null}
              {p.soon ? <span className="hq-sidebar-nav-badge hq-sidebar-nav-badge--soon">Soon</span> : null}
            </li>
          ))}
        </ul>
        {showList && results.length === 0 ? <p className="hq-search-empty">No HQ page matches “{query.trim()}”.</p> : null}
      </div>
      <span className="hq-visually-hidden" role="status" aria-live="polite">
        {showList ? `${results.length} page${results.length === 1 ? "" : "s"} found` : ""}
      </span>
    </div>
  );
}
