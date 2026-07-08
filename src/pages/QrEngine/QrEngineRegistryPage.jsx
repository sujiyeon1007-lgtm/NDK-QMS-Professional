import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { QR_ENGINE_ROUTES } from "../../config/qrEngineArchitecture";
import TitanDataTable from "../../foundation/components/DataTable";
import { listQrEngineRegistryRows } from "../../utils/qrEngineRegistryService";

export default function QrEngineRegistryPage() {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  const rows = useMemo(() => listQrEngineRegistryRows(), [refreshKey]);

  const columns = [
    { key: "displayQrId", label: "QR ID", widthPercent: 10 },
    { key: "qrTypeLabel", label: "QR Type", widthPercent: 12 },
    { key: "target", label: "Target", widthPercent: 18 },
    { key: "createdAtLabel", label: "Created Date", widthPercent: 12 },
    { key: "status", label: "Status", widthPercent: 10 },
    { key: "reissueCount", label: "Reissue", widthPercent: 8 },
    { key: "printCount", label: "Print", widthPercent: 8 },
    { key: "scanValue", label: "Scan Value", widthPercent: 22 },
  ];

  return (
    <div className="qr-engine-page">
      <div className="qr-engine-registry-toolbar">
        <button type="button" className="titan-btn titan-btn--secondary" onClick={() => setRefreshKey((v) => v + 1)}>
          새로고침
        </button>
      </div>

      <TitanDataTable
        layout="compact"
        columns={columns}
        rows={rows}
        onRowDoubleClick={(row) => {
          if (row.qrType === "lot") {
            navigate(QR_ENGINE_ROUTES.lotLifecycle(row.target));
            return;
          }
          navigate(QR_ENGINE_ROUTES.equipmentWork(row.target));
        }}
        emptyMessage="Registry QR가 없습니다. Generator에서 QR을 생성하세요."
      />

      <p className="qr-engine-hint" role="note">
        행 더블클릭: Equipment → 현재 작업 · LOT → LOT Lifecycle
      </p>
    </div>
  );
}