import { useEffect, useMemo, useState } from "react";
import { Building2, Handshake, Pencil, Plus, Trash2, UserCheck, UserX } from "lucide-react";

import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import { COMPANY_LIST_COLUMNS } from "../../config/companyDetailSections";
import { getMasterDataScreen } from "../../config/masterDataScreens";
import {
  formatMasterRowForDisplay,
  getMasterDataByCategory,
  searchMasterData,
  stageMasterAdd,
  stageMasterDelete,
  stageMasterUpdate,
} from "../../utils/masterData";
import { buildCompanyMasterSummary } from "../../utils/companyMasterDetail";
import CompanyDetailModal from "./CompanyDetailModal";
import TitanListInteractionHint from "../../foundation/components/TitanListInteractionHint";
import MasterDataBackLink from "./MasterDataBackLink";
import MasterDataRegisterModal from "./MasterDataRegisterModal";
import MasterDataDeleteDialog from "./MasterDataDeleteDialog";

import "../InOut/InboundManagement.css";
import "./CompanyManagement.css";

const COMPANY_SELECTION_KEY = "titan-master-selected-company-id";

const COMPANY_KPI_ICON = {
  total: Building2,
  trading: Handshake,
  "with-contact": UserCheck,
  "missing-contact": UserX,
};

function renderActiveLabel(row) {
  return row.activeLabel ?? (row.active === false ? "미사용" : "사용");
}

/** 기준정보관리 — 거래처관리 (거래처 리스트 전용) */
export default function CompanyManagementPage() {
  const screen = getMasterDataScreen("companies");
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedCompanyId, setSelectedCompanyId] = useState(
    () => sessionStorage.getItem(COMPANY_SELECTION_KEY) ?? ""
  );
  const [searchKeyword, setSearchKeyword] = useState("");
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerMode, setRegisterMode] = useState("add");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailCompany, setDetailCompany] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const allCompanies = useMemo(() => {
    return getMasterDataByCategory("companies").map((row) => formatMasterRowForDisplay(row));
  }, [refreshKey]);

  const summaryKpis = useMemo(() => buildCompanyMasterSummary(), [refreshKey]);

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

  useEffect(() => {
    if (!detailOpen || !detailCompany?.id) return;
    const latest = allCompanies.find((row) => row.id === detailCompany.id);
    if (latest) setDetailCompany(latest);
  }, [allCompanies, detailCompany?.id, detailOpen]);

  const tableColumns = useMemo(
    () =>
      COMPANY_LIST_COLUMNS.map((col) => ({
        key: col.key,
        label: col.label,
        identifier: col.identifier,
        render:
          col.render === "active"
            ? (row) => (
                <span className={`status-badge ${row.active === false ? "미사용" : "사용"}`}>
                  {renderActiveLabel(row)}
                </span>
              )
            : undefined,
      })),
    []
  );

  const openDetail = (row) => {
    setSelectedCompanyId(row.id);
    setDetailCompany(row);
    setDetailOpen(true);
  };

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
    if (result.row?.id) {
      setSelectedCompanyId(result.row.id);
      if (detailOpen) {
        setDetailCompany(formatMasterRowForDisplay(result.row));
      }
    }
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
    if (detailCompany?.id === deleteTarget.id) {
      setDetailOpen(false);
      setDetailCompany(null);
    }
    setRefreshKey((key) => key + 1);
  };

  return (
    <>
      <div className="company-management-page">
        <MasterDataBackLink />

        <div className="company-management-page__head">
          <div>
            <h2>거래처관리</h2>
            <p className="company-management-page__intro">
              Project TITAN 전체가 참조하는 거래처 Master 입니다. 행을 더블클릭하면 상세 Popup에서
              기본정보 · 담당자 · 거래이력 · 관련 제품 · LOT · 출고 · 품질까지 확인할 수 있습니다.
            </p>
          </div>
        </div>

        <section className="company-master-kpis" aria-label="거래처 현황 요약">
          {summaryKpis.map((kpi) => {
            const Icon = COMPANY_KPI_ICON[kpi.id] ?? Building2;
            return (
              <div
                key={kpi.id}
                className={`company-master-kpi${kpi.tone === "danger" ? " is-danger" : ""}`}
              >
                <div className="company-master-kpi__head">
                  <span className="company-master-kpi__icon">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <span className="company-master-kpi__label">{kpi.label}</span>
                </div>
                <div className="company-master-kpi__value">
                  {Number(kpi.value ?? 0).toLocaleString("ko-KR")}
                  <em>{kpi.unit}</em>
                </div>
              </div>
            );
          })}
        </section>

        <TitanListInteractionHint />

        <div className="company-management-page__search">
          <input
            type="search"
            value={searchKeyword}
            onChange={(event) => setSearchKeyword(event.target.value)}
            placeholder="업체명 · 코드 · 대표자 · 담당자 · 이메일 검색"
            aria-label="거래처 검색"
          />
        </div>

        <div className="company-management-page__table-wrap company-management-page__table-wrap--compact master-data-grid">
          <TitanDataTable
            className="inbound-page__table company-management-page__table--compact"
            columns={tableColumns}
            rows={pagedCompanies}
            activeRowId={selectedCompanyId}
            onRowClick={(row) => setSelectedCompanyId(row.id)}
            onRowDoubleClick={(row) => openDetail(row)}
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

        <div className="company-management-page__actions master-data-actions">
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
      </div>

      <CompanyDetailModal
        open={detailOpen}
        company={detailCompany}
        onClose={() => setDetailOpen(false)}
      />

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
