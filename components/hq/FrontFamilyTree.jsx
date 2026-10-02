export function FrontFamilyTree({ nodes, branches }) {
  return (
    <div className="hq-family-tree">
      <div className="hq-section-label">Percentage timeline</div>
      <p className="hq-text-xs-muted">
        Axis is 0–100. Checklist nodes are spaced in order. That spacing is not a second percentage. The review window is 2–31 Oct 2026 and is not a ship date.
      </p>
      <div className="hq-family-tree-scroll">
        <div className="hq-family-tree-track" aria-hidden="true" />
        <div className="hq-family-tree-nodes">
          {nodes.map((node) => (
            <div key={node.id} className={`hq-family-node hq-family-node--${node.kind}`} style={{ left: `${node.at}%` }}>
              <span className="hq-family-node-dot" />
              <span className="hq-family-node-label">{node.label}</span>
              <span className="hq-family-node-window">{node.windowLabel}</span>
            </div>
          ))}
        </div>
      </div>
      {branches.length ? (
        <p className="hq-text-xs-muted">Repo branches hang off this front. They are listed under the timeline.</p>
      ) : (
        <p className="hq-text-xs-muted">No repo branch is recorded for this front.</p>
      )}
    </div>
  );
}
