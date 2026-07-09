import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { FileSpreadsheet } from "lucide-react";
import Input from "../../foundation/components/Input";
import { SecondaryButton } from "../../foundation/components/Button";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import TitanKpiBarSlot from "../../foundation/components/TitanKpiBarSlot";
import TitanWorkflowStatusChipBar from "../../foundation/components/TitanWorkflowStatusChipBar";
import StatisticsExecutiveDashboard from "../../foundation/components/StatisticsExecutiveDashboard";
import StatisticsCollapsibleList from "../../foundation/components/StatisticsCollapsibleList";
import { buildStatisticsMetricChipItems } from "../../utils/kpiMetricChipItems";
import {
  getExecutiveStatisticsScope,
  resolveExecutiveStatisticsTab,
} from "../../config/statisticsExecutiveDashboard";
import {
  STATISTICS_PERIODS,
  STATISTICS_STATUS_PANEL,
  STATISTICS_UNIT_OPTIONS,
} from "../../config/statisticsDashboard";
import {
  buildProductionStatisticsListColumns,
  buildQualityStatisticsListColumns,
  buildSalesStatisticsListColumns,
  buildShotStatisticsListColumns,
} from "../../config/standardProductList";
import {
  formatReferenceInputValue,
  getReferenceInputType,
  getStatisticsReferenceDate,
  parseReferenceInputValue,
} from "../../utils/statisticsAnalytics";
import { buildExecutiveStatisticsDashboard } from "../../utils/statisticsExecutiveAnalytics";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import SectionPageActions from "../../foundation/layout/SectionPageActions";
import "../InOut/InboundManagement.css";
import "../Production/ProductionManagement.css";
import "./Statistics.css";

function getListColumns(tabId) {
  if (tabId === "shot") return buildShotStatisticsListColumns();
  if (tabId === "quality") return buildQualityStatisticsListColumns();
  if (tabId === "sales") return buildSalesStatisticsListColumns();
  return buildProductionStatisticsListColumns();
}

export default function StatisticsScreen() {
  const { statisticsTab: tabParam = "production" } = useParams();
  const statisticsTab = resolveExecutiveStatisticsTab(tabParam);
  const scope = getExecutiveStatisticsScope(statisticsTab);

  const [period, setPeriod] = useState("month");
  const [referenceDate, setReferenceDate] = useState(() => getStatisticsReferenceDate());
  const [unitFilter, setUnitFilter] = useState("");

  useEffect(() => {
    setUnitFilter("");
  }, [statisticsTab]);

  const dashboard = useMemo(
    () =>
      buildExecutiveStatisticsDashboard(statisticsTab, {
        period,
        referenceDate,
        unitFilter,
      }),
    [statisticsTab, period, referenceDate, unitFilter]
  );

  const columns = useMemo(() => getListColumns(statisticsTab), [statisticsTab]);
  const {
    page,
    pageSize,
    totalCount,
    totalPages,
    pagedItems: pagedRows,
    setPage,
    setPageSize,
  } = useListPagination(dashboard?.rows ?? []);

  const statisticsMetricChips = useMemo(() => {
    const kpi = dashboard?.kpi ?? {};
    const items = scope?.kpiItems ?? [];
    if (!items.length) return [];
    try {
      return buildStatisticsMetricChipItems(items, kpi, period);
    } catch {
      return [];
    }
  }, [scope?.kpiItems, dashboard?.kpi, period]);

  const inputType = getReferenceInputType(period);
  const inputValue = formatReferenceInputValue(period, referenceDate);

  const handleDateChange = useCallback(
    (event) => {
      setReferenceDate(parseReferenceInputValue(period, event.target.value, referenceDate));
    },
    [period, referenceDate]
  );

  return (
    <div className={`statistics-page statistics-page--executive inbound-page ${scope.accentClass}`}>
      <SectionPageActions>
        <SecondaryButton type="button" onClick={() => window.alert("엑셀 출력 기능은 V1.1에서 제공될 예정입니다.")}>
          <FileSpreadsheet size={14} aria-hidden="true" />
          엑셀 출력
        </SecondaryButton>
      </SectionPageActions>

      <TitanKpiBarSlot ariaLabel={STATISTICS_STATUS_PANEL.title} className="inbound-page__kpi">
        <TitanWorkflowStatusChipBar items={statisticsMetricChips} ariaLabel={STATISTICS_STATUS_PANEL.title} />
      </TitanKpiBarSlot>

      <section className="statistics-criteria-panel production-criteria-panel stat-exec-period">
        <div className="production-criteria-panel__row">
          <div className="production-criteria-panel__group production-criteria-panel__group--wide">
            <h3 className="production-criteria-panel__title">단위 선택</h3>
            <div className="production-criteria-panel__radio-row" role="radiogroup" aria-label="단위 선택">
              {STATISTICS_UNIT_OPTIONS.map((item) => (
                <label key={item.label} className="production-criteria-panel__radio">
                  <input
                    type="radio"
                    name={`statistics-unit-${statisticsTab}`}
                    value={item.value}
                    checked={unitFilter === item.value}
                    onChange={() => setUnitFilter(item.value)}
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="production-criteria-panel__row">
          <div className="production-criteria-panel__group production-criteria-panel__group--wide">
            <h3 className="production-criteria-panel__title">조회 기간</h3>
            <div className="production-criteria-panel__radio-row" role="radiogroup" aria-label="조회 기간">
              {STATISTICS_PERIODS.map((item) => (
                <label key={item.id} className="production-criteria-panel__radio">
                  <input
                    type="radio"
                    name={`statistics-period-${statisticsTab}`}
                    value={item.id}
                    checked={period === item.id}
                    onChange={() => setPeriod(item.id)}
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="production-criteria-panel__group">
            <h3 className="production-criteria-panel__title">기준일</h3>
            <Input type={inputType} value={inputValue} onChange={handleDateChange} aria-label="기준일" />
          </div>
        </div>
      </section>

      <StatisticsExecutiveDashboard dashboard={dashboard} />

      <StatisticsCollapsibleList key={statisticsTab} totalCount={totalCount} defaultOpen={false}>
        <div className="statistics-page__list-area">
          <TitanDataTable
            className="inbound-page__table"
            columns={columns}
            rows={pagedRows}
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
