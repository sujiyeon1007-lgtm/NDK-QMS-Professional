import SectionTabs from "./SectionTabs";
import { useSectionPageActionsContext } from "./SectionPageActionsContext";
import "./TitanMenuToolbar.css";

/**
 * Header 아래 메뉴 전용 Toolbar — 좌: 서브메뉴(Tab) · 우: Action Button
 */
export default function TitanMenuToolbar({ tabs }) {
  const ctx = useSectionPageActionsContext();
  const actions = ctx?.actions ?? null;

  if (!tabs?.length && !actions) {
    return null;
  }

  const visibleTabs = tabs?.length > 1 ? tabs : null;

  return (
    <div className="titan-menu-toolbar" role="region" aria-label="메뉴 작업영역">
      {visibleTabs ? <SectionTabs tabs={visibleTabs} className="titan-menu-toolbar__tabs" /> : null}
      {actions ? (
        <div className="titan-menu-toolbar__actions" role="toolbar" aria-label="화면 기능">
          {actions}
        </div>
      ) : (
        <div className="titan-menu-toolbar__actions titan-menu-toolbar__actions--empty" aria-hidden="true" />
      )}
    </div>
  );
}
