import { Link, useParams } from "react-router-dom";

import { getAccountingLauncherItem } from "../../config/accountingLauncher";
import TitanWorkspaceShell from "../../foundation/components/TitanWorkspaceShell";
import TitanComingSoonPlaceholder from "../../foundation/pages/TitanComingSoonPlaceholder";
import AccountingLitePage from "./AccountingLitePage";

import "./Accounting.css";

export default function AccountingFeaturePage() {
  const { featureId } = useParams();
  const item = getAccountingLauncherItem(featureId);
  const isActive = item?.status === "active";

  return (
    <TitanWorkspaceShell
      kicker="Accounting Management"
      title={item?.label ?? "회계관리"}
      intro={item?.description ?? "TITAN 회계관리 Lite 조회 화면입니다."}
      note={isActive ? "조회 전용" : "Coming Soon"}
      ariaLabel="회계관리"
      className="accounting-workspace"
    >
      <p className="accounting-lite-back">
        <Link to="/accounting">← 회계관리</Link>
      </p>

      {isActive ? (
        <AccountingLitePage featureId={featureId} />
      ) : (
        <TitanComingSoonPlaceholder title={item?.label ?? featureId} subtitle="회계관리 · V1.0 범위 제외" />
      )}
    </TitanWorkspaceShell>
  );
}
