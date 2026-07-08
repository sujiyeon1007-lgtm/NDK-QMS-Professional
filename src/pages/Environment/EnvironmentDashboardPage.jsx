import { LayoutGrid } from "lucide-react";

import { TitanDashboardCard, TitanLauncherCard } from "../../foundation/uiKit";
import {
  ENVIRONMENT_WORKSPACE_COPY,
  ENVIRONMENT_WORKSPACE_SECTIONS,
  TITAN_WORKSPACE_HOME_PRINCIPLE,
} from "../../config/environmentWorkspaceArchitecture";

export default function EnvironmentDashboardPage() {
  return (
    <div className="company-workspace-home company-workspace-home--dashboard company-workspace-home--launcher-only">
      <TitanDashboardCard
        className="company-dashboard-panel--launcher"
        title={TITAN_WORKSPACE_HOME_PRINCIPLE.copy.homeLauncherTitle}
        icon={LayoutGrid}
      >
        <div className="titan-launcher-grid company-launcher-grid" aria-label="Quick Launcher">
          {ENVIRONMENT_WORKSPACE_SECTIONS.map((section) => (
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
              placeholderText={ENVIRONMENT_WORKSPACE_COPY.uiPreviewPlaceholder}
            />
          ))}
        </div>
      </TitanDashboardCard>
    </div>
  );
}
