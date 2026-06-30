import { useMemo, useState } from "react";
import PageTopBar from "../../foundation/layout/PageTopBar";
import StatusSummaryGroup from "../../foundation/components/StatusSummaryGroup";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import StatusChip from "../../foundation/components/StatusChip";
import Card from "../../foundation/components/Card";
import { HOME_PAGE_META, HOME_RECENT_LIST_TITLE } from "../../config/homeDashboard";
import { buildHomeStatusGroups, buildRecentWorkList } from "../../utils/homeDashboardData";
import { getSessionProductionRecords } from "../../utils/productionRecords";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import { buildStandardProductListColumns } from "../../config/standardProductList";
import { getProcessChipVariant } from "../../config/productionProcessCodes";
import "./Home.css";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  const records = useMemo(() => getSessionProductionRecords(), [refreshKey]);
  const statusGroups = useMemo(() => buildHomeStatusGroups(records), [records]);
  const recentWorkList = useMemo(() => buildRecentWorkList(records), [records]);

  const recentColumns = useMemo(
    () =>
      buildStandardProductListColumns({
        renderStatus: (row) => (
          <StatusChip variant={row.statusVariant}>{row.statusLabel}</StatusChip>
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

  const {
    page,
    pageSize,
    totalCount,
    totalPages,
    pagedItems: pagedRows,
    setPage,
    setPageSize,
  } = useListPagination(recentWorkList);

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
    setPage(1);
  };

  return (
    <div className="home-page">
      <PageTopBar
        title={HOME_PAGE_META.title}
        description={HOME_PAGE_META.description}
        onRefresh={handleRefresh}
      />

      <div className="home-page__status-grid">
        {statusGroups.map((group) => (
          <StatusSummaryGroup key={group.id} {...group} />
        ))}
      </div>

      <Card className="home-page__recent">
        <div className="home-page__recent-header">
          <h2>{HOME_RECENT_LIST_TITLE}</h2>
        </div>
        <TitanDataTable columns={recentColumns} rows={pagedRows} />
        <TitanTableFooter
          totalCount={totalCount}
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </Card>
    </div>
  );
}
