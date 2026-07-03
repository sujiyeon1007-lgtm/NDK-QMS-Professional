import { Outlet } from "react-router-dom";

import { getSectionById } from "../../config/menuStructure";
import { SectionPageActionsProvider } from "../../foundation/layout/SectionPageActionsContext";
import TitanMenuToolbar from "../../foundation/layout/TitanMenuToolbar";

import "../../foundation/layout/SectionPageLayout.css";

/** 문서관리 — List 조회 + Popup 관리 */
export default function DocumentsLayout() {
  const section = getSectionById("documents");
  if (!section) return null;

  return (
    <SectionPageActionsProvider>
      <div className="titan-section-page">
        <header className="titan-section-page__header">
          <h1 className="titan-section-page__title">{section.label}</h1>
        </header>
        <TitanMenuToolbar tabs={null} />
        <div className="titan-section-page__body">
          <Outlet />
        </div>
      </div>
    </SectionPageActionsProvider>
  );
}
