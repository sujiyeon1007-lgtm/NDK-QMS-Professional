import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Factory, FileDown, FileSpreadsheet, Plus, Printer, QrCode } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import TitanSearchPanel, { useSearchSuggestionHelpers } from "../../foundation/components/TitanSearchPanel";
import TitanSearchAutocomplete from "../../foundation/components/TitanSearchAutocomplete";
import TitanStandardProductAdvancedSearch from "../../foundation/components/TitanStandardProductAdvancedSearch";
import StatusChip from "../../foundation/components/StatusChip";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import TitanScreenDetailPopup from "../../foundation/components/TitanScreenDetailPopup";
import TitanPrintPreviewModal from "../../components/print/TitanPrintPreviewModal";
import ProductionDailyReportPrint from "../../components/print/ProductionDailyReportPrint";
import { getPrintDocumentMeta, TITAN_PRINT_DOCUMENT_TYPES } from "../../config/titanPrintDocuments";
import { OPERATION_ROUTES } from "../../config/operationsRouteRegistry";
import {
  createEmptyProductionDailyReportSearch,
  matchesBasicSearch,
  STANDARD_PRODUCT_BASIC_SEARCH_FIELDS,
} from "../../config/listSearchStandard";
import { renderWorkflowProcessChip } from "../../utils/workflowProcessChip";
import {
  getProcessChipVariant,
  getProductionProcessCodes,
  getProductionProcessName,
} from "../../config/productionProcessCodes";
import { buildProductionDailyReportListColumns } from "../../config/standardProductList";
import { useTitanListSearch } from "../../foundation/hooks/useTitanListSearch";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import { getMasterDataByCategory } from "../../utils/masterData";
import { getProductionDailyReportScreenData, getProductionPlanScreenData } from "../../utils/productionWorkspaceData";
import { getSessionProductionRecords } from "../../utils/productionRecords";
import { getTitanDataEngine } from "../../foundation/data";
import { EQUIPMENT_RUN_STATUS_META } from "../../config/equipmentConfig";
import {
  getEquipmentList,
  createManualChargeableLot,
  getEquipmentRunStatusLabel,
} from "../../utils/equipmentWorkflowService";
import { generateProductionLotNo } from "../../utils/productionLotNumber";
import {
  APPROVAL_STATUS_OPTIONS,
  formatProductionDailyReportDateTime,
  getProductionDailyReportApprovalStatus,
  getProductionDailyReportStatus,
  matchesProductionChipSearch,
} from "../../utils/productionDailyReportStatus";
import { resolveChargeQty, resolveRemainingChargeQty } from "../../utils/equipmentChargingQty";
import { getProcessFlowSteps, mapV13ProductListRow, formatWorkQtyLabel } from "../../utils/processFlow";
import { validateLotNoForDailyReportRegister } from "../../utils/lotFormatValidation";
import { onDailyReportSaved } from "../../utils/titanWorkflowStatus";
import {
  PRODUCTION_DAILY_REGISTER_LABEL,
  PRODUCTION_DAILY_PRINT_LABEL,
  PRODUCTION_DAILY_PDF_LABEL,
} from "../../config/registerModalStandard";
import { getPrintOutputDate } from "../../utils/titanPrintDates";
import { appendWorkJournalAutoEntry } from "../../utils/workJournalAutoRecord";
import { QRService } from "../../utils/qrEngineRegistryService";
import { WORK_JOURNAL_ACTION_TYPES } from "../../config/titanAssigneePolicy";
import {
  buildProductionDailyReportLotBundleFromSelectedRows,
  getRecordsForProductionLot,
  isProductionDailyReportPrintReady,
} from "../../utils/productionDailyReportPrintData";
import { exportTitanExcel, exportTitanPdf, printTitanDocument } from "../../utils/titanPrintExport";
import TitanWorkflowStatusChipBar from "../../foundation/components/TitanWorkflowStatusChipBar";
import TitanKpiBarSlot from "../../foundation/components/TitanKpiBarSlot";
import { useWorkflowChipFilter } from "../../foundation/hooks/useWorkflowChipFilter";
import {
  cancelProductionDailyReportLot,
  canCancelProductionDailyReportLot,
  mapRecordToChargeProduct,
  revertProductionDailyReportRecords,
} from "../../utils/productionDailyReportRegister";
import DailyProductionReportRegisterModal from "./DailyProductionReportRegisterModal";
import ProductionCompleteConfirmDialog from "./ProductionCompleteConfirmDialog";
import ProductionDailyReportLotSelectDialog from "./ProductionDailyReportLotSelectDialog";
import ProductionDailyReportPartialLotDialog from "./ProductionDailyReportPartialLotDialog";
import ProductionDailyReportNoSelectionDialog from "./ProductionDailyReportNoSelectionDialog";
import {
  PRODUCTION_DAILY_PRINT_NOT_READY_MESSAGE,
  resolveProductionDailyPartialLotPrompt,
  resolveProductionDailyPrintLotGroups,
  resolveProductionDailyPrintRowsForLot,
} from "./productionDailyReportPrintActions";
import { validateProductionDailyPrintSelection } from "../../utils/productionDailyReportPrintData";
import ProductionDailyRowActions from "./ProductionDailyRowActions";
import SmartProduciblePanel from "./SmartProduciblePanel";
import {
  canCancelProductionComplete,
  canCompleteProduction,
  cancelProductionCompleteRecord,
  completeProductionRecord,
  isProductionComplete,
} from "../../utils/productionComplete";
import { resolveEquipmentContext } from "../../utils/equipmentQr";
import { subscribeWorkflowDataRefresh } from "../../utils/titanWorkflowRefresh";
import { buildRecordLotRowKey } from "../../utils/lotBundleService";
import { SMART_WORK_DAILY_QUERY } from "../../config/titanV11Workflow";
import "../InOut/InboundManagement.css";
import { openRowDetailPopup } from "../../foundation/utils/openRowDetailPopup";
import SectionPageActions from "../../foundation/layout/SectionPageActions";
import TitanWorkflowNextStepDialog from "../../foundation/components/TitanWorkflowNextStepDialog";
import TitanWorkflowNavigation from "../../foundation/components/TitanWorkflowNavigation";
import { getWorkflowCompletionDialog } from "../../config/workflowNavigation";
import "../../foundation/components/OperationsWorkflowNextDialog.css";
import "./ProductionManagement.css";

function readProductionDailyReportBaseRecords() {
  try {
    return getProductionDailyReportScreenData()?.baseRecords ?? [];
  } catch {
    return [];
  }
}

function compareProductionDailyReportRows(a, b) {
  return String(b?.managementId ?? "").localeCompare(String(a?.managementId ?? ""), undefined, {
    numeric: true,
  });
}

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
  if (search.productionDateFrom) {
    const prodDate = record.workDate || record.dueDate || "";
    if (prodDate && prodDate !== "—" && prodDate < search.productionDateFrom) return false;
  }
  if (search.productionDateTo) {
    const prodDate = record.workDate || record.dueDate || "";
    if (prodDate && prodDate !== "—" && prodDate > search.productionDateTo) return false;
  }
  if (search.incomingDateFrom && record.incomingDate < search.incomingDateFrom) return false;
  if (search.incomingDateTo && record.incomingDate > search.incomingDateTo) return false;
  if (
    search.qty &&
    !String(resolveChargeQty(record, { lotNo: record.lotNo })).includes(search.qty)
  ) {
    return false;
  }
  if (search.note && !String(record.note ?? "").includes(search.note)) return false;
  if (search.status && row.statusLabel !== search.status) return false;
  const workDate = record.workDate || record.dueDate || "—";
  if (search.workDateFrom && workDate < search.workDateFrom) return false;
  if (search.workDateTo && workDate > search.workDateTo) return false;
  if (search.equipment && !String(record.equipment ?? "").includes(search.equipment)) return false;
  const worker = record.registrar ?? record.worker ?? "관리자";
  if (search.worker && !worker.includes(search.worker)) return false;
  const approval = getProductionDailyReportApprovalStatus(record);
  if (search.approvalStatus && approval !== search.approvalStatus) return false;
  if (!matchesProductionChipSearch(record, search)) return false;
  return true;
}

function mapRecordToRow(record) {
  const row = mapV13ProductListRow(record, getProductionDailyReportStatus(record), {
    screenKey: "production",
  });
  const workLog = record.productionWorkLog ?? {};
  const chargeQty = resolveChargeQty(record, { lotNo: record?.lotNo });
  return {
    ...row,
    id: buildRecordLotRowKey(record),
    chargeQtyLabel: formatWorkQtyLabel(record, { workQty: chargeQty }),
    equipmentLabel: String(record.equipment ?? record.equipmentId ?? "").trim() || "—",
    workerLabel:
      String(record.registrar ?? record.worker ?? workLog.worker ?? "").trim() || "—",
    workStartAtLabel: String(workLog.startAt ?? record.chargeStartAt ?? "").trim() || "—",
    workEndAtLabel: String(workLog.endAt ?? record.chargeEndAt ?? "").trim() || "—",
  };
}

function buildManualLotEquipmentLabel(equipment) {
  return `${equipment.name}      ${resolveManualLotEquipmentStatusLabel(equipment.status)}`;
}

function normalizeManualLotSearchText(value) {
  return String(value ?? "").replace(/[\s-]+/g, "").toLowerCase();
}

function buildManualLotNumberRecords() {
  const dataEngine = getTitanDataEngine();
  const lotRows = dataEngine.lot.list().map((row) => ({ lotNo: row.lotNo }));
  const equipmentLots = dataEngine.equipment.list().flatMap((equipment) =>
    (equipment.chargeableLots ?? []).map((row) => ({ lotNo: row.lotNo }))
  );
  return [...getSessionProductionRecords(), ...lotRows, ...equipmentLots];
}

function resolveManualLotStatusVariant(status) {
  return EQUIPMENT_RUN_STATUS_META[status]?.variant ?? "wait";
}

function resolveManualLotEquipmentStatusLabel(status) {
  return getEquipmentRunStatusLabel(status);
}

function resolveManualLotRecordValue(record, keys, fallback = "—") {
  for (const key of keys) {
    const value = record?.[key];
    if (value != null && String(value).trim()) return value;
  }
  return fallback;
}

function mapManualLotWaitingRow(record) {
  const qty = resolveRemainingChargeQty(record);
  return {
    ...record,
    id: record.id,
    managementId: resolveManualLotRecordValue(record, ["mesManagementNo", "managementId", "id"]),
    companyLabel: resolveManualLotRecordValue(record, ["company", "companyName"]),
    productNameLabel: resolveManualLotRecordValue(record, ["partName", "productName", "itemName"]),
    partNoLabel: resolveManualLotRecordValue(record, ["partNo", "productNo", "itemNo"]),
    materialLabel: resolveManualLotRecordValue(record, ["material", "materialName"]),
    qtyLabel: Number(qty) ? Number(qty).toLocaleString("ko-KR") : "—",
    qtyValue: Number(qty) || 0,
    dueDateLabel: resolveManualLotRecordValue(record, ["dueDate", "incomingDate", "registeredAt"]),
    statusLabel: "생산 대기",
  };
}

const MANUAL_LOT_WAITING_COLUMNS = [
  { key: "managementId", label: "관리번호", widthHint: "id", identifier: true },
  { key: "companyLabel", label: "업체명", widthHint: "company" },
  { key: "productNameLabel", label: "품명", widthHint: "product" },
  { key: "partNoLabel", label: "품번", widthHint: "partNo" },
  { key: "materialLabel", label: "재질", widthHint: "material" },
  { key: "qtyLabel", label: "수량", widthHint: "qty" },
  { key: "dueDateLabel", label: "생산 기준일", widthHint: "date" },
  {
    key: "statusLabel",
    label: "상태",
    widthHint: "status",
    render: (row) => <StatusChip variant="wait">{row.statusLabel}</StatusChip>,
  },
];

export function ManualLotRegistrationPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    equipmentQuery: "",
    productionDate: getPrintOutputDate(),
    operator: "",
    note: "",
  });
  const [selectedRecordId, setSelectedRecordId] = useState("");
  const [selectedEquipmentId, setSelectedEquipmentId] = useState("");
  const [createdResult, setCreatedResult] = useState(null);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const waitingRows = useMemo(() => {
    void refreshKey;
    return getProductionPlanScreenData().baseRecords.map(mapManualLotWaitingRow);
  }, [refreshKey]);
  const selectedRecord = useMemo(
    () => waitingRows.find((row) => row.id === selectedRecordId) ?? waitingRows[0] ?? null,
    [waitingRows, selectedRecordId]
  );
  const equipmentList = useMemo(() => getEquipmentList(), [refreshKey]);
  const selectedEquipment = useMemo(
    () => equipmentList.find((equipment) => equipment.id === selectedEquipmentId) ?? null,
    [equipmentList, selectedEquipmentId]
  );
  const equipmentOptions = useMemo(
    () =>
      equipmentList.map((equipment) => ({
        equipment,
        label: buildManualLotEquipmentLabel(equipment),
        searchText: normalizeManualLotSearchText(
          `${equipment.id} ${equipment.name} ${equipment.code ?? ""} ${equipment.process} ${EQUIPMENT_RUN_STATUS_META[equipment.status]?.label ?? ""} ${resolveManualLotEquipmentStatusLabel(equipment.status)}`
        ),
      })),
    [equipmentList]
  );
  const equipmentSuggestions = useMemo(() => {
    const keyword = normalizeManualLotSearchText(form.equipmentQuery);
    const filtered = keyword
      ? equipmentOptions.filter((option) => option.searchText.includes(keyword))
      : equipmentOptions;
    return filtered.slice(0, 20).map((option) => option.label);
  }, [equipmentOptions, form.equipmentQuery]);
  const nextLotNo = useMemo(() => {
    if (!selectedEquipment || !form.productionDate) return "";
    return generateProductionLotNo({
      workDate: form.productionDate,
      equipment: selectedEquipment.name,
      records: buildManualLotNumberRecords(),
    });
  }, [selectedEquipment, form.productionDate, refreshKey]);

  const updateField = (key, value) => {
    setError("");
    setCreatedResult(null);
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSelectWaitingRow = (row) => {
    setSelectedRecordId(row.id);
    setCreatedResult(null);
    setError("");
  };

  const handleEquipmentSelect = (label) => {
    const keyword = normalizeManualLotSearchText(label);
    const matched =
      equipmentOptions.find((option) => option.label === label) ??
      equipmentOptions.find((option) => keyword && option.searchText.includes(keyword));
    if (!matched) {
      setSelectedEquipmentId("");
      setForm((prev) => ({ ...prev, equipmentQuery: label }));
      return;
    }
    setSelectedEquipmentId(matched.equipment.id);
    setForm((prev) => ({ ...prev, equipmentQuery: matched.label }));
  };

  const handleCreateLot = () => {
    if (!selectedEquipment) {
      setError("설비를 선택하세요.");
      return;
    }
    if (!form.productionDate) {
      setError("생산일자를 입력하세요.");
      return;
    }
    if (!nextLotNo) {
      setError("LOT 번호를 생성할 수 없습니다. 설비와 생산일자를 확인하세요.");
      return;
    }

    const result = createManualChargeableLot({
      equipmentId: selectedEquipment.id,
      lotNo: nextLotNo,
      workDate: form.productionDate,
      sourceRecordId: selectedRecord?.id,
      managementId: selectedRecord?.managementId,
      company: selectedRecord?.companyLabel,
      productName: selectedRecord?.productNameLabel,
      partNo: selectedRecord?.partNoLabel,
      material: selectedRecord?.materialLabel,
      qty: selectedRecord?.qtyValue,
      operator: form.operator,
      note: form.note,
    });

    if (!result.ok) {
      setError(result.message);
      return;
    }

    QRService.createIfNotExists("lot", result.lotNo);
    setCreatedResult(result);
    setError("");
    setRefreshKey((key) => key + 1);
    setSelectedRecordId("");
  };

  const selectedMeta = selectedEquipment
    ? EQUIPMENT_RUN_STATUS_META[selectedEquipment.status] ?? EQUIPMENT_RUN_STATUS_META.idle
    : null;

  return (
    <div className="manual-lot-page">
      <section className="manual-lot-page__hero">
        <div>
          <p className="manual-lot-page__eyebrow">Manual LOT Workflow</p>
          <h2>수기 LOT 등록</h2>
          <p>
            생산 대기 리스트에서 작업 대상을 선택하고, 설비를 지정한 뒤 LOT를 생성하는 생산 시작 화면입니다.
          </p>
        </div>
        <div className="manual-lot-page__rule">
          <strong>PM 원칙</strong>
          <span>LOT Preview는 계산만 수행합니다. LOT · QR · 설비 연결은 LOT 생성 버튼 클릭 시점에만 반영됩니다.</span>
        </div>
      </section>

      <section className="manual-lot-page__workspace" aria-label="생산 시작 Workspace">
        <div className="manual-lot-page__list-card">
          <div className="manual-lot-page__section-head">
            <div>
              <h3>생산 대기 리스트</h3>
              <p>생산을 시작할 대상을 선택하면 우측 LOT 생성 패널이 자동 갱신됩니다.</p>
            </div>
            <span className="manual-lot-page__count">{waitingRows.length.toLocaleString("ko-KR")}건</span>
          </div>
          <TitanDataTable
            columns={MANUAL_LOT_WAITING_COLUMNS}
            rows={waitingRows}
            activeRowId={selectedRecord?.id}
            onRowClick={handleSelectWaitingRow}
            emptyMessage="생산 대기 대상이 없습니다."
            ariaLabel="생산 대기 리스트"
          />
        </div>

        <aside className="manual-lot-page__preview" aria-label="LOT 생성 패널">
          <div className="manual-lot-page__preview-head">
            <Factory size={18} aria-hidden="true" />
            <strong>LOT 생성 패널</strong>
          </div>

          {selectedRecord ? (
            <dl className="manual-lot-page__summary">
              <div>
                <dt>관리번호</dt>
                <dd>{selectedRecord.managementId}</dd>
              </div>
              <div>
                <dt>업체명</dt>
                <dd>{selectedRecord.companyLabel}</dd>
              </div>
              <div>
                <dt>품명</dt>
                <dd>{selectedRecord.productNameLabel}</dd>
              </div>
              <div>
                <dt>품번</dt>
                <dd>{selectedRecord.partNoLabel}</dd>
              </div>
              <div>
                <dt>재질</dt>
                <dd>{selectedRecord.materialLabel}</dd>
              </div>
              <div>
                <dt>수량</dt>
                <dd>{selectedRecord.qtyLabel}</dd>
              </div>
              <div>
                <dt>생산 예정일</dt>
                <dd>
                  <input
                    className="titan-input"
                    type="date"
                    value={form.productionDate}
                    onChange={(event) => updateField("productionDate", event.target.value)}
                  />
                </dd>
              </div>
              <div>
                <dt>설비</dt>
                <dd>
                  <TitanSearchAutocomplete
                    fieldKey="manualLotEquipment"
                    value={form.equipmentQuery}
                    onChange={(value) => {
                      updateField("equipmentQuery", value);
                      setSelectedEquipmentId("");
                    }}
                    onSelect={handleEquipmentSelect}
                    suggestions={equipmentSuggestions}
                    placeholder="66 / 3S / 10S / 이온 / 연질화"
                  />
                </dd>
              </div>
              <div>
                <dt>생성될 LOT번호</dt>
                <dd className="manual-lot-page__lot-no">{nextLotNo || "설비 선택 후 자동 Preview"}</dd>
              </div>
              <div>
                <dt>상태</dt>
                <dd>
                  {selectedEquipment ? (
                    <StatusChip variant={resolveManualLotStatusVariant(selectedEquipment.status)}>
                      {selectedMeta.emoji} {resolveManualLotEquipmentStatusLabel(selectedEquipment.status)}
                    </StatusChip>
                  ) : (
                    <StatusChip variant="wait">설비 미선택</StatusChip>
                  )}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="manual-lot-page__empty">생산 대기 리스트에서 작업 대상을 선택하세요.</p>
          )}

          <label className="manual-lot-page__field">
            <span>작업자</span>
            <input className="titan-input" value={form.operator} onChange={(event) => updateField("operator", event.target.value)} placeholder="작업자" />
          </label>

          <label className="manual-lot-page__field">
            <span>비고</span>
            <input className="titan-input" value={form.note} onChange={(event) => updateField("note", event.target.value)} placeholder="긴급 생산 / 전일 누락 / QR 예외 사유 등" />
          </label>

          {error ? <p className="manual-lot-page__error" role="alert">{error}</p> : null}

          {createdResult ? (
            <div className="manual-lot-page__success manual-lot-page__toast" role="status" aria-live="polite">
              <CheckCircle2 size={18} aria-hidden="true" />
              <div>
                <strong>LOT 생성 완료</strong>
                <span>{createdResult.lotNo}</span>
              </div>
            </div>
          ) : null}

          <div className="manual-lot-page__actions">
            <PrimaryButton type="button" onClick={handleCreateLot} disabled={!selectedRecord}>
              <Plus size={14} aria-hidden="true" />
              LOT 생성
            </PrimaryButton>
            <button className="titan-btn titan-btn--secondary" type="button" onClick={() => navigate(OPERATION_ROUTES.equipmentStatus)}>
              설비 가동 현황 확인
            </button>
          </div>
        </aside>
      </section>

      <section className="manual-lot-page__history" aria-label="생산 이력">
        <div className="manual-lot-page__section-head">
          <div>
            <h3>생산 이력</h3>
            <p>LOT 생성 후 설비 가동 현황과 작업일보에서 이어서 관리합니다.</p>
          </div>
          {createdResult ? <span className="manual-lot-page__lot-no">{createdResult.lotNo}</span> : null}
        </div>
      </section>
    </div>
  );
}

export default function DailyProductionReport() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [refreshKey, setRefreshKey] = useState(0);
  const [workflowNextStep, setWorkflowNextStep] = useState(null);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerInitialId, setRegisterInitialId] = useState("");
  const [registerMode, setRegisterMode] = useState("register");
  const [editLotNo, setEditLotNo] = useState("");
  const { search, draft, onDraftChange, onSearch, onReset, advancedOpen, onAdvancedToggle } =
    useTitanListSearch(createEmptyProductionDailyReportSearch, { storageKey: "production-daily" });

  const smartEquipmentContext = useMemo(() => {
    const qrPayload = searchParams.get(SMART_WORK_DAILY_QUERY.qr)?.trim();
    const equipmentCode =
      searchParams.get(SMART_WORK_DAILY_QUERY.equipment)?.trim() || qrPayload || "";
    if (!equipmentCode) return null;
    return resolveEquipmentContext(equipmentCode);
  }, [searchParams]);

  const smartModeActive = Boolean(smartEquipmentContext);

  useEffect(() => subscribeWorkflowDataRefresh(() => setRefreshKey((key) => key + 1)), []);

  useEffect(() => {
    if (!smartEquipmentContext) return;
    onDraftChange({
      ...draft,
      equipment: smartEquipmentContext.name,
      process: smartEquipmentContext.process,
    });
    // Smart QR 진입 시 설비·공정 검색 1회 동기화
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [smartEquipmentContext?.id]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [dailyPrintOpen, setDailyPrintOpen] = useState(false);
  const [dailyPrintBusy, setDailyPrintBusy] = useState(false);
  const [dailyPrintProps, setDailyPrintProps] = useState(null);
  const [completeConfirmOpen, setCompleteConfirmOpen] = useState(false);
  const [pendingCompleteRow, setPendingCompleteRow] = useState(null);
  const [detailPopupRow, setDetailPopupRow] = useState(null);
  const [lotSelectOpen, setLotSelectOpen] = useState(false);
  const [lotSelectGroups, setLotSelectGroups] = useState([]);
  const [partialLotOpen, setPartialLotOpen] = useState(false);
  const [partialLotState, setPartialLotState] = useState(null);
  const [noSelectionOpen, setNoSelectionOpen] = useState(false);
  const pendingPdfExportRef = useRef(false);
  const pendingExcelExportRef = useRef(false);
  const pendingPrintOptionsRef = useRef(null);
  const chipRecords = useMemo(() => {
    void refreshKey;
    return readProductionDailyReportBaseRecords();
  }, [refreshKey]);
  const { activeChipId, handleChipClick } = useWorkflowChipFilter({
    draft,
    onDraftChange,
    onReset,
  });

  const companies = useMemo(() => getMasterDataByCategory("companies"), []);
  const equipmentList = useMemo(() => getMasterDataByCategory("equipment"), []);
  const processCodes = useMemo(() => getProductionProcessCodes(), []);
  const searchRecords = useMemo(() => {
    void refreshKey;
    return readProductionDailyReportBaseRecords();
  }, [refreshKey]);
  const { getSuggestions } = useSearchSuggestionHelpers(searchRecords, {
    process: processCodes.map((item) => item.name),
    equipment: equipmentList.map((item) => item.name ?? item.code),
  });

  const rows = useMemo(() => {
    const records = readProductionDailyReportBaseRecords();
    return records
      .map(mapRecordToRow)
      .filter((row) => matchesProductionDailyReportSearch(row.record, row, search))
      .sort(compareProductionDailyReportRows);
  }, [search, refreshKey]);

  const allListRows = useMemo(() => {
    const records = readProductionDailyReportBaseRecords();
    return records.map(mapRecordToRow).sort(compareProductionDailyReportRows);
  }, [refreshKey]);

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

  const openDailyPrintPreviewForSelectedRows = (selectedRows, options = {}) => {
    const validation = validateProductionDailyPrintSelection(
      selectedRows,
      getSessionProductionRecords()
    );
    if (!validation.ok) {
      window.alert(PRODUCTION_DAILY_PRINT_NOT_READY_MESSAGE);
      return;
    }

    const bundle = buildProductionDailyReportLotBundleFromSelectedRows(
      selectedRows,
      getSessionProductionRecords(),
      { outputDate: getPrintOutputDate() }
    );

    if (!bundle) {
      window.alert(PRODUCTION_DAILY_PRINT_NOT_READY_MESSAGE);
      return;
    }

    pendingPdfExportRef.current = Boolean(options.exportPdf);
    pendingExcelExportRef.current = Boolean(options.exportExcel);
    setDailyPrintProps({
      bundles: [bundle],
      outputDate: getPrintOutputDate(),
    });
    setDailyPrintOpen(true);
  };

  const beginProductionDailyOutput = (options = {}) => {
    const resolved = resolveProductionDailyPrintLotGroups(selectedIds, rows);

    if (!resolved.ok) {
      if (resolved.reason === "noSelection") {
        setNoSelectionOpen(true);
        return;
      }
      window.alert(PRODUCTION_DAILY_PRINT_NOT_READY_MESSAGE);
      return;
    }

    if (resolved.lotGroups.length > 1) {
      pendingPrintOptionsRef.current = { options, lotGroups: resolved.lotGroups };
      setLotSelectGroups(resolved.lotGroups);
      setLotSelectOpen(true);
      return;
    }

    const partial = resolveProductionDailyPartialLotPrompt(selectedIds, rows, allListRows);
    if (partial.show) {
      pendingPrintOptionsRef.current = { options };
      setPartialLotState(partial);
      setPartialLotOpen(true);
      return;
    }

    openDailyPrintPreviewForSelectedRows(resolved.lotGroups[0].rows, options);
  };

  const handlePartialLotPrintSelected = () => {
    const partial = partialLotState;
    const options = pendingPrintOptionsRef.current?.options ?? {};
    setPartialLotOpen(false);
    setPartialLotState(null);
    pendingPrintOptionsRef.current = null;
    if (!partial?.selectedRows?.length) return;
    openDailyPrintPreviewForSelectedRows(partial.selectedRows, options);
  };

  const handlePartialLotPrintAll = () => {
    const partial = partialLotState;
    const options = pendingPrintOptionsRef.current?.options ?? {};
    setPartialLotOpen(false);
    setPartialLotState(null);
    pendingPrintOptionsRef.current = null;
    if (!partial?.allLotRows?.length) return;
    setSelectedIds(partial.allRowIds);
    openDailyPrintPreviewForSelectedRows(partial.allLotRows, options);
  };

  const handlePartialLotCancel = () => {
    setPartialLotOpen(false);
    setPartialLotState(null);
    pendingPrintOptionsRef.current = null;
  };

  const handleLotSelectConfirm = (lotNo) => {
    const pending = pendingPrintOptionsRef.current ?? {};
    const selectedRows = resolveProductionDailyPrintRowsForLot(pending.lotGroups ?? lotSelectGroups, lotNo);
    setLotSelectOpen(false);
    setLotSelectGroups([]);
    openDailyPrintPreviewForSelectedRows(selectedRows, pending.options ?? {});
    pendingPrintOptionsRef.current = null;
  };

  const handleLotSelectCancel = () => {
    setLotSelectOpen(false);
    setLotSelectGroups([]);
    pendingPrintOptionsRef.current = null;
  };

  const dailyPrintMeta = getPrintDocumentMeta(TITAN_PRINT_DOCUMENT_TYPES.PRODUCTION_DAILY_REPORT);

  const openDailyPrintPreview = (options = {}) => {
    beginProductionDailyOutput(options);
  };

  useEffect(() => {
    if (!dailyPrintOpen || !dailyPrintProps || !pendingPdfExportRef.current || dailyPrintBusy) {
      return undefined;
    }

    const timer = window.setTimeout(async () => {
      const documentEl = document.querySelector(".titan-print-modal .titan-print-document");
      if (!documentEl) return;

      pendingPdfExportRef.current = false;
      await handleDailyPdf(documentEl);
      closeDailyPrintPreview();
    }, 350);

    return () => window.clearTimeout(timer);
    // PDF 자동 내보내기는 미리보기 DOM 렌더 후 1회 실행
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dailyPrintOpen, dailyPrintProps, dailyPrintBusy]);

  useEffect(() => {
    if (!dailyPrintOpen || !dailyPrintProps || !pendingExcelExportRef.current || dailyPrintBusy) {
      return undefined;
    }

    const timer = window.setTimeout(async () => {
      const documentEl = document.querySelector(".titan-print-modal .titan-print-document");
      if (!documentEl) return;

      pendingExcelExportRef.current = false;
      await handleDailyExcel(documentEl);
      closeDailyPrintPreview();
    }, 350);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dailyPrintOpen, dailyPrintProps, dailyPrintBusy]);

  const closeDailyPrintPreview = () => {
    setDailyPrintOpen(false);
    setDailyPrintProps(null);
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
      await exportTitanPdf(documentEl, `production-daily-report-${getPrintOutputDate()}.pdf`);
    } finally {
      setDailyPrintBusy(false);
    }
  };

  const handleDailyExcel = async (documentEl) => {
    setDailyPrintBusy(true);
    try {
      exportTitanExcel(documentEl, `production-daily-report-${getPrintOutputDate()}.xls`);
    } finally {
      setDailyPrintBusy(false);
    }
  };

  const renderProcessChip = (row) => renderWorkflowProcessChip(row);

  const columns = useMemo(
    () =>
      buildProductionDailyReportListColumns({
        renderHeatTreatmentProcess: (row) => row.heatTreatmentProcess ?? row.processName ?? "—",
        renderWorkflowStatus: renderProcessChip,
        renderActions: (row) => {
          const record = row.record ?? row;
          const lotNo = record.lotNo?.trim() ?? "";
          const completeCheck = canCompleteProduction(record);
          const cancelCompleteCheck = canCancelProductionComplete(record);
          const lotCancelCheck = lotNo ? canCancelProductionDailyReportLot(lotNo) : { ok: false };
          const canEditLot = Boolean(
            lotNo && isProductionDailyReportPrintReady(record) && !isProductionComplete(record)
          );
          const canCancelLot = Boolean(lotCancelCheck.ok && !cancelCompleteCheck.ok);
          return (
            <ProductionDailyRowActions
              canEdit={canEditLot}
              onEdit={() => openEditModal(lotNo)}
              canComplete={completeCheck.ok}
              onComplete={() => openRowCompleteConfirm(row)}
              canCancelComplete={cancelCompleteCheck.ok}
              onCancelComplete={() => handleRowCancelComplete(row)}
              canCancelLot={canCancelLot}
              onCancelLot={() => handleRowCancelLot(row)}
            />
          );
        },
      }),
    [refreshKey]
  );

  const processFlowSteps = activeRow
    ? getProcessFlowSteps(activeRow.record, activeRow.statusLabel)
    : [];

  const detailPopupProcessSteps = detailPopupRow
    ? getProcessFlowSteps(detailPopupRow.record, detailPopupRow.statusLabel)
    : [];

  const detailPopupChargeProducts = useMemo(() => {
    if (!detailPopupRow?.record) return [];
    const lotNo = detailPopupRow.record.lotNo?.trim();
    if (!lotNo) return [mapRecordToChargeProduct(detailPopupRow.record)].filter(Boolean);
    return getRecordsForProductionLot(lotNo).map(mapRecordToChargeProduct).filter(Boolean);
  }, [detailPopupRow]);

  const buildProductionDetailContent = (row) =>
    row ? (
      <dl className="inbound-detail">
        <div>
          <dt>작업지시서</dt>
          <dd>{row.record.htlNo || "—"}</dd>
        </div>
        <div>
          <dt>입고일</dt>
          <dd>{row.record.incomingDate || "—"}</dd>
        </div>
        <div>
          <dt>관리번호</dt>
          <dd>{row.managementId}</dd>
        </div>
        <div>
          <dt>LOT.NO</dt>
          <dd>{row.lotNo}</dd>
        </div>
        <div>
          <dt>공정</dt>
          <dd>
            {row.processName && row.processName !== "—" ? (
              <StatusChip variant={getProcessChipVariant(row.processName)}>{row.processName}</StatusChip>
            ) : (
              "—"
            )}
          </dd>
        </div>
        <div>
          <dt>입고수량</dt>
          <dd>{row.qty}</dd>
        </div>
        <div>
          <dt>현재상태</dt>
          <dd>
            <StatusChip variant={row.statusVariant}>{row.statusLabel}</StatusChip>
          </dd>
        </div>
        <div>
          <dt>등록자</dt>
          <dd>{row.record.registrar ?? "관리자"}</dd>
        </div>
        <div>
          <dt>등록일시</dt>
          <dd>{formatProductionDailyReportDateTime(row.record)}</dd>
        </div>
        <div>
          <dt>수정일시</dt>
          <dd>{row.record.updatedAt ?? formatProductionDailyReportDateTime(row.record)}</dd>
        </div>
        <div>
          <dt>비고</dt>
          <dd>{row.record.note || "—"}</dd>
        </div>
      </dl>
    ) : null;

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

  const handleRegister = (form, meta = { mode: "register", editLotNo: "" }) => {
    const products = form.chargeProducts ?? [];
    if (products.length === 0) return;

    const now = new Date().toISOString();
    const today = now.slice(0, 10);
    const isEdit = meta.mode === "edit" && meta.editLotNo;

    if (isEdit) {
      const originalRecords = getRecordsForProductionLot(meta.editLotNo);
      const nextIds = new Set(products.map((product) => product.managementId?.trim()).filter(Boolean));
      const removedIds = originalRecords
        .map((record) => record.id)
        .filter((id) => !nextIds.has(id));

      if (removedIds.length) {
        const revertResult = revertProductionDailyReportRecords(removedIds);
        if (!revertResult.ok) {
          window.alert(revertResult.reason);
          return;
        }
      }
    }

    for (const product of products) {
      const managementId = product.managementId?.trim();
      if (!managementId) continue;

      const existing = getSessionProductionRecords().find((r) => r.id === managementId);
      if (!existing) {
        window.alert("입고 등록된 관리번호만 열처리일보 등록이 가능합니다.");
        return;
      }
      if (!existing.htlNo?.trim()) {
        window.alert("열처리 작업 요청 리스트 출력 후 열처리일보를 등록할 수 있습니다.");
        return;
      }

      if (!isEdit) {
        const lotCheck = validateLotNoForDailyReportRegister(form.lotNo, existing);
        if (!lotCheck.ok) {
          window.alert(lotCheck.message);
          return;
        }
      }

      const qty = Number(product.qty) || Number(existing.qty) || 0;
      const patch = {
        company: product.company.trim() || existing.company || "—",
        lotNo: form.lotNo.trim(),
        heatTreatment: product.process || existing.heatTreatment,
        partName: product.partName.trim() || existing.partName,
        partNo: product.partNo.trim() || existing.partNo,
        material: product.material.trim() || existing.material,
        qty: qty || existing.qty,
        workDate: form.workDate || today,
        equipment: form.equipment,
        registrar: form.worker.trim() || "관리자",
        heatTreatmentConditions: form.heatTreatmentConditions?.trim() || "",
        heatTreatmentProcessConditions: form.heatTreatmentProcessConditions ?? {},
        note: form.note.trim(),
        registered: true,
        lotCreatedAt: existing.lotCreatedAt || now,
        updatedAt: now,
      };

      onDailyReportSaved(managementId, patch);
    }

    if (!isEdit) {
      appendWorkJournalAutoEntry({
        actionType: WORK_JOURNAL_ACTION_TYPES.PRODUCTION_DAILY_REGISTER,
        assignee: form.worker,
        managementId: products[0]?.managementId,
        company: products[0]?.company || form.chargeProducts?.[0]?.company,
        lotNo: form.lotNo,
        date: form.workDate || today,
        title: `LOT 등록 — ${form.lotNo}`,
      });
      const lotNo = form.lotNo?.trim();
      if (lotNo) QRService.createIfNotExists("lot", lotNo);
    }

    const lastId = products[products.length - 1]?.managementId;
    if (lastId) setActiveId(lastId);
    setRefreshKey((k) => k + 1);
    setPage(1);

    if (!isEdit) {
      setWorkflowNextStep(getWorkflowCompletionDialog("dailyWorkSaveComplete"));
    }
  };

  const openRegisterModal = (managementId = "") => {
    setRegisterMode("register");
    setEditLotNo("");
    setRegisterInitialId(managementId);
    setRegisterOpen(true);
  };

  const openEditModal = (lotNo = "") => {
    const trimmedLot = lotNo?.trim();
    if (!trimmedLot) return;
    setRegisterMode("edit");
    setEditLotNo(trimmedLot);
    setRegisterInitialId("");
    setRegisterOpen(true);
  };

  const handleRowCancelLot = (row) => {
    const lotNo = row?.record?.lotNo?.trim() ?? row?.lotNo?.trim() ?? "";
    if (!lotNo) return;
    const check = canCancelProductionDailyReportLot(lotNo);
    if (!check.ok) {
      window.alert(check.reason);
      return;
    }
    if (!window.confirm(`LOT ${lotNo} 열처리일보 등록을 취소하시겠습니까?`)) return;

    const result = cancelProductionDailyReportLot(lotNo);
    if (!result.ok) {
      window.alert(result.reason);
      return;
    }

    setRefreshKey((k) => k + 1);
    setPage(1);
  };

  const openRowCompleteConfirm = (row) => {
    const record = row?.record ?? row;
    const check = canCompleteProduction(record);
    if (!check.ok) {
      window.alert(check.reason || "열처리 완료할 수 없습니다.");
      return;
    }
    setPendingCompleteRow(row);
    setCompleteConfirmOpen(true);
  };

  const handleRowProductionComplete = () => {
    if (!pendingCompleteRow) return;
    const result = completeProductionRecord(pendingCompleteRow.id, { source: "row-action" });
    setCompleteConfirmOpen(false);
    setPendingCompleteRow(null);

    if (!result.ok) {
      window.alert(result.reason);
      return;
    }

    setRefreshKey((k) => k + 1);
    setWorkflowNextStep(getWorkflowCompletionDialog("productionComplete"));
  };

  const handleRowCancelComplete = (row) => {
    const record = row?.record ?? row;
    const check = canCancelProductionComplete(record);
    if (!check.ok) {
      window.alert(check.reason);
      return;
    }
    if (!window.confirm(`${row.managementId} 열처리완료를 취소하고 열처리중으로 되돌리시겠습니까?`)) {
      return;
    }

    const result = cancelProductionCompleteRecord(row.id, { source: "row-action" });
    if (!result.ok) {
      window.alert(result.reason);
      return;
    }

    setRefreshKey((k) => k + 1);
  };

  const openDetailPopup = (row) => {
    openRowDetailPopup(row, { setActiveId, setDetailPopupRow });
  };

  const handleRowDoubleClick = (row) => {
    openDetailPopup(row);
  };

  return (
    <div className="inbound-page production-page">
      <SectionPageActions>
        <SecondaryButton type="button" onClick={() => openDailyPrintPreview()}>
          <Printer size={14} aria-hidden="true" />
          {PRODUCTION_DAILY_PRINT_LABEL}
        </SecondaryButton>
        <SecondaryButton type="button" onClick={() => openDailyPrintPreview({ exportPdf: true })}>
          <FileDown size={14} aria-hidden="true" />
          {PRODUCTION_DAILY_PDF_LABEL}
        </SecondaryButton>
        <SecondaryButton type="button" onClick={() => openDailyPrintPreview({ exportExcel: true })}>
          <FileSpreadsheet size={14} aria-hidden="true" />
          엑셀 출력
        </SecondaryButton>
        {smartModeActive ? (
          <SecondaryButton type="button" disabled aria-label="Smart Mode 활성">
            <QrCode size={14} aria-hidden="true" />
            Smart · {smartEquipmentContext.name}
          </SecondaryButton>
        ) : null}
      </SectionPageActions>

      <TitanWorkflowNavigation stepId="dailyWork" />

      <TitanKpiBarSlot ariaLabel="열처리 현황" className="inbound-page__kpi">
        <TitanWorkflowStatusChipBar
          chipSetId="production"
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
        basicFields={STANDARD_PRODUCT_BASIC_SEARCH_FIELDS}
        showStatusField
        statusFieldLabel="현재상태"
        advancedContent={
          <TitanStandardProductAdvancedSearch
            draft={draft}
            onDraftChange={onDraftChange}
            getSuggestions={getSuggestions}
            productionDateFromKey="workDateFrom"
            productionDateToKey="workDateTo"
          />
        }
      />

      {smartModeActive ? (
        <SmartProduciblePanel
          equipmentContext={smartEquipmentContext}
          refreshKey={refreshKey}
          onSelectRecord={(record) => openRegisterModal(record.id)}
        />
      ) : null}

      <div className="inbound-page__list quality-page__list production-page__list-column">
        <div className="production-page__table-area">
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
            emptyMessage="표시할 LOT · 작업일보가 없습니다."
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

      <DailyProductionReportRegisterModal
        open={registerOpen}
        initialManagementId={registerInitialId}
        mode={registerMode}
        editLotNo={editLotNo}
        onClose={() => {
          setRegisterOpen(false);
          setRegisterInitialId("");
          setRegisterMode("register");
          setEditLotNo("");
        }}
        onRegister={handleRegister}
      />

      <TitanPrintPreviewModal
        open={dailyPrintOpen}
        onClose={closeDailyPrintPreview}
        title={`${dailyPrintMeta?.label ?? "열처리일보"} 출력 미리보기`}
        onPrint={handleDailyPrint}
        onPdf={handleDailyPdf}
        busy={dailyPrintBusy}
      >
        {dailyPrintProps ? <ProductionDailyReportPrint {...dailyPrintProps} /> : null}
      </TitanPrintPreviewModal>

      <ProductionCompleteConfirmDialog
        open={completeConfirmOpen}
        count={1}
        onConfirm={handleRowProductionComplete}
        onCancel={() => {
          setCompleteConfirmOpen(false);
          setPendingCompleteRow(null);
        }}
      />

      <ProductionDailyReportNoSelectionDialog
        open={noSelectionOpen}
        onClose={() => setNoSelectionOpen(false)}
      />

      <ProductionDailyReportLotSelectDialog
        open={lotSelectOpen}
        lotGroups={lotSelectGroups}
        onConfirm={handleLotSelectConfirm}
        onCancel={handleLotSelectCancel}
      />

      <ProductionDailyReportPartialLotDialog
        open={partialLotOpen}
        lotNo={partialLotState?.lotNo ?? ""}
        selectedCount={partialLotState?.selectedCount ?? 0}
        totalCount={partialLotState?.totalCount ?? 0}
        onPrintSelected={handlePartialLotPrintSelected}
        onPrintAllLot={handlePartialLotPrintAll}
        onCancel={handlePartialLotCancel}
      />

      <TitanScreenDetailPopup
        screenKey="dailyProductionReport"
        open={Boolean(detailPopupRow)}
        onClose={() => setDetailPopupRow(null)}
        record={detailPopupRow}
        context={{
          onSelectCoLotProduct: (id) => {
            const target = rows.find((row) => row.managementId === id || row.id === id);
            if (target) {
              setActiveId(target.id);
              setDetailPopupRow(target);
            }
          },
        }}
      />

      <TitanWorkflowNextStepDialog
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
