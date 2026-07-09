import { useMemo } from "react";
import { useParams } from "react-router-dom";

import { ACCOUNTING_LAUNCHER_ITEMS, getAccountingLauncherItem } from "../../config/accountingLauncher";
import { buildWorkspaceDrilldownBreadcrumb } from "../../config/titanBreadcrumbPolicy";
import TitanBreadcrumb from "../../foundation/components/TitanBreadcrumb";
import TitanEmptyState from "../../foundation/components/TitanEmptyState";
import { WorkspaceNavigationTabs } from "../../foundation/layout/SectionTabs";
import AccountingLitePage from "./AccountingLitePage";

import "../../foundation/layout/SectionPageLayout.css";
import "./Accounting.css";

export default function AccountingFeaturePage() {
  const { featureId } = useParams();
  const item = getAccountingLauncherItem(featureId);
  const isActive = item?.status === "active";

  const workspaceNav = useMemo(
    () => ({
      ariaLabel: "회계관리 Workspace Navigation",
      homePath: "/accounting",
      items: [
        { to: "/accounting", label: "홈" },
        ...ACCOUNTING_LAUNCHER_ITEMS.map((entry) => ({
          to: entry.path,
          label: entry.label,
        })),
      ],
    }),
    []
  );

  const breadcrumbItems = useMemo(
    () =>
      buildWorkspaceDrilldownBreadcrumb({
        hubLabel: "회계관리",
        hubPath: "/accounting",
        items: ACCOUNTING_LAUNCHER_ITEMS.map((entry) => ({
          to: entry.path,
          label: entry.label,
        })),
        pathname: item?.path ?? `/accounting/${featureId}`,
      }),
    [featureId, item?.path]
  );

  return (
    <div className="titan-section-page accounting-workspace">
      <WorkspaceNavigationTabs nav={workspaceNav} />
      <TitanBreadcrumb items={breadcrumbItems} />
      <div className="titan-section-page__body">
        {isActive ? (
          <AccountingLitePage featureId={featureId} />
        ) : (
          <TitanEmptyState
            title={item?.label ?? "회계관리"}
            description="현재 V1.0 범위에서 비활성화된 기능입니다."
          />
        )}
      </div>
    </div>
  );
}
