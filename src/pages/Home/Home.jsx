import { useEffect, useMemo, useState } from "react";

import PageTopBar from "../../foundation/layout/PageTopBar";
import TitanWorkflowStatusChipBar from "../../foundation/components/TitanWorkflowStatusChipBar";
import { HOME_INTEGRATED_SEARCH_CONFIG } from "../../config/homeIntegratedSearch";
import { HOME_PAGE_META } from "../../config/homeDashboard";
import { buildProductWorkflowPreview } from "../../utils/homeDashboardData";
import { getSessionProductionRecords } from "../../utils/productionRecords";
import { getMasterDataByCategory } from "../../utils/masterData";
import { setTitanErrorContext, clearTitanErrorContext } from "../../utils/titanErrorContext";
import {
  HomeIntegratedSearchPanel,
  HomeNoticePanel,
  HomeProductWorkflowPanel,
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
        description={HOME_PAGE_META.description}
        onRefresh={handleRefresh}
      />

      <div className="home-board">
        <aside className="home-board__left" aria-label="업무 지원">
          <HomeNoticePanel refreshKey={refreshKey} />
          <HomeWorkSchedulePanel refreshKey={refreshKey} onRefresh={handleRefresh} />
        </aside>

        <div className="home-board__right" aria-label="실시간 업무">
          <div className="home-board__cell home-board__cell--kpi titan-kpi-bar-slot">
            <TitanWorkflowStatusChipBar
              chipSetId={HOME_INTEGRATED_SEARCH_CONFIG.chipSetId}
              records={records}
              activeId={activeChipId}
              onChipClick={handleChipClick}
            />
          </div>

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

          <div className="home-board__cell home-board__cell--workflow">
            <HomeProductWorkflowPanel records={records} search={search} />
          </div>
        </div>
      </div>
    </div>
  );
}
