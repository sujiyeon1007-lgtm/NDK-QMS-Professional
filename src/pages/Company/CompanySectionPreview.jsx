import { Layers3 } from "lucide-react";

import { COMPANY_WORKSPACE_COPY } from "../../config/companyWorkspaceArchitecture";

export default function CompanySectionPreview({
  sectionId,
  layout = "form",
  previewFields = [],
  previewColumns = [],
  previewSlots = [],
  previewNote = "",
  organizationTree = "",
  placeholder = false,
  sectionIcon: SectionIcon = Layers3,
}) {
  const note =
    placeholder && sectionId === "organization"
      ? COMPANY_WORKSPACE_COPY.organizationPlaceholder
      : placeholder && sectionId === "branding"
        ? COMPANY_WORKSPACE_COPY.brandingPlaceholder
        : COMPANY_WORKSPACE_COPY.uiPreviewNote;

  return (
    <div className="company-workspace-preparing">
      <div className="company-workspace-preparing__hero">
        <span className="company-workspace-preparing__icon" aria-hidden="true">
          <SectionIcon size={34} />
        </span>
        <div className="company-workspace-preparing__copy">
          <span className="company-workspace-preparing__badge">{COMPANY_WORKSPACE_COPY.uiPreviewBadge}</span>
          <h3 className="company-workspace-preparing__title">{COMPANY_WORKSPACE_COPY.uiPreviewTitle}</h3>
          <p className="company-workspace-preparing__note">{note}</p>
          <div className="company-workspace-preparing__tags">
            <span>{COMPANY_WORKSPACE_COPY.uiPreviewSample}</span>
            <span>{COMPANY_WORKSPACE_COPY.uiPreviewPlaceholder}</span>
            <span>{COMPANY_WORKSPACE_COPY.uiPreviewFuture}</span>
          </div>
        </div>
      </div>

      <div className="company-workspace-preparing__mock" aria-hidden="true">
        {layout === "form" ? (
          <div className="company-workspace-preparing__mock-form">
            {previewFields.slice(0, 6).map((label) => (
              <div key={label} className="company-workspace-preparing__mock-block">
                <span>{label}</span>
              </div>
            ))}
          </div>
        ) : null}

        {layout === "table" ? (
          <div className="company-workspace-preparing__mock-table">
            <div className="company-workspace-preparing__mock-row company-workspace-preparing__mock-row--head">
              {previewColumns.map((column) => (
                <span key={column}>{column}</span>
              ))}
            </div>
            {[0, 1, 2].map((row) => (
              <div key={row} className="company-workspace-preparing__mock-row">
                {previewColumns.map((column) => (
                  <span key={`${row}-${column}`} />
                ))}
              </div>
            ))}
          </div>
        ) : null}

        {layout === "tree" ? (
          <pre className="company-workspace-preparing__mock-tree">{organizationTree || previewNote}</pre>
        ) : null}

        {layout === "slots" ? (
          <div className="company-workspace-preparing__mock-slots">
            {previewSlots.map((slot) => (
              <div key={slot} className="company-workspace-preparing__mock-slot">
                <strong>{slot}</strong>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
