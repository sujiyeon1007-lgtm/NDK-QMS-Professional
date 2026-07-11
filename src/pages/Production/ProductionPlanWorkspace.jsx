import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Layers, Printer } from "lucide-react";

import { SecondaryButton } from "../../foundation/components/Button";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanSearchPanel, { useSearchSuggestionHelpers } from "../../foundation/components/TitanSearchPanel";
import TitanStandardProductAdvancedSearch from "../../foundation/components/TitanStandardProductAdvancedSearch";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import TitanKpiBarSlot from "../../foundation/components/TitanKpiBarSlot";
import TitanWorkflowStatusChipBar from "../../foundation/components/TitanWorkflowStatusChipBar";
import StatusChip from "../../foundation/components/StatusChip";
import {
  createEmptyInboundSearch,
  matchesBasicSearch,
  STANDARD_PRODUCT_BASIC_SEARCH_FIELDS,
} from "../../config/listSearchStandard";
import { getProductionProcessCodes } from "../../config/productionProcessCodes";
import { useTitanListSearch } from "../../foundation/hooks/useTitanListSearch";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import { getMasterDataByCategory } from "../../utils/masterData";
import { matchesInboundDataSearch } from "../../utils/inboundDataFields";
import { buildMetricChipItems } from "../../utils/kpiMetricChipItems";
import { getProductionPlanScreenData } from "../../utils/productionWorkspaceData";
import { getProductionProcessName } from "../../config/productionProcessCodes";
import {
  resolveRecordCurrentProcessCategory,
  resolveRecordCurrentProcessDetail,
} from "../../utils/productProcessWorkflow";
import { resolveRecordCurrentProcess } from "../../utils/workflowProcessStatus";
import { getSessionProductionRecords } from "../../utils/productionRecords";
import { subscribeWorkflowDataRefresh } from "../../utils/titanWorkflowRefresh";
import { getPrintOutputDate } from "../../utils/titanPrintDates";
import InOutListPrintPreviewModal from "../../components/print/InOutListPrintPreviewModal";
import { TITAN_PRINT_DOCUMENT_TYPES } from "../../config/titanPrintDocuments";
import { buildInOutListPrintProps } from "../../utils/inOutListPrintRows";
import { isProductionWaitingOutputTarget } from "../../utils/htlPrintEligibility";
import {
  applyInboundListPrinted,
  resolveInboundPrintMode,
} from "../InOut/inboundListPrintActions";
import { applyInboundHtlDocumentPrinted } from "../../utils/titanWorkflowStatus";
import SectionPageActions from "../../foundation/layout/SectionPageActions";
import TitanWorkflowNavigation from "../../foundation/components/TitanWorkflowNavigation";
import "../InOut/InboundManagement.css";
import "../Inventory/InventoryStatus.css";
import "./ProductionManagement.css";

function resolvePlanRecordValue(record, keys, fallback = "—") {
  for (const key of keys) {
    const value = record?.[key];
    if (value != null && String(value).trim()) return value;
  }
  return fallback;
}

function resolveRecordProcessFields(record) {
  const processDetail =
    String(
      resolveRecordCurrentProcessDetail(record) ||
        record?.processDetail ||
        record?.heatTreatment ||
        ""
    ).trim() || "—";
  const processCategory =
    String(
      resolveRecordCurrentProcessCategory(record) ||
        record?.processCategory ||
        getProductionProcessName(record) ||
        ""
    ).trim() || "—";
  return { processCategory, processDetail };
}

function mapProductionWaitingRow(record) {
  const qty = Number(resolvePlanRecordValue(record, ["qty", "quantity", "incomingQty"], 0)) || 0;
  const { processCategory, processDetail } = resolveRecordProcessFields(record);
  const currentProcess = resolveRecordCurrentProcess(record);
  return {
    id: record.id,
    record,
    managementId: resolvePlanRecordValue(record, ["mesManagementNo", "managementId", "id"]),
    productLabel: resolvePlanRecordValue(record, ["partName", "productName", "itemName"]),
    companyLabel: resolvePlanRecordValue(record, ["company", "companyName"]),
    processLabel: processCategory,
    processDetailLabel: processDetail,
    qtyLabel: qty ? qty.toLocaleString("ko-KR") : "—",
    incomingDateLabel: resolvePlanRecordValue(record, ["incomingDate", "registeredAt", "dueDate"]),
    priorityLabel: resolvePlanRecordValue(record, ["priority", "urgency"], "보통"),
    currentStatusLabel: currentProcess.label,
    currentStatusVariant: currentProcess.variant,
  };
}

function matchesPlanSearch(record, row, search) {
  if (!matchesBasicSearch(search, row)) return false;
  if (!matchesInboundDataSearch(search, record)) return false;
  return true;
}

const PRODUCTION_WAITING_COLUMNS = [
  { key: "productLabel", label: "제품", widthHint: "product" },
  { key: "companyLabel", label: "거래처", widthHint: "company" },
  { key: "processLabel", label: "공정", widthHint: "process" },
  { key: "processDetailLabel", label: "세부공정", widthHint: "process" },
  { key: "qtyLabel", label: "수량", widthHint: "qty" },
  { key: "incomingDateLabel", label: "입고일", widthHint: "date" },
  { key: "priorityLabel", label: "우선순위", widthHint: "status" },
  {
    key: "currentStatusLabel",
    label: "현재상태",
    widthHint: "status",
    render: (row) => <StatusChip variant={row.currentStatusVariant}>{row.currentStatusLabel}</StatusChip>,
  },
];

export default function ProductionPlanWorkspace() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeRowId, setActiveRowId] = useState("");
  const [inOutPrintSession, setInOutPrintSession] = useState({ open: false, props: null });

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
      .map(mapProductionWaitingRow)
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

  const columns = useMemo(() => PRODUCTION_WAITING_COLUMNS, []);

  const bumpRefresh = useCallback(() => setRefreshKey((key) => key + 1), []);

  useEffect(() => subscribeWorkflowDataRefresh(() => bumpRefresh()), [bumpRefresh]);

  const handleProductionWaitingPrinted = useCallback(
    (printProps) => {
      if (!printProps?.listNo || !printProps?.rows?.length) return;

      applyInboundListPrinted(printProps.rows, printProps.listNo);

      const listNo = String(printProps.listNo).trim();
      if (listNo.startsWith("HTL")) {
        const managementIds = printProps.rows
          .map((row) => String(row.managementId ?? row.id ?? "").trim())
          .filter(Boolean);
        applyInboundHtlDocumentPrinted(managementIds, listNo, {
          isReprint: printProps.printMode === "reprint",
        });
      }

      bumpRefresh();
    },
    [bumpRefresh]
  );

  const handleOpenProductionWaitingOutput = () => {
    const printSourceRows = workspaceRecords
      .filter((record) => isProductionWaitingOutputTarget(record))
      .map((record) => ({ record, id: record.id }));

    if (printSourceRows.length === 0) {
      window.alert("출력할 생산 대기 제품이 없습니다.");
      return;
    }

    setInOutPrintSession({
      open: true,
      props: buildInOutListPrintProps(printSourceRows, {
        listNoPrefix: "HTL",
        outputDate: getPrintOutputDate(),
        records: getSessionProductionRecords(),
        printMode: resolveInboundPrintMode(printSourceRows),
      }),
    });
  };

  return (
    <div className="inbound-page inventory-status-page production-plan-page">
      <SectionPageActions>
        <SecondaryButton type="button" onClick={handleOpenProductionWaitingOutput}>
          <Printer size={16} aria-hidden />
          생산 대기 리스트 출력
        </SecondaryButton>
      </SectionPageActions>

      <TitanWorkflowNavigation stepId="productionPending" />

      <TitanKpiBarSlot ariaLabel="생산 대기 KPI" className="inbound-page__kpi">
        <TitanWorkflowStatusChipBar items={kpiItems} ariaLabel="생산 대기 KPI" />
      </TitanKpiBarSlot>

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

      <section className="production-plan-page__list-card" aria-label="생산 대기 리스트">
        <div className="manual-lot-page__section-head">
          <h3>생산 대기 리스트</h3>
          <span className="manual-lot-page__count">{totalCount.toLocaleString("ko-KR")}건</span>
        </div>
        <p className="home-empty production-plan-page__hint" role="status">
          조회 · 검색 · 필터 전용입니다. LOT 생성 · 장입 · 생산 시작은 설비 가동 현황에서 진행하세요.
        </p>
        <TitanDataTable
          layout="compact"
          columns={columns}
          rows={pagedRows}
          activeRowId={activeRowId}
          onRowClick={(row) => setActiveRowId(row.id)}
          emptyMessage="열처리 대기(HT_WAIT) 제품이 없습니다."
          ariaLabel="생산 대기 리스트"
        />
        <TitanTableFooter
          totalCount={totalCount}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </section>

      <InOutListPrintPreviewModal
        open={inOutPrintSession.open}
        onClose={() => setInOutPrintSession({ open: false, props: null })}
        documentType={TITAN_PRINT_DOCUMENT_TYPES.INBOUND_LIST}
        printProps={inOutPrintSession.props}
        onAfterPrint={handleProductionWaitingPrinted}
      />
    </div>
  );
}
