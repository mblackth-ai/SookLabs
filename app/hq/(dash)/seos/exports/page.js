"use client";

import { useState } from "react";
import { TopBar } from "@/components/hq/TopBar";
import { Card } from "@/components/hq/Card";
import { Badge } from "@/components/hq/Badge";
import { Button } from "@/components/hq/Button";
import { llmsTxtPreview } from "@/lib/hq/knowledge-mock";

export default function HqExportsPage() {
  const [copied, setCopied] = useState(false);

  async function copyPreview() {
    await navigator.clipboard.writeText(llmsTxtPreview);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <TopBar
        title="Exports"
        subtitle="llms.txt, Schema.org, knowledge.json — generated from Knowledge Base"
        actions={
          <Badge variant="warning" size="sm">
            Draft Export
          </Badge>
        }
      />
      <div className="hq-page-content">
        <Card padding="md">
          <div className="hq-card-header" style={{ marginBottom: "var(--space-3)" }}>
            <div className="hq-card-title">llms.txt preview</div>
            <Button variant="secondary" size="sm" onClick={copyPreview}>
              {copied ? "Copied" : "Copy preview"}
            </Button>
          </div>
          <pre
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--text-secondary)",
              background: "var(--bg-inset)",
              padding: "var(--space-3)",
              borderRadius: "var(--radius-md)",
              overflow: "auto",
              maxHeight: "320px",
              margin: 0,
              whiteSpace: "pre-wrap",
              fontFamily: "var(--font-mono, monospace)",
            }}
          >
            {llmsTxtPreview}
          </pre>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginTop: "var(--space-3)", marginBottom: 0 }}>
            Full exports with schema.json and knowledge.json available in the SEOS product Exports module.
          </p>
        </Card>
      </div>
    </div>
  );
}
