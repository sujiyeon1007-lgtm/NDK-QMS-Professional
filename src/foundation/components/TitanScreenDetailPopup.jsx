import { getDetailPopupConfig } from "../../config/detailPopupPolicy";
import TitanDetailPopup from "./TitanDetailPopup";
import {
  ChargeListPanel,
  CoLotPanel,
  EventListPanel,
  PlaceholderPanel,
  ProcessFlowPanel,
  ProductInfoPanel,
  QrHistoryPanel,
  QrInfoPanel,
  QrPreviewPanel,
  EquipmentQrInfoPanel,
  EquipmentQrPreviewPanel,
  QrWorkHistoryPanel,
  TraceabilityTimelinePanel,
  WorkflowTrackPanel,
} from "./detailPopup/DetailPopupPanels";

/**
 * screenKey + context 로 탭 콘텐츠를 조합하는 공통 Detail Popup
 *
 * context:
 * - detailContent: ReactNode (상세정보/제품정보 탭)
 * - traceRecord: production session record (QR · Timeline · coLot)
 * - processFlowSteps: 공정흐름
 * - chargeProducts: 장입리스트
 * - statusLabel, statusVariant
 * - onSelectCoLotProduct
 * - eventLists: { inspectionInfo, inspectionResult, certificatePdf, revision, issueHistory, outboundInfo, statement, outboundHistory, inOutHistory, lotHistory, documentHistory, attachments }
 */
export default function TitanScreenDetailPopup({
  screenKey,
  open,
  onClose,
  record,
  context = {},
  initialTabId,
}) {
  const config = getDetailPopupConfig(screenKey);
  if (!config) return null;

  const {
    detailContent,
    traceRecord,
    processFlowSteps = [],
    chargeProducts = [],
    statusLabel,
    statusVariant,
    onSelectCoLotProduct,
    eventLists = {},
  } = context;

  const rawTrace = traceRecord ?? record?.record ?? record;

  const renderTabContent = (tabId) => {
    switch (tabId) {
      case "detail":
      case "productInfo":
      case "inventoryInfo":
        return detailContent ?? (
          rawTrace ? (
            <ProductInfoPanel record={rawTrace} statusLabel={statusLabel} statusVariant={statusVariant} />
          ) : (
            <PlaceholderPanel message="상세 정보가 없습니다." />
          )
        );

      case "chargeList":
        return <ChargeListPanel chargeProducts={chargeProducts} />;

      case "processFlow":
        return <ProcessFlowPanel steps={processFlowSteps} />;

      case "qrHistory":
        return (
          eventLists.qrHistory ??
          (rawTrace ? (
            <QrHistoryPanel record={rawTrace} />
          ) : (
            <PlaceholderPanel message="QR 작업 이력이 없습니다." />
          ))
        );

      case "qrInfo":
        return eventLists.qrInfo ?? <QrInfoPanel row={context.qrRow ?? record} />;

      case "equipmentQrInfo":
        return eventLists.equipmentQrInfo ?? <EquipmentQrInfoPanel row={context.qrRow ?? record} />;

      case "equipmentQrPreview":
        return eventLists.equipmentQrPreview ?? (
          <EquipmentQrPreviewPanel row={context.qrRow ?? record} />
        );

      case "qrPreview":
        return eventLists.qrPreview ?? <QrPreviewPanel row={context.qrRow ?? record} />;

      case "workHistory":
        return (
          eventLists.workHistory ?? (
            <QrWorkHistoryPanel managementId={context.qrRow?.managementId ?? rawTrace?.id} />
          )
        );

      case "timeline":
        return (
          eventLists.timeline ??
          (rawTrace ? (
            <TraceabilityTimelinePanel record={rawTrace} />
          ) : (
            <PlaceholderPanel message="Timeline 정보가 없습니다." />
          ))
        );

      case "coLot":
        return (
          eventLists.coLot ??
          (rawTrace ? (
            <CoLotPanel record={rawTrace} onSelectCoLotProduct={onSelectCoLotProduct} />
          ) : (
            <PlaceholderPanel message="동일 LOT 제품이 없습니다." />
          ))
        );

      case "inspectionInfo":
        return eventLists.inspectionInfo ?? (
          rawTrace ? (
            <WorkflowTrackPanel record={rawTrace} />
          ) : (
            <PlaceholderPanel message="검사 정보가 없습니다." />
          )
        );

      case "inspectionResult":
        return (
          eventLists.inspectionResult ?? (
            <PlaceholderPanel message="검사 결과는 검사일지·성적서 연동 후 표시됩니다." />
          )
        );

      case "certificatePdf":
        return (
          eventLists.certificatePdf ?? (
            <PlaceholderPanel message="등록된 성적서 PDF가 없습니다." />
          )
        );

      case "revision":
        return (
          eventLists.revision ?? (
            <EventListPanel items={[]} emptyMessage="Revision 이력이 없습니다." />
          )
        );

      case "issueHistory":
        return (
          eventLists.issueHistory ?? (
            <PlaceholderPanel message="발행 이력이 없습니다." />
          )
        );

      case "outboundInfo":
        return (
          eventLists.outboundInfo ?? detailContent ?? (
            <PlaceholderPanel message="출고 정보가 없습니다." />
          )
        );

      case "statement":
        return (
          eventLists.statement ?? (
            <PlaceholderPanel message="거래명세서 정보가 없습니다." />
          )
        );

      case "outboundHistory":
        return (
          eventLists.outboundHistory ?? (
            <EventListPanel items={[]} emptyMessage="출고 이력이 없습니다." />
          )
        );

      case "documentHistory":
        return (
          eventLists.documentHistory ?? (
            <EventListPanel items={[]} emptyMessage="문서 이력이 없습니다." />
          )
        );

      case "attachments":
        return (
          eventLists.attachments ?? (
            <PlaceholderPanel message="첨부파일이 없습니다." />
          )
        );

      case "inOutHistory":
        return (
          eventLists.inOutHistory ?? (
            <PlaceholderPanel message="입출고 이력은 입고·출고 연동 후 표시됩니다." />
          )
        );

      case "lotHistory":
        return (
          eventLists.lotHistory ?? (
            rawTrace ? (
              <CoLotPanel record={rawTrace} onSelectCoLotProduct={onSelectCoLotProduct} />
            ) : (
              <PlaceholderPanel message="LOT 이력이 없습니다." />
            )
          )
        );

      default:
        return <PlaceholderPanel message="준비 중입니다." />;
    }
  };

  if (!open) return null;

  return (
    <TitanDetailPopup
      open={open}
      onClose={onClose}
      title={config.title}
      tabs={config.tabs}
      renderTabContent={renderTabContent}
      initialTabId={initialTabId}
    />
  );
}
