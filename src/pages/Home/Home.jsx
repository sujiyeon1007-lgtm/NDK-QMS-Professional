import { useEffect, useMemo, useState } from "react";

import PageTopBar from "../../foundation/layout/PageTopBar";
import { HOME_PAGE_META } from "../../config/homeDashboard";
import { buildProductWorkflowPreview } from "../../utils/homeDashboardData";
import { getSessionProductionRecords } from "../../utils/productionRecords";
import { getMasterDataByCategory } from "../../utils/masterData";
import { setTitanErrorContext, clearTitanErrorContext } from "../../utils/titanErrorContext";
import {
  HomeIntegratedSearchPanel,
  HomeKpiPanel,
  HomeNoticePanel,
  HomeProgressPanel,
  HomeRecentWorkPanel,
  HomeWorkSchedulePanel,
} from "./HomeDashboardPanels";
import { useHomeIntegratedSearch } from "./useHomeIntegratedSearch";
import "./Home.css";

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
        description={HOME_PAGE_META.description}
        onRefresh={handleRefresh}
      />

      <HomeKpiPanel records={records} />

      <div className="home-board">
        <aside className="home-board__left" aria-label="업무 지원 · 최근 이력">
          <HomeNoticePanel refreshKey={refreshKey} />
          <HomeWorkSchedulePanel refreshKey={refreshKey} onRefresh={handleRefresh} />
          <div className="home-board__cell home-board__cell--recent" aria-label="최근 작업 이력">
            <HomeRecentWorkPanel records={records} />
          </div>
        </aside>

        <div className="home-board__right" aria-label="검색 · 진행현황">
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
