import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Cog, Link2, Pencil, Plus, ShieldAlert, Trash2 } from "lucide-react";

import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import { getMasterDataScreen } from "../../config/masterDataScreens";
import {
  PROCESS_DETAIL_TABS,
  PROCESS_EQUIPMENT_COLUMNS,
  PROCESS_LIST_COLUMNS,
  PROCESS_LOT_COLUMNS,
  PROCESS_MATERIAL_COLUMNS,
  PROCESS_PRODUCT_COLUMNS,
  PROCESS_PROFILE_FIELDS,
  PROCESS_STANDARD_FIELDS,
} from "../../config/processDetailSections";
import {
  formatMasterRowForDisplay,
  getMasterDataByCategory,
  searchMasterData,
  stageMasterAdd,
  stageMasterDelete,
  stageMasterUpdate,
} from "../../utils/masterData";
import {
  buildProcessListMeta,
  buildProcessMasterDetail,
  buildProcessMasterSummary,
} from "../../utils/processMasterDetail";
import MasterDataBackLink from "./MasterDataBackLink";
import MasterDataRegisterModal from "./MasterDataRegisterModal";
import MasterDataDeleteDialog from "./MasterDataDeleteDialog";

import "../InOut/InboundManagement.css";
import "./CompanyManagement.css";
import "./ProductManagement.css";
import "./ProcessManagement.css";
import "./MasterDataSprint8Polish.css";

const SELECTION_KEY = "titan-master-selected-processes-id";
const CATEGORY_KEY = "heatTreatment";

const PROCESS_KPI_ICON = {
  total: Cog,
  active: CheckCircle2,
  "equipment-linked": Link2,
  "needs-care": ShieldAlert,
};

function renderCell(row, key) {
  const value = row?.[key];
  if (value == null || String(value).trim() === "") return "—";
  return String(value);
}

function buildColumns(columns) {
  return columns.map((col) => ({
    key: col.key,
    label: col.label,
    render: (row) => renderCell(row, col.key),
  }));
}

function DetailTable({ columns, rows, emptyMessage }) {
  if (!rows.length) {
    return <p className="company-detail-section__empty">{emptyMessage}</p>;
  }
  return (
    <div className="company-detail-section__contacts-table master-data-grid">
      <TitanDataTable
        className="inbound-page__table company-detail-section__contacts-table-inner"
        columns={buildColumns(columns)}
        rows={rows}
        emptyMessage={emptyMessage}
      />
    </div>
  );
}

function FieldGrid({ fields, source, variant = "trade" }) {
  return (
    <dl className={`company-detail-section__grid company-detail-section__grid--${variant}`}>
      {fields.map((field) => {
        let value = source?.[field.key];
        if (field.render === "count") value = `${Number(value ?? 0).toLocaleString("ko-KR")}건`;
        if (field.render === "active") {
          value = source?.activeLabel ?? (source?.active === false ? "미사용" : "사용");
        }
        const display = value == null || String(value).trim() === "" ? "—" : String(value);
        return (
          <div
            key={field.key}
            className={field.span === 2 ? "company-detail-section__grid-span-2" : undefined}
          >
            <dt>{field.label}</dt>
            <dd>{display}</dd>
          </div>
        );
      })}
    </dl>
  );
}

function typeTone(type) {
  if (type === "등록") return "reg";
  if (type === "Import") return "import";
  if (type === "Sync") return "sync";
  return "edit";
}

/** Sprint 8 · 공정관리 — Domain Master Workspace (Material Master 패턴 재사용) */
export default function ProcessManagementPage() {
  const screen = getMasterDataScreen("processes");
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedId, setSelectedId] = useState(() => sessionStorage.getItem(SELECTION_KEY) ?? "");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerMode, setRegisterMode] = useState("add");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const allRows = useMemo(
    () => getMasterDataByCategory(CATEGORY_KEY).map((row) => formatMasterRowForDisplay(row)),
    [refreshKey]
  );

  const summaryKpis = useMemo(() => buildProcessMasterSummary(), [refreshKey]);
  const listMeta = useMemo(() => buildProcessListMeta(), [refreshKey]);

  const filteredRows = useMemo(() => {
    const keyword = searchKeyword.trim();
    if (!keyword) return allRows;
    const matchedIds = new Set(searchMasterData(CATEGORY_KEY, keyword).map((row) => row.id));
    return allRows.filter((row) => matchedIds.has(row.id));
  }, [allRows, searchKeyword]);

  const rowsWithMeta = useMemo(
    () =>
      filteredRows.map((row) => ({
        ...row,
        productCount: `${listMeta.get(row.id)?.productCount ?? 0}건`,
      })),
    [filteredRows, listMeta]
  );

  const {
    page,
    pageSize,
    totalCount,
    totalPages,
    pagedItems: pagedRows,
    setPage,
    setPageSize,
  } = useListPagination(rowsWithMeta);

  const selectedRow = useMemo(
    () => allRows.find((row) => row.id === selectedId) ?? null,
    [allRows, selectedId]
  );

  const detail = useMemo(() => buildProcessMasterDetail(selectedRow), [selectedRow, refreshKey]);

  useEffect(() => {
    setPage(1);
  }, [searchKeyword, setPage]);

  useEffect(() => {
    if (!selectedId) return;
    if (!allRows.some((row) => row.id === selectedId)) {
      setSelectedId("");
      sessionStorage.removeItem(SELECTION_KEY);
    }
  }, [allRows, selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    sessionStorage.setItem(SELECTION_KEY, selectedId);
  }, [selectedId]);

  const listColumns = useMemo(
    () =>
      PROCESS_LIST_COLUMNS.map((col) => ({
        key: col.key,
        label: col.label,
        widthPercent: col.widthPercent,
        render:
          col.render === "active"
            ? (row) => (
                <span className={`status-badge ${row.active === false ? "미사용" : "사용"}`}>
                  {row.activeLabel ?? (row.active === false ? "미사용" : "사용")}
                </span>
              )
            : col.render === "meta"
              ? (row) => <span className="product-master-meta-cell">{row[col.key]}</span>
              : (row) => renderCell(row, col.key),
      })),
    []
  );

  const openRegister = (mode) => {
    setRegisterMode(mode);
    setRegisterOpen(true);
  };

  const handleSave = (form) => {
    const result =
      registerMode === "edit" && selectedRow
        ? stageMasterUpdate(CATEGORY_KEY, selectedRow.id, form)
        : stageMasterAdd(CATEGORY_KEY, form);
    if (!result.ok) return;
    setRefreshKey((key) => key + 1);
    setRegisterOpen(false);
    if (result.row?.id) setSelectedId(result.row.id);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const result = stageMasterDelete(CATEGORY_KEY, deleteTarget.id);
    if (!result.ok) return;
    setDeleteTarget(null);
    if (selectedId === deleteTarget.id) {
      setSelectedId("");
      sessionStorage.removeItem(SELECTION_KEY);
    }
    setRefreshKey((key) => key + 1);
  };

  const health = detail.health ?? { status: "error", label: "관리 필요", icon: "🔴" };
  const tabCounts = {
    equipment: detail.counts.equipment,
    products: detail.counts.products,
    materials: detail.counts.materials,
    lots: detail.counts.lots,
  };

  return (
    <>
      <div className="company-management-page">
        <MasterDataBackLink />

        <div className="company-management-page__head">
          <div>
            <h2>공정관리</h2>
            <p className="company-management-page__intro">
              열처리 공정 Master 입니다. 좌측 목록에서 공정을 선택하면 우측에서 연결 설비 · 적용 제품
              · 관련 재질 · LOT · 표준정보를 확인할 수 있습니다. (Domain Master Workspace)
            </p>
          </div>
        </div>

        <section className="company-master-kpis" aria-label="공정 현황 요약">
          {summaryKpis.map((kpi) => {
            const Icon = PROCESS_KPI_ICON[kpi.id] ?? Cog;
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

        <div className="company-management-page__search">
          <input
            type="search"
            value={searchKeyword}
            onChange={(event) => setSearchKeyword(event.target.value)}
            placeholder="공정명 · 공정코드 · 상태 검색"
            aria-label="공정 검색"
          />
        </div>

        <div className="domain-master-workspace">
          <div className="domain-master-workspace__list">
            <div className="domain-master-workspace__list-head">
              <h3>공정 목록</h3>
              <PrimaryButton type="button" onClick={() => openRegister("add")}>
                <Plus size={14} aria-hidden="true" />
                등록
              </PrimaryButton>
            </div>
            <TitanDataTable
              className="inbound-page__table company-management-page__table--compact company-management-page__table--process"
              columns={listColumns}
              rows={pagedRows}
              activeRowId={selectedId}
              onRowClick={(row) => setSelectedId(row.id)}
              emptyMessage="등록된 공정이 없습니다."
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

          <div className="domain-master-workspace__detail">
            {selectedRow ? (
              <>
                <header className="domain-master-detail__header">
                  <div className="domain-master-detail__title">
                    <h3>{selectedRow.name || "—"}</h3>
                    <span className="domain-master-detail__spec">{selectedRow.code || "코드 미등록"}</span>
                  </div>
                  <div className="domain-master-detail__header-actions">
                    <span
                      className={`product-health-badge is-${health.status}`}
                      aria-label={`Process Health: ${health.label}`}
                    >
                      <span aria-hidden="true">{health.icon}</span>
                      {health.label}
                    </span>
                    <SecondaryButton type="button" onClick={() => openRegister("edit")}>
                      <Pencil size={14} aria-hidden="true" />
                      수정
                    </SecondaryButton>
                    <SecondaryButton type="button" onClick={() => setDeleteTarget(selectedRow)}>
                      <Trash2 size={14} aria-hidden="true" />
                      삭제
                    </SecondaryButton>
                  </div>
                </header>

                <section className="domain-master-detail__summary-card" aria-label="대표 스펙">
                  <div className="domain-master-summary__main">
                    <span className="domain-master-summary__name">{detail.summaryCard.name}</span>
                    <span className="domain-master-summary__spec">{detail.summaryCard.code}</span>
                  </div>
                  <div className="domain-master-summary__metrics">
                    <div>
                      <span className="domain-master-summary__label">사용 제품</span>
                      <strong>{detail.summaryCard.productCount}EA</strong>
                    </div>
                    <div>
                      <span className="domain-master-summary__label">최근 LOT</span>
                      <strong>{detail.summaryCard.recentLotCount}EA</strong>
                    </div>
                    <div>
                      <span className="domain-master-summary__label">대표 설비</span>
                      <strong>{detail.summaryCard.representativeEquipment}</strong>
                    </div>
                  </div>
                </section>

                <nav className="company-detail-tabs" aria-label="공정 상세">
                  {PROCESS_DETAIL_TABS.map((tab) => {
                    const count = tabCounts[tab.id];
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        className={`company-detail-tabs__btn${activeTab === tab.id ? " is-active" : ""}`}
                        onClick={() => setActiveTab(tab.id)}
                        aria-selected={activeTab === tab.id}
                      >
                        {tab.label}
                        {typeof count === "number" ? (
                          <span className="company-detail-tabs__count">{count}</span>
                        ) : null}
                      </button>
                    );
                  })}
                </nav>

                <div className="domain-master-detail__body">
                  {activeTab === "profile" ? (
                    <section className="company-detail-section" aria-label="기본정보">
                      <FieldGrid fields={PROCESS_PROFILE_FIELDS} source={selectedRow} variant="profile" />
                    </section>
                  ) : null}

                  {activeTab === "equipment" ? (
                    <section className="company-detail-section" aria-label="연결 설비">
                      <DetailTable
                        columns={PROCESS_EQUIPMENT_COLUMNS}
                        rows={detail.equipment}
                        emptyMessage="연결된 설비가 없습니다."
                      />
                    </section>
                  ) : null}

                  {activeTab === "products" ? (
                    <section className="company-detail-section" aria-label="적용 제품">
                      <DetailTable
                        columns={PROCESS_PRODUCT_COLUMNS}
                        rows={detail.products}
                        emptyMessage="연결된 제품이 없습니다."
                      />
                    </section>
                  ) : null}

                  {activeTab === "materials" ? (
                    <section className="company-detail-section" aria-label="관련 재질">
                      <DetailTable
                        columns={PROCESS_MATERIAL_COLUMNS}
                        rows={detail.materials}
                        emptyMessage="관련 재질이 없습니다."
                      />
                    </section>
                  ) : null}

                  {activeTab === "lots" ? (
                    <section className="company-detail-section" aria-label="최근 LOT">
                      <DetailTable
                        columns={PROCESS_LOT_COLUMNS}
                        rows={detail.lots}
                        emptyMessage="관련 LOT 이 없습니다."
                      />
                    </section>
                  ) : null}

                  {activeTab === "standard" ? (
                    <section className="company-detail-section" aria-label="표준정보">
                      <FieldGrid fields={PROCESS_STANDARD_FIELDS} source={detail.standard} />
                      <p className="company-detail-section__empty">
                        표준정보는 조회 전용입니다. (향후 Recipe · 담당부서 연결 준비)
                      </p>
                    </section>
                  ) : null}

                  {activeTab === "updates" ? (
                    <section className="company-detail-section" aria-label="최근 수정">
                      {detail.recentUpdates.length ? (
                        <ul className="company-detail-updates">
                          {detail.recentUpdates.map((row) => (
                            <li
                              key={row.id}
                              className="company-detail-updates__row company-detail-updates__row--typed"
                            >
                              <span className="company-detail-updates__date">{row.date}</span>
                              <span className="company-detail-updates__time">{row.time}</span>
                              <span className={`company-detail-updates__type is-${typeTone(row.type)}`}>
                                {row.type}
                              </span>
                              <span className="company-detail-updates__body">
                                <span className="company-detail-updates__label">{row.label}</span>
                                <span className="company-detail-updates__user">{row.user}</span>
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="company-detail-section__empty">
                          수정 이력이 기록되면 표시됩니다. (등록 · 수정 · Import · Sync)
                        </p>
                      )}
                    </section>
                  ) : null}
                </div>
              </>
            ) : (
              <div className="domain-master-detail__empty">
                <Cog size={32} aria-hidden="true" />
                <p>좌측 목록에서 공정을 선택하면 상세 정보가 표시됩니다.</p>
              </div>
            )}
          </div>
        </div>

        <footer className="product-master-status" aria-live="polite">
          {selectedRow ? (
            <>
              <span className="product-master-status__title">선택 공정</span>
              <span className="product-master-status__name">{selectedRow.name || "—"}</span>
              <span className="product-master-status__item">
                공정코드 <strong>{selectedRow.code || "—"}</strong>
              </span>
              <span className="product-master-status__item">
                연결 제품 <strong>{detail.summaryCard.productCount}EA</strong>
              </span>
              <span className="product-master-status__item product-master-status__health-group">
                Health
                <span className={`product-master-status__health is-${health.status}`}>
                  <span aria-hidden="true">{health.icon}</span> {health.label}
                </span>
              </span>
            </>
          ) : (
            <span className="product-master-status__empty">
              목록에서 공정을 선택하면 요약이 표시됩니다.
            </span>
          )}
        </footer>
      </div>

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
          categoryLabel={screen?.title ?? "공정"}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      ) : null}
    </>
  );
}
