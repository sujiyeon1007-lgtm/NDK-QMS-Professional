import { useMemo, useState } from "react";
import { FileSpreadsheet, Plus } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import TitanSearchPanel, { useSearchSuggestionHelpers } from "../../foundation/components/TitanSearchPanel";
import {
  DateRangeField,
  EquipmentField,
  LotNoField,
  ManagementIdField,
  ProcessField,
  StatusSelectField,
  WorkerField,
} from "../../foundation/components/TitanSearchAdvancedFields";
import StatusChip from "../../foundation/components/StatusChip";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import TitanKpiBarSlot from "../../foundation/components/TitanKpiBarSlot";
import TitanWorkflowStatusChipBar from "../../foundation/components/TitanWorkflowStatusChipBar";
import { buildMetricChipItems } from "../../utils/kpiMetricChipItems";
import {
  DEFECT_STATUS_METRIC_CARDS,
  DEFECT_STATUS_PANEL,
} from "../../config/productionDashboard";
import { createEmptyDefectHistorySearch, matchesBasicSearch } from "../../config/listSearchStandard";
import { buildDefectHistoryListColumns } from "../../config/standardProductList";
import { DEFECT_REGISTER_LABEL } from "../../config/registerModalStandard";
import { getProcessChipVariant, getProductionProcessCodes } from "../../config/productionProcessCodes";
import { useTitanListSearch } from "../../foundation/hooks/useTitanListSearch";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import { getMasterDataByCategory } from "../../utils/masterData";
import {
  DEFECT_HANDLING_STATUS,
  DEFECT_TYPE_OPTIONS,
  addSessionDefectRecord,
  computeDefectMetrics,
  generateDefectId,
  getSessionDefectRecords,
} from "../../utils/defectHistorySession";
import DefectHistoryRegisterModal from "./DefectHistoryRegisterModal";
import "../InOut/InboundManagement.css";
import SectionPageActions from "../../foundation/layout/SectionPageActions";
import "./ProductionManagement.css";

function matchesDefectHistorySearch(record, search) {
  if (!matchesBasicSearch(search, record)) return false;
  if (
    search.managementId &&
    !String(record.managementId ?? "")
      .toLowerCase()
      .includes(search.managementId.toLowerCase())
  ) {
    return false;
  }
  if (
    search.lotNo &&
    !String(record.lotNo ?? "")
      .toLowerCase()
      .includes(search.lotNo.toLowerCase())
  ) {
    return false;
  }
  if (search.process && record.process !== search.process) return false;
  if (search.equipment && !String(record.equipment ?? "").includes(search.equipment)) return false;
  if (search.worker && !String(record.worker ?? "").includes(search.worker)) return false;
  if (search.defectType && record.defectType !== search.defectType) return false;
  if (search.handlingStatus && record.handlingStatus !== search.handlingStatus) return false;
  const occurredDate = record.occurredDate || "";
  if (search.occurredDateFrom && occurredDate < search.occurredDateFrom) return false;
  if (search.occurredDateTo && occurredDate > search.occurredDateTo) return false;
  return true;
}

function mapDefectRow(record) {
  return {
    id: record.id,
    managementId: record.managementId || "—",
    lotNo: record.lotNo || "—",
    company: record.company || "—",
    partName: record.partName || "—",
    partNo: record.partNo || "—",
    material: record.material || "—",
    processName: record.process || "—",
    defectType: record.defectType || "—",
    defectQty: record.defectQty ?? 0,
    occurredDate: record.occurredDate || "—",
    handlingStatus: record.handlingStatus || "등록",
    record,
  };
}

function getHandlingStatusVariant(status) {
  if (status === "완료") return "complete";
  if (status === "조치중") return "progress";
  return "wait";
}

export default function DefectHistoryManagement() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [registerOpen, setRegisterOpen] = useState(false);
  const { search, draft, onDraftChange, onSearch, onReset, advancedOpen, onAdvancedToggle } =
    useTitanListSearch(createEmptyDefectHistorySearch, { storageKey: "defect-history" });
  const [activeId, setActiveId] = useState(null);

  const companies = useMemo(() => getMasterDataByCategory("companies"), []);
  const equipmentList = useMemo(() => getMasterDataByCategory("equipment"), []);
  const processCodes = useMemo(() => getProductionProcessCodes(), []);
  const searchRecords = useMemo(() => getSessionDefectRecords(), [refreshKey]);
  const { getSuggestions } = useSearchSuggestionHelpers(searchRecords, {
    process: processCodes.map((item) => item.name),
    equipment: equipmentList.map((item) => item.name ?? item.code),
  });

  const rows = useMemo(() => {
    return getSessionDefectRecords()
      .filter((record) => matchesDefectHistorySearch(record, search))
      .map(mapDefectRow)
      .sort((a, b) => String(b.occurredDate).localeCompare(String(a.occurredDate)));
  }, [search, refreshKey]);

  const metrics = useMemo(() => computeDefectMetrics(getSessionDefectRecords()), [refreshKey]);

  const kpiCards = useMemo(
    () =>
      DEFECT_STATUS_METRIC_CARDS.map((card) => {
        if (card.id === "defectRate") {
          return { ...card, value: metrics.defectRate.toLocaleString("ko-KR"), unit: "%" };
        }
        const value = metrics[card.id] ?? 0;
        return { ...card, value: value.toLocaleString("ko-KR"), unit: "EA" };
      }),
    [metrics]
  );

  const metricChipItems = useMemo(() => buildMetricChipItems(kpiCards), [kpiCards]);

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
      buildDefectHistoryListColumns({
        renderProcess: (row) =>
          row.processName && row.processName !== "—" ? (
            <StatusChip variant={getProcessChipVariant(row.processName)}>{row.processName}</StatusChip>
          ) : (
            "—"
          ),
        renderHandlingStatus: (row) => (
          <StatusChip variant={getHandlingStatusVariant(row.handlingStatus)}>{row.handlingStatus}</StatusChip>
        ),
      }),
    []
  );

  const handleRegister = (form) => {
    const now = new Date().toISOString();
    addSessionDefectRecord({
      id: generateDefectId(),
      managementId: form.managementId.trim(),
      lotNo: form.lotNo.trim(),
      company: form.company.trim() || "—",
      partName: form.partName.trim(),
      partNo: form.partNo.trim(),
      material: form.material.trim(),
      process: form.process,
      defectType: form.defectType,
      defectQty: Number(form.defectQty) || 0,
      occurredDate: form.occurredDate || now.slice(0, 10),
      equipment: form.equipment,
      worker: form.worker.trim() || "관리자",
      handlingStatus: form.handlingStatus,
      fourM: form.fourM,
      action: form.action,
      createdAt: now,
      updatedAt: now,
    });
    setRefreshKey((k) => k + 1);
    setPage(1);
  };

  return (
    <div className="inbound-page production-page production-defect-page">
      <SectionPageActions>
        <PrimaryButton type="button" onClick={() => setRegisterOpen(true)}>
          <Plus size={14} aria-hidden="true" />
          {DEFECT_REGISTER_LABEL}
        </PrimaryButton>
        <SecondaryButton type="button">
          <FileSpreadsheet size={14} aria-hidden="true" />
          엑셀 출력
        </SecondaryButton>
      </SectionPageActions>

      <TitanKpiBarSlot ariaLabel={DEFECT_STATUS_PANEL.title} className="inbound-page__kpi">
        <TitanWorkflowStatusChipBar
          items={metricChipItems}
          ariaLabel={DEFECT_STATUS_PANEL.title}
        />
      </TitanKpiBarSlot>

      <TitanSearchPanel
        draft={draft}
        onDraftChange={onDraftChange}
        onSearch={onSearch}
        onReset={onReset}
        advancedOpen={advancedOpen}
        onAdvancedToggle={onAdvancedToggle}
        companies={companies}
        records={searchRecords}
        advancedContent={
          <div className="titan-advanced-search__grid">
            <ManagementIdField draft={draft} onDraftChange={onDraftChange} getSuggestions={getSuggestions} />
            <LotNoField draft={draft} onDraftChange={onDraftChange} getSuggestions={getSuggestions} />
            <ProcessField draft={draft} onDraftChange={onDraftChange} getSuggestions={getSuggestions} />
            <EquipmentField draft={draft} onDraftChange={onDraftChange} getSuggestions={getSuggestions} />
            <WorkerField draft={draft} onDraftChange={onDraftChange} getSuggestions={getSuggestions} />
            <StatusSelectField
              label="불량유형"
              value={draft.defectType}
              onChange={(e) => onDraftChange({ ...draft, defectType: e.target.value })}
              options={DEFECT_TYPE_OPTIONS}
            />
            <StatusSelectField
              label="처리상태"
              value={draft.handlingStatus}
              onChange={(e) => onDraftChange({ ...draft, handlingStatus: e.target.value })}
              options={DEFECT_HANDLING_STATUS}
            />
            <DateRangeField
              label="발생일"
              fromKey="occurredDateFrom"
              toKey="occurredDateTo"
              draft={draft}
              onDraftChange={onDraftChange}
            />
          </div>
        }
      />

      <div className="production-defect-page__list-area">
        <div className="production-page__list-header">
          <h3>불량 이력 목록 (총 {totalCount}건)</h3>
        </div>

        <TitanDataTable
          className="inbound-page__table"
          columns={columns}
          rows={pagedRows}
          activeRowId={activeId}
          onRowClick={(row) => setActiveId(row.id)}
          emptyMessage="표시할 불량 이력이 없습니다."
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

      <DefectHistoryRegisterModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onRegister={handleRegister}
      />
    </div>
  );
}
