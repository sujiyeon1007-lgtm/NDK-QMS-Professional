import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";

import TitanDataTable from "../../foundation/components/DataTable";
import TitanSearchPanel from "../../foundation/components/TitanSearchPanel";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import { useTitanListSearch } from "../../foundation/hooks/useTitanListSearch";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import {
  createEmptyDocumentManagementSearch,
  STANDARD_PRODUCT_BASIC_SEARCH_FIELDS,
} from "../../config/listSearchStandard";
import { buildDocumentProductListColumns } from "../../config/standardProductList";
import TitanStandardProductAdvancedSearch from "../../foundation/components/TitanStandardProductAdvancedSearch";
import { useSearchSuggestionHelpers } from "../../foundation/components/TitanSearchPanel";
import StatusChip from "../../foundation/components/StatusChip";
import { getProductionProcessCodes } from "../../config/productionProcessCodes";
import { getMasterDataByCategory } from "../../utils/masterData";
import {
  buildProductDocumentListRows,
  buildProductDocumentStatusRows,
  matchesDocumentManagementSearch,
} from "../../utils/productDocumentStatus";
import TitanWorkspaceModal from "../../foundation/components/TitanWorkspaceModal";
import ProductDocumentStatusPanel from "./ProductDocumentStatusPanel";
import { openRowDetailPopup } from "../../foundation/utils/openRowDetailPopup";
import TitanScreenDetailPopup from "../../foundation/components/TitanScreenDetailPopup";
import DocumentStatusChip from "./DocumentStatusChip";
import {
  buildProductDocumentHistoryRows,
  buildProductRevisionHistoryRows,
} from "../../utils/productDocumentStatus";
import { EventListPanel } from "../../foundation/components/detailPopup/DetailPopupPanels";
import InspectionRegisterRowActions from "../Quality/InspectionRegisterRowActions";
import { getSessionProductionRecords } from "../../utils/productionRecords";

import "../Quality/QualityManagement.css";
import "./DocumentManagementPage.css";

const PRODUCT_SELECTION_KEY = "titan-document-product-id";

export default function DocumentManagementPage() {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeId, setActiveId] = useState(null);
  const [detailPopupRow, setDetailPopupRow] = useState(null);
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
    () => filteredRows.find((row) => row.id === activeId) ?? null,
    [activeId, filteredRows]
  );

  const traceRecord = useMemo(() => {
    if (!activeRow) return null;
    const records = getSessionProductionRecords();
    return (
      records.find(
        (record) =>
          record.partNo === activeRow.partNo &&
          String(record.company ?? "").trim() === String(activeRow.company ?? "").trim()
      ) ??
      records.find((record) => record.id === activeRow.id) ?? {
        id: activeRow.id,
        partNo: activeRow.partNo,
        partName: activeRow.name,
        material: activeRow.material,
        company: activeRow.company,
      }
    );
  }, [activeRow, refreshKey]);

  const documentStatusRows = useMemo(
    () => buildProductDocumentStatusRows(activeRow),
    [activeRow, refreshKey, documentModalOpen]
  );

  const openDocumentModal = useCallback((row = activeRow) => {
    if (!row) return;
    setActiveId(row.id);
    sessionStorage.setItem(PRODUCT_SELECTION_KEY, row.id);
    setDocumentModalOpen(true);
  }, [activeRow]);

  const handleDeleteRow = useCallback((row) => {
    if (!row) return;
    const confirmed = globalThis.confirm?.(
      `${row.partNo} 문서 등록 정보를 삭제하시겠습니까?\n(Demo — 실제 삭제는 기준정보 연동 후 적용)`
    );
    if (!confirmed) return;
    setRefreshKey((key) => key + 1);
  }, []);

  const processCodes = useMemo(() => getProductionProcessCodes(), []);
  const { getSuggestions } = useSearchSuggestionHelpers(searchRecords, {
    process: processCodes.map((item) => item.name),
  });

  const columns = useMemo(
    () =>
      buildDocumentProductListColumns({
        renderProcess: (row) =>
          row.currentProcess && row.currentProcess !== "—" ? (
            <StatusChip variant="wait">{row.currentProcess}</StatusChip>
          ) : (
            "—"
          ),
        renderActions: (row) => {
          const isUnregistered = row.documentStatusId === "unregistered";
          return (
            <InspectionRegisterRowActions
              onDetail={() => {
                setActiveId(row.id);
                setDetailPopupRow(row);
              }}
              canRegister
              canEdit={!isUnregistered}
              canDelete={!isUnregistered}
              onRegister={() => openDocumentModal(row)}
              onEdit={() => openDocumentModal(row)}
              onDelete={() => handleDeleteRow(row)}
            />
          );
        },
      }),
    [openDocumentModal, handleDeleteRow]
  );

  const openDetailPopup = (row) => {
    openRowDetailPopup(row, { setActiveId, setDetailPopupRow });
  };

  const handleRowDoubleClick = useCallback(
    (row) => {
      openDetailPopup(row);
    },
    []
  );

  const handleSelectCoLotProduct = useCallback(
    (managementId) => {
      const prodRecord = getSessionProductionRecords().find((record) => record.id === managementId);
      if (!prodRecord) return;
      const target = filteredRows.find(
        (row) =>
          row.partNo === prodRecord.partNo &&
          String(row.company ?? "").trim() === String(prodRecord.company ?? "").trim()
      );
      if (target) setActiveId(target.id);
    },
    [filteredRows]
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
      <TitanSearchPanel
        draft={draft}
        onDraftChange={onDraftChange}
        onSearch={onSearch}
        onReset={onReset}
        advancedOpen={advancedOpen}
        onAdvancedToggle={onAdvancedToggle}
        companies={companies}
        records={searchRecords}
        basicFields={STANDARD_PRODUCT_BASIC_SEARCH_FIELDS}
        showStatusField
        statusFieldLabel="문서상태"
        advancedContent={
          <TitanStandardProductAdvancedSearch
            draft={draft}
            onDraftChange={onDraftChange}
            getSuggestions={getSuggestions}
          />
        }
      />

      <div className="qms-document-page__list quality-page__list">
        <TitanDataTable
          className="qms-document-page__table"
          columns={columns}
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

      <TitanScreenDetailPopup
        screenKey="documents"
        open={Boolean(detailPopupRow)}
        onClose={() => setDetailPopupRow(null)}
        record={detailPopupRow}
        context={{
          detailContent: detailPopupRow ? (
            <dl className="titan-row-summary__meta inbound-detail">
              <div>
                <dt>품번</dt>
                <dd>{detailPopupRow.partNo}</dd>
              </div>
              <div>
                <dt>품명</dt>
                <dd>{detailPopupRow.name}</dd>
              </div>
              <div>
                <dt>재질</dt>
                <dd>{detailPopupRow.material}</dd>
              </div>
              <div>
                <dt>규격</dt>
                <dd>{detailPopupRow.spec}</dd>
              </div>
              <div>
                <dt>거래처</dt>
                <dd>{detailPopupRow.company}</dd>
              </div>
              <div>
                <dt>문서상태</dt>
                <dd>
                  <DocumentStatusChip statusId={detailPopupRow.documentStatusId} />
                </dd>
              </div>
              <div>
                <dt>Revision</dt>
                <dd>{detailPopupRow.revision}</dd>
              </div>
              <div>
                <dt>최종 수정일</dt>
                <dd>{detailPopupRow.lastModified}</dd>
              </div>
            </dl>
          ) : null,
          traceRecord: detailPopupRow
            ? getSessionProductionRecords().find(
                (record) =>
                  record.partNo === detailPopupRow.partNo &&
                  String(record.company ?? "").trim() === String(detailPopupRow.company ?? "").trim()
              )
            : null,
          onSelectCoLotProduct: handleSelectCoLotProduct,
          eventLists: {
            documentHistory: detailPopupRow ? (
              <EventListPanel
                items={buildProductDocumentHistoryRows(detailPopupRow).map((row) => ({
                  key: `${row.date}-${row.label}`,
                  label: row.date,
                  detail: row.label,
                }))}
              />
            ) : null,
            revision: detailPopupRow ? (
              <EventListPanel
                items={buildProductRevisionHistoryRows(detailPopupRow).map((row) => ({
                  key: `${row.revision}-${row.note}`,
                  label: row.revision,
                  detail: row.note,
                }))}
              />
            ) : null,
          },
        }}
      />
    </div>
  );
}
