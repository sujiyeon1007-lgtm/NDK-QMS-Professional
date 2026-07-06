import {
  StandardDetailAttachmentsPanel,
  StandardDetailBasicInfoPanel,
  StandardDetailCoLotProductsPanel,
  StandardDetailMemoPanel,
  StandardDetailProcessHistoryPanel,
  StandardDetailQrWorkHistoryPanel,
} from "./StandardDetailPopupPanels";
import {
  buildStandardProductSummary,
  resolveStandardDetailListRow,
} from "../../../utils/standardDetailPopupModel";

/**
 * Project TITAN — Standard Detail Popup 탭 렌더 (입고관리 UI Freeze 기준)
 */
export function renderStandardDetailPopupTabContent(tabId, { listRow, onSelectCoLotProduct } = {}) {
  const detailRow = resolveStandardDetailListRow(listRow);
  const record = detailRow?.record ?? detailRow ?? null;
  const statusLabel = detailRow?.statusLabel ?? listRow?.statusLabel;
  const statusVariant = detailRow?.statusVariant ?? listRow?.statusVariant ?? "wait";

  switch (tabId) {
    case "basicInfo":
      return (
        <StandardDetailBasicInfoPanel
          record={record}
          listRow={detailRow}
          statusLabel={statusLabel}
          statusVariant={statusVariant}
        />
      );
    case "processHistory":
      return <StandardDetailProcessHistoryPanel record={record} />;
    case "qrHistory":
      return <StandardDetailQrWorkHistoryPanel record={record} />;
    case "coLot":
      return (
        <StandardDetailCoLotProductsPanel record={record} onSelectCoLotProduct={onSelectCoLotProduct} />
      );
    case "attachments":
      return <StandardDetailAttachmentsPanel record={record} />;
    case "memo":
      return <StandardDetailMemoPanel record={record} />;
    default:
      return null;
  }
}

export function buildStandardDetailPopupContext(listRow, options = {}) {
  const detailRow = resolveStandardDetailListRow(listRow);
  const record = detailRow?.record ?? detailRow ?? null;
  const statusLabel = detailRow?.statusLabel ?? listRow?.statusLabel;
  const statusVariant = detailRow?.statusVariant ?? listRow?.statusVariant ?? "wait";

  return {
    listRow: detailRow ?? listRow,
    traceRecord: record,
    statusLabel,
    statusVariant,
    summary: buildStandardProductSummary(record, detailRow, statusLabel, statusVariant),
    onSelectCoLotProduct: options.onSelectCoLotProduct,
  };
}
