import { Outlet, useLocation } from "react-router-dom";

import {
  isRc1DocumentsComingSoonPath,
  RC1_DOCUMENTS_COMING_SOON,
  RC1_DOCUMENTS_POLICY,
} from "../../config/rc1OperationalPolicy";
import { DOCUMENT_MANAGEMENT_LAUNCHER_ITEMS } from "../../config/qualityDocumentManagement";
import { getWorkspaceNavigation } from "../../config/menuStructure";
import TitanComingSoonPlaceholder from "../../foundation/pages/TitanComingSoonPlaceholder";
import TitanBreadcrumb from "../../foundation/components/TitanBreadcrumb";
import TitanLauncherHubPage from "../../foundation/components/TitanLauncherHubPage";
import { SectionPageActionsProvider } from "../../foundation/layout/SectionPageActionsContext";
import { WorkspaceNavigationTabs } from "../../foundation/layout/SectionTabs";

import "../../foundation/layout/SectionPageLayout.css";
import "../../foundation/styles/titan-hub-page.css";
import "../Settings/MasterDataHub.css";
import "./DocumentManagementPage.css";

const DOCUMENT_ROUTE_LABELS = [
  { prefix: "/documents/quality/certificates", label: "인증서 관리" },
  { prefix: "/documents/quality/by-company", label: "업체별 문서관리" },
  { prefix: "/documents/incoming/purchase-orders", label: "발주서" },
  { prefix: "/documents/incoming/return-slips", label: "반출증" },
  { prefix: "/documents/incoming/other", label: "기타 수신문서" },
  { prefix: "/documents/internal", label: "사내문서" },
  { prefix: "/documents/incoming-archive", label: "수신문서 보관함" },
  { prefix: "/documents/registry", label: "업체별 문서관리" },
  { prefix: "/documents/inspection", label: "검사기준서" },
];

function resolveDocumentsBreadcrumbItems(pathname) {
  const path = String(pathname).split("?")[0];
  const items = [
    { label: "품질관리", to: "/quality" },
    { label: "문서관리", to: path === "/documents" ? undefined : "/documents" },
  ];

  const matched = DOCUMENT_ROUTE_LABELS.find((entry) => path.startsWith(entry.prefix));
  if (matched) {
    items.push({ label: matched.label });
  }

  return items;
}

/** Documents launcher hub - RC1 */
export function DocumentsHubPage() {
  return (
    <TitanLauncherHubPage
      items={DOCUMENT_MANAGEMENT_LAUNCHER_ITEMS}
      metrics={{}}
      cardsClassName="master-data-hub__cards"
    />
  );
}

function resolveDocumentsComingSoonTitle(pathname) {
  const path = String(pathname).split("?")[0];
  if (path.startsWith("/documents/quality/")) return "품질문서";
  if (path.startsWith("/documents/incoming-archive")) return "수신문서 보관함";
  if (path.startsWith("/documents/internal")) return "사내문서";
  return "문서관리";
}

export default function DocumentsLayout() {
  const location = useLocation();
  const workspaceNav = getWorkspaceNavigation("quality");
  const breadcrumbItems = resolveDocumentsBreadcrumbItems(location.pathname);
  const showComingSoon =
    RC1_DOCUMENTS_COMING_SOON && isRc1DocumentsComingSoonPath(location.pathname);

  return (
    <SectionPageActionsProvider>
      <div className="titan-section-page">
        <WorkspaceNavigationTabs nav={workspaceNav} />
        <TitanBreadcrumb items={breadcrumbItems} />
        <div className="titan-section-page__body">
          {showComingSoon ? (
            <TitanComingSoonPlaceholder
              title={resolveDocumentsComingSoonTitle(location.pathname)}
              subtitle={RC1_DOCUMENTS_POLICY.subtitle}
            />
          ) : (
            <Outlet />
          )}
        </div>
      </div>
    </SectionPageActionsProvider>
  );
}
