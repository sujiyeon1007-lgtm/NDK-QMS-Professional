import { Navigate, useParams } from "react-router-dom";
import { getSectionById, getActiveTab, INOUT_TAB_FEATURES } from "../../config/menuStructure";
import SectionPageLayout from "../layout/SectionPageLayout";
import PagePlaceholder from "./PagePlaceholder";

function buildTabNote(sectionId, tabId) {
  if (sectionId === "inout" && INOUT_TAB_FEATURES[tabId]) {
    return `포함 기능: ${INOUT_TAB_FEATURES[tabId].join(" · ")} · 화면 설계 승인 후 구현`;
  }
  return "화면 설계 승인 후 Foundation 컴포넌트로 구현";
}

/**
 * PM 승인 섹션 공통 페이지 — 탭별 placeholder (설계 승인 전)
 */
export default function SectionPage({ sectionId }) {
  const { tab } = useParams();
  const section = getSectionById(sectionId);

  if (!section) {
    return <PagePlaceholder title="알 수 없는 메뉴" />;
  }

  if (!tab) {
    return <Navigate to={`${section.pathPrefix}/${section.defaultTab}`} replace />;
  }

  const pathname = `${section.pathPrefix}/${tab}`;
  const activeTab = getActiveTab(section, pathname);

  if (activeTab.id !== tab) {
    return <Navigate to={activeTab.path} replace />;
  }

  return (
    <SectionPageLayout section={section}>
      <PagePlaceholder
        section={section.label}
        title={activeTab.label}
        note={buildTabNote(sectionId, activeTab.id)}
      />
    </SectionPageLayout>
  );
}
