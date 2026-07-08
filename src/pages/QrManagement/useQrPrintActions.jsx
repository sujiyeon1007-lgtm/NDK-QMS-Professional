import { useRef, useState } from "react";

import { resolveQrBrowserPayload } from "../../config/qrBrowserUrlConfig";
import { printTitanDocument } from "../../utils/titanPrintExport";
import { reprintQrRecords } from "../../utils/qrManagementSession";
import QrPrintSheet from "./QrPrintSheet";

export function useQrPrintActions({ title = "QR 라벨" } = {}) {
  const [printBusy, setPrintBusy] = useState(false);
  const [printSheetRows, setPrintSheetRows] = useState([]);
  const printRef = useRef(null);

  const handlePrintRows = async (targets) => {
    const printable = targets.filter((row) => row?.hasQr && resolveQrBrowserPayload(row));
    if (!printable.length) {
      window.alert("출력할 QR을 선택하세요.");
      return;
    }

    setPrintSheetRows(printable);
    await new Promise((resolve) => requestAnimationFrame(() => resolve()));

    const sheet = printRef.current;
    if (!sheet) return;

    setPrintBusy(true);
    try {
      await printTitanDocument(sheet);
      reprintQrRecords(printable.map((row) => row.qrRecord?.id).filter(Boolean));
    } finally {
      setPrintBusy(false);
    }
  };

  const printHost = (
    <div className="qr-print-sheet-host" aria-hidden="true">
      <div ref={printRef}>
        <QrPrintSheet rows={printSheetRows} title={title} />
      </div>
    </div>
  );

  return { printBusy, handlePrintRows, printHost };
}
