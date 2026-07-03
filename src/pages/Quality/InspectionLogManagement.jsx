import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileSpreadsheet, FileText, Plus } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import Input from "../../foundation/components/Input";
import StatusChip from "../../foundation/components/StatusChip";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanSearchPanel, {
  TitanAdvancedSearchField,
  useSearchSuggestionHelpers,
} from "../../foundation/components/TitanSearchPanel";
import {
  CustomerLotNoField,
  PurchaseOrderNoField,
} from "../../foundation/components/TitanSearchAdvancedFields";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import TitanDetailPanel from "../../foundation/components/TitanDetailPanel";
import TitanKpiBarSlot from "../../foundation/components/TitanKpiBarSlot";
import TitanWorkflowStatusChipBar from "../../foundation/components/TitanWorkflowStatusChipBar";
import { useWorkflowChipFilter } from "../../foundation/hooks/useWorkflowChipFilter";
import {
  INSPECTION_LOG_STATUS_OPTIONS,
} from "../../config/qualityDashboard";
import { createEmptyInspectionLogSearch } from "../../config/listSearchStandard";
import { buildInspectionLogListColumns } from "../../config/standardProductList";
import { INSPECTION_LOG_REGISTER_LABEL, INSPECTION_REPORT_LABEL } from "../../config/registerModalStandard";
import {
  getProcessChipVariant,
  getProductionProcessCodes,
} from "../../config/productionProcessCodes";
import { useTitanListSearch } from "../../foundation/hooks/useTitanListSearch";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import { getMasterDataByCategory } from "../../utils/masterData";
import { getInspectionLogs } from "../../utils/inspectionLogSession";
import { ensureInspectionReportForLog } from "../../utils/inspectionReportSession";
import {
  mapInspectionLogToListRow,
  matchesInspectionLogSearch,
} from "../../utils/inspectionLogStatus";
import { getProcessFlowSteps } from "../../utils/processFlow";
import { getSessionProductionRecords } from "../../utils/productionRecords";
import "../InOut/InboundManagement.css";
import SectionPageActions from "../../foundation/layout/SectionPageActions";
import "./QualityManagement.css";

export default function InspectionLogManagement() {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const { search, draft, onDraftChange, onSearch, onReset, advancedOpen, onAdvancedToggle } =
    useTitanListSearch(createEmptyInspectionLogSearch, { storageKey: "inspection-log" });
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const chipRecords = useMemo(() => getSessionProductionRecords(), [refreshKey]);
  const { activeChipId, handleChipClick } = useWorkflowChipFilter({
    draft,
    onDraftChange,
    onReset,
  });

  const companies = useMemo(() => getMasterDataByCategory("companies"), []);
  const processCodes = useMemo(() => getProductionProcessCodes(), []);
  const searchRecords = useMemo(() => getInspectionLogs(), [refreshKey]);
  const { getSuggestions } = useSearchSuggestionHelpers(searchRecords, {
    process: processCodes.map((item) => item.name),
  });

  const rows = useMemo(() => {
    return getInspectionLogs()
      .map(mapInspectionLogToListRow)
      .filter((row) => matchesInspectionLogSearch(row, search))
      .sort((a, b) => b.registeredDate.localeCompare(a.registeredDate));
  }, [search, refreshKey]);

  const {
    page,
    pageSize,
    totalCount,
    totalPages,
    pagedItems: pagedRows,
    setPage,
    setPageSize,
  } = useListPagination(rows);

  const activeRow = pagedRows.find((row) => row.id === activeId) ?? pagedRows[0] ?? null;

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

  const columns = useMemo(
    () =>
      buildInspectionLogListColumns({
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

  const activeRecord =
    getSessionProductionRecords().find((record) => record.id === activeRow?.managementId) ?? null;

  const processFlowSteps = activeRecord ? getProcessFlowSteps(activeRecord) : [];

  const openRegister = (managementId = "") => {
    const query = managementId ? `?managementId=${encodeURIComponent(managementId)}` : "";
    navigate(`/quality/inspection/register${query}`);
  };

  const handleOpenReport = () => {
    if (!activeRow?.id) return;
    ensureInspectionReportForLog(activeRow.id);
    navigate(`/quality/inspection/${activeRow.id}/report`);
  };

  const handleDetailRegister = () => {
    if (!activeRow?.managementId || activeRow.managementId === "—") {
      openRegister();
      return;
    }
    openRegister(activeRow.managementId);
  };

  const handleRowDoubleClick = (row) => {
    if (!row?.managementId || row.managementId === "—") {
      openRegister();
      return;
    }
    openRegister(row.managementId);
  };

  return (
    <div className="inbound-page quality-page">
      <SectionPageActions>
        <PrimaryButton type="button" onClick={() => openRegister()}>
          <Plus size={14} aria-hidden="true" />
          {INSPECTION_LOG_REGISTER_LABEL}
        </PrimaryButton>
        <SecondaryButton type="button">
          <FileSpreadsheet size={14} aria-hidden="true" />
          엑셀 출력
        </SecondaryButton>
      </SectionPageActions>

      <TitanKpiBarSlot ariaLabel="검사 현황" className="inbound-page__kpi">
        <TitanWorkflowStatusChipBar
          chipSetId="inspection"
          records={chipRecords}
          activeId={activeChipId}
          onChipClick={handleChipClick}
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
            <PurchaseOrderNoField draft={draft} onDraftChange={onDraftChange} getSuggestions={getSuggestions} />
            <TitanAdvancedSearchField
              label="관리번호"
              fieldKey="managementId"
              value={draft.managementId}
              onChange={(value) => onDraftChange({ ...draft, managementId: value })}
              suggestions={getSuggestions("managementId", draft.managementId)}
              placeholder="관리번호"
            />
            <TitanAdvancedSearchField
              label="LOT.NO"
              fieldKey="lotNo"
              value={draft.lotNo}
              onChange={(value) => onDraftChange({ ...draft, lotNo: value })}
              suggestions={getSuggestions("lotNo", draft.lotNo)}
              placeholder="LOT.NO"
            />
            <CustomerLotNoField draft={draft} onDraftChange={onDraftChange} getSuggestions={getSuggestions} />
            <label className="titan-advanced-search__field">
              <span className="titan-advanced-search__label">공정</span>
              <select
                className="titan-search-panel__select"
                value={draft.process}
                onChange={(e) => onDraftChange({ ...draft, process: e.target.value })}
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
              <span className="titan-advanced-search__label">검사일</span>
              <div className="titan-advanced-search__date-range">
                <Input
                  type="date"
                  value={draft.inspectionDateFrom}
                  onChange={(e) => onDraftChange({ ...draft, inspectionDateFrom: e.target.value })}
                />
                <span>~</span>
                <Input
                  type="date"
                  value={draft.inspectionDateTo}
                  onChange={(e) => onDraftChange({ ...draft, inspectionDateTo: e.target.value })}
                />
              </div>
            </label>
            <TitanAdvancedSearchField
              label="검사자"
              fieldKey="assignee"
              value={draft.assignee}
              onChange={(value) => onDraftChange({ ...draft, assignee: value })}
              suggestions={getSuggestions("assignee", draft.assignee)}
              placeholder="검사자"
            />
            <label className="titan-advanced-search__field">
              <span className="titan-advanced-search__label">현재상태</span>
              <select
                className="titan-search-panel__select"
                value={draft.status}
                onChange={(e) => onDraftChange({ ...draft, status: e.target.value })}
              >
                <option value="">전체</option>
                {INSPECTION_LOG_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>
        }
      />

      <div className="inbound-page__workspace">
        <div className="inbound-page__list">
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
            onRowDoubleClick={handleRowDoubleClick}
            emptyMessage="등록된 검사일지가 없습니다."
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

        {activeRow ? (
          <TitanDetailPanel
            actionLabel={INSPECTION_LOG_REGISTER_LABEL}
            actionIcon={Plus}
            onAction={handleDetailRegister}
            secondaryActionLabel={INSPECTION_REPORT_LABEL}
            secondaryActionIcon={FileText}
            onSecondaryAction={handleOpenReport}
            processFlowSteps={processFlowSteps}
            detailContent={
              <dl className="inbound-detail">
                <div>
                  <dt>관리번호</dt>
                  <dd>{activeRow.managementId}</dd>
                </div>
                <div>
                  <dt>발주번호</dt>
                  <dd>{activeRow.purchaseOrderNo}</dd>
                </div>
                <div>
                  <dt>LOT.NO</dt>
                  <dd>{activeRow.lotNo}</dd>
                </div>
                <div>
                  <dt>업체 LOT</dt>
                  <dd>{activeRow.customerLotNo}</dd>
                </div>
                <div>
                  <dt>업체명</dt>
                  <dd>{activeRow.company}</dd>
                </div>
                <div>
                  <dt>품명</dt>
                  <dd>{activeRow.partName}</dd>
                </div>
                <div>
                  <dt>품번</dt>
                  <dd>{activeRow.partNo}</dd>
                </div>
                <div>
                  <dt>재질</dt>
                  <dd>{activeRow.material}</dd>
                </div>
                <div>
                  <dt>공정</dt>
                  <dd>
                    {activeRow.processName && activeRow.processName !== "—" ? (
                      <StatusChip variant={getProcessChipVariant(activeRow.processName)}>
                        {activeRow.processName}
                      </StatusChip>
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>
                <div>
                  <dt>검사일</dt>
                  <dd>{activeRow.inspectionDate}</dd>
                </div>
                <div>
                  <dt>검사자</dt>
                  <dd>{activeRow.assignee}</dd>
                </div>
                <div>
                  <dt>검사 항목</dt>
                  <dd>{activeRow.log.inspectionItems?.join(", ") || activeRow.log.inspectionItem || "—"}</dd>
                </div>
                <div>
                  <dt>검사 결과</dt>
                  <dd>
                    <StatusChip variant={activeRow.statusVariant}>{activeRow.statusLabel}</StatusChip>
                  </dd>
                </div>
                <div>
                  <dt>등록일</dt>
                  <dd>{activeRow.registeredDate}</dd>
                </div>
                <div>
                  <dt>비고</dt>
                  <dd>{activeRow.log.note || "—"}</dd>
                </div>
              </dl>
            }
          />
        ) : null}
      </div>
    </div>
  );
}
