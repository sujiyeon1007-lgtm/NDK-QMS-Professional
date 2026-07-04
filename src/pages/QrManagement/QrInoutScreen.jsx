import { useMemo, useState } from "react";
import { Plus, Printer, RotateCcw, Trash2 } from "lucide-react";

import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import StatusChip from "../../foundation/components/StatusChip";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanScreenDetailPopup from "../../foundation/components/TitanScreenDetailPopup";
import TitanSearchPanel, { useSearchSuggestionHelpers } from "../../foundation/components/TitanSearchPanel";
import TitanStandardProductAdvancedSearch from "../../foundation/components/TitanStandardProductAdvancedSearch";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import { buildV13ProductListColumns } from "../../config/standardProductList";
import QrInoutRowActions from "./QrInoutRowActions";
import {
  createEmptyInboundSearch,
  STANDARD_PRODUCT_BASIC_SEARCH_FIELDS,
  matchesBasicSearch,
} from "../../config/listSearchStandard";
import { useTitanListSearch } from "../../foundation/hooks/useTitanListSearch";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import { openRowDetailPopup } from "../../foundation/utils/openRowDetailPopup";
import { isTitanAdminUser } from "../../utils/titanAdminAccess";
import { hasQrCreatePermission } from "../../utils/titanAuthDataSession";
import { getAuthSession } from "../../utils/titanAuthSession";
import {
  createInoutQrRecord,
  deleteInoutQrRecord,
  getQrInoutListRows,
  regenerateInoutQrRecord,
} from "../../utils/qrManagementSession";
import SectionPageActions from "../../foundation/layout/SectionPageActions";
import QrCreateModal from "./QrCreateModal";
import { getProcessChipVariant } from "../../config/productionProcessCodes";
import { useQrPrintActions } from "./useQrPrintActions";
import "../InOut/InboundManagement.css";
import "./QrManagement.css";

function matchesInoutQrSearch(row, search) {
  if (!matchesBasicSearch(row, search)) return false;
  if (search.status?.trim()) {
    if (row.qrStatusLabel !== search.status.trim()) return false;
  }
  return true;
}

export default function QrInoutScreen() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [detailPopupRow, setDetailPopupRow] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

  const userId = getAuthSession()?.userId;
  const canCreate = hasQrCreatePermission(userId);
  const isAdmin = isTitanAdminUser();
  const { printBusy, handlePrintRows, printHost } = useQrPrintActions({ title: "입출고 QR" });

  const allRows = useMemo(() => getQrInoutListRows(), [refreshKey]);
  const { getSuggestions } = useSearchSuggestionHelpers(allRows);

  const {
    draft,
    search,
    onDraftChange,
    onSearch,
    onReset,
    advancedOpen,
    onAdvancedToggle,
  } = useTitanListSearch(createEmptyInboundSearch, {
    storageKey: "qr-inout-search",
  });

  const filteredRows = useMemo(
    () => allRows.filter((row) => matchesInoutQrSearch(row, search)),
    [allRows, search]
  );

  const {
    page,
    pageSize,
    totalCount,
    totalPages,
    pagedItems: pagedRows,
    setPage,
    setPageSize,
  } = useListPagination(filteredRows);

  const activeRow = pagedRows.find((row) => row.id === activeId) ?? pagedRows[0] ?? null;

  const selectedRows = useMemo(
    () => selectedIds.map((id) => filteredRows.find((row) => row.id === id)).filter(Boolean),
    [selectedIds, filteredRows]
  );

  const printTargetRows = selectedRows.length > 0 ? selectedRows : activeRow ? [activeRow] : [];

  const refresh = () => setRefreshKey((key) => key + 1);

  const handleCreate = (managementId) => {
    const result = createInoutQrRecord(managementId);
    if (!result.ok) {
      window.alert(result.message);
      return;
    }
    setActiveId(result.record.id);
    refresh();
    setPage(1);
  };

  const handleRowCreate = (row) => {
    if (!canCreate || row.hasQr) return;
    handleCreate(row.managementId);
  };

  const handleDelete = (row) => {
    if (!isAdmin || !row.hasQr) return;
    const confirmed = window.confirm(`${row.managementId} QR을 삭제하시겠습니까?`);
    if (!confirmed) return;
    const result = deleteInoutQrRecord(row.qrRecord?.id ?? row.id);
    if (!result.ok) {
      window.alert(result.message);
      return;
    }
    if (detailPopupRow?.id === row.id) setDetailPopupRow(null);
    setSelectedIds((prev) => prev.filter((id) => id !== row.id));
    refresh();
  };

  const handleBulkDelete = () => {
    if (!isAdmin) return;
    const targets = selectedRows.filter((row) => row.hasQr);
    if (!targets.length) {
      window.alert("삭제할 QR을 선택하세요.");
      return;
    }
    const confirmed = window.confirm(`선택한 QR ${targets.length}건을 삭제하시겠습니까?`);
    if (!confirmed) return;
    targets.forEach((row) => deleteInoutQrRecord(row.qrRecord?.id ?? row.id));
    setSelectedIds([]);
    setDetailPopupRow(null);
    refresh();
  };

  const handleRegenerate = (row) => {
    if (!row.hasQr || !row.qrRecord?.id) return;
    const result = regenerateInoutQrRecord(row.qrRecord.id);
    if (!result.ok) {
      window.alert(result.message ?? "QR 재생성에 실패했습니다.");
      return;
    }
    refresh();
  };

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
        renderActions: (row) => (
          <QrInoutRowActions
            onDetail={() => {
              setActiveId(row.id);
              setDetailPopupRow(row);
            }}
            onPrint={() => handlePrintRows([row])}
            onRegenerate={() => handleRegenerate(row)}
            onDelete={() => handleDelete(row)}
            canPrint={row.hasQr}
            canRegenerate={row.hasQr}
            canDelete={isAdmin && row.hasQr}
          />
        ),
      }),
    [isAdmin, refreshKey]
  );

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

  const openDetailPopup = (row) => {
    openRowDetailPopup(row, { setActiveId, setDetailPopupRow, getRowId: (item) => item.id });
  };

  return (
    <div className="inbound-page qr-mgmt-page">
      <SectionPageActions>
        <PrimaryButton type="button" onClick={() => setCreateOpen(true)} disabled={!canCreate}>
          <Plus size={14} aria-hidden="true" />
          QR 생성
        </PrimaryButton>
        <SecondaryButton
          type="button"
          disabled={printTargetRows.length === 0 || printBusy}
          onClick={() => handlePrintRows(printTargetRows)}
        >
          <Printer size={14} aria-hidden="true" />
          QR 출력
        </SecondaryButton>
        <SecondaryButton
          type="button"
          disabled={printTargetRows.length === 0 || printBusy}
          onClick={() => handlePrintRows(printTargetRows, { reprint: true })}
        >
          <RotateCcw size={14} aria-hidden="true" />
          QR 재출력
        </SecondaryButton>
        <SecondaryButton
          type="button"
          disabled={!isAdmin || selectedRows.filter((row) => row.hasQr).length === 0}
          onClick={handleBulkDelete}
        >
          <Trash2 size={14} aria-hidden="true" />
          삭제
        </SecondaryButton>
      </SectionPageActions>

      <TitanSearchPanel
        draft={draft}
        onDraftChange={onDraftChange}
        onSearch={onSearch}
        onReset={onReset}
        advancedOpen={advancedOpen}
        onAdvancedToggle={onAdvancedToggle}
        records={allRows}
        basicFields={STANDARD_PRODUCT_BASIC_SEARCH_FIELDS}
        showStatusField
        statusFieldLabel="현재상태"
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
              선택: <strong>{selectedIds.length}건</strong>
            </span>
            <div>
              <SecondaryButton type="button" disabled={printBusy} onClick={() => handlePrintRows(selectedRows)}>
                QR 출력
              </SecondaryButton>
              <SecondaryButton type="button" onClick={() => setSelectedIds([])}>
                선택 해제
              </SecondaryButton>
            </div>
          </div>
        ) : null}

        <TitanDataTable
          className="inbound-page__table qr-mgmt-page__table"
          columns={columns}
          rows={pagedRows}
          selectable
          selectedRowIds={selectedIds}
          onToggleRow={toggleRow}
          onToggleAll={toggleAll}
          activeRowId={activeRow?.id}
          onRowClick={(row) => setActiveId(row.id)}
          onRowDoubleClick={openDetailPopup}
          emptyMessage="입고 등록 제품이 없습니다."
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

      <QrCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
        mode="inout"
      />

      {printHost}

      <TitanScreenDetailPopup
        screenKey="qrInout"
        open={Boolean(detailPopupRow)}
        onClose={() => setDetailPopupRow(null)}
        record={detailPopupRow}
        context={{ qrRow: detailPopupRow }}
      />
    </div>
  );
}
