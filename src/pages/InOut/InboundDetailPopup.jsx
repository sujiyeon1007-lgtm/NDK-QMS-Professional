import { useCallback, useMemo } from "react";

import TitanStandardDetailPopup from "../../foundation/components/detailPopup/TitanStandardDetailPopup";
import { renderStandardDetailPopupTabContent } from "../../foundation/components/detailPopup/renderStandardDetailPopupContent";
import {
  buildStandardProductSummary,
  INBOUND_DETAIL_POPUP_TABS,
  resolveStandardDetailListRow,
} from "./inboundDetailPopupModel";

export default function InboundDetailPopup({
  open,
  onClose,
  listRow,
  initialTabId,
  onSelectCoLotProduct,
  footerActions,
}) {
  const detailRow = useMemo(() => resolveStandardDetailListRow(listRow), [listRow]);
  const record = detailRow?.record ?? detailRow ?? null;
  const statusLabel = detailRow?.statusLabel ?? listRow?.statusLabel;
  const statusVariant = detailRow?.statusVariant ?? listRow?.statusVariant ?? "wait";

  const summary = useMemo(
    () => buildStandardProductSummary(record, detailRow, statusLabel, statusVariant),
    [detailRow, record, statusLabel, statusVariant]
  );

  const renderTabContent = useCallback(
    (tabId) =>
      renderStandardDetailPopupTabContent(tabId, {
        listRow: detailRow ?? listRow,
        onSelectCoLotProduct,
      }),
    [detailRow, listRow, onSelectCoLotProduct]
  );

  return (
    <TitanStandardDetailPopup
      open={open}
      onClose={onClose}
      tabs={INBOUND_DETAIL_POPUP_TABS}
      summary={summary}
      renderTabContent={renderTabContent}
      footerActions={footerActions}
      initialTabId={initialTabId}
      ariaLabel="입고관리 상세보기"
    />
  );
}
