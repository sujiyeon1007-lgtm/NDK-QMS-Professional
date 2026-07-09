import { ACCOUNTING_LAUNCHER_ITEMS } from "../../config/accountingLauncher";
import { getWorkspaceNavigation } from "../../config/menuStructure";
import TitanLauncherCard from "../../foundation/components/TitanLauncherCard";
import TitanWorkspaceShell from "../../foundation/components/TitanWorkspaceShell";

import "./Accounting.css";

export default function AccountingHubPage() {
  const activeItems = ACCOUNTING_LAUNCHER_ITEMS.filter((item) => item.status === "active");
  const workspaceNav = getWorkspaceNavigation("managementSupport");

  return (
    <TitanWorkspaceShell
      kicker="Accounting Management"
      title="회계관리"
      intro="거래명세서 · 출고자료 · 발행 문서 기반 회계 업무를 선택합니다."
      navItems={workspaceNav.items}
      homePath={workspaceNav.homePath}
      isHome
      ariaLabel="회계관리"
      className="accounting-workspace"
    >
      <div className="titan-launcher-grid company-launcher-grid accounting-launcher-grid">
        {activeItems.map((item) => (
          <TitanLauncherCard
            key={item.id}
            to={item.path}
            icon={item.icon}
            title={item.label}
            description={item.description}
            badge={item.badge}
            badgeColor={item.badgeColor}
            tone={item.tone}
          />
        ))}
      </div>
    </TitanWorkspaceShell>
  );
}
