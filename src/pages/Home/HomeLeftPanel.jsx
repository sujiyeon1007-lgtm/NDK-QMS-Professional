import { useId, useRef } from "react";
import { useHomeLeftPanelCollapsed } from "./useHomeLeftPanelCollapsed";
import TitanFloatingPanelToggle from "../../foundation/components/TitanFloatingPanelToggle";

export default function HomeLeftPanel({ children }) {
  const [collapsed, toggleCollapsed] = useHomeLeftPanelCollapsed();
  const contentId = useId();
  const panelRef = useRef(null);

  return (
    <aside
      ref={panelRef}
      className={`home-board__left${collapsed ? " is-collapsed" : ""}`}
      aria-label="공지사항 · 금일 업무 · 최근 작업"
      aria-expanded={!collapsed}
    >
      <TitanFloatingPanelToggle
        panelRef={panelRef}
        collapsed={collapsed}
        onToggle={toggleCollapsed}
        expandedLabel="좌측 패널 접기"
        collapsedLabel="좌측 패널 펼치기"
        controlsId={contentId}
      />

      <div id={contentId} className="home-board__left-inner">
        {children}
      </div>
    </aside>
  );
}
