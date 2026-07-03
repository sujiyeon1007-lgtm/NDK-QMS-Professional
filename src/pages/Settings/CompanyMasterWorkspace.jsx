import { useEffect, useMemo, useState } from "react";
import { Building2, Layers, Pencil, Plus, Trash2 } from "lucide-react";

import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import {
  formatMasterRowForDisplay,
  getMasterDataByCategory,
  searchMasterData,
  stageMasterAdd,
  stageMasterDelete,
  stageMasterUpdate,
} from "../../utils/masterData";
import { getMasterDataScreen } from "../../config/masterDataScreens";
import MasterDataRegisterModal from "./MasterDataRegisterModal";
import MasterDataDeleteDialog from "./MasterDataDeleteDialog";
import MasterDataManagement from "./MasterDataManagement";

import "../InOut/InboundManagement.css";
import "./MasterDataSplitLayout.css";

const COMPANY_SELECTION_KEY = "titan-master-selected-company-id";

function renderActiveLabel(row) {
  return row.activeLabel ?? (row.active === false ? "미사용" : "사용");
}

/** 업체관리 Workspace — Modal 내부 · 좌 거래처 / 우 제품 Master */
export default function CompanyMasterWorkspace() {
  const screen = getMasterDataScreen("companies");
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedCompanyId, setSelectedCompanyId] = useState(
    () => sessionStorage.getItem(COMPANY_SELECTION_KEY) ?? ""
  );
  const [searchKeyword, setSearchKeyword] = useState("");
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerMode, setRegisterMode] = useState("add");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const allCompanies = useMemo(() => {
    return getMasterDataByCategory("companies").map((row) => formatMasterRowForDisplay(row));
  }, [refreshKey]);

  const filteredCompanies = useMemo(() => {
    const keyword = searchKeyword.trim();
    if (!keyword) return allCompanies;
    const matchedIds = new Set(searchMasterData("companies", keyword).map((row) => row.id));
    return allCompanies.filter((row) => matchedIds.has(row.id));
  }, [allCompanies, searchKeyword]);

  const {
    page,
    pageSize,
    totalCount,
    totalPages,
    pagedItems: pagedCompanies,
    setPage,
    setPageSize,
  } = useListPagination(filteredCompanies);

  const selectedCompany = useMemo(
    () => allCompanies.find((row) => row.id === selectedCompanyId) ?? null,
    [allCompanies, selectedCompanyId]
  );

  useEffect(() => {
    setPage(1);
  }, [searchKeyword, setPage]);

  useEffect(() => {
    if (!selectedCompanyId) return;
    const exists = allCompanies.some((row) => row.id === selectedCompanyId);
    if (!exists) {
      setSelectedCompanyId("");
      sessionStorage.removeItem(COMPANY_SELECTION_KEY);
    }
  }, [allCompanies, selectedCompanyId]);

  useEffect(() => {
    if (!selectedCompanyId) return;
    sessionStorage.setItem(COMPANY_SELECTION_KEY, selectedCompanyId);
  }, [selectedCompanyId]);

  const tableColumns = useMemo(
    () =>
      (screen?.columns ?? []).slice(0, 4).map((col) => ({
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

  const openRegister = (mode, row = null) => {
    setRegisterMode(mode);
    setRegisterOpen(true);
    if (mode === "edit" && row) setSelectedCompanyId(row.id);
  };

  const handleSave = (form) => {
    const result =
      registerMode === "edit" && selectedCompany
        ? stageMasterUpdate("companies", selectedCompany.id, form)
        : stageMasterAdd("companies", form);

    if (!result.ok) return;
    setRefreshKey((key) => key + 1);
    setRegisterOpen(false);
    if (result.row?.id) setSelectedCompanyId(result.row.id);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const result = stageMasterDelete("companies", deleteTarget.id);
    if (!result.ok) return;
    setDeleteTarget(null);
    if (selectedCompanyId === deleteTarget.id) {
      setSelectedCompanyId("");
      sessionStorage.removeItem(COMPANY_SELECTION_KEY);
    }
    setRefreshKey((key) => key + 1);
  };

  return (
    <>
      <div className="master-data-split-page">
        <div className="master-data-split-page__grid">
          <aside className="master-data-split-page__nav" aria-label="거래처 리스트">
            <div className="master-data-split-page__nav-head">
              <div>
                <h2>거래처 리스트</h2>
                <span>총 {filteredCompanies.length.toLocaleString("ko-KR")}건</span>
              </div>
            </div>

            <div className="master-data-split-page__nav-actions">
              <PrimaryButton type="button" onClick={() => openRegister("add")}>
                <Plus size={14} aria-hidden="true" />
                등록
              </PrimaryButton>
              <SecondaryButton
                type="button"
                onClick={() => openRegister("edit", selectedCompany)}
                disabled={!selectedCompany}
              >
                <Pencil size={14} aria-hidden="true" />
                수정
              </SecondaryButton>
              <SecondaryButton
                type="button"
                onClick={() => setDeleteTarget(selectedCompany)}
                disabled={!selectedCompany}
              >
                <Trash2 size={14} aria-hidden="true" />
                삭제
              </SecondaryButton>
            </div>

            <div className="master-data-split-page__nav-search">
              <input
                type="search"
                value={searchKeyword}
                onChange={(event) => setSearchKeyword(event.target.value)}
                placeholder="업체명 · 코드 · 담당자 검색"
                aria-label="거래처 검색"
              />
            </div>

            <div className="master-data-split-page__scroll">
              <TitanDataTable
                className="inbound-page__table"
                columns={tableColumns}
                rows={pagedCompanies}
                activeRowId={selectedCompanyId}
                onRowClick={(row) => setSelectedCompanyId(row.id)}
                onRowDoubleClick={(row) => openRegister("edit", row)}
                emptyMessage="등록된 거래처가 없습니다."
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
          </aside>

          <section className="master-data-split-page__content" aria-label="제품 Master">
            {selectedCompany ? (
              <MasterDataManagement
                forcedTabId="products"
                companyFilter={selectedCompany.name}
                layoutMode="panel"
                inlineActions
                registerDefaults={{ company: selectedCompany.name }}
                panelTitle={`${selectedCompany.name} · 제품 Master`}
              />
            ) : (
              <p className="master-data-split-page__empty">
                좌측에서 거래처를 선택하면
                <br />
                제품 Master를 조회·등록·수정할 수 있습니다.
              </p>
            )}
          </section>
        </div>
      </div>

      <MasterDataRegisterModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSave={handleSave}
        screen={screen}
        mode={registerMode}
        initialRow={registerMode === "edit" ? selectedCompany : null}
      />

      {deleteTarget ? (
        <MasterDataDeleteDialog
          row={deleteTarget}
          categoryLabel={screen?.title ?? "거래처"}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      ) : null}
    </>
  );
}
