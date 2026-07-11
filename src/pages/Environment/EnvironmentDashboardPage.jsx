import { TitanLauncherCard } from "../../foundation/uiKit";
import {
  ENVIRONMENT_WORKSPACE_COPY,
  getVisibleEnvironmentWorkspaceSections,
} from "../../config/environmentWorkspaceArchitecture";
import { useTitanAuth } from "../../hooks/useTitanAuth";
import { isTitanAdminUser } from "../../utils/titanAdminAccess";

export default function EnvironmentDashboardPage() {
  useTitanAuth();
  const sections = getVisibleEnvironmentWorkspaceSections(isTitanAdminUser());

  return (
    <div className="company-workspace-home company-workspace-home--dashboard company-workspace-home--launcher-only">
      <div className="titan-launcher-grid company-launcher-grid" aria-label="Quick Launcher">
        {sections.map((section) => (
          <TitanLauncherCard
            key={section.id}
            to={section.path}
            icon={section.icon}
            title={section.label}
            description={section.description}
            badge={section.badge}
            badgeColor={section.badgeColor ?? section.launcherTone}
            tone={section.launcherTone ?? "blue"}
          />
        ))}
      </div>
    </div>
  );
}
