import { useMemo, useState } from "react";
import { Plus, Printer, RotateCcw, Trash2 } from "lucide-react";

import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import StatusChip from "../../foundation/components/StatusChip";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanScreenDetailPopup from "../../foundation/components/TitanScreenDetailPopup";
import TitanSearchPanel from "../../foundation/components/TitanSearchPanel";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import { titanColumn } from "../../config/tableColumnPresets";
import { useTitanListSearch } from "../../foundation/hooks/useTitanListSearch";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import { openRowDetailPopup } from "../../foundation/utils/openRowDetailPopup";
import { isTitanAdminUser } from "../../utils/titanAdminAccess";
import { hasQrCreatePermission } from "../../utils/titanAuthDataSession";
import { getAuthSession } from "../../utils/titanAuthSession";
import {
  createEquipmentQrRecord,
  deleteEquipmentQrRecord,
  getQrEquipmentListRows,
} from "../../utils/qrManagementSession";
import SectionPageActions from "../../foundation/layout/SectionPageActions";
import QrCreateModal from "./QrCreateModal";
import QrManagementRowActions from "./QrManagementRowActions";
import { useQrPrintActions } from "./useQrPrintActions";
import "../InOut/InboundManagement.css";
import "./QrManagement.css";

function createEmptyEquipmentSearch() {
  return {
    equipmentCode: "",
    equipmentName: "",
    location: "",
    status: "",
  };
}

function matchesEquipmentQrSearch(row, search) {
  const code = search.equipmentCode?.trim().toLowerCase();
  const name = search.equipmentName?.trim().toLowerCase();
  const location = search.location?.trim().toLowerCase();
  const status = search.status?.trim();

  if (code && !String(row.equipmentCode).toLowerCase().includes(code)) return false;
  if (name && !String(row.equipmentName).toLowerCase().includes(name)) return false;
  if (location && !String(row.location).toLowerCase().includes(location)) return false;
  if (status && row.qrStatusLabel !== status) return false;
  return true;
}

const EQUIPMENT_BASIC_FIELDS = [
  { key: "equipmentCode", label: "설비번호", placeholder: "설비번호" },
  { key: "equipmentName", label: "설비명", placeholder: "설비명" },
  { key: "location", label: "위치", placeholder: "위치" },
];

export default function QrEquipmentScreen() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [detailPopupRow, setDetailPopupRow] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

  const userId = getAuthSession()?.userId;
  const canCreate = hasQrCreatePermission(userId);
  const isAdmin = isTitanAdminUser();
  const { printBusy, handlePrintRows, printHost } = useQrPrintActions({ title: "설비 QR" });

  const allRows = useMemo(() => getQrEquipmentListRows(), [refreshKey]);

  const { draft, search, onDraftChange, onSearch, onReset } = useTitanListSearch(
    createEmptyEquipmentSearch,
    { storageKey: "qr-equipment-search" }
  );

  const filteredRows = useMemo(
    () => allRows.filter((row) => matchesEquipmentQrSearch(row, search)),
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

  const handleCreate = (equipmentCode) => {
    const result = createEquipmentQrRecord(equipmentCode);
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
    handleCreate(row.entityKey);
  };

  const handleDelete = (row) => {
    if (!isAdmin || !row.hasQr) return;
    const confirmed = window.confirm(`${row.equipmentCode} QR을 삭제하시겠습니까?`);
    if (!confirmed) return;
    const result = deleteEquipmentQrRecord(row.qrRecord?.id ?? row.id);
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
    targets.forEach((row) => deleteEquipmentQrRecord(row.qrRecord?.id ?? row.id));
    setSelectedIds([]);
    setDetailPopupRow(null);
    refresh();
  };

  const columns = useMemo(
    () => [
      { key: "equipmentCode", label: "설비번호", widthHint: "medium" },
      { key: "equipmentName", label: "설비명", widthHint: "wide" },
      { key: "location", label: "위치", widthHint: "medium" },
      {
        key: "equipmentStatusLabel",
        label: "상태",
        widthHint: "narrow",
        render: (row) => (
          <StatusChip variant={row.equipmentStatusVariant}>{row.equipmentStatusLabel}</StatusChip>
        ),
      },
      {
        key: "qrStatusLabel",
        label: "QR상태",
        widthHint: "narrow",
        render: (row) => <StatusChip variant={row.qrStatusVariant}>{row.qrStatusLabel}</StatusChip>,
      },
      titanColumn("incomingDate", { key: "createdAtLabel", label: "생성일" }),
      titanColumn("tableActions", {
        key: "actions",
        label: "QR관리",
        render: (row) => (
          <QrManagementRowActions
            onCreate={() => handleRowCreate(row)}
            onPrint={() => handlePrintRows([row])}
            onDelete={() => handleDelete(row)}
            canCreate={canCreate && !row.hasQr}
            canPrint={row.hasQr}
            canDelete={isAdmin && row.hasQr}
          />
        ),
      }),
    ],
    [canCreate, isAdmin, refreshKey]
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
        records={allRows}
        basicFields={EQUIPMENT_BASIC_FIELDS}
        showStatusField
        statusOptions={["미생성", "정상", "재생성"]}
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
          emptyMessage="등록된 설비가 없습니다."
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
        mode="equipment"
      />

      {printHost}

      <TitanScreenDetailPopup
        screenKey="qrEquipment"
        open={Boolean(detailPopupRow)}
        onClose={() => setDetailPopupRow(null)}
        record={detailPopupRow}
        context={{ qrRow: detailPopupRow }}
      />
    </div>
  );
}
