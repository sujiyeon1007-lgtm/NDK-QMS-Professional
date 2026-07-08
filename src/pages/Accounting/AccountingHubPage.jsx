import { ArrowRight, Calculator } from "lucide-react";

import { ACCOUNTING_LAUNCHER_ITEMS } from "../../config/accountingLauncher";
import TitanDashboardCard from "../../foundation/components/TitanDashboardCard";
import TitanLauncherCard from "../../foundation/components/TitanLauncherCard";
import TitanWorkspaceShell from "../../foundation/components/TitanWorkspaceShell";
import { AccountingDashboardLite } from "./AccountingLitePage";

import "./Accounting.css";

export default function AccountingHubPage() {
  const activeItems = ACCOUNTING_LAUNCHER_ITEMS.filter((item) => item.status === "active");
  const comingSoonItems = ACCOUNTING_LAUNCHER_ITEMS.filter((item) => item.status !== "active");

  return (
    <TitanWorkspaceShell
      kicker="Accounting Management"
      title="회계관리"
      intro="TITAN에서 생성된 거래명세서 · 출고자료 · 발행 문서를 회계 관점으로 조회합니다."
      note="조회 전용 · ERP/결산/금융연동 제외"
      isHome
      ariaLabel="회계관리"
      className="accounting-workspace"
    >
      <AccountingDashboardLite />

      <TitanDashboardCard title="Accounting Management Launcher" icon={ArrowRight}>
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
      </TitanDashboardCard>

      <TitanDashboardCard title="Coming Soon" icon={Calculator}>
        <div className="titan-launcher-grid company-launcher-grid accounting-launcher-grid">
          {comingSoonItems.map((item) => (
            <TitanLauncherCard
              key={item.id}
              to={item.path}
              icon={item.icon}
              title={item.label}
              description={item.description}
              badge="Coming Soon"
              badgeColor="gray"
              tone="gray"
              placeholder
              placeholderText="Coming Soon"
            />
          ))}
        </div>
      </TitanDashboardCard>
    </TitanWorkspaceShell>
  );
}
