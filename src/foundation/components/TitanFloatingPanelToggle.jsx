import { createPortal } from "react-dom";
import { useFloatingPanelTogglePosition } from "../hooks/useFloatingPanelTogglePosition";

/**
 * Project TITAN — Floating panel collapse toggle (viewport-fixed, scroll-independent)
 */
export default function TitanFloatingPanelToggle({
  panelRef,
  collapsed,
  onToggle,
  expandedLabel = "상세 영역 접기",
  collapsedLabel = "상세 영역 펼치기",
  controlsId,
  className = "",
  active = true,
}) {
  const { left, visible } = useFloatingPanelTogglePosition(panelRef, active);

  if (!visible || left == null || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <button
      type="button"
      className={`titan-floating-panel-toggle${className ? ` ${className}` : ""}`.trim()}
      style={{ left: `${left}px` }}
      onClick={onToggle}
      aria-label={collapsed ? collapsedLabel : expandedLabel}
      aria-expanded={!collapsed}
      aria-controls={controlsId}
      title={collapsed ? collapsedLabel : expandedLabel}
    >
      <span aria-hidden="true">{collapsed ? "▶" : "◀"}</span>
    </button>,
    document.body
  );
}
