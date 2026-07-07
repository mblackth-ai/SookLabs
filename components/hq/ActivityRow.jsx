import { Avatar } from "./Avatar";

export function ActivityRow({ icon, agent, action, time }) {
  return (
    <div className="hq-list-row" style={{ alignItems: "flex-start" }}>
      {icon === "ai" ? (
        <Avatar name={agent} isAI size="xs" />
      ) : (
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: 4,
            background: "var(--bg-float)",
            border: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 7, fontWeight: 700, color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
            {agent.slice(0, 2).toUpperCase()}
          </span>
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-accent)" }}>{agent} </span>
        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{action}</span>
      </div>
      <span style={{ fontSize: 11, color: "var(--text-tertiary)", flexShrink: 0 }}>{time}</span>
    </div>
  );
}
