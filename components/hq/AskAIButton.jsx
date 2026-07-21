"use client";

import { Button } from "./Button";
import { ASK_AI_FOCUS_PRESETS, ASK_AI_PROVIDERS, useAskAI } from "./useAskAI";

function ProviderSelect({ provider, onProviderChange }) {
  return (
    <select
      aria-label="Agent provider"
      value={provider}
      onChange={(e) => onProviderChange(e.target.value)}
      className="hq-ask-ai-provider"
    >
      {ASK_AI_PROVIDERS.map((p) => (
        <option key={p.id} value={p.id}>
          {p.label}
        </option>
      ))}
    </select>
  );
}

function AskAIStatus({ message, error }) {
  if (!message && !error) return null;
  return (
    <>
      {message ? (
        <span className="hq-ask-ai-status">
          {message}
          {message.toLowerCase().includes("dispatch") || message.toLowerCase().includes("waiting") ? (
            <>
              {" · "}
              <a href="/hq/automation">Automation →</a>
            </>
          ) : null}
        </span>
      ) : null}
      {error ? <span className="hq-ask-ai-error">{error}</span> : null}
    </>
  );
}

/** TopBar: provider + primary Ask AI only */
export function AskAIButton({ ask: askProp }) {
  const internal = useAskAI();
  const ask = askProp || internal;

  return (
    <span className="hq-ask-ai-bar hq-ask-ai-bar--topbar">
      <ProviderSelect provider={ask.provider} onProviderChange={ask.onProviderChange} />
      <Button
        variant="accent"
        size="sm"
        loading={ask.loading}
        onClick={ask.runAsk}
        title="Dispatch briefing job to selected agent (webhook / pending queue — no API key required)"
      >
        Ask AI
      </Button>
      <AskAIStatus message={ask.message} error={ask.error} />
    </span>
  );
}

/** Briefing card: focus presets + custom focus input (shares state with TopBar via `ask` prop) */
export function AskAIFocusCard({ ask }) {
  if (!ask) return null;

  return (
    <div className="hq-ask-ai-focus-card">
      <div className="hq-ask-ai-focus-presets">
        {ASK_AI_FOCUS_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className={`hq-ask-ai-preset${ask.followUp === preset.value ? " hq-ask-ai-preset--active" : ""}`}
            onClick={() => ask.applyPreset(preset)}
            title={preset.value}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <input
        value={ask.followUp}
        onChange={(e) => ask.onFocusChange(e.target.value)}
        placeholder="Focus (e.g. Sookly P0)…"
        aria-label="Ask AI focus"
        className="hq-ask-ai-focus-input"
      />
    </div>
  );
}

/** Automation page: full inline bar with presets (legacy layout) */
export function AskAIButtonFull({ showFocus = false }) {
  const ask = useAskAI();

  return (
    <span className="hq-ask-ai-bar">
      <ProviderSelect provider={ask.provider} onProviderChange={ask.onProviderChange} />
      {showFocus ? (
        <>
          <div className="hq-ask-ai-focus-presets">
            {ASK_AI_FOCUS_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={`hq-ask-ai-preset${ask.followUp === preset.value ? " hq-ask-ai-preset--active" : ""}`}
                onClick={() => ask.applyPreset(preset)}
                title={preset.value}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <input
            value={ask.followUp}
            onChange={(e) => ask.onFocusChange(e.target.value)}
            placeholder="Focus (e.g. Sookly P0)…"
            aria-label="Ask AI focus"
            className="hq-ask-ai-focus-input"
          />
        </>
      ) : null}
      <Button
        variant="accent"
        size="sm"
        loading={ask.loading}
        onClick={ask.runAsk}
        title="Dispatch briefing job to selected agent (webhook / pending queue — no API key required)"
      >
        Ask AI
      </Button>
      <AskAIStatus message={ask.message} error={ask.error} />
    </span>
  );
}
