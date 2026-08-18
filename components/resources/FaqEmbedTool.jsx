"use client";

import { useMemo, useState } from "react";
import { CopyEmbed } from "@/components/site/CopyEmbed";
import { ShareBar } from "@/components/site/ShareBar";
import { escapeHtml, publicHttpUrl, resourcesShareUrl } from "@/lib/resources";
import { Field, ToolCard, inputStyle } from "./ToolCard";

function buildHtml(question, answer, sourceUrl) {
  const q = escapeHtml(question.trim() || "Your question");
  const a = escapeHtml(answer.trim() || "Your short answer.");
  const source = publicHttpUrl(sourceUrl);
  const cite = source
    ? `\n  <p class="faq-source"><a href="${escapeHtml(source)}">Source</a></p>`
    : "";
  return `<section class="faq-item" itemscope itemtype="https://schema.org/Question">
  <h3 itemprop="name">${q}</h3>
  <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
    <p itemprop="text">${a}</p>
  </div>${cite}
</section>`;
}

function buildMarkdown(question, answer, sourceUrl) {
  const q = question.trim() || "Your question";
  const a = answer.trim() || "Your short answer.";
  const source = publicHttpUrl(sourceUrl);
  return [`### ${q}`, "", a, source ? `\nSource: ${source}` : ""].filter(Boolean).join("\n");
}

export function FaqEmbedTool() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const safeSource = publicHttpUrl(sourceUrl);
  const sourceHint = sourceUrl.trim() && !safeSource ? "Only http(s) URLs are included in the embed." : "Link to the page that owns this answer.";

  const html = useMemo(
    () => buildHtml(question, answer, sourceUrl),
    [question, answer, sourceUrl]
  );
  const markdown = useMemo(
    () => buildMarkdown(question, answer, sourceUrl),
    [question, answer, sourceUrl]
  );

  return (
    <ToolCard
      id="faq-embed"
      title="FAQ / answer embed"
      badge="On-page tool"
      summary="Paste helper for one Q&A block. If you run SEOS, keep business truth in the Knowledge Base—this is not a second source of truth."
      footer={
        <ShareBar
          url={resourcesShareUrl()}
          title="FAQ embed — SookLabs Resources"
          text="Copy a single FAQ answer as HTML or Markdown."
        />
      }
    >
      <div style={{ display: "grid", gap: 14, marginBottom: 18 }}>
        <Field label="Question">
          <input
            style={inputStyle}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What do you offer?"
          />
        </Field>
        <Field label="Short answer">
          <textarea
            style={{ ...inputStyle, minHeight: 96, resize: "vertical" }}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="One or two sentences a visitor or model can reuse."
          />
        </Field>
        <Field label="Source URL (optional)" hint={sourceHint}>
          <input
            style={inputStyle}
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://example.com/faq"
            inputMode="url"
          />
        </Field>
      </div>
      <p
        style={{
          margin: "0 0 14px",
          fontFamily: "var(--font-body)",
          fontSize: 13,
          color: "var(--text-faint)",
          lineHeight: 1.5,
        }}
      >
        Markup is deliberately simple (Question/Answer microdata). It is not a full JSON-LD schema
        factory.
      </p>
      <CopyEmbed html={html} markdown={markdown} plain={markdown} height={210} label="Copy embed" />
    </ToolCard>
  );
}
