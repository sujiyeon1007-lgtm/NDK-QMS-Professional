import { Layers3 } from "lucide-react";

export default function EnvironmentSectionPreview({
  layout = "form",
  previewFields = [],
  previewColumns = [],
  previewNote = "",
  sectionIcon: SectionIcon = Layers3,
  sectionLabel = "",
}) {
  return (
    <div className="company-workspace-preparing company-workspace-preparing--compact">
      <div className="company-workspace-preparing__mock" aria-label={`${sectionLabel} 화면 구성`}>
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

        {layout === "tree" && previewNote ? (
          <pre className="company-workspace-preparing__mock-tree">{previewNote}</pre>
        ) : null}
      </div>
    </div>
  );
}
