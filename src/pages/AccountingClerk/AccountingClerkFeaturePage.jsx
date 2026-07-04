import { Link, useParams } from "react-router-dom";

import { getAccountingClerkLauncherItem } from "../../config/accountingClerkLauncher";
import { ACCOUNTING_CLERK_PHILOSOPHY } from "../../config/accountingClerkPolicy";
import TitanComingSoonPlaceholder from "../../foundation/pages/TitanComingSoonPlaceholder";

import "../../foundation/styles/titan-hub-page.css";
import "./AccountingClerk.css";

export default function AccountingClerkFeaturePage() {
  const { featureId } = useParams();
  const item = getAccountingClerkLauncherItem(featureId);

  return (
    <div className="titan-hub-page">
      <p className="titan-hub-page__intro">
        <Link to="/accounting-clerk">← 경리관리</Link>
      </p>

      <TitanComingSoonPlaceholder
        title={item?.label ?? featureId}
        subtitle={ACCOUNTING_CLERK_PHILOSOPHY.taxInvoiceNotice}
      />
    </div>
  );
}
