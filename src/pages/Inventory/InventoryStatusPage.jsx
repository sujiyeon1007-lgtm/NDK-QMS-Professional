import { useCallback, useMemo, useState } from "react";
import { Package, Boxes, ArrowDownToLine, ArrowUpFromLine, Printer } from "lucide-react";
import StatusChip from "../../foundation/components/StatusChip";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanSearchPanel from "../../foundation/components/TitanSearchPanel";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import TitanKpiBarSlot from "../../foundation/components/TitanKpiBarSlot";
import { SecondaryButton } from "../../foundation/components/Button";
import { openRowDetailPopup } from "../../foundation/utils/openRowDetailPopup";
import TitanScreenDetailPopup from "../../foundation/components/TitanScreenDetailPopup";
import TitanTableRowActions from "../../foundation/components/TitanTableRowActions";
import TitanPrintPreviewModal from "../../components/print/TitanPrintPreviewModal";
import InventoryListPrint from "../../components/print/InventoryListPrint";
import { useTitanListSearch } from "../../foundation/hooks/useTitanListSearch";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import { INVENTORY_PRINT, INVENTORY_VIEW_MODES } from "../../config/inventoryManagementPolicy";
import { getMasterDataByCategory } from "../../utils/masterData";
import {
  buildInventoryRowsByViewMode,
  createEmptyInventoryStatusSearch,
  matchesInventoryStatusSearch,
  summarizeInventoryStatus,
} from "../../utils/inventoryStatusAnalytics";
import { STANDARD_PRODUCT_BASIC_SEARCH_FIELDS } from "../../config/listSearchStandard";
import {
  buildInventoryByCompanyListColumns,
  buildInventoryLotProductListColumns,
  buildInventoryStatusListColumns,
} from "../../config/standardProductList";
import InventoryRowActions from "./InventoryRowActions";
import TitanStandardProductAdvancedSearch from "../../foundation/components/TitanStandardProductAdvancedSearch";
import { useSearchSuggestionHelpers } from "../../foundation/components/TitanSearchPanel";
import { getProductionProcessCodes } from "../../config/productionProcessCodes";
import { getProcessChipVariant } from "../../config/productionProcessCodes";
import { getSessionProductionRecords } from "../../utils/productionRecords";
import { exportTitanPdf, printTitanDocument } from "../../utils/titanPrintExport";
import { getPrintOutputDate } from "../../utils/titanPrintDates";
import "../InOut/InboundManagement.css";
import "./InventoryStatus.css";

export default function InventoryStatusPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewMode, setViewMode] = useState("byItem");
  const [activeId, setActiveId] = useState(null);
  const [detailPopupRow, setDetailPopupRow] = useState(null);
  const [printOpen, setPrintOpen] = useState(false);
  const [printBusy, setPrintBusy] = useState(false);

  const { search, draft, onDraftChange, onSearch, onReset, advancedOpen, onAdvancedToggle } =
    useTitanListSearch(createEmptyInventoryStatusSearch, { storageKey: "inventory-status" });

  const companies = useMemo(() => getMasterDataByCategory("companies"), []);
  const masterProducts = useMemo(() => getMasterDataByCategory("products"), [refreshKey]);

  const sessionRecords = useMemo(() => {
    void refreshKey;
    return getSessionProductionRecords();
  }, [refreshKey]);

  const allRows = useMemo(
    () => buildInventoryRowsByViewMode(viewMode, sessionRecords),
    [viewMode, sessionRecords]
  );

  const summary = useMemo(() => summarizeInventoryStatus(allRows), [allRows]);

  const rows = useMemo(
    () => allRows.filter((row) => matchesInventoryStatusSearch(row, search)),
    [allRows, search]
  );

  const viewLabel = INVENTORY_VIEW_MODES.find((mode) => mode.id === viewMode)?.label ?? "품목별";

  const {
    page,
    pageSize,
    totalCount,
    totalPages,
    pagedItems: pagedRows,
    setPage,
    setPageSize,
  } = useListPagination(rows);

  const renderStatus = useCallback(
    (row) => <StatusChip variant={row.statusVariant}>{row.statusLabel}</StatusChip>,
    []
  );

  const activeRow = pagedRows.find((row) => row.id === activeId) ?? null;

  const traceRecord = useMemo(() => {
    if (!activeRow) return null;
    if (activeRow.managementId) {
      return (
        sessionRecords.find(
          (record) =>
            record.id === activeRow.managementId ||
            record.mesManagementNo === activeRow.managementId ||
            record.id === activeRow.id
        ) ?? null
      );
    }
    if (activeRow.partNo && activeRow.company) {
      return (
        sessionRecords.find(
          (record) =>
            record.partNo === activeRow.partNo &&
            String(record.company ?? "").trim() === String(activeRow.company ?? "").trim()
        ) ?? null
      );
    }
    return null;
  }, [activeRow, sessionRecords]);

  const skuLabel = viewMode === "byCompany" ? "거래처" : "품목(SKU)";

  const processCodes = useMemo(() => getProductionProcessCodes(), []);
  const { getSuggestions } = useSearchSuggestionHelpers(sessionRecords, {
    process: processCodes.map((item) => item.name),
  });

  const renderProcessChip = useCallback(
    (row) =>
      row.currentProcess && row.currentProcess !== "—" ? (
        <StatusChip variant={getProcessChipVariant(row.currentProcess)}>{row.currentProcess}</StatusChip>
      ) : (
        "—"
      ),
    []
  );

  const columns = useMemo(() => {
    if (viewMode === "byLot") {
      return buildInventoryLotProductListColumns({
        renderProcess: renderProcessChip,
        renderActions: (row) => (
          <InventoryRowActions
            onDetail={() => {
              setActiveId(row.id);
              setDetailPopupRow(row);
            }}
            onEdit={() => {
              setActiveId(row.id);
              setDetailPopupRow(row);
            }}
          />
        ),
      });
    }
    const base =
      viewMode === "byCompany"
        ? buildInventoryByCompanyListColumns({ renderStatus })
        : buildInventoryStatusListColumns({ renderStatus });
    return [
      ...base,
      {
        key: "actions",
        label: "작업",
        widthHint: "medium",
        render: (row) => (
          <TitanTableRowActions
            onDetail={() => {
              setActiveId(row.id);
              setDetailPopupRow(row);
            }}
          />
        ),
      },
    ];
  }, [viewMode, renderStatus, renderProcessChip]);

  const printProps = useMemo(
    () => ({
      rows,
      viewMode,
      viewLabel,
      outputDate: getPrintOutputDate(),
      listNo: `${INVENTORY_PRINT.documentCode}-${getPrintOutputDate().replace(/-/g, "")}-001`,
    }),
    [rows, viewMode, viewLabel]
  );

  const openPrintPreview = () => {
    if (rows.length === 0) {
      window.alert("출력할 재고 데이터가 없습니다.");
      return;
    }
    setPrintOpen(true);
  };

  const handlePrint = async (documentEl) => {
    setPrintBusy(true);
    try {
      await printTitanDocument(documentEl);
    } finally {
      setPrintBusy(false);
    }
  };

  const handlePdf = async (documentEl) => {
    setPrintBusy(true);
    try {
      await exportTitanPdf(
        documentEl,
        `${INVENTORY_PRINT.filenamePrefix}-${viewMode}-${getPrintOutputDate()}.pdf`
      );
    } finally {
      setPrintBusy(false);
    }
  };

  return (
    <div className="inventory-status-page">
      <TitanKpiBarSlot ariaLabel="재고관리 KPI" className="inventory-status-page__kpi">
        <div className="inventory-status-page__kpi-grid">
          <div className="inventory-status-page__kpi-card">
            <Package size={22} aria-hidden="true" />
            <span>{viewMode === "byCompany" ? "거래처" : "품목(SKU)"}</span>
            <strong>{summary.skuCount.toLocaleString("ko-KR")}</strong>
          </div>
          <div className="inventory-status-page__kpi-card">
            <Boxes size={22} aria-hidden="true" />
            <span>재고 보유 품목</span>
            <strong>{summary.inStockSkuCount.toLocaleString("ko-KR")}</strong>
          </div>
          <div className="inventory-status-page__kpi-card">
            <ArrowDownToLine size={22} aria-hidden="true" />
            <span>총 입고 수량</span>
            <strong>{summary.totalInboundQty.toLocaleString("ko-KR")}</strong>
          </div>
          <div className="inventory-status-page__kpi-card">
            <ArrowUpFromLine size={22} aria-hidden="true" />
            <span>현재 재고</span>
            <strong>{summary.totalCurrentStock.toLocaleString("ko-KR")}</strong>
          </div>
        </div>
      </TitanKpiBarSlot>

      <p className="inventory-status-page__notice">
        재고는 직접 입력하지 않습니다. 입고관리 · 출고관리 업무 데이터를 기반으로 자동 계산됩니다. (V2.0: 조정 ·
        실사 · 창고 · 안전재고 구조만 준비)
        <SecondaryButton type="button" onClick={openPrintPreview} disabled={rows.length === 0} style={{ marginLeft: 12 }}>
          <Printer size={14} aria-hidden="true" />
          재고 PDF 출력
        </SecondaryButton>
      </p>

      <div className="inventory-status-page__view-modes" role="tablist" aria-label="재고 조회 기준">
        {INVENTORY_VIEW_MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            role="tab"
            aria-selected={viewMode === mode.id}
            className={`inventory-status-page__view-mode${viewMode === mode.id ? " is-active" : ""}`}
            onClick={() => {
              setViewMode(mode.id);
              setPage(1);
            }}
          >
            {mode.label}
          </button>
        ))}
      </div>

      <TitanSearchPanel
        draft={draft}
        onDraftChange={onDraftChange}
        onSearch={onSearch}
        onReset={onReset}
        advancedOpen={advancedOpen}
        onAdvancedToggle={onAdvancedToggle}
        companies={companies}
        records={allRows}
        basicFields={STANDARD_PRODUCT_BASIC_SEARCH_FIELDS}
        showStatusField
        statusFieldLabel="현재상태"
        extraSuggestions={{
          partNo: masterProducts.map((item) => item.partNo).filter(Boolean),
          partName: masterProducts.map((item) => item.name).filter(Boolean),
          material: getMasterDataByCategory("materials").map((item) => item.name),
        }}
        advancedContent={
          <TitanStandardProductAdvancedSearch
            draft={draft}
            onDraftChange={onDraftChange}
            getSuggestions={getSuggestions}
          />
        }
      />

      <div className="inventory-status-page__list quality-page__list">
        <TitanDataTable
          className="inventory-status-page__table"
          columns={columns}
          rows={pagedRows}
          activeRowId={activeRow?.id}
          onRowClick={(row) => setActiveId(row.id)}
          onRowDoubleClick={(row) => openRowDetailPopup(row, { setActiveId, setDetailPopupRow })}
          emptyMessage="조건에 맞는 재고 현황이 없습니다."
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

      <TitanPrintPreviewModal
        open={printOpen}
        onClose={() => setPrintOpen(false)}
        title="재고 현황 리스트 출력 미리보기"
        onPrint={handlePrint}
        onPdf={handlePdf}
        busy={printBusy}
      >
        {printOpen ? <InventoryListPrint {...printProps} /> : null}
      </TitanPrintPreviewModal>

      <TitanScreenDetailPopup
        screenKey="inventory"
        open={Boolean(detailPopupRow)}
        onClose={() => setDetailPopupRow(null)}
        record={detailPopupRow}
        context={{
          detailContent: detailPopupRow ? (
            <dl className="titan-row-summary__meta inbound-detail">
              <div>
                <dt>조회 기준</dt>
                <dd>{viewLabel}</dd>
              </div>
              <div>
                <dt>{skuLabel}</dt>
                <dd>{detailPopupRow.company ?? detailPopupRow.partName ?? "—"}</dd>
              </div>
              {detailPopupRow.partNo ? (
                <div>
                  <dt>품번</dt>
                  <dd>{detailPopupRow.partNo}</dd>
                </div>
              ) : null}
              {detailPopupRow.currentStock != null ? (
                <div>
                  <dt>선택 재고</dt>
                  <dd>{detailPopupRow.currentStock}</dd>
                </div>
              ) : null}
              <div>
                <dt>현재상태</dt>
                <dd>
                  <StatusChip variant={detailPopupRow.statusVariant}>{detailPopupRow.statusLabel}</StatusChip>
                </dd>
              </div>
            </dl>
          ) : null,
          traceRecord: detailPopupRow
            ? sessionRecords.find(
                (record) =>
                  record.id === detailPopupRow.managementId ||
                  (detailPopupRow.partNo &&
                    record.partNo === detailPopupRow.partNo &&
                    String(record.company ?? "").trim() === String(detailPopupRow.company ?? "").trim())
              ) ?? null
            : null,
        }}
      />
    </div>
  );
}
