import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Layers, Printer } from "lucide-react";

import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanSearchPanel, { useSearchSuggestionHelpers } from "../../foundation/components/TitanSearchPanel";
import TitanStandardProductAdvancedSearch from "../../foundation/components/TitanStandardProductAdvancedSearch";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import TitanKpiBarSlot from "../../foundation/components/TitanKpiBarSlot";
import TitanWorkflowStatusChipBar from "../../foundation/components/TitanWorkflowStatusChipBar";
import TitanListInteractionHint from "../../foundation/components/TitanListInteractionHint";
import {
  createEmptyInboundSearch,
  matchesBasicSearch,
  STANDARD_PRODUCT_BASIC_SEARCH_FIELDS,
} from "../../config/listSearchStandard";
import { getProductionProcessCodes } from "../../config/productionProcessCodes";
import { buildV13ProductListColumns } from "../../config/standardProductList";
import { useTitanListSearch } from "../../foundation/hooks/useTitanListSearch";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import { getMasterDataByCategory } from "../../utils/masterData";
import { matchesInboundDataSearch } from "../../utils/inboundDataFields";
import { renderWorkflowProcessChip } from "../../utils/workflowProcessChip";
import { buildMetricChipItems } from "../../utils/kpiMetricChipItems";
import {
  getProductionPlanScreenData,
  isProductionPlanLotPendingRecord,
} from "../../utils/productionWorkspaceData";
import { createProductionLots, mapRecordToPlanRow } from "../../utils/productionPlanLot";
import { mapV13ProductListRow } from "../../utils/processFlow";
import SectionPageActions from "../../foundation/layout/SectionPageActions";
import "../InOut/InboundManagement.css";
import "../Inventory/InventoryStatus.css";

function mapPlanListRow(record) {
  const planRow = mapRecordToPlanRow(record);
  const status = planRow.lotNo?.trim()
    ? { label: "LOT생성", variant: "production" }
    : { label: "열처리대기", variant: "wait" };
  const base = mapV13ProductListRow(record, status, { screenKey: "production-plan" });
  return {
    ...base,
    lotNo: planRow.lotNo || "—",
    htlNo: planRow.htlNo || "—",
    record,
  };
}

function matchesPlanSearch(record, row, search) {
  if (!matchesBasicSearch(search, row)) return false;
  if (!matchesInboundDataSearch(search, record)) return false;
  return true;
}

export default function ProductionPlanWorkspace() {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedIds, setSelectedIds] = useState([]);

  const { search, draft, onDraftChange, onSearch, onReset, advancedOpen, onAdvancedToggle } =
    useTitanListSearch(createEmptyInboundSearch, { storageKey: "production-plan" });

  const companies = useMemo(() => getMasterDataByCategory("companies"), []);
  const processCodes = useMemo(() => getProductionProcessCodes(), []);

  const { baseRecords: workspaceRecords, counts: planCounts } = useMemo(() => {
    void refreshKey;
    return getProductionPlanScreenData();
  }, [refreshKey]);

  const kpiItems = useMemo(
    () =>
      buildMetricChipItems([
        {
          id: "htWait",
          label: "열처리 대기",
          value: planCounts.htWait,
          unit: "건",
          tone: "incoming",
          icon: CalendarDays,
        },
        {
          id: "lotPending",
          label: "LOT 미생성",
          value: planCounts.lotPending,
          unit: "건",
          tone: "hold",
          icon: Layers,
        },
      ]),
    [planCounts]
  );

  const { getSuggestions } = useSearchSuggestionHelpers(workspaceRecords, {
    process: processCodes.map((item) => item.name),
  });

  const rows = useMemo(() => {
    return workspaceRecords
      .map(mapPlanListRow)
      .filter((row) => matchesPlanSearch(row.record, row, search))
      .sort((a, b) => b.managementId.localeCompare(a.managementId));
  }, [workspaceRecords, search]);

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
      buildV13ProductListColumns({
        renderCurrentProcess: (row) => renderWorkflowProcessChip(row.record),
      }),
    []
  );

  const bumpRefresh = useCallback(() => setRefreshKey((key) => key + 1), []);

  const toggleRow = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    setSelectedIds((prev) =>
      prev.length === pagedRows.length ? [] : pagedRows.map((row) => row.id)
    );
  };

  const handleCreateLots = () => {
    const targets = selectedIds.filter((id) => {
      const record = workspaceRecords.find((row) => row.id === id);
      return record && isProductionPlanLotPendingRecord(record);
    });
    if (!targets.length) {
      window.alert("LOT를 생성할 제품을 선택하세요. (LOT 미생성 항목만 가능)");
      return;
    }
    const result = createProductionLots(targets);
    if (!result.ok) {
      window.alert(result.message);
      return;
    }
    window.alert(`LOT ${result.lotNo} — ${result.count}건 생성되었습니다.`);
    setSelectedIds([]);
    bumpRefresh();
  };

  const handleOpenPrint = () => navigate("/inout/print");

  return (
    <div className="inbound-page inventory-status-page">
      <SectionPageActions>
        <SecondaryButton type="button" onClick={handleOpenPrint}>
          <Printer size={16} aria-hidden />
          입고리스트 출력
        </SecondaryButton>
        <PrimaryButton type="button" onClick={handleCreateLots}>
          <Layers size={16} aria-hidden />
          LOT 생성
        </PrimaryButton>
      </SectionPageActions>

      <TitanKpiBarSlot ariaLabel="생산계획 KPI" className="inbound-page__kpi">
        <TitanWorkflowStatusChipBar items={kpiItems} ariaLabel="생산계획 KPI" />
      </TitanKpiBarSlot>

      <p className="inventory-status-page__notice">
        생산계획 Workspace — HT_WAIT(열처리 대기) · LOT 미생성 제품만 표시합니다. LOT 생성 후
        설비 장입 Workspace로 자동 이동합니다.
      </p>

      <TitanSearchPanel
        draft={draft}
        onDraftChange={onDraftChange}
        onSearch={onSearch}
        onReset={onReset}
        advancedOpen={advancedOpen}
        onAdvancedToggle={onAdvancedToggle}
        companies={companies}
        records={workspaceRecords}
        basicFields={STANDARD_PRODUCT_BASIC_SEARCH_FIELDS}
        advancedContent={
          <TitanStandardProductAdvancedSearch
            draft={draft}
            onDraftChange={onDraftChange}
            getSuggestions={getSuggestions}
          />
        }
      />

      <TitanListInteractionHint />

      <div className="inbound-page__workspace">
        <div className="inbound-page__list">
          <TitanDataTable
            layout="compact"
            columns={columns}
            rows={pagedRows}
            selectable
            selectedRowIds={selectedIds}
            onToggleRow={toggleRow}
            onToggleAll={toggleAll}
            onRowClick={(row) => toggleRow(row.id)}
            emptyMessage="열처리 대기(HT_WAIT) 제품이 없습니다."
          />
          <TitanTableFooter
            totalCount={totalCount}
            page={page}
            pageSize={pageSize}
            totalPages={totalPages}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      </div>
    </div>
  );
}
