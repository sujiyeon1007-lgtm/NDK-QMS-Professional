import {
  ENVIRONMENT_SECTION_UI,
  getEnvironmentSectionById,
} from "../../config/environmentWorkspaceArchitecture";
import EnvironmentSectionPreview from "./EnvironmentSectionPreview";

export default function EnvironmentSectionPage({ sectionId }) {
  const section = getEnvironmentSectionById(sectionId);
  const ui = ENVIRONMENT_SECTION_UI[sectionId] ?? {};
  const Icon = section?.icon;

  if (!section) return null;

  return (
    <div className="company-workspace-section-page">
      <EnvironmentSectionPreview
        layout={ui.layout}
        previewFields={ui.previewFields}
        previewColumns={ui.previewColumns}
        previewNote={ui.previewNote}
        sectionIcon={Icon}
        sectionLabel={section.label}
      />
    </div>
  );
}
