#!/usr/bin/env node
/**
 * Room client for any agent seat. Uses only that seat's own connection.
 *
 *   export HQ_ROOM_CONNECTION=...            # this seat's HQ_ROOM_CONNECTION_<SEAT> value
 *   node scripts/hq-room.mjs read [--after ISO] [--limit N]
 *   node scripts/hq-room.mjs post chat "Picked up the schema work."
 *   node scripts/hq-room.mjs post evidence "Smoke passed" --ref ci:https://github.com/o/r/actions/runs/1
 *   node scripts/hq-room.mjs post baton "Ready to land" --to cursor --status todo --task "..." --next "..."
 *   node scripts/hq-room.mjs board [--md]
 *   node scripts/hq-room.mjs prs
 *   node scripts/hq-room.mjs inbox                     # dispatches waiting for this seat
 *   node scripts/hq-room.mjs claim <dispatchId>        # queued → thinking
 *   node scripts/hq-room.mjs reply <dispatchId> "answer"
 *   node scripts/hq-room.mjs fail <dispatchId> "reason"
 *   node scripts/hq-room.mjs listen [--every 20]       # poll the inbox, print new dispatches as JSON lines
 *
 * HQ_ROOM_URL defaults to https://hq.sooklabs.com (use http://localhost:3008 locally).
 * The server stamps the author from the connection; there is no --as flag.
 */

const base = (process.env.HQ_ROOM_URL || "https://hq.sooklabs.com").replace(/\/$/, "");
const connection = (process.env.HQ_ROOM_CONNECTION || "").trim();
const [command, ...rest] = process.argv.slice(2);

function flags(argv) {
  const out = { _: [], ref: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) {
      out._.push(arg);
      continue;
    }
    const key = arg.slice(2);
    const next = argv[i + 1];
    let value = true;
    if (next !== undefined && !next.startsWith("--")) {
      value = next;
      i += 1;
    }
    if (key === "ref") out.ref.push(value);
    else out[key] = value;
  }
  return out;
}

async function call(path, init = {}) {
  if (!connection) {
    console.error("Set HQ_ROOM_CONNECTION to this seat's connection (never paste it into a chat).");
    process.exit(2);
  }
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: { accept: "application/json", "x-hq-room-connection": connection, ...(init.headers || {}) },
  });
  const type = res.headers.get("content-type") || "";
  const body = type.includes("json") ? await res.json() : await res.text();
  if (!res.ok || body?.ok === false) {
    console.error(`${res.status} ${body?.error || body}`);
    process.exit(1);
  }
  return body;
}

const line = (m) =>
  `${m.createdAt}  ${m.seat.padEnd(8)} ${m.display.padEnd(10)} ${m.body}` +
  (m.baton?.to ? `  → ${m.baton.to} [${m.baton.status}] ${m.baton.task}` : "") +
  (m.refs?.length ? `  refs: ${m.refs.map((r) => `${r.type}:${r.ref}${r.resolves === true ? " ✓" : r.resolves === false ? " ✗" : ""}`).join(", ")}` : "");

const opts = flags(rest);

if (command === "read") {
  const q = new URLSearchParams({ channel: "room" });
  if (opts.after) q.set("after", opts.after);
  if (opts.limit) q.set("limit", opts.limit);
  const { messages } = await call(`/hq/api/room/messages?${q}`);
  for (const m of messages) console.log(line(m));
  if (!messages.length) console.log("(no messages)");
} else if (command === "post") {
  const [kind, ...words] = opts._;
  const body = words.join(" ").trim();
  if (!kind || !body) {
    console.error('Usage: post <chat|baton|evidence|status> "text" [--ref type:value] [--to seat --status s --task t --next n]');
    process.exit(2);
  }
  const refs = opts.ref.map((value) => {
    const i = String(value).indexOf(":");
    const type = String(value).slice(0, i);
    const ref = String(value).slice(i + 1);
    return { type, ref, url: /^https?:\/\//.test(ref) ? ref : "" };
  });
  const baton = kind === "baton" ? { to: opts.to || "", status: opts.status || "", task: opts.task || "", next: opts.next || "" } : undefined;
  const { message, deduped } = await call("/hq/api/room/messages", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ channel: "room", kind, body, refs, baton }),
  });
  console.log(`${deduped ? "duplicate, not posted again" : "posted"} ${message.id}`);
  console.log(line(message));
} else if (command === "board") {
  if (opts.md) console.log(await call("/hq/api/room/board?format=md"));
  else for (const row of (await call("/hq/api/room/board")).board) console.log(`${row.at}  ${row.seat.padEnd(8)} ${row.state.padEnd(10)} ${row.task}`);
} else if (command === "prs") {
  const { prs, freshness, reconciledAt, error } = await call("/hq/api/room/prs");
  console.log(`PR field: ${freshness}${reconciledAt ? ` (checked ${reconciledAt})` : ""}${error ? ` — ${error}` : ""}`);
  for (const pr of prs) console.log(`${pr.repo}#${pr.number}  ${pr.merged ? "merged" : pr.draft ? "draft" : pr.state}  CI ${pr.ciState}  ${pr.title}`);
} else if (command === "inbox") {
  const { dispatches } = await call("/hq/api/room/dispatches");
  for (const d of dispatches) console.log(`${d.id}  ${d.status.padEnd(9)} from ${d.envelope?.from?.callsign || d.originSeatId}: ${d.envelope?.request || ""}`);
  if (!dispatches.length) console.log("(inbox empty)");
} else if (command === "claim" || command === "fail") {
  const [id, ...why] = opts._;
  if (!id) {
    console.error(`Usage: ${command} <dispatchId>${command === "fail" ? ' "reason"' : ""}`);
    process.exit(2);
  }
  const { dispatch } = await call(`/hq/api/room/dispatches/${encodeURIComponent(id)}/${command}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ reason: why.join(" ") }),
  });
  console.log(`${dispatch.id} → ${dispatch.status}`);
} else if (command === "reply") {
  const [dispatchId, ...words] = opts._;
  const body = words.join(" ").trim();
  if (!dispatchId || !body) {
    console.error('Usage: reply <dispatchId> "answer"');
    process.exit(2);
  }
  const { message, deduped } = await call("/hq/api/room/messages", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ channel: "room", kind: "chat", body, dispatchId }),
  });
  console.log(`${deduped ? "already answered" : "replied"} ${message.id} (thread ${message.threadId})`);
} else if (command === "listen") {
  const every = Math.max(5, Number(opts.every) || 20) * 1000;
  const seen = new Set();
  console.error(`Listening for dispatches every ${every / 1000}s. Ctrl+C to stop.`);
  for (;;) {
    const { dispatches } = await call("/hq/api/room/dispatches");
    for (const d of dispatches) {
      if (seen.has(d.id) || d.status !== "queued") continue;
      seen.add(d.id);
      console.log(JSON.stringify(d.envelope));
    }
    await new Promise((resolve) => setTimeout(resolve, every));
  }
} else {
  console.error("Commands: read | post | board | prs | inbox | claim | reply | fail | listen");
  process.exit(2);
}
