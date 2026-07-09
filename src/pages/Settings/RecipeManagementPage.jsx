import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ClipboardList, FlaskConical, Pencil, Plus, ShieldAlert, Trash2 } from "lucide-react";

import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import { getMasterDataScreen } from "../../config/masterDataScreens";
import {
  RECIPE_APPROVAL_FIELDS,
  RECIPE_DETAIL_TABS,
  RECIPE_EQUIPMENT_COLUMNS,
  RECIPE_LIST_COLUMNS,
  RECIPE_LOT_COLUMNS,
  RECIPE_MEMO_FIELDS,
  RECIPE_PRODUCT_COLUMNS,
  RECIPE_PROFILE_FIELDS,
  RECIPE_STATUS_LABELS,
} from "../../config/recipeDetailSections";
import {
  formatMasterRowForDisplay,
  getMasterDataByCategory,
  searchMasterData,
  stageMasterAdd,
  stageMasterDelete,
  stageMasterUpdate,
} from "../../utils/masterData";
import {
  buildRecipeListMeta,
  buildRecipeMasterDetail,
  buildRecipeMasterSummary,
} from "../../utils/recipeMasterDetail";
import MasterDataRegisterModal from "./MasterDataRegisterModal";
import MasterDataDeleteDialog from "./MasterDataDeleteDialog";

import "../InOut/InboundManagement.css";
import "./CompanyManagement.css";
import "./ProductManagement.css";
import "./RecipeManagement.css";
import "./MasterDataSprint8Polish.css";

const SELECTION_KEY = "titan-master-selected-recipes-id";
const CATEGORY_KEY = "recipes";

const RECIPE_KPI_ICON = {
  total: FlaskConical,
  approved: CheckCircle2,
  pending: ClipboardList,
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

function TemplateSectionGrid({ section }) {
  return (
    <>
      <h4 className="company-detail-section__subtitle">{section.label}</h4>
      <dl className="company-detail-section__grid company-detail-section__grid--trade">
        {section.fields.map((field) => (
          <div key={field.key}>
            <dt>
              {field.label}
              {field.unit ? ` (${field.unit})` : ""}
              {field.required ? " *" : ""}
            </dt>
            <dd>{field.value}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}
function typeTone(type) {
  if (type === "등록") return "reg";
  if (type === "Import") return "import";
  if (type === "Sync") return "sync";
  if (type === "승인") return "edit";
  return "edit";
}

function statusBadgeClass(status) {
  return `recipe-status-badge is-${String(status ?? "Draft").toLowerCase()}`;
}

/** Sprint 9 Phase 2 · 열처리 Recipe Master — Domain Master Workspace (Material/Process 패턴 재사용) */
export default function RecipeManagementPage() {
  const screen = getMasterDataScreen("recipes");
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedId, setSelectedId] = useState(() => sessionStorage.getItem(SELECTION_KEY) ?? "");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerMode, setRegisterMode] = useState("add");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const allRows = useMemo(
    () =>
      getMasterDataByCategory(CATEGORY_KEY)
        .filter((row) => row.isDeleted !== true)
        .map((row) => formatMasterRowForDisplay(row)),
    [refreshKey]
  );

  const summaryKpis = useMemo(() => buildRecipeMasterSummary(), [refreshKey]);
  const listMeta = useMemo(() => buildRecipeListMeta(), [refreshKey]);

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
        statusLabel: listMeta.get(row.id)?.statusLabel ?? RECIPE_STATUS_LABELS[row.status] ?? "—",
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

  const detail = useMemo(() => buildRecipeMasterDetail(selectedRow), [selectedRow, refreshKey]);

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
      RECIPE_LIST_COLUMNS.map((col) => ({
        key: col.key,
        label: col.label,
        widthPercent: col.widthPercent,
        render:
          col.render === "status"
            ? (row) => (
                <span className={statusBadgeClass(row.status)}>{row.statusLabel ?? "—"}</span>
              )
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
    masters: detail.counts.equipment + detail.counts.products,
    history: detail.counts.lots,
  };

  const profileSource = selectedRow
    ? {
        ...selectedRow,
        statusLabel: detail.summaryCard.statusLabel,
        processName: selectedRow.processName || "—",
        materialName: selectedRow.materialName || "—",
        templateLabel: detail.templateView?.templateLabel ?? "—",
      }
    : null;

  return (
    <>
      <div className="company-management-page">
        <section className="company-master-kpis" aria-label="Recipe 현황 요약">
          {summaryKpis.map((kpi) => {
            const Icon = RECIPE_KPI_ICON[kpi.id] ?? FlaskConical;
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
            placeholder="Recipe명 · Recipe코드 · 공정 · 재질 · Status · Version 검색"
            aria-label="Recipe 검색"
          />
        </div>

        <div className="domain-master-workspace">
          <div className="domain-master-workspace__list">
            <div className="domain-master-workspace__list-head">
              <h3>Recipe 목록</h3>
              <PrimaryButton type="button" onClick={() => openRegister("add")}>
                <Plus size={14} aria-hidden="true" />
                등록
              </PrimaryButton>
            </div>
            <TitanDataTable
              className="inbound-page__table company-management-page__table--compact company-management-page__table--recipe"
              columns={listColumns}
              rows={pagedRows}
              activeRowId={selectedId}
              onRowClick={(row) => setSelectedId(row.id)}
              emptyMessage="등록된 Recipe가 없습니다."
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
                    <span className="domain-master-detail__spec">
                      {selectedRow.code || "코드 미등록"} · {detail.summaryCard.versionNo}
                    </span>
                  </div>
                  <div className="domain-master-detail__header-actions">
                    <span
                      className={`product-health-badge is-${health.status}`}
                      aria-label={`Recipe Health: ${health.label}`}
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

                <section className="domain-master-detail__summary-card" aria-label="대표 조건">
                  <div className="domain-master-summary__main">
                    <span className="domain-master-summary__name">{detail.summaryCard.name}</span>
                    <span className="domain-master-summary__spec">
                      {detail.summaryCard.code} · {detail.summaryCard.versionNo}
                    </span>
                  </div>
                  <div className="domain-master-summary__metrics">
                    <div>
                      <span className="domain-master-summary__label">Status</span>
                      <strong>{detail.summaryCard.statusLabel}</strong>
                    </div>
                    <div>
                      <span className="domain-master-summary__label">대표 온도</span>
                      <strong>{detail.summaryCard.treatmentTemp}</strong>
                    </div>
                    <div>
                      <span className="domain-master-summary__label">대표 시간</span>
                      <strong>{detail.summaryCard.treatmentTime}</strong>
                    </div>
                    <div>
                      <span className="domain-master-summary__label">연결 설비</span>
                      <strong>{detail.summaryCard.equipmentCount}EA</strong>
                    </div>
                  </div>
                </section>

                <nav className="company-detail-tabs" aria-label="Recipe 상세">
                  {RECIPE_DETAIL_TABS.map((tab) => {
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
                        {typeof count === "number" && count > 0 ? (
                          <span className="company-detail-tabs__count">{count}</span>
                        ) : null}
                      </button>
                    );
                  })}
                </nav>

                <div className="domain-master-detail__body">
                  {activeTab === "profile" ? (
                    <section className="company-detail-section" aria-label="기본정보">
                      <FieldGrid fields={RECIPE_PROFILE_FIELDS} source={profileSource} variant="profile" />
                    </section>
                  ) : null}

                  {activeTab === "conditions" ? (
                    <section className="company-detail-section" aria-label="공정 조건">
                      {detail.templateView?.template ? (
                        <>
                          <p className="company-detail-section__notice company-detail-section__notice--recipe" role="note">
                            Recipe Template: <strong>{detail.templateView.templateLabel}</strong>
                          </p>
                          {detail.templateView.sections.map((section) => (
                            <TemplateSectionGrid key={section.id} section={section} />
                          ))}
                          {detail.templateView.missingRequired?.length ? (
                            <p className="company-detail-section__empty">
                              필수 Parameter 누락: {detail.templateView.missingRequired.join(", ")}
                            </p>
                          ) : null}
                        </>
                      ) : (
                        <p className="company-detail-section__empty">
                          Recipe Template가 연결되지 않았습니다. 공정(Process) Master를 확인하세요.
                        </p>
                      )}
                    </section>
                  ) : null}

                  {activeTab === "masters" ? (
                    <section className="company-detail-section" aria-label="연결 Master">
                      <h4 className="company-detail-section__subtitle">연결 설비</h4>
                      <DetailTable
                        columns={RECIPE_EQUIPMENT_COLUMNS}
                        rows={detail.equipment}
                        emptyMessage="연결된 설비가 없습니다."
                      />
                      <h4 className="company-detail-section__subtitle">적용 제품</h4>
                      <DetailTable
                        columns={RECIPE_PRODUCT_COLUMNS}
                        rows={detail.products}
                        emptyMessage="적용 제품이 없습니다."
                      />
                    </section>
                  ) : null}

                  {activeTab === "history" ? (
                    <section className="company-detail-section" aria-label="적용 이력">
                      <p className="company-detail-section__notice company-detail-section__notice--recipe" role="note">
                        LOT 적용 이력 · Recipe vs Actual 편차는 <strong>참고용</strong>입니다. 합격/불합격
                        판정은 Product Specification vs Inspection 기준입니다.
                      </p>
                      <DetailTable
                        columns={RECIPE_LOT_COLUMNS}
                        rows={detail.lots}
                        emptyMessage="적용 LOT 이력이 없습니다."
                      />
                    </section>
                  ) : null}

                  {activeTab === "memo" ? (
                    <section className="company-detail-section" aria-label="작업 메모">
                      <FieldGrid fields={RECIPE_MEMO_FIELDS} source={detail.memo} />
                    </section>
                  ) : null}

                  {activeTab === "version" ? (
                    <section className="company-detail-section" aria-label="Version · Approval">
                      <FieldGrid fields={RECIPE_APPROVAL_FIELDS} source={detail.approval} />
                      <p className="company-detail-section__empty">
                        Version 이력은 Recipe별 독립 Version(V1 · V2 · V3)으로 관리됩니다. 조건 변경 시
                        신규 Version을 생성합니다.
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
                <FlaskConical size={32} aria-hidden="true" />
                <p>좌측 목록에서 Recipe를 선택하면 상세 정보가 표시됩니다.</p>
              </div>
            )}
          </div>
        </div>

        <footer className="product-master-status" aria-live="polite">
          {selectedRow ? (
            <>
              <span className="product-master-status__title">선택 Recipe</span>
              <span className="product-master-status__name">{selectedRow.name || "—"}</span>
              <span className="product-master-status__item">
                Recipe코드 <strong>{selectedRow.code || "—"}</strong>
              </span>
              <span className="product-master-status__item">
                Version <strong>{detail.summaryCard.versionNo}</strong>
              </span>
              <span className="product-master-status__item">
                Status <strong>{detail.summaryCard.statusLabel}</strong>
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
              목록에서 Recipe를 선택하면 요약이 표시됩니다.
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
          categoryLabel={screen?.title ?? "Recipe"}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      ) : null}
    </>
  );
}
