import { useMemo } from "react";

import { INOUT_MANAGEMENT_LAUNCHER_ITEMS } from "../../config/inoutManagementLauncher";
import {
  formatLauncherWorkflowLine,
  INOUT_MANAGEMENT_WORKFLOW,
} from "../../config/titanLauncherArchitectureV15";
import TitanLauncherHubPage from "../../foundation/components/TitanLauncherHubPage";
import { buildInoutLauncherMetrics } from "../../utils/operationsLauncherMetrics";
import { getSessionProductionRecords } from "../../utils/productionRecords";

import "../../pages/Settings/MasterDataHub.css";

/** 운영관리 Launcher — V2.0 Hub */
export default function InoutManagementHubPage() {
  const metrics = useMemo(() => buildInoutLauncherMetrics(getSessionProductionRecords()), []);

  return (
    <TitanLauncherHubPage
      intro="운영 Hub — 입고 · 출고 · 이력 · 재고 · 출력 업무를 한 곳에서 선택합니다."
      workflow={formatLauncherWorkflowLine(INOUT_MANAGEMENT_WORKFLOW)}
      items={INOUT_MANAGEMENT_LAUNCHER_ITEMS}
      metrics={metrics}
      cardsClassName="master-data-hub__cards"
    />
  );
}
