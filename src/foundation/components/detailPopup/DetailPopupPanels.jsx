import { useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { resolveQrBrowserPayload } from "../../../config/qrBrowserUrlConfig";
import StatusChip from "../StatusChip";
import TitanWorkflowStepTrack from "../TitanWorkflowStepTrack";
import TitanTraceabilityTimeline from "../TitanTraceabilityTimeline";
import { buildHomeRowWorkflow } from "../../../utils/homeDashboardData";
import { buildProductTraceability } from "../../../utils/productTraceabilityModel";
import { buildQrWorkHistoryRows } from "../../../utils/qrManagementModel";
import { PROCESS_FLOW_PANEL_TITLE } from "../../../utils/processFlow";

export function DetailPopupSection({ title, children, className = "" }) {
  return (
    <section className={`titan-detail-popup__section${className ? ` ${className}` : ""}`.trim()}>
      {title ? <h4 className="titan-detail-popup__section-title">{title}</h4> : null}
      <div className="titan-detail-popup__section-body">{children}</div>
    </section>
  );
}

export function DetailPopupMetaGrid({ children }) {
  return <dl className="titan-row-summary__meta inbound-detail titan-detail-popup__meta">{children}</dl>;
}

export function DetailPopupMetaItem({ label, children }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export function ProcessFlowPanel({ steps = [], title = PROCESS_FLOW_PANEL_TITLE }) {
  if (!steps.length) {
    return <p className="titan-detail-popup__empty">공정 흐름 정보가 없습니다.</p>;
  }
  return (
    <DetailPopupSection title={title}>
      <ol className="inbound-tasks">
        {steps.map((task) => (
          <li key={task.id} className={`inbound-tasks__item inbound-tasks__item--${task.state}`}>
            <strong>{task.label}</strong>
            <span>{task.desc}</span>
          </li>
        ))}
      </ol>
    </DetailPopupSection>
  );
}

export function ChargeListPanel({ chargeProducts = [] }) {
  if (!chargeProducts.length) {
    return <p className="titan-detail-popup__empty">장입 제품이 없습니다.</p>;
  }
  return (
    <DetailPopupSection title="장입 제품 리스트">
      <table className="titan-detail-popup__table">
        <thead>
          <tr>
            <th>관리번호</th>
            <th>업체명</th>
            <th>품명</th>
            <th>품번</th>
            <th>재질</th>
            <th>수량</th>
            <th>공정</th>
          </tr>
        </thead>
        <tbody>
          {chargeProducts.map((product) => (
            <tr key={product.managementId}>
              <td>{product.managementId}</td>
              <td>{product.company || "—"}</td>
              <td>{product.partName || "—"}</td>
              <td>{product.partNo || "—"}</td>
              <td>{product.material || "—"}</td>
              <td>{product.qty || "—"}</td>
              <td>{product.process || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </DetailPopupSection>
  );
}

export function ProductInfoPanel({ record, statusLabel, statusVariant }) {
  const trace = useMemo(() => (record ? buildProductTraceability(record) : null), [record]);
  if (!trace) {
    return <p className="titan-detail-popup__empty">제품 정보가 없습니다.</p>;
  }
  const currentStatus = statusLabel ?? trace.currentProcess;
  return (
    <DetailPopupMetaGrid>
      <DetailPopupMetaItem label="관리번호">{trace.managementId}</DetailPopupMetaItem>
      <DetailPopupMetaItem label="LOT 번호">{trace.lotNo}</DetailPopupMetaItem>
      <DetailPopupMetaItem label="업체명">{trace.company}</DetailPopupMetaItem>
      <DetailPopupMetaItem label="품명">{trace.partName}</DetailPopupMetaItem>
      <DetailPopupMetaItem label="품번">{trace.partNo}</DetailPopupMetaItem>
      <DetailPopupMetaItem label="재질">{trace.material}</DetailPopupMetaItem>
      <DetailPopupMetaItem label="현재공정">{trace.currentProcess}</DetailPopupMetaItem>
      <DetailPopupMetaItem label="현재상태">
        {statusVariant ? <StatusChip variant={statusVariant}>{currentStatus}</StatusChip> : currentStatus}
      </DetailPopupMetaItem>
    </DetailPopupMetaGrid>
  );
}

export function WorkflowTrackPanel({ record }) {
  const workflow = useMemo(() => (record ? buildHomeRowWorkflow(record) : null), [record]);
  if (!workflow?.phases?.length) {
    return <p className="titan-detail-popup__empty">공정 진행 정보가 없습니다.</p>;
  }
  return (
    <TitanWorkflowStepTrack
      phases={workflow.phases}
      showCaptions
      ariaLabel="공정 진행현황"
    />
  );
}

export function QrHistoryPanel({ record }) {
  const trace = useMemo(() => (record ? buildProductTraceability(record) : null), [record]);
  if (!trace) {
    return <p className="titan-detail-popup__empty">QR 작업 이력이 없습니다.</p>;
  }
  return (
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
  );
}

export function CoLotPanel({ record, onSelectCoLotProduct }) {
  const trace = useMemo(() => (record ? buildProductTraceability(record) : null), [record]);
  const coLotProducts = trace?.coLotProducts ?? [];
  if (!coLotProducts.length) {
    return <p className="titan-detail-popup__empty">동일 LOT 제품이 없습니다.</p>;
  }
  return (
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
  );
}

export function TraceabilityTimelinePanel({ record }) {
  const steps = useMemo(() => {
    if (!record) return [];
    return buildProductTraceability(record)?.timeline ?? [];
  }, [record]);
  return <TitanTraceabilityTimeline steps={steps} ariaLabel="작업 Timeline" />;
}

export function EventListPanel({ items = [], emptyMessage = "이력이 없습니다." }) {
  if (!items.length) {
    return <p className="titan-detail-popup__empty">{emptyMessage}</p>;
  }
  return (
    <ul className="titan-row-summary__events">
      {items.map((row, index) => (
        <li key={row.key ?? `${row.label}-${index}`} className="titan-row-summary__event">
          <strong>{row.label ?? row.date ?? row.revision}</strong>
          <span>{row.detail ?? row.note ?? row.value}</span>
        </li>
      ))}
    </ul>
  );
}

export function PlaceholderPanel({ message }) {
  return <p className="titan-detail-popup__empty">{message}</p>;
}

export function QrInfoPanel({ row }) {
  if (!row) {
    return <p className="titan-detail-popup__empty">QR 정보가 없습니다.</p>;
  }
  return (
    <DetailPopupMetaGrid>
      <DetailPopupMetaItem label="관리번호">{row.managementId}</DetailPopupMetaItem>
      <DetailPopupMetaItem label="LOT번호">{row.lotNo}</DetailPopupMetaItem>
      <DetailPopupMetaItem label="업체명">{row.company}</DetailPopupMetaItem>
      <DetailPopupMetaItem label="품명">{row.partName}</DetailPopupMetaItem>
      <DetailPopupMetaItem label="품번">{row.partNo}</DetailPopupMetaItem>
      <DetailPopupMetaItem label="QR상태">
        <StatusChip variant={row.qrStatusVariant}>{row.qrStatusLabel}</StatusChip>
      </DetailPopupMetaItem>
      <DetailPopupMetaItem label="생성일">{row.createdAtLabel}</DetailPopupMetaItem>
      {row.hasQr ? (
        <DetailPopupMetaItem label="생성자">{row.createdBy}</DetailPopupMetaItem>
      ) : null}
    </DetailPopupMetaGrid>
  );
}

export function EquipmentQrInfoPanel({ row }) {
  if (!row) {
    return <p className="titan-detail-popup__empty">QR 정보가 없습니다.</p>;
  }
  return (
    <DetailPopupMetaGrid>
      <DetailPopupMetaItem label="설비번호">{row.equipmentCode}</DetailPopupMetaItem>
      <DetailPopupMetaItem label="설비명">{row.equipmentName}</DetailPopupMetaItem>
      <DetailPopupMetaItem label="위치">{row.location}</DetailPopupMetaItem>
      <DetailPopupMetaItem label="점검주기">
        {row.equipment?.inspectionCycle ?? "월 1회"}
      </DetailPopupMetaItem>
      <DetailPopupMetaItem label="상태">
        <StatusChip variant={row.equipmentStatusVariant}>{row.equipmentStatusLabel}</StatusChip>
      </DetailPopupMetaItem>
      <DetailPopupMetaItem label="QR상태">
        <StatusChip variant={row.qrStatusVariant}>{row.qrStatusLabel}</StatusChip>
      </DetailPopupMetaItem>
      <DetailPopupMetaItem label="생성일">{row.createdAtLabel}</DetailPopupMetaItem>
    </DetailPopupMetaGrid>
  );
}

export function QrPreviewPanel({ row }) {
  const qrValue = resolveQrBrowserPayload(row);
  if (!qrValue) {
    return <p className="titan-detail-popup__empty">QR 미리보기 데이터가 없습니다. QR 생성 후 확인할 수 있습니다.</p>;
  }
  return (
    <DetailPopupSection title="QR 미리보기">
      <div className="qr-detail-preview">
        <div className="qr-detail-preview__code" aria-hidden="true">
          <QRCodeSVG value={qrValue} size={220} level="M" includeMargin />
        </div>
        <pre className="qr-detail-preview__payload">{qrValue}</pre>
      </div>
    </DetailPopupSection>
  );
}

export function EquipmentQrPreviewPanel({ row }) {
  return <QrPreviewPanel row={row} />;
}

export function QrWorkHistoryPanel({ managementId }) {
  const rows = useMemo(() => buildQrWorkHistoryRows(managementId), [managementId]);
  if (!rows.length) {
    return <p className="titan-detail-popup__empty">작업 이력이 없습니다.</p>;
  }
  return (
    <ul className="titan-row-summary__events">
      {rows.map((row) => (
        <li key={`${row.key}-${row.atLabel}`} className="titan-row-summary__event">
          <strong>{row.label}</strong>
          <span>
            {row.atLabel} · {row.worker}
          </span>
        </li>
      ))}
    </ul>
  );
}
