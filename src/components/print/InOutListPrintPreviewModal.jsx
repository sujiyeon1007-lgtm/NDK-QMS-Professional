import { useCallback, useState } from "react";
import {
  TITAN_PRINT_DOCUMENT_TYPES,
  getPrintDocumentMeta,
} from "../../config/titanPrintDocuments";
import {
  exportHtlWorkListXlsx,
  exportOutboundListXlsx,
  exportTitanPdf,
  printTitanDocument,
} from "../../utils/titanPrintExport";
import HeatTreatmentWorkListPrint from "./HeatTreatmentWorkListPrint";
import OutboundListPrint from "./OutboundListPrint";
import TitanPrintPreviewModal from "./TitanPrintPreviewModal";

/** 입고·출고 리스트 공통 Preview — 동일 Modal·동일 출력 엔진, 양식만 구분 */
function InOutListPrintPreviewModal({ open, onClose, documentType, printProps }) {
  const [busy, setBusy] = useState(false);
  const meta = getPrintDocumentMeta(documentType);
  const isInbound = documentType === TITAN_PRINT_DOCUMENT_TYPES.INBOUND_LIST;

  const handlePrint = useCallback(async (documentEl) => {
    setBusy(true);
    try {
      await printTitanDocument(documentEl);
    } finally {
      setBusy(false);
    }
  }, []);

  const handlePdf = useCallback(
    async (documentEl) => {
      setBusy(true);
      try {
        const prefix = isInbound ? "inbound-list" : "outbound-list";
        await exportTitanPdf(documentEl, `${prefix}-${printProps?.listNo || "document"}.pdf`);
      } finally {
        setBusy(false);
      }
    },
    [isInbound, printProps?.listNo]
  );

  const handleExcel = useCallback(async () => {
    if (!printProps) return;
    setBusy(true);
    try {
      const filename = `${printProps.listNo || "list"}.xlsx`;
      if (isInbound) {
        await exportHtlWorkListXlsx({ ...printProps, filename });
      } else {
        await exportOutboundListXlsx({ ...printProps, filename });
      }
    } finally {
      setBusy(false);
    }
  }, [isInbound, printProps]);

  if (!printProps) return null;

  return (
    <TitanPrintPreviewModal
      open={open}
      onClose={onClose}
      title={`${meta?.label ?? "리스트"} 출력 미리보기`}
      onPrint={handlePrint}
      onPdf={handlePdf}
      onExcel={handleExcel}
      excelEnabled
      busy={busy}
    >
      {isInbound ? (
        <HeatTreatmentWorkListPrint {...printProps} />
      ) : (
        <OutboundListPrint {...printProps} shipDate={printProps.workDate} />
      )}
    </TitanPrintPreviewModal>
  );
}

export default InOutListPrintPreviewModal;
