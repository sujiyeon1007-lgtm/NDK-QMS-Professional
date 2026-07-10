import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import PageTopBar from "../../foundation/layout/PageTopBar";
import { HOME_PAGE_META } from "../../config/homeDashboard";
import { TITAN_MODULE_REGISTRY } from "../../config/titanV12ModuleExpansion";
import { setTitanErrorContext, clearTitanErrorContext } from "../../utils/titanErrorContext";
import useHomeWorkspace from "./useHomeWorkspace";
import {
  HomeNoticePanel,
  HomeRecentWorkPanel,
  HomeTodaySummary,
  HomeWorkSchedulePanel,
} from "./HomeDashboardPanels";
import HomeLeftPanel from "./HomeLeftPanel";
import HomeWorkLauncherPanel from "./HomeWorkLauncherPanel";
import "./Home.css";

function HomeAccessNotice() {
  const location = useLocation();
  const navigate = useNavigate();
  const moduleId = location.state?.moduleBlocked;
  const permissionBlocked = location.state?.permissionBlocked;

  useEffect(() => {
    if (!moduleId && !permissionBlocked) return undefined;
    const timer = window.setTimeout(() => {
      navigate(location.pathname, { replace: true, state: null });
    }, 8000);
    return () => window.clearTimeout(timer);
  }, [moduleId, permissionBlocked, location.pathname, navigate]);

  if (!moduleId && !permissionBlocked) return null;

  const moduleLabel = moduleId ? TITAN_MODULE_REGISTRY[moduleId]?.label ?? moduleId : null;
  const message = permissionBlocked
    ? "해당 메뉴에 접근할 권한이 없습니다. 환경설정에서 권한을 확인하세요."
    : `${moduleLabel ?? "해당"} 모듈이 비활성화되어 HOME으로 이동했습니다. 환경설정 → 모듈관리에서 ON/OFF를 변경할 수 있습니다.`;

  return (
    <div className="home-access-notice" role="status">
      {message}
    </div>
  );
}

export default function Home() {
  const { records, refreshKey, refresh: handleRefresh } = useHomeWorkspace();

  useEffect(() => {
    setTitanErrorContext({ screen: "HOME", component: "Home", path: "/home" });
    return () => clearTitanErrorContext(["screen", "component"]);
  }, []);

  return (
    <div className="home-page home-page--hub-v15">
      <PageTopBar
        title={HOME_PAGE_META.title}
        kicker={HOME_PAGE_META.kicker}
        onRefresh={handleRefresh}
        compact
      />

      <HomeAccessNotice />

      <HomeTodaySummary records={records} />

      <div className="home-board home-board--hub-v15" aria-label="HOME Dashboard">
        <HomeLeftPanel>
          <HomeNoticePanel refreshKey={refreshKey} onRefresh={handleRefresh} />
          <HomeWorkSchedulePanel refreshKey={refreshKey} onRefresh={handleRefresh} />
          <HomeRecentWorkPanel records={records} />
        </HomeLeftPanel>

        <div className="home-board__main" aria-label="업무 바로가기">
          <HomeWorkLauncherPanel records={records} refreshKey={refreshKey} />
        </div>
      </div>
    </div>
  );
}
