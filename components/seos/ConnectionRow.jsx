import {
  ConnectionHonestyBadge,
  ConnectionMethodLabel,
  formatTimestamp,
} from "./CommandCenterBadges";

const METHOD_OPTIONS = {
  oauth: "OAuth",
  n8n: "n8n",
  browser_manual: "Browser / manual",
  cursor_cloud_agent: "Cursor cloud agent",
  codex_script: "Codex script",
  grok_bot_routine: "Grok Bot routine",
  static_config: "Static / config",
  unknown: "Unknown",
};

export function ConnectionRow({ connection, onBlurSave }) {
  return (
    <div>
      <div className="hq-card-header hq-mb-2">
        <div>
          <div className="hq-card-title">{connection.label}</div>
          <p className="hq-text-xs-muted" style={{ marginTop: 4 }}>
            {connection.channel}
          </p>
        </div>
        <ConnectionHonestyBadge connection={connection} />
      </div>
      <dl
        style={{
          display: "grid",
          gridTemplateColumns: "140px 1fr",
          gap: "8px 12px",
          fontSize: "var(--text-sm)",
          margin: "12px 0",
        }}
      >
        <dt style={{ color: "var(--text-tertiary)" }}>Active</dt>
        <dd style={{ margin: 0, color: "var(--text-secondary)" }}>{connection.active ? "Yes" : "No"}</dd>
        <dt style={{ color: "var(--text-tertiary)" }}>Method</dt>
        <dd style={{ margin: 0 }}>
          <select
            className="hq-login-input"
            defaultValue={connection.method}
            onChange={(e) => onBlurSave("method", e.target.value)}
            style={{ maxWidth: 280 }}
          >
            {Object.entries(METHOD_OPTIONS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </dd>
        <dt style={{ color: "var(--text-tertiary)" }}>Last health</dt>
        <dd style={{ margin: 0, color: "var(--text-secondary)" }}>
          {formatTimestamp(connection.lastHealthCheck)}
        </dd>
        <dt style={{ color: "var(--text-tertiary)" }}>Last success</dt>
        <dd style={{ margin: 0, color: "var(--text-secondary)" }}>
          {formatTimestamp(connection.lastSuccessfulAction)}
        </dd>
        <dt style={{ color: "var(--text-tertiary)" }}>Enabled flag</dt>
        <dd style={{ margin: 0 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "var(--text-sm)" }}>
            <input
              type="checkbox"
              defaultChecked={Boolean(connection.enabled)}
              onChange={(e) => onBlurSave("enabled", e.target.checked)}
            />
            Operator intent (not OAuth)
          </label>
        </dd>
      </dl>
      <label className="hq-login-label">Connection notes</label>
      <textarea
        className="hq-login-input"
        rows={2}
        defaultValue={connection.operatorNotes || ""}
        onBlur={(e) => onBlurSave("operatorNotes", e.target.value)}
        style={{ width: "100%", marginTop: 6, resize: "vertical" }}
      />
      <p className="hq-text-xs-muted" style={{ marginTop: 8, marginBottom: 0 }}>
        Method: <ConnectionMethodLabel method={connection.method} /> — display only; no secret store in v1.
      </p>
    </div>
  );
}
