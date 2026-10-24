import "server-only";
import { fetchWithTimeout, seosBaseUrl } from "./read-timeouts.js";

const timedFetch = fetchWithTimeout(fetch);

function authorityConfig() {
  const baseUrl = seosBaseUrl();
  const token = process.env.SEOS_HQ_API_TOKEN?.trim();
  return {
    url: `${baseUrl.replace(/\/$/, "")}/api/authority/hq-summary`,
    token,
  };
}

export async function readAuthoritySummary() {
  const { url, token } = authorityConfig();
  if (!token || token.startsWith("change-me")) {
    return {
      ok: false,
      configured: false,
      error: "SEOS_HQ_API_TOKEN is not configured.",
      data: { generatedAt: null, workspaces: [] },
    };
  }

  try {
    // Read only: gives up after ~3s. The approval PATCH below keeps its own timing.
    const response = await timedFetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const payload = await response.json();
    if (!response.ok) {
      return { ok: false, configured: true, error: payload.error || "SEOS authority API failed", data: { generatedAt: null, workspaces: [] } };
    }
    return { ok: true, configured: true, data: payload.data };
  } catch (error) {
    return {
      ok: false,
      configured: true,
      error: error instanceof Error ? error.message : "SEOS authority API unavailable",
      data: { generatedAt: null, workspaces: [] },
    };
  }
}

export async function decideAuthorityApproval(body) {
  const { url, token } = authorityConfig();
  if (!token || token.startsWith("change-me")) throw new Error("SEOS_HQ_API_TOKEN is not configured");
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "Authority approval update failed");
  return payload.data;
}
