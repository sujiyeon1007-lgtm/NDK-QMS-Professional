import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import PageTopBar from "../../foundation/layout/PageTopBar";
import { HOME_PAGE_META } from "../../config/homeDashboard";
import { TITAN_MODULE_REGISTRY } from "../../config/titanV12ModuleExpansion";
import { buildProductWorkflowPreview } from "../../utils/homeDashboardData";
import { getSessionProductionRecords } from "../../utils/productionRecords";
import { getMasterDataByCategory } from "../../utils/masterData";
import { setTitanErrorContext, clearTitanErrorContext } from "../../utils/titanErrorContext";
import {
  HomeIntegratedSearchPanel,
  HomeNoticePanel,
  HomeProgressPanel,
  HomeRecentWorkPanel,
  HomeTodaySummary,
  HomeTodayTasksPanel,
} from "./HomeDashboardPanels";
import HomeLeftPanel from "./HomeLeftPanel";
import { useHomeIntegratedSearch } from "./useHomeIntegratedSearch";
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
  const [refreshKey, setRefreshKey] = useState(0);
  const {
    search,
    draft,
    onDraftChange,
    onSearch,
    onReset,
    advancedOpen,
    onAdvancedToggle,
    activeChipId,
    handleChipClick,
  } = useHomeIntegratedSearch();

  const records = useMemo(() => getSessionProductionRecords(), [refreshKey]);
  const companies = useMemo(() => getMasterDataByCategory("companies"), []);
  const searchRecords = useMemo(
    () => buildProductWorkflowPreview(records, { limit: 9999 }),
    [records]
  );

  useEffect(() => {
    setTitanErrorContext({ screen: "HOME", component: "Home", path: "/home" });
    return () => clearTitanErrorContext(["screen", "component"]);
  }, []);

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="home-page">
      <PageTopBar
        title={HOME_PAGE_META.title}
        kicker={HOME_PAGE_META.kicker}
        onRefresh={handleRefresh}
        compact
      />

      <HomeAccessNotice />

      <HomeTodaySummary records={records} />

      <div className="home-board" aria-label="HOME Dashboard">
        <HomeLeftPanel>
          <HomeNoticePanel refreshKey={refreshKey} onRefresh={handleRefresh} />
          <HomeTodayTasksPanel
            records={records}
            refreshKey={refreshKey}
            onRefresh={handleRefresh}
          />
          <HomeRecentWorkPanel records={records} />
        </HomeLeftPanel>

        <div className="home-board__right" aria-label="통합검색 · 진행현황">
          <div className="home-board__cell home-board__cell--search">
            <HomeIntegratedSearchPanel
              draft={draft}
              onDraftChange={onDraftChange}
              onSearch={onSearch}
              onReset={onReset}
              advancedOpen={advancedOpen}
              onAdvancedToggle={onAdvancedToggle}
              companies={companies}
              searchRecords={searchRecords}
            />
          </div>

          <div className="home-board__cell home-board__cell--progress">
            <HomeProgressPanel
              records={records}
              search={search}
              activeChipId={activeChipId}
              onChipClick={handleChipClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
