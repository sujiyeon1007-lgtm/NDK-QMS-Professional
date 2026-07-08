import { Layers3 } from "lucide-react";

import { ENVIRONMENT_WORKSPACE_COPY } from "../../config/environmentWorkspaceArchitecture";

export default function EnvironmentSectionPreview({
  layout = "form",
  previewFields = [],
  previewColumns = [],
  previewNote = "",
  placeholder = false,
  sectionIcon: SectionIcon = Layers3,
}) {
  const note = placeholder ? ENVIRONMENT_WORKSPACE_COPY.uiPreviewNote : previewNote;

  return (
    <div className="company-workspace-preparing">
      <div className="company-workspace-preparing__hero">
        <span className="company-workspace-preparing__icon" aria-hidden="true">
          <SectionIcon size={34} />
        </span>
        <div className="company-workspace-preparing__copy">
          <span className="company-workspace-preparing__badge">
            {ENVIRONMENT_WORKSPACE_COPY.uiPreviewBadge}
          </span>
          <h3 className="company-workspace-preparing__title">
            {ENVIRONMENT_WORKSPACE_COPY.uiPreviewTitle}
          </h3>
          <p className="company-workspace-preparing__note">{note}</p>
          <div className="company-workspace-preparing__tags">
            <span>{ENVIRONMENT_WORKSPACE_COPY.uiPreviewSample}</span>
            <span>{ENVIRONMENT_WORKSPACE_COPY.uiPreviewPlaceholder}</span>
            <span>{ENVIRONMENT_WORKSPACE_COPY.uiPreviewFuture}</span>
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
          <pre className="company-workspace-preparing__mock-tree">{previewNote}</pre>
        ) : null}
      </div>
    </div>
  );
}
