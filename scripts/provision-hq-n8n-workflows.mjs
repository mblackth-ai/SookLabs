/**
 * Provision HQ SookLabs n8n workflows on hooks.sookly.co via Public API.
 * Usage: node scripts/provision-hq-n8n-workflows.mjs
 * Requires: N8N_API_KEY env or ../tmp-hq-n8n-api-key.json
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const BASE = process.env.N8N_BASE_URL || "https://hooks.sookly.co";
const HQ_BASE = process.env.HQ_PUBLIC_BASE_URL || "https://hq.sooklabs.com";

function loadApiKey() {
  if (process.env.N8N_API_KEY?.trim()) return process.env.N8N_API_KEY.trim();
  const candidates = [
    join(ROOT, "..", "..", "tmp-hq-n8n-api-key.json"),
    join(ROOT, "tmp-hq-n8n-api-key.json"),
    "d:/15. SookLabs/tmp-hq-n8n-api-key.json",
  ];
  for (const p of candidates) {
    try {
      const j = JSON.parse(readFileSync(p, "utf8"));
      if (j.token) return j.token;
    } catch {
      /* continue */
    }
  }
  throw new Error("N8N_API_KEY not found");
}

const API_KEY = loadApiKey();

async function api(method, path, body) {
  const res = await fetch(`${BASE}/api/v1${path}`, {
    method,
    headers: {
      "X-N8N-API-KEY": API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    const err = new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 500)}`);
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return json;
}

function sticky(id, name, content, position, height = 240, width = 320) {
  return {
    id,
    name,
    type: "n8n-nodes-base.stickyNote",
    typeVersion: 1,
    position,
    parameters: { content, height, width },
  };
}

/** Shared validate + normalize for HQ agent payload */
const VALIDATE_CODE = `
const item = $input.first().json;
const headers = item.headers || {};
const body = item.body ?? item;
const secret = $env.HQ_AGENT_WEBHOOK_SECRET || $env.HQ_AGENT_CALLBACK_SECRET || '';
const auth = String(headers.authorization || headers.Authorization || '');
const bearer = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
const headerSecret = String(headers['x-hq-agent-dispatch-secret'] || headers['X-HQ-Agent-Dispatch-Secret'] || '').trim();

const authorized = Boolean(secret) && (bearer === secret || headerSecret === secret);
if (!authorized) {
  return [{ json: { ok: false, statusCode: 401, error: 'Unauthorized dispatch', authorized: false } }];
}

const jobId = body.jobId || body.id || '';
const provider = String(body.provider || 'cursor').toLowerCase();
const type = body.type || 'briefing-ask-ai';
const callbackUrl = body.callbackUrl || (($env.HQ_PUBLIC_BASE_URL || 'https://hq.sooklabs.com').replace(/\\/$/, '') + '/hq/api/agents/callback');
const context = String(body.context || '');
const followUp = String(body.followUp || '');

if (!jobId) {
  return [{ json: { ok: false, statusCode: 400, error: 'jobId required', authorized: true } }];
}

// cursor / n8n / unknown → auto LLM path; codex / claude stay manual
const autoProviders = new Set(['cursor', 'n8n', 'auto', '']);
const mode = autoProviders.has(provider) ? 'auto' : 'manual';

return [{
  json: {
    ok: true,
    statusCode: 200,
    authorized: true,
    jobId,
    provider,
    type,
    mode,
    followUp,
    callbackUrl,
    context,
    contextPreview: context.slice(0, 500),
    opsSnapshot: body.opsSnapshot || null,
    startedAt: body.startedAt || new Date().toISOString(),
    routedAt: new Date().toISOString(),
  }
}];
`.trim();

const BUILD_PROMPT_CODE = `
const j = $input.first().json;
const system = \`You are the SookLabs HQ executive briefing assistant. Be concise, actionable, and honest.
Do not invent revenue metrics or live integrations. Focus on priorities, risks, and decisions based only on the ops context provided.
Format with markdown sections exactly:
## Priorities focus
## Risks & blockers
## Decisions to make
## Suggested actions today\`;

const user = j.followUp
  ? j.context + '\\n\\n---\\nFollow-up from founder:\\n' + j.followUp
  : j.context + '\\n\\n---\\nGenerate a morning executive briefing draft for today based on this ops data.';

return [{
  json: {
    ...j,
    llmModel: $env.HQ_BRIEFING_MODEL || 'qwen-flash-character',
    llmBaseUrl: ($env.HQ_BRIEFING_BASE_URL || 'https://ws-ufcul7gmeu5kilzd.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1').replace(/\\/$/, ''),
    llmSystem: system,
    llmUser: user,
    callbackAuth: 'Bearer ' + String($env.HQ_AGENT_CALLBACK_SECRET || ''),
  }
}];
`.trim();

const EXTRACT_BRIEFING_CODE = `
const j = $input.first().json;
const prev = $('Build LLM Prompt').first().json;
let payload = j;
if (typeof j.data === 'string') {
  try { payload = JSON.parse(j.data); } catch (e) { payload = j; }
} else if (j.body && typeof j.body === 'object') {
  payload = j.body;
} else if (typeof j.body === 'string') {
  try { payload = JSON.parse(j.body); } catch (e) { payload = j; }
}
let text = '';
try {
  text = payload.choices?.[0]?.message?.content
    || payload.message?.content
    || '';
} catch (e) {
  text = '';
}
text = String(text || '').trim();
if (!text) {
  const errMsg = payload.error?.message || payload.message || 'Empty LLM response';
  return [{ json: { ...prev, ok: false, briefingError: String(errMsg).slice(0, 300), briefingText: '' } }];
}
return [{
  json: {
    ...prev,
    ok: true,
    briefingText: text,
    briefingSummary: text.slice(0, 180) + (text.length > 180 ? '…' : ''),
  }
}];
`.trim();

function agentRouterWorkflow() {
  const webhookId = "hq-agent-router";
  return {
    name: "HQ Agent Router",
    nodes: [
      sticky(
        "note-overview",
        "Overview",
        "## HQ Agent Router (auto briefing)\n\n1. Validate dispatch secret\n2. Ack HQ immediately\n3. **cursor/auto**: OpenAI → POST HQ callback (full automation)\n4. **codex/claude**: remain Manual (pending / Complete UI)\n\nProduction → `HQ_AGENT_WEBHOOK_URL`",
        [-320, -300],
        300,
        400
      ),
      {
        id: "webhook-hq-agent",
        name: "HQ Webhook",
        type: "n8n-nodes-base.webhook",
        typeVersion: 2.1,
        position: [0, 0],
        webhookId,
        parameters: {
          httpMethod: "POST",
          path: "hq-agent",
          responseMode: "responseNode",
          options: {},
        },
      },
      {
        id: "validate-dispatch",
        name: "Validate & Normalize",
        type: "n8n-nodes-base.code",
        typeVersion: 2,
        position: [240, 0],
        parameters: { jsCode: VALIDATE_CODE },
      },
      {
        id: "if-authorized",
        name: "Authorized?",
        type: "n8n-nodes-base.if",
        typeVersion: 2.2,
        position: [480, 0],
        parameters: {
          conditions: {
            options: { caseSensitive: true, leftValue: "", typeValidation: "strict", version: 2 },
            conditions: [
              {
                id: "c1",
                leftValue: "={{ $json.ok }}",
                rightValue: true,
                operator: { type: "boolean", operation: "true", singleValue: true },
              },
            ],
            combinator: "and",
          },
          options: {},
        },
      },
      {
        id: "respond-error",
        name: "Respond Error",
        type: "n8n-nodes-base.respondToWebhook",
        typeVersion: 1.1,
        position: [720, 220],
        parameters: {
          respondWith: "json",
          responseBody: "={{ { ok: false, error: $json.error || 'Rejected', jobId: $json.jobId || null } }}",
          options: { responseCode: "={{ $json.statusCode || 401 }}" },
        },
      },
      {
        id: "if-auto",
        name: "Auto briefing?",
        type: "n8n-nodes-base.if",
        typeVersion: 2.2,
        position: [720, -40],
        parameters: {
          conditions: {
            options: { caseSensitive: true, leftValue: "", typeValidation: "strict", version: 2 },
            conditions: [
              {
                id: "a1",
                leftValue: "={{ $json.mode }}",
                rightValue: "auto",
                operator: { type: "string", operation: "equals" },
              },
            ],
            combinator: "and",
          },
          options: {},
        },
      },
      {
        id: "respond-auto-ack",
        name: "Respond Auto Ack",
        type: "n8n-nodes-base.respondToWebhook",
        typeVersion: 1.1,
        position: [980, -160],
        parameters: {
          respondWith: "json",
          responseBody:
            "={{ { ok: true, jobId: $json.jobId, provider: $json.provider, status: 'auto_generating', hint: 'n8n OpenAI → HQ callback' } }}",
          options: { responseCode: 200 },
        },
      },
      {
        id: "build-prompt",
        name: "Build LLM Prompt",
        type: "n8n-nodes-base.code",
        typeVersion: 2,
        position: [980, -40],
        parameters: { jsCode: BUILD_PROMPT_CODE },
      },
      {
        id: "http-openai",
        name: "OpenAI Briefing",
        type: "n8n-nodes-base.httpRequest",
        typeVersion: 4.2,
        position: [1220, -40],
        retryOnFail: true,
        maxTries: 2,
        waitBetweenTries: 3000,
        credentials: {
          openAiApi: {
            id: "ozG9OstvT42hegQ7",
            name: "OpenAI account",
          },
        },
        parameters: {
          method: "POST",
          url: "={{ $json.llmBaseUrl + '/chat/completions' }}",
          authentication: "predefinedCredentialType",
          nodeCredentialType: "openAiApi",
          sendHeaders: true,
          headerParameters: {
            parameters: [{ name: "Content-Type", value: "application/json" }],
          },
          sendBody: true,
          specifyBody: "json",
          jsonBody:
            "={{ JSON.stringify({ model: $json.llmModel || 'qwen-flash-character', temperature: 0.3, max_tokens: 1200, messages: [{ role: 'system', content: $json.llmSystem }, { role: 'user', content: $json.llmUser }] }) }}",
          options: {
            timeout: 90000,
            response: { response: { neverError: true } },
          },
        },
      },
      {
        id: "extract-briefing",
        name: "Extract Briefing",
        type: "n8n-nodes-base.code",
        typeVersion: 2,
        position: [1460, -40],
        parameters: { jsCode: EXTRACT_BRIEFING_CODE },
      },
      {
        id: "if-briefing-ok",
        name: "Briefing OK?",
        type: "n8n-nodes-base.if",
        typeVersion: 2.2,
        position: [1680, -40],
        parameters: {
          conditions: {
            options: { caseSensitive: true, leftValue: "", typeValidation: "strict", version: 2 },
            conditions: [
              {
                id: "b1",
                leftValue: "={{ $json.ok }}",
                rightValue: true,
                operator: { type: "boolean", operation: "true", singleValue: true },
              },
            ],
            combinator: "and",
          },
          options: {},
        },
      },
      {
        id: "http-callback-ok",
        name: "POST HQ Callback",
        type: "n8n-nodes-base.httpRequest",
        typeVersion: 4.2,
        position: [1920, -120],
        retryOnFail: true,
        maxTries: 3,
        waitBetweenTries: 2000,
        parameters: {
          method: "POST",
          url: "={{ $json.callbackUrl }}",
          sendHeaders: true,
          headerParameters: {
            parameters: [
              { name: "Authorization", value: "={{ $json.callbackAuth }}" },
              { name: "Content-Type", value: "application/json" },
            ],
          },
          sendBody: true,
          specifyBody: "json",
          jsonBody:
            "={{ JSON.stringify({ jobId: $json.jobId, provider: $json.provider || 'n8n', status: 'completed', text: $json.briefingText, summary: $json.briefingSummary || 'n8n auto briefing' }) }}",
          options: {
            timeout: 30000,
            response: { response: { neverError: true } },
          },
        },
      },
      {
        id: "http-callback-fail",
        name: "POST HQ Fail",
        type: "n8n-nodes-base.httpRequest",
        typeVersion: 4.2,
        position: [1920, 60],
        parameters: {
          method: "POST",
          url: "={{ $json.callbackUrl }}",
          sendHeaders: true,
          headerParameters: {
            parameters: [
              { name: "Authorization", value: "={{ $json.callbackAuth }}" },
              { name: "Content-Type", value: "application/json" },
            ],
          },
          sendBody: true,
          specifyBody: "json",
          jsonBody:
            "={{ JSON.stringify({ jobId: $json.jobId, provider: $json.provider || 'n8n', status: 'failed', summary: $json.briefingError || 'n8n auto briefing failed' }) }}",
          options: {
            timeout: 20000,
            response: { response: { neverError: true } },
          },
        },
      },
      sticky(
        "note-manual",
        "Manual path",
        "## Codex / Claude\nAck only — complete via HQ Complete UI or callback webhook.",
        [980, 160],
        160,
        280
      ),
      {
        id: "set-manual",
        name: "Manual queued",
        type: "n8n-nodes-base.set",
        typeVersion: 3.4,
        position: [980, 280],
        parameters: {
          assignments: {
            assignments: [
              { id: "m1", name: "ok", value: true, type: "boolean" },
              { id: "m2", name: "jobId", value: "={{ $json.jobId }}", type: "string" },
              { id: "m3", name: "provider", value: "={{ $json.provider }}", type: "string" },
              { id: "m4", name: "status", value: "awaiting_manual_briefing", type: "string" },
              {
                id: "m5",
                name: "hint",
                value: "Complete in HQ LLM & Agents, or POST /webhook/hq-agent-callback",
                type: "string",
              },
            ],
          },
          options: {},
        },
      },
      {
        id: "respond-manual",
        name: "Respond Manual Ack",
        type: "n8n-nodes-base.respondToWebhook",
        typeVersion: 1.1,
        position: [1220, 280],
        parameters: {
          respondWith: "json",
          responseBody:
            "={{ { ok: true, jobId: $json.jobId, provider: $json.provider, status: $json.status, hint: $json.hint } }}",
          options: { responseCode: 200 },
        },
      },
    ],
    connections: {
      "HQ Webhook": { main: [[{ node: "Validate & Normalize", type: "main", index: 0 }]] },
      "Validate & Normalize": { main: [[{ node: "Authorized?", type: "main", index: 0 }]] },
      "Authorized?": {
        main: [
          [{ node: "Auto briefing?", type: "main", index: 0 }],
          [{ node: "Respond Error", type: "main", index: 0 }],
        ],
      },
      "Auto briefing?": {
        main: [
          [
            { node: "Respond Auto Ack", type: "main", index: 0 },
            { node: "Build LLM Prompt", type: "main", index: 0 },
          ],
          [{ node: "Manual queued", type: "main", index: 0 }],
        ],
      },
      "Build LLM Prompt": { main: [[{ node: "OpenAI Briefing", type: "main", index: 0 }]] },
      "OpenAI Briefing": { main: [[{ node: "Extract Briefing", type: "main", index: 0 }]] },
      "Extract Briefing": { main: [[{ node: "Briefing OK?", type: "main", index: 0 }]] },
      "Briefing OK?": {
        main: [
          [{ node: "POST HQ Callback", type: "main", index: 0 }],
          [{ node: "POST HQ Fail", type: "main", index: 0 }],
        ],
      },
      "Manual queued": { main: [[{ node: "Respond Manual Ack", type: "main", index: 0 }]] },
    },
    settings: {
      executionOrder: "v1",
      timezone: "Asia/Bangkok",
    },
  };
}

function callbackWorkflow() {
  const validate = `
const item = $input.first().json;
const headers = item.headers || {};
const body = item.body ?? item;
const secret = $env.HQ_AGENT_WEBHOOK_SECRET || $env.HQ_AGENT_CALLBACK_SECRET || '';
const auth = String(headers.authorization || headers.Authorization || '');
const bearer = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
const headerSecret = String(headers['x-hq-agent-dispatch-secret'] || '').trim();
const authorized = Boolean(secret) && (bearer === secret || headerSecret === secret);
if (!authorized) {
  return [{ json: { ok: false, statusCode: 401, error: 'Unauthorized' } }];
}
const jobId = body.jobId || body.id || '';
const text = String(body.text || body.result || body.briefing || '').trim();
const status = String(body.status || 'completed').toLowerCase();
const provider = body.provider || 'claude';
if (!jobId) return [{ json: { ok: false, statusCode: 400, error: 'jobId required' } }];
if (status === 'completed' && !text) return [{ json: { ok: false, statusCode: 400, error: 'text required' } }];
const callbackUrl = ($env.HQ_PUBLIC_BASE_URL || 'https://hq.sooklabs.com').replace(/\\/$/, '') + '/hq/api/agents/callback';
return [{ json: { ok: true, jobId, text, status, provider, summary: body.summary || '', callbackUrl } }];
`.trim();

  return {
    name: "HQ Agent Callback",
    nodes: [
      sticky(
        "note-cb",
        "Callback bridge",
        "## HQ Agent Callback\n\nManual Claude / external runners POST here → forwards to HQ callback with server-side secret.\n\nBody: `{ jobId, text, provider?, status? }`",
        [-200, -200],
        200,
        340
      ),
      {
        id: "webhook-cb",
        name: "Callback Webhook",
        type: "n8n-nodes-base.webhook",
        typeVersion: 2.1,
        position: [0, 0],
        webhookId: "hq-agent-callback",
        parameters: {
          httpMethod: "POST",
          path: "hq-agent-callback",
          responseMode: "responseNode",
          options: {},
        },
      },
      {
        id: "validate-cb",
        name: "Validate Callback",
        type: "n8n-nodes-base.code",
        typeVersion: 2,
        position: [240, 0],
        parameters: { jsCode: validate },
      },
      {
        id: "if-cb",
        name: "Valid?",
        type: "n8n-nodes-base.if",
        typeVersion: 2.2,
        position: [480, 0],
        parameters: {
          conditions: {
            options: { caseSensitive: true, leftValue: "", typeValidation: "strict", version: 2 },
            conditions: [
              {
                id: "v1",
                leftValue: "={{ $json.ok }}",
                rightValue: true,
                operator: { type: "boolean", operation: "true", singleValue: true },
              },
            ],
            combinator: "and",
          },
          options: {},
        },
      },
      {
        id: "respond-cb-err",
        name: "Respond CB Error",
        type: "n8n-nodes-base.respondToWebhook",
        typeVersion: 1.1,
        position: [720, 160],
        parameters: {
          respondWith: "json",
          responseBody: "={{ { ok: false, error: $json.error } }}",
          options: { responseCode: "={{ $json.statusCode || 400 }}" },
        },
      },
      {
        id: "http-hq-cb",
        name: "POST HQ Callback",
        type: "n8n-nodes-base.httpRequest",
        typeVersion: 4.2,
        position: [720, -40],
        parameters: {
          method: "POST",
          url: "={{ $json.callbackUrl }}",
          sendHeaders: true,
          headerParameters: {
            parameters: [
              {
                name: "Authorization",
                value: "={{ 'Bearer ' + $env.HQ_AGENT_CALLBACK_SECRET }}",
              },
              { name: "Content-Type", value: "application/json" },
            ],
          },
          sendBody: true,
          specifyBody: "json",
          jsonBody:
            "={{ JSON.stringify({ jobId: $json.jobId, provider: $json.provider, status: $json.status, text: $json.text, summary: $json.summary }) }}",
          options: {
            timeout: 30000,
            response: { response: { neverError: true } },
          },
        },
        onError: "continueRegularOutput",
      },
      {
        id: "respond-cb-ok",
        name: "Respond CB OK",
        type: "n8n-nodes-base.respondToWebhook",
        typeVersion: 1.1,
        position: [960, -40],
        parameters: {
          respondWith: "json",
          responseBody:
            "={{ { ok: true, forwarded: true, hqStatus: $json.statusCode || $json.status || null, hqBody: $json } }}",
          options: { responseCode: 200 },
        },
      },
    ],
    connections: {
      "Callback Webhook": { main: [[{ node: "Validate Callback", type: "main", index: 0 }]] },
      "Validate Callback": { main: [[{ node: "Valid?", type: "main", index: 0 }]] },
      "Valid?": {
        main: [
          [{ node: "POST HQ Callback", type: "main", index: 0 }],
          [{ node: "Respond CB Error", type: "main", index: 0 }],
        ],
      },
      "POST HQ Callback": { main: [[{ node: "Respond CB OK", type: "main", index: 0 }]] },
    },
    settings: { executionOrder: "v1", timezone: "Asia/Bangkok" },
  };
}

function morningCronWorkflow() {
  return {
    name: "HQ Morning Cron",
    nodes: [
      sticky(
        "note-morning",
        "Morning loop",
        "## HQ Morning Cron\n\n06:00 Asia/Bangkok → `POST /hq/api/cron/morning`\n\nDuplicates Vercel Cron as droplet backup. Safe if both fire (idempotent-ish: creates a new job each time — prefer one source of truth).",
        [-200, -220],
        220,
        360
      ),
      {
        id: "sched-morning",
        name: "Every day 06:00 BKK",
        type: "n8n-nodes-base.scheduleTrigger",
        typeVersion: 1.2,
        position: [0, 0],
        parameters: {
          rule: {
            interval: [
              {
                field: "cronExpression",
                expression: "0 6 * * *",
              },
            ],
          },
        },
      },
      {
        id: "http-morning",
        name: "POST Morning Cron",
        type: "n8n-nodes-base.httpRequest",
        typeVersion: 4.2,
        position: [280, 0],
        retryOnFail: true,
        maxTries: 3,
        waitBetweenTries: 5000,
        parameters: {
          method: "POST",
          url: "={{ ($env.HQ_PUBLIC_BASE_URL || 'https://hq.sooklabs.com').replace(/\\/$/, '') + '/hq/api/cron/morning' }}",
          sendHeaders: true,
          headerParameters: {
            parameters: [
              {
                name: "Authorization",
                value: "={{ 'Bearer ' + $env.HQ_CRON_SECRET }}",
              },
              { name: "Content-Type", value: "application/json" },
              { name: "X-HQ-Cron-Source", value: "n8n-morning" },
            ],
          },
          options: {
            timeout: 60000,
            response: { response: { neverError: true } },
          },
        },
      },
      {
        id: "set-morning-result",
        name: "Normalize Result",
        type: "n8n-nodes-base.set",
        typeVersion: 3.4,
        position: [540, 0],
        parameters: {
          assignments: {
            assignments: [
              { id: "m1", name: "ok", value: "={{ ($json.ok === true) || ($json.statusCode >= 200 && $json.statusCode < 300) }}", type: "boolean" },
              { id: "m2", name: "jobId", value: "={{ $json.jobId || '' }}", type: "string" },
              { id: "m3", name: "status", value: "={{ $json.status || String($json.statusCode || '') }}", type: "string" },
              { id: "m4", name: "summary", value: "={{ $json.summary || JSON.stringify($json).slice(0,200) }}", type: "string" },
              { id: "m5", name: "ranAt", value: "={{ $now.toISO() }}", type: "string" },
            ],
          },
          options: {},
        },
      },
    ],
    connections: {
      "Every day 06:00 BKK": { main: [[{ node: "POST Morning Cron", type: "main", index: 0 }]] },
      "POST Morning Cron": { main: [[{ node: "Normalize Result", type: "main", index: 0 }]] },
    },
    settings: { executionOrder: "v1", timezone: "Asia/Bangkok" },
  };
}

function healthWorkflow() {
  return {
    name: "HQ Spine Health",
    nodes: [
      sticky(
        "note-health",
        "Health",
        "## HQ Spine Health\n\nEvery 6h: ping n8n healthz + HQ morning auth gate (expect 401 without secret) + pending poll with cron secret.\n\nDoes **not** create briefing jobs.",
        [-200, -200],
        200,
        360
      ),
      {
        id: "sched-health",
        name: "Every 6 hours",
        type: "n8n-nodes-base.scheduleTrigger",
        typeVersion: 1.2,
        position: [0, 0],
        parameters: {
          rule: { interval: [{ field: "hours", hoursInterval: 6 }] },
        },
      },
      {
        id: "http-n8n-health",
        name: "n8n healthz",
        type: "n8n-nodes-base.httpRequest",
        typeVersion: 4.2,
        position: [260, 0],
        parameters: {
          method: "GET",
          url: "https://hooks.sookly.co/healthz",
          options: {
            timeout: 15000,
            response: { response: { neverError: true, fullResponse: true } },
          },
        },
      },
      {
        id: "http-pending",
        name: "HQ pending poll",
        type: "n8n-nodes-base.httpRequest",
        typeVersion: 4.2,
        position: [500, 0],
        parameters: {
          method: "GET",
          url: "={{ ($env.HQ_PUBLIC_BASE_URL || 'https://hq.sooklabs.com').replace(/\\/$/, '') + '/hq/api/agents/pending?provider=cursor' }}",
          sendHeaders: true,
          headerParameters: {
            parameters: [
              {
                name: "Authorization",
                value: "={{ 'Bearer ' + $env.HQ_CRON_SECRET }}",
              },
            ],
          },
          options: {
            timeout: 20000,
            response: { response: { neverError: true, fullResponse: true } },
          },
        },
      },
      {
        id: "merge-health",
        name: "Summarize checks",
        type: "n8n-nodes-base.code",
        typeVersion: 2,
        position: [740, 0],
        parameters: {
          jsCode: `
const n8nItem = $('n8n healthz').first().json;
const pendingItem = $input.first().json;
const n8nBody = n8nItem.body || n8nItem;
const pendingBody = pendingItem.body || pendingItem;
const n8nOk = n8nItem.statusCode === 200 || n8nBody.status === 'ok';
const pendingOk = pendingItem.statusCode === 200;
const jobs = pendingBody.jobs || pendingBody.data || [];
return [{
  json: {
    ok: Boolean(n8nOk && pendingOk),
    checkedAt: new Date().toISOString(),
    n8nOk,
    pendingOk,
    pendingJobCount: Array.isArray(jobs) ? jobs.length : null,
  }
}];
`.trim(),
        },
      },
    ],
    connections: {
      "Every 6 hours": { main: [[{ node: "n8n healthz", type: "main", index: 0 }]] },
      "n8n healthz": { main: [[{ node: "HQ pending poll", type: "main", index: 0 }]] },
      "HQ pending poll": { main: [[{ node: "Summarize checks", type: "main", index: 0 }]] },
    },
    settings: { executionOrder: "v1", timezone: "Asia/Bangkok" },
  };
}

/** Parent board workflow — documents the suite on the user's canvas */
function parentBoardWorkflow() {
  return {
    name: "HQ SookLabs Automations",
    nodes: [
      sticky(
        "board",
        "HQ Automation Suite",
        `## HQ SookLabs Automations (suite board)\n\nActive workflows (created via API):\n\n1. **HQ Agent Router** — webhook \`/webhook/hq-agent\`\n2. **HQ Agent Callback** — webhook \`/webhook/hq-agent-callback\`\n3. **HQ Morning Cron** — 06:00 Asia/Bangkok\n4. **HQ Spine Health** — every 6 hours\n\nSet Vercel:\n- \`HQ_AGENT_WEBHOOK_URL=https://hooks.sookly.co/webhook/hq-agent\`\n- \`HQ_N8N_BASE_URL=https://hooks.sookly.co\`\n- \`HQ_AGENT_WEBHOOK_SECRET\` (= callback secret)\n\nHonest badges only: Workflow Ready / Manual / Future API.`,
        [0, 0],
        420,
        520
      ),
    ],
    connections: {},
    settings: { executionOrder: "v1", availableInMCP: false },
  };
}

async function upsertByName(def, { preferId } = {}) {
  const list = await api("GET", "/workflows?limit=100");
  const existing = (list.data || []).find((w) => w.name === def.name) || (preferId ? { id: preferId } : null);

  const settings = { executionOrder: "v1" };
  if (def.settings?.timezone) settings.timezone = def.settings.timezone;

  const payload = {
    name: def.name,
    nodes: def.nodes,
    connections: def.connections,
    settings,
  };

  if (existing?.id) {
    const updated = await api("PUT", `/workflows/${existing.id}`, payload);
    return { action: "updated", id: updated.id || existing.id, name: def.name, data: updated };
  }

  const created = await api("POST", "/workflows", payload);
  return { action: "created", id: created.id, name: def.name, data: created };
}

async function activate(id) {
  try {
    return await api("POST", `/workflows/${id}/activate`);
  } catch (e) {
    // older API variants
    try {
      return await api("PATCH", `/workflows/${id}`, { active: true });
    } catch {
      throw e;
    }
  }
}

async function deactivate(id) {
  try {
    return await api("POST", `/workflows/${id}/deactivate`);
  } catch {
    return null;
  }
}

async function main() {
  const results = [];

  // Parent board on user's empty workflow
  results.push(await upsertByName(parentBoardWorkflow(), { preferId: "mCOGgJLgolbF2TyP" }));

  const router = await upsertByName(agentRouterWorkflow());
  results.push(router);
  const callback = await upsertByName(callbackWorkflow());
  results.push(callback);
  const morning = await upsertByName(morningCronWorkflow());
  results.push(morning);
  const health = await upsertByName(healthWorkflow());
  results.push(health);

  // Activate the operational ones (not the sticky-only board)
  for (const r of [router, callback, morning, health]) {
    try {
      await activate(r.id);
      r.active = true;
    } catch (e) {
      r.active = false;
      r.activateError = e.message;
    }
  }

  // Resolve production webhook URLs
  const routerFull = await api("GET", `/workflows/${router.id}`);
  const cbFull = await api("GET", `/workflows/${callback.id}`);
  const webhookPath = (wf) => {
    const n = (wf.nodes || []).find((x) => x.type === "n8n-nodes-base.webhook");
    return n?.parameters?.path || null;
  };

  const summary = {
    provisionedAt: new Date().toISOString(),
    results: results.map((r) => ({
      action: r.action,
      id: r.id,
      name: r.name,
      active: r.active ?? false,
      activateError: r.activateError,
    })),
    webhooks: {
      agentRouter: `${BASE}/webhook/${webhookPath(routerFull) || "hq-agent"}`,
      agentCallback: `${BASE}/webhook/${webhookPath(cbFull) || "hq-agent-callback"}`,
    },
    vercelEnvNeeded: {
      HQ_AGENT_WEBHOOK_URL: `${BASE}/webhook/hq-agent`,
      HQ_N8N_BASE_URL: BASE,
      HQ_AGENT_WEBHOOK_SECRET: "(same as HQ_AGENT_CALLBACK_SECRET)",
    },
  };

  const outDir = join(ROOT, "docs", "n8n");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "hq-provision-result.json"), JSON.stringify(summary, null, 2));
  writeFileSync(join(outDir, "hq-agent-router.json"), JSON.stringify(agentRouterWorkflow(), null, 2));
  writeFileSync(join(outDir, "hq-agent-callback.json"), JSON.stringify(callbackWorkflow(), null, 2));
  writeFileSync(join(outDir, "hq-morning-cron.json"), JSON.stringify(morningCronWorkflow(), null, 2));
  writeFileSync(join(outDir, "hq-spine-health.json"), JSON.stringify(healthWorkflow(), null, 2));

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
