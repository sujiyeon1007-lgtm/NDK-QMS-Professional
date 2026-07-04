import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FileDown, FileSpreadsheet, Pencil, Plus, Printer, QrCode, XCircle } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import TitanSearchPanel, { useSearchSuggestionHelpers } from "../../foundation/components/TitanSearchPanel";
import TitanStandardProductAdvancedSearch from "../../foundation/components/TitanStandardProductAdvancedSearch";
import StatusChip from "../../foundation/components/StatusChip";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import TitanScreenDetailPopup from "../../foundation/components/TitanScreenDetailPopup";
import TitanPrintPreviewModal from "../../components/print/TitanPrintPreviewModal";
import ProductionDailyReportPrint from "../../components/print/ProductionDailyReportPrint";
import { getPrintDocumentMeta, TITAN_PRINT_DOCUMENT_TYPES } from "../../config/titanPrintDocuments";
import {
  createEmptyProductionDailyReportSearch,
  matchesBasicSearch,
  STANDARD_PRODUCT_BASIC_SEARCH_FIELDS,
} from "../../config/listSearchStandard";
import {
  getProcessChipVariant,
  getProductionProcessCodes,
  getProductionProcessName,
} from "../../config/productionProcessCodes";
import { buildV13ProductListColumns } from "../../config/standardProductList";
import { useTitanListSearch } from "../../foundation/hooks/useTitanListSearch";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import { getMasterDataByCategory } from "../../utils/masterData";
import {
  getSessionProductionRecords,
} from "../../utils/productionRecords";
import {
  APPROVAL_STATUS_OPTIONS,
  filterProductionDailyReportRecords,
  formatProductionDailyReportDateTime,
  getProductionDailyReportApprovalStatus,
  getProductionDailyReportStatus,
} from "../../utils/productionDailyReportStatus";
import { getProcessFlowSteps, mapV13ProductListRow } from "../../utils/processFlow";
import { validateLotNoForDailyReportRegister } from "../../utils/lotFormatValidation";
import { onDailyReportSaved } from "../../utils/titanWorkflowStatus";
import {
  PRODUCTION_DAILY_REGISTER_LABEL,
  PRODUCTION_DAILY_PRINT_LABEL,
  PRODUCTION_DAILY_EDIT_LABEL,
  PRODUCTION_DAILY_CANCEL_LABEL,
  PRODUCTION_DAILY_PDF_LABEL,
} from "../../config/registerModalStandard";
import { getPrintOutputDate } from "../../utils/titanPrintDates";
import {
  buildProductionDailyReportPrintBundles,
  getRecordsForProductionLot,
  isProductionDailyReportPrintReady,
} from "../../utils/productionDailyReportPrintData";
import { exportTitanPdf, printTitanDocument } from "../../utils/titanPrintExport";
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
import { SMART_WORK_DAILY_QUERY } from "../../config/titanV11Workflow";
import "../InOut/InboundManagement.css";
import { openRowDetailPopup } from "../../foundation/utils/openRowDetailPopup";
import SectionPageActions from "../../foundation/layout/SectionPageActions";
import "./ProductionManagement.css";

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
  if (search.qty && !String(record.qty).includes(search.qty)) return false;
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
  return true;
}

function mapRecordToRow(record) {
  return mapV13ProductListRow(record, getProductionDailyReportStatus(record));
}

export default function DailyProductionReport() {
  const [searchParams] = useSearchParams();
  const [refreshKey, setRefreshKey] = useState(0);
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
  const pendingPdfExportRef = useRef(false);
  const chipRecords = useMemo(() => getSessionProductionRecords(), [refreshKey]);
  const { activeChipId, handleChipClick } = useWorkflowChipFilter({
    draft,
    onDraftChange,
    onReset,
  });

  const companies = useMemo(() => getMasterDataByCategory("companies"), []);
  const equipmentList = useMemo(() => getMasterDataByCategory("equipment"), []);
  const processCodes = useMemo(() => getProductionProcessCodes(), []);
  const searchRecords = useMemo(
    () => filterProductionDailyReportRecords(getSessionProductionRecords()),
    [refreshKey]
  );
  const { getSuggestions } = useSearchSuggestionHelpers(searchRecords, {
    process: processCodes.map((item) => item.name),
    equipment: equipmentList.map((item) => item.name ?? item.code),
  });

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

  const canPrintDailyReport = useMemo(
    () => printTargetRows.some((row) => isProductionDailyReportPrintReady(row.record ?? row)),
    [printTargetRows]
  );

  const activeLotNo = activeRow?.record?.lotNo?.trim() ?? "";
  const canEditOrCancelLot = useMemo(
    () =>
      Boolean(
        activeRow &&
          isProductionDailyReportPrintReady(activeRow.record) &&
          !isProductionComplete(activeRow.record)
      ),
    [activeRow]
  );
  const cancelLotCheck = useMemo(() => {
    if (!canEditOrCancelLot || !activeLotNo) return { ok: false };
    return canCancelProductionDailyReportLot(activeLotNo);
  }, [canEditOrCancelLot, activeLotNo, refreshKey]);

  const openDailyPrintPreview = (options = {}) => {
    if (printTargetRows.length === 0) return;

    const bundles = buildProductionDailyReportPrintBundles(printTargetRows, getSessionProductionRecords(), {
      outputDate: getPrintOutputDate(),
    });

    if (!bundles.length) {
      window.alert("생산일보 등록(LOT) 후 출력할 수 있습니다.");
      return;
    }

    pendingPdfExportRef.current = Boolean(options.exportPdf);
    setDailyPrintProps({
      bundles,
      outputDate: getPrintOutputDate(),
    });
    setDailyPrintOpen(true);
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

  const dailyPrintMeta = getPrintDocumentMeta(TITAN_PRINT_DOCUMENT_TYPES.PRODUCTION_DAILY_REPORT);

  const renderProcessChip = (row) =>
    row.currentProcess && row.currentProcess !== "—" ? (
      <StatusChip variant={getProcessChipVariant(row.currentProcess)}>{row.currentProcess}</StatusChip>
    ) : (
      "—"
    );

  const columns = useMemo(
    () =>
      buildV13ProductListColumns({
        renderCurrentProcess: renderProcessChip,
        renderActions: (row) => {
          const record = row.record ?? row;
          const completeCheck = canCompleteProduction(record);
          const cancelCheck = canCancelProductionComplete(record);
          return (
            <ProductionDailyRowActions
              onDetail={() => {
                setActiveId(row.id);
                setDetailPopupRow(row);
              }}
              canComplete={completeCheck.ok}
              canCancelComplete={cancelCheck.ok}
              onComplete={() => openRowCompleteConfirm(row)}
              onCancelComplete={() => handleRowCancelComplete(row)}
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
        window.alert("입고 등록된 관리번호만 생산일보 등록이 가능합니다.");
        return;
      }
      if (!existing.htlNo?.trim()) {
        window.alert("열처리 작업 요청 리스트 출력 후 생산일보를 등록할 수 있습니다.");
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
        note: form.note.trim(),
        registered: true,
        lotCreatedAt: existing.lotCreatedAt || now,
        updatedAt: now,
      };

      onDailyReportSaved(managementId, patch);
    }

    const lastId = products[products.length - 1]?.managementId;
    if (lastId) setActiveId(lastId);
    setRefreshKey((k) => k + 1);
    setPage(1);
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

  const handleCancelLot = () => {
    if (!activeLotNo) return;
    const check = canCancelProductionDailyReportLot(activeLotNo);
    if (!check.ok) {
      window.alert(check.reason);
      return;
    }
    if (!window.confirm(`LOT ${activeLotNo} 생산일보 등록을 취소하시겠습니까?`)) return;

    const result = cancelProductionDailyReportLot(activeLotNo);
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
      window.alert(check.reason || "생산 완료할 수 없습니다.");
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
  };

  const handleRowCancelComplete = (row) => {
    const record = row?.record ?? row;
    const check = canCancelProductionComplete(record);
    if (!check.ok) {
      window.alert(check.reason);
      return;
    }
    if (!window.confirm(`${row.managementId} 생산완료를 취소하고 생산중으로 되돌리시겠습니까?`)) {
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
        <PrimaryButton type="button" onClick={() => openRegisterModal()}>
          <Plus size={14} aria-hidden="true" />
          {PRODUCTION_DAILY_REGISTER_LABEL}
        </PrimaryButton>
        <SecondaryButton type="button" onClick={() => openDailyPrintPreview()} disabled={!canPrintDailyReport}>
          <Printer size={14} aria-hidden="true" />
          {PRODUCTION_DAILY_PRINT_LABEL}
        </SecondaryButton>
        <SecondaryButton
          type="button"
          onClick={() => openDailyPrintPreview({ exportPdf: true })}
          disabled={!canPrintDailyReport}
        >
          <FileDown size={14} aria-hidden="true" />
          {PRODUCTION_DAILY_PDF_LABEL}
        </SecondaryButton>
        <SecondaryButton type="button">
          <FileSpreadsheet size={14} aria-hidden="true" />
          엑셀 출력
        </SecondaryButton>
        <SecondaryButton
          type="button"
          onClick={() => openEditModal(activeLotNo)}
          disabled={!canEditOrCancelLot}
        >
          <Pencil size={14} aria-hidden="true" />
          {PRODUCTION_DAILY_EDIT_LABEL}
        </SecondaryButton>
        <SecondaryButton
          type="button"
          onClick={handleCancelLot}
          disabled={!canEditOrCancelLot || !cancelLotCheck.ok}
        >
          <XCircle size={14} aria-hidden="true" />
          {PRODUCTION_DAILY_CANCEL_LABEL}
        </SecondaryButton>
        {smartModeActive ? (
          <SecondaryButton type="button" disabled aria-label="Smart Mode 활성">
            <QrCode size={14} aria-hidden="true" />
            Smart · {smartEquipmentContext.name}
          </SecondaryButton>
        ) : null}
      </SectionPageActions>

      <TitanKpiBarSlot ariaLabel="생산 현황" className="inbound-page__kpi">
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
            onRowDoubleClick={handleRowDoubleClick}
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
        title={`${dailyPrintMeta?.label ?? "생산일보"} 출력 미리보기`}
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

      <TitanScreenDetailPopup
        screenKey="dailyProductionReport"
        open={Boolean(detailPopupRow)}
        onClose={() => setDetailPopupRow(null)}
        record={detailPopupRow}
        context={{
          detailContent: buildProductionDetailContent(detailPopupRow),
          traceRecord: detailPopupRow?.record ?? detailPopupRow,
          processFlowSteps: detailPopupProcessSteps,
          chargeProducts: detailPopupChargeProducts,
          statusLabel: detailPopupRow?.statusLabel,
          statusVariant: detailPopupRow?.statusVariant,
          onSelectCoLotProduct: (id) => {
            const target = rows.find((row) => row.managementId === id || row.id === id);
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
