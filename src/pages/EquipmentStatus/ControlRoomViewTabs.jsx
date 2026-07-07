/**
 * Control Room View Tabs (Sprint 3A)
 * Blueprint ② 설비현황 — 설비 / LOT / 제품 View 전환
 */
export default function ControlRoomViewTabs({ views, activeView, onChange }) {
  return (
    <div className="control-room__tabs" role="tablist" aria-label="Control Room View">
      {views.map((view) => {
        const active = view.id === activeView;
        return (
          <button
            key={view.id}
            type="button"
            role="tab"
            aria-selected={active}
            className={`control-room__tab${active ? " is-active" : ""}`}
            onClick={() => onChange(view.id)}
          >
            {view.label}
          </button>
        );
      })}
    </div>
  );
}
