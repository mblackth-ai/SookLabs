/** Normalize SEOS in-app paths (works on seos.sooklabs.com subdomain rewrites). */
export function seosPath(path) {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (clean.startsWith("/seos")) return clean;
  return `/seos${clean === "/" ? "" : clean}`;
}

export function commandCenterProjectHref(projectId) {
  return seosPath(`/command-center/${projectId}`);
}
