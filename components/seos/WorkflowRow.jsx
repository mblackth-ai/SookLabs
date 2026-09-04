import { PostStatusBadge, WorkflowStatusBadge } from "./CommandCenterBadges";

export function WorkflowRow({ workflow, onBlurSave }) {
  return (
    <div>
      <div className="hq-card-header hq-mb-2">
        <div>
          <div className="hq-card-title">{workflow.role}</div>
          <p className="hq-text-sm-secondary" style={{ marginTop: 6, marginBottom: 0 }}>
            {workflow.summary}
          </p>
        </div>
        <WorkflowStatusBadge status={workflow.status} />
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
        <dt style={{ color: "var(--text-tertiary)" }}>Schedule</dt>
        <dd style={{ margin: 0 }}>
          <input
            className="hq-login-input"
            defaultValue={workflow.schedule}
            onBlur={(e) => onBlurSave("schedule", e.target.value)}
            style={{ width: "100%" }}
          />
        </dd>
        <dt style={{ color: "var(--text-tertiary)" }}>Cadence tweak</dt>
        <dd style={{ margin: 0 }}>
          <input
            className="hq-login-input"
            defaultValue={workflow.editable?.cadence || ""}
            onBlur={(e) => onBlurSave("editable.cadence", e.target.value)}
            style={{ width: "100%" }}
          />
        </dd>
        <dt style={{ color: "var(--text-tertiary)" }}>Mode</dt>
        <dd style={{ margin: 0 }}>
          <select
            className="hq-login-input"
            defaultValue={workflow.editable?.mode || "draft"}
            onChange={(e) => onBlurSave("editable.mode", e.target.value)}
            style={{ maxWidth: 200 }}
          >
            <option value="draft">Draft (MITL default)</option>
            <option value="auto">Auto (not live — config only)</option>
          </select>
        </dd>
        <dt style={{ color: "var(--text-tertiary)" }}>Channel on</dt>
        <dd style={{ margin: 0 }}>
          <input
            type="checkbox"
            defaultChecked={Boolean(workflow.editable?.channelEnabled)}
            onChange={(e) => onBlurSave("editable.channelEnabled", e.target.checked)}
          />
        </dd>
        <dt style={{ color: "var(--text-tertiary)" }}>Posts to</dt>
        <dd style={{ margin: 0, color: "var(--text-secondary)" }}>{workflow.destinations.join(" · ")}</dd>
        <dt style={{ color: "var(--text-tertiary)" }}>Data sources</dt>
        <dd style={{ margin: 0, color: "var(--text-secondary)" }}>{workflow.dataSources.join(" · ")}</dd>
      </dl>

      {workflow.editable?.toneLocks ? (
        <>
          <label className="hq-login-label">Tone locks</label>
          <textarea
            className="hq-login-input"
            rows={2}
            defaultValue={workflow.editable.toneLocks}
            onBlur={(e) => onBlurSave("editable.toneLocks", e.target.value)}
            style={{ width: "100%", marginTop: 6, marginBottom: 12, resize: "vertical" }}
          />
        </>
      ) : null}

      <label className="hq-login-label">Operator notes</label>
      <textarea
        className="hq-login-input"
        rows={2}
        defaultValue={workflow.editable?.notes || ""}
        onBlur={(e) => onBlurSave("editable.notes", e.target.value)}
        style={{ width: "100%", marginTop: 6, resize: "vertical" }}
      />

      {(workflow.recentPosts || []).length ? (
        <div style={{ marginTop: 16 }}>
          <div className="hq-card-title" style={{ fontSize: "var(--text-sm)", marginBottom: 8 }}>
            Recent / queued
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
            {workflow.recentPosts.map((post) => (
              <li
                key={post.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "1px solid var(--border-faint)",
                }}
              >
                <div>
                  {post.link ? (
                    <a href={post.link} target="_blank" rel="noopener noreferrer" className="hq-navlink">
                      {post.title}
                    </a>
                  ) : (
                    <span style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>{post.title}</span>
                  )}
                </div>
                <PostStatusBadge status={post.status} />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="hq-text-xs-muted" style={{ marginTop: 12, marginBottom: 0 }}>
          No recent posts queued in config.
        </p>
      )}
    </div>
  );
}
