import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FileSpreadsheet, Plus, Printer } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import StatusChip from "../../foundation/components/StatusChip";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanSearchPanel, { useSearchSuggestionHelpers } from "../../foundation/components/TitanSearchPanel";
import TitanStandardProductAdvancedSearch from "../../foundation/components/TitanStandardProductAdvancedSearch";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import TitanKpiBarSlot from "../../foundation/components/TitanKpiBarSlot";
import TitanWorkflowStatusChipBar from "../../foundation/components/TitanWorkflowStatusChipBar";
import { FOUNDATION_DOCUMENT_ACTIONS } from "../../foundation/components/FoundationActionBar";
import { useWorkflowChipFilter } from "../../foundation/hooks/useWorkflowChipFilter";
import { useTransactionStatementDocumentOutput } from "../../foundation/hooks/useFoundationDocumentOutput";
import TitanScreenDetailPopup from "../../foundation/components/TitanScreenDetailPopup";
import OutboundRowActions from "./OutboundRowActions";
import InOutListPrintPreviewModal from "../../components/print/InOutListPrintPreviewModal";
import TitanPrintPreviewModal from "../../components/print/TitanPrintPreviewModal";
import TransactionStatementPrintDocument from "../../components/print/TransactionStatementPrintDocument";
import { TransactionStatementIssueResultDialog } from "../../components/transactionStatement/TransactionStatementPreview";
import { TITAN_PRINT_DOCUMENT_TYPES } from "../../config/titanPrintDocuments";
import {
  createEmptyOutboundSearch,
  matchesBasicSearch,
  STANDARD_PRODUCT_BASIC_SEARCH_FIELDS,
} from "../../config/listSearchStandard";
import { buildOutboundListColumns } from "../../config/standardProductList";
import { renderWorkflowProcessChip } from "../../utils/workflowProcessChip";
import {
  getProcessChipVariant,
  getProductionProcessCodes,
  getProductionProcessName,
} from "../../config/productionProcessCodes";
import { useTitanListSearch } from "../../foundation/hooks/useTitanListSearch";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import { getMasterDataByCategory } from "../../utils/masterData";
import { getSessionProductionRecords } from "../../utils/productionRecords";
import {
  OUTBOUND_STATUS_LABELS,
  formatOutboundDateDetailLabel,
  formatOutboundDateLabel,
  formatOutboundTimeLabel,
  getOutboundManagementStatus,
  getOutboundManager,
  getOutboundShipDate,
  getOutboundShipQty,
  getOutboundShipmentCount,
  getStatementPrintStatus,
} from "../../utils/outboundManagementStatus";
import {
  buildOutgoingCompletedWorkspaceRecords,
  buildOutgoingTaskWorkspaceRecords,
  getOperationsRecords,
} from "../../utils/operationsWorkspaceData";
import { formatMultiSelectCompany } from "../../utils/selectionDisplay";
import { getProcessFlowSteps, mapV13ProductListRow } from "../../utils/processFlow";
import { matchesInboundDataSearch } from "../../utils/inboundDataFields";
import {
  OUTBOUND_REGISTER_LABEL,
  OUTBOUND_LIST_LABEL,
  OUTBOUND_STATEMENT_REPRINT_LABEL,
} from "../../config/registerModalStandard";
import { buildInOutListPrintProps } from "../../utils/inOutListPrintRows";
import { getPrintOutputDate } from "../../utils/titanPrintDates";
import { getIncomingQty } from "../../utils/inventory";
import { resolveChargeQty } from "../../utils/equipmentChargingQty";
import {
  applyOutboundRegister,
  cancelLastOutboundShipment,
  getLastOutboundShipQty,
  hasOutboundShipmentForLot,
  resolveOutboundAvailableQty,
  resolveOutboundProductCompletedQty,
  resolveOutboundProductShippedQty,
  buildOutboundProductKey,
} from "../../utils/outboundRegistration";
import { isTitanAdminUser } from "../../utils/titanAdminAccess";
import OutboundRegisterModal from "./OutboundRegisterModal";
import OutboundStatementPromptDialog from "./OutboundStatementPromptDialog";
import { openRowDetailPopup } from "../../foundation/utils/openRowDetailPopup";
import "./InboundManagement.css";
import "./OutboundManagement.css";
import "./OutboundStatementPromptDialog.css";
import SectionPageActions from "../../foundation/layout/SectionPageActions";
import TitanWorkflowNextStepDialog from "../../foundation/components/TitanWorkflowNextStepDialog";
import TitanWorkflowNavigation from "../../foundation/components/TitanWorkflowNavigation";
import { getOperationsWorkflowNextStep, OPERATION_ROUTES } from "../../config/operationsRouteRegistry";
import { getWorkflowCompletionDialog } from "../../config/workflowNavigation";
import "../../foundation/components/OperationsWorkflowNextDialog.css";

const OUTBOUND_STATUS_OPTIONS = Object.values(OUTBOUND_STATUS_LABELS);

function resolveRegisterTargetId(selectedRows = [], activeRow = null) {
  if (selectedRows.length >= 1) {
    return selectedRows[0].managementId ?? selectedRows[0].id ?? "";
  }
  return activeRow?.managementId ?? activeRow?.id ?? "";
}

function appendOutboundListFields(record, row = {}) {
  const productKey = record?.productKey || buildOutboundProductKey(record);
  return {
    ...row,
    id: productKey || record.id,
    productKey,
    lotNo: "—",
    outboundDate: formatOutboundDateLabel(record),
    outboundDateLabel: formatOutboundDateDetailLabel(record),
    shipDateLabel: formatOutboundDateDetailLabel(record),
    outboundTimeLabel: formatOutboundTimeLabel(record),
    outboundManagerLabel: getOutboundManager(record),
    manager: record.outboundManager?.trim() || record.registrar?.trim() || "관리자",
  };
}

function mapOutboundListRow(record) {
  const statementStatus = getStatementPrintStatus(record);
  const availableQty = resolveOutboundAvailableQty(record);
  const shippedQty = resolveOutboundProductShippedQty(record);
  const completedQty = resolveOutboundProductCompletedQty(record);

  if (hasOutboundShipmentForLot(record) && availableQty <= 0) {
    return appendOutboundListFields(record, {
      ...mapV13ProductListRow(record, { label: "출고완료", variant: "complete" }, {
        workQty: shippedQty || completedQty,
        screenKey: "outbound",
      }),
      statementStatusLabel: statementStatus.label,
      statementStatusVariant: statementStatus.variant,
      stockQtyLabel: `${availableQty} EA`,
    });
  }

  const status = getOutboundManagementStatus(record) ?? {
    label: "출고대기",
    variant: "ship-wait",
  };

  return appendOutboundListFields(record, {
    ...mapV13ProductListRow(record, status, {
      workQty: availableQty || completedQty,
      screenKey: "outbound",
    }),
    statementStatusLabel: statementStatus.label,
    statementStatusVariant: statementStatus.variant,
    stockQtyLabel: `${availableQty} EA`,
  });
}

function resolveOutboundListRecords(viewMode) {
  if (viewMode === "history") {
    return buildOutgoingCompletedWorkspaceRecords();
  }
  return buildOutgoingTaskWorkspaceRecords();
}

function matchesOutboundSearch(record, row, search) {
  if (!matchesBasicSearch(search, record)) return false;
  if (!matchesInboundDataSearch(search, record)) return false;
  if (search.qty && !String(row.stockQtyLabel ?? row.qty).includes(search.qty)) return false;
  if (search.process && getProductionProcessName(record) !== search.process) return false;
  if (search.manager && !row.manager.includes(search.manager)) return false;
  if (search.status && row.statusLabel !== search.status) return false;
  if (
    (search.__chipShipNotDone || search.__chipProductShipWait) &&
    row.statusLabel !== OUTBOUND_STATUS_LABELS.NOT_DONE
  ) {
    return false;
  }
  if (
    (search.__chipShipDone || search.__chipProductShipDone) &&
    row.statusLabel !== OUTBOUND_STATUS_LABELS.DONE
  ) {
    return false;
  }
  if (search.note && !String(record.note ?? "").includes(search.note)) return false;
  const shipDate = getOutboundShipDate(record);
  if (search.shipDateFrom && shipDate !== "—" && shipDate < search.shipDateFrom) return false;
  if (search.shipDateTo && shipDate !== "—" && shipDate > search.shipDateTo) return false;
  if (search.incomingDateFrom && record.incomingDate < search.incomingDateFrom) return false;
  if (search.incomingDateTo && record.incomingDate > search.incomingDateTo) return false;
  return true;
}

export default function OutboundManagement({ forcedMode } = {}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryMode = searchParams.get("mode") === "register" ? "register" : "history";
  // RC1 Route Registry — canonical /operations/shipment-register · /operations/shipment-history
  // 는 forcedMode로 화면 역할을 고정한다. legacy ?mode= query는 redirect 단계에서만 사용.
  const viewMode = forcedMode ?? queryMode;
  const isHistoryMode = viewMode === "history";
  const [refreshKey, setRefreshKey] = useState(0);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerInitialId, setRegisterInitialId] = useState("");
  const [registerInitialProductKey, setRegisterInitialProductKey] = useState("");
  const { search, draft, onDraftChange, onSearch, onReset, advancedOpen, onAdvancedToggle } =
    useTitanListSearch(createEmptyOutboundSearch, { storageKey: "outbound" });
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [detailPopupRow, setDetailPopupRow] = useState(null);
  const [outboundListPrintOpen, setOutboundListPrintOpen] = useState(false);
  const [outboundListPrintProps, setOutboundListPrintProps] = useState(null);
  const [statementPromptOpen, setStatementPromptOpen] = useState(false);
  const [pendingRegisterResult, setPendingRegisterResult] = useState(null);
  const [workflowNextStep, setWorkflowNextStep] = useState(null);
  const transactionStatementOutput = useTransactionStatementDocumentOutput({
    onAfterOutput: () => setRefreshKey((key) => key + 1),
  });
  const chipRecords = useMemo(() => getOperationsRecords(), [refreshKey]);
  const { activeChipId, handleChipClick } = useWorkflowChipFilter({
    draft,
    onDraftChange,
    onReset,
    onSearch,
  });

  const companies = useMemo(() => getMasterDataByCategory("companies"), []);
  const processCodes = useMemo(() => getProductionProcessCodes(), []);
  const searchRecords = useMemo(() => {
    return resolveOutboundListRecords(viewMode);
  }, [refreshKey, viewMode]);
  const { getSuggestions } = useSearchSuggestionHelpers(searchRecords, {
    process: processCodes.map((item) => item.name),
  });

  const rows = useMemo(() => {
    const records = resolveOutboundListRecords(viewMode);
    return records
      .map((record) => mapOutboundListRow(record))
      .filter((row) => matchesOutboundSearch(row.record, row, search))
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

  const detailPopupProcessSteps = detailPopupRow
    ? getProcessFlowSteps(detailPopupRow.record, detailPopupRow.statusLabel)
    : [];

  const buildOutboundDetailContent = (row, companyLabel) => {
    const record = row?.record ?? null;
    if (!row || !record) return null;
    const lotRows = record.outboundLotRows ?? [];
    const lotSummary =
      lotRows.length > 0
        ? lotRows
            .map(
              (lot) =>
                `${lot.lotNo || "—"} ${resolveOutboundAvailableQty(lot)}/${resolveChargeQty(lot, { lotNo: lot.lotNo })} EA`
            )
            .join(", ")
        : row.lotNo;
    return (
      <dl className="inbound-detail">
        <div>
          <dt>관리번호</dt>
          <dd>{row.managementId}</dd>
        </div>
        <div>
          <dt>발주번호</dt>
          <dd>{row.purchaseOrderNo}</dd>
        </div>
        <div>
          <dt>LOT.NO</dt>
          <dd>{lotSummary}</dd>
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
              <StatusChip variant={getProcessChipVariant(row.processName)}>{row.processName}</StatusChip>
            ) : (
              "—"
            )}
          </dd>
        </div>
        <div>
          <dt>입고수량</dt>
          <dd>{getIncomingQty(record)} EA</dd>
        </div>
        <div>
          <dt>작업완료</dt>
          <dd>{resolveOutboundProductCompletedQty(record)} EA</dd>
        </div>
        <div>
          <dt>출고가능</dt>
          <dd>{resolveOutboundAvailableQty(record)} EA</dd>
        </div>
        <div>
          <dt>총 출고수량</dt>
          <dd>{resolveOutboundProductShippedQty(record)} EA</dd>
        </div>
        <div>
          <dt>출고횟수</dt>
          <dd>{getOutboundShipmentCount(record)}회</dd>
        </div>
        <div>
          <dt>실재고</dt>
          <dd>{row.stockQtyLabel}</dd>
        </div>
        <div>
          <dt>출고일</dt>
          <dd>{row.shipDateLabel ?? row.outboundDateLabel ?? "—"}</dd>
        </div>
        <div>
          <dt>출고 담당자</dt>
          <dd>{row.outboundManagerLabel ?? row.manager ?? "—"}</dd>
        </div>
        <div>
          <dt>출고 시간</dt>
          <dd>{row.outboundTimeLabel ?? "—"}</dd>
        </div>
        <div>
          <dt>현재상태</dt>
          <dd>
            <StatusChip variant={row.statusVariant}>{row.statusLabel}</StatusChip>
          </dd>
        </div>
        <div>
          <dt>거래명세서</dt>
          <dd>
            <StatusChip variant={row.statementStatusVariant}>{row.statementStatusLabel}</StatusChip>
          </dd>
        </div>
        <div>
          <dt>담당자</dt>
          <dd>{row.manager}</dd>
        </div>
      </dl>
    );
  };

  const printTargetRows = useMemo(() => {
    if (selectedRows.length > 0) return selectedRows;
    if (activeRow) return [activeRow];
    return [];
  }, [selectedRows, activeRow]);

  const outboundListPrintPropsForModal = outboundListPrintProps;

  const statementPrintProps = transactionStatementOutput.printProps;

  const openStatementPrintPreview = (context = null) => {
    const record = context?.record ?? printTargetRows[0]?.record ?? null;
    if (!record) return;
    transactionStatementOutput.openPreview(record, {
      shipQty: context?.shipQty ?? getLastOutboundShipQty(record),
    });
  };

  const closeStatementPrintPreview = () => {
    transactionStatementOutput.closePreview();
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

  const openRegisterModal = (managementId = "", productKey = "") => {
    const resolvedId = managementId || resolveRegisterTargetId(selectedRows, activeRow);
    const targetRow =
      selectedRows.find(
        (row) =>
          (productKey && row.productKey === productKey) ||
          row.managementId === resolvedId ||
          row.id === resolvedId
      ) ??
      (activeRow &&
      ((productKey && activeRow.productKey === productKey) ||
        activeRow.managementId === resolvedId ||
        activeRow.id === resolvedId)
        ? activeRow
        : null);
    setRegisterInitialId(resolvedId || targetRow?.managementId || "");
    setRegisterInitialProductKey(productKey || targetRow?.productKey || "");
    setRegisterOpen(true);
  };

  const openDetailPopup = (row) => {
    openRowDetailPopup(row, { setActiveId, setDetailPopupRow });
  };

  const handleRowDoubleClick = (row) => {
    openDetailPopup(row);
  };

  const openOutboundListPrintPreview = () => {
    if (printTargetRows.length === 0) return;
    setOutboundListPrintProps(
      buildInOutListPrintProps(printTargetRows, {
        listNoPrefix: "OUT",
        outputDate: getPrintOutputDate(),
        resolveQty: (record) => resolveOutboundAvailableQty(record),
      })
    );
    setOutboundListPrintOpen(true);
  };

  const activeRecord = activeRow?.record ?? null;
  const canRegisterOutbound = Boolean(activeRecord && resolveOutboundAvailableQty(activeRecord) > 0);
  const detailActionLabel = canRegisterOutbound
    ? OUTBOUND_REGISTER_LABEL
    : OUTBOUND_STATEMENT_REPRINT_LABEL;
  const DetailActionIcon = canRegisterOutbound ? Plus : Printer;

  const handleDetailAction = () => {
    if (canRegisterOutbound) {
      openRegisterModal(activeRow.managementId, activeRow.productKey);
      return;
    }
    openStatementPrintPreview({
      record: activeRecord,
      shipQty: getLastOutboundShipQty(activeRecord),
    });
  };

  const handleOutboundRegister = (result) => {
    if (!result?.ok || !result.managementId) return;
    setActiveId(result.productKey || result.form?.productKey || result.managementId);
    setPendingRegisterResult(result);
    setStatementPromptOpen(true);
  };

  const applyPendingOutboundRegister = () => {
    if (!pendingRegisterResult) {
      setStatementPromptOpen(false);
      return null;
    }

    const result = applyOutboundRegister(pendingRegisterResult.form);
    if (!result.ok) {
      window.alert(result.message || "출고 등록에 실패했습니다.");
      return null;
    }

    setActiveId(result.managementId);
    setRefreshKey((k) => k + 1);
    setPage(1);
    return result;
  };

  const handleStatementPromptCompleteOnly = () => {
    const result = applyPendingOutboundRegister();
    if (!result) return;
    setStatementPromptOpen(false);
    setPendingRegisterResult(null);
    setWorkflowNextStep(getWorkflowCompletionDialog("outboundComplete"));
  };

  const handleStatementPromptIssueAfterComplete = () => {
    const result = applyPendingOutboundRegister();
    if (!result) return;
    setStatementPromptOpen(false);
    openStatementPrintPreview({
      record: result.record,
      shipQty: result.shipQty,
    });
    setPendingRegisterResult(null);
  };

  const handleStatementPromptClose = () => {
    setStatementPromptOpen(false);
    setPendingRegisterResult(null);
  };

  const handleStatementPromptCancelRegistration = () => {
    setStatementPromptOpen(false);
    setPendingRegisterResult(null);
  };

  const handleStatementIssueDialogClose = (afterIssue = false) => {
    transactionStatementOutput.closeIssueResult();
    if (afterIssue) {
      setWorkflowNextStep(getOperationsWorkflowNextStep("statementIssued"));
    }
  };

  const handleOutboundCancel = (row = activeRow) => {
    const record = row?.record ?? row;
    if (!record) return;
    const cancelResult = cancelLastOutboundShipment(record.id, record.lotNo);
    if (!cancelResult.ok) {
      window.alert(cancelResult.message);
      return;
    }
    window.alert(`출고 ${cancelResult.revertedQty} EA가 취소되었습니다.\n잔여 재고: ${cancelResult.stockAfter} EA`);
    setRefreshKey((key) => key + 1);
  };

  const detailFooterActions = useMemo(
    () => {
      const record = detailPopupRow?.record ?? detailPopupRow;
      const statementStatus = getStatementPrintStatus(record);
      return [
        {
          id: FOUNDATION_DOCUMENT_ACTIONS.TRANSACTION_STATEMENT_PRINT,
          label: statementStatus.label === "발행완료" ? "거래명세서 재출력" : "거래명세서 발행",
          onClick: () => {
            if (!record) return;
            openStatementPrintPreview({
              record,
              shipQty: getLastOutboundShipQty(record),
            });
          },
          disabled: !detailPopupRow?.record,
        },
        {
          id: FOUNDATION_DOCUMENT_ACTIONS.CLOSE,
          onClick: () => setDetailPopupRow(null),
        },
      ];
    },
    [detailPopupRow]
  );

  const handleRowShip = (row) => {
    const record = row?.record ?? row;
    if (!record) return;
    if (resolveOutboundAvailableQty(record) > 0) {
      openRegisterModal(row.managementId ?? row.id, row.productKey);
      return;
    }
    openStatementPrintPreview({
      record,
      shipQty: getLastOutboundShipQty(record),
    });
  };

  const renderProcessChip = (row) => renderWorkflowProcessChip(row);
  const renderStatementStatusChip = (row) => (
    <StatusChip variant={row.statementStatusVariant}>{row.statementStatusLabel}</StatusChip>
  );

  const columns = useMemo(
    () =>
      buildOutboundListColumns({
        renderProcess: renderProcessChip,
        renderStatementStatus: renderStatementStatusChip,
        // 출고 이력(history) — 순수 조회 + 거래명세서 재출력 화면 (출고 등록/취소 ❌)
        renderActions: isHistoryMode
          ? (row) => {
              const record = row.record ?? row;
              return (
                <OutboundRowActions
                  canShip
                  shipLabel="명세서"
                  onShip={() =>
                    openStatementPrintPreview({ record, shipQty: getLastOutboundShipQty(record) })
                  }
                  canEdit={false}
                  canCancel={false}
                />
              );
            }
          : (row) => {
              const record = row.record ?? row;
              const canShip = resolveOutboundAvailableQty(record) > 0;
              return (
                <OutboundRowActions
                  canShip={canShip || (record?.shippedQty ?? 0) > 0}
                  shipLabel={canShip ? "출고" : "명세서"}
                  onShip={() => handleRowShip(row)}
                  canEdit={canShip}
                  onEdit={() => handleRowShip(row)}
                  canCancel={isTitanAdminUser() && (record?.shippedQty ?? 0) > 0}
                  onCancel={() => handleOutboundCancel(row)}
                />
              );
            },
      }),
    [refreshKey, isHistoryMode]
  );

  return (
    <div className="inbound-page">
      <SectionPageActions>
        {!isHistoryMode ? (
          <PrimaryButton type="button" onClick={() => openRegisterModal()}>
            <Plus size={14} aria-hidden="true" />
            {OUTBOUND_REGISTER_LABEL}
          </PrimaryButton>
        ) : null}
        <SecondaryButton type="button" onClick={openOutboundListPrintPreview} disabled={printTargetRows.length === 0}>
          <Printer size={14} aria-hidden="true" />
          {OUTBOUND_LIST_LABEL}
        </SecondaryButton>
        <SecondaryButton type="button" onClick={() => window.alert("엑셀 출력 기능은 V1.1에서 제공될 예정입니다.")}>
          <FileSpreadsheet size={14} aria-hidden="true" />
          엑셀 출력
        </SecondaryButton>
      </SectionPageActions>

      {!isHistoryMode ? <TitanWorkflowNavigation stepId="outboundManagement" /> : null}

      <TitanKpiBarSlot ariaLabel="출고 현황" className="inbound-page__kpi">
        <TitanWorkflowStatusChipBar
          chipSetId="outbound"
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
            productionDateFromKey="shipDateFrom"
            productionDateToKey="shipDateTo"
            productionDateLabel="출고일"
          />
        }
      />

      <div className="inbound-page__history-heading" role="heading" aria-level="2">
        {viewMode === "register" ? "출고 등록 대상" : "출고 이력"}
      </div>

      <div className="inbound-page__list quality-page__list">
        {selectedIds.length > 0 ? (
          <div className="inbound-page__selection-bar">
            <span>
              선택된 품목: <strong>{selectedIds.length}건</strong>
            </span>
            <div>
              <SecondaryButton type="button" onClick={openOutboundListPrintPreview}>
                {OUTBOUND_LIST_LABEL}
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
            viewMode === "history"
              ? "출고 완료 이력이 없습니다."
              : "출고 대기 제품이 없습니다. (출고 완료 제품은 출고이력에서 확인)"
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

      <OutboundRegisterModal
        open={registerOpen}
        initialManagementId={registerInitialId}
        initialProductKey={registerInitialProductKey}
        onClose={() => {
          setRegisterOpen(false);
          setRegisterInitialId("");
          setRegisterInitialProductKey("");
        }}
        onRegister={handleOutboundRegister}
      />

      <OutboundStatementPromptDialog
        open={statementPromptOpen}
        result={pendingRegisterResult}
        onCompleteOnly={handleStatementPromptCompleteOnly}
        onIssueAfterComplete={handleStatementPromptIssueAfterComplete}
        onCancelRegistration={handleStatementPromptCancelRegistration}
        onClose={handleStatementPromptClose}
      />

      <InOutListPrintPreviewModal
        open={outboundListPrintOpen}
        onClose={() => setOutboundListPrintOpen(false)}
        documentType={TITAN_PRINT_DOCUMENT_TYPES.OUTBOUND_LIST}
        printProps={outboundListPrintPropsForModal}
      />

      <TitanPrintPreviewModal
        open={transactionStatementOutput.isOpen}
        onClose={closeStatementPrintPreview}
        title="거래명세서 출력 미리보기"
        onPrint={transactionStatementOutput.print}
        onPdf={transactionStatementOutput.pdf}
        busy={transactionStatementOutput.busy}
      >
        {statementPrintProps ? <TransactionStatementPrintDocument {...statementPrintProps} /> : null}
      </TitanPrintPreviewModal>

      <TransactionStatementIssueResultDialog
        open={Boolean(transactionStatementOutput.issueResult)}
        result={transactionStatementOutput.issueResult}
        onPrintComplete={() => {
          transactionStatementOutput.confirmIssueResult("출력 완료");
          handleStatementIssueDialogClose(true);
        }}
        onPdfOnly={() => {
          transactionStatementOutput.confirmIssueResult("PDF만 저장");
          handleStatementIssueDialogClose(true);
        }}
        onViewHistory={() => {
          handleStatementIssueDialogClose(true);
          navigate(OPERATION_ROUTES.shipmentHistory);
        }}
        onClose={() => handleStatementIssueDialogClose(false)}
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

      <TitanScreenDetailPopup
        screenKey="outbound"
        open={Boolean(detailPopupRow)}
        onClose={() => setDetailPopupRow(null)}
        record={detailPopupRow}
        footerActions={detailFooterActions}
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
    </div>
  );
}
