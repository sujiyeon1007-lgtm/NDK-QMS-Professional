import { Link, useParams } from "react-router-dom";

import { getAccountingClerkLauncherItem } from "../../config/accountingClerkLauncher";
import {
  ACCOUNTING_CLERK_PHILOSOPHY,
  ACCOUNTING_CLERK_STUB_MESSAGE,
} from "../../config/accountingClerkPolicy";
import TitanComingSoonPlaceholder from "../../foundation/pages/TitanComingSoonPlaceholder";
import AccountingClerkLitePage from "./AccountingClerkLitePage";

import "../../foundation/styles/titan-hub-page.css";
import "./AccountingClerk.css";

export default function AccountingClerkFeaturePage({ featureIdOverride }) {
  const { featureId } = useParams();
  const resolvedFeatureId = featureIdOverride ?? featureId;
  const item = getAccountingClerkLauncherItem(resolvedFeatureId);

  if (item?.status === "active") {
    return <AccountingClerkLitePage featureId={resolvedFeatureId} />;
  }

  return (
    <div className="titan-hub-page">
      <p className="titan-hub-page__intro">
        <Link to="/accounting-clerk">← 경리관리</Link>
      </p>

      <TitanComingSoonPlaceholder
        title={item?.label ?? featureId}
        subtitle={`${ACCOUNTING_CLERK_STUB_MESSAGE} · ${ACCOUNTING_CLERK_PHILOSOPHY.taxInvoiceNotice}`}
      />
    </div>
  );
}
