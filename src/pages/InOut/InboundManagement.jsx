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
import { TITAN_PRINT_DOCUMENT_TYPES } from "../../config/titanPrintDocuments";
import { createEmptyInboundSearch, matchesBasicSearch } from "../../config/listSearchStandard";
import { buildStandardProductListColumns } from "../../config/standardProductList";
import {
  getProcessChipVariant,
  getProductionProcessCodes,
  getProductionProcessName,
} from "../../config/productionProcessCodes";
import { useAdvancedSearchOpen } from "../../foundation/hooks/useAdvancedSearchOpen";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import { getMasterDataByCategory } from "../../utils/masterData";
import { addSessionProductionRecord, getSessionProductionRecords } from "../../utils/productionRecords";
import {
  INBOUND_REGISTER_LABEL,
  INBOUND_PRINT_LIST_LABEL,
} from "../../config/registerModalStandard";
import { parseQtyWithUnit } from "../../utils/productUnits";
import { getJournalReferenceDate } from "../../utils/workJournalData";
import { buildInOutListPrintProps } from "../../utils/inOutListPrintRows";
import IncomingRegistrationModal from "../Incoming/IncomingRegistrationModal";
import {
  INBOUND_STATUS_LABELS,
  filterInboundManagementRecords,
  getInboundManagementStatus,
} from "../../utils/inboundManagementStatus";
import { formatMultiSelectCompany } from "../../utils/selectionDisplay";
import { getProcessFlowSteps, mapStandardProductListRow } from "../../utils/processFlow";
import "./InboundManagement.css";

const EMPTY_SEARCH = createEmptyInboundSearch();
const INBOUND_STATUS_OPTIONS = Object.values(INBOUND_STATUS_LABELS);

function matchesInboundSearch(record, row, search) {
  if (!matchesBasicSearch(search, record)) return false;
  if (search.managementId && !record.id.toLowerCase().includes(search.managementId.toLowerCase())) {
    return false;
  }
  if (search.incomingDateFrom && record.incomingDate < search.incomingDateFrom) return false;
  if (search.incomingDateTo && record.incomingDate > search.incomingDateTo) return false;
  if (
    search.lotNo &&
    !String(record.lotNo ?? "")
      .toLowerCase()
      .includes(search.lotNo.toLowerCase())
  ) {
    return false;
  }
  if (search.qty && !String(record.qty).includes(search.qty)) return false;
  if (search.process && getProductionProcessName(record) !== search.process) return false;
  const manager = record.registrar ?? "관리자";
  if (search.manager && !manager.includes(search.manager)) return false;
  if (search.status && row.statusLabel !== search.status) return false;
  if (search.note && !String(record.note ?? "").includes(search.note)) return false;
  return true;
}

export default function InboundManagement() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [search, setSearch] = useState(EMPTY_SEARCH);
  const [draft, setDraft] = useState(EMPTY_SEARCH);
  const [advancedOpen, toggleAdvanced] = useAdvancedSearchOpen("titan-inbound-advanced");
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [inOutPrintOpen, setInOutPrintOpen] = useState(false);

  const companies = useMemo(() => getMasterDataByCategory("companies"), []);
  const processCodes = useMemo(() => getProductionProcessCodes(), []);

  const rows = useMemo(() => {
    const records = filterInboundManagementRecords(getSessionProductionRecords());
    return records
      .map((record) => mapStandardProductListRow(record, getInboundManagementStatus(record)))
      .filter((row) => matchesInboundSearch(row.record, row, search))
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
  const selectedQty = selectedRows.reduce((sum, row) => sum + (Number(row.record.qty) || 0), 0);

  const printTargetRows = useMemo(() => {
    if (selectedRows.length > 0) return selectedRows;
    if (activeRow) return [activeRow];
    return [];
  }, [selectedRows, activeRow]);

  const inOutPrintProps = useMemo(
    () =>
      printTargetRows.length > 0
        ? buildInOutListPrintProps(printTargetRows, {
            listNoPrefix: "HTL",
            workDate: getJournalReferenceDate(),
          })
        : null,
    [printTargetRows]
  );

  const openInOutPrintPreview = () => {
    if (printTargetRows.length === 0) return;
    setInOutPrintOpen(true);
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

  const detailRows = selectedRows.length > 0 ? selectedRows : activeRow ? [activeRow] : [];
  const companySummary = formatMultiSelectCompany(detailRows);
  const processFlowSteps = activeRow
    ? getProcessFlowSteps(activeRow.record, activeRow.statusLabel)
    : [];

  const handleSearch = () => setSearch({ ...draft });
  const handleReset = () => {
    setDraft(EMPTY_SEARCH);
    setSearch(EMPTY_SEARCH);
  };

  const handleInboundRegister = (form, managementId) => {
    const parsed = parseQtyWithUnit(form.qty, form.unit);
    const today = getJournalReferenceDate();

    addSessionProductionRecord({
      id: managementId,
      company: form.company,
      partName: form.partName,
      partNo: form.partNo,
      drawingNo: form.drawingNo,
      material: form.material,
      qty: Number(parsed.qty) || 0,
      unit: parsed.unit,
      incomingDate: today,
      dueDate: form.dueDate || today,
      heatTreatment: form.heatTreatment,
      note: form.note,
      urgent: form.urgent,
      htlNo: "",
      lotNo: "",
      equipment: "",
      workDate: "",
      completionStatus: "작업대기",
      registered: false,
      qrGenerated: false,
      workSheetGenerated: false,
      certificateStatus: "미발행",
      shipmentStatus: "출고대기",
      shippedQty: 0,
    });

    setActiveId(managementId);
    setRefreshKey((k) => k + 1);
    setPage(1);
  };

  return (
    <div className="inbound-page">
      <div className="inbound-page__toolbar">
        <h2 className="inbound-page__title">입고관리</h2>
        <div className="inbound-page__actions">
          <PrimaryButton type="button" onClick={() => setRegisterOpen(true)}>
            <Plus size={14} aria-hidden="true" />
            {INBOUND_REGISTER_LABEL}
          </PrimaryButton>
          <SecondaryButton type="button" onClick={openInOutPrintPreview} disabled={printTargetRows.length === 0}>
            <Printer size={14} aria-hidden="true" />
            {INBOUND_PRINT_LIST_LABEL}
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
              <span className="titan-advanced-search__label">입고일</span>
              <div className="titan-advanced-search__date-range">
                <Input
                  type="date"
                  value={draft.incomingDateFrom}
                  onChange={(e) => setDraft({ ...draft, incomingDateFrom: e.target.value })}
                />
                <span>~</span>
                <Input
                  type="date"
                  value={draft.incomingDateTo}
                  onChange={(e) => setDraft({ ...draft, incomingDateTo: e.target.value })}
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
                {INBOUND_STATUS_OPTIONS.map((status) => (
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
                선택된 품목: <strong>{selectedIds.length}건</strong> | 총 수량:{" "}
                <strong>{selectedQty} EA</strong>
              </span>
              <div>
                <SecondaryButton type="button" onClick={openInOutPrintPreview}>
                  {INBOUND_PRINT_LIST_LABEL}
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
            emptyMessage="진행 중인 입고 제품이 없습니다. (출고완료 제품은 이력조회에서 확인)"
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
            actionLabel={INBOUND_PRINT_LIST_LABEL}
            actionIcon={Printer}
            onAction={openInOutPrintPreview}
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
                  <dt>입고수량</dt>
                  <dd>{activeRow.qty}</dd>
                </div>
                <div>
                  <dt>납기</dt>
                  <dd>{activeRow.record.dueDate || "—"}</dd>
                </div>
                <div>
                  <dt>현재상태</dt>
                  <dd>
                    <StatusChip variant={activeRow.statusVariant}>{activeRow.statusLabel}</StatusChip>
                  </dd>
                </div>
              </dl>
            }
          />
        ) : null}
      </div>

      {registerOpen ? (
        <IncomingRegistrationModal
          onClose={() => setRegisterOpen(false)}
          onRegister={handleInboundRegister}
        />
      ) : null}

      <InOutListPrintPreviewModal
        open={inOutPrintOpen}
        onClose={() => setInOutPrintOpen(false)}
        documentType={TITAN_PRINT_DOCUMENT_TYPES.INBOUND_LIST}
        printProps={inOutPrintProps}
      />
    </div>
  );
}
