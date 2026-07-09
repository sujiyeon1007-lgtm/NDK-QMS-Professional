import {
  Download,
  ExternalLink,
  FileSpreadsheet,
  FileType2,
  Plus,
} from "lucide-react";
import TitanDataTable from "../../foundation/components/DataTable";
import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import FoundationAttachment from "../../foundation/components/FoundationAttachment";
import { DOCUMENT_RELATED_SECTIONS } from "../../config/documentDetailPopupTabs";
import { formatDocumentRelativeTime, resolvePreviewKind } from "../../config/documentManagementV13";
import { getDocumentChangeLogs } from "../../utils/documentChangeLogSession";
import {
  getDocumentFoundationAttachments,
  isBaseDocumentAttachment,
} from "../../utils/documentFoundationAttachments";
import { formatDocumentDetailFields } from "./documentDetailActions";

function DocumentPreviewFrame({ row }) {
  const previewKind = row ? resolvePreviewKind(row) : "unknown";
  const previewUrl = row?.dataUrl || "";

  if (!row) {
    return <p className="document-company-popup__preview-empty">문서를 선택하면 미리보기가 표시됩니다.</p>;
  }

  if (!previewUrl) {
    return <p className="document-company-popup__preview-empty">첨부 미리보기가 없습니다.</p>;
  }

  if (previewKind === "image") {
    return (
      <div className="document-company-popup__preview-frame">
        <img src={previewUrl} alt={row.title} />
      </div>
    );
  }

  if (previewKind === "pdf") {
    return (
      <div className="document-company-popup__preview-frame">
        <iframe title={row.title} src={previewUrl} />
      </div>
    );
  }

  if (previewKind === "word" || previewKind === "excel") {
    return (
      <div className="document-company-popup__office-preview">
        {previewKind === "word" ? (
          <FileType2 size={36} aria-hidden="true" />
        ) : (
          <FileSpreadsheet size={36} aria-hidden="true" />
        )}
        <strong>{row.pdfFileName || row.title}</strong>
        <p>브라우저 미리보기 미지원 — 파일 정보 확인 후 새 탭에서 열 수 있습니다.</p>
        <SecondaryButton
          type="button"
          onClick={() => window.open(previewUrl, "_blank", "noopener,noreferrer")}
        >
          <ExternalLink size={12} aria-hidden="true" />
          새 탭에서 열기
        </SecondaryButton>
      </div>
    );
  }

  return (
    <div className="document-company-popup__preview-frame">
      <iframe title={row.title} src={previewUrl} />
    </div>
  );
}

export function DocumentBasicInfoPanel({ row, companyName = "" }) {
  const fields = formatDocumentDetailFields(row, companyName);

  if (!fields) {
    return <p className="document-company-popup__preview-empty">문서를 선택하세요.</p>;
  }

  return (
    <dl className="document-detail-popup__basic-grid">
      <dt>업체명</dt>
      <dd>{fields.company}</dd>
      <dt>문서명</dt>
      <dd>{fields.title}</dd>
      <dt>문서번호</dt>
      <dd className="document-detail-popup__value-text">{fields.documentNo}</dd>
      <dt>문서분류</dt>
      <dd>{fields.documentTypeLabel}</dd>
      <dt>Rev</dt>
      <dd>{fields.revision}</dd>
      <dt>등록일</dt>
      <dd>{fields.registeredDate}</dd>
      <dt>등록자</dt>
      <dd>{fields.registeredBy}</dd>
      <dt>상태</dt>
      <dd>{fields.approvalStatus}</dd>
      <dt>첨부파일</dt>
      <dd className="document-detail-popup__value-text" title={fields.attachmentName}>
        {fields.attachmentLabel}
      </dd>
      <dt className="document-detail-popup__basic-note-label">문서설명</dt>
      <dd className="document-detail-popup__basic-note-value">{fields.description}</dd>
    </dl>
  );
}

export function DocumentRevisionHistoryPanel({
  revisionGroup,
  onSelectRevision,
  onRegisterRevision,
  canRegisterRevision,
}) {
  if (!revisionGroup) {
    return <p className="document-company-popup__preview-empty">개정 이력을 표시할 문서를 선택하세요.</p>;
  }

  return (
    <div className="document-company-popup__tab-stack">
      <div className="document-company-popup__tab-toolbar">
        <p className="document-company-popup__revision-title">
          {revisionGroup.documentNo} — Rev History
        </p>
        {canRegisterRevision ? (
          <PrimaryButton type="button" onClick={onRegisterRevision}>
            <Plus size={12} aria-hidden="true" />
            개정 등록
          </PrimaryButton>
        ) : null}
      </div>
      <TitanDataTable
        columns={[
          { key: "revision", label: "Rev", widthPercent: 8 },
          { key: "changedDate", label: "변경일", widthPercent: 12 },
          { key: "changedBy", label: "변경자", widthPercent: 10 },
          { key: "changeNote", label: "변경내용", widthPercent: 22 },
          { key: "attachment", label: "첨부파일", widthPercent: 14 },
        ]}
        rows={revisionGroup.revisions.map((item) => ({
          id: item.id,
          revision: item.revision || "—",
          changedDate: item.registeredDate || item.revisionDate || "—",
          changedBy: item.registeredBy || "—",
          changeNote: item.description || item.approvalStatus || "—",
          attachment: item.pdfFileName || (item.hasPdf ? "○" : "—"),
        }))}
        getRowId={(item) => item.id}
        activeRowId={revisionGroup.current?.id}
        onRowClick={(item) => {
          const target = revisionGroup.revisions.find((row) => row.id === item.id);
          if (target) onSelectRevision?.(target);
        }}
        emptyMessage="Revision 이력이 없습니다."
      />
    </div>
  );
}

export function DocumentAttachmentsPanel({ row, onUpload, onDelete }) {
  if (!row) {
    return <p className="document-company-popup__preview-empty">첨부 파일이 없습니다.</p>;
  }

  return (
    <FoundationAttachment
      attachments={getDocumentFoundationAttachments(row)}
      onUpload={onUpload}
      onDelete={onDelete}
      canDeleteAttachment={(attachment) => !isBaseDocumentAttachment(attachment)}
    />
  );
}

export function DocumentRelatedPanel({ rows, currentRow, onSelectRow }) {
  if (!currentRow) {
    return <p className="document-company-popup__preview-empty">관련 문서를 표시할 문서를 선택하세요.</p>;
  }

  return (
    <div className="document-company-popup__related-sections">
      {DOCUMENT_RELATED_SECTIONS.map((section) => {
        const items = rows.filter(
          (row) =>
            row.id !== currentRow.id &&
            section.types.includes(row.documentType) &&
            row.company === currentRow.company
        );

        return (
          <section key={section.id} className="document-company-popup__related-section">
            <h4>{section.label}</h4>
            {items.length ? (
              <ul>
                {items.slice(0, 8).map((item) => (
                  <li key={item.id}>
                    <button type="button" onClick={() => onSelectRow?.(item)}>
                      <strong>{item.title}</strong>
                      <span>
                        {item.documentNo} · Rev {item.revision}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="document-company-popup__related-empty">등록된 문서가 없습니다.</p>
            )}
          </section>
        );
      })}
    </div>
  );
}

export function DocumentMemoPanel({ row }) {
  if (!row) {
    return <p className="document-company-popup__preview-empty">메모를 표시할 문서를 선택하세요.</p>;
  }

  const changeLogs = getDocumentChangeLogs(row.id).slice(0, 5);

  return (
    <div className="document-company-popup__tab-stack">
      <dl className="document-company-popup__info-grid">
        <div className="document-company-popup__info-grid-row--wide">
          <dt>관리 메모</dt>
          <dd>{row.description || "—"}</dd>
        </div>
        <div className="document-company-popup__info-grid-row--wide">
          <dt>특이사항</dt>
          <dd>{row.tags?.length ? row.tags.join(", ") : "—"}</dd>
        </div>
      </dl>
      {changeLogs.length ? (
        <div className="document-company-popup__memo-log">
          <h4>최근 변경</h4>
          <ul>
            {changeLogs.map((entry) => (
              <li key={entry.id}>
                <strong>{entry.action}</strong>
                <span>{entry.detail || "—"}</span>
                <em>
                  {entry.userName} · {formatDocumentRelativeTime(entry.at)}
                </em>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function DocumentDetailPreviewPanel({ row, activeTab }) {
  if (!row) {
    return <p className="document-company-popup__preview-empty">문서를 선택하면 미리보기가 표시됩니다.</p>;
  }

  if (activeTab === "revision") {
    if (row?.dataUrl || row?.hasPdf) {
      return <DocumentPreviewFrame row={row} />;
    }
    return (
      <p className="document-company-popup__preview-hint">
        개정이력 탭에서 Rev 행을 선택하면 해당 Rev 미리보기가 표시됩니다.
      </p>
    );
  }

  if (activeTab === "attachments") {
    return <DocumentPreviewFrame row={row} />;
  }

  if (activeTab === "related" || activeTab === "memo") {
    return (
      <p className="document-company-popup__preview-hint">
        목록에서 문서를 선택하면 관련 정보를 확인할 수 있습니다.
      </p>
    );
  }

  return <DocumentPreviewFrame row={row} />;
}
