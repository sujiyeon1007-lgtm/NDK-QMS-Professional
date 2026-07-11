import { useState } from "react";

import { getEnvironmentSectionById } from "../../config/environmentWorkspaceArchitecture";
import { TitanEmptyState } from "../../foundation/uiKit";
import { renderEnvironmentSection } from "./EnvironmentSections";

/** Workspace section id → legacy environment tab id (CRUD wired) */
const ENVIRONMENT_WIRED_SECTION_TAB_MAP = {
  users: "users",
  permissions: "permissions",
  menus: "menus",
  menuToggle: "modules",
  numbering: "numbering",
  processTemplates: "processTemplates",
  inspectionTemplates: "inspectionTemplates",
  certificatePolicies: "certificatePolicies",
  qrSettings: "qrSettings",
  backup: "backup",
  notifications: "notifications",
  system: "status",
  data: "data",
};

export default function EnvironmentSectionPage({ sectionId }) {
  const section = getEnvironmentSectionById(sectionId);
  const [refreshKey, setRefreshKey] = useState(0);

  if (!section) return null;

  const tabId = ENVIRONMENT_WIRED_SECTION_TAB_MAP[sectionId];

  if (tabId) {
    return (
      <div className="company-workspace-section-page environment-workspace-section-page">
        {renderEnvironmentSection(tabId, {
          refreshKey,
          onRefresh: () => setRefreshKey((key) => key + 1),
        })}
      </div>
    );
  }

  return (
    <div className="company-workspace-section-page environment-workspace-section-page">
      <TitanEmptyState
        title={`${section.label} — 준비 중`}
        description="UI 승인 후 데이터 입력 · CRUD가 연결됩니다. Loading(Skeleton)이 아닌 Empty State로 표시합니다."
      />
    </div>
  );
}
