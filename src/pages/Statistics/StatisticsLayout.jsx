import { Navigate, Outlet, useLocation } from "react-router-dom";
import { resolveMenuSectionByPathname } from "../../config/menuConfig";
import { RC1_STATISTICS_COMING_SOON } from "../../config/rc1OperationalPolicy";
import SectionPageLayout from "../../foundation/layout/SectionPageLayout";
import TitanComingSoonPlaceholder from "../../foundation/pages/TitanComingSoonPlaceholder";

const STATISTICS_DESCRIPTION = "생산 · 품질 · 영업 통계를 동일 기준으로 조회하고 분석합니다.";
const STATISTICS_COMING_SOON_SUBTITLE =
  "RC1 운영 안정화 기간 중 통계 대시보드는 준비 중입니다. 정확한 운영 데이터 기반 통계는 V1.1에서 활성화될 예정입니다.";

export default function StatisticsLayout() {
  const location = useLocation();
  const section = resolveMenuSectionByPathname(location.pathname);

  if (location.pathname === "/statistics" || location.pathname === "/statistics/") {
    return <Navigate to="/statistics/dashboard" replace />;
  }

  if (!section) return null;

  return (
    <SectionPageLayout section={section} description={STATISTICS_DESCRIPTION}>
      {RC1_STATISTICS_COMING_SOON ? (
        <TitanComingSoonPlaceholder title="통계관리" subtitle={STATISTICS_COMING_SOON_SUBTITLE} />
      ) : (
        <Outlet />
      )}
    </SectionPageLayout>
  );
}
