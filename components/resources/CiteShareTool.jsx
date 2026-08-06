"use client";

import { useMemo, useState } from "react";
import { CopyEmbed } from "@/components/site/CopyEmbed";
import { ShareBar } from "@/components/site/ShareBar";
import { RESOURCES_PAGE, resourcesShareUrl } from "@/lib/resources";
import { absoluteUrl } from "@/lib/site";
import { Field, ToolCard, inputStyle } from "./ToolCard";

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normaliseUrl(raw, fallback) {
  const trimmed = (raw || "").trim();
  if (!trimmed) return fallback;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function CiteShareTool() {
  const defaultUrl = resourcesShareUrl();
  const [title, setTitle] = useState(RESOURCES_PAGE.title);
  const [url, setUrl] = useState("");

  const resolved = useMemo(
    () => normaliseUrl(url, defaultUrl),
    [url, defaultUrl]
  );
  const resolvedTitle = title.trim() || RESOURCES_PAGE.name;

  const markdown = `[${resolvedTitle}](${resolved})`;
  const html = `<a href="${escapeHtml(resolved)}">${escapeHtml(resolvedTitle)}</a>`;
  const plain = `${resolvedTitle}\n${resolved}`;

  return (
    <ToolCard
      id="cite-share"
      title="Cite / share this page"
      badge="On-page tool"
      summary="Build a citation and share any public URL. Defaults to this Resources hub."
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 14,
          marginBottom: 18,
        }}
      >
        <Field label="Title">
          <input
            style={inputStyle}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={RESOURCES_PAGE.title}
          />
        </Field>
        <Field label="URL" hint={`Defaults to ${absoluteUrl(RESOURCES_PAGE.path)}`}>
          <input
            style={inputStyle}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={defaultUrl}
            inputMode="url"
          />
        </Field>
      </div>

      <div style={{ marginBottom: 16 }}>
        <ShareBar
          url={resolved}
          title={resolvedTitle}
          text={`Worth a look: ${resolvedTitle}`}
          label="Share"
        />
      </div>

      <CopyEmbed html={html} markdown={markdown} plain={plain} height={120} label="Copy citation" />
    </ToolCard>
  );
}
