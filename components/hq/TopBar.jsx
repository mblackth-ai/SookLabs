export function TopBar({ title, subtitle, actions }) {
  return (
    <div className="hq-topbar">
      <div>
        <h1 className="hq-topbar-title">{title}</h1>
        {subtitle && <div className="hq-topbar-subtitle">{subtitle}</div>}
      </div>
      {actions && <div className="hq-topbar-actions">{actions}</div>}
    </div>
  );
}
