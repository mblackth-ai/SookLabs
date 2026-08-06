"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CopyEmbed } from "@/components/site/CopyEmbed";
import { ShareBar } from "@/components/site/ShareBar";
import { resourcesShareUrl } from "@/lib/resources";
import { ToolCard, checkboxRowStyle } from "./ToolCard";

const ITEMS = [
  {
    id: "entity",
    label: "Clear business / product name on the homepage (same wording elsewhere).",
  },
  {
    id: "answer",
    label: "One short “what we do” paragraph a model can quote without guessing.",
  },
  {
    id: "faq",
    label: "Public FAQ or Q&A that matches real customer questions.",
  },
  {
    id: "evidence",
    label: "Evidence pages (docs, pricing, policies) that corroborate claims.",
  },
  {
    id: "citations",
    label: "Stable URLs and titles suitable for citation in AI answers.",
  },
  {
    id: "llms",
    label: "Machine-readable helpers (e.g. llms.txt) aligned with visible copy.",
  },
];

function toMarkdown(done) {
  const lines = [
    "# GEO / AI-answer checklist",
    "",
    "Self-checked operator list (not an automated crawl).",
    "",
  ];
  for (const item of ITEMS) {
    lines.push(`- [${done[item.id] ? "x" : " "}] ${item.label}`);
  }
  lines.push("", `Audit CTA: https://sooklabs.com/audit`);
  return lines.join("\n");
}

export function GeoChecklistTool() {
  const [done, setDone] = useState({});
  const md = useMemo(() => toMarkdown(done), [done]);
  const checked = ITEMS.filter((i) => done[i.id]).length;

  return (
    <ToolCard
      id="geo-checklist"
      title="GEO / AI-answer checklist"
      badge="On-page tool"
      summary="Mark the signals answer engines need. Local checklist only — use the free GEO audit when you want a human-led read."
      footer={
        <ShareBar
          url={resourcesShareUrl()}
          title="GEO checklist — SookLabs Resources"
          text="Operator checklist for AI-answer visibility."
        />
      }
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 12,
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--cyan-400)" }}>
          {checked}/{ITEMS.length} marked
        </span>
        <Link
          href="/audit"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 14,
            fontWeight: 600,
            color: "var(--cyan-400)",
            textDecoration: "none",
          }}
        >
          Request a free GEO audit →
        </Link>
      </div>
      <ul style={{ listStyle: "none", margin: "0 0 20px", padding: 0, display: "grid", gap: 10 }}>
        {ITEMS.map((item) => (
          <li key={item.id}>
            <label style={checkboxRowStyle}>
              <input
                type="checkbox"
                checked={!!done[item.id]}
                onChange={() => setDone((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                style={{ marginTop: 3 }}
              />
              <span>{item.label}</span>
            </label>
          </li>
        ))}
      </ul>
      <CopyEmbed markdown={md} plain={md} height={200} label="Copy checklist" />
    </ToolCard>
  );
}
