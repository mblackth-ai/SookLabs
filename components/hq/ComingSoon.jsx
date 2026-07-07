import { TopBar } from "./TopBar";

export function ComingSoon({ title, subtitle }) {
  return (
    <div>
      <TopBar title={title} subtitle={subtitle} />
      <div className="hq-page-empty">This section is coming soon in the next iteration.</div>
    </div>
  );
}
