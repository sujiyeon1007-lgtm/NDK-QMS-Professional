import { useMemo } from "react";
import StatusChip from "./StatusChip";
import TitanWorkflowStepTrack from "./TitanWorkflowStepTrack";
import { TitanRowSummary, TitanRowSummaryCard } from "./TitanRowSummary";
import { buildHomeRowWorkflow } from "../../utils/homeDashboardData";
import { buildProductTraceability } from "../../utils/productTraceabilityModel";

/**
 * 생산/검사 Row — HOME 스타일 요약 Card (제품정보 · Timeline · QR · 동일 LOT)
 * embedMode: 상위 TitanRowSummary 안에 QR·LOT Card만 삽입
 */
export default function TitanProductRowSummary({
  record,
  statusLabel,
  statusVariant,
  onSelectCoLotProduct,
  emptyMessage = "리스트에서 항목을 선택하세요.",
  showProductInfo = true,
  showWorkflow = true,
  showQr = true,
  showCoLot = true,
  embedMode = false,
}) {
  const trace = useMemo(() => (record ? buildProductTraceability(record) : null), [record]);
  const workflow = useMemo(() => (record ? buildHomeRowWorkflow(record) : null), [record]);

  if (!record || !trace) {
    if (embedMode) return null;
    return <TitanRowSummary hasSelection={false} emptyMessage={emptyMessage} />;
  }

  const currentStatus = statusLabel ?? trace.currentProcess;
  const coLotProducts = trace.coLotProducts ?? [];

  const cards = (
    <>
      {showProductInfo ? (
        <TitanRowSummaryCard title="제품 정보">
          <dl className="titan-row-summary__meta inbound-detail">
            <div>
              <dt>관리번호</dt>
              <dd>{trace.managementId}</dd>
            </div>
            <div>
              <dt>LOT 번호</dt>
              <dd>{trace.lotNo}</dd>
            </div>
            <div>
              <dt>업체명</dt>
              <dd>{trace.company}</dd>
            </div>
            <div>
              <dt>품명</dt>
              <dd>{trace.partName}</dd>
            </div>
            <div>
              <dt>품번</dt>
              <dd>{trace.partNo}</dd>
            </div>
            <div>
              <dt>재질</dt>
              <dd>{trace.material}</dd>
            </div>
            <div>
              <dt>현재공정</dt>
              <dd>{trace.currentProcess}</dd>
            </div>
            <div>
              <dt>현재상태</dt>
              <dd>
                {statusVariant ? (
                  <StatusChip variant={statusVariant}>{currentStatus}</StatusChip>
                ) : (
                  currentStatus
                )}
              </dd>
            </div>
          </dl>
        </TitanRowSummaryCard>
      ) : null}

      {showWorkflow ? (
        <TitanRowSummaryCard title="공정 진행현황">
          <TitanWorkflowStepTrack
            phases={workflow?.phases ?? []}
            showCaptions
            ariaLabel={`${trace.managementId} 공정 진행`}
          />
        </TitanRowSummaryCard>
      ) : null}

      {showQr ? (
        <TitanRowSummaryCard title="QR 작업이력">
          <ul className="titan-row-summary__events">
            {trace.qrHistory.length > 0 ? (
              trace.qrHistory.map((row) => (
                <li key={`${row.key}-${row.atLabel}`} className="titan-row-summary__event">
                  <strong>{row.label}</strong>
                  <span>{row.atLabel}</span>
                </li>
              ))
            ) : (
              <li className="titan-row-summary__event titan-row-summary__event--empty">
                QR 연동 후 작업 이력이 자동 표시됩니다.
              </li>
            )}
          </ul>
        </TitanRowSummaryCard>
      ) : null}

      {showCoLot && coLotProducts.length > 0 ? (
        <TitanRowSummaryCard title="동일 LOT 제품">
          <ol className="titan-row-summary__colot">
            {coLotProducts.map((item) => (
              <li key={item.managementId}>
                <button
                  type="button"
                  className={`titan-row-summary__colot-btn${item.isCurrent ? " is-current" : ""}`}
                  onClick={() => onSelectCoLotProduct?.(item.managementId)}
                  disabled={item.isCurrent || !onSelectCoLotProduct}
                >
                  <span>{item.order}</span>
                  <strong>{item.partName}</strong>
                  <em>{item.managementId}</em>
                </button>
              </li>
            ))}
          </ol>
        </TitanRowSummaryCard>
      ) : null}
    </>
  );

  if (embedMode) {
    return cards;
  }

  return <TitanRowSummary>{cards}</TitanRowSummary>;
}
