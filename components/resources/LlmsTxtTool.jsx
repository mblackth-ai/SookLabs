"use client";

import { useMemo, useState } from "react";
import { CopyEmbed } from "@/components/site/CopyEmbed";
import { ShareBar } from "@/components/site/ShareBar";
import { resourcesShareUrl } from "@/lib/resources";
import { CONTACT_EMAIL, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";
import { Field, ToolCard, checkboxRowStyle, inputStyle } from "./ToolCard";

const CHECKS = [
  {
    id: "llms",
    label: "Public /llms.txt (or planned) at the site root",
  },
  {
    id: "privacy",
    label: "Public Privacy Policy page",
  },
  {
    id: "terms",
    label: "Public Terms of Use page",
  },
  {
    id: "products",
    label: "Clear product or service pages a model can summarise",
  },
  {
    id: "contact",
    label: "Obvious contact path (email or form)",
  },
];

function normaliseSiteUrl(raw) {
  const trimmed = (raw || "").trim();
  if (!trimmed) return SITE_URL;
  if (/^https?:\/\//i.test(trimmed)) return trimmed.replace(/\/$/, "");
  return `https://${trimmed.replace(/\/$/, "")}`;
}

function buildStarter({ siteUrl, productName, summary, contact }) {
  const name = productName.trim() || SITE_NAME;
  const tag = summary.trim() || SITE_TAGLINE;
  const mail = contact.trim() || CONTACT_EMAIL;
  const base = siteUrl;

  return `# ${name}

> ${tag}

Canonical site: ${base}
Contact: ${mail}

## Public pages

- Home: ${base}/
- Privacy: ${base}/privacy
- Terms of Use: ${base}/terms

## Notes

- Keep this file short, factual, and aligned with visible page copy.
- Prefer linking real public URLs over claims models cannot verify.
- Example reference: ${SITE_URL}/llms.txt
`;
}

export function LlmsTxtTool() {
  const [siteUrl, setSiteUrl] = useState("");
  const [productName, setProductName] = useState("");
  const [summary, setSummary] = useState("");
  const [contact, setContact] = useState("");
  const [done, setDone] = useState({});

  const resolvedUrl = useMemo(() => normaliseSiteUrl(siteUrl), [siteUrl]);
  const draft = useMemo(
    () =>
      buildStarter({
        siteUrl: resolvedUrl,
        productName,
        summary,
        contact,
      }),
    [resolvedUrl, productName, summary, contact]
  );

  const checkedCount = CHECKS.filter((c) => done[c.id]).length;

  function toggle(id) {
    setDone((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <ToolCard
      id="llms-txt"
      title="llms.txt readiness"
      badge="On-page tool"
      summary="Draft a copy-ready llms.txt starter and mark a simple public readiness checklist. No live crawl — you verify what you publish."
      footer={
        <ShareBar
          url={resourcesShareUrl()}
          title="llms.txt readiness — SookLabs Resources"
          text="Draft a site llms.txt starter and readiness checklist."
        />
      }
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 14,
          marginBottom: 22,
        }}
      >
        <Field label="Site URL" hint={`Defaults to ${SITE_URL.replace(/^https?:\/\//, "")}`}>
          <input
            style={inputStyle}
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            placeholder={SITE_URL}
            inputMode="url"
            autoComplete="url"
          />
        </Field>
        <Field label="Product / brand name">
          <input
            style={inputStyle}
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder={SITE_NAME}
          />
        </Field>
        <Field label="One-line summary">
          <input
            style={inputStyle}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder={SITE_TAGLINE}
          />
        </Field>
        <Field label="Contact">
          <input
            style={inputStyle}
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder={CONTACT_EMAIL}
          />
        </Field>
      </div>

      <div style={{ marginBottom: 22 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 12,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--text-faint)",
            }}
          >
            Readiness checklist
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--cyan-400)" }}>
            {checkedCount}/{CHECKS.length} marked
          </span>
        </div>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 10 }}>
          {CHECKS.map((item) => (
            <li key={item.id}>
              <label style={checkboxRowStyle}>
                <input
                  type="checkbox"
                  checked={!!done[item.id]}
                  onChange={() => toggle(item.id)}
                  style={{ marginTop: 3 }}
                />
                <span>{item.label}</span>
              </label>
            </li>
          ))}
        </ul>
        <p
          style={{
            margin: "14px 0 0",
            fontFamily: "var(--font-body)",
            fontSize: 13,
            color: "var(--text-faint)",
          }}
        >
          Live example:{" "}
          <a
            href={`${SITE_URL}/llms.txt`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--cyan-400)" }}
          >
            {SITE_URL.replace(/^https?:\/\//, "")}/llms.txt
          </a>
        </p>
      </div>

      <CopyEmbed markdown={draft} plain={draft} height={220} label="Copy starter" />
    </ToolCard>
  );
}
