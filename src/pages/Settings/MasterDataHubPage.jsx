import { useEffect } from "react";

import { MASTER_DATA_LAUNCHER_ITEMS } from "../../config/masterDataLauncher";
import TitanLauncherHubPage from "../../foundation/components/TitanLauncherHubPage";

import "../../foundation/styles/titan-hub-page.css";
import "./MasterDataHub.css";

/**
 * 기준정보관리 Launcher — 6개 관리 화면 진입 허브
 */
export default function MasterDataHubPage() {
  useEffect(() => {
    sessionStorage.removeItem("titan-open-company-modal");
  }, []);

  return (
    <TitanLauncherHubPage
      items={MASTER_DATA_LAUNCHER_ITEMS}
      cardsClassName="master-data-hub__cards"
    />
  );
}
