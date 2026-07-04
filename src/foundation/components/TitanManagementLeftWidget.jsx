import TitanDetailPanel from "./TitanDetailPanel";
import TitanListWorkspaceEmpty from "./TitanListWorkspaceEmpty";
import TitanProductTraceabilityPanel from "./TitanProductTraceabilityPanel";

/**
 * Project TITAN V2.0 — 관리 화면 좌측 Widget (상세 + QR Traceability)
 */
export default function TitanManagementLeftWidget({
  record,
  emptyMessage = "리스트에서 항목을 선택하세요.",
  onSelectCoLotProduct,
  detailPanelProps,
}) {
  if (!record) {
    return <TitanListWorkspaceEmpty message={emptyMessage} />;
  }

  const rawRecord = record.record ?? record;

  return (
    <div className="titan-management-left-widget">
      <TitanDetailPanel {...detailPanelProps} />
      <TitanProductTraceabilityPanel record={rawRecord} onSelectCoLotProduct={onSelectCoLotProduct} />
    </div>
  );
}
