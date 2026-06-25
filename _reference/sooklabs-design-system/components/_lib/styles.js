// Shared helper: inject a component's CSS rules once per document.
// Lets self-contained components use real :hover / :active / :focus-visible
// states while still shipping only token CSS to consumers.
export function injectOnce(id, css) {
  if (typeof document === "undefined") return;
  if (document.getElementById(id)) return;
  const el = document.createElement("style");
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}
