import SectionTabs from "./SectionTabs";
import "./TitanMenuToolbar.css";

/**
 * Header 아래 메뉴 전용 Toolbar — 서브메뉴(Tab) 2개 이상일 때만 표시
 */
export default function TitanMenuToolbar({ tabs }) {
  const visibleTabs = tabs?.length > 1 ? tabs : null;

  if (!visibleTabs) {
    return null;
  }

  return (
    <div className="titan-menu-toolbar" role="region" aria-label="메뉴 작업영역">
      <SectionTabs tabs={visibleTabs} className="titan-menu-toolbar__tabs" />
    </div>
  );
}
