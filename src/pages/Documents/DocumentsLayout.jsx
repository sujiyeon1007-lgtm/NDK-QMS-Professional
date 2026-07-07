import { Outlet } from "react-router-dom";

import { getSectionById } from "../../config/menuStructure";
import { SectionPageActionsProvider } from "../../foundation/layout/SectionPageActionsContext";
import TitanHubBackLink from "../../foundation/components/TitanHubBackLink";

import "../../foundation/layout/SectionPageLayout.css";
import "../../foundation/styles/titan-hub-page.css";

/** 문서관리 — 품질관리 Launcher 하위 */
export default function DocumentsLayout() {
  const section = getSectionById("documents");
  if (!section) return null;

  return (
    <SectionPageActionsProvider>
      <div className="titan-section-page">
        <header className="titan-section-page__header">
          <h1 className="titan-section-page__title">{section.label}</h1>
        </header>
        <div className="titan-section-page__body">
          <TitanHubBackLink to="/quality" label="품질관리" />
          <Outlet />
        </div>
      </div>
    </SectionPageActionsProvider>
  );
}
