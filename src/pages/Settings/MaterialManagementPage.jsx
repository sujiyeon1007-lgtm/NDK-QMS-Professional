import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Layers, Link2, Pencil, Plus, ShieldAlert, Trash2 } from "lucide-react";

import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import { getMasterDataScreen } from "../../config/masterDataScreens";
import {
  MATERIAL_CERTIFICATE_FIELDS,
  MATERIAL_DETAIL_TABS,
  MATERIAL_HEAT_FIELDS,
  MATERIAL_LIST_COLUMNS,
  MATERIAL_LOT_COLUMNS,
  MATERIAL_PROCESS_COLUMNS,
  MATERIAL_PRODUCT_COLUMNS,
  MATERIAL_PROFILE_FIELDS,
} from "../../config/materialDetailSections";
import {
  formatMasterRowForDisplay,
  getMasterDataByCategory,
  searchMasterData,
  stageMasterAdd,
  stageMasterDelete,
  stageMasterUpdate,
} from "../../utils/masterData";
import {
  buildMaterialListMeta,
  buildMaterialMasterDetail,
  buildMaterialMasterSummary,
} from "../../utils/materialMasterDetail";
import MasterDataBackLink from "./MasterDataBackLink";
import MasterDataRegisterModal from "./MasterDataRegisterModal";
import MasterDataDeleteDialog from "./MasterDataDeleteDialog";

import "../InOut/InboundManagement.css";
import "./CompanyManagement.css";
import "./ProductManagement.css";
import "./MaterialManagement.css";
import "./MasterDataSprint8Polish.css";

const SELECTION_KEY = "titan-master-selected-materials-id";

const MATERIAL_KPI_ICON = {
  total: Layers,
  active: CheckCircle2,
  linked: Link2,
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

/** Sprint 8 · 재질관리 — Domain Master Workspace (2-Panel · 기준 화면) */
export default function MaterialManagementPage() {
  const screen = getMasterDataScreen("materials");
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedId, setSelectedId] = useState(() => sessionStorage.getItem(SELECTION_KEY) ?? "");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerMode, setRegisterMode] = useState("add");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const allRows = useMemo(
    () => getMasterDataByCategory("materials").map((row) => formatMasterRowForDisplay(row)),
    [refreshKey]
  );

  const summaryKpis = useMemo(() => buildMaterialMasterSummary(), [refreshKey]);
  const listMeta = useMemo(() => buildMaterialListMeta(), [refreshKey]);

  const filteredRows = useMemo(() => {
    const keyword = searchKeyword.trim();
    if (!keyword) return allRows;
    const matchedIds = new Set(searchMasterData("materials", keyword).map((row) => row.id));
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

  const detail = useMemo(() => buildMaterialMasterDetail(selectedRow), [selectedRow, refreshKey]);

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
      MATERIAL_LIST_COLUMNS.map((col) => ({
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
        ? stageMasterUpdate("materials", selectedRow.id, form)
        : stageMasterAdd("materials", form);
    if (!result.ok) return;
    setRefreshKey((key) => key + 1);
    setRegisterOpen(false);
    if (result.row?.id) setSelectedId(result.row.id);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const result = stageMasterDelete("materials", deleteTarget.id);
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
    products: detail.counts.products,
    processes: detail.counts.processes,
    lots: detail.counts.lots,
    certificate: detail.counts.certificate,
  };

  return (
    <>
      <div className="company-management-page">
        <MasterDataBackLink />

        <div className="company-management-page__head">
          <div>
            <h2>재질관리</h2>
            <p className="company-management-page__intro">
              재질 Master 입니다. 좌측 목록에서 재질을 선택하면 우측에서 규격 · 열처리 조건 · 적용 제품
              · 관련 공정 · LOT · 성적서 기준을 확인할 수 있습니다. (Domain Master Workspace)
            </p>
          </div>
        </div>

        <section className="company-master-kpis" aria-label="재질 현황 요약">
          {summaryKpis.map((kpi) => {
            const Icon = MATERIAL_KPI_ICON[kpi.id] ?? Layers;
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
            placeholder="재질명 · 규격 · 상태 검색"
            aria-label="재질 검색"
          />
        </div>

        <div className="domain-master-workspace">
          {/* 좌측 — Material List */}
          <div className="domain-master-workspace__list">
            <div className="domain-master-workspace__list-head">
              <h3>재질 목록</h3>
              <PrimaryButton type="button" onClick={() => openRegister("add")}>
                <Plus size={14} aria-hidden="true" />
                등록
              </PrimaryButton>
            </div>
            <TitanDataTable
              className="inbound-page__table company-management-page__table--compact company-management-page__table--material"
              columns={listColumns}
              rows={pagedRows}
              activeRowId={selectedId}
              onRowClick={(row) => setSelectedId(row.id)}
              emptyMessage="등록된 재질이 없습니다."
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

          {/* 우측 — Detail Workspace */}
          <div className="domain-master-workspace__detail">
            {selectedRow ? (
              <>
                <header className="domain-master-detail__header">
                  <div className="domain-master-detail__title">
                    <h3>{selectedRow.name || "—"}</h3>
                    <span className="domain-master-detail__spec">
                      {selectedRow.spec || "규격 미등록"}
                    </span>
                  </div>
                  <div className="domain-master-detail__header-actions">
                    <span
                      className={`product-health-badge is-${health.status}`}
                      aria-label={`Material Health: ${health.label}`}
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

                {/* 대표 스펙 카드 */}
                <section className="domain-master-detail__summary-card" aria-label="대표 스펙">
                  <div className="domain-master-summary__main">
                    <span className="domain-master-summary__name">{detail.summaryCard.name}</span>
                    <span className="domain-master-summary__spec">{detail.summaryCard.spec}</span>
                  </div>
                  <div className="domain-master-summary__metrics">
                    <div>
                      <span className="domain-master-summary__label">대표 제품 수</span>
                      <strong>{detail.summaryCard.productCount}종</strong>
                    </div>
                    <div>
                      <span className="domain-master-summary__label">최근 LOT</span>
                      <strong>{detail.summaryCard.recentLot}</strong>
                    </div>
                    <div>
                      <span className="domain-master-summary__label">대표 열처리</span>
                      <strong>{detail.summaryCard.representativeHeat}</strong>
                    </div>
                  </div>
                </section>

                {/* Tabs */}
                <nav className="company-detail-tabs" aria-label="재질 상세">
                  {MATERIAL_DETAIL_TABS.map((tab) => {
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
                      <FieldGrid
                        fields={MATERIAL_PROFILE_FIELDS}
                        source={selectedRow}
                        variant="profile"
                      />
                    </section>
                  ) : null}

                  {activeTab === "heat" ? (
                    <section className="company-detail-section" aria-label="열처리 조건">
                      <FieldGrid fields={MATERIAL_HEAT_FIELDS} source={detail.heatTreatment} />
                    </section>
                  ) : null}

                  {activeTab === "products" ? (
                    <section className="company-detail-section" aria-label="적용 제품">
                      <DetailTable
                        columns={MATERIAL_PRODUCT_COLUMNS}
                        rows={detail.products}
                        emptyMessage="연결된 제품이 없습니다."
                      />
                    </section>
                  ) : null}

                  {activeTab === "processes" ? (
                    <section className="company-detail-section" aria-label="관련 공정">
                      <DetailTable
                        columns={MATERIAL_PROCESS_COLUMNS}
                        rows={detail.processes}
                        emptyMessage="관련 공정이 없습니다."
                      />
                    </section>
                  ) : null}

                  {activeTab === "lots" ? (
                    <section className="company-detail-section" aria-label="관련 LOT">
                      <DetailTable
                        columns={MATERIAL_LOT_COLUMNS}
                        rows={detail.lots}
                        emptyMessage="관련 LOT 이 없습니다."
                      />
                    </section>
                  ) : null}

                  {activeTab === "certificate" ? (
                    <section className="company-detail-section" aria-label="성적서 기준">
                      <FieldGrid fields={MATERIAL_CERTIFICATE_FIELDS} source={detail.certificate} />
                      <p className="company-detail-section__empty">
                        성적서 기준은 조회 전용입니다. (Document Engine · TDE 연결 준비)
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
                <Layers size={32} aria-hidden="true" />
                <p>좌측 목록에서 재질을 선택하면 상세 정보가 표시됩니다.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Status */}
        <footer className="product-master-status" aria-live="polite">
          {selectedRow ? (
            <>
              <span className="product-master-status__title">선택 재질</span>
              <span className="product-master-status__name">{selectedRow.name || "—"}</span>
              <span className="product-master-status__item">
                규격 <strong>{selectedRow.spec || "—"}</strong>
              </span>
              <span className="product-master-status__item">
                제품 <strong>{detail.summaryCard.productCount}EA</strong>
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
              목록에서 재질을 선택하면 요약이 표시됩니다.
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
          categoryLabel={screen?.title ?? "재질"}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      ) : null}
    </>
  );
}
