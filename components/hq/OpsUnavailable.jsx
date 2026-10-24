// Shown when the ops database read fails or times out. Editing is hidden so an empty
// fallback can never be saved over the real board.
export function OpsUnavailable({ what = "priorities, goals and blockers" }) {
  return (
    <div className="hq-card hq-ops-unavailable" role="status">
      <p className="hq-card-title">Ops board unavailable</p>
      <p className="hq-text-sm-secondary">
        The ops database didn&apos;t respond, so {what} are hidden rather than shown empty. Editing is off until it is
        back, so nothing can overwrite the real board. Reload to try again.
      </p>
    </div>
  );
}
