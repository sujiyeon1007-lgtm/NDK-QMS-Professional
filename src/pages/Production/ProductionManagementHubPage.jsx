import { useMemo } from "react";

import { PRODUCTION_MANAGEMENT_LAUNCHER_ITEMS } from "../../config/productionManagementLauncher";
import TitanLauncherHubPage from "../../foundation/components/TitanLauncherHubPage";
import { buildProductionLauncherMetrics } from "../../utils/operationsLauncherMetrics";
import { getSessionProductionRecords } from "../../utils/productionRecords";

import "../Settings/MasterDataHub.css";

/** 생산관리 Launcher — V1.5 Hub */
export default function ProductionManagementHubPage() {
  const metrics = useMemo(() => buildProductionLauncherMetrics(getSessionProductionRecords()), []);

  return (
    <TitanLauncherHubPage
      intro="생산계획 · 생산일보 · LOT · 작업지시 업무를 선택합니다. 향후 생산이력 · 스케줄 등을 확장할 수 있습니다."
      items={PRODUCTION_MANAGEMENT_LAUNCHER_ITEMS}
      metrics={metrics}
      cardsClassName="master-data-hub__cards"
    />
  );
}
