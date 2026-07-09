import { useEffect, useMemo, useState } from "react";

import {
  ClipboardCheck,
  ClipboardList,
  Factory,
  FileText,
  List,
  Search,
  Settings2,
  Truck,
} from "lucide-react";

import StatusChip from "../StatusChip";
import TitanProcessNameCell from "../TitanProcessNameCell";
import FoundationAttachment from "../FoundationAttachment";
import {
  buildStandardAttachmentRows,
  buildStandardBasicInfo,
  buildStandardCoLotProductRows,
  buildStandardDetailContent,
  buildStandardMemoSections,
  buildStandardProcessHistoryRows,
  buildStandardQrWorkHistoryRows,
  STANDARD_PROCESS_HISTORY_STEP_TONES,
} from "../../../utils/standardDetailPopupModel";
import {
  normalizeFoundationAttachment,
  normalizeFoundationAttachments,
} from "../../../utils/foundationAttachmentEngine";

const STANDARD_DETAIL_ATTACHMENT_STORAGE_KEY = "project-titan-foundation-popup-attachments-v1";

const PROCESS_HISTORY_ICONS = {
  incomingRegistered: ClipboardList,
  htlPrinted: List,
  productionStart: Factory,
  productionDone: Settings2,
  inspectionStart: Search,
  inspectionDone: ClipboardCheck,
  certificateIssued: FileText,
  shipmentDone: Truck,
};

function resolveStandardAttachmentOwnerKey(record = {}) {
  return [
    record.id,
    record.managementId,
    record.mesManagementNo,
    record.lotNo,
    record.partNo,
  ]
    .filter(Boolean)
    .join("::") || "unknown";
}

function readStandardDetailStoredAttachments(ownerKey) {
  try {
    const raw = globalThis.sessionStorage?.getItem(STANDARD_DETAIL_ATTACHMENT_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return normalizeFoundationAttachments(parsed?.[ownerKey] ?? []);
  } catch {
    return [];
  }
}

function writeStandardDetailStoredAttachments(ownerKey, attachments) {
  try {
    const raw = globalThis.sessionStorage?.getItem(STANDARD_DETAIL_ATTACHMENT_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    parsed[ownerKey] = normalizeFoundationAttachments(attachments);
    globalThis.sessionStorage?.setItem(STANDARD_DETAIL_ATTACHMENT_STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    // SessionStorage demo repository.
  }
}

function readStandardDetailDeletedBaseIds(ownerKey) {
  try {
    const raw = globalThis.sessionStorage?.getItem(STANDARD_DETAIL_ATTACHMENT_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return Array.isArray(parsed?.[`${ownerKey}::__deletedBaseIds`])
      ? parsed[`${ownerKey}::__deletedBaseIds`].map(String)
      : [];
  } catch {
    return [];
  }
}

function writeStandardDetailDeletedBaseIds(ownerKey, ids) {
  try {
    const raw = globalThis.sessionStorage?.getItem(STANDARD_DETAIL_ATTACHMENT_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    parsed[`${ownerKey}::__deletedBaseIds`] = [...new Set(ids.map(String))];
    globalThis.sessionStorage?.setItem(STANDARD_DETAIL_ATTACHMENT_STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    // SessionStorage demo repository.
  }
}

function convertStandardAttachmentRow(row, index) {
  return normalizeFoundationAttachment(
    {
      id: row.key,
      name: row.name,
      category: row.category,
      detail: row.detail,
      dataUrl: row.dataUrl || row.url || "",
      uploadedAt: row.uploadedAt,
      uploadedBy: row.uploadedBy,
    },
    index
  );
}

export function StandardDetailBasicInfoPanel({ record, listRow, statusLabel, statusVariant }) {
  const info = useMemo(() => {
    const fromDetailContent = buildStandardDetailContent(listRow, statusLabel, statusVariant);
    if (fromDetailContent) return fromDetailContent;
    return buildStandardBasicInfo(record, listRow, statusLabel, statusVariant);
  }, [listRow, record, statusLabel, statusVariant]);

  if (!info) return null;

  return (
    <dl className="titan-standard-detail-popup__basic-grid">
      <dt>관리번호</dt>
      <dd>{info.managementId}</dd>
      <dt>LOT.NO</dt>
      <dd>{info.lotNo}</dd>
      <dt>입고일</dt>
      <dd>{info.incomingDate}</dd>
      {info.outboundDate !== undefined ? (
        <>
          <dt>출고일</dt>
          <dd>{info.outboundDate}</dd>
          <dt>출고 담당자</dt>
          <dd>{info.outboundManager ?? "—"}</dd>
          <dt>출고 시간</dt>
          <dd>{info.outboundTime ?? "—"}</dd>
        </>
      ) : (
        <>
          <dt>생산일</dt>
          <dd>{info.productionDate}</dd>
        </>
      )}
      <dt>업체명</dt>
      <dd>{info.company}</dd>
      <dt>품명</dt>
      <dd>{info.partName}</dd>
      <dt>품번</dt>
      <dd>{info.partNo}</dd>
      <dt>재질</dt>
      <dd>{info.material}</dd>
      <dt>규격</dt>
      <dd>{info.spec}</dd>
      <dt>입고수량</dt>
      <dd>{info.inboundQty}</dd>
      <dt>작업수량</dt>
      <dd>{info.workQty}</dd>
      <dt>담당자</dt>
      <dd>{info.manager}</dd>
      <dt>현재공정</dt>
      <dd>
        {info.currentProcess && info.currentProcess !== "—" ? (
          <TitanProcessNameCell
            label={info.currentProcess}
            processKey={info.currentProcessVariant ?? info.currentProcess}
          />
        ) : (
          "—"
        )}
      </dd>
      <dt>현재상태</dt>
      <dd>
        <StatusChip variant={info.statusVariant}>{info.statusLabel}</StatusChip>
      </dd>
      <dt className="titan-standard-detail-popup__basic-note-label">비고</dt>
      <dd className="titan-standard-detail-popup__basic-note-value">{info.note}</dd>
    </dl>
  );
}

export function StandardDetailProcessHistoryPanel({ record }) {
  const rows = useMemo(() => buildStandardProcessHistoryRows(record), [record]);

  return (
    <div className="titan-standard-detail-popup__process-timeline">
      <div className="titan-standard-detail-popup__process-timeline-head" aria-hidden="true">
        <span>공정</span>
        <span>일시</span>
        <span>담당자</span>
        <span>상태</span>
      </div>
      <ul className="titan-standard-detail-popup__process-timeline-body">
        {rows.map((row, index) => {
          const Icon = PROCESS_HISTORY_ICONS[row.key] ?? ClipboardList;
          const tone = STANDARD_PROCESS_HISTORY_STEP_TONES[row.key] ?? "grey";
          const isLast = index === rows.length - 1;

          return (
            <li key={row.key} className={row.completed ? "is-done" : "is-pending"}>
              <div className="titan-standard-detail-popup__process-timeline-process">
                <div className="titan-standard-detail-popup__process-timeline-track">
                  <span
                    className={`titan-standard-detail-popup__process-timeline-icon titan-standard-detail-popup__process-timeline-icon--${tone}`}
                  >
                    <Icon size={14} strokeWidth={2.25} aria-hidden="true" />
                  </span>
                  {!isLast ? (
                    <span className="titan-standard-detail-popup__process-timeline-arrow" aria-hidden="true">
                      ↓
                    </span>
                  ) : null}
                </div>
                <span className="titan-standard-detail-popup__process-timeline-label">{row.label}</span>
              </div>
              <span className="titan-standard-detail-popup__process-timeline-datetime">{row.datetime}</span>
              <span
                className="titan-standard-detail-popup__process-timeline-assignee"
                title={row.assigneeDetail && row.assigneeDetail !== row.assignee ? row.assigneeDetail : undefined}
              >
                {row.assignee}
              </span>
              <span className="titan-standard-detail-popup__process-timeline-status">
                {row.completed ? (
                  <span className="titan-standard-detail-popup__process-timeline-status-done">{row.status}</span>
                ) : (
                  <span className="titan-standard-detail-popup__process-timeline-status-pending">—</span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function StandardDetailQrWorkHistoryPanel({ record }) {
  const rows = useMemo(() => buildStandardQrWorkHistoryRows(record), [record]);

  return (
    <div className="titan-standard-detail-popup__compact-history titan-standard-detail-popup__compact-history--qr">
      <div className="titan-standard-detail-popup__compact-history-head" aria-hidden="true">
        <span>작업</span>
        <span>일시</span>
        <span>담당</span>
      </div>
      <ul className="titan-standard-detail-popup__compact-history-body">
        {rows.map((row) => (
          <li key={row.key} className={row.pending ? "is-pending" : undefined}>
            <span className="titan-standard-detail-popup__compact-history-label">{row.label}</span>
            <span className="titan-standard-detail-popup__compact-history-datetime">{row.atLabel}</span>
            <span className="titan-standard-detail-popup__compact-history-assignee">{row.worker}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function StandardDetailCoLotProductsPanel({ record, onSelectCoLotProduct }) {
  const coLot = useMemo(() => buildStandardCoLotProductRows(record), [record]);

  if (!coLot.lotNo || coLot.lotNo === "—" || coLot.products.length === 0) {
    return <p className="titan-detail-popup__empty">동일 LOT 장입 제품이 없습니다.</p>;
  }

  return (
    <div className="titan-standard-detail-popup__colot">
      <div className="titan-standard-detail-popup__colot-header">
        <strong>LOT {coLot.lotNo}</strong>
      </div>
      <div className="titan-standard-detail-popup__table-scroll">
        <table className="titan-standard-detail-popup__compact-table titan-standard-detail-popup__colot-table">
          <thead>
            <tr>
              <th>업체명</th>
              <th>품명</th>
              <th>품번</th>
              <th>작업수량</th>
              <th>현재공정</th>
              <th>현재상태</th>
            </tr>
          </thead>
          <tbody>
            {coLot.products.map((product) => (
              <tr
                key={product.managementId}
                className={[
                  product.isCurrent ? "is-current" : "",
                  !product.isCurrent && onSelectCoLotProduct ? "is-clickable" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => {
                  if (!product.isCurrent) onSelectCoLotProduct?.(product.managementId);
                }}
              >
                <td>{product.company}</td>
                <td>{product.partName}</td>
                <td>{product.partNo}</td>
                <td>{product.workQty}</td>
                <td>{product.currentProcess}</td>
                <td>
                  <StatusChip variant={product.statusVariant}>{product.statusLabel}</StatusChip>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function StandardDetailAttachmentsPanel({ record }) {
  const rows = useMemo(() => buildStandardAttachmentRows(record), [record]);
  const ownerKey = useMemo(() => resolveStandardAttachmentOwnerKey(record), [record]);
  const baseAttachments = useMemo(
    () => rows.map(convertStandardAttachmentRow).filter(Boolean),
    [rows]
  );
  const [storedAttachments, setStoredAttachments] = useState(() =>
    readStandardDetailStoredAttachments(ownerKey)
  );
  const [deletedBaseIds, setDeletedBaseIds] = useState(() =>
    readStandardDetailDeletedBaseIds(ownerKey)
  );

  useEffect(() => {
    setStoredAttachments(readStandardDetailStoredAttachments(ownerKey));
    setDeletedBaseIds(readStandardDetailDeletedBaseIds(ownerKey));
  }, [ownerKey]);

  const attachments = useMemo(
    () => [
      ...baseAttachments.filter((attachment) => !deletedBaseIds.includes(String(attachment.id))),
      ...storedAttachments,
    ],
    [baseAttachments, deletedBaseIds, storedAttachments]
  );

  const handleUpload = (files) => {
    const next = [...storedAttachments, ...normalizeFoundationAttachments(files)];
    setStoredAttachments(next);
    writeStandardDetailStoredAttachments(ownerKey, next);
  };

  const handleDelete = (attachmentId) => {
    const baseIds = new Set(baseAttachments.map((attachment) => attachment.id));
    if (baseIds.has(attachmentId)) {
      const next = [...new Set([...deletedBaseIds, String(attachmentId)])];
      setDeletedBaseIds(next);
      writeStandardDetailDeletedBaseIds(ownerKey, next);
      return;
    }
    const next = storedAttachments.filter((attachment) => attachment.id !== attachmentId);
    setStoredAttachments(next);
    writeStandardDetailStoredAttachments(ownerKey, next);
  };

  return (
    <FoundationAttachment
      attachments={attachments}
      onUpload={handleUpload}
      onDelete={handleDelete}
    />
  );
}

export function StandardDetailMemoPanel({ record }) {
  const sections = useMemo(() => buildStandardMemoSections(record), [record]);

  return (
    <div className="titan-standard-detail-popup__memo">
      {sections.map((section) => (
        <div key={section.key} className="titan-standard-detail-popup__memo-item">
          <span className="titan-standard-detail-popup__memo-label">{section.label}</span>
          <p className="titan-standard-detail-popup__memo-text">{section.value}</p>
        </div>
      ))}
    </div>
  );
}
