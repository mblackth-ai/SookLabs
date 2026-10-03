"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "./Button";

const DISMISS_KEY = "hq-eight-front-dismissed-branches";
const MERGE_KEY = "hq-eight-front-merge-requests";

function readList(key) {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeList(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function RepoBranchLayer({ branches }) {
  const [dismissed, setDismissed] = useState([]);
  const [merges, setMerges] = useState([]);
  const [pending, setPending] = useState(null);
  const [notice, setNotice] = useState("");
  const [payloadText, setPayloadText] = useState("");
  const initial = useRef(null);

  useEffect(() => {
    initial.current = { dismissed: readList(DISMISS_KEY), merges: readList(MERGE_KEY) };
    setDismissed(initial.current.dismissed);
    setMerges(initial.current.merges);
  }, []);

  const visible = branches.filter((branch) => !dismissed.includes(branch.id));

  async function handoff(branch, intent) {
    const payload = intent === "visualize" ? branch.visualize : branch.examine;
    const text = JSON.stringify(payload, null, 2);
    setPayloadText(text);
    let copied = false;
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
    } catch {
      copied = false;
    }
    const url = process.env.NEXT_PUBLIC_HQ_GROK_URL || "";
    if (!url.startsWith("https://")) {
      setNotice(copied
        ? "Brief copied. No Grok URL is configured, so nothing was opened."
        : "Clipboard was blocked and no Grok URL is configured. The brief is shown below.");
      return;
    }
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (opened) {
      setNotice(copied
        ? "Grok URL opened in a new tab. The brief is copied. This page did not send it to a model."
        : "Grok URL opened. Clipboard was blocked, so use the brief shown below.");
      return;
    }
    setNotice(copied
      ? "The browser blocked the new tab. The brief is copied."
      : "The browser blocked the new tab and the clipboard. The brief is shown below.");
  }

  function confirmMerge(branch) {
    const next = [
      ...merges.filter((item) => item.id !== branch.id),
      { id: branch.id, prUrl: branch.prUrl, at: new Date().toISOString() },
    ];
    writeList(MERGE_KEY, next);
    setMerges(next);
    setPending(null);
    setNotice(`Merge request recorded for ${branch.branch}. GitHub was not called.`);
  }

  function dismiss(branch) {
    const next = [...dismissed, branch.id];
    writeList(DISMISS_KEY, next);
    setDismissed(next);
    setPending(null);
    setNotice(`${branch.branch} is hidden on this browser. The remote branch was not deleted.`);
  }

  if (!branches.length) return null;

  return (
    <div className="hq-branch-layer">
      <div className="hq-section-label">Repo branches</div>
      {notice ? <p className="hq-text-sm-secondary">{notice}</p> : null}
      {visible.length === 0 ? (
        <p className="hq-text-sm-secondary">Every recorded branch card is hidden on this browser. Remote branches were not deleted.</p>
      ) : null}
      {visible.map((branch) => {
        const merge = merges.find((item) => item.id === branch.id) || null;
        return (
          <article key={branch.id} className="hq-branch-card">
            <div className="hq-card-title">{branch.repo}</div>
            <p className="hq-text-sm-secondary">{branch.branch}</p>
            <p className="hq-text-xs-muted">
              PR #{branch.prNumber} · {branch.state} · {branch.sha.slice(0, 12)}
            </p>
            <p className="hq-text-sm-secondary">{branch.summary}</p>
            {branch.openGates.length ? (
              <p className="hq-text-xs-muted">Open gates: {branch.openGates.join("; ")}</p>
            ) : null}
            <div className="hq-branch-actions">
              <Button size="sm" variant="secondary" onClick={() => handoff(branch, "examine")}>Examine</Button>
              <Button size="sm" variant="secondary" onClick={() => handoff(branch, "visualize")}>Visualize</Button>
              <Button size="sm" variant="ghost" onClick={() => setPending({ type: "merge", id: branch.id })}>Merge</Button>
              <Button size="sm" variant="ghost" onClick={() => setPending({ type: "dismiss", id: branch.id })}>Remove</Button>
              <Button size="sm" variant="ghost" href={branch.prUrl} external>Open PR</Button>
            </div>
            {merge ? (
              <p className="hq-text-xs-muted">
                Approval recorded in this browser at {merge.at}. Not merged.{" "}
                <a href={merge.prUrl}>Open the PR</a>
              </p>
            ) : null}
            {pending?.id === branch.id && pending.type === "merge" ? (
              <div className="hq-branch-confirm">
                <p className="hq-text-sm-secondary">
                  This records a Mark-only request to merge {branch.branch} if it is worth taking. GitHub is not called. Nothing merges to main.
                </p>
                <div className="hq-branch-actions">
                  <Button size="sm" onClick={() => confirmMerge(branch)}>Record merge request</Button>
                  <Button size="sm" variant="ghost" onClick={() => setPending(null)}>Cancel</Button>
                </div>
              </div>
            ) : null}
            {pending?.id === branch.id && pending.type === "dismiss" ? (
              <div className="hq-branch-confirm">
                <p className="hq-text-sm-secondary">
                  Hide this card. The remote branch stays.
                </p>
                <div className="hq-branch-actions">
                  <Button size="sm" onClick={() => dismiss(branch)}>Hide card</Button>
                  <Button size="sm" variant="ghost" onClick={() => setPending({ type: "destroy", id: branch.id })}>Delete remote branch</Button>
                  <Button size="sm" variant="ghost" onClick={() => setPending(null)}>Cancel</Button>
                </div>
              </div>
            ) : null}
            {pending?.id === branch.id && pending.type === "destroy" ? (
              <div className="hq-branch-confirm">
                <p className="hq-text-sm-secondary">
                  This board will not delete {branch.branch}. No git command runs. Mark has to do that outside HQ.
                </p>
                <div className="hq-branch-actions">
                  <Button size="sm" onClick={() => dismiss(branch)}>Hide card and keep the remote</Button>
                  <Button size="sm" variant="ghost" onClick={() => setPending(null)}>Cancel</Button>
                </div>
              </div>
            ) : null}
          </article>
        );
      })}
      {payloadText ? <pre className="hq-branch-payload">{payloadText}</pre> : null}
    </div>
  );
}
