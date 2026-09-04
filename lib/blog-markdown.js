import { escapeHtml, publicHttpUrl } from "./resources";

function safeHref(raw) {
  const value = String(raw || "").trim();
  if (!value) return "";
  if (value.startsWith("/") || value.startsWith("#") || value.startsWith("mailto:")) {
    if (value.toLowerCase().startsWith("javascript:")) return "";
    return value;
  }
  return publicHttpUrl(value);
}

function inline(text) {
  const escaped = escapeHtml(text);
  return escaped
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, "$1<em>$2</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
      const safe = safeHref(href);
      if (!safe) return label;
      const external = /^https?:\/\//i.test(safe);
      const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : "";
      return `<a href="${escapeHtml(safe)}"${attrs}>${label}</a>`;
    });
}

function isTableSeparator(line) {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function splitRow(line) {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split("|").map((cell) => cell.trim());
}

function renderTable(rows) {
  if (rows.length < 2) return "";
  const head = splitRow(rows[0]);
  const body = rows.slice(2).map(splitRow);
  const thead = `<thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead>`;
  const tbody = `<tbody>${body
    .map((row) => `<tr>${row.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`)
    .join("")}</tbody>`;
  return `<div class="sl-blog-table-wrap"><table>${thead}${tbody}</table></div>`;
}

/**
 * Trusted markdown → HTML. Only our authored posts go through this.
 * @param {string} markdown
 */
export function markdownToHtml(markdown) {
  const source = String(markdown || "").replace(/\r\n/g, "\n").trim();
  if (!source) return "";
  const lines = source.split("\n");
  const html = [];
  let i = 0;
  let listType = null;

  function closeList() {
    if (listType) {
      html.push(listType === "ol" ? "</ol>" : "</ul>");
      listType = null;
    }
  }

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      closeList();
      i += 1;
      continue;
    }

    if (trimmed === "---" || trimmed === "***") {
      closeList();
      html.push("<hr />");
      i += 1;
      continue;
    }

    const heading = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      closeList();
      const level = heading[1].length;
      const id = slugifyHeading(heading[2]);
      html.push(`<h${level} id="${id}">${inline(heading[2])}</h${level}>`);
      i += 1;
      continue;
    }

    if (trimmed.startsWith("> ")) {
      closeList();
      const quote = [];
      while (i < lines.length && lines[i].trim().startsWith("> ")) {
        quote.push(lines[i].trim().replace(/^>\s?/, ""));
        i += 1;
      }
      html.push(`<blockquote><p>${inline(quote.join(" "))}</p></blockquote>`);
      continue;
    }

    if (trimmed.includes("|") && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      closeList();
      const rows = [trimmed, lines[i + 1].trim()];
      i += 2;
      while (i < lines.length && lines[i].includes("|") && lines[i].trim()) {
        rows.push(lines[i].trim());
        i += 1;
      }
      html.push(renderTable(rows));
      continue;
    }

    const ul = trimmed.match(/^[-*]\s+(.+)$/);
    const ol = trimmed.match(/^\d+\.\s+(.+)$/);
    if (ul || ol) {
      const nextType = ol ? "ol" : "ul";
      if (listType !== nextType) {
        closeList();
        html.push(nextType === "ol" ? "<ol>" : "<ul>");
        listType = nextType;
      }
      html.push(`<li>${inline((ul || ol)[1])}</li>`);
      i += 1;
      continue;
    }

    closeList();
    const para = [trimmed];
    i += 1;
    while (i < lines.length) {
      const next = lines[i].trim();
      if (
        !next ||
        next.startsWith("#") ||
        next.startsWith(">") ||
        next.startsWith("- ") ||
        next.startsWith("* ") ||
        /^\d+\.\s/.test(next) ||
        next.includes("|")
      ) {
        break;
      }
      para.push(next);
      i += 1;
    }
    html.push(`<p>${inline(para.join(" "))}</p>`);
  }

  closeList();
  return html.join("\n");
}

export function slugifyHeading(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

/**
 * Pull FAQ pairs from a ## FAQ section (### question, following paragraphs = answer).
 * @param {string} markdown
 */
export function extractFaq(markdown) {
  const source = String(markdown || "").replace(/\r\n/g, "\n");
  const faqStart = source.search(/^##\s+(FAQ|Frequently asked questions)\s*$/im);
  if (faqStart < 0) return [];
  const rest = source.slice(faqStart);
  const nextH2 = rest.search(/\n##\s+(?!FAQ|Frequently asked questions)/i);
  const section = nextH2 >= 0 ? rest.slice(0, nextH2) : rest;
  const chunks = section.split(/\n###\s+/).slice(1);
  const items = [];
  for (const chunk of chunks) {
    const lines = chunk.split("\n");
    const q = (lines[0] || "").trim();
    const a = lines
      .slice(1)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (q && a) items.push({ q, a });
  }
  return items;
}
