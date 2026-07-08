import { Building2 } from "lucide-react";

import { COMPANY_WORKSPACE_COPY } from "../../../config/companyWorkspaceArchitecture";
import { buildCompanySummary, getCompanyProfile } from "../../../utils/companyWorkspaceService";

function SummaryFieldCard({ label, value, wide = false }) {
  return (
    <div className={`company-summary-field${wide ? " company-summary-field--wide" : ""}`}>
      <span className="company-summary-field__label">{label}</span>
      <strong className="company-summary-field__value">{value || "-"}</strong>
    </div>
  );
}

export default function CompanySummaryCard() {
  const summary = buildCompanySummary();
  const email = getCompanyProfile().companyMaster?.email || "-";

  return (
    <section className="company-workspace-summary" aria-label={COMPANY_WORKSPACE_COPY.summaryTitle}>
      <header className="company-workspace-summary__header">
        <h3 className="company-workspace-summary__title">{COMPANY_WORKSPACE_COPY.summaryTitle}</h3>
      </header>

      <div className="company-summary-layout">
        <div className="company-summary-layout__logo">
          {summary.logoUrl ? (
            <img src={summary.logoUrl} alt="" className="company-workspace-summary__logo" />
          ) : (
            <span className="company-workspace-summary__logo-fallback" aria-hidden="true">
              <Building2 size={36} />
            </span>
          )}
          <strong className="company-summary-layout__company">{summary.companyName}</strong>
        </div>

        <div className="company-summary-grid">
          <SummaryFieldCard label="회사명" value={summary.companyName} />
          <SummaryFieldCard label="대표자" value={summary.representative} />
          <SummaryFieldCard label="사업자번호" value={summary.businessNumber} />
          <SummaryFieldCard label="전화번호" value={summary.phone} />
          <SummaryFieldCard label="주소" value={summary.address} wide />
          <SummaryFieldCard label="대표 이메일" value={email} wide />
        </div>
      </div>
    </section>
  );
}
