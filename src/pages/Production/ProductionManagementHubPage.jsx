import { useMemo } from "react";

import { PRODUCTION_MANAGEMENT_LAUNCHER_ITEMS } from "../../config/productionManagementLauncher";
import {
  formatLauncherWorkflowLine,
  PRODUCTION_MANAGEMENT_WORKFLOW,
} from "../../config/titanLauncherArchitectureV15";
import TitanLauncherHubPage from "../../foundation/components/TitanLauncherHubPage";
import { buildProductionLauncherMetrics } from "../../utils/operationsLauncherMetrics";
import { getSessionProductionRecords } from "../../utils/productionRecords";

import "../Settings/MasterDataHub.css";

/** 생산관리 Launcher — V1.5 Hub */
export default function ProductionManagementHubPage() {
  const metrics = useMemo(() => buildProductionLauncherMetrics(getSessionProductionRecords()), []);

  return (
    <TitanLauncherHubPage
      intro="생산 Hub — QR 중심 생산 Workflow (계획 → 장입 → 일보 → 실적)"
      workflow={formatLauncherWorkflowLine(PRODUCTION_MANAGEMENT_WORKFLOW)}
      items={PRODUCTION_MANAGEMENT_LAUNCHER_ITEMS}
      metrics={metrics}
      cardsClassName="master-data-hub__cards"
    />
  );
}
