import { LayoutGrid } from "lucide-react";

import { TitanDashboardCard, TitanLauncherCard } from "../../foundation/uiKit";
import {
  COMPANY_WORKSPACE_COPY,
  COMPANY_WORKSPACE_SECTIONS,
} from "../../config/companyWorkspaceArchitecture";

export default function CompanyDashboardPage() {
  return (
    <div className="company-workspace-home company-workspace-home--dashboard company-workspace-home--launcher-only">
      <TitanDashboardCard
        className="company-dashboard-panel--launcher"
        title="Quick Launcher"
        icon={LayoutGrid}
      >
        <div className="titan-launcher-grid company-launcher-grid" aria-label="Quick Launcher">
          {COMPANY_WORKSPACE_SECTIONS.map((section) => (
            <TitanLauncherCard
              key={section.id}
              to={section.path}
              icon={section.icon}
              title={section.label}
              description={section.description}
              badge={section.badge}
              badgeColor={section.badgeColor ?? section.launcherTone}
              tone={section.launcherTone ?? "blue"}
              placeholder={section.placeholder}
              placeholderText={COMPANY_WORKSPACE_COPY.uiPreviewPlaceholder}
            />
          ))}
        </div>
      </TitanDashboardCard>
    </div>
  );
}
