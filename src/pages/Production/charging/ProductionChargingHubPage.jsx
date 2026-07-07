import { useMemo } from "react";

import {
  PRODUCTION_CHARGING_LAUNCHER_ITEMS,
  PRODUCTION_CHARGING_HUB_WORKFLOW,
} from "../../../config/productionChargingLauncher";
import { formatLauncherWorkflowLine } from "../../../config/titanLauncherArchitectureV15";
import TitanLauncherHubPage from "../../../foundation/components/TitanLauncherHubPage";
import { getSessionProductionRecords } from "../../../utils/productionRecords";
import { buildProductionChargingLauncherMetrics } from "../../../utils/operationsLauncherMetrics";
import EquipmentQrScanBar from "../../QrManagement/components/EquipmentQrScanBar";
import { useEquipmentQrScan } from "../../QrManagement/hooks/useEquipmentQrScan";

import "../../Settings/MasterDataHub.css";
import "../../QrManagement/QRManagement.css";

/** 생산관리 → 설비 장입관리 Launcher Hub (PM V1.5) */
export default function ProductionChargingHubPage() {
  const metrics = useMemo(
    () => buildProductionChargingLauncherMetrics(getSessionProductionRecords()),
    []
  );
  const { scan, error, processing } = useEquipmentQrScan();

  return (
    <>
      <div className="qr-management-page" style={{ padding: "0 0 12px" }}>
        <EquipmentQrScanBar onScan={scan} error={error} disabled={processing} />
      </div>
      <TitanLauncherHubPage
        intro="설비 장입 Hub — 공정별 설비 선택 후 장입 · 열처리 완료를 수행합니다."
        workflow={formatLauncherWorkflowLine(PRODUCTION_CHARGING_HUB_WORKFLOW)}
        items={PRODUCTION_CHARGING_LAUNCHER_ITEMS}
        metrics={metrics}
        cardsClassName="master-data-hub__cards"
      />
    </>
  );
}
