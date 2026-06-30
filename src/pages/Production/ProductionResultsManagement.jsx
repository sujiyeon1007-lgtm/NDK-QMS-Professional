import { useMemo, useState } from "react";
import Input from "../../foundation/components/Input";
import StatusChip from "../../foundation/components/StatusChip";
import Card from "../../foundation/components/Card";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanSearchPanel from "../../foundation/components/TitanSearchPanel";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import ProductionKpiPanel from "../../foundation/components/ProductionKpiPanel";
import ProductionCriteriaPanel from "../../foundation/components/ProductionCriteriaPanel";
import ProductionAnalyticsCharts from "../../foundation/components/ProductionAnalyticsCharts";
import {
  PRODUCTION_RESULTS_METRIC_CARDS,
  PRODUCTION_RESULTS_STATUS_PANEL,
} from "../../config/productionDashboard";
import { createEmptyProductionResultsSearch } from "../../config/listSearchStandard";
import { buildProductionResultsListColumns } from "../../config/standardProductList";
import { getProcessChipVariant, getProductionProcessCodes } from "../../config/productionProcessCodes";
import { useAdvancedSearchOpen } from "../../foundation/hooks/useAdvancedSearchOpen";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import { getMasterDataByCategory } from "../../utils/masterData";
import { getSessionProductionRecords } from "../../utils/productionRecords";
import {
  aggregateProductionByField,
  aggregateProductionByFieldWithOther,
  buildAnalysisScopeLabel,
  buildProductionTrendSeries,
  computeProductionResultMetrics,
  computeProductionSummaryStats,
  filterByAnalysisDimension,
  getDimensionOptionsWithLabels,
  getDimensionShortLabel,
  getProductionResultsRecords,
  isWithinAnalysisPeriod,
  mapProductionResultRow,
  matchesProductionResultsSearch,
  narrowRecordsForSelectedRow,
  PRODUCTION_RESULTS_STATUS_OPTIONS,
} from "../../utils/productionAnalytics";
import "../InOut/InboundManagement.css";
import "./ProductionManagement.css";

const EMPTY_SEARCH = createEmptyProductionResultsSearch();

export default function ProductionResultsManagement() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState(EMPTY_SEARCH);
  const [draft, setDraft] = useState(EMPTY_SEARCH);
  const [advancedOpen, toggleAdvanced] = useAdvancedSearchOpen("titan-production-results-advanced");
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [analysisDimension, setAnalysisDimension] = useState("equipment");
  const [analysisValue, setAnalysisValue] = useState("");
  const [analysisPeriod, setAnalysisPeriod] = useState("month");
  const [chartPeriod, setChartPeriod] = useState("month");

  const companies = useMemo(() => getMasterDataByCategory("companies"), []);
  const equipmentList = useMemo(() => getMasterDataByCategory("equipment"), []);
  const processCodes = useMemo(() => getProductionProcessCodes(), []);

  const dimensionField =
    ({ equipment: "equipment", company: "company", material: "material", process: "process" }[
      analysisDimension
    ] ?? "equipment");

  const completedRecords = useMemo(() => {
    const records = getProductionResultsRecords(getSessionProductionRecords());
    return records.filter((record) => matchesProductionResultsSearch(record, search));
  }, [search, refreshKey]);

  const dimensionOptions = useMemo(
    () => getDimensionOptionsWithLabels(completedRecords, dimensionField),
    [completedRecords, dimensionField]
  );

  const criteriaFilteredRecords = useMemo(
    () => filterByAnalysisDimension(completedRecords, dimensionField, analysisValue),
    [completedRecords, dimensionField, analysisValue]
  );

  const periodFilteredRecords = useMemo(
    () =>
      criteriaFilteredRecords.filter((record) =>
        isWithinAnalysisPeriod(record.workDate || record.dueDate, analysisPeriod)
      ),
    [criteriaFilteredRecords, analysisPeriod]
  );

  const rows = useMemo(
    () =>
      periodFilteredRecords
        .map(mapProductionResultRow)
        .sort((a, b) => String(b.workDate).localeCompare(String(a.workDate))),
    [periodFilteredRecords]
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

  const activeRow = pagedRows.find((row) => row.id === activeId) ?? null;

  const chartRecords = useMemo(() => {
    if (!activeRow) return criteriaFilteredRecords;
    return narrowRecordsForSelectedRow(criteriaFilteredRecords, activeRow);
  }, [criteriaFilteredRecords, activeRow]);

  const metrics = useMemo(
    () => computeProductionResultMetrics(criteriaFilteredRecords),
    [criteriaFilteredRecords]
  );

  const scopeLabel = useMemo(
    () => buildAnalysisScopeLabel(dimensionField, analysisValue, analysisPeriod),
    [dimensionField, analysisValue, analysisPeriod]
  );

  const chartScopeLabel = scopeLabel;

  const trendItems = useMemo(
    () => buildProductionTrendSeries(chartRecords, chartPeriod),
    [chartRecords, chartPeriod]
  );

  const summaryStats = useMemo(() => {
    const stats = computeProductionSummaryStats(chartRecords, chartPeriod);
    return {
      total: stats.total,
      avg: stats.avg,
      max: stats.max,
      min: stats.min,
    };
  }, [chartRecords, chartPeriod]);

  const processItems = useMemo(
    () => aggregateProductionByField(chartRecords, "process"),
    [chartRecords]
  );

  const materialItems = useMemo(
    () => aggregateProductionByFieldWithOther(chartRecords, "material"),
    [chartRecords]
  );

  const kpiCards = useMemo(
    () =>
      PRODUCTION_RESULTS_METRIC_CARDS.map((card) => {
        if (card.id === "todayQty") {
          return { ...card, value: metrics.todayQty.toLocaleString("ko-KR"), unit: "EA" };
        }
        if (card.id === "weekQty") {
          return { ...card, value: metrics.weekQty.toLocaleString("ko-KR"), unit: "EA" };
        }
        if (card.id === "monthQty") {
          return { ...card, value: metrics.monthQty.toLocaleString("ko-KR"), unit: "EA" };
        }
        return { ...card, value: metrics.completionRate.toLocaleString("ko-KR"), unit: "%" };
      }),
    [metrics]
  );

  const columns = useMemo(
    () =>
      buildProductionResultsListColumns({
        renderLotNo: (row) => (
          <button
            type="button"
            className="production-results-lot-link"
            onClick={(event) => {
              event.stopPropagation();
              setActiveId(row.id);
            }}
          >
            {row.lotNo}
          </button>
        ),
        renderProcess: (row) =>
          row.processName && row.processName !== "—" ? (
            <StatusChip variant={getProcessChipVariant(row.processName)}>{row.processName}</StatusChip>
          ) : (
            "—"
          ),
      }),
    []
  );

  const trendTitle = useMemo(() => {
    const focus = getDimensionShortLabel(dimensionField, analysisValue);
    return `생산량 추이 (${focus})`;
  }, [dimensionField, analysisValue]);

  const summaryTitle = useMemo(() => {
    const focus = getDimensionShortLabel(dimensionField, analysisValue);
    const periodLabel = { day: "일간", week: "주간", month: "월간", year: "연간" }[chartPeriod] ?? chartPeriod;
    return `${focus} 생산량 요약 (${periodLabel})`;
  }, [dimensionField, analysisValue, chartPeriod]);

  const toggleRow = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    if (selectedIds.length === pagedRows.length && pagedRows.every((row) => selectedIds.includes(row.id))) {
      setSelectedIds((prev) => prev.filter((id) => !pagedRows.some((row) => row.id === id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...pagedRows.map((row) => row.id)])]);
    }
  };

  const handleSearch = () => setSearch({ ...draft });
  const handleReset = () => {
    setDraft(EMPTY_SEARCH);
    setSearch(EMPTY_SEARCH);
    setRefreshKey((k) => k + 1);
  };

  const handleChartPeriodChange = (period) => {
    setChartPeriod(period);
    setAnalysisPeriod(period);
    setPage(1);
  };

  const handleAnalysisPeriodChange = (period) => {
    setAnalysisPeriod(period);
    setChartPeriod(period);
    setPage(1);
  };

  const handleDimensionChange = (nextDimension) => {
    setAnalysisDimension(nextDimension);
    setAnalysisValue("");
    setActiveId(null);
    setPage(1);
  };

  return (
    <div className="inbound-page production-page production-results-page">
      <div className="inbound-page__toolbar">
        <h2 className="inbound-page__title">생산실적관리</h2>
      </div>

      <ProductionKpiPanel
        title={PRODUCTION_RESULTS_STATUS_PANEL.title}
        titleIcon={PRODUCTION_RESULTS_STATUS_PANEL.titleIcon}
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
              <span className="titan-advanced-search__label">작업일</span>
              <div className="titan-advanced-search__date-range">
                <Input
                  type="date"
                  value={draft.workDateFrom}
                  onChange={(e) => setDraft({ ...draft, workDateFrom: e.target.value })}
                />
                <span>~</span>
                <Input
                  type="date"
                  value={draft.workDateTo}
                  onChange={(e) => setDraft({ ...draft, workDateTo: e.target.value })}
                />
              </div>
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
              <span className="titan-advanced-search__label">현재상태</span>
              <select
                className="titan-search-panel__select"
                value={draft.status}
                onChange={(e) => setDraft({ ...draft, status: e.target.value })}
              >
                <option value="">전체</option>
                {PRODUCTION_RESULTS_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>
        }
      />

      <ProductionCriteriaPanel
        analysisDimension={analysisDimension}
        analysisValue={analysisValue}
        analysisPeriod={analysisPeriod}
        dimensionOptions={dimensionOptions}
        onDimensionChange={handleDimensionChange}
        onValueChange={(value) => {
          setAnalysisValue(value);
          setActiveId(null);
          setPage(1);
        }}
        onPeriodChange={handleAnalysisPeriodChange}
      />

      <Card className="production-results-page__list-card">
        <div className="production-page__list-header">
          <h3>
            생산 실적 리스트
            <span className="production-results-page__scope">({scopeLabel})</span>
          </h3>
        </div>

        <TitanDataTable
          className="inbound-page__table"
          columns={columns}
          rows={pagedRows}
          selectable
          selectedRowIds={selectedIds}
          onToggleRow={toggleRow}
          onToggleAll={toggleAll}
          activeRowId={activeRow?.id}
          onRowClick={(row) => setActiveId(row.id)}
          emptyMessage="표시할 생산 실적이 없습니다."
        />

        <TitanTableFooter
          totalCount={totalCount}
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </Card>

      <ProductionAnalyticsCharts
        scopeLabel={chartScopeLabel}
        chartPeriod={chartPeriod}
        onChartPeriodChange={handleChartPeriodChange}
        trendTitle={trendTitle}
        summaryTitle={summaryTitle}
        trendItems={trendItems}
        summaryStats={summaryStats}
        processItems={processItems}
        materialItems={materialItems}
      />
    </div>
  );
}
