import { useMemo } from "react";

import { INOUT_MANAGEMENT_LAUNCHER_ITEMS } from "../../config/inoutManagementLauncher";
import TitanLauncherHubPage from "../../foundation/components/TitanLauncherHubPage";
import { buildInoutLauncherMetrics } from "../../utils/operationsLauncherMetrics";
import { getSessionProductionRecords } from "../../utils/productionRecords";

import "../../pages/Settings/MasterDataHub.css";

/** 입출고관리 Launcher — V1.5 Hub */
export default function InoutManagementHubPage() {
  const metrics = useMemo(() => buildInoutLauncherMetrics(getSessionProductionRecords()), []);

  return (
    <TitanLauncherHubPage
      intro="입고 · 출고 · 이력 · 출력 업무를 선택합니다. 각 카드는 해당 업무 화면으로 이동합니다."
      items={INOUT_MANAGEMENT_LAUNCHER_ITEMS}
      metrics={metrics}
      cardsClassName="master-data-hub__cards"
    />
  );
}
