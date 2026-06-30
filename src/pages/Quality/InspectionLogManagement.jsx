import { useMemo, useState } from "react";
import { FileSpreadsheet, Plus } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import Input from "../../foundation/components/Input";
import StatusChip from "../../foundation/components/StatusChip";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanSearchPanel from "../../foundation/components/TitanSearchPanel";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import TitanDetailPanel from "../../foundation/components/TitanDetailPanel";
import ProductionKpiPanel from "../../foundation/components/ProductionKpiPanel";
import {
  INSPECTION_LOG_STATUS_OPTIONS,
  INSPECTION_STATUS_CARDS,
  INSPECTION_STATUS_PANEL,
} from "../../config/qualityDashboard";
import { createEmptyInspectionLogSearch } from "../../config/listSearchStandard";
import { buildInspectionLogListColumns } from "../../config/standardProductList";
import { INSPECTION_LOG_REGISTER_LABEL } from "../../config/registerModalStandard";
import {
  getProcessChipVariant,
  getProductionProcessCodes,
} from "../../config/productionProcessCodes";
import { useAdvancedSearchOpen } from "../../foundation/hooks/useAdvancedSearchOpen";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import { getMasterDataByCategory } from "../../utils/masterData";
import { addInspectionLog, buildInspectionLogFromRecord, getInspectionLogs } from "../../utils/inspectionLogSession";
import {
  mapInspectionLogToListRow,
  matchesInspectionLogSearch,
} from "../../utils/inspectionLogStatus";
import { buildInspectionLogKpiCounts } from "../../utils/qualityAnalytics";
import { getProcessFlowSteps } from "../../utils/processFlow";
import { getSessionProductionRecords } from "../../utils/productionRecords";
import InspectionLogRegisterModal from "./InspectionLogRegisterModal";
import "../InOut/InboundManagement.css";
import "./QualityManagement.css";

const EMPTY_SEARCH = createEmptyInspectionLogSearch();

export default function InspectionLogManagement() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerInitial, setRegisterInitial] = useState(null);
  const [search, setSearch] = useState(EMPTY_SEARCH);
  const [draft, setDraft] = useState(EMPTY_SEARCH);
  const [advancedOpen, toggleAdvanced] = useAdvancedSearchOpen("titan-inspection-log-advanced");
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeId, setActiveId] = useState(null);

  const companies = useMemo(() => getMasterDataByCategory("companies"), []);
  const processCodes = useMemo(() => getProductionProcessCodes(), []);

  const inspectionStatusCards = useMemo(() => {
    const counts = buildInspectionLogKpiCounts(getInspectionLogs());
    return INSPECTION_STATUS_CARDS.map((card) => {
      if (card.id === "passRate") {
        return { ...card, value: counts.passRate, unit: "%" };
      }
      return { ...card, count: counts[card.id] ?? 0 };
    });
  }, [refreshKey]);

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

  const handleSearch = () => setSearch({ ...draft });
  const handleReset = () => {
    setDraft(EMPTY_SEARCH);
    setSearch(EMPTY_SEARCH);
  };

  const openRegister = (initialData = null) => {
    setRegisterInitial(initialData);
    setRegisterOpen(true);
  };

  const handleRegister = (form) => {
    addInspectionLog({
      managementId: form.managementId.trim(),
      company: form.company.trim(),
      partName: form.partName.trim(),
      partNo: form.partNo.trim(),
      material: form.material.trim(),
      lotNo: form.lotNo.trim(),
      process: form.process.trim(),
      qty: Number(form.qty) || 0,
      unit: form.unit || "EA",
      inspectionDate: form.inspectionDate,
      assignee: form.assignee.trim(),
      inspectionItems: form.inspectionItems,
      inspectionItem: form.inspectionItems.join(", "),
      judgment: form.judgment,
      note: form.note.trim(),
    });
    setActiveId(null);
    setRefreshKey((key) => key + 1);
    setPage(1);
  };

  const handleDetailRegister = () => {
    if (!activeRow) return;
    const record = getSessionProductionRecords().find((item) => item.id === activeRow.managementId);
    openRegister(
      buildInspectionLogFromRecord(record, {
        managementId: activeRow.managementId,
        lotNo: activeRow.lotNo !== "—" ? activeRow.lotNo : "",
        company: activeRow.company !== "—" ? activeRow.company : "",
        partName: activeRow.partName !== "—" ? activeRow.partName : "",
        partNo: activeRow.partNo !== "—" ? activeRow.partNo : "",
        material: activeRow.material !== "—" ? activeRow.material : "",
        process: activeRow.processName !== "—" ? activeRow.processName : "",
        qty: activeRow.log.qty,
        unit: activeRow.log.unit,
        assignee: activeRow.assignee !== "—" ? activeRow.assignee : "",
      }) ?? {
        managementId: activeRow.managementId,
        lotNo: activeRow.lotNo !== "—" ? activeRow.lotNo : "",
        company: activeRow.company,
        partName: activeRow.partName,
        partNo: activeRow.partNo,
        material: activeRow.material,
        process: activeRow.processName !== "—" ? activeRow.processName : "",
        qty: activeRow.log.qty,
        unit: activeRow.log.unit,
      }
    );
  };

  return (
    <div className="inbound-page quality-page">
      <div className="inbound-page__toolbar">
        <h2 className="inbound-page__title">검사일지</h2>
        <div className="inbound-page__actions">
          <PrimaryButton type="button" onClick={() => openRegister()}>
            <Plus size={14} aria-hidden="true" />
            {INSPECTION_LOG_REGISTER_LABEL}
          </PrimaryButton>
          <SecondaryButton type="button">
            <FileSpreadsheet size={14} aria-hidden="true" />
            엑셀 출력
          </SecondaryButton>
        </div>
      </div>

      <ProductionKpiPanel
        title={INSPECTION_STATUS_PANEL.title}
        titleIcon={INSPECTION_STATUS_PANEL.titleIcon}
        cards={inspectionStatusCards}
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
              <span className="titan-advanced-search__label">검사일</span>
              <div className="titan-advanced-search__date-range">
                <Input
                  type="date"
                  value={draft.inspectionDateFrom}
                  onChange={(e) => setDraft({ ...draft, inspectionDateFrom: e.target.value })}
                />
                <span>~</span>
                <Input
                  type="date"
                  value={draft.inspectionDateTo}
                  onChange={(e) => setDraft({ ...draft, inspectionDateTo: e.target.value })}
                />
              </div>
            </label>
            <label className="titan-advanced-search__field">
              <span className="titan-advanced-search__label">검사자</span>
              <Input
                value={draft.assignee}
                onChange={(e) => setDraft({ ...draft, assignee: e.target.value })}
                placeholder="검사자"
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
            processFlowSteps={processFlowSteps}
            detailContent={
              <dl className="inbound-detail">
                <div>
                  <dt>관리번호</dt>
                  <dd>{activeRow.managementId}</dd>
                </div>
                <div>
                  <dt>LOT.NO</dt>
                  <dd>{activeRow.lotNo}</dd>
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

      <InspectionLogRegisterModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onRegister={handleRegister}
        initialData={registerInitial}
      />
    </div>
  );
}
