import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, CheckCircle2, Factory, Layers, Printer, X } from "lucide-react";

import { OPERATION_ROUTES, getOperationsWorkflowNextStep } from "../../config/operationsRouteRegistry";
import { OperationsWorkflowNextDialog } from "../InOut/OutboundStatementPromptDialog";
import "../../foundation/components/OperationsWorkflowNextDialog.css";

import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanSearchAutocomplete from "../../foundation/components/TitanSearchAutocomplete";
import TitanSearchPanel, { useSearchSuggestionHelpers } from "../../foundation/components/TitanSearchPanel";
import TitanStandardProductAdvancedSearch from "../../foundation/components/TitanStandardProductAdvancedSearch";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import TitanKpiBarSlot from "../../foundation/components/TitanKpiBarSlot";
import TitanWorkflowStatusChipBar from "../../foundation/components/TitanWorkflowStatusChipBar";
import StatusChip from "../../foundation/components/StatusChip";
import {
  createEmptyInboundSearch,
  matchesBasicSearch,
  STANDARD_PRODUCT_BASIC_SEARCH_FIELDS,
} from "../../config/listSearchStandard";
import { getProductionProcessCodes } from "../../config/productionProcessCodes";
import { useTitanListSearch } from "../../foundation/hooks/useTitanListSearch";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import { getMasterDataByCategory } from "../../utils/masterData";
import { matchesInboundDataSearch } from "../../utils/inboundDataFields";
import { buildMetricChipItems } from "../../utils/kpiMetricChipItems";
import { getProductionPlanScreenData } from "../../utils/productionWorkspaceData";
import { mapRecordToPlanRow } from "../../utils/productionPlanLot";
import { mapV13ProductListRow } from "../../utils/processFlow";
import { EQUIPMENT_RUN_STATUS_META } from "../../config/equipmentConfig";
import { getTitanDataEngine } from "../../foundation/data";
import { getEquipmentList, createManualChargeableLot } from "../../utils/equipmentWorkflowService";
import { getPrintOutputDate } from "../../utils/titanPrintDates";
import { getSessionProductionRecords } from "../../utils/productionRecords";
import { generateProductionLotNo } from "../../utils/productionLotNumber";
import { QRService } from "../../utils/qrEngineRegistryService";
import SectionPageActions from "../../foundation/layout/SectionPageActions";
import "../InOut/InboundManagement.css";
import "../Inventory/InventoryStatus.css";
import "./ProductionManagement.css";

function mapPlanListRow(record) {
  const planRow = mapRecordToPlanRow(record);
  const status = planRow.lotNo?.trim()
    ? { label: "LOT생성", variant: "production" }
    : { label: "열처리대기", variant: "wait" };
  const base = mapV13ProductListRow(record, status, { screenKey: "production-plan" });
  return {
    ...base,
    lotNo: planRow.lotNo || "—",
    htlNo: planRow.htlNo || "—",
    record,
  };
}

function matchesPlanSearch(record, row, search) {
  if (!matchesBasicSearch(search, row)) return false;
  if (!matchesInboundDataSearch(search, record)) return false;
  return true;
}

function normalizeEquipmentSearchText(value) {
  return String(value ?? "").replace(/[\s-]+/g, "").toLowerCase();
}

function resolveEquipmentStatusLabel(status) {
  if (status === "running") return "작업중";
  if (status === "maintenance") return "점검중";
  if (status === "ready") return "장입 준비";
  return "대기";
}

function buildEquipmentOptionLabel(equipment) {
  return `${equipment.name}      ${resolveEquipmentStatusLabel(equipment.status)}`;
}

function buildLotNumberRecords() {
  const dataEngine = getTitanDataEngine();
  const lotRows = dataEngine.lot.list().map((row) => ({ lotNo: row.lotNo }));
  const equipmentLots = dataEngine.equipment.list().flatMap((equipment) =>
    (equipment.chargeableLots ?? []).map((row) => ({ lotNo: row.lotNo }))
  );
  return [...getSessionProductionRecords(), ...lotRows, ...equipmentLots];
}

function resolvePlanRecordValue(record, keys, fallback = "—") {
  for (const key of keys) {
    const value = record?.[key];
    if (value != null && String(value).trim()) return value;
  }
  return fallback;
}

function mapProductionWaitingRow(record) {
  const planRow = mapRecordToPlanRow(record);
  const qty = Number(resolvePlanRecordValue(record, ["qty", "quantity", "incomingQty"], 0)) || 0;
  return {
    ...mapPlanListRow(record),
    sourceRecord: record,
    managementId: resolvePlanRecordValue(record, ["mesManagementNo", "managementId", "id"]),
    companyLabel: resolvePlanRecordValue(record, ["company", "companyName"]),
    productNameLabel: resolvePlanRecordValue(record, ["partName", "productName", "itemName"]),
    partNoLabel: resolvePlanRecordValue(record, ["partNo", "productNo", "itemNo"]),
    materialLabel: resolvePlanRecordValue(record, ["material", "materialName"]),
    qtyLabel: qty ? qty.toLocaleString("ko-KR") : "—",
    qtyValue: qty,
    planDateLabel: resolvePlanRecordValue(record, ["dueDate", "incomingDate", "registeredAt"]),
    lotStatusLabel: planRow.lotNo?.trim() ? "LOT 생성 완료" : "LOT 미생성",
    productionStatusLabel: planRow.lotNo?.trim() ? "LOT 생성 완료" : "생산대기",
  };
}

const PRODUCTION_WAITING_COLUMNS = [
  { key: "managementId", label: "관리번호", widthHint: "id", identifier: true },
  { key: "companyLabel", label: "업체명", widthHint: "company" },
  { key: "productNameLabel", label: "품명", widthHint: "product" },
  { key: "partNoLabel", label: "품번", widthHint: "partNo" },
  { key: "materialLabel", label: "재질", widthHint: "material" },
  { key: "qtyLabel", label: "수량", widthHint: "qty" },
  {
    key: "productionStatusLabel",
    label: "상태",
    widthHint: "status",
    render: (row) => (
      <StatusChip variant={row.productionStatusLabel === "LOT 생성 완료" ? "production" : "wait"}>
        {row.productionStatusLabel}
      </StatusChip>
    ),
  },
  {
    key: "lotStatusLabel",
    label: "LOT 여부",
    widthHint: "status",
    render: (row) => (
      <StatusChip variant={row.lotStatusLabel === "LOT 생성 완료" ? "success" : "hold"}>
        {row.lotStatusLabel}
      </StatusChip>
    ),
  },
];

export default function ProductionPlanWorkspace() {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeRowId, setActiveRowId] = useState("");
  const [lotPopupRow, setLotPopupRow] = useState(null);
  const [equipmentQuery, setEquipmentQuery] = useState("");
  const [selectedEquipmentId, setSelectedEquipmentId] = useState("");
  const [productionDate, setProductionDate] = useState(getPrintOutputDate());
  const [popupError, setPopupError] = useState("");
  const [createdResult, setCreatedResult] = useState(null);
  const [workflowNextStep, setWorkflowNextStep] = useState(null);

  const { search, draft, onDraftChange, onSearch, onReset, advancedOpen, onAdvancedToggle } =
    useTitanListSearch(createEmptyInboundSearch, { storageKey: "production-plan" });

  const companies = useMemo(() => getMasterDataByCategory("companies"), []);
  const processCodes = useMemo(() => getProductionProcessCodes(), []);

  const { baseRecords: workspaceRecords, counts: planCounts } = useMemo(() => {
    void refreshKey;
    return getProductionPlanScreenData();
  }, [refreshKey]);

  const kpiItems = useMemo(
    () =>
      buildMetricChipItems([
        {
          id: "htWait",
          label: "열처리 대기",
          value: planCounts.htWait,
          unit: "건",
          tone: "incoming",
          icon: CalendarDays,
        },
        {
          id: "lotPending",
          label: "LOT 미생성",
          value: planCounts.lotPending,
          unit: "건",
          tone: "hold",
          icon: Layers,
        },
      ]),
    [planCounts]
  );

  const { getSuggestions } = useSearchSuggestionHelpers(workspaceRecords, {
    process: processCodes.map((item) => item.name),
  });

  const rows = useMemo(() => {
    return workspaceRecords
      .map(mapProductionWaitingRow)
      .filter((row) => matchesPlanSearch(row.record, row, search))
      .sort((a, b) => b.managementId.localeCompare(a.managementId));
  }, [workspaceRecords, search]);

  const {
    page,
    pageSize,
    totalCount,
    totalPages,
    pagedItems: pagedRows,
    setPage,
    setPageSize,
  } = useListPagination(rows);

  const columns = useMemo(() => PRODUCTION_WAITING_COLUMNS, []);

  const bumpRefresh = useCallback(() => setRefreshKey((key) => key + 1), []);

  const equipmentList = useMemo(() => {
    void refreshKey;
    return getEquipmentList();
  }, [refreshKey]);
  const selectedEquipment = useMemo(
    () => equipmentList.find((equipment) => equipment.id === selectedEquipmentId) ?? null,
    [equipmentList, selectedEquipmentId]
  );
  const equipmentOptions = useMemo(
    () =>
      equipmentList.map((equipment) => ({
        equipment,
        label: buildEquipmentOptionLabel(equipment),
        searchText: normalizeEquipmentSearchText(
          `${equipment.id} ${equipment.name} ${equipment.code ?? ""} ${equipment.process} ${EQUIPMENT_RUN_STATUS_META[equipment.status]?.label ?? ""} ${resolveEquipmentStatusLabel(equipment.status)}`
        ),
      })),
    [equipmentList]
  );
  const equipmentSuggestions = useMemo(() => {
    const keyword = normalizeEquipmentSearchText(equipmentQuery);
    const filtered = keyword ? equipmentOptions.filter((option) => option.searchText.includes(keyword)) : equipmentOptions;
    return filtered.slice(0, 20).map((option) => option.label);
  }, [equipmentOptions, equipmentQuery]);
  const previewLotNo = useMemo(() => {
    if (!selectedEquipment || !productionDate) return "";
    return generateProductionLotNo({
      workDate: productionDate,
      equipment: selectedEquipment.name,
      records: buildLotNumberRecords(),
    });
  }, [selectedEquipment, productionDate, refreshKey]);

  const resetPopupState = () => {
    setEquipmentQuery("");
    setSelectedEquipmentId("");
    setProductionDate(getPrintOutputDate());
    setPopupError("");
  };

  const openLotPopup = (row) => {
    setActiveRowId(row.id);
    setLotPopupRow(row);
    setCreatedResult(null);
    resetPopupState();
  };

  const closeLotPopup = () => {
    setLotPopupRow(null);
    resetPopupState();
  };

  const handleEquipmentSelect = (label) => {
    const keyword = normalizeEquipmentSearchText(label);
    const matched =
      equipmentOptions.find((option) => option.label === label) ??
      equipmentOptions.find((option) => keyword && option.searchText.includes(keyword));
    if (!matched) {
      setSelectedEquipmentId("");
      setEquipmentQuery(label);
      return;
    }
    setSelectedEquipmentId(matched.equipment.id);
    setEquipmentQuery(matched.label);
    setPopupError("");
  };

  const handleCreateLotFromPopup = () => {
    if (!lotPopupRow) return;
    if (!selectedEquipment) {
      setPopupError("설비를 선택하세요.");
      return;
    }
    if (!productionDate) {
      setPopupError("생산일을 입력하세요.");
      return;
    }
    if (!previewLotNo) {
      setPopupError("LOT 번호를 생성할 수 없습니다. 설비와 생산일을 확인하세요.");
      return;
    }

    const result = createManualChargeableLot({
      equipmentId: selectedEquipment.id,
      lotNo: previewLotNo,
      workDate: productionDate,
      sourceRecordId: lotPopupRow.sourceRecord?.id,
      managementId: lotPopupRow.managementId,
      company: lotPopupRow.companyLabel,
      productName: lotPopupRow.productNameLabel,
      partNo: lotPopupRow.partNoLabel,
      material: lotPopupRow.materialLabel,
      qty: lotPopupRow.qtyValue,
    });

    if (!result.ok) {
      setPopupError(result.message);
      return;
    }

    QRService.createIfNotExists("lot", result.lotNo);
    setCreatedResult(result);
    setPopupError("");
    bumpRefresh();
    closeLotPopup();
    setWorkflowNextStep(getOperationsWorkflowNextStep("productionLotCreated"));
  };

  const handleOpenProductionWaitingOutput = () =>
    navigate(`${OPERATION_ROUTES.inboundPending}?shortcut=production-waiting-output`);

  return (
    <div className="inbound-page inventory-status-page production-plan-page">
      <SectionPageActions>
        <SecondaryButton type="button" onClick={handleOpenProductionWaitingOutput}>
          <Printer size={16} aria-hidden />
          생산 대기 리스트 출력
        </SecondaryButton>
      </SectionPageActions>

      <TitanKpiBarSlot ariaLabel="생산 대기 KPI" className="inbound-page__kpi">
        <TitanWorkflowStatusChipBar items={kpiItems} ariaLabel="생산 대기 KPI" />
      </TitanKpiBarSlot>

      <TitanSearchPanel
        draft={draft}
        onDraftChange={onDraftChange}
        onSearch={onSearch}
        onReset={onReset}
        advancedOpen={advancedOpen}
        onAdvancedToggle={onAdvancedToggle}
        companies={companies}
        records={workspaceRecords}
        basicFields={STANDARD_PRODUCT_BASIC_SEARCH_FIELDS}
        advancedContent={
          <TitanStandardProductAdvancedSearch
            draft={draft}
            onDraftChange={onDraftChange}
            getSuggestions={getSuggestions}
          />
        }
      />

      <section className="production-plan-page__list-card" aria-label="생산 대기 리스트">
        <div className="manual-lot-page__section-head">
          <h3>생산 대기 리스트</h3>
          <span className="manual-lot-page__count">{totalCount.toLocaleString("ko-KR")}건</span>
        </div>
          <TitanDataTable
            layout="compact"
            columns={columns}
            rows={pagedRows}
            activeRowId={activeRowId}
            onRowClick={openLotPopup}
            onRowDoubleClick={openLotPopup}
            emptyMessage="열처리 대기(HT_WAIT) 제품이 없습니다."
            ariaLabel="생산 대기 리스트"
          />
          <TitanTableFooter
            totalCount={totalCount}
            page={page}
            pageSize={pageSize}
            totalPages={totalPages}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
      </section>

      {lotPopupRow ? (
        <div className="production-lot-popup" role="dialog" aria-modal="true" aria-label="LOT 생성">
          <div className="production-lot-popup__panel">
            <header className="production-lot-popup__header">
              <div>
                <p className="manual-lot-page__eyebrow">Production Plan Action</p>
                <h3>LOT 생성</h3>
              </div>
              <button type="button" className="production-lot-popup__close" onClick={closeLotPopup} aria-label="닫기">
                <X size={18} aria-hidden />
              </button>
            </header>

            <dl className="production-lot-popup__summary">
              <div>
                <dt>업체명</dt>
                <dd>{lotPopupRow.companyLabel}</dd>
              </div>
              <div>
                <dt>품명</dt>
                <dd>{lotPopupRow.productNameLabel}</dd>
              </div>
              <div>
                <dt>품번</dt>
                <dd>{lotPopupRow.partNoLabel}</dd>
              </div>
              <div>
                <dt>재질</dt>
                <dd>{lotPopupRow.materialLabel}</dd>
              </div>
              <div>
                <dt>수량</dt>
                <dd>{lotPopupRow.qtyLabel}</dd>
              </div>
              <div>
                <dt>생산일</dt>
                <dd>
                  <input
                    className="titan-input"
                    type="date"
                    value={productionDate}
                    onChange={(event) => {
                      setProductionDate(event.target.value);
                      setPopupError("");
                      setCreatedResult(null);
                    }}
                  />
                </dd>
              </div>
              <div>
                <dt>설비 선택</dt>
                <dd>
                  <TitanSearchAutocomplete
                    fieldKey="productionPlanLotEquipment"
                    value={equipmentQuery}
                    onChange={(value) => {
                      setEquipmentQuery(value);
                      setSelectedEquipmentId("");
                      setPopupError("");
                      setCreatedResult(null);
                    }}
                    onSelect={handleEquipmentSelect}
                    suggestions={equipmentSuggestions}
                    placeholder="66 / 3S / 10S / 이온 / 연질화"
                  />
                </dd>
              </div>
              <div>
                <dt>생성될 LOT번호</dt>
                <dd className="manual-lot-page__lot-no">{previewLotNo || "설비 선택 후 자동 Preview"}</dd>
              </div>
              <div>
                <dt>설비 상태</dt>
                <dd>
                  {selectedEquipment ? (
                    <StatusChip variant={EQUIPMENT_RUN_STATUS_META[selectedEquipment.status]?.variant ?? "wait"}>
                      {EQUIPMENT_RUN_STATUS_META[selectedEquipment.status]?.emoji} {resolveEquipmentStatusLabel(selectedEquipment.status)}
                    </StatusChip>
                  ) : (
                    <StatusChip variant="wait">설비 미선택</StatusChip>
                  )}
                </dd>
              </div>
            </dl>

            {popupError ? <p className="manual-lot-page__error" role="alert">{popupError}</p> : null}

            {createdResult ? (
              <div className="manual-lot-page__success manual-lot-page__toast" role="status" aria-live="polite">
                <CheckCircle2 size={18} aria-hidden />
                <div>
                  <strong>LOT 생성 완료</strong>
                  <span>{createdResult.lotNo}</span>
                </div>
              </div>
            ) : null}

            <footer className="production-lot-popup__footer">
              <SecondaryButton type="button" onClick={closeLotPopup}>
                취소
              </SecondaryButton>
              <PrimaryButton type="button" onClick={handleCreateLotFromPopup}>
                <Factory size={14} aria-hidden />
                LOT 생성
              </PrimaryButton>
            </footer>
          </div>
        </div>
      ) : null}

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
