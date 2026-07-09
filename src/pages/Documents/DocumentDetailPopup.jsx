import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, ExternalLink, Pencil, Trash2 } from "lucide-react";

import FoundationActionBar from "../../foundation/components/FoundationActionBar";
import FoundationQrPanel from "../../foundation/components/FoundationQrPanel";
import TitanStandardDetailPopup from "../../foundation/components/detailPopup/TitanStandardDetailPopup";
import {
  DOCUMENT_DETAIL_TAB_IDS,
  getDocumentDetailTabs,
} from "../../config/detailTabs/documentDetailTabs";
import { appendDocumentChangeLog } from "../../utils/documentChangeLogSession";
import { deleteCompanyDocument } from "../../utils/documentCrudActions";
import {
  appendDocumentFoundationAttachments,
  deleteDocumentFoundationAttachment,
} from "../../utils/documentFoundationAttachments";
import { getDocumentManagementActionPermissions } from "../../utils/documentManagementPermissions";
import { groupDocumentsByDocumentNo } from "../../utils/companyDocumentManagement";
import {
  DocumentAttachmentsPanel,
  DocumentBasicInfoPanel,
  DocumentMemoPanel,
  DocumentRelatedPanel,
  DocumentRevisionHistoryPanel,
} from "./DocumentDetailTabPanels";
import DocumentRegisterModal from "./DocumentRegisterModal";
import {
  downloadDocumentRow,
  formatDocumentDetailFields,
  openDocumentRow,
} from "./documentDetailActions";
import "../../foundation/components/detailPopup/detailPopup.css";
import "../../foundation/components/detailPopup/standardDetailPopup.css";
import "./DocumentCompanyPopup.css";

function buildDocumentStandardSummary(companyName, row) {
  const fields = formatDocumentDetailFields(row, companyName);
  if (!fields) return null;

  return {
    company: companyName || row.company || "—",
    partName: fields.title || "—",
    partNo: fields.documentNo || "문서번호 미등록",
    lotNo: fields.revision || "—",
    currentProcess: row.documentTypeLabel || row.typeLabel || "문서관리",
    currentProcessVariant: "document",
    statusLabel: row.statusLabel || row.approvalStatus || "등록",
    statusVariant: row.statusVariant === "complete" ? "complete" : "wait",
  };
}

export default function DocumentDetailPopup({
  open,
  onClose,
  companyName = "",
  row,
  sourceRows = [],
  onRefresh,
  onSelectRow,
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [registerMode, setRegisterMode] = useState(null);
  const [uiTick, setUiTick] = useState(0);
  const permissions = useMemo(
    () => getDocumentManagementActionPermissions(),
    [open, uiTick]
  );

  const revisionGroups = useMemo(
    () => groupDocumentsByDocumentNo(sourceRows),
    [sourceRows]
  );

  const activeRevisionGroup = useMemo(() => {
    if (!row) return null;
    return (
      revisionGroups.find((group) => group.revisions.some((item) => item.id === row.id)) ?? null
    );
  }, [revisionGroups, row]);

  const canEditSelected = Boolean(permissions.canEdit && row?.source === "related-document");
  const canDownloadSelected = Boolean(row?.hasPdf || row?.dataUrl);
  const summary = useMemo(() => buildDocumentStandardSummary(companyName, row), [companyName, row]);
  const tabs = useMemo(() => getDocumentDetailTabs(row), [row]);

  useEffect(() => {
    if (open) {
      setActiveTab(0);
    }
  }, [open, row?.id]);

  const bumpUi = useCallback(() => setUiTick((value) => value + 1), []);

  const handleDelete = () => {
    if (!row) return;
    if (!window.confirm(`"${row.title}" 문서를 삭제하시겠습니까?`)) return;
    const result = deleteCompanyDocument(row);
    if (!result.ok) {
      window.alert(result.message);
      return;
    }
    bumpUi();
    onRefresh?.();
    onClose();
  };

  const handleSaved = () => {
    setRegisterMode(null);
    bumpUi();
    onRefresh?.();
  };

  const handleUploadAttachments = useCallback(
    (files) => {
      if (!row) return;
      appendDocumentFoundationAttachments(row, files);
      appendDocumentChangeLog(row.id, "첨부파일 등록", `${files.length}개`);
      bumpUi();
      onRefresh?.();
    },
    [bumpUi, onRefresh, row]
  );

  const handleDeleteAttachment = useCallback(
    (attachmentId) => {
      if (!row) return;
      deleteDocumentFoundationAttachment(row, attachmentId);
      appendDocumentChangeLog(row.id, "첨부파일 삭제", String(attachmentId));
      bumpUi();
      onRefresh?.();
    },
    [bumpUi, onRefresh, row]
  );

  const renderDocumentActions = () => (
    <FoundationActionBar
      className="document-detail-popup__foundation-actions"
      ariaLabel="문서 작업"
      align="start"
      size="compact"
      actions={[
        {
          id: "editDocument",
          label: "수정",
          icon: Pencil,
          hidden: !canEditSelected,
          onClick: () => setRegisterMode("edit"),
        },
        {
          id: "deleteDocument",
          label: "삭제",
          icon: Trash2,
          variant: "danger",
          hidden: !permissions.canDelete,
          onClick: handleDelete,
        },
        {
          id: "downloadDocument",
          label: "다운로드",
          icon: Download,
          hidden: !permissions.canDownload,
          disabled: !canDownloadSelected,
          onClick: () => downloadDocumentRow(row),
        },
        {
          id: "openDocument",
          label: "열기",
          icon: ExternalLink,
          hidden: !permissions.canDownload,
          disabled: !canDownloadSelected,
          onClick: () => openDocumentRow(row),
        },
      ]}
    />
  );

  const renderTabPanel = (tabId) => {
    switch (tabId) {
      case DOCUMENT_DETAIL_TAB_IDS.revisionHistory:
        return (
          <DocumentRevisionHistoryPanel
            revisionGroup={activeRevisionGroup}
            onSelectRevision={(target) => onSelectRow?.(target)}
            onRegisterRevision={() => setRegisterMode("revision")}
            canRegisterRevision={permissions.canRevision}
          />
        );
      case DOCUMENT_DETAIL_TAB_IDS.relatedDocuments:
        return (
          <DocumentRelatedPanel
            rows={sourceRows}
            currentRow={row}
            onSelectRow={(target) => {
              onSelectRow?.(target);
              appendDocumentChangeLog(target.id, "관련 문서 열람", target.title);
            }}
          />
        );
      case DOCUMENT_DETAIL_TAB_IDS.qr:
        return (
          <FoundationQrPanel
            entityType="document"
            target={row}
            title={row?.title || row?.documentNo || "문서관리"}
          />
        );
      case DOCUMENT_DETAIL_TAB_IDS.attachments:
        return (
          <DocumentAttachmentsPanel
            row={row}
            onUpload={handleUploadAttachments}
            onDelete={handleDeleteAttachment}
          />
        );
      case DOCUMENT_DETAIL_TAB_IDS.memo:
        return <DocumentMemoPanel row={row} />;
      default:
        return (
          <div className="document-detail-popup__foundation-basic">
            <DocumentBasicInfoPanel row={row} companyName={companyName} />
            {renderDocumentActions()}
          </div>
        );
    }
  };

  if (!open || !row) return null;

  return (
    <>
      <TitanStandardDetailPopup
        open={open}
        onClose={onClose}
        tabs={tabs}
        summary={summary}
        renderTabContent={renderTabPanel}
        ariaLabel="문서관리 상세정보"
      />

      <DocumentRegisterModal
        open={Boolean(registerMode)}
        onClose={() => setRegisterMode(null)}
        onSaved={handleSaved}
        companyName={companyName}
        mode={registerMode || "register"}
        initialRow={registerMode === "register" ? null : row}
      />
    </>
  );
}
