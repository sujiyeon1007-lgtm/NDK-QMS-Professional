import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FileSpreadsheet, Plus, Printer } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanSearchPanel, {
  useSearchSuggestionHelpers,
} from "../../foundation/components/TitanSearchPanel";
import TitanStandardProductAdvancedSearch from "../../foundation/components/TitanStandardProductAdvancedSearch";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import TitanKpiBarSlot from "../../foundation/components/TitanKpiBarSlot";
import TitanWorkflowStatusChipBar from "../../foundation/components/TitanWorkflowStatusChipBar";
import TitanRegisterModal from "../../foundation/components/TitanRegisterModal";
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
  INBOUND_LIST_PRINT_TOOLBAR_LABEL,
} from "../../config/registerModalStandard";
import { parseQtyWithUnit } from "../../utils/productUnits";
import { getJournalReferenceDate } from "../../utils/workJournalData";
import { buildInOutListPrintProps } from "../../utils/inOutListPrintRows";
import { getPrintOutputDate } from "../../utils/titanPrintDates";
import { appendWorkJournalAutoEntry } from "../../utils/workJournalAutoRecord";
import { WORK_JOURNAL_ACTION_TYPES } from "../../config/titanAssigneePolicy";
import IncomingRegistrationModal from "../Incoming/IncomingRegistrationModal";
import { DEFAULT_WORK_TYPE_ID } from "../../config/workTypeWorkflow";
import {
  INBOUND_STATUS_LABELS,
  getInboundManagementStatus,
  isInboundShipOutComplete,
} from "../../utils/inboundManagementStatus";
import {
  buildInboundHistoryWorkspaceRecords,
  buildIncomingTaskWorkspaceRecords,
} from "../../utils/operationsWorkspaceData";
import { mapV13ProductListRow } from "../../utils/processFlow";
import { isHeatTreatmentNotStarted, isHtlFirstPrintTarget } from "../../utils/htlPrintEligibility";
import { openRowDetailPopup } from "../../foundation/utils/openRowDetailPopup";
import SectionPageActions from "../../foundation/layout/SectionPageActions";
import { OperationsWorkflowNextDialog } from "./OutboundStatementPromptDialog";
import { getOperationsWorkflowNextStep } from "../../config/operationsRouteRegistry";
import { applyHtlWorkListPrinted } from "../../utils/titanWorkflowStatus";
import {
  applyInboundListPrinted,
  resolveInboundCheckboxPrintRows,
  resolveInboundPrintMode,
} from "./inboundListPrintActions";
import "./InboundManagement.css";

const PRODUCTION_WAITING_OUTPUT_SHORTCUT = "production-waiting-output";
const INBOUND_PRINT_CRITERIA = {
  TODAY: "today",
  COMPANY: "company",
  PART_NAME: "partName",
  MATERIAL: "material",
  PERIOD: "period",
};

function createInboundPrintCriteria() {
  const referenceDate = getJournalReferenceDate();
  return {
    type: INBOUND_PRINT_CRITERIA.TODAY,
    company: "",
    partName: "",
    material: "",
    dateFrom: referenceDate,
    dateTo: referenceDate,
  };
}

function getUniqueOptions(records = [], key) {
  return [...new Set(records.map((record) => String(record?.[key] ?? "").trim()).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "ko"));
}

function matchesInboundPrintCriteria(record, criteria) {
  if (!record?.incomingRegistered) return false;
  const incomingDate = record.incomingDate || "";
  switch (criteria.type) {
    case INBOUND_PRINT_CRITERIA.COMPANY:
      return Boolean(criteria.company) && record.company === criteria.company;
    case INBOUND_PRINT_CRITERIA.PART_NAME:
      return Boolean(criteria.partName) && record.partName === criteria.partName;
    case INBOUND_PRINT_CRITERIA.MATERIAL:
      return Boolean(criteria.material) && record.material === criteria.material;
    case INBOUND_PRINT_CRITERIA.PERIOD:
      return (
        Boolean(criteria.dateFrom) &&
        Boolean(criteria.dateTo) &&
        incomingDate >= criteria.dateFrom &&
        incomingDate <= criteria.dateTo
      );
    case INBOUND_PRINT_CRITERIA.TODAY:
    default:
      return incomingDate === getJournalReferenceDate();
  }
}

function InboundPrintCriteriaModal({
  open,
  criteria,
  onCriteriaChange,
  onClose,
  onSubmit,
  companyOptions,
  partNameOptions,
  materialOptions,
}) {
  const updateCriteria = (patch) => onCriteriaChange((prev) => ({ ...prev, ...patch }));

  return (
    <TitanRegisterModal
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      title="입고리스트 출력"
      kicker="입고 현황 문서"
      submitLabel="출력"
      size="wide"
    >
      <div className="titan-modal__grid inbound-print-criteria">
        <label className="titan-modal__field titan-modal__field--full">
          <span>출력 기준</span>
          <select
            value={criteria.type}
            onChange={(event) => updateCriteria({ type: event.target.value })}
          >
            <option value={INBOUND_PRINT_CRITERIA.TODAY}>금일 입고</option>
            <option value={INBOUND_PRINT_CRITERIA.COMPANY}>업체별</option>
            <option value={INBOUND_PRINT_CRITERIA.PART_NAME}>품명별</option>
            <option value={INBOUND_PRINT_CRITERIA.MATERIAL}>재질별</option>
            <option value={INBOUND_PRINT_CRITERIA.PERIOD}>기간 설정</option>
          </select>
        </label>

        <label className="titan-modal__field">
          <span>업체</span>
          <select
            value={criteria.company}
            onChange={(event) => updateCriteria({ company: event.target.value })}
            disabled={criteria.type !== INBOUND_PRINT_CRITERIA.COMPANY}
          >
            <option value="">업체 선택</option>
            {companyOptions.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label className="titan-modal__field">
          <span>품명</span>
          <select
            value={criteria.partName}
            onChange={(event) => updateCriteria({ partName: event.target.value })}
            disabled={criteria.type !== INBOUND_PRINT_CRITERIA.PART_NAME}
          >
            <option value="">품명 선택</option>
            {partNameOptions.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label className="titan-modal__field">
          <span>재질</span>
          <select
            value={criteria.material}
            onChange={(event) => updateCriteria({ material: event.target.value })}
            disabled={criteria.type !== INBOUND_PRINT_CRITERIA.MATERIAL}
          >
            <option value="">재질 선택</option>
            {materialOptions.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label className="titan-modal__field">
          <span>시작일</span>
          <input
            type="date"
            value={criteria.dateFrom}
            onChange={(event) => updateCriteria({ dateFrom: event.target.value })}
            disabled={criteria.type !== INBOUND_PRINT_CRITERIA.PERIOD}
          />
        </label>

        <label className="titan-modal__field">
          <span>종료일</span>
          <input
            type="date"
            value={criteria.dateTo}
            onChange={(event) => updateCriteria({ dateTo: event.target.value })}
            disabled={criteria.type !== INBOUND_PRINT_CRITERIA.PERIOD}
          />
        </label>
      </div>
    </TitanRegisterModal>
  );
}

function isProductionWaitingOutputShortcut(searchParams) {
  return searchParams.get("shortcut") === PRODUCTION_WAITING_OUTPUT_SHORTCUT;
}

function createProductionWaitingOutputSearch() {
  return {
    ...createEmptyInboundSearch(),
    incomingDateFrom: "",
    incomingDateTo: "",
    status: "생산 대기",
    lotNo: "미생성",
    shipmentStatus: "미완료",
    __productionWaitingOutput: "1",
  };
}

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
    workType: record.workType || DEFAULT_WORK_TYPE_ID,
    incomingDate: record.incomingDate || "",
    qty: record.qty != null ? String(record.qty) : "",
    unit: record.unit || "EA",
    dueDate: record.dueDate || "",
    urgent: record.urgent ?? false,
    note: record.note || "",
  };
}

function resolveInboundListRecords(mode) {
  if (mode === "register") {
    // 입고등록 Task Workspace — RECEIVED · 생산 미투입 Stage만 (생산 대기 투입 시 자동 제거)
    return buildIncomingTaskWorkspaceRecords();
  }
  // 입고이력 — 입고등록 완료 전체 (생산/출고 여부와 무관)
  return buildInboundHistoryWorkspaceRecords();
}

function matchesInboundSearch(record, row, search) {
  const productionWaitingOutput = search.__productionWaitingOutput === "1";
  const dataSearch = productionWaitingOutput ? { ...search, lotNo: "" } : search;
  if (!matchesBasicSearch(dataSearch, record)) return false;
  if (!matchesInboundDataSearch(dataSearch, record)) return false;
  if (productionWaitingOutput && !isProductionWaitingOutputTarget(record)) return false;
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
  if (
    !productionWaitingOutput &&
    search.status &&
    !matchesInboundStatusSearch(row.statusLabel, search.status)
  ) {
    return false;
  }
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

function normalizeInboundStatusText(value) {
  return String(value ?? "").replace(/\s+/g, "");
}

function matchesInboundStatusSearch(statusLabel, searchStatus) {
  const normalizedLabel = normalizeInboundStatusText(statusLabel);
  const normalizedSearch = normalizeInboundStatusText(searchStatus);
  if (!normalizedSearch) return true;
  if (normalizedLabel === normalizedSearch) return true;

  const productionWaitingAliases = new Set(["생산대기", "열처리대기"]);
  if (productionWaitingAliases.has(normalizedLabel) && productionWaitingAliases.has(normalizedSearch)) {
    return true;
  }

  return false;
}

function isProductionWaitingOutputTarget(record) {
  if (!record) return false;
  if (isInboundShipOutComplete(record)) return false;
  if (record.lotNo?.trim()) return false;
  return isHeatTreatmentNotStarted(record);
}

export default function InboundManagement({ forcedMode } = {}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryMode = searchParams.get("mode") === "register" ? "register" : "history";
  // RC1 Route Registry — canonical /operations/inbound-pending · /operations/inbound-history
  // 는 forcedMode로 화면 역할을 고정한다. legacy ?mode= query는 redirect 단계에서만 사용.
  const viewMode = forcedMode ?? queryMode;
  const isHistoryMode = viewMode === "history";
  const productionWaitingOutputShortcut = isProductionWaitingOutputShortcut(searchParams);
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
  const [printCriteriaOpen, setPrintCriteriaOpen] = useState(false);
  const [printCriteria, setPrintCriteria] = useState(createInboundPrintCriteria);
  const [workflowNextStep, setWorkflowNextStep] = useState(null);
  const chipRecords = useMemo(() => resolveInboundListRecords(viewMode), [refreshKey, viewMode]);
  const { activeChipId, handleChipClick } = useStatusChipFilter({
    draft,
    onDraftChange,
    onReset,
  });

  const companies = useMemo(() => getMasterDataByCategory("companies"), []);
  const processCodes = useMemo(() => getProductionProcessCodes(), []);
  const searchRecords = useMemo(
    () => resolveInboundListRecords(viewMode),
    [refreshKey, viewMode]
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
    const records = resolveInboundListRecords(viewMode);
    return records
      .map((record) => mapInboundListRow(record))
      .filter((row) => matchesInboundSearch(row.record, row, search))
      .sort((a, b) => b.managementId.localeCompare(a.managementId));
  }, [search, refreshKey, viewMode]);

  const {
    page,
    pageSize,
    totalCount,
    totalPages,
    pagedItems: pagedRows,
    setPage,
    setPageSize,
  } = useListPagination(rows);

  useEffect(() => {
    if (!productionWaitingOutputShortcut) return;
    onDraftChange(createProductionWaitingOutputSearch());
    setPage(1);
  }, [onDraftChange, productionWaitingOutputShortcut, setPage]);

  useEffect(() => {
    if (!productionWaitingOutputShortcut) return;
    setSelectedIds(rows.map((row) => row.id));
  }, [productionWaitingOutputShortcut, rows]);

  const activeRow = pagedRows.find((row) => row.id === activeId) ?? null;

  const hasCheckboxSelection = selectedIds.length > 0;

  const selectedRows = useMemo(
    () => resolveInboundCheckboxPrintRows(selectedIds, rows),
    [selectedIds, rows]
  );
  const selectedQty = selectedRows.reduce((sum, row) => sum + (Number(row.record.qty) || 0), 0);

  const firstSelectedRow = selectedRows[0] ?? null;
  const inboundPrintRecords = useMemo(
    () => buildInboundHistoryWorkspaceRecords(),
    [refreshKey]
  );
  const inboundPrintRows = useMemo(
    () => inboundPrintRecords.map((record) => mapInboundListRow(record)),
    [inboundPrintRecords]
  );
  const inboundPrintOptions = useMemo(
    () => ({
      companies: getUniqueOptions(inboundPrintRecords, "company"),
      partNames: getUniqueOptions(inboundPrintRecords, "partName"),
      materials: getUniqueOptions(inboundPrintRecords, "material"),
    }),
    [inboundPrintRecords]
  );

  const handleInOutPrinted = useCallback(
    (printProps) => {
      if (!printProps?.listNo || !printProps?.rows?.length) return;
      applyInboundListPrinted(printProps.rows, printProps.listNo);

      const listNo = String(printProps.listNo).trim();
      if (!isHistoryMode && listNo.startsWith("HTL")) {
        const managementIds = printProps.rows
          .map((row) => String(row.managementId ?? row.id ?? "").trim())
          .filter(Boolean);
        applyHtlWorkListPrinted(managementIds, listNo, {
          isReprint: printProps.printMode === "reprint",
        });
      }

      setRefreshKey((key) => key + 1);
      if (!isHistoryMode) {
        setWorkflowNextStep(getOperationsWorkflowNextStep("inboundListPrinted"));
      }
    },
    [isHistoryMode]
  );

  const openInboundPrintCriteria = () => {
    setPrintCriteria(createInboundPrintCriteria());
    setPrintCriteriaOpen(true);
  };

  const handleInboundCriteriaPrint = () => {
    const printRows = inboundPrintRows.filter((row) => matchesInboundPrintCriteria(row.record, printCriteria));
    if (printRows.length === 0) {
      window.alert("선택한 기준에 해당하는 입고 제품이 없습니다.");
      return;
    }

    setInOutPrintSession({
      open: true,
      props: buildInOutListPrintProps(printRows, {
        listNoPrefix: isHistoryMode ? "IN" : "HTL",
        outputDate: getPrintOutputDate(),
        records: getSessionProductionRecords(),
        printMode: resolveInboundPrintMode(printRows),
      }),
    });
    setPrintCriteriaOpen(false);
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
        // 입고 이력(history) — 순수 조회 + 출력 화면 (등록/수정/삭제 ❌)
        renderActions: isHistoryMode
          ? undefined
          : (row) => (
              <InboundRowActions
                onEdit={() => openEditModal(row)}
                onDelete={() => handleInboundDelete(row)}
              />
            ),
      }),
    [isHistoryMode]
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
      workType: form.workType || DEFAULT_WORK_TYPE_ID,
      note: form.note,
      urgent: form.urgent,
      registrar: form.manager?.trim() || "",
      incomingRegistered: true,
    };
  };

  const handleInboundRegister = (form, managementId) => {
    const result = addSessionProductionRecord({
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

    if (result?.ok === false) {
      window.alert(result.message || "입고 등록에 실패했습니다.");
      return;
    }

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
    if (!isHistoryMode) {
      setWorkflowNextStep(getOperationsWorkflowNextStep("inboundRegisterComplete"));
    }
  };

  const handleInboundUpdate = (form, managementId) => {
    updateSessionProductionRecord(managementId, buildRecordPatchFromForm(form));
    setActiveId(managementId);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="inbound-page">
      <SectionPageActions>
        {!isHistoryMode ? (
          <>
            <PrimaryButton type="button" onClick={openRegisterModal}>
              <Plus size={14} aria-hidden="true" />
              {INBOUND_REGISTER_LABEL}
            </PrimaryButton>
            <SecondaryButton type="button" onClick={() => openEditModal(firstSelectedRow)} disabled={!hasCheckboxSelection}>
              {INBOUND_EDIT_LABEL}
            </SecondaryButton>
          </>
        ) : null}
        <SecondaryButton type="button" onClick={openInboundPrintCriteria}>
          <Printer size={14} aria-hidden="true" />
          {INBOUND_LIST_PRINT_TOOLBAR_LABEL}
        </SecondaryButton>
        <SecondaryButton type="button" onClick={openInboundPrintCriteria}>
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

      <div className="inbound-page__history-heading" role="heading" aria-level="2">
        {viewMode === "register" ? "입고 대기" : "입고 이력"}
      </div>

      <div className="inbound-page__list quality-page__list">
        {selectedIds.length > 0 ? (
          <div className="inbound-page__selection-bar">
            <span>
              선택된 품목: <strong>{selectedIds.length}건</strong> | 총 수량:{" "}
              <strong>{selectedQty} EA</strong>
            </span>
            <div>
              <SecondaryButton type="button" onClick={openInboundPrintCriteria}>
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
          emptyMessage={
            viewMode === "register"
              ? "생산 미투입 입고 제품이 없습니다. (생산 대기 투입 제품은 생산관리에서 확인)"
              : "입고등록 완료 이력이 없습니다."
          }
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

      <InboundPrintCriteriaModal
        open={printCriteriaOpen}
        criteria={printCriteria}
        onCriteriaChange={setPrintCriteria}
        onClose={() => setPrintCriteriaOpen(false)}
        onSubmit={handleInboundCriteriaPrint}
        companyOptions={inboundPrintOptions.companies}
        partNameOptions={inboundPrintOptions.partNames}
        materialOptions={inboundPrintOptions.materials}
      />

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

      <OperationsWorkflowNextDialog
        open={Boolean(workflowNextStep)}
        step={workflowNextStep}
        onNavigate={(path) => {
          navigate(path);
          setWorkflowNextStep(null);
        }}
        onStay={() => setWorkflowNextStep(null)}
        onClose={() => setWorkflowNextStep(null)}
      />
    </div>
  );
}
