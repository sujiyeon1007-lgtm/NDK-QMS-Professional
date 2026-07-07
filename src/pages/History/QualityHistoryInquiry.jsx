import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowDown, CheckCircle2, Circle, History, Search } from "lucide-react";

import TitanDataTable from "../../foundation/components/DataTable";
import TitanSearchPanel, { useSearchSuggestionHelpers } from "../../foundation/components/TitanSearchPanel";
import TitanAdvancedSearchGrid from "../../foundation/components/TitanAdvancedSearchGrid";
import {
  CustomerLotNoField,
  PurchaseOrderNoField,
} from "../../foundation/components/TitanSearchAdvancedFields";
import { STANDARD_PRODUCT_BASIC_SEARCH_FIELDS } from "../../config/listSearchStandard";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import TitanKpiBarSlot from "../../foundation/components/TitanKpiBarSlot";
import TitanWorkflowStatusChipBar from "../../foundation/components/TitanWorkflowStatusChipBar";
import TitanDetailPanel from "../../foundation/components/TitanDetailPanel";
import StatusChip from "../../foundation/components/StatusChip";
import { useTitanListSearch } from "../../foundation/hooks/useTitanListSearch";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import { buildMetricChipItems } from "../../utils/kpiMetricChipItems";
import { getMasterDataByCategory } from "../../utils/masterData";
import { getSessionProductionRecords } from "../../utils/productionRecords";
import {
  buildQualityTraceabilityTimeline,
  createEmptyHistoryInquirySearch,
  findHistoryRecordByQuery,
  mapHistoryInquiryListRow,
} from "../../utils/qualityHistoryInquiry";
import {
  getQualityHistoryScreenData,
  searchQualityHistoryWorkspaceRecords,
} from "../../utils/qualityWorkspaceData";

import TitanScreenDetailPopup from "../../foundation/components/TitanScreenDetailPopup";
import { openRowDetailPopup } from "../../foundation/utils/openRowDetailPopup";

import "../InOut/InboundManagement.css";
import "./QualityHistoryInquiry.css";

function HistorySearchPanel({
  draft,
  onDraftChange,
  onSearch,
  onReset,
  advancedOpen,
  onAdvancedToggle,
  companies,
  getSuggestions,
}) {
  return (
    <TitanSearchPanel
      draft={draft}
      onDraftChange={onDraftChange}
      onSearch={onSearch}
      onReset={onReset}
      advancedOpen={advancedOpen}
      onAdvancedToggle={onAdvancedToggle}
      companies={companies}
      basicFields={STANDARD_PRODUCT_BASIC_SEARCH_FIELDS}
      advancedContent={
        <TitanAdvancedSearchGrid>
          <PurchaseOrderNoField draft={draft} onDraftChange={onDraftChange} getSuggestions={getSuggestions} />
          <CustomerLotNoField draft={draft} onDraftChange={onDraftChange} getSuggestions={getSuggestions} />
        </TitanAdvancedSearchGrid>
      }
    />
  );
}

function TraceabilityFlow({ timeline }) {
  if (!timeline?.length) {
    return <p className="qms-history-flow__empty">Traceability 이력이 없습니다.</p>;
  }

  return (
    <ol className="qms-history-flow" aria-label="품질 Traceability">
      {timeline.map((step, index) => (
        <li key={step.id} className="qms-history-flow__item">
          <div className="qms-history-flow__marker" aria-hidden="true">
            {step.status === "done" ? <CheckCircle2 size={16} /> : <Circle size={16} />}
          </div>
          <div className="qms-history-flow__content">
            <div className="qms-history-flow__head">
              <strong>{step.label}</strong>
              <StatusChip variant={step.status === "done" ? "complete" : "wait"}>
                {step.status === "done" ? "완료" : "미진행"}
              </StatusChip>
            </div>
            <p className="qms-history-flow__detail">{step.detail}</p>
          </div>
          {index < timeline.length - 1 ? (
            <ArrowDown size={14} className="qms-history-flow__arrow" aria-hidden="true" />
          ) : null}
        </li>
      ))}
    </ol>
  );
}

export default function QualityHistoryInquiry() {
  const [searchParams] = useSearchParams();
  const [activeId, setActiveId] = useState(null);
  const [detailPopupRow, setDetailPopupRow] = useState(null);

  const companies = useMemo(() => getMasterDataByCategory("companies"), []);

  const { search, draft, onDraftChange, onSearch, onReset, advancedOpen, onAdvancedToggle } =
    useTitanListSearch(createEmptyHistoryInquirySearch, {
      storageKey: "quality-history-inquiry",
    });

  const screenData = useMemo(() => getQualityHistoryScreenData(), []);
  const searchRecords = useMemo(() => screenData.baseRecords, [screenData.baseRecords]);
  const listRows = useMemo(
    () => searchQualityHistoryWorkspaceRecords(search).map(mapHistoryInquiryListRow),
    [search]
  );

  const { getSuggestions } = useSearchSuggestionHelpers(searchRecords, {});

  const {
    page,
    pageSize,
    totalCount,
    totalPages,
    pagedItems: pagedRows,
    setPage,
    setPageSize,
  } = useListPagination(listRows);

  const activeRow = pagedRows.find((row) => row.id === activeId) ?? pagedRows[0] ?? null;

  const activeRecord = useMemo(() => {
    if (!activeRow) return null;
    return getSessionProductionRecords().find((row) => row.id === activeRow.id) ?? null;
  }, [activeRow]);

  const timeline = useMemo(
    () => buildQualityTraceabilityTimeline(activeRecord),
    [activeRecord]
  );

  useEffect(() => {
    const queryId = searchParams.get("id");
    const queryLot = searchParams.get("lot");
    if (!queryId && !queryLot) return;

    const fromQuery = findHistoryRecordByQuery({ id: queryId, lot: queryLot });
    if (!fromQuery?.id) return;

    const nextSearch = {
      ...createEmptyHistoryInquirySearch(),
      managementId: fromQuery.id,
    };
    setActiveId(fromQuery.id);
    onDraftChange(nextSearch);
    onSearch(nextSearch);
  }, [searchParams, onDraftChange, onSearch]);

  const kpiCards = useMemo(() => {
    const total = listRows.length;
    const complete = listRows.filter((row) => row.traceProgress === "4/4").length;
    const inProgress = listRows.filter((row) => row.traceProgress !== "4/4" && row.traceProgress !== "0/4").length;
    return [
      {
        id: "total",
        label: "조회 결과",
        value: total.toLocaleString("ko-KR"),
        unit: "건",
        tone: "blue",
        icon: Search,
      },
      {
        id: "complete",
        label: "전체 이력",
        value: complete.toLocaleString("ko-KR"),
        unit: "건",
        tone: "green",
        icon: CheckCircle2,
      },
      {
        id: "progress",
        label: "진행 중",
        value: inProgress.toLocaleString("ko-KR"),
        unit: "건",
        tone: "orange",
        icon: History,
      },
    ];
  }, [listRows]);

  const metricChipItems = useMemo(() => buildMetricChipItems(kpiCards), [kpiCards]);

  const columns = useMemo(
    () => [
      {
        key: "managementId",
        label: "관리번호",
        widthPercent: 14,
        render: (row) => row.managementId,
      },
      {
        key: "lotNo",
        label: "LOT.NO",
        widthPercent: 12,
        render: (row) => row.lotNo,
      },
      {
        key: "purchaseOrderNo",
        label: "발주번호",
        widthPercent: 12,
        render: (row) => row.purchaseOrderNo,
      },
      {
        key: "customerLotNo",
        label: "업체 LOT",
        widthPercent: 10,
        render: (row) => row.customerLotNo,
      },
      {
        key: "company",
        label: "업체명",
        widthPercent: 13,
        render: (row) => row.company,
      },
      {
        key: "partName",
        label: "품명",
        widthPercent: 18,
        render: (row) => row.partName,
      },
      {
        key: "partNo",
        label: "품번",
        widthPercent: 12,
        render: (row) => row.partNo,
      },
      {
        key: "traceProgress",
        label: "이력",
        widthPercent: 8,
        render: (row) => row.traceProgress,
      },
    ],
    []
  );

  const detailContent = activeRecord ? (
    <div className="qms-history-detail">
      <dl className="qms-history-detail__meta">
        <div>
          <dt>관리번호</dt>
          <dd>{activeRecord.id}</dd>
        </div>
        <div>
          <dt>LOT.NO</dt>
          <dd>{activeRecord.lotNo || "—"}</dd>
        </div>
        <div>
          <dt>발주번호</dt>
          <dd>{activeRecord.purchaseOrderNo || "—"}</dd>
        </div>
        <div>
          <dt>업체 LOT</dt>
          <dd>{activeRecord.customerLotNo || "—"}</dd>
        </div>
      </dl>
      <TraceabilityFlow timeline={timeline} />
    </div>
  ) : (
    <p className="qms-history-detail__empty">검색 후 제품을 선택하면 Traceability 이력을 확인할 수 있습니다.</p>
  );

  const handleRowDoubleClick = (row) => {
    openRowDetailPopup(row, { setActiveId, setDetailPopupRow, getRowId: (item) => item.id });
  };

  return (
    <div className="inbound-page qms-history-page">
      <TitanKpiBarSlot ariaLabel="이력조회 현황" className="inbound-page__kpi">
        <TitanWorkflowStatusChipBar items={metricChipItems} ariaLabel="이력조회 현황" />
      </TitanKpiBarSlot>

      <HistorySearchPanel
        draft={draft}
        onDraftChange={onDraftChange}
        onSearch={onSearch}
        onReset={onReset}
        advancedOpen={advancedOpen}
        onAdvancedToggle={onAdvancedToggle}
        companies={companies}
        getSuggestions={getSuggestions}
      />

      <div className="inbound-page__body qms-history-page__body">
        <div className="inbound-page__list">
          <TitanDataTable
            columns={columns}
            rows={pagedRows}
            rowKey="id"
            activeRowId={activeRow?.id}
            onRowClick={(row) => setActiveId(row.id)}
            onRowDoubleClick={handleRowDoubleClick}
            emptyMessage="조건에 맞는 이력이 없습니다."
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

        <TitanDetailPanel
          detailContent={detailContent}
          actionLabel="Traceability 조회"
          onAction={() => activeRecord && setActiveId(activeRecord.id)}
          showProcessFlow={false}
        />
      </div>

      <TitanScreenDetailPopup
        screenKey="inbound"
        open={Boolean(detailPopupRow)}
        onClose={() => setDetailPopupRow(null)}
        record={detailPopupRow}
      />
    </div>
  );
}
