import { useMemo } from "react";

import { QUALITY_MANAGEMENT_LAUNCHER_ITEMS } from "../../config/qualityManagementLauncher";
import {
  formatLauncherWorkflowLine,
  QUALITY_MANAGEMENT_WORKFLOW,
} from "../../config/titanLauncherArchitectureV15";
import TitanLauncherHubPage from "../../foundation/components/TitanLauncherHubPage";
import { buildQualityLauncherMetrics } from "../../utils/operationsLauncherMetrics";
import { getSessionProductionRecords } from "../../utils/productionRecords";

import "../Settings/MasterDataHub.css";

/** 품질관리 Launcher — V1.5 Hub */
export default function QualityManagementHubPage() {
  const metrics = useMemo(() => buildQualityLauncherMetrics(getSessionProductionRecords()), []);

  return (
    <TitanLauncherHubPage
      intro="품질 Hub — 검사 · 성적서 · 품질 문서 업무를 한 곳에서 선택합니다."
      workflow={formatLauncherWorkflowLine(QUALITY_MANAGEMENT_WORKFLOW)}
      items={QUALITY_MANAGEMENT_LAUNCHER_ITEMS}
      metrics={metrics}
      cardsClassName="master-data-hub__cards"
    />
  );
}
