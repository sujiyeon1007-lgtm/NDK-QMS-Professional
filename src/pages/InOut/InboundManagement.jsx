import { useCallback, useMemo, useState } from "react";
import { FileSpreadsheet, Plus, Printer } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import Input from "../../foundation/components/Input";
import StatusChip from "../../foundation/components/StatusChip";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanSearchPanel, { useSearchSuggestionHelpers } from "../../foundation/components/TitanSearchPanel";
import {
  DateRangeField,
  LotNoField,
  ManagementIdField,
  ManagerField,
  NoteField,
  ProcessField,
  StatusSelectField,
} from "../../foundation/components/TitanSearchAdvancedFields";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import TitanKpiBarSlot from "../../foundation/components/TitanKpiBarSlot";
import TitanWorkflowStatusChipBar from "../../foundation/components/TitanWorkflowStatusChipBar";
import { useStatusChipFilter } from "../../foundation/hooks/useStatusChipFilter";
import TitanDetailPanel from "../../foundation/components/TitanDetailPanel";
import { INBOUND_KPI_CONFIG } from "../../config/inboundDashboard";
import InOutListPrintPreviewModal from "../../components/print/InOutListPrintPreviewModal";
import { TITAN_PRINT_DOCUMENT_TYPES } from "../../config/titanPrintDocuments";
import { createEmptyInboundSearch, matchesBasicSearch } from "../../config/listSearchStandard";
import { buildStandardProductListColumns } from "../../config/standardProductList";
import { getProductionProcessCodes, getProductionProcessName } from "../../config/productionProcessCodes";
import { getHeatTreatmentProcessTone } from "../../config/heatTreatmentProcessColors";
import { useTitanListSearch } from "../../foundation/hooks/useTitanListSearch";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import { getMasterDataByCategory } from "../../utils/masterData";
import { addSessionProductionRecord, getSessionProductionRecords } from "../../utils/productionRecords";
import {
  INBOUND_REGISTER_LABEL,
  INBOUND_PRINT_LIST_LABEL,
} from "../../config/registerModalStandard";
import { parseQtyWithUnit } from "../../utils/productUnits";
import { getJournalReferenceDate } from "../../utils/workJournalData";
import { isIncomingRegistered } from "../../utils/productionRecords";
import { buildInOutListPrintProps } from "../../utils/inOutListPrintRows";
import { formatMultiSelectCompany } from "../../utils/selectionDisplay";
import IncomingRegistrationModal from "../Incoming/IncomingRegistrationModal";
import {
  INBOUND_STATUS_LABELS,
  filterInboundManagementRecords,
  getInboundManagementStatus,
  isInboundShipOutComplete,
} from "../../utils/inboundManagementStatus";
import { getProcessFlowSteps, mapStandardProductListRow } from "../../utils/processFlow";
import { applyHtlWorkListPrinted } from "../../utils/titanWorkflowStatus";
import SectionPageActions from "../../foundation/layout/SectionPageActions";
import "./InboundManagement.css";

const INBOUND_STATUS_OPTIONS = Object.values(INBOUND_STATUS_LABELS);

function mapInboundListRow(record) {
  if (isInboundShipOutComplete(record)) {
    return mapStandardProductListRow(record, { label: "출고완료", variant: "complete" });
  }
  return mapStandardProductListRow(record, getInboundManagementStatus(record));
}

function resolveInboundListRecords(search) {
  const all = getSessionProductionRecords();
  if (search.__chipProductShipDone) {
    return all.filter((record) => isIncomingRegistered(record) && isInboundShipOutComplete(record));
  }
  return filterInboundManagementRecords(all);
}

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
  if (search.__chipProductShipWait && row.statusLabel !== INBOUND_STATUS_LABELS.SHIP_WAIT) {
    return false;
  }
  if (search.__chipProductShipDone && row.statusLabel !== "출고완료") {
    return false;
  }
  if (search.note && !String(record.note ?? "").includes(search.note)) return false;
  return true;
}

export default function InboundManagement() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerInitialForm, setRegisterInitialForm] = useState(null);
  const { search, draft, onDraftChange, onSearch, onReset, advancedOpen, onAdvancedToggle } =
    useTitanListSearch(createEmptyInboundSearch, { storageKey: "inbound" });
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [inOutPrintOpen, setInOutPrintOpen] = useState(false);
  const chipRecords = useMemo(
    () => filterInboundManagementRecords(getSessionProductionRecords()),
    [refreshKey]
  );
  const { activeChipId, handleChipClick } = useStatusChipFilter({
    draft,
    onDraftChange,
    onReset,
  });

  const companies = useMemo(() => getMasterDataByCategory("companies"), []);
  const processCodes = useMemo(() => getProductionProcessCodes(), []);
  const searchRecords = useMemo(
    () => filterInboundManagementRecords(getSessionProductionRecords()),
    [refreshKey]
  );
  const masterProducts = useMemo(() => getMasterDataByCategory("products"), [refreshKey]);
  const { getSuggestions } = useSearchSuggestionHelpers(searchRecords, {
    process: processCodes.map((item) => item.name),
    company: companies.map((item) => item.name),
    partNo: masterProducts.map((item) => item.partNo).filter(Boolean),
    partName: masterProducts.map((item) => item.name).filter(Boolean),
    material: getMasterDataByCategory("materials").map((item) => item.name),
  });

  const rows = useMemo(() => {
    const records = resolveInboundListRecords(search);
    return records
      .map((record) => mapInboundListRow(record))
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

  const sessionRecords = useMemo(() => getSessionProductionRecords(), [refreshKey]);

  const inOutPrintProps = useMemo(
    () =>
      printTargetRows.length > 0
        ? buildInOutListPrintProps(printTargetRows, {
            listNoPrefix: "HTL",
            workDate: getJournalReferenceDate(),
            records: sessionRecords,
          })
        : null,
    [printTargetRows, sessionRecords]
  );

  const handleInOutPrinted = useCallback(
    (printProps) => {
      if (!printProps?.listNo || printTargetRows.length === 0) return;
      const managementIds = printTargetRows.map((row) => row.managementId ?? row.id);
      applyHtlWorkListPrinted(managementIds, printProps.listNo);
      setRefreshKey((key) => key + 1);
    },
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
            <StatusChip kind="process" variant={getHeatTreatmentProcessTone(row.processName)}>
              {row.processName}
            </StatusChip>
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

  const openRegisterModal = () => {
    setRegisterInitialForm(null);
    setRegisterOpen(true);
  };

  const handleRowDoubleClick = (row) => {
    const record = row.record;
    if (!record) return;
    setRegisterInitialForm({
      company: record.company || "",
      partName: record.partName || "",
      partNo: record.partNo || "",
      drawingNo: record.drawingNo || "",
      material: record.material || "",
      spec: record.spec || "",
      unitPrice: record.unitPrice != null ? String(record.unitPrice) : "",
      heatTreatment: record.heatTreatment || "",
      qty: record.qty != null ? String(record.qty) : "",
      unit: record.unit || "EA",
      dueDate: record.dueDate || "",
      urgent: record.urgent ?? false,
      note: record.note || "",
    });
    setRegisterOpen(true);
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
      spec: form.spec || "",
      unitPrice: form.unitPrice ? Number(String(form.unitPrice).replace(/,/g, "")) || null : null,
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
      completionStatus: "",
      workflowStatus: "",
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
      <SectionPageActions>
        <PrimaryButton type="button" onClick={openRegisterModal}>
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
      </SectionPageActions>

      <TitanKpiBarSlot ariaLabel={INBOUND_KPI_CONFIG.ariaLabel} className="inbound-page__kpi">
        <TitanWorkflowStatusChipBar
          chipSetId={INBOUND_KPI_CONFIG.chipSetId}
          records={chipRecords}
          activeId={activeChipId}
          onChipClick={handleChipClick}
          ariaLabel={INBOUND_KPI_CONFIG.ariaLabel}
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
            <DateRangeField
              label="입고일"
              fromKey="incomingDateFrom"
              toKey="incomingDateTo"
              draft={draft}
              onDraftChange={onDraftChange}
            />
            <ManagementIdField draft={draft} onDraftChange={onDraftChange} getSuggestions={getSuggestions} />
            <LotNoField draft={draft} onDraftChange={onDraftChange} getSuggestions={getSuggestions} />
            <ProcessField draft={draft} onDraftChange={onDraftChange} getSuggestions={getSuggestions} />
            <label className="titan-advanced-search__field">
              <span className="titan-advanced-search__label">수량</span>
              <Input
                value={draft.qty}
                onChange={(e) => onDraftChange({ ...draft, qty: e.target.value })}
                placeholder="수량"
              />
            </label>
            <ManagerField draft={draft} onDraftChange={onDraftChange} getSuggestions={getSuggestions} />
            <StatusSelectField
              label="상태"
              value={draft.status}
              onChange={(e) => onDraftChange({ ...draft, status: e.target.value })}
              options={INBOUND_STATUS_OPTIONS}
            />
            <NoteField draft={draft} onDraftChange={onDraftChange} getSuggestions={getSuggestions} />
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
            onRowDoubleClick={handleRowDoubleClick}
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
                      <StatusChip kind="process" variant={getHeatTreatmentProcessTone(activeRow.processName)}>
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
          initialForm={registerInitialForm}
          onClose={() => {
            setRegisterOpen(false);
            setRegisterInitialForm(null);
          }}
          onRegister={handleInboundRegister}
        />
      ) : null}

      <InOutListPrintPreviewModal
        open={inOutPrintOpen}
        onClose={() => setInOutPrintOpen(false)}
        documentType={TITAN_PRINT_DOCUMENT_TYPES.INBOUND_LIST}
        printProps={inOutPrintProps}
        onAfterPrint={handleInOutPrinted}
      />
    </div>
  );
}
