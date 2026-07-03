import { Download, Eye, FilePlus2, Pencil } from "lucide-react";

import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import DocumentStatusChip from "./DocumentStatusChip";

function StatusField({ label, value, span = 1 }) {
  return (
    <div className={`qms-document-card__field${span === 2 ? " span-2" : ""}`}>
      <span className="qms-document-card__label">{label}</span>
      <span className="qms-document-card__value">{value || "—"}</span>
    </div>
  );
}

export default function ProductDocumentStatusPanel({
  rows = [],
  onView,
  onRegister,
  onEdit,
  onDownload,
}) {
  if (!rows.length) {
    return <p className="qms-document-detail__empty">문서현황이 없습니다.</p>;
  }

  return (
    <div className="qms-document-status-list">
      {rows.map((row) => (
        <article key={row.id} className="qms-document-card titan-card">
          <header className="qms-document-card__head">
            <h3>{row.label}</h3>
            <DocumentStatusChip statusId={row.statusId} />
          </header>

          <div className="qms-document-card__grid">
            <StatusField label="문서명" value={row.documentName} />
            <StatusField label="등록 여부" value={row.registeredLabel} />
            <StatusField label="Revision" value={row.revision} />
            <StatusField label="승인자" value={row.approver} />
            <StatusField label="등록일" value={row.registeredDate} />
            <StatusField label="최종 수정일" value={row.lastModified} />
            <StatusField label="비고" value={row.note} span={2} />
          </div>

          <div className="qms-document-card__actions">
            <SecondaryButton type="button" disabled={!row.canView} onClick={() => onView?.(row)}>
              <Eye size={14} />
              보기
            </SecondaryButton>
            <PrimaryButton type="button" onClick={() => onRegister?.(row)}>
              <FilePlus2 size={14} />
              등록
            </PrimaryButton>
            <SecondaryButton
              type="button"
              disabled={row.statusId === "unregistered"}
              onClick={() => onEdit?.(row)}
            >
              <Pencil size={14} />
              수정
            </SecondaryButton>
            <SecondaryButton type="button" disabled={!row.canDownload} onClick={() => onDownload?.(row)}>
              <Download size={14} />
              다운로드
            </SecondaryButton>
          </div>
        </article>
      ))}
    </div>
  );
}
