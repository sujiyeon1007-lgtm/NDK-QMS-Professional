import { useMemo, useState } from "react";
import { FileSpreadsheet, Plus, Printer } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import StatusChip from "../../foundation/components/StatusChip";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanSearchPanel, { useSearchSuggestionHelpers } from "../../foundation/components/TitanSearchPanel";
import TitanStandardProductAdvancedSearch from "../../foundation/components/TitanStandardProductAdvancedSearch";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import TitanKpiBarSlot from "../../foundation/components/TitanKpiBarSlot";
import TitanWorkflowStatusChipBar from "../../foundation/components/TitanWorkflowStatusChipBar";
import { useWorkflowChipFilter } from "../../foundation/hooks/useWorkflowChipFilter";
import TitanScreenDetailPopup from "../../foundation/components/TitanScreenDetailPopup";
import OutboundRowActions from "./OutboundRowActions";
import InOutListPrintPreviewModal from "../../components/print/InOutListPrintPreviewModal";
import TitanPrintPreviewModal from "../../components/print/TitanPrintPreviewModal";
import TransactionStatementPrintDocument from "../../components/print/TransactionStatementPrintDocument";
import { TITAN_PRINT_DOCUMENT_TYPES } from "../../config/titanPrintDocuments";
import {
  createEmptyOutboundSearch,
  matchesBasicSearch,
  STANDARD_PRODUCT_BASIC_SEARCH_FIELDS,
} from "../../config/listSearchStandard";
import { buildOutboundListColumns } from "../../config/standardProductList";
import {
  getProcessChipVariant,
  getProductionProcessCodes,
  getProductionProcessName,
} from "../../config/productionProcessCodes";
import { useTitanListSearch } from "../../foundation/hooks/useTitanListSearch";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import { getMasterDataByCategory } from "../../utils/masterData";
import { getSessionProductionRecords } from "../../utils/productionRecords";
import { SHIPMENT_STATUS } from "../../utils/ndkWorkflow";
import {
  OUTBOUND_STATUS_LABELS,
  filterOutboundCompletedRecords,
  filterOutboundManagementRecords,
  getOutboundManagementStatus,
  getOutboundManager,
  getOutboundShipDate,
  getOutboundShipQty,
  getOutboundShipmentCount,
  getOutboundTotalShippedQty,
  getStatementPrintStatus,
} from "../../utils/outboundManagementStatus";
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
import { getStockQty, getIncomingQty } from "../../utils/inventory";
import { buildTransactionStatementPrintProps } from "../../utils/titanPrintPreviewHelpers";
import { exportTitanPdf, printTitanDocument } from "../../utils/titanPrintExport";
import {
  cancelLastOutboundShipment,
  getLastOutboundShipQty,
  recordTransactionStatementPrint,
} from "../../utils/outboundRegistration";
import { isTitanAdminUser } from "../../utils/titanAdminAccess";
import OutboundRegisterModal from "./OutboundRegisterModal";
import OutboundStatementPromptDialog from "./OutboundStatementPromptDialog";
import { openRowDetailPopup } from "../../foundation/utils/openRowDetailPopup";
import "./InboundManagement.css";
import "./OutboundManagement.css";
import "./OutboundStatementPromptDialog.css";
import SectionPageActions from "../../foundation/layout/SectionPageActions";

const OUTBOUND_STATUS_OPTIONS = Object.values(OUTBOUND_STATUS_LABELS);

function resolveRegisterTargetId(selectedRows = [], activeRow = null) {
  if (selectedRows.length >= 1) {
    return selectedRows[0].managementId ?? selectedRows[0].id ?? "";
  }
  return activeRow?.managementId ?? activeRow?.id ?? "";
}

function mapOutboundListRow(record) {
  const statementStatus = getStatementPrintStatus(record);
  const stock = getStockQty(record);

  if (record.shipmentStatus === SHIPMENT_STATUS.DONE && stock <= 0) {
    return {
      ...mapV13ProductListRow(record, { label: "출고완료", variant: "complete" }, { workQty: getOutboundTotalShippedQty(record) }),
      statementStatusLabel: statementStatus.label,
      statementStatusVariant: statementStatus.variant,
      manager: getOutboundManager(record),
    };
  }

  const status = getOutboundManagementStatus(record) ?? {
    label: "출고대기",
    variant: "ship-wait",
  };

  return {
    ...mapV13ProductListRow(record, status, { workQty: stock }),
    statementStatusLabel: statementStatus.label,
    statementStatusVariant: statementStatus.variant,
    manager: getOutboundManager(record),
  };
}

function resolveOutboundListRecords(search) {
  const all = getSessionProductionRecords();
  if (search.__chipProductShipDone) {
    return filterOutboundCompletedRecords(all);
  }
  return filterOutboundManagementRecords(all);
}

function matchesOutboundSearch(record, row, search) {
  if (!matchesBasicSearch(search, record)) return false;
  if (!matchesInboundDataSearch(search, record)) return false;
  if (search.qty && !String(row.stockQtyLabel ?? row.qty).includes(search.qty)) return false;
  if (search.process && getProductionProcessName(record) !== search.process) return false;
  if (search.manager && !row.manager.includes(search.manager)) return false;
  if (search.status && row.statusLabel !== search.status) return false;
  if (search.__chipProductShipWait && row.statusLabel !== OUTBOUND_STATUS_LABELS.SHIP_WAIT) {
    return false;
  }
  if (search.__chipProductShipDone && row.statusLabel !== "출고완료") {
    return false;
  }
  if (search.note && !String(record.note ?? "").includes(search.note)) return false;
  const shipDate = getOutboundShipDate(record);
  if (search.shipDateFrom && shipDate !== "—" && shipDate < search.shipDateFrom) return false;
  if (search.shipDateTo && shipDate !== "—" && shipDate > search.shipDateTo) return false;
  if (search.productionDateFrom && shipDate !== "—" && shipDate < search.productionDateFrom) return false;
  if (search.productionDateTo && shipDate !== "—" && shipDate > search.productionDateTo) return false;
  if (search.incomingDateFrom && record.incomingDate < search.incomingDateFrom) return false;
  if (search.incomingDateTo && record.incomingDate > search.incomingDateTo) return false;
  return true;
}

export default function OutboundManagement() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerInitialId, setRegisterInitialId] = useState("");
  const { search, draft, onDraftChange, onSearch, onReset, advancedOpen, onAdvancedToggle } =
    useTitanListSearch(createEmptyOutboundSearch, { storageKey: "outbound" });
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [detailPopupRow, setDetailPopupRow] = useState(null);
  const [outboundListPrintOpen, setOutboundListPrintOpen] = useState(false);
  const [outboundListPrintProps, setOutboundListPrintProps] = useState(null);
  const [statementPrintOpen, setStatementPrintOpen] = useState(false);
  const [statementPrintBusy, setStatementPrintBusy] = useState(false);
  const [statementContext, setStatementContext] = useState(null);
  const [statementPromptOpen, setStatementPromptOpen] = useState(false);
  const [pendingRegisterResult, setPendingRegisterResult] = useState(null);
  const chipRecords = useMemo(() => getSessionProductionRecords(), [refreshKey]);
  const { activeChipId, handleChipClick } = useWorkflowChipFilter({
    draft,
    onDraftChange,
    onReset,
  });

  const companies = useMemo(() => getMasterDataByCategory("companies"), []);
  const processCodes = useMemo(() => getProductionProcessCodes(), []);
  const searchRecords = useMemo(
    () => filterOutboundManagementRecords(getSessionProductionRecords()),
    [refreshKey]
  );
  const { getSuggestions } = useSearchSuggestionHelpers(searchRecords, {
    process: processCodes.map((item) => item.name),
  });

  const rows = useMemo(() => {
    const records = resolveOutboundListRecords(search);
    return records
      .map((record) => mapOutboundListRow(record))
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

  const detailPopupProcessSteps = detailPopupRow
    ? getProcessFlowSteps(detailPopupRow.record, detailPopupRow.statusLabel)
    : [];

  const buildOutboundDetailContent = (row, companyLabel) => {
    const record = row?.record ?? null;
    if (!row || !record) return null;
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
          <dt>총 출고수량</dt>
          <dd>{getOutboundTotalShippedQty(record)}</dd>
        </div>
        <div>
          <dt>잔량</dt>
          <dd>{getStockQty(record)} EA</dd>
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
          <dd>{row.shipDateLabel}</dd>
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

  const statementPrintProps = useMemo(() => {
    if (statementContext?.record) {
      return buildTransactionStatementPrintProps(statementContext.record, {
        shipQty: statementContext.shipQty,
      });
    }
    const targetRecord = printTargetRows[0]?.record ?? null;
    if (!targetRecord) return null;
    return buildTransactionStatementPrintProps(targetRecord, {
      shipQty: getLastOutboundShipQty(targetRecord),
    });
  }, [statementContext, printTargetRows]);

  const openStatementPrintPreview = (context = null) => {
    const record = context?.record ?? printTargetRows[0]?.record ?? null;
    if (!record) return;
    setStatementContext(
      context ?? {
        record,
        shipQty: getLastOutboundShipQty(record),
      }
    );
    setStatementPrintOpen(true);
  };

  const closeStatementPrintPreview = () => {
    setStatementPrintOpen(false);
    setStatementContext(null);
  };

  const handleStatementPrinted = () => {
    if (!statementPrintProps?.record) return;
    recordTransactionStatementPrint(statementPrintProps.record, {
      shipQty: statementPrintProps.shipQtyNumeric,
      unitPrice: statementPrintProps.unitPrice,
      amounts: statementPrintProps.amounts,
    });
    setRefreshKey((key) => key + 1);
  };

  const handleStatementPrint = async (documentEl) => {
    setStatementPrintBusy(true);
    try {
      await printTitanDocument(documentEl);
      handleStatementPrinted();
    } finally {
      setStatementPrintBusy(false);
    }
  };

  const handleStatementPdf = async (documentEl) => {
    setStatementPrintBusy(true);
    try {
      const id = statementPrintProps?.record?.id ?? "statement";
      await exportTitanPdf(documentEl, `transaction-statement-${id}.pdf`);
      handleStatementPrinted();
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

  const openRegisterModal = (managementId = "") => {
    const resolvedId = managementId || resolveRegisterTargetId(selectedRows, activeRow);
    setRegisterInitialId(resolvedId);
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
        resolveQty: (record) => getStockQty(record),
      })
    );
    setOutboundListPrintOpen(true);
  };

  const activeRecord = activeRow?.record ?? null;
  const canRegisterOutbound = Boolean(activeRecord && getStockQty(activeRecord) > 0);
  const detailActionLabel = canRegisterOutbound
    ? OUTBOUND_REGISTER_LABEL
    : OUTBOUND_STATEMENT_REPRINT_LABEL;
  const DetailActionIcon = canRegisterOutbound ? Plus : Printer;

  const handleDetailAction = () => {
    if (canRegisterOutbound) {
      openRegisterModal(activeRow.managementId);
      return;
    }
    openStatementPrintPreview({
      record: activeRecord,
      shipQty: getLastOutboundShipQty(activeRecord),
    });
  };

  const handleOutboundRegister = (result) => {
    if (!result?.ok || !result.managementId) return;
    setActiveId(result.managementId);
    setRefreshKey((k) => k + 1);
    setPage(1);
    setPendingRegisterResult(result);
    setStatementPromptOpen(true);
  };

  const handleStatementPromptConfirm = () => {
    if (!pendingRegisterResult) {
      setStatementPromptOpen(false);
      return;
    }
    setStatementPromptOpen(false);
    openStatementPrintPreview({
      record: pendingRegisterResult.record,
      shipQty: pendingRegisterResult.shipQty,
    });
    setPendingRegisterResult(null);
  };

  const handleStatementPromptCancel = () => {
    setStatementPromptOpen(false);
    setPendingRegisterResult(null);
  };

  const handleOutboundCancel = (row = activeRow) => {
    const record = row?.record ?? row;
    if (!record) return;
    const cancelResult = cancelLastOutboundShipment(record.id);
    if (!cancelResult.ok) {
      window.alert(cancelResult.message);
      return;
    }
    window.alert(`출고 ${cancelResult.revertedQty} EA가 취소되었습니다.\n잔여 재고: ${cancelResult.stockAfter} EA`);
    setRefreshKey((key) => key + 1);
  };

  const handleRowShip = (row) => {
    const record = row?.record ?? row;
    if (!record) return;
    if (getStockQty(record) > 0) {
      openRegisterModal(row.managementId ?? row.id);
      return;
    }
    openStatementPrintPreview({
      record,
      shipQty: getLastOutboundShipQty(record),
    });
  };

  const renderProcessChip = (row) =>
    row.currentProcess && row.currentProcess !== "—" ? (
      <StatusChip variant={getProcessChipVariant(row.currentProcess)}>{row.currentProcess}</StatusChip>
    ) : (
      "—"
    );

  const columns = useMemo(
    () =>
      buildOutboundListColumns({
        renderProcess: renderProcessChip,
        renderActions: (row) => {
          const record = row.record ?? row;
          const canShip = getStockQty(record) > 0;
          return (
            <OutboundRowActions
              onDetail={() => {
                setActiveId(row.id);
                setDetailPopupRow(row);
              }}
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
    [refreshKey]
  );

  return (
    <div className="inbound-page">
      <SectionPageActions>
        <PrimaryButton type="button" onClick={() => openRegisterModal()}>
          <Plus size={14} aria-hidden="true" />
          {OUTBOUND_REGISTER_LABEL}
        </PrimaryButton>
        <SecondaryButton type="button" onClick={openOutboundListPrintPreview} disabled={printTargetRows.length === 0}>
          <Printer size={14} aria-hidden="true" />
          {OUTBOUND_LIST_LABEL}
        </SecondaryButton>
        <SecondaryButton type="button">
          <FileSpreadsheet size={14} aria-hidden="true" />
          엑셀 출력
        </SecondaryButton>
      </SectionPageActions>

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
          />
        }
      />

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

      <OutboundRegisterModal
        open={registerOpen}
        initialManagementId={registerInitialId}
        onClose={() => {
          setRegisterOpen(false);
          setRegisterInitialId("");
        }}
        onRegister={handleOutboundRegister}
      />

      <OutboundStatementPromptDialog
        open={statementPromptOpen}
        result={pendingRegisterResult}
        onConfirm={handleStatementPromptConfirm}
        onCancel={handleStatementPromptCancel}
      />

      <InOutListPrintPreviewModal
        open={outboundListPrintOpen}
        onClose={() => setOutboundListPrintOpen(false)}
        documentType={TITAN_PRINT_DOCUMENT_TYPES.OUTBOUND_LIST}
        printProps={outboundListPrintPropsForModal}
      />

      <TitanPrintPreviewModal
        open={statementPrintOpen}
        onClose={closeStatementPrintPreview}
        title="거래명세서 출력 미리보기"
        onPrint={handleStatementPrint}
        onPdf={handleStatementPdf}
        busy={statementPrintBusy}
      >
        {statementPrintProps ? <TransactionStatementPrintDocument {...statementPrintProps} /> : null}
      </TitanPrintPreviewModal>

      <TitanScreenDetailPopup
        screenKey="outbound"
        open={Boolean(detailPopupRow)}
        onClose={() => setDetailPopupRow(null)}
        record={detailPopupRow}
        context={{
          detailContent: buildOutboundDetailContent(
            detailPopupRow,
            detailPopupRow ? formatMultiSelectCompany([detailPopupRow]) : ""
          ),
          traceRecord: detailPopupRow?.record,
          processFlowSteps: detailPopupProcessSteps,
          statusLabel: detailPopupRow?.statusLabel,
          statusVariant: detailPopupRow?.statusVariant,
        }}
      />
    </div>
  );
}
