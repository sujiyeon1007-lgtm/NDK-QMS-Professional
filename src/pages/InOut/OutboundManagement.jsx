import { useMemo, useState } from "react";
import { FileSpreadsheet, Plus, Printer } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import Input from "../../foundation/components/Input";
import StatusChip from "../../foundation/components/StatusChip";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanSearchPanel from "../../foundation/components/TitanSearchPanel";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import TitanDetailPanel from "../../foundation/components/TitanDetailPanel";
import InOutListPrintPreviewModal from "../../components/print/InOutListPrintPreviewModal";
import TitanPrintPreviewModal from "../../components/print/TitanPrintPreviewModal";
import TransactionStatementPrintDocument from "../../components/print/TransactionStatementPrintDocument";
import { TITAN_PRINT_DOCUMENT_TYPES } from "../../config/titanPrintDocuments";
import { createEmptyOutboundSearch, matchesBasicSearch } from "../../config/listSearchStandard";
import { buildStandardProductListColumns } from "../../config/standardProductList";
import {
  getProcessChipVariant,
  getProductionProcessCodes,
  getProductionProcessName,
} from "../../config/productionProcessCodes";
import { useAdvancedSearchOpen } from "../../foundation/hooks/useAdvancedSearchOpen";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import { getMasterDataByCategory } from "../../utils/masterData";
import { getSessionProductionRecords } from "../../utils/productionRecords";
import {
  OUTBOUND_STATUS_LABELS,
  filterOutboundManagementRecords,
  getOutboundManagementStatus,
  getOutboundManager,
  getOutboundShipDate,
  getOutboundShipQty,
} from "../../utils/outboundManagementStatus";
import { formatMultiSelectCompany } from "../../utils/selectionDisplay";
import { getProcessFlowSteps, mapStandardProductListRow } from "../../utils/processFlow";
import { OUTBOUND_REGISTER_LABEL, OUTBOUND_LIST_LABEL, OUTBOUND_STATEMENT_LABEL } from "../../config/registerModalStandard";
import { buildInOutListPrintProps } from "../../utils/inOutListPrintRows";
import { getJournalReferenceDate } from "../../utils/workJournalData";
import { buildTransactionStatementPrintProps } from "../../utils/titanPrintPreviewHelpers";
import { exportTitanPdf, printTitanDocument } from "../../utils/titanPrintExport";
import OutboundRegisterModal, { applyOutboundRegister } from "./OutboundRegisterModal";
import "./InboundManagement.css";

const EMPTY_SEARCH = createEmptyOutboundSearch();
const OUTBOUND_STATUS_OPTIONS = Object.values(OUTBOUND_STATUS_LABELS);

function matchesOutboundSearch(record, row, search) {
  if (!matchesBasicSearch(search, record)) return false;
  if (search.managementId && !record.id.toLowerCase().includes(search.managementId.toLowerCase())) {
    return false;
  }
  if (search.qty && !String(row.qty).includes(search.qty)) return false;
  if (search.process && getProductionProcessName(record) !== search.process) return false;
  if (
    search.lotNo &&
    !String(record.lotNo ?? "")
      .toLowerCase()
      .includes(search.lotNo.toLowerCase())
  ) {
    return false;
  }
  if (search.manager && !row.manager.includes(search.manager)) return false;
  if (search.status && row.statusLabel !== search.status) return false;
  if (search.note && !String(record.note ?? "").includes(search.note)) return false;
  const shipDate = getOutboundShipDate(record);
  if (search.shipDateFrom && shipDate < search.shipDateFrom) return false;
  if (search.shipDateTo && shipDate > search.shipDateTo) return false;
  return true;
}

export default function OutboundManagement() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [search, setSearch] = useState(EMPTY_SEARCH);
  const [draft, setDraft] = useState(EMPTY_SEARCH);
  const [advancedOpen, toggleAdvanced] = useAdvancedSearchOpen("titan-outbound-advanced");
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [outboundListPrintOpen, setOutboundListPrintOpen] = useState(false);
  const [statementPrintOpen, setStatementPrintOpen] = useState(false);
  const [statementPrintBusy, setStatementPrintBusy] = useState(false);

  const companies = useMemo(() => getMasterDataByCategory("companies"), []);
  const processCodes = useMemo(() => getProductionProcessCodes(), []);

  const rows = useMemo(() => {
    const records = filterOutboundManagementRecords(getSessionProductionRecords());
    return records
      .map((record) => {
        const status = getOutboundManagementStatus(record);
        const base = mapStandardProductListRow(record, status);
        return {
          ...base,
          qty: getOutboundShipQty(record),
          workDate: getOutboundShipDate(record),
          manager: getOutboundManager(record),
        };
      })
      .filter((row) => matchesOutboundSearch(row.record, row, search))
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

  const detailRows = selectedRows.length > 0 ? selectedRows : activeRow ? [activeRow] : [];
  const companySummary = formatMultiSelectCompany(detailRows);
  const processFlowSteps = activeRow
    ? getProcessFlowSteps(activeRow.record, activeRow.statusLabel)
    : [];

  const printTargetRows = useMemo(() => {
    if (selectedRows.length > 0) return selectedRows;
    if (activeRow) return [activeRow];
    return [];
  }, [selectedRows, activeRow]);

  const outboundListPrintProps = useMemo(
    () =>
      printTargetRows.length > 0
        ? buildInOutListPrintProps(printTargetRows, {
            listNoPrefix: "OUT",
            workDate: getJournalReferenceDate(),
          })
        : null,
    [printTargetRows]
  );

  const statementPrintProps = useMemo(() => {
    const targetRecord = printTargetRows[0]?.record ?? null;
    return buildTransactionStatementPrintProps(targetRecord);
  }, [printTargetRows]);

  const openOutboundListPrintPreview = () => {
    if (printTargetRows.length === 0) return;
    setOutboundListPrintOpen(true);
  };

  const openStatementPrintPreview = () => {
    if (!statementPrintProps) return;
    setStatementPrintOpen(true);
  };

  const handleStatementPrint = async (documentEl) => {
    setStatementPrintBusy(true);
    try {
      await printTitanDocument(documentEl);
    } finally {
      setStatementPrintBusy(false);
    }
  };

  const handleStatementPdf = async (documentEl) => {
    setStatementPrintBusy(true);
    try {
      const id = statementPrintProps?.record?.id ?? "statement";
      await exportTitanPdf(documentEl, `transaction-statement-${id}.pdf`);
    } finally {
      setStatementPrintBusy(false);
    }
  };

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

  const handleSearch = () => setSearch({ ...draft });
  const handleReset = () => {
    setDraft(EMPTY_SEARCH);
    setSearch(EMPTY_SEARCH);
  };

  const handleOutboundRegister = (form) => {
    const managementId = applyOutboundRegister(form);
    if (!managementId) return;
    setActiveId(managementId);
    setRefreshKey((k) => k + 1);
    setPage(1);
  };

  return (
    <div className="inbound-page">
      <div className="inbound-page__toolbar">
        <h2 className="inbound-page__title">출고관리</h2>
        <div className="inbound-page__actions">
          <PrimaryButton type="button" onClick={() => setRegisterOpen(true)}>
            <Plus size={14} aria-hidden="true" />
            {OUTBOUND_REGISTER_LABEL}
          </PrimaryButton>
          <SecondaryButton type="button" onClick={openOutboundListPrintPreview} disabled={printTargetRows.length === 0}>
            <Printer size={14} aria-hidden="true" />
            {OUTBOUND_LIST_LABEL}
          </SecondaryButton>
          <SecondaryButton type="button" onClick={openStatementPrintPreview} disabled={!statementPrintProps}>
            <Printer size={14} aria-hidden="true" />
            {OUTBOUND_STATEMENT_LABEL}
          </SecondaryButton>
          <SecondaryButton type="button">
            <FileSpreadsheet size={14} aria-hidden="true" />
            엑셀 출력
          </SecondaryButton>
        </div>
      </div>

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
              <span className="titan-advanced-search__label">출고일</span>
              <div className="titan-advanced-search__date-range">
                <Input
                  type="date"
                  value={draft.shipDateFrom}
                  onChange={(e) => setDraft({ ...draft, shipDateFrom: e.target.value })}
                />
                <span>~</span>
                <Input
                  type="date"
                  value={draft.shipDateTo}
                  onChange={(e) => setDraft({ ...draft, shipDateTo: e.target.value })}
                />
              </div>
            </label>
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
              <span className="titan-advanced-search__label">수량</span>
              <Input
                value={draft.qty}
                onChange={(e) => setDraft({ ...draft, qty: e.target.value })}
                placeholder="수량"
              />
            </label>
            <label className="titan-advanced-search__field">
              <span className="titan-advanced-search__label">담당자</span>
              <Input
                value={draft.manager}
                onChange={(e) => setDraft({ ...draft, manager: e.target.value })}
                placeholder="담당자"
              />
            </label>
            <label className="titan-advanced-search__field">
              <span className="titan-advanced-search__label">상태</span>
              <select
                className="titan-search-panel__select"
                value={draft.status}
                onChange={(e) => setDraft({ ...draft, status: e.target.value })}
              >
                <option value="">전체</option>
                {OUTBOUND_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <label className="titan-advanced-search__field">
              <span className="titan-advanced-search__label">비고</span>
              <Input
                value={draft.note}
                onChange={(e) => setDraft({ ...draft, note: e.target.value })}
                placeholder="비고"
              />
            </label>
          </div>
        }
      />

      <div className="inbound-page__workspace">
        <div className="inbound-page__list">
          {selectedIds.length > 0 ? (
            <div className="inbound-page__selection-bar">
              <span>
                선택된 품목: <strong>{selectedIds.length}건</strong>
              </span>
              <div>
                <SecondaryButton type="button" onClick={openOutboundListPrintPreview}>
                  {OUTBOUND_LIST_LABEL}
                </SecondaryButton>
                <SecondaryButton type="button" onClick={openStatementPrintPreview} disabled={!statementPrintProps}>
                  {OUTBOUND_STATEMENT_LABEL}
                </SecondaryButton>
                <SecondaryButton type="button" onClick={() => setSelectedIds([])}>
                  선택 해제
                </SecondaryButton>
              </div>
            </div>
          ) : null}

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
            emptyMessage="출고 가능한 제품이 없습니다."
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
            actionLabel={OUTBOUND_STATEMENT_LABEL}
            actionIcon={Printer}
            onAction={openStatementPrintPreview}
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
                  <dd>{companySummary}</dd>
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
                  <dt>출고수량</dt>
                  <dd>{activeRow.qty}</dd>
                </div>
                <div>
                  <dt>출고일</dt>
                  <dd>{activeRow.workDate}</dd>
                </div>
                <div>
                  <dt>현재상태</dt>
                  <dd>
                    <StatusChip variant={activeRow.statusVariant}>{activeRow.statusLabel}</StatusChip>
                  </dd>
                </div>
                <div>
                  <dt>담당자</dt>
                  <dd>{activeRow.manager}</dd>
                </div>
              </dl>
            }
          />
        ) : null}
      </div>

      <OutboundRegisterModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onRegister={handleOutboundRegister}
      />

      <InOutListPrintPreviewModal
        open={outboundListPrintOpen}
        onClose={() => setOutboundListPrintOpen(false)}
        documentType={TITAN_PRINT_DOCUMENT_TYPES.OUTBOUND_LIST}
        printProps={outboundListPrintProps}
      />

      <TitanPrintPreviewModal
        open={statementPrintOpen}
        onClose={() => setStatementPrintOpen(false)}
        title="거래명세서 출력 미리보기"
        onPrint={handleStatementPrint}
        onPdf={handleStatementPdf}
        busy={statementPrintBusy}
      >
        {statementPrintProps ? <TransactionStatementPrintDocument {...statementPrintProps} /> : null}
      </TitanPrintPreviewModal>
    </div>
  );
}
