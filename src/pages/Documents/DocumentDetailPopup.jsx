import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Box from "@mui/material/Box";
import { Download, ExternalLink, Pencil, Trash2 } from "lucide-react";

import { SecondaryButton } from "../../foundation/components/Button";
import { titanDialogTransitionProps } from "../../foundation/components/titanPopupTransition";
import { DOCUMENT_DETAIL_POPUP_TABS } from "../../config/documentDetailPopupTabs";
import { appendDocumentChangeLog } from "../../utils/documentChangeLogSession";
import { deleteCompanyDocument } from "../../utils/documentCrudActions";
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
import {
  TITAN_DOCUMENT_DETAIL_POPUP_HEIGHT,
  TITAN_DOCUMENT_DETAIL_POPUP_WIDTH,
} from "../../config/documentDetailPopupLayout";
import "../../foundation/components/detailPopup/detailPopup.css";
import "../../foundation/components/detailPopup/standardDetailPopup.css";
import "./DocumentCompanyPopup.css";

function DocumentDetailTabPanel({ children, value, index }) {
  const isActive = Number(value) === index;

  return (
    <div
      role="tabpanel"
      id={`document-detail-tabpanel-${index}`}
      aria-labelledby={`document-detail-tab-${index}`}
      aria-hidden={!isActive}
      className={["titan-standard-detail-popup__tab-panel", isActive ? "is-active" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="titan-standard-detail-popup__tab-panel-inner">{children}</div>
    </div>
  );
}

function DocumentDetailSummaryHeader({ companyName, row }) {
  const fields = formatDocumentDetailFields(row, companyName);
  if (!fields) return null;

  return (
    <header
      id="document-detail-popup-summary"
      className="titan-standard-detail-popup__header-card document-detail-popup__header"
    >
      <div className="document-detail-popup__header-main">
        <span className="document-detail-popup__header-company">
          {companyName || row.company || "—"}
        </span>
        <strong className="titan-standard-detail-popup__product-identity document-detail-popup__header-title">
          {fields.title}
        </strong>
        <div className="document-detail-popup__header-meta-line">
          <span className="document-detail-popup__header-label-inline">문서번호</span>
          <span className="document-detail-popup__header-doc-no">{fields.documentNo}</span>
        </div>
        {fields.attachmentName ? (
          <div className="document-detail-popup__header-meta-line document-detail-popup__header-attachment">
            <span className="document-detail-popup__header-label-inline">첨부</span>
            <span
              className="document-detail-popup__header-attachment-name"
              title={fields.attachmentName}
            >
              {fields.attachmentName}
            </span>
          </div>
        ) : null}
      </div>
      <aside className="document-detail-popup__header-rev" aria-label="Revision">
        <span className="titan-standard-detail-popup__header-label">Rev</span>
        <strong className="document-detail-popup__header-rev-value">{fields.revision}</strong>
      </aside>
    </header>
  );
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

  const renderTabPanel = (tabId) => {
    switch (tabId) {
      case "revision":
        return (
          <DocumentRevisionHistoryPanel
            revisionGroup={activeRevisionGroup}
            onSelectRevision={(target) => onSelectRow?.(target)}
            onRegisterRevision={() => setRegisterMode("revision")}
            canRegisterRevision={permissions.canRevision}
          />
        );
      case "attachments":
        return (
          <DocumentAttachmentsPanel
            row={row}
            onDownload={downloadDocumentRow}
            onOpen={openDocumentRow}
          />
        );
      case "related":
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
      case "memo":
        return <DocumentMemoPanel row={row} />;
      default:
        return <DocumentBasicInfoPanel row={row} companyName={companyName} />;
    }
  };

  if (!open || !row) return null;

  return createPortal(
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth={false}
        maxWidth={false}
        scroll="paper"
        className="titan-detail-popup titan-standard-detail-popup document-detail-popup"
        aria-labelledby="document-detail-popup-summary"
        sx={{ zIndex: 1500 }}
        {...titanDialogTransitionProps}
        slotProps={{
          backdrop: {
            sx: { zIndex: 1499 },
          },
          container: {
            sx: {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100vw",
              height: "100dvh",
              margin: 0,
              padding: 0,
            },
          },
          paper: {
            className:
              "titan-detail-popup__paper titan-standard-detail-popup__paper document-detail-popup__paper",
            sx: {
              width: `${TITAN_DOCUMENT_DETAIL_POPUP_WIDTH}px`,
              minWidth: `${TITAN_DOCUMENT_DETAIL_POPUP_WIDTH}px`,
              maxWidth: `${TITAN_DOCUMENT_DETAIL_POPUP_WIDTH}px`,
              height: `${TITAN_DOCUMENT_DETAIL_POPUP_HEIGHT}px`,
              minHeight: `${TITAN_DOCUMENT_DETAIL_POPUP_HEIGHT}px`,
              maxHeight: `${TITAN_DOCUMENT_DETAIL_POPUP_HEIGHT}px`,
              overflow: "hidden",
              boxSizing: "border-box",
              flexShrink: 0,
              flexGrow: 0,
              margin: 0,
            },
          },
        }}
      >
        <div className="titan-standard-detail-popup__shell document-detail-popup__shell">
          <DocumentDetailSummaryHeader companyName={companyName} row={row} />

          <Box className="titan-detail-popup__tabs-wrap titan-standard-detail-popup__tabs-wrap">
            <Tabs
              value={activeTab}
              onChange={(_, value) => setActiveTab(value)}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="문서 상세 탭"
              className="titan-detail-popup__tabs"
            >
              {DOCUMENT_DETAIL_POPUP_TABS.map((tab, index) => (
                <Tab
                  key={tab.id}
                  value={index}
                  label={tab.label}
                  id={`document-detail-tab-${index}`}
                  aria-controls={`document-detail-tabpanel-${index}`}
                />
              ))}
            </Tabs>
          </Box>

          <DialogContent
            className="titan-detail-popup__content titan-standard-detail-popup__content"
            dividers
          >
            <div className="titan-standard-detail-popup__tab-stage">
              {DOCUMENT_DETAIL_POPUP_TABS.map((tab, index) => (
                <DocumentDetailTabPanel key={tab.id} value={activeTab} index={index}>
                  {renderTabPanel(tab.id)}
                </DocumentDetailTabPanel>
              ))}
            </div>
          </DialogContent>

          <div className="titan-detail-popup__footer titan-standard-detail-popup__footer document-detail-popup__footer">
            <div className="document-detail-popup__footer-actions">
              {canEditSelected ? (
                <SecondaryButton type="button" onClick={() => setRegisterMode("edit")}>
                  <Pencil size={12} aria-hidden="true" />
                  수정
                </SecondaryButton>
              ) : null}
              {permissions.canDelete ? (
                <SecondaryButton type="button" onClick={handleDelete}>
                  <Trash2 size={12} aria-hidden="true" />
                  삭제
                </SecondaryButton>
              ) : null}
              {permissions.canDownload ? (
                <>
                  <SecondaryButton
                    type="button"
                    onClick={() => downloadDocumentRow(row)}
                    disabled={!canDownloadSelected}
                  >
                    <Download size={12} aria-hidden="true" />
                    다운로드
                  </SecondaryButton>
                  <SecondaryButton
                    type="button"
                    onClick={() => openDocumentRow(row)}
                    disabled={!canDownloadSelected}
                  >
                    <ExternalLink size={12} aria-hidden="true" />
                    열기
                  </SecondaryButton>
                </>
              ) : null}
            </div>
            <SecondaryButton type="button" onClick={onClose}>
              닫기
            </SecondaryButton>
          </div>
        </div>
      </Dialog>

      <DocumentRegisterModal
        open={Boolean(registerMode)}
        onClose={() => setRegisterMode(null)}
        onSaved={handleSaved}
        companyName={companyName}
        mode={registerMode || "register"}
        initialRow={registerMode === "register" ? null : row}
      />
    </>,
    document.body
  );
}
