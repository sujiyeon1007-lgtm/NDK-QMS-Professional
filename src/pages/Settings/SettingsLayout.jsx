import { Outlet } from "react-router-dom";
import { getSectionById } from "../../config/menuStructure";
import "../../foundation/layout/SectionPageLayout.css";
import "../../foundation/styles/titan-hub-page.css";

/**
 * 기준정보관리 — Hub + Modal UI (탭/서브페이지 없음)
 */
export default function SettingsLayout() {
  const section = getSectionById("masterData");
  if (!section) return null;

  return (
    <div className="titan-section-page">
      <header className="titan-section-page__header">
        <h1 className="titan-section-page__title">{section.label}</h1>
      </header>
      <div className="titan-section-page__body">
        <Outlet />
      </div>
    </div>
  );
}
