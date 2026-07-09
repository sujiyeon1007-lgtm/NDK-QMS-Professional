import { useMemo } from "react";

import { getDetailPopupConfig, usesStandardDetailPopup } from "../../config/detailPopupPolicy";
import TitanDetailPopup from "./TitanDetailPopup";
import TitanStandardDetailPopup from "./detailPopup/TitanStandardDetailPopup";
import {
  EventListPanel,
  PlaceholderPanel,
  QrInfoPanel,
  QrPreviewPanel,
  EquipmentQrInfoPanel,
  EquipmentQrPreviewPanel,
  QrWorkHistoryPanel,
} from "./detailPopup/DetailPopupPanels";
import {
  buildStandardDetailPopupContext,
  renderStandardDetailPopupTabContent,
} from "./detailPopup/renderStandardDetailPopupContent";

/**
 * screenKey + context 로 탭 콘텐츠를 조합하는 공통 Detail Popup
 * 표준 화면: 입고관리 UI Freeze 팝업 (TitanStandardDetailPopup + StandardDetailPopupPanels)
 * 문서관리 · QR 전용: Legacy TitanDetailPopup
 */
export default function TitanScreenDetailPopup({
  screenKey,
  open,
  onClose,
  record,
  context = {},
  footerActions,
  initialTabId,
}) {
  const config = getDetailPopupConfig(screenKey);
  if (!config) return null;

  const { onSelectCoLotProduct, eventLists = {} } = context;
  const listRow = record ?? context.listRow ?? null;

  const standardContext = useMemo(
    () => buildStandardDetailPopupContext(listRow, { onSelectCoLotProduct }),
    [listRow, onSelectCoLotProduct]
  );

  const renderLegacyTabContent = (tabId) => {
    const { detailContent, traceRecord, qrRow } = context;
    const rawTrace = traceRecord ?? record?.record ?? record;

    switch (tabId) {
      case "basicInfo":
      case "detail":
        return detailContent ?? <PlaceholderPanel message="상세 정보가 없습니다." />;

      case "documentHistory":
        return (
          eventLists.documentHistory ?? (
            <EventListPanel items={[]} emptyMessage="문서 이력이 없습니다." />
          )
        );

      case "revision":
        return (
          eventLists.revision ?? (
            <EventListPanel items={[]} emptyMessage="Revision 이력이 없습니다." />
          )
        );

      case "attachments":
        return (
          eventLists.attachments ?? (
            <PlaceholderPanel message="첨부파일이 없습니다." />
          )
        );

      case "memo":
      case "remarks":
        return (
          eventLists.memo ??
          eventLists.remarks ?? (
            <PlaceholderPanel message="메모가 없습니다." />
          )
        );

      case "qrInfo":
        return eventLists.qrInfo ?? <QrInfoPanel row={qrRow ?? record} />;

      case "equipmentQrInfo":
        return eventLists.equipmentQrInfo ?? <EquipmentQrInfoPanel row={qrRow ?? record} />;

      case "equipmentQrPreview":
        return eventLists.equipmentQrPreview ?? (
          <EquipmentQrPreviewPanel row={qrRow ?? record} />
        );

      case "qrPreview":
        return eventLists.qrPreview ?? <QrPreviewPanel row={qrRow ?? record} />;

      case "workHistory":
        return (
          eventLists.workHistory ?? (
            <QrWorkHistoryPanel managementId={qrRow?.managementId ?? rawTrace?.id} />
          )
        );

      default:
        return <PlaceholderPanel message="준비 중입니다." />;
    }
  };

  const renderStandardTabContent = (tabId) => {
    const override = eventLists[tabId];
    if (override) return override;

    return renderStandardDetailPopupTabContent(tabId, {
      listRow,
      onSelectCoLotProduct,
    });
  };

  if (!open) return null;

  if (usesStandardDetailPopup(screenKey)) {
    return (
      <TitanStandardDetailPopup
        open={open}
        onClose={onClose}
        tabs={config.tabs}
        summary={standardContext.summary}
        renderTabContent={renderStandardTabContent}
        footerActions={footerActions}
        initialTabId={initialTabId}
        ariaLabel={config.title}
      />
    );
  }

  return (
    <TitanDetailPopup
      open={open}
      onClose={onClose}
      title={config.title}
      tabs={config.tabs}
      renderTabContent={renderLegacyTabContent}
      initialTabId={initialTabId}
      size="standard"
    />
  );
}
