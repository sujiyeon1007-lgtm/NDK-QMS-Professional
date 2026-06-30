import { useMemo, useState } from "react";
import { FileSpreadsheet, Plus } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import Input from "../../foundation/components/Input";
import StatusChip from "../../foundation/components/StatusChip";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanSearchPanel from "../../foundation/components/TitanSearchPanel";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import ProductionKpiPanel from "../../foundation/components/ProductionKpiPanel";
import {
  DEFECT_STATUS_METRIC_CARDS,
  DEFECT_STATUS_PANEL,
} from "../../config/productionDashboard";
import { createEmptyDefectHistorySearch, matchesBasicSearch } from "../../config/listSearchStandard";
import { buildDefectHistoryListColumns } from "../../config/standardProductList";
import { DEFECT_REGISTER_LABEL } from "../../config/registerModalStandard";
import { getProcessChipVariant, getProductionProcessCodes } from "../../config/productionProcessCodes";
import { useAdvancedSearchOpen } from "../../foundation/hooks/useAdvancedSearchOpen";
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
import "./ProductionManagement.css";

const EMPTY_SEARCH = createEmptyDefectHistorySearch();

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
  const [search, setSearch] = useState(EMPTY_SEARCH);
  const [draft, setDraft] = useState(EMPTY_SEARCH);
  const [advancedOpen, toggleAdvanced] = useAdvancedSearchOpen("titan-defect-history-advanced");
  const [activeId, setActiveId] = useState(null);

  const companies = useMemo(() => getMasterDataByCategory("companies"), []);
  const equipmentList = useMemo(() => getMasterDataByCategory("equipment"), []);
  const processCodes = useMemo(() => getProductionProcessCodes(), []);

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

  const handleSearch = () => setSearch({ ...draft });
  const handleReset = () => {
    setDraft(EMPTY_SEARCH);
    setSearch(EMPTY_SEARCH);
  };

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
      <div className="inbound-page__toolbar">
        <h2 className="inbound-page__title">불량이력관리</h2>
        <div className="inbound-page__actions">
          <PrimaryButton type="button" onClick={() => setRegisterOpen(true)}>
            <Plus size={14} aria-hidden="true" />
            {DEFECT_REGISTER_LABEL}
          </PrimaryButton>
          <SecondaryButton type="button">
            <FileSpreadsheet size={14} aria-hidden="true" />
            엑셀 출력
          </SecondaryButton>
        </div>
      </div>

      <ProductionKpiPanel
        title={DEFECT_STATUS_PANEL.title}
        titleIcon={DEFECT_STATUS_PANEL.titleIcon}
        cards={kpiCards}
        metricMode
      />

      <TitanSearchPanel
        draft={draft}
        onDraftChange={setDraft}
        onSearch={handleSearch}
        onReset={handleReset}
        advancedOpen={advancedOpen}
        onAdvancedToggle={toggleAdvanced}
        companies={companies}
        advancedContent={
          <div className="titan-advanced-search__grid">
            <label className="titan-advanced-search__field">
              <span className="titan-advanced-search__label">관리번호</span>
              <Input
                value={draft.managementId}
                onChange={(e) => setDraft({ ...draft, managementId: e.target.value })}
                placeholder="관리번호"
              />
            </label>
            <label className="titan-advanced-search__field">
              <span className="titan-advanced-search__label">LOT.NO</span>
              <Input
                value={draft.lotNo}
                onChange={(e) => setDraft({ ...draft, lotNo: e.target.value })}
                placeholder="LOT.NO"
              />
            </label>
            <label className="titan-advanced-search__field">
              <span className="titan-advanced-search__label">공정</span>
              <select
                className="titan-search-panel__select"
                value={draft.process}
                onChange={(e) => setDraft({ ...draft, process: e.target.value })}
              >
                <option value="">전체</option>
                {processCodes.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="titan-advanced-search__field">
              <span className="titan-advanced-search__label">설비</span>
              <select
                className="titan-search-panel__select"
                value={draft.equipment}
                onChange={(e) => setDraft({ ...draft, equipment: e.target.value })}
              >
                <option value="">전체</option>
                {equipmentList.map((item) => (
                  <option key={item.id} value={item.name ?? item.code}>
                    {item.name ?? item.code}
                  </option>
                ))}
              </select>
            </label>
            <label className="titan-advanced-search__field">
              <span className="titan-advanced-search__label">작업자</span>
              <Input
                value={draft.worker}
                onChange={(e) => setDraft({ ...draft, worker: e.target.value })}
                placeholder="작업자"
              />
            </label>
            <label className="titan-advanced-search__field">
              <span className="titan-advanced-search__label">불량유형</span>
              <select
                className="titan-search-panel__select"
                value={draft.defectType}
                onChange={(e) => setDraft({ ...draft, defectType: e.target.value })}
              >
                <option value="">전체</option>
                {DEFECT_TYPE_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="titan-advanced-search__field">
              <span className="titan-advanced-search__label">처리상태</span>
              <select
                className="titan-search-panel__select"
                value={draft.handlingStatus}
                onChange={(e) => setDraft({ ...draft, handlingStatus: e.target.value })}
              >
                <option value="">전체</option>
                {DEFECT_HANDLING_STATUS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="titan-advanced-search__field">
              <span className="titan-advanced-search__label">발생일</span>
              <div className="titan-advanced-search__date-range">
                <Input
                  type="date"
                  value={draft.occurredDateFrom}
                  onChange={(e) => setDraft({ ...draft, occurredDateFrom: e.target.value })}
                />
                <span>~</span>
                <Input
                  type="date"
                  value={draft.occurredDateTo}
                  onChange={(e) => setDraft({ ...draft, occurredDateTo: e.target.value })}
                />
              </div>
            </label>
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
