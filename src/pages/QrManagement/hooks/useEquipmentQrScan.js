import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

import { processEquipmentQrScan } from "../../../utils/equipmentQrWorkflow";

/**
 * 설비 QR Scan 시뮬레이션 — Camera API 없이 텍스트/URL 입력
 */
export function useEquipmentQrScan() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  const scan = useCallback(
    (payload) => {
      const text = String(payload ?? "").trim();
      if (!text) {
        setError("설비 QR 값을 입력하세요.");
        return { ok: false };
      }

      setProcessing(true);
      setError("");

      try {
        const result = processEquipmentQrScan(text);
        if (!result.ok) {
          setError(result.message ?? "설비 QR 처리 실패");
          return result;
        }

        if (result.navigationPath) {
          navigate(result.navigationPath);
        }

        return result;
      } finally {
        setProcessing(false);
      }
    },
    [navigate]
  );

  const clearError = useCallback(() => setError(""), []);

  return { scan, error, processing, clearError };
}
