import { useMemo } from "react";

import { QR_CHARGING_LAUNCHER_ITEMS } from "../../config/qrChargingLauncher";
import TitanLauncherHubPage from "../../foundation/components/TitanLauncherHubPage";
import { buildQrChargingLauncherMetrics } from "../../utils/operationsLauncherMetrics";

import "../Settings/MasterDataHub.css";

/** 설비 장입관리 Launcher — V1.5 Hub */
export default function QrChargingHubPage() {
  const metrics = useMemo(() => buildQrChargingLauncherMetrics(), []);

  return (
    <TitanLauncherHubPage
      items={QR_CHARGING_LAUNCHER_ITEMS}
      metrics={metrics}
      cardsClassName="master-data-hub__cards"
    />
  );
}
