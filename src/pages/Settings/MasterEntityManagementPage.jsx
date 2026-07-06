import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import { getMasterDataLauncherItem } from "../../config/masterDataLauncher";
import { getMasterDataScreen } from "../../config/masterDataScreens";
import {
  formatMasterRowForDisplay,
  getMasterDataByCategory,
  searchMasterData,
  stageMasterAdd,
  stageMasterDelete,
  stageMasterUpdate,
} from "../../utils/masterData";
import TitanListInteractionHint from "../../foundation/components/TitanListInteractionHint";
import MasterDataBackLink from "./MasterDataBackLink";
import MasterEntityDetailModal from "./MasterEntityDetailModal";
import MasterDataRegisterModal from "./MasterDataRegisterModal";
import MasterDataDeleteDialog from "./MasterDataDeleteDialog";

import "../InOut/InboundManagement.css";
import "./CompanyManagement.css";

function renderActiveLabel(row) {
  return row.activeLabel ?? (row.active === false ? "미사용" : "사용");
}

/** 재질 · 공정 · 설비 · 작업자 — 독립 리스트 + 상세 Popup */
export default function MasterEntityManagementPage({ tabId }) {
  const launcherItem = getMasterDataLauncherItem(tabId);
  const screen = getMasterDataScreen(tabId);
  const pageTitle = launcherItem?.label ?? screen?.title ?? "기준정보";
  const categoryKey = screen?.categoryKey ?? tabId;
  const selectionKey = `titan-master-selected-${tabId}-id`;

  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedRowId, setSelectedRowId] = useState(() => sessionStorage.getItem(selectionKey) ?? "");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerMode, setRegisterMode] = useState("add");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailRow, setDetailRow] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const allRows = useMemo(() => {
    return getMasterDataByCategory(categoryKey).map((row) => formatMasterRowForDisplay(row));
  }, [categoryKey, refreshKey]);

  const filteredRows = useMemo(() => {
    const keyword = searchKeyword.trim();
    if (!keyword) return allRows;
    const matchedIds = new Set(searchMasterData(categoryKey, keyword).map((row) => row.id));
    return allRows.filter((row) => matchedIds.has(row.id));
  }, [allRows, categoryKey, searchKeyword]);

  const {
    page,
    pageSize,
    totalCount,
    totalPages,
    pagedItems: pagedRows,
    setPage,
    setPageSize,
  } = useListPagination(filteredRows);

  const selectedRow = useMemo(
    () => allRows.find((row) => row.id === selectedRowId) ?? null,
    [allRows, selectedRowId]
  );

  useEffect(() => {
    setPage(1);
  }, [searchKeyword, setPage]);

  useEffect(() => {
    if (!selectedRowId) return;
    const exists = allRows.some((row) => row.id === selectedRowId);
    if (!exists) {
      setSelectedRowId("");
      sessionStorage.removeItem(selectionKey);
    }
  }, [allRows, selectedRowId, selectionKey]);

  useEffect(() => {
    if (!selectedRowId) return;
    sessionStorage.setItem(selectionKey, selectedRowId);
  }, [selectedRowId, selectionKey]);

  useEffect(() => {
    if (!detailOpen || !detailRow?.id) return;
    const latest = allRows.find((row) => row.id === detailRow.id);
    if (latest) setDetailRow(latest);
  }, [allRows, detailOpen, detailRow?.id]);

  const tableColumns = useMemo(
    () =>
      (screen?.columns ?? []).map((col) => ({
        key: col.key,
        label: col.label,
        widthPercent: col.widthPercent,
        render:
          col.render === "active"
            ? (row) => (
                <span className={`status-badge ${row.active === false ? "미사용" : "사용"}`}>
                  {renderActiveLabel(row)}
                </span>
              )
            : undefined,
      })),
    [screen?.columns]
  );

  const openDetail = (row) => {
    setSelectedRowId(row.id);
    setDetailRow(row);
    setDetailOpen(true);
  };

  const openRegister = (mode, row = null) => {
    setRegisterMode(mode);
    setRegisterOpen(true);
    if (mode === "edit" && row) setSelectedRowId(row.id);
  };

  const handleSave = (form) => {
    const result =
      registerMode === "edit" && selectedRow
        ? stageMasterUpdate(categoryKey, selectedRow.id, form)
        : stageMasterAdd(categoryKey, form);

    if (!result.ok) return;
    setRefreshKey((key) => key + 1);
    setRegisterOpen(false);
    if (result.row?.id) {
      setSelectedRowId(result.row.id);
      if (detailOpen) {
        setDetailRow(formatMasterRowForDisplay(result.row));
      }
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const result = stageMasterDelete(categoryKey, deleteTarget.id);
    if (!result.ok) return;
    setDeleteTarget(null);
    if (selectedRowId === deleteTarget.id) {
      setSelectedRowId("");
      sessionStorage.removeItem(selectionKey);
    }
    if (detailRow?.id === deleteTarget.id) {
      setDetailOpen(false);
      setDetailRow(null);
    }
    setRefreshKey((key) => key + 1);
  };

  if (!screen) return null;

  const tableVariantClass =
    tabId === "equipment"
      ? "company-management-page__table--equipment"
      : tabId === "workers"
        ? "company-management-page__table--worker"
        : tabId === "materials"
          ? "company-management-page__table--material"
          : tabId === "processes"
            ? "company-management-page__table--process"
            : "";

  return (
    <>
      <div className="company-management-page">
        <MasterDataBackLink />

        <div className="company-management-page__head">
          <div>
            <h2>{pageTitle}</h2>
            <p className="company-management-page__intro">
              {launcherItem?.description ?? `${pageTitle} 목록을 관리합니다.`} 행을 더블클릭하면 상세
              Popup이 열립니다.
            </p>
          </div>
        </div>

        <TitanListInteractionHint />

        <div className="company-management-page__search">
          <input
            type="search"
            value={searchKeyword}
            onChange={(event) => setSearchKeyword(event.target.value)}
            placeholder={`${pageTitle} 검색`}
            aria-label={`${pageTitle} 검색`}
          />
        </div>

        <div className="company-management-page__table-wrap company-management-page__table-wrap--compact">
          <TitanDataTable
            className={`inbound-page__table company-management-page__table--compact${tableVariantClass ? ` ${tableVariantClass}` : ""}`}
            columns={tableColumns}
            rows={pagedRows}
            activeRowId={selectedRowId}
            onRowClick={(row) => setSelectedRowId(row.id)}
            onRowDoubleClick={(row) => openDetail(row)}
            emptyMessage={`등록된 ${pageTitle.replace("관리", "")}가 없습니다.`}
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

        <div className="company-management-page__actions">
          <PrimaryButton type="button" onClick={() => openRegister("add")}>
            <Plus size={14} aria-hidden="true" />
            등록
          </PrimaryButton>
          <SecondaryButton
            type="button"
            onClick={() => openRegister("edit", selectedRow)}
            disabled={!selectedRow}
          >
            <Pencil size={14} aria-hidden="true" />
            수정
          </SecondaryButton>
          <SecondaryButton
            type="button"
            onClick={() => setDeleteTarget(selectedRow)}
            disabled={!selectedRow}
          >
            <Trash2 size={14} aria-hidden="true" />
            삭제
          </SecondaryButton>
        </div>
      </div>

      <MasterEntityDetailModal
        open={detailOpen}
        row={detailRow}
        onClose={() => setDetailOpen(false)}
        screen={screen}
        pageTitle={pageTitle.replace("관리", "")}
      />

      <MasterDataRegisterModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSave={handleSave}
        screen={screen}
        mode={registerMode}
        initialRow={registerMode === "edit" ? selectedRow : null}
      />

      {deleteTarget ? (
        <MasterDataDeleteDialog
          row={deleteTarget}
          categoryLabel={pageTitle}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      ) : null}
    </>
  );
}
