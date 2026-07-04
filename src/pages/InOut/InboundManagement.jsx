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
import TitanScreenDetailPopup from "../../foundation/components/TitanScreenDetailPopup";
import InboundRowActions from "./InboundRowActions";
import { INBOUND_KPI_CONFIG } from "../../config/inboundDashboard";
import InOutListPrintPreviewModal from "../../components/print/InOutListPrintPreviewModal";
import { TITAN_PRINT_DOCUMENT_TYPES } from "../../config/titanPrintDocuments";
import { createEmptyInboundSearch, STANDARD_PRODUCT_BASIC_SEARCH_FIELDS, matchesBasicSearch } from "../../config/listSearchStandard";
import { buildInboundListColumns } from "../../config/standardProductList";
import { matchesInboundDataSearch } from "../../utils/inboundDataFields";
import { getProductionProcessCodes, getProductionProcessName } from "../../config/productionProcessCodes";
import { getHeatTreatmentProcessTone } from "../../config/heatTreatmentProcessColors";
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
import { isIncomingRegistered } from "../../utils/productionRecords";
import { buildInOutListPrintProps } from "../../utils/inOutListPrintRows";
import { getPrintOutputDate } from "../../utils/titanPrintDates";
import { formatMultiSelectCompany } from "../../utils/selectionDisplay";
import IncomingRegistrationModal from "../Incoming/IncomingRegistrationModal";
import {
  INBOUND_STATUS_LABELS,
  filterInboundManagementRecords,
  getInboundManagementStatus,
  isInboundShipOutComplete,
} from "../../utils/inboundManagementStatus";
import { getProcessFlowSteps, mapV13ProductListRow } from "../../utils/processFlow";
import { applyHtlWorkListPrinted } from "../../utils/titanWorkflowStatus";
import { isHtlFirstPrintTarget, resolveHtlPrintRows } from "../../utils/htlPrintEligibility";
import { openRowDetailPopup } from "../../foundation/utils/openRowDetailPopup";
import SectionPageActions from "../../foundation/layout/SectionPageActions";
import "./InboundManagement.css";

const INBOUND_STATUS_OPTIONS = Object.values(INBOUND_STATUS_LABELS);

function mapInboundListRow(record) {
  const status = isInboundShipOutComplete(record)
    ? { label: "출고완료", variant: "complete" }
    : getInboundManagementStatus(record);
  const base = mapV13ProductListRow(record, status);
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

function resolveInboundListRecords(search) {
  const all = getSessionProductionRecords();
  if (search.__chipProductShipDone) {
    return all.filter((record) => isIncomingRegistered(record) && isInboundShipOutComplete(record));
  }
  return filterInboundManagementRecords(all);
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
  const [registerMode, setRegisterMode] = useState("create");
  const [editRecordId, setEditRecordId] = useState(null);
  const [registerInitialForm, setRegisterInitialForm] = useState(null);
  const { search, draft, onDraftChange, onSearch, onReset, advancedOpen, onAdvancedToggle } =
    useTitanListSearch(createEmptyInboundSearch, { storageKey: "inbound" });
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [detailPopupRow, setDetailPopupRow] = useState(null);
  const [inOutPrintSession, setInOutPrintSession] = useState({ open: false, props: null });
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
    manager: getMasterDataByCategory("workers").map((item) => item.name).filter(Boolean),
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
    const incomingRows = rows.filter((row) => isIncomingRegistered(row.record ?? row));
    if (incomingRows.length > 0) return incomingRows;
    return [];
  }, [selectedRows, activeRow, rows]);

  const resolvedPrintRows = useMemo(() => {
    const htl = resolveHtlPrintRows(printTargetRows);
    if (htl.rows.length > 0) return htl;
    const registered = printTargetRows.filter((row) => isIncomingRegistered(row.record ?? row));
    if (registered.length > 0) return { rows: registered, mode: "presentation" };
    return { rows: [], mode: "none" };
  }, [printTargetRows]);

  const handleInOutPrinted = useCallback(
    (printProps) => {
      if (!printProps?.listNo || !printProps?.rows?.length) return;
      const managementIds = printProps.rows.map((row) => row.managementId ?? row.id);
      applyHtlWorkListPrinted(managementIds, printProps.listNo, {
        isReprint: printProps.printMode === "reprint",
      });
      setRefreshKey((key) => key + 1);
    },
    []
  );

  const openInOutPrintPreview = () => {
    if (resolvedPrintRows.rows.length === 0) {
      window.alert("출력할 입고 등록 제품이 없습니다.");
      return;
    }
    setInOutPrintSession({
      open: true,
      props: buildInOutListPrintProps(resolvedPrintRows.rows, {
        listNoPrefix: "HTL",
        outputDate: getPrintOutputDate(),
        records: getSessionProductionRecords(),
        printMode: resolvedPrintRows.mode,
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

  const renderProcessChip = (row) =>
    row.currentProcess && row.currentProcess !== "—" ? (
      <StatusChip kind="process" variant={getHeatTreatmentProcessTone(row.currentProcess)}>
        {row.currentProcess}
      </StatusChip>
    ) : (
      "—"
    );

  const columns = useMemo(
    () =>
      buildInboundListColumns({
        renderProcess: renderProcessChip,
        renderActions: (row) => (
          <InboundRowActions
            onDetail={() => {
              setActiveId(row.id);
              setDetailPopupRow(row);
            }}
            onEdit={() => openEditModal(row)}
            onDelete={() => handleInboundDelete(row)}
          />
        ),
      }),
    []
  );

  const detailRows = selectedRows.length > 0 ? selectedRows : activeRow ? [activeRow] : [];
  const companySummary = formatMultiSelectCompany(detailRows);
  const processFlowSteps = activeRow
    ? getProcessFlowSteps(activeRow.record, activeRow.statusLabel)
    : [];

  const detailPopupProcessSteps = detailPopupRow
    ? getProcessFlowSteps(detailPopupRow.record, detailPopupRow.statusLabel)
    : [];

  const buildInboundDetailContent = (row, companyLabel) =>
    row ? (
      <dl className="inbound-detail">
        <div>
          <dt>발주번호</dt>
          <dd>{row.purchaseOrderNo}</dd>
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
          <dt>업체 LOT</dt>
          <dd>{row.customerLotNo}</dd>
        </div>
        <div>
          <dt>업체명</dt>
          <dd>{companyLabel}</dd>
        </div>
        <div>
          <dt>담당자</dt>
          <dd>{row.managerName}</dd>
        </div>
        <div>
          <dt>품명</dt>
          <dd>{row.partName}</dd>
        </div>
        <div>
          <dt>품번</dt>
          <dd>{row.partNo}</dd>
        </div>
        <div>
          <dt>재질</dt>
          <dd>{row.material}</dd>
        </div>
        <div>
          <dt>공정</dt>
          <dd>
            {row.processName && row.processName !== "—" ? (
              <StatusChip kind="process" variant={getHeatTreatmentProcessTone(row.processName)}>
                {row.processName}
              </StatusChip>
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
          <dt>입고일</dt>
          <dd>{row.record.incomingDate || "—"}</dd>
        </div>
        <div>
          <dt>납기</dt>
          <dd>{row.record.dueDate || "—"}</dd>
        </div>
        <div>
          <dt>현재상태</dt>
          <dd>
            <StatusChip variant={row.statusVariant}>{row.statusLabel}</StatusChip>
          </dd>
        </div>
      </dl>
    ) : null;

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
        <SecondaryButton type="button" onClick={() => openEditModal(activeRow)} disabled={!activeRow}>
          {INBOUND_EDIT_LABEL}
        </SecondaryButton>
        <SecondaryButton type="button" onClick={openInOutPrintPreview} disabled={resolvedPrintRows.rows.length === 0}>
          <Printer size={14} aria-hidden="true" />
          {INBOUND_LIST_PRINT_TOOLBAR_LABEL}
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
              <SecondaryButton type="button" onClick={openInOutPrintPreview} disabled={resolvedPrintRows.rows.length === 0}>
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

      <TitanScreenDetailPopup
        screenKey="inbound"
        open={Boolean(detailPopupRow)}
        onClose={() => setDetailPopupRow(null)}
        record={detailPopupRow}
        context={{
          detailContent: buildInboundDetailContent(
            detailPopupRow,
            detailPopupRow ? formatMultiSelectCompany([detailPopupRow]) : ""
          ),
          traceRecord: detailPopupRow?.record ?? detailPopupRow,
          processFlowSteps: detailPopupProcessSteps,
          statusLabel: detailPopupRow?.statusLabel,
          statusVariant: detailPopupRow?.statusVariant,
          onSelectCoLotProduct: (id) => {
            const target = rows.find((row) => row.id === id || row.managementId === id);
            if (target) {
              setActiveId(target.id);
              setDetailPopupRow(target);
            }
          },
        }}
      />
    </div>
  );
}
