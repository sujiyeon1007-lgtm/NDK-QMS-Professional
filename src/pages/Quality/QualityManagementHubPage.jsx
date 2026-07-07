import { useMemo } from "react";

import { QUALITY_MANAGEMENT_LAUNCHER_ITEMS } from "../../config/qualityManagementLauncher";
import TitanLauncherHubPage from "../../foundation/components/TitanLauncherHubPage";
import { buildQualityLauncherMetrics } from "../../utils/operationsLauncherMetrics";
import { getSessionProductionRecords } from "../../utils/productionRecords";

import "../Settings/MasterDataHub.css";

/** 품질관리 Launcher — V1.5 Hub */
export default function QualityManagementHubPage() {
  const metrics = useMemo(() => buildQualityLauncherMetrics(getSessionProductionRecords()), []);

  return (
    <TitanLauncherHubPage
      intro="검사 · 성적서 · 품질 문서 업무를 선택합니다. 향후 NCR · CAPA · 고객불만 등을 확장할 수 있습니다."
      items={QUALITY_MANAGEMENT_LAUNCHER_ITEMS}
      metrics={metrics}
      cardsClassName="master-data-hub__cards"
    />
  );
}
