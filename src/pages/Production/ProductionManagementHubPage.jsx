import { useMemo } from "react";

import { PRODUCTION_MANAGEMENT_LAUNCHER_ITEMS } from "../../config/productionManagementLauncher";
import TitanLauncherHubPage from "../../foundation/components/TitanLauncherHubPage";
import {
  buildOperationsDashboardKpiCounts,
  buildProductionLauncherMetrics,
} from "../../utils/operationsLauncherMetrics";
import { getSessionProductionRecords } from "../../utils/productionRecords";
import { OperationsManagementKpiRow } from "../InOut/InoutManagementHubPage";

import "../Settings/MasterDataHub.css";

/** 생산관리 Launcher — V1.5 Hub */
export default function ProductionManagementHubPage() {
  const records = useMemo(() => getSessionProductionRecords(), []);
  const metrics = useMemo(() => buildProductionLauncherMetrics(records), [records]);
  const kpiCounts = useMemo(() => buildOperationsDashboardKpiCounts(records), [records]);

  return (
    <TitanLauncherHubPage
      items={PRODUCTION_MANAGEMENT_LAUNCHER_ITEMS}
      metrics={metrics}
      cardsClassName="master-data-hub__cards"
      header={<OperationsManagementKpiRow counts={kpiCounts} />}
    />
  );
}
