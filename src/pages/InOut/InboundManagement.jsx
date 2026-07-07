import { useCallback, useMemo, useState } from "react";
import { FileSpreadsheet, Plus, Printer } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import StatusChip from "../../foundation/components/StatusChip";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanSearchPanel, {
  useSearchSuggestionHelpers,
} from "../../foundation/components/TitanSearchPanel";
import TitanStandardProductAdvancedSearch from "../../foundation/components/TitanStandardProductAdvancedSearch";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import TitanKpiBarSlot from "../../foundation/components/TitanKpiBarSlot";
import TitanWorkflowStatusChipBar from "../../foundation/components/TitanWorkflowStatusChipBar";
import { useStatusChipFilter } from "../../foundation/hooks/useStatusChipFilter";
import InboundRowActions from "./InboundRowActions";
import InboundDetailPopup from "./InboundDetailPopup";
import { INBOUND_KPI_CONFIG } from "../../config/inboundDashboard";
import InOutListPrintPreviewModal from "../../components/print/InOutListPrintPreviewModal";
import { TITAN_PRINT_DOCUMENT_TYPES } from "../../config/titanPrintDocuments";
import { createEmptyInboundSearch, STANDARD_PRODUCT_BASIC_SEARCH_FIELDS, matchesBasicSearch } from "../../config/listSearchStandard";
import { buildInboundListColumns } from "../../config/standardProductList";
import { matchesInboundDataSearch } from "../../utils/inboundDataFields";
import { getProductionProcessCodes, getProductionProcessName } from "../../config/productionProcessCodes";
import { renderWorkflowProcessChip } from "../../utils/workflowProcessChip";
import { useTitanListSearch } from "../../foundation/hooks/useTitanListSearch";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import { getMasterDataByCategory } from "../../utils/masterData";
import { addSessionProductionRecord, deleteSessionProductionRecord, getSessionProductionRecords, updateSessionProductionRecord } from "../../utils/productionRecords";
import {
  INBOUND_EDIT_LABEL,
  INBOUND_REGISTER_LABEL,
  INBOUND_PRINT_LIST_LABEL,
  INBOUND_LIST_PRINT_TOOLBAR_LABEL,
} from "../../config/registerModalStandard";
import { parseQtyWithUnit } from "../../utils/productUnits";
import { getJournalReferenceDate } from "../../utils/workJournalData";
import { buildInOutListPrintProps } from "../../utils/inOutListPrintRows";
import { getPrintOutputDate } from "../../utils/titanPrintDates";
import { appendWorkJournalAutoEntry } from "../../utils/workJournalAutoRecord";
import { WORK_JOURNAL_ACTION_TYPES } from "../../config/titanAssigneePolicy";
import IncomingRegistrationModal from "../Incoming/IncomingRegistrationModal";
import {
  INBOUND_STATUS_LABELS,
  getInboundManagementStatus,
  isInboundShipOutComplete,
} from "../../utils/inboundManagementStatus";
import { buildIncomingTaskWorkspaceRecords, getOperationsRecords } from "../../utils/operationsWorkspaceData";
import { mapV13ProductListRow } from "../../utils/processFlow";
import { isHtlFirstPrintTarget } from "../../utils/htlPrintEligibility";
import { openRowDetailPopup } from "../../foundation/utils/openRowDetailPopup";
import SectionPageActions from "../../foundation/layout/SectionPageActions";
import {
  applyInboundListPrinted,
  confirmInboundListReprint,
  hasInboundCheckboxSelection,
  INBOUND_PRINT_NO_SELECTION_MESSAGE,
  resolveInboundCheckboxPrintRows,
  resolveInboundPrintMode,
  selectedInboundRowsHaveLotNumber,
} from "./inboundListPrintActions";
import "./InboundManagement.css";

const INBOUND_STATUS_OPTIONS = Object.values(INBOUND_STATUS_LABELS);

function mapInboundListRow(record) {
  const status = isInboundShipOutComplete(record)
    ? { label: "출고완료", variant: "complete" }
    : getInboundManagementStatus(record);
  const base = mapV13ProductListRow(record, status, { screenKey: "inbound" });
  return {
    ...base,
    managerName: record.registrar ?? record.manager ?? "—",
  };
}

function recordToRegisterForm(record) {
  if (!record) return null;
  return {
    company: record.company || "",
    manager: record.registrar ?? record.manager ?? "",
    partName: record.partName || "",
    partNo: record.partNo || "",
    drawingNo: record.drawingNo || "",
    material: record.material || "",
    spec: record.spec || "",
    unitPrice: record.unitPrice != null ? String(record.unitPrice) : "",
    heatTreatment: record.heatTreatment || "",
    lotNo: record.lotNo || "",
    customerLotNo: record.customerLotNo || "",
    purchaseOrderNo: record.purchaseOrderNo || "",
    incomingDate: record.incomingDate || "",
    qty: record.qty != null ? String(record.qty) : "",
    unit: record.unit || "EA",
    dueDate: record.dueDate || "",
    urgent: record.urgent ?? false,
    note: record.note || "",
  };
}

function resolveInboundListRecords() {
  // 입고등록 Task Workspace — RECEIVED · 생산 미투입 Stage만 (생산계획 투입 시 자동 제거)
  return buildIncomingTaskWorkspaceRecords();
}

function matchesInboundSearch(record, row, search) {
  if (!matchesBasicSearch(search, record)) return false;
  if (!matchesInboundDataSearch(search, record)) return false;
  if (search.productionDateFrom) {
    const prodDate = record.workDate || record.productionCompleteDate || "";
    if (prodDate && prodDate < search.productionDateFrom) return false;
  }
  if (search.productionDateTo) {
    const prodDate = record.workDate || record.productionCompleteDate || "";
    if (prodDate && prodDate > search.productionDateTo) return false;
  }
  if (search.incomingDateFrom && record.incomingDate < search.incomingDateFrom) return false;
  if (search.incomingDateTo && record.incomingDate > search.incomingDateTo) return false;
  if (search.dueDateFrom && record.dueDate && record.dueDate < search.dueDateFrom) return false;
  if (search.dueDateTo && record.dueDate && record.dueDate > search.dueDateTo) return false;
  if (search.qty && !String(record.qty).includes(search.qty)) return false;
  if (search.process && getProductionProcessName(record) !== search.process) return false;
  const manager = record.registrar ?? record.manager ?? "";
  if (search.manager && !manager.includes(search.manager)) return false;
  if (search.status && row.statusLabel !== search.status) return false;
  if (search.__chipProductHtlNotPrinted && !isHtlFirstPrintTarget(record)) {
    return false;
  }
  if (search.__chipProductShipWait && row.statusLabel !== INBOUND_STATUS_LABELS.PRODUCT_SHIP_WAIT) {
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
  const [registerMode, setRegisterMode] = useState("create");
  const [editRecordId, setEditRecordId] = useState(null);
  const [registerInitialForm, setRegisterInitialForm] = useState(null);
  const { search, draft, onDraftChange, onSearch, onReset, advancedOpen, onAdvancedToggle } =
    useTitanListSearch(createEmptyInboundSearch, { storageKey: "inbound" });
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [detailPopupRow, setDetailPopupRow] = useState(null);
  const [inOutPrintSession, setInOutPrintSession] = useState({ open: false, props: null });
  const chipRecords = useMemo(() => getOperationsRecords(), [refreshKey]);
  const { activeChipId, handleChipClick } = useStatusChipFilter({
    draft,
    onDraftChange,
    onReset,
  });

  const companies = useMemo(() => getMasterDataByCategory("companies"), []);
  const processCodes = useMemo(() => getProductionProcessCodes(), []);
  const searchRecords = useMemo(
    () => buildIncomingTaskWorkspaceRecords(),
    [refreshKey]
  );
  const masterProducts = useMemo(() => getMasterDataByCategory("products"), [refreshKey]);
  const { getSuggestions } = useSearchSuggestionHelpers(searchRecords, {
    process: processCodes.map((item) => item.name),
    company: companies.map((item) => item.name),
    partNo: masterProducts.map((item) => item.partNo).filter(Boolean),
    partName: masterProducts.map((item) => item.name).filter(Boolean),
    material: getMasterDataByCategory("materials").map((item) => item.name),
    manager: getMasterDataByCategory("workers").map((item) => item.name).filter(Boolean),
  });

  const rows = useMemo(() => {
    const records = resolveInboundListRecords();
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

  const activeRow = pagedRows.find((row) => row.id === activeId) ?? null;

  const hasCheckboxSelection = selectedIds.length > 0;

  const selectedRows = useMemo(
    () => resolveInboundCheckboxPrintRows(selectedIds, rows),
    [selectedIds, rows]
  );
  const selectedQty = selectedRows.reduce((sum, row) => sum + (Number(row.record.qty) || 0), 0);

  const firstSelectedRow = selectedRows[0] ?? null;

  const handleInOutPrinted = useCallback((printProps) => {
    if (!printProps?.listNo || !printProps?.rows?.length) return;
    applyInboundListPrinted(printProps.rows, printProps.listNo);
    setRefreshKey((key) => key + 1);
  }, []);

  const openInOutPrintPreview = () => {
    if (!hasInboundCheckboxSelection(selectedIds)) {
      window.alert(INBOUND_PRINT_NO_SELECTION_MESSAGE);
      return;
    }

    const printRows = resolveInboundCheckboxPrintRows(selectedIds, rows);
    if (printRows.length === 0) {
      window.alert("출력할 입고 등록 제품이 없습니다.");
      return;
    }

    if (selectedInboundRowsHaveLotNumber(printRows) && !confirmInboundListReprint()) {
      return;
    }

    setInOutPrintSession({
      open: true,
      props: buildInOutListPrintProps(printRows, {
        listNoPrefix: "HTL",
        outputDate: getPrintOutputDate(),
        records: getSessionProductionRecords(),
        printMode: resolveInboundPrintMode(printRows),
      }),
    });
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

  const handleInboundDelete = (row) => {
    const record = row?.record ?? row;
    if (!record?.id) return;
    const confirmed = window.confirm(`${record.id} 입고 건을 삭제하시겠습니까?`);
    if (!confirmed) return;
    const result = deleteSessionProductionRecord(record.id);
    if (!result.ok) {
      window.alert(result.message);
      return;
    }
    setSelectedIds((prev) => prev.filter((id) => id !== record.id));
    if (detailPopupRow?.id === record.id) setDetailPopupRow(null);
    setActiveId(null);
    setRefreshKey((k) => k + 1);
  };

  const renderProcessChip = (row) => renderWorkflowProcessChip(row);

  const columns = useMemo(
    () =>
      buildInboundListColumns({
        renderProcess: renderProcessChip,
        renderActions: (row) => (
          <InboundRowActions
            onEdit={() => openEditModal(row)}
            onDelete={() => handleInboundDelete(row)}
          />
        ),
      }),
    []
  );

  const openRegisterModal = () => {
    setRegisterMode("create");
    setEditRecordId(null);
    setRegisterInitialForm(null);
    setRegisterOpen(true);
  };

  const openEditModal = (row) => {
    const record = row?.record ?? row;
    if (!record?.id) return;
    setActiveId(record.id);
    setRegisterMode("edit");
    setEditRecordId(record.id);
    setRegisterInitialForm(recordToRegisterForm(record));
    setRegisterOpen(true);
  };

  const openDetailPopup = (row) => {
    openRowDetailPopup(row, { setActiveId, setDetailPopupRow });
  };

  const handleRowDoubleClick = (row) => {
    openDetailPopup(row);
  };

  const buildRecordPatchFromForm = (form) => {
    const parsed = parseQtyWithUnit(form.qty, form.unit);
    const today = getJournalReferenceDate();
    return {
      company: form.company,
      partName: form.partName,
      partNo: form.partNo,
      drawingNo: form.drawingNo,
      material: form.material,
      spec: form.spec || "",
      unitPrice: form.unitPrice ? Number(String(form.unitPrice).replace(/,/g, "")) || null : null,
      qty: Number(parsed.qty) || 0,
      unit: parsed.unit,
      incomingDate: form.incomingDate || today,
      dueDate: form.dueDate || today,
      lotNo: form.lotNo?.trim() || "",
      customerLotNo: form.customerLotNo?.trim() || "",
      purchaseOrderNo: form.purchaseOrderNo?.trim() || "",
      heatTreatment: form.heatTreatment,
      note: form.note,
      urgent: form.urgent,
      registrar: form.manager?.trim() || "",
      incomingRegistered: true,
    };
  };

  const handleInboundRegister = (form, managementId) => {
    addSessionProductionRecord({
      id: managementId,
      ...buildRecordPatchFromForm(form),
      htlNo: "",
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

    appendWorkJournalAutoEntry({
      actionType: WORK_JOURNAL_ACTION_TYPES.INBOUND_REGISTER,
      assignee: form.manager,
      managementId,
      company: form.company,
      lotNo: form.lotNo,
      date: form.incomingDate || getPrintOutputDate(),
      title: `입고 등록 — ${form.company} (${managementId})`,
    });

    setActiveId(managementId);
    setRefreshKey((k) => k + 1);
    setPage(1);
  };

  const handleInboundUpdate = (form, managementId) => {
    updateSessionProductionRecord(managementId, buildRecordPatchFromForm(form));
    setActiveId(managementId);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="inbound-page">
      <SectionPageActions>
        <PrimaryButton type="button" onClick={openRegisterModal}>
          <Plus size={14} aria-hidden="true" />
          {INBOUND_REGISTER_LABEL}
        </PrimaryButton>
        <SecondaryButton type="button" onClick={() => openEditModal(firstSelectedRow)} disabled={!hasCheckboxSelection}>
          {INBOUND_EDIT_LABEL}
        </SecondaryButton>
        <SecondaryButton type="button" onClick={openInOutPrintPreview} disabled={!hasCheckboxSelection}>
          <Printer size={14} aria-hidden="true" />
          {INBOUND_LIST_PRINT_TOOLBAR_LABEL}
        </SecondaryButton>
        <SecondaryButton type="button" onClick={openInOutPrintPreview} disabled={!hasCheckboxSelection}>
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
        basicFields={STANDARD_PRODUCT_BASIC_SEARCH_FIELDS}
        showStatusField
        statusFieldLabel="상태"
        extraSuggestions={{
          manager: getMasterDataByCategory("workers").map((item) => item.name).filter(Boolean),
        }}
        advancedContent={
          <TitanStandardProductAdvancedSearch
            draft={draft}
            onDraftChange={onDraftChange}
            getSuggestions={getSuggestions}
          />
        }
      />

      <div className="inbound-page__list quality-page__list">
        {selectedIds.length > 0 ? (
          <div className="inbound-page__selection-bar">
            <span>
              선택된 품목: <strong>{selectedIds.length}건</strong> | 총 수량:{" "}
              <strong>{selectedQty} EA</strong>
            </span>
            <div>
              <SecondaryButton type="button" onClick={openInOutPrintPreview}>
                {INBOUND_LIST_PRINT_TOOLBAR_LABEL}
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
          emptyMessage="생산 미투입 입고 제품이 없습니다. (생산계획 투입 제품은 생산관리에서 확인)"
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

      {registerOpen ? (
        <IncomingRegistrationModal
          key={`${registerMode}-${editRecordId ?? "new"}`}
          mode={registerMode}
          editManagementId={editRecordId}
          initialForm={registerInitialForm}
          onClose={() => {
            setRegisterOpen(false);
            setRegisterMode("create");
            setEditRecordId(null);
            setRegisterInitialForm(null);
          }}
          onRegister={handleInboundRegister}
          onUpdate={handleInboundUpdate}
        />
      ) : null}

      <InOutListPrintPreviewModal
        open={inOutPrintSession.open}
        onClose={() => setInOutPrintSession({ open: false, props: null })}
        documentType={TITAN_PRINT_DOCUMENT_TYPES.INBOUND_LIST}
        printProps={inOutPrintSession.props}
        onAfterPrint={handleInOutPrinted}
      />

      <InboundDetailPopup
        open={Boolean(detailPopupRow)}
        onClose={() => setDetailPopupRow(null)}
        listRow={detailPopupRow}
        onSelectCoLotProduct={(id) => {
          const target = rows.find((row) => row.id === id || row.managementId === id);
          if (target) {
            setActiveId(target.id);
            setDetailPopupRow(target);
          }
        }}
      />
    </div>
  );
}
