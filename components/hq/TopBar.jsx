import { SaveStatusChip } from "./SaveStatus";

export function TopBar({ title, subtitle, actions, crumbs }) {
  return (
    <div className="hq-topbar">
      <div className="hq-topbar-main">
        {crumbs?.length ? (
          <nav className="hq-crumbs" aria-label="Breadcrumb">
            {crumbs.map((c, i) => (
              <span key={`${c.href || c.label}-${i}`} className="hq-crumb">
                {i > 0 ? <span className="hq-crumb-sep" aria-hidden="true">/</span> : null}
                {c.href ? (
                  <a href={c.href} className="hq-crumb-link">
                    {c.label}
                  </a>
                ) : (
                  <span className="hq-crumb-current">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : null}
        <h1 className="hq-topbar-title">{title}</h1>
        {subtitle && <div className="hq-topbar-subtitle">{subtitle}</div>}
      </div>
      <div className="hq-topbar-actions">
        <SaveStatusChip />
        {actions}
      </div>
    </div>
  );
}
