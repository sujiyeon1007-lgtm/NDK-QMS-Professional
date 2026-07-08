import { Link } from "react-router-dom";

import {
  COMPANY_SECTION_UI,
  COMPANY_WORKSPACE_COPY,
  COMPANY_WORKSPACE_ROUTES,
  getCompanySectionById,
  TITAN_WORKSPACE_HOME_PRINCIPLE,
} from "../../config/companyWorkspaceArchitecture";
import { getCompanyProfile } from "../../utils/companyWorkspaceService";
import CompanySectionPreview from "./CompanySectionPreview";

export default function CompanySectionPage({ sectionId }) {
  const section = getCompanySectionById(sectionId);
  const ui = COMPANY_SECTION_UI[sectionId] ?? {};
  const Icon = section?.icon;

  if (!section) return null;

  const organizationTree =
    sectionId === "organization"
      ? [
          `${getCompanyProfile().companyMaster?.companyName || "Company"}`,
          ...(getCompanyProfile().departments ?? []).map((dept) => `  \u2514 ${dept.name} (${dept.code})`),
        ].join("\n")
      : "";

  return (
    <div className="company-workspace-section-page">
      <Link to={COMPANY_WORKSPACE_ROUTES.dashboard} className="company-workspace-back-link">
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
        <span className="company-workspace-preview-badge">{COMPANY_WORKSPACE_COPY.uiPreviewBadge}</span>
      </header>

      <section className="company-workspace-section-kpi" aria-label="KPI placeholder">
        <span className="company-workspace-section-layer__label">KPI</span>
        <p className="company-workspace-section-layer__note">
          {TITAN_WORKSPACE_HOME_PRINCIPLE.copy.sectionKpiPlaceholder}
        </p>
      </section>

      <CompanySectionPreview
        sectionId={sectionId}
        layout={ui.layout}
        previewFields={ui.previewFields}
        previewColumns={ui.previewColumns}
        previewSlots={ui.previewSlots}
        previewNote={ui.previewNote}
        organizationTree={organizationTree}
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
      </section>
    </div>
  );
}
