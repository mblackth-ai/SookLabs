import { TopBar } from "./TopBar";

export function ComingSoon({ title, subtitle }) {
  return (
    <div>
      <TopBar title={title} subtitle={subtitle} />
      <div style={{ padding: "48px 32px", color: "var(--text-tertiary)", fontSize: 14 }}>
        This section is coming soon in the next iteration.
      </div>
    </div>
  );
}
