import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, FolderOpen } from "lucide-react";

import { PrimaryButton } from "../../foundation/components/Button";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanSearchPanel from "../../foundation/components/TitanSearchPanel";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import TitanWorkspaceModal from "../../foundation/components/TitanWorkspaceModal";
import { useTitanListSearch } from "../../foundation/hooks/useTitanListSearch";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import { createEmptyDocumentManagementSearch } from "../../config/listSearchStandard";
import { getMasterDataByCategory } from "../../utils/masterData";
import {
  buildProductDocumentListRows,
  buildProductDocumentStatusRows,
  matchesDocumentManagementSearch,
} from "../../utils/productDocumentStatus";
import SectionPageActions from "../../foundation/layout/SectionPageActions";
import DocumentStatusChip from "./DocumentStatusChip";
import ProductDocumentStatusPanel from "./ProductDocumentStatusPanel";

import "./DocumentManagementPage.css";

const PRODUCT_SELECTION_KEY = "titan-document-product-id";

const DOCUMENT_LIST_COLUMNS = [
  { key: "partNo", label: "품번", widthPercent: 14 },
  { key: "name", label: "품명", widthPercent: 22 },
  { key: "material", label: "재질", widthPercent: 10 },
  { key: "spec", label: "규격", widthPercent: 12 },
  { key: "company", label: "거래처", widthPercent: 13 },
  {
    key: "documentStatusId",
    label: "문서상태",
    widthPercent: 12,
    render: (row) => <DocumentStatusChip statusId={row.documentStatusId} />,
  },
  { key: "revision", label: "Revision", widthPercent: 9 },
  { key: "lastModified", label: "최종 수정일", widthPercent: 10 },
];

export default function DocumentManagementPage() {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeId, setActiveId] = useState(null);
  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const { search, draft, onDraftChange, onSearch, onReset, advancedOpen, onAdvancedToggle } =
    useTitanListSearch(createEmptyDocumentManagementSearch, { storageKey: "documents" });

  const companies = useMemo(() => getMasterDataByCategory("companies"), [refreshKey]);

  const listRows = useMemo(() => buildProductDocumentListRows(), [refreshKey]);

  const filteredRows = useMemo(
    () => listRows.filter((row) => matchesDocumentManagementSearch(search, row)),
    [listRows, search]
  );

  const searchRecords = useMemo(
    () =>
      listRows.map((row) => ({
        ...row,
        partName: row.name,
        status: row.documentStatusLabel,
      })),
    [listRows]
  );

  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalCount,
    pagedItems: pagedRows,
  } = useListPagination(filteredRows);

  const activeRow = useMemo(
    () => filteredRows.find((row) => row.id === activeId) ?? pagedRows.find((row) => row.id === activeId) ?? null,
    [activeId, filteredRows, pagedRows]
  );

  const documentStatusRows = useMemo(
    () => buildProductDocumentStatusRows(activeRow),
    [activeRow, refreshKey, documentModalOpen]
  );

  const openDocumentModal = useCallback(
    (row = activeRow) => {
      if (!row) return;
      setActiveId(row.id);
      sessionStorage.setItem(PRODUCT_SELECTION_KEY, row.id);
      setDocumentModalOpen(true);
    },
    [activeRow]
  );

  const handleRowDoubleClick = useCallback(
    (row) => {
      openDocumentModal(row);
    },
    [openDocumentModal]
  );

  const handleDocumentAction = (statusRow, mode = "register") => {
    if (!activeRow) return;
    if (statusRow.registerRoute === "inspection") {
      navigate(
        `/documents/inspection?partNo=${encodeURIComponent(activeRow.partNo)}&company=${encodeURIComponent(activeRow.company)}`
      );
      return;
    }
    sessionStorage.setItem("titan-product-selected-id", activeRow.id);
    if (mode === "view" && statusRow.statusId === "unregistered") return;
    navigate("/settings/products");
  };

  const handleDownload = (statusRow) => {
    if (!statusRow.canDownload || !activeRow) return;
    sessionStorage.setItem("titan-product-selected-id", activeRow.id);
    navigate("/settings/products");
  };

  return (
    <div className="qms-document-page">
      <SectionPageActions>
        <PrimaryButton type="button" disabled={!activeRow} onClick={() => openDocumentModal()}>
          <FolderOpen size={16} aria-hidden="true" />
          문서관리
        </PrimaryButton>
      </SectionPageActions>

      <TitanSearchPanel
        draft={draft}
        onDraftChange={onDraftChange}
        onSearch={onSearch}
        onReset={onReset}
        advancedOpen={advancedOpen}
        onAdvancedToggle={onAdvancedToggle}
        companies={companies}
        records={searchRecords}
        showStatusField
        statusFieldLabel="상태"
      />

      <div className="qms-document-page__list">
        <TitanDataTable
          className="qms-document-page__table"
          columns={DOCUMENT_LIST_COLUMNS}
          rows={pagedRows}
          activeRowId={activeRow?.id}
          onRowClick={(row) => setActiveId(row.id)}
          onRowDoubleClick={handleRowDoubleClick}
          emptyMessage="조회된 제품이 없습니다."
        />

        <TitanTableFooter
          totalCount={totalCount}
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      <TitanWorkspaceModal
        open={documentModalOpen}
        onClose={() => {
          setDocumentModalOpen(false);
          setRefreshKey((key) => key + 1);
        }}
        title="문서현황"
        kicker={activeRow ? `${activeRow.company} · ${activeRow.partNo}` : "문서관리"}
      >
        {activeRow ? (
          <div className="qms-document-modal-body">
            <p className="qms-document-hub__modal-desc">
              <FileText size={14} aria-hidden="true" />
              {activeRow.name} — 연결 문서 {documentStatusRows.length}종
            </p>
            <ProductDocumentStatusPanel
              rows={documentStatusRows}
              onView={(row) => handleDocumentAction(row, "view")}
              onRegister={(row) => handleDocumentAction(row, "register")}
              onEdit={(row) => handleDocumentAction(row, "edit")}
              onDownload={handleDownload}
            />
          </div>
        ) : null}
      </TitanWorkspaceModal>
    </div>
  );
}
