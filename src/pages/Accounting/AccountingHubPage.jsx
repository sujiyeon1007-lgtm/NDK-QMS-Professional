import { Link } from "react-router-dom";

import { ACCOUNTING_LAUNCHER_ITEMS } from "../../config/accountingLauncher";

import "../../foundation/styles/titan-hub-page.css";

export default function AccountingHubPage() {
  return (
    <div className="titan-hub-page">
      <p className="titan-hub-page__intro">
        ERP를 대체하지 않습니다. 회계전표 · 계정과목 · 월별/원가/부가세 현황 등 회계 업무를
        지원하는 수준으로 제공합니다. 사용하지 않는 경우 환경설정에서 모듈 OFF가 가능합니다.
      </p>

      <div className="titan-hub-page__cards">
        {ACCOUNTING_LAUNCHER_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.id} to={item.path} className="titan-hub-card">
              <Icon size={22} aria-hidden="true" />
              <span className="titan-hub-card__label">{item.label}</span>
              <span className="titan-hub-card__desc">{item.description}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
