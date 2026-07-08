import { ArrowRight, Wallet } from "lucide-react";

import { ACCOUNTING_CLERK_LAUNCHER_ITEMS } from "../../config/accountingClerkLauncher";
import {
  ACCOUNTING_CLERK_PHILOSOPHY,
  ACCOUNTING_CLERK_WORKFLOW_STEPS,
} from "../../config/accountingClerkPolicy";
import {
  TitanDashboardCard,
  TitanLauncherCard,
  TitanMetricCard,
  TitanWorkspaceShell,
} from "../../foundation/uiKit";

import "./AccountingClerk.css";

export default function AccountingClerkHubPage() {
  const activeCount = ACCOUNTING_CLERK_LAUNCHER_ITEMS.filter((item) => item.status === "active").length;
  const comingSoonCount = ACCOUNTING_CLERK_LAUNCHER_ITEMS.length - activeCount;

  return (
    <TitanWorkspaceShell
      kicker="Accounting Clerk Lite"
      title="경리관리 Lite"
      intro={ACCOUNTING_CLERK_PHILOSOPHY.body}
      note={ACCOUNTING_CLERK_PHILOSOPHY.taxInvoiceNotice}
      ariaLabel="Accounting Clerk Lite"
      isHome
      className="accounting-clerk-workspace"
    >
      <div className="accounting-clerk-page">
        <section className="accounting-clerk-metrics" aria-label="경리관리 Lite 요약">
          <TitanMetricCard title="V1.0 Lite 기능" value={`${activeCount}개`} description="출고·거래명세서 중심" icon={Wallet} tone="blue" />
          <TitanMetricCard title="Coming Soon" value={`${comingSoonCount}개`} description="ERP 회계·금융 범위 제외" tone="gray" />
          <TitanMetricCard title="연계 범위" value="출고 → PDF" description="거래처 Master 조회 포함" tone="green" />
        </section>

        <TitanDashboardCard title="Workflow" icon={ArrowRight}>
          <div className="accounting-clerk-hub__workflow-steps">
            {ACCOUNTING_CLERK_WORKFLOW_STEPS.map((step, index) => (
              <span key={step.id} className="accounting-clerk-hub__workflow-step">
                {index > 0 ? (
                  <span className="accounting-clerk-hub__workflow-arrow" aria-hidden="true">
                    →
                  </span>
                ) : null}
                <span className={step.future ? "accounting-clerk-hub__workflow-step--external" : undefined}>
                  {step.label}
                </span>
              </span>
            ))}
          </div>
        </TitanDashboardCard>

        <div className="titan-launcher-grid company-launcher-grid accounting-clerk-launcher-grid">
          {ACCOUNTING_CLERK_LAUNCHER_ITEMS.map((item) => (
            <TitanLauncherCard
              key={item.id}
              to={item.path}
              icon={item.icon}
              title={item.label}
              description={item.description}
              badge={item.statusLabel}
              badgeColor={item.badgeColor}
              tone={item.tone}
              placeholder={item.placeholder}
              placeholderText="Coming Soon"
            />
          ))}
        </div>
      </div>
    </TitanWorkspaceShell>
  );
}
