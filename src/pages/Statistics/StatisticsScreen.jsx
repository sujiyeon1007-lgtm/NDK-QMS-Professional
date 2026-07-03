import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { FileSpreadsheet, BarChart2 } from "lucide-react";
import Input from "../../foundation/components/Input";
import { SecondaryButton } from "../../foundation/components/Button";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanSearchPanel, { useSearchSuggestionHelpers } from "../../foundation/components/TitanSearchPanel";
import {
  CustomerLotNoField,
  EquipmentField,
  LotNoField,
  ManagementIdField,
  ProcessField,
  PurchaseOrderNoField,
  WorkerField,
} from "../../foundation/components/TitanSearchAdvancedFields";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import TitanKpiBarSlot from "../../foundation/components/TitanKpiBarSlot";
import TitanWorkflowStatusChipBar from "../../foundation/components/TitanWorkflowStatusChipBar";
import StatisticsCriteriaPanel from "../../foundation/components/StatisticsCriteriaPanel";
import { buildStatisticsMetricChipItems } from "../../utils/kpiMetricChipItems";
import StatisticsTabChartsGrid from "../../foundation/components/StatisticsTabChartsGrid";
import StatisticsInquiryDashboard from "../../foundation/components/StatisticsInquiryDashboard";
import StatisticsCollapsibleList from "../../foundation/components/StatisticsCollapsibleList";
import {
  getDefaultDimension,
  getStatisticsScope,
  STATISTICS_STATUS_PANEL,
  STATISTICS_UNIT_OPTIONS,
} from "../../config/statisticsDashboard";
import {
  buildInquiryDashboardListColumns,
  buildProductionStatisticsListColumns,
  buildQualityStatisticsListColumns,
  buildSalesStatisticsListColumns,
  buildShipmentStatisticsListColumns,
} from "../../config/standardProductList";
import { getProductionProcessCodes } from "../../config/productionProcessCodes";
import { useTitanListSearch } from "../../foundation/hooks/useTitanListSearch";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import { getMasterDataByCategory } from "../../utils/masterData";
import {
  createEmptyStatisticsSearch,
  getStatisticsReferenceDate,
} from "../../utils/statisticsAnalytics";
import { buildTabStatistics, createEmptyTabStatisticsSearch } from "../../utils/statisticsTabAnalytics";
import { INSPECTION_JUDGMENTS } from "../../utils/inspectionLogSession";
import "../InOut/InboundManagement.css";
import SectionPageActions from "../../foundation/layout/SectionPageActions";
import "../Production/ProductionManagement.css";
import "./Statistics.css";

function resolveStatisticsTab(tabParam) {
  const allowed = ["inquiry", "production", "quality", "shipment", "sales"];
  if (allowed.includes(tabParam)) return tabParam;
  return "inquiry";
}

function formatRate(value) {
  return typeof value === "number" ? value.toLocaleString("ko-KR") : value ?? "—";
}

function getEmptySearchFactory(tabId) {
  return tabId === "inquiry"
    ? createEmptyStatisticsSearch
    : () => createEmptyTabStatisticsSearch(tabId);
}

function getListColumns(tabId) {
  if (tabId === "inquiry") return buildInquiryDashboardListColumns();
  if (tabId === "production") return buildProductionStatisticsListColumns();
  if (tabId === "quality") return buildQualityStatisticsListColumns();
  if (tabId === "shipment") return buildShipmentStatisticsListColumns();
  if (tabId === "sales") return buildSalesStatisticsListColumns();
  return buildInquiryDashboardListColumns();
}

export default function StatisticsScreen() {
  const { statisticsTab: tabParam = "inquiry" } = useParams();
  const statisticsTab = resolveStatisticsTab(tabParam);
  const scope = getStatisticsScope(statisticsTab);

  const [period, setPeriod] = useState("month");
  const [referenceDate, setReferenceDate] = useState(() => getStatisticsReferenceDate());
  const [unitFilter, setUnitFilter] = useState("");
  const [dimensionId, setDimensionId] = useState(() => getDefaultDimension(scope));
  const [dimensionValue, setDimensionValue] = useState("");
  const [activeId, setActiveId] = useState(null);
  const [expandedRowId, setExpandedRowId] = useState(null);

  const { search, draft, onDraftChange, onSearch, onReset, advancedOpen, onAdvancedToggle } =
    useTitanListSearch(getEmptySearchFactory(statisticsTab), {
      storageKey: `statistics-${statisticsTab}`,
    });

  const companies = useMemo(() => getMasterDataByCategory("companies"), []);
  const equipmentList = useMemo(() => getMasterDataByCategory("equipment"), []);
  const processCodes = useMemo(() => getProductionProcessCodes(), []);

  useEffect(() => {
    setActiveId(null);
    setExpandedRowId(null);
    setDimensionId(getDefaultDimension(getStatisticsScope(statisticsTab)));
    setDimensionValue("");
  }, [statisticsTab]);

  const analytics = useMemo(
    () =>
      buildTabStatistics(statisticsTab, {
        period,
        referenceDate,
        search,
        unitFilter,
        dimensionId,
        dimensionValue,
        selectedRow: null,
      }),
    [statisticsTab, period, referenceDate, search, unitFilter, dimensionId, dimensionValue]
  );

  const { getSuggestions } = useSearchSuggestionHelpers(analytics.rows, {
    process: processCodes.map((item) => item.name),
    equipment: equipmentList.map((item) => item.name ?? item.code),
  });

  const rows = useMemo(() => {
    if (statisticsTab === "inquiry") {
      return analytics.rows.map((row) => ({
        ...row,
        inspectionCount: formatRate(row.inspectionCount),
        passRate: formatRate(row.passRate),
        defectRate: formatRate(row.defectRate),
      }));
    }
    return analytics.rows;
  }, [analytics.rows, statisticsTab]);

  const {
    page,
    pageSize,
    totalCount,
    totalPages,
    pagedItems: pagedRows,
    setPage,
    setPageSize,
  } = useListPagination(rows);

  const activeRow = rows.find((row) => row.id === activeId)?.raw ?? null;

  const scopedAnalytics = useMemo(
    () =>
      buildTabStatistics(statisticsTab, {
        period,
        referenceDate,
        search,
        unitFilter,
        dimensionId,
        dimensionValue,
        selectedRow: activeRow,
      }),
    [statisticsTab, period, referenceDate, search, unitFilter, dimensionId, dimensionValue, activeRow]
  );

  const columns = useMemo(() => getListColumns(statisticsTab), [statisticsTab]);


  const statisticsMetricChips = useMemo(
    () => buildStatisticsMetricChipItems(scope.kpiItems, analytics.kpi, period),
    [scope.kpiItems, analytics.kpi, period]
  );

  const renderAdvancedSearch = () => {
    if (statisticsTab === "production") {
      return (
        <div className="titan-advanced-search__grid">
          <EquipmentField draft={draft} onDraftChange={onDraftChange} getSuggestions={getSuggestions} />
          <ProcessField draft={draft} onDraftChange={onDraftChange} getSuggestions={getSuggestions} />
          <WorkerField draft={draft} onDraftChange={onDraftChange} getSuggestions={getSuggestions} />
          <label className="titan-advanced-search__field">
            <span className="titan-advanced-search__label">단위</span>
            <select
              className="titan-search-panel__select"
              value={draft.unit}
              onChange={(e) => {
                onDraftChange({ ...draft, unit: e.target.value });
                setUnitFilter(e.target.value);
              }}
            >
              {STATISTICS_UNIT_OPTIONS.map((item) => (
                <option key={item.label} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      );
    }

    if (statisticsTab === "quality") {
      return (
        <div className="titan-advanced-search__grid">
          <label className="titan-advanced-search__field">
            <span className="titan-advanced-search__label">검사자</span>
            <Input
              value={draft.assignee}
              onChange={(e) => onDraftChange({ ...draft, assignee: e.target.value })}
              placeholder="검사자"
            />
          </label>
          <ProcessField draft={draft} onDraftChange={onDraftChange} getSuggestions={getSuggestions} />
          <label className="titan-advanced-search__field">
            <span className="titan-advanced-search__label">검사 결과</span>
            <select
              className="titan-search-panel__select"
              value={draft.judgment}
              onChange={(e) => onDraftChange({ ...draft, judgment: e.target.value })}
            >
              <option value="">전체</option>
              {INSPECTION_JUDGMENTS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
      );
    }

    if (statisticsTab === "shipment") {
      return (
        <div className="titan-advanced-search__grid">
          <label className="titan-advanced-search__field">
            <span className="titan-advanced-search__label">단위</span>
            <select
              className="titan-search-panel__select"
              value={draft.unit}
              onChange={(e) => {
                onDraftChange({ ...draft, unit: e.target.value });
                setUnitFilter(e.target.value);
              }}
            >
              {STATISTICS_UNIT_OPTIONS.map((item) => (
                <option key={item.label} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="titan-advanced-search__field">
            <span className="titan-advanced-search__label">출고 담당자</span>
            <Input
              value={draft.manager}
              onChange={(e) => onDraftChange({ ...draft, manager: e.target.value })}
              placeholder="출고 담당자"
            />
          </label>
        </div>
      );
    }

    if (statisticsTab === "sales") {
      return (
        <div className="titan-advanced-search__grid">
          <label className="titan-advanced-search__field">
            <span className="titan-advanced-search__label">단위</span>
            <select
              className="titan-search-panel__select"
              value={draft.unit}
              onChange={(e) => {
                onDraftChange({ ...draft, unit: e.target.value });
                setUnitFilter(e.target.value);
              }}
            >
              {STATISTICS_UNIT_OPTIONS.map((item) => (
                <option key={item.label} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      );
    }

    return (
      <div className="titan-advanced-search__grid">
        <PurchaseOrderNoField draft={draft} onDraftChange={onDraftChange} getSuggestions={getSuggestions} />
        <ManagementIdField draft={draft} onDraftChange={onDraftChange} getSuggestions={getSuggestions} />
        <LotNoField draft={draft} onDraftChange={onDraftChange} getSuggestions={getSuggestions} />
        <CustomerLotNoField draft={draft} onDraftChange={onDraftChange} getSuggestions={getSuggestions} />
        <label className="titan-advanced-search__field">
          <span className="titan-advanced-search__label">단위</span>
          <select
            className="titan-search-panel__select"
            value={draft.unit}
            onChange={(e) => {
              onDraftChange({ ...draft, unit: e.target.value });
              setUnitFilter(e.target.value);
            }}
          >
            {STATISTICS_UNIT_OPTIONS.map((item) => (
              <option key={item.label} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="titan-advanced-search__field">
          <span className="titan-advanced-search__label">조회기간</span>
          <div className="titan-advanced-search__date-range">
            <Input
              type="date"
              value={draft.periodFrom}
              onChange={(e) => onDraftChange({ ...draft, periodFrom: e.target.value })}
            />
            <span>~</span>
            <Input
              type="date"
              value={draft.periodTo}
              onChange={(e) => onDraftChange({ ...draft, periodTo: e.target.value })}
            />
          </div>
        </label>
      </div>
    );
  };

  return (
    <div className={`statistics-page inbound-page ${scope.accentClass}`}>
      <SectionPageActions>
        <SecondaryButton type="button">
          <FileSpreadsheet size={14} aria-hidden="true" />
          엑셀 출력
        </SecondaryButton>
      </SectionPageActions>

      <TitanKpiBarSlot ariaLabel={STATISTICS_STATUS_PANEL.title} className="inbound-page__kpi">
        <TitanWorkflowStatusChipBar
          items={statisticsMetricChips}
          ariaLabel={STATISTICS_STATUS_PANEL.title}
        />
      </TitanKpiBarSlot>

      <TitanSearchPanel
        draft={draft}
        onDraftChange={onDraftChange}
        onSearch={onSearch}
        onReset={() => {
          setUnitFilter("");
          setDimensionValue("");
          onReset();
        }}
        advancedOpen={advancedOpen}
        onAdvancedToggle={onAdvancedToggle}
        companies={companies}
        records={analytics.rows}
        advancedContent={renderAdvancedSearch()}
      />

      <StatisticsCriteriaPanel
        scope={scope}
        dimensionId={dimensionId}
        dimensionValue={dimensionValue}
        dimensionOptions={analytics.dimensionOptions}
        onDimensionChange={(id) => {
          setDimensionId(id);
          setDimensionValue("");
          setPage(1);
        }}
        onDimensionValueChange={(value) => {
          setDimensionValue(value);
          setPage(1);
        }}
        unitFilter={unitFilter}
        onUnitFilterChange={(value) => {
          setUnitFilter(value);
          onDraftChange({ ...draft, unit: value });
          setPage(1);
        }}
        period={period}
        onPeriodChange={setPeriod}
        referenceDate={referenceDate}
        onReferenceDateChange={setReferenceDate}
      />

      <section className="statistics-page__charts-area" aria-label="분석 차트">
        <header className="statistics-page__charts-head">
          <BarChart2 size={16} aria-hidden="true" />
          <h2>분석 차트</h2>
        </header>
        {scope.integratedDashboard ? (
          <StatisticsInquiryDashboard
            dashboard={scopedAnalytics.inquiryDashboard}
            scopeLabel={scopedAnalytics.scopeLabel}
          />
        ) : (
          <StatisticsTabChartsGrid charts={scopedAnalytics.charts} scopeLabel={scopedAnalytics.scopeLabel} />
        )}
      </section>

      <StatisticsCollapsibleList key={statisticsTab} totalCount={totalCount} defaultOpen={false}>
        <div className="statistics-page__list-area">
          <TitanDataTable
            className="inbound-page__table"
            columns={columns}
            rows={pagedRows}
            activeRowId={activeId}
            expandedRowId={expandedRowId}
            onExpandedRowChange={setExpandedRowId}
            renderExpandedRow={(row) => (
              <div className="titan-list-expand">
                <dl className="inbound-detail titan-list-expand__detail">
                  {columns.map((col) => (
                    <div key={col.key}>
                      <dt>{col.label}</dt>
                      <dd>
                        {col.render
                          ? col.render(row)
                          : row[col.key] != null && String(row[col.key]).trim() !== ""
                            ? String(row[col.key])
                            : "—"}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
            onRowClick={(row) => {
              setActiveId(row.id);
            }}
            emptyMessage="조회 조건에 맞는 통계 데이터가 없습니다."
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
      </StatisticsCollapsibleList>
    </div>
  );
}
