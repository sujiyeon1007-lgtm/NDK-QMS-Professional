import { useMemo, useState } from "react";
import { Package, Boxes, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import StatusChip from "../../foundation/components/StatusChip";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanSearchPanel from "../../foundation/components/TitanSearchPanel";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import TitanKpiBarSlot from "../../foundation/components/TitanKpiBarSlot";
import { useTitanListSearch } from "../../foundation/hooks/useTitanListSearch";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import { getMasterDataByCategory } from "../../utils/masterData";
import {
  buildInventoryStatusRows,
  createEmptyInventoryStatusSearch,
  matchesInventoryStatusSearch,
  summarizeInventoryStatus,
} from "../../utils/inventoryStatusAnalytics";
import { buildInventoryStatusListColumns } from "../../config/standardProductList";
import { getSessionProductionRecords } from "../../utils/productionRecords";
import "../InOut/InboundManagement.css";
import "./InventoryStatus.css";

export default function InventoryStatusPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { search, draft, onDraftChange, onSearch, onReset, advancedOpen, onAdvancedToggle } =
    useTitanListSearch(createEmptyInventoryStatusSearch, { storageKey: "inventory-status" });

  const companies = useMemo(() => getMasterDataByCategory("companies"), []);
  const masterProducts = useMemo(() => getMasterDataByCategory("products"), [refreshKey]);

  const allRows = useMemo(() => {
    void refreshKey;
    return buildInventoryStatusRows(getSessionProductionRecords());
  }, [refreshKey]);

  const summary = useMemo(() => summarizeInventoryStatus(allRows), [allRows]);

  const rows = useMemo(
    () => allRows.filter((row) => matchesInventoryStatusSearch(row, search)),
    [allRows, search]
  );

  const {
    page,
    pageSize,
    totalCount,
    totalPages,
    pagedItems: pagedRows,
    setPage,
    setPageSize,
  } = useListPagination(rows);

  const columns = useMemo(
    () =>
      buildInventoryStatusListColumns({
        renderStatus: (row) => (
          <StatusChip variant={row.statusVariant}>{row.statusLabel}</StatusChip>
        ),
      }),
    []
  );

  return (
    <div className="inventory-status-page">
      <TitanKpiBarSlot ariaLabel="재고현황 KPI" className="inventory-status-page__kpi">
        <div className="inventory-status-page__kpi-grid">
          <div className="inventory-status-page__kpi-card">
            <Package size={22} aria-hidden="true" />
            <span>품목(SKU)</span>
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
        재고는 직접 입력하지 않습니다. 입고현황 · 작업일보 · 출고현황 업무 데이터를 기반으로 자동 계산됩니다.
      </p>

      <TitanSearchPanel
        draft={draft}
        onDraftChange={onDraftChange}
        onSearch={onSearch}
        onReset={onReset}
        advancedOpen={advancedOpen}
        onAdvancedToggle={onAdvancedToggle}
        companies={companies}
        records={allRows}
        extraSuggestions={{
          partNo: masterProducts.map((item) => item.partNo).filter(Boolean),
          partName: masterProducts.map((item) => item.name).filter(Boolean),
          material: getMasterDataByCategory("materials").map((item) => item.name),
        }}
      />

      <div className="inventory-status-page__list">
        <TitanDataTable
          className="inventory-status-page__table"
          columns={columns}
          rows={pagedRows}
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
    </div>
  );
}
