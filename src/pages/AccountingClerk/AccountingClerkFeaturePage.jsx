import { useMemo } from "react";
import { useParams } from "react-router-dom";

import { getAccountingClerkLauncherItem } from "../../config/accountingClerkLauncher";
import { getWorkspaceNavigation } from "../../config/menuStructure";
import { buildWorkspaceDrilldownBreadcrumb } from "../../config/titanBreadcrumbPolicy";
import TitanBreadcrumb from "../../foundation/components/TitanBreadcrumb";
import TitanEmptyState from "../../foundation/components/TitanEmptyState";
import { WorkspaceNavigationTabs } from "../../foundation/layout/SectionTabs";
import AccountingClerkLitePage from "./AccountingClerkLitePage";

import "../../foundation/layout/SectionPageLayout.css";
import "../../foundation/styles/titan-hub-page.css";
import "./AccountingClerk.css";

export default function AccountingClerkFeaturePage({ featureIdOverride }) {
  const { featureId } = useParams();
  const resolvedFeatureId = featureIdOverride ?? featureId;
  const item = getAccountingClerkLauncherItem(resolvedFeatureId);
  const workspaceNav = getWorkspaceNavigation("managementSupport");

  const breadcrumbItems = useMemo(
    () =>
      buildWorkspaceDrilldownBreadcrumb({
        hubLabel: "경리관리",
        hubPath: "/accounting-clerk",
        items: workspaceNav.items,
        pathname: item?.path ?? `/accounting-clerk/${resolvedFeatureId}`,
      }),
    [item?.path, resolvedFeatureId, workspaceNav.items]
  );

  return (
    <div className="titan-section-page accounting-clerk-workspace">
      <WorkspaceNavigationTabs nav={workspaceNav} />
      <TitanBreadcrumb items={breadcrumbItems} />
      <div className="titan-section-page__body">
        {item?.status === "active" ? (
          <AccountingClerkLitePage featureId={resolvedFeatureId} />
        ) : (
          <TitanEmptyState
            title={item?.label ?? "경리관리"}
            description="현재 V1.0 범위에서 비활성화된 기능입니다."
          />
        )}
      </div>
    </div>
  );
}
