import { useMemo, useState } from "react";
import { FileSpreadsheet, Plus, Printer } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import Input from "../../foundation/components/Input";
import StatusChip from "../../foundation/components/StatusChip";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanSearchPanel from "../../foundation/components/TitanSearchPanel";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import TitanDetailPanel from "../../foundation/components/TitanDetailPanel";
import TitanPrintPreviewModal from "../../components/print/TitanPrintPreviewModal";
import ProductionDailyReportPrint from "../../components/print/ProductionDailyReportPrint";
import { getPrintDocumentMeta, TITAN_PRINT_DOCUMENT_TYPES } from "../../config/titanPrintDocuments";
import {
  createEmptyProductionDailyReportSearch,
  matchesBasicSearch,
} from "../../config/listSearchStandard";
import {
  getProcessChipVariant,
  getProductionProcessCodes,
  getProductionProcessName,
} from "../../config/productionProcessCodes";
import { buildStandardProductListColumns } from "../../config/standardProductList";
import { useAdvancedSearchOpen } from "../../foundation/hooks/useAdvancedSearchOpen";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import { getMasterDataByCategory } from "../../utils/masterData";
import {
  addSessionProductionRecord,
  getSessionProductionRecords,
  updateSessionProductionRecord,
} from "../../utils/productionRecords";
import {
  APPROVAL_STATUS_OPTIONS,
  filterProductionDailyReportRecords,
  formatProductionDailyReportDateTime,
  getProductionDailyReportApprovalStatus,
  getProductionDailyReportStatus,
} from "../../utils/productionDailyReportStatus";
import { getProcessFlowSteps, mapStandardProductListRow } from "../../utils/processFlow";
import { buildProductionDailyStatusCounts } from "../../utils/productionAnalytics";
import { PRODUCTION_DAILY_REGISTER_LABEL, PRODUCTION_DAILY_PRINT_LABEL } from "../../config/registerModalStandard";
import { mapRowsToProductionDailyPrintRows } from "../../utils/productionDailyReportPrintLayout";
import { getJournalReferenceDate } from "../../utils/workJournalData";
import { exportTitanPdf, printTitanDocument } from "../../utils/titanPrintExport";
import ProductionKpiPanel from "../../foundation/components/ProductionKpiPanel";
import {
  PRODUCTION_DAILY_STATUS_CARDS,
  PRODUCTION_DAILY_STATUS_PANEL,
} from "../../config/productionDashboard";
import DailyProductionReportRegisterModal from "./DailyProductionReportRegisterModal";
import "../InOut/InboundManagement.css";
import "./ProductionManagement.css";

const EMPTY_SEARCH = createEmptyProductionDailyReportSearch();

function matchesProductionDailyReportSearch(record, row, search) {
  if (!matchesBasicSearch(search, record)) return false;
  if (search.managementId && !record.id.toLowerCase().includes(search.managementId.toLowerCase())) {
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
  if (search.process && getProductionProcessName(record) !== search.process) return false;
  const workDate = record.workDate || record.dueDate || "—";
  if (search.workDateFrom && workDate < search.workDateFrom) return false;
  if (search.workDateTo && workDate > search.workDateTo) return false;
  if (search.equipment && !String(record.equipment ?? "").includes(search.equipment)) return false;
  const worker = record.registrar ?? record.worker ?? "관리자";
  if (search.worker && !worker.includes(search.worker)) return false;
  const approval = getProductionDailyReportApprovalStatus(record);
  if (search.approvalStatus && approval !== search.approvalStatus) return false;
  return true;
}

function mapRecordToRow(record) {
  return mapStandardProductListRow(record, getProductionDailyReportStatus(record));
}

export default function DailyProductionReport() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [search, setSearch] = useState(EMPTY_SEARCH);
  const [draft, setDraft] = useState(EMPTY_SEARCH);
  const [advancedOpen, toggleAdvanced] = useAdvancedSearchOpen("titan-production-daily-advanced");
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [dailyPrintOpen, setDailyPrintOpen] = useState(false);
  const [dailyPrintBusy, setDailyPrintBusy] = useState(false);

  const companies = useMemo(() => getMasterDataByCategory("companies"), []);
  const equipmentList = useMemo(() => getMasterDataByCategory("equipment"), []);
  const processCodes = useMemo(() => getProductionProcessCodes(), []);

  const dailyStatusCards = useMemo(() => {
    const counts = buildProductionDailyStatusCounts(getSessionProductionRecords());
    return PRODUCTION_DAILY_STATUS_CARDS.map((card) => ({
      ...card,
      count: counts[card.id] ?? 0,
    }));
  }, [refreshKey]);

  const rows = useMemo(() => {
    const records = filterProductionDailyReportRecords(getSessionProductionRecords());
    return records
      .map(mapRecordToRow)
      .filter((row) => matchesProductionDailyReportSearch(row.record, row, search))
      .sort((a, b) => b.managementId.localeCompare(a.managementId));
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

  const selectedRows = useMemo(
    () => selectedIds.map((id) => rows.find((row) => row.id === id)).filter(Boolean),
    [selectedIds, rows]
  );

  const printTargetRows = useMemo(() => {
    if (selectedRows.length > 0) return selectedRows;
    if (activeRow) return [activeRow];
    return [];
  }, [selectedRows, activeRow]);

  const dailyPrintProps = useMemo(() => {
    if (printTargetRows.length === 0) return null;
    return {
      rows: mapRowsToProductionDailyPrintRows(printTargetRows),
      reportDate: getJournalReferenceDate(),
    };
  }, [printTargetRows]);

  const openDailyPrintPreview = () => {
    if (printTargetRows.length === 0) return;
    setDailyPrintOpen(true);
  };

  const handleDailyPrint = async (documentEl) => {
    setDailyPrintBusy(true);
    try {
      await printTitanDocument(documentEl);
    } finally {
      setDailyPrintBusy(false);
    }
  };

  const handleDailyPdf = async (documentEl) => {
    setDailyPrintBusy(true);
    try {
      await exportTitanPdf(documentEl, `production-daily-report-${getJournalReferenceDate()}.pdf`);
    } finally {
      setDailyPrintBusy(false);
    }
  };

  const dailyPrintMeta = getPrintDocumentMeta(TITAN_PRINT_DOCUMENT_TYPES.PRODUCTION_DAILY_REPORT);

  const columns = useMemo(
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

  const processFlowSteps = activeRow
    ? getProcessFlowSteps(activeRow.record, activeRow.statusLabel)
    : [];

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
  };

  const handleRegister = (form) => {
    const managementId = form.managementId.trim();
    if (!managementId) return;

    const now = new Date().toISOString();
    const today = now.slice(0, 10);
    const qty = Number(form.qty) || 0;
    const patch = {
      company: form.company.trim() || "—",
      lotNo: form.lotNo.trim(),
      heatTreatment: form.process,
      partName: form.partName.trim(),
      partNo: form.partNo.trim(),
      material: form.material.trim(),
      qty,
      workDate: form.workDate || today,
      equipment: form.equipment,
      registrar: form.worker.trim() || "관리자",
      note: form.note.trim(),
      registered: true,
      completionStatus: "생산완료",
      lotCreatedAt: now,
      updatedAt: now,
    };

    const existing = getSessionProductionRecords().find((r) => r.id === managementId);
    if (existing) {
      updateSessionProductionRecord(managementId, patch);
    } else {
      addSessionProductionRecord({
        id: managementId,
        unit: "EA",
        incomingDate: today,
        dueDate: form.workDate || today,
        incomingRegistered: true,
        shipmentStatus: "출고대기",
        certificateStatus: "미발행",
        ...patch,
      });
    }

    setActiveId(managementId);
    setRefreshKey((k) => k + 1);
    setPage(1);
  };

  return (
    <div className="inbound-page production-page">
      <div className="inbound-page__toolbar">
        <h2 className="inbound-page__title">생산일보</h2>
        <div className="inbound-page__actions">
          <PrimaryButton type="button" onClick={() => setRegisterOpen(true)}>
            <Plus size={14} aria-hidden="true" />
            {PRODUCTION_DAILY_REGISTER_LABEL}
          </PrimaryButton>
          <SecondaryButton type="button" onClick={openDailyPrintPreview} disabled={printTargetRows.length === 0}>
            <Printer size={14} aria-hidden="true" />
            {PRODUCTION_DAILY_PRINT_LABEL}
          </SecondaryButton>
          <SecondaryButton type="button">
            <FileSpreadsheet size={14} aria-hidden="true" />
            엑셀 출력
          </SecondaryButton>
        </div>
      </div>

      <ProductionKpiPanel
        title={PRODUCTION_DAILY_STATUS_PANEL.title}
        titleIcon={PRODUCTION_DAILY_STATUS_PANEL.titleIcon}
        cards={dailyStatusCards}
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
              <span className="titan-advanced-search__label">승인상태</span>
              <select
                className="titan-search-panel__select"
                value={draft.approvalStatus}
                onChange={(e) => setDraft({ ...draft, approvalStatus: e.target.value })}
              >
                <option value="">전체</option>
                {APPROVAL_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>
        }
      />

      <div className="inbound-page__workspace production-page__workspace">
        <div className="production-page__list-column">
          <div className="production-page__table-area">
            <div className="production-page__list-header">
              <h3>생산일보 목록 (총 {totalCount}건)</h3>
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
              emptyMessage="표시할 생산일보가 없습니다."
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
        </div>

        {activeRow ? (
          <TitanDetailPanel
            actionLabel={PRODUCTION_DAILY_PRINT_LABEL}
            actionIcon={Printer}
            onAction={openDailyPrintPreview}
            processFlowSteps={processFlowSteps}
            detailContent={
              <dl className="inbound-detail">
                <div>
                  <dt>작업지시서</dt>
                  <dd>{activeRow.record.htlNo || "—"}</dd>
                </div>
                <div>
                  <dt>입고일</dt>
                  <dd>{activeRow.record.incomingDate || "—"}</dd>
                </div>
                <div>
                  <dt>관리번호</dt>
                  <dd>{activeRow.managementId}</dd>
                </div>
                <div>
                  <dt>LOT.NO</dt>
                  <dd>{activeRow.lotNo}</dd>
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
                  <dt>입고수량</dt>
                  <dd>{activeRow.qty}</dd>
                </div>
                <div>
                  <dt>현재상태</dt>
                  <dd>
                    <StatusChip variant={activeRow.statusVariant}>{activeRow.statusLabel}</StatusChip>
                  </dd>
                </div>
                <div>
                  <dt>등록자</dt>
                  <dd>{activeRow.record.registrar ?? "관리자"}</dd>
                </div>
                <div>
                  <dt>등록일시</dt>
                  <dd>{formatProductionDailyReportDateTime(activeRow.record)}</dd>
                </div>
                <div>
                  <dt>수정일시</dt>
                  <dd>{activeRow.record.updatedAt ?? formatProductionDailyReportDateTime(activeRow.record)}</dd>
                </div>
                <div>
                  <dt>비고</dt>
                  <dd>{activeRow.record.note || "—"}</dd>
                </div>
              </dl>
            }
          />
        ) : null}
      </div>

      <DailyProductionReportRegisterModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onRegister={handleRegister}
      />

      <TitanPrintPreviewModal
        open={dailyPrintOpen}
        onClose={() => setDailyPrintOpen(false)}
        title={`${dailyPrintMeta?.label ?? "생산일보"} 출력 미리보기`}
        onPrint={handleDailyPrint}
        onPdf={handleDailyPdf}
        busy={dailyPrintBusy}
      >
        {dailyPrintProps ? <ProductionDailyReportPrint {...dailyPrintProps} /> : null}
      </TitanPrintPreviewModal>
    </div>
  );
}
