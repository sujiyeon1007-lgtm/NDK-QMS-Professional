import { Navigate, Outlet, useLocation } from "react-router-dom";
import { resolveMenuSectionByPathname } from "../../config/menuConfig";
import SectionPageLayout from "../../foundation/layout/SectionPageLayout";

const STATISTICS_DESCRIPTION = "생산 · 품질 · 영업 통계를 동일 기준으로 조회하고 분석합니다.";

export default function StatisticsLayout() {
  const location = useLocation();
  const section = resolveMenuSectionByPathname(location.pathname);

  if (location.pathname === "/statistics" || location.pathname === "/statistics/") {
    return <Navigate to="/statistics/dashboard" replace />;
  }

  if (!section) return null;

  return (
    <SectionPageLayout section={section} description={STATISTICS_DESCRIPTION}>
      <Outlet />
    </SectionPageLayout>
  );
}
