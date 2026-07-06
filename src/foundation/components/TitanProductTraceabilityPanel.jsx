import { useMemo } from "react";
import CollapsePanel from "./CollapsePanel";
import TitanTraceabilityTimeline from "./TitanTraceabilityTimeline";
import { buildProductTraceability } from "../../utils/productTraceabilityModel";

const DEFAULT_DURATION_ROWS = [
  { key: "incoming", label: "입고", durationLabel: "—" },
  { key: "production", label: "열처리", durationLabel: "—" },
  { key: "inspection", label: "검사", durationLabel: "—" },
  { key: "certificate", label: "성적서", durationLabel: "—" },
  { key: "shipment", label: "출고", durationLabel: "—" },
];

const DEFAULT_TIMELINE_STEPS = [
  { id: "incoming", label: "입고", timeLabel: "—", detail: "", status: "pending" },
  { id: "production", label: "열처리", timeLabel: "—", detail: "", status: "pending" },
  { id: "inspection", label: "검사", timeLabel: "—", detail: "", status: "pending" },
  { id: "certificate", label: "성적서", timeLabel: "—", detail: "", status: "pending" },
  { id: "shipment", label: "출고", timeLabel: "—", detail: "", status: "pending" },
];

const TIMELINE_ORDER = ["incoming", "production", "inspection", "certificate", "shipment"];

function applyTimelineCurrentStep(steps, currentKey) {
  const currentIndex = TIMELINE_ORDER.indexOf(currentKey);
  if (currentIndex === -1) return steps;

  return steps.map((step) => {
    const stepIndex = TIMELINE_ORDER.indexOf(step.id);
    if (stepIndex < currentIndex) return { ...step, status: "done" };
    if (stepIndex === currentIndex) return { ...step, status: "active" };
    return { ...step, status: "pending" };
  });
}

/**
 * Project TITAN V2.0 — QR Traceability
 * variant: default (좌측 Widget) | master-detail (리스트 하단)
 */
export default function TitanProductTraceabilityPanel({
  record,
  onSelectCoLotProduct,
  className = "",
  variant = "default",
  showAllSections = false,
  showWorkflowSections,
}) {
  const trace = useMemo(() => buildProductTraceability(record), [record]);

  if (!trace) return null;

  const isMasterDetail = variant === "master-detail";
  const rootClass = [
    "titan-product-traceability",
    isMasterDetail ? "titan-product-traceability--master-detail" : "titan-card",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const showCoLot = showAllSections ? trace.coLotProducts.length > 0 : trace.coLotProducts.length > 1;
  const includeWorkflow =
    showWorkflowSections ?? (showAllSections && variant === "master-detail");
  const durationRows =
    includeWorkflow && trace.processDurations.length > 0
      ? trace.processDurations
      : includeWorkflow && showAllSections
        ? DEFAULT_DURATION_ROWS
        : [];
  const timelineSteps =
    includeWorkflow && trace.timeline.length > 0
      ? trace.timeline
      : includeWorkflow && showAllSections
        ? applyTimelineCurrentStep(DEFAULT_TIMELINE_STEPS, trace.currentProcessKey)
        : [];

  const qrSection = (
    <CollapsePanel title="QR 작업이력" defaultOpen className="titan-product-traceability__section">
      <dl className="titan-product-traceability__basic inbound-detail">
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
          <dt>작업수량</dt>
          <dd>{trace.qtyLabel}</dd>
        </div>
        <div>
          <dt>현재공정</dt>
          <dd>{trace.currentProcess}</dd>
        </div>
      </dl>

      <ul className="titan-product-traceability__events">
        {trace.qrHistory.length > 0 ? (
          trace.qrHistory.map((row) => (
            <li key={`${row.key}-${row.atLabel}`} className="titan-product-traceability__event">
              <div className="titan-product-traceability__event-head">
                <strong>{row.label}</strong>
                <span>{row.atLabel}</span>
              </div>
              {row.worker !== "—" ? (
                <span className="titan-product-traceability__event-worker">담당 {row.worker}</span>
              ) : null}
            </li>
          ))
        ) : (
          <li className="titan-product-traceability__event titan-product-traceability__event--empty">
            QR 연동 후 작업 이력이 자동 표시됩니다.
          </li>
        )}
      </ul>
    </CollapsePanel>
  );

  const coLotSection = showCoLot ? (
    <CollapsePanel title="동일 LOT 장입 제품" defaultOpen className="titan-product-traceability__section">
      <p className="titan-product-traceability__colot-note">
        LOT <strong>{trace.lotNo}</strong> — 함께 작업한 제품
      </p>
      <ol className="titan-product-traceability__colot-list">
        {trace.coLotProducts.map((item) => (
          <li key={item.managementId}>
            <button
              type="button"
              className={`titan-product-traceability__colot-btn${item.isCurrent ? " is-current" : ""}`}
              onClick={() => onSelectCoLotProduct?.(item.managementId)}
              disabled={item.isCurrent || !onSelectCoLotProduct}
            >
              <span className="titan-product-traceability__colot-order">{item.order}</span>
              <span className="titan-product-traceability__colot-name">{item.partName}</span>
              <span className="titan-product-traceability__colot-id">{item.managementId}</span>
            </button>
          </li>
        ))}
      </ol>
    </CollapsePanel>
  ) : null;

  const durationSection =
    durationRows.length > 0 ? (
      <CollapsePanel
        title="공정 소요시간"
        defaultOpen={isMasterDetail}
        className="titan-product-traceability__section"
      >
        <dl className="titan-product-traceability__durations inbound-detail">
          {durationRows.map((item) => (
            <div key={item.key}>
              <dt>{item.label}</dt>
              <dd>{item.durationLabel}</dd>
            </div>
          ))}
        </dl>
      </CollapsePanel>
    ) : null;

  const timelineSection =
    timelineSteps.length > 0 ? (
      <CollapsePanel
        title="작업 Timeline"
        defaultOpen={isMasterDetail}
        className="titan-product-traceability__section"
      >
        <TitanTraceabilityTimeline steps={timelineSteps} />
      </CollapsePanel>
    ) : null;

  if (isMasterDetail) {
    return (
      <div className={rootClass}>
        {qrSection}
        {coLotSection}
        {durationSection}
        {timelineSection}
      </div>
    );
  }

  return (
    <div className={rootClass}>
      {qrSection}
      {coLotSection ? (
        <>
          <hr className="titan-detail-panel__divider" />
          {coLotSection}
        </>
      ) : null}
      {durationSection ? (
        <>
          <hr className="titan-detail-panel__divider" />
          {durationSection}
        </>
      ) : null}
      {timelineSection ? (
        <>
          <hr className="titan-detail-panel__divider" />
          {timelineSection}
        </>
      ) : null}
    </div>
  );
}
