import { Link, useParams } from "react-router-dom";

import { getAccountingLauncherItem } from "../../config/accountingLauncher";
import TitanComingSoonPlaceholder from "../../foundation/pages/TitanComingSoonPlaceholder";

import "../../foundation/styles/titan-hub-page.css";

export default function AccountingFeaturePage() {
  const { featureId } = useParams();
  const item = getAccountingLauncherItem(featureId);

  return (
    <div className="titan-hub-page">
      <p className="titan-hub-page__intro">
        <Link to="/accounting">← 회계관리</Link>
      </p>

      <TitanComingSoonPlaceholder title={item?.label ?? featureId} subtitle="회계관리" />
    </div>
  );
}
