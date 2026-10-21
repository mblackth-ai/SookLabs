import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { RETAINER_GOLDEN_RULE, SCORECARD_END, SCORECARD_START, renderRetainerScorecardMarkdown } from "./retainer-delivery.js";

/** Test-only: the contract markdown in docs/ must carry the Golden Rule and the scorecard block its module renders. */
export function assertContractDocument(snapshot) {
  if (process.env.RETAINER_SKIP_DOC_ASSERT === "1") return;
  const docPath = resolve(process.cwd(), snapshot.path);
  const doc = readFileSync(docPath, "utf8");
  if (!doc.includes(RETAINER_GOLDEN_RULE)) {
    throw new Error(`${snapshot.path} is missing the retainer Golden Rule verbatim`);
  }
  const start = doc.indexOf(SCORECARD_START);
  const end = doc.indexOf(SCORECARD_END);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`${snapshot.path} is missing the retainer scorecard markers`);
  }
  const actual = doc.slice(start + SCORECARD_START.length, end).trim();
  const expected = renderRetainerScorecardMarkdown(snapshot).trim();
  if (actual !== expected) {
    throw new Error(
      `${snapshot.path} scorecard block does not match its contract module. Regenerate the marked block from renderRetainerScorecardMarkdown().`
    );
  }
}
