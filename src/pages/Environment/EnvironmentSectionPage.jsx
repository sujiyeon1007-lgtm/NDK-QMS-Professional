import { Link } from "react-router-dom";

import {
  ENVIRONMENT_SECTION_UI,
  ENVIRONMENT_WORKSPACE_COPY,
  ENVIRONMENT_WORKSPACE_ROUTES,
  getEnvironmentSectionById,
  TITAN_WORKSPACE_HOME_PRINCIPLE,
} from "../../config/environmentWorkspaceArchitecture";
import EnvironmentSectionPreview from "./EnvironmentSectionPreview";

export default function EnvironmentSectionPage({ sectionId }) {
  const section = getEnvironmentSectionById(sectionId);
  const ui = ENVIRONMENT_SECTION_UI[sectionId] ?? {};
  const Icon = section?.icon;

  if (!section) return null;

  return (
    <div className="company-workspace-section-page">
      <Link to={ENVIRONMENT_WORKSPACE_ROUTES.dashboard} className="company-workspace-back-link">
        {"\u2190 Workspace"}
      </Link>

      <header className="company-workspace-section-head">
        <div className="company-workspace-section-head__main">
          {Icon ? (
            <span className="company-workspace-section-head__icon">
              <Icon size={24} aria-hidden="true" />
            </span>
          ) : null}
          <div>
            <h2 className="company-workspace-section-head__title">{section.label}</h2>
            <p className="company-workspace-section-head__desc">{section.description}</p>
          </div>
        </div>
        <span className="company-workspace-preview-badge">{ENVIRONMENT_WORKSPACE_COPY.uiPreviewBadge}</span>
      </header>

      <section className="company-workspace-section-kpi" aria-label="KPI placeholder">
        <span className="company-workspace-section-layer__label">KPI</span>
        <p className="company-workspace-section-layer__note">
          {TITAN_WORKSPACE_HOME_PRINCIPLE.copy.sectionKpiPlaceholder}
        </p>
      </section>

      <EnvironmentSectionPreview
        layout={ui.layout}
        previewFields={ui.previewFields}
        previewColumns={ui.previewColumns}
        previewNote={ui.previewNote}
        placeholder={section.placeholder}
        sectionIcon={Icon}
      />

      <section className="company-workspace-section-search" aria-label="Search placeholder">
        <span className="company-workspace-section-layer__label">검색</span>
        <p className="company-workspace-section-layer__note">
          {TITAN_WORKSPACE_HOME_PRINCIPLE.copy.sectionSearchPlaceholder}
        </p>
      </section>

      <section className="company-workspace-section-list" aria-label="List placeholder">
        <span className="company-workspace-section-layer__label">목록</span>
        <p className="company-workspace-section-layer__note">
          {TITAN_WORKSPACE_HOME_PRINCIPLE.copy.sectionListPlaceholder}
        </p>
      </section>

      <section className="company-workspace-section-crud" aria-label="CRUD placeholder">
        <span className="company-workspace-section-layer__label">CRUD</span>
        <p className="company-workspace-section-layer__note">
          {TITAN_WORKSPACE_HOME_PRINCIPLE.copy.sectionCrudPlaceholder}
        </p>
        <div className="environment-workspace-crud-actions" aria-hidden="true">
          <button type="button" disabled>
            등록
          </button>
          <button type="button" disabled>
            수정
          </button>
          <button type="button" disabled>
            삭제
          </button>
        </div>
      </section>
    </div>
  );
}
