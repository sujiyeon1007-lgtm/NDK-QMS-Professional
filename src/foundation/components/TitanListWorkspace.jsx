import { useId, useRef } from "react";
import { useTitanLeftWidgetCollapsed } from "../hooks/useTitanLeftWidgetCollapsed";
import TitanFloatingPanelToggle from "./TitanFloatingPanelToggle";

/**
 * Project TITAN V1.0 — 리스트 화면 공통 레이아웃
 * 좌측 Widget (상세 · 공정흐름도 · 액션) + 우측 메인 리스트 · HOME 접기/펼치기 동일
 */
export default function TitanListWorkspace({
  leftWidget,
  leftAriaLabel = "상세 · 업무 Widget",
  storageKey = "default",
  className = "",
  mainClassName = "",
  children,
}) {
  const contentId = useId();
  const panelRef = useRef(null);
  const [collapsed, toggleCollapsed] = useTitanLeftWidgetCollapsed(storageKey);

  return (
    <div
      className={`titan-list-workspace inbound-page__workspace${collapsed ? " is-left-collapsed" : ""}${className ? ` ${className}` : ""}`.trim()}
    >
      <aside
        ref={panelRef}
        className={`titan-left-widget-panel${collapsed ? " is-collapsed" : ""}`}
        aria-label={leftAriaLabel}
        aria-expanded={!collapsed}
      >
        <div id={contentId} className="titan-left-widget-panel__inner">
          {leftWidget}
        </div>
      </aside>

      <TitanFloatingPanelToggle
        panelRef={panelRef}
        collapsed={collapsed}
        onToggle={toggleCollapsed}
        expandedLabel="상세 영역 접기"
        collapsedLabel="상세 영역 펼치기"
        controlsId={contentId}
      />

      <div className={`titan-list-workspace__main inbound-page__list${mainClassName ? ` ${mainClassName}` : ""}`.trim()}>
        {children}
      </div>
    </div>
  );
}
