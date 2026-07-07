import { useMemo, useState } from "react";

import PageTopBar from "../../foundation/layout/PageTopBar";
import { PRODUCT_STATUS_PAGE_COPY } from "../../config/equipmentConfig";
import { getSessionProductionRecords } from "../../utils/productionRecords";
import {
  HomeProgressOverviewPanel,
  HomeProductProgressTable,
} from "../Home/HomeDashboardPanels";
import { useHomeIntegratedSearch } from "../Home/useHomeIntegratedSearch";
import "./ProductStatusPage.css";

export default function ProductStatusPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const records = useMemo(() => getSessionProductionRecords(), [refreshKey]);
  const {
    search,
    activeChipId,
    handleChipClick,
  } = useHomeIntegratedSearch();

  return (
    <div className="product-status-page">
      <PageTopBar
        kicker={PRODUCT_STATUS_PAGE_COPY.kicker}
        title={PRODUCT_STATUS_PAGE_COPY.title}
        description={PRODUCT_STATUS_PAGE_COPY.description}
        onRefresh={() => setRefreshKey((value) => value + 1)}
      />

      <section className="product-status-page__panel titan-card" aria-label="제품 현황">
        <HomeProgressOverviewPanel
          records={records}
          activeChipId={activeChipId}
          onChipClick={handleChipClick}
        />
        <HomeProductProgressTable records={records} search={search} />
      </section>
    </div>
  );
}
