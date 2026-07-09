import { ACCOUNTING_CLERK_LAUNCHER_ITEMS } from "../../config/accountingClerkLauncher";
import { getWorkspaceNavigation } from "../../config/menuStructure";
import {
  TitanLauncherCard,
  TitanWorkspaceShell,
} from "../../foundation/uiKit";
import {
  buildAccountingClosingSummary,
  buildAccountingStatementRows,
  getAccountingInternalItemRows,
} from "../../utils/accountingClerkLiteService";

import "./AccountingClerk.css";

export default function AccountingClerkHubPage() {
  const workspaceNav = getWorkspaceNavigation("managementSupport");
  const statementRows = buildAccountingStatementRows();
  const pendingStatements = statementRows.filter((row) => row.record && !row.statement).length;
  const outboundScheduled = statementRows.filter((row) => row.record).length;
  const closingSummary = buildAccountingClosingSummary();
  const internalItems = getAccountingInternalItemRows();
  const purchaseDue = internalItems.filter((row) => row.paymentStatus !== "지급완료").length;
  const todayWorkItems = [
    { id: "pendingStatements", label: "금일 거래명세서 발행 대기", value: `${pendingStatements}건` },
    { id: "outboundScheduled", label: "금일 출고 예정/조회", value: `${outboundScheduled}건` },
    { id: "unpaidCompanies", label: "미입금 거래처", value: `${closingSummary.vendorCount}곳` },
    { id: "purchaseDue", label: "사내 물품 발주/결제 예정", value: `${purchaseDue}건` },
  ];

  return (
    <TitanWorkspaceShell
      kicker="Accounting Clerk Lite"
      title="경리관리 Lite"
      intro="거래처 조회, 출고 통계, 사내 물품 관리, 마감관리 업무를 선택합니다."
      navItems={workspaceNav.items}
      homePath={workspaceNav.homePath}
      ariaLabel="Accounting Clerk Lite"
      isHome
      className="accounting-clerk-workspace"
    >
      <div className="accounting-clerk-page">
        <section className="accounting-clerk-today" aria-label="경리관리 금일 업무">
          <div className="accounting-clerk-today__head">
            <strong>금일 업무</strong>
            <span>발행 · 출고 · 수금 · 사내 물품 확인</span>
          </div>
          <div className="accounting-work-summary">
            {todayWorkItems.map((item) => (
              <article key={item.id} className="accounting-work-summary__item">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </article>
            ))}
          </div>
        </section>

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
            />
          ))}
        </div>
      </div>
    </TitanWorkspaceShell>
  );
}
