import { useEffect, useMemo, useState } from "react";
import { ClipboardCheck, FlaskConical, Layers, Pencil, Plus, Trash2 } from "lucide-react";

import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import {
  AWR_DETAIL_TABS,
  AWR_LIST_COLUMNS,
  AWR_REFERENCE_FIELDS,
  AWR_SELECTION_KEY,
  AWR_STATUS_LABELS,
  AWR_WORK_FIELDS,
} from "../../config/actualWorkRecordModel";
import { resolveRecipeTemplate } from "../../config/recipeTemplateEngine";
import {
  addActualWorkRecord,
  awrStatusLabel,
  buildActualConditionView,
  buildActualWorkRecordSummary,
  buildKnowledgeInputFromActualWorkRecord,
  getActualWorkRecords,
  softDeleteActualWorkRecord,
  updateActualWorkRecord,
} from "../../utils/actualWorkRecordStore";
import ActualWorkRecordModal from "./ActualWorkRecordModal";
import MasterDataDeleteDialog from "../Settings/MasterDataDeleteDialog";

import "../InOut/InboundManagement.css";
import "../Settings/CompanyManagement.css";
import "../Settings/RecipeManagement.css";
import "./ActualWorkRecord.css";

const CATEGORY_ICON = {
  total: Layers,
  "in-progress": ClipboardCheck,
  completed: ClipboardCheck,
  lots: FlaskConical,
};

function renderCell(row, key) {
  const value = row?.[key];
  if (value == null || String(value).trim() === "") return "—";
  return String(value);
}

function statusBadgeClass(status) {
  return `awr-status-badge is-${String(status ?? "in-progress").toLowerCase().replace(/\s+/g, "-")}`;
}

/** Sprint 9 Phase 3 · 실제 작업 조건 (Actual Work Record) — 표준 Recipe 읽기 전용 + 실제 입력 */
export default function ActualWorkRecordPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedId, setSelectedId] = useState(() => sessionStorage.getItem(AWR_SELECTION_KEY) ?? "");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [activeTab, setActiveTab] = useState("conditions");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const allRows = useMemo(() => getActualWorkRecords(), [refreshKey]);
  const summaryKpis = useMemo(() => buildActualWorkRecordSummary(), [refreshKey]);

  const displayRows = useMemo(
    () =>
      allRows.map((row) => ({
        ...row,
        statusLabel: awrStatusLabel(row.status),
      })),
    [allRows]
  );

  const filteredRows = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) return displayRows;
    return displayRows.filter((row) =>
      [row.lotNo, row.recipeName, row.recipeCode, row.processName, row.equipmentName, row.workerName]
        .map((v) => String(v ?? "").toLowerCase())
        .some((v) => v.includes(keyword))
    );
  }, [displayRows, searchKeyword]);

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
    () => allRows.find((row) => row.id === selectedId) ?? null,
    [allRows, selectedId]
  );

  const conditionView = useMemo(() => buildActualConditionView(selectedRow), [selectedRow]);
  const knowledgeInput = useMemo(
    () => buildKnowledgeInputFromActualWorkRecord(selectedRow),
    [selectedRow]
  );

  useEffect(() => {
    setPage(1);
  }, [searchKeyword, setPage]);

  useEffect(() => {
    if (!selectedId) return;
    if (!allRows.some((row) => row.id === selectedId)) {
      setSelectedId("");
      sessionStorage.removeItem(AWR_SELECTION_KEY);
    }
  }, [allRows, selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    sessionStorage.setItem(AWR_SELECTION_KEY, selectedId);
  }, [selectedId]);

  const listColumns = useMemo(
    () =>
      AWR_LIST_COLUMNS.map((col) => ({
        key: col.key,
        label: col.label,
        widthPercent: col.widthPercent,
        render:
          col.render === "status"
            ? (row) => <span className={statusBadgeClass(row.status)}>{row.statusLabel ?? "—"}</span>
            : (row) => renderCell(row, col.key),
      })),
    []
  );

  const openModal = (mode) => {
    setModalMode(mode);
    setModalOpen(true);
  };

  const handleSave = (form) => {
    const result =
      modalMode === "edit" && selectedRow
        ? updateActualWorkRecord(selectedRow.id, form)
        : addActualWorkRecord(form);
    if (!result.ok) return;
    setRefreshKey((key) => key + 1);
    setModalOpen(false);
    if (result.row?.id) setSelectedId(result.row.id);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const result = softDeleteActualWorkRecord(deleteTarget.id);
    if (!result.ok) return;
    if (selectedId === deleteTarget.id) {
      setSelectedId("");
      sessionStorage.removeItem(AWR_SELECTION_KEY);
    }
    setDeleteTarget(null);
    setRefreshKey((key) => key + 1);
  };

  const templateLabel = selectedRow
    ? resolveRecipeTemplate({
        templateId: selectedRow.templateId,
        processName: selectedRow.processName,
      })?.label ?? "—"
    : "—";

  const referenceSource = selectedRow
    ? {
        ...selectedRow,
        templateLabel,
      }
    : null;

  const workSource = selectedRow
    ? {
        ...selectedRow,
        mesManagementNo: selectedRow.mesManagementNo || "—",
        equipmentName: selectedRow.equipmentName || "—",
        workerName: selectedRow.workerName || "—",
        chargeStartAt: selectedRow.chargeStartAt || "—",
        chargeEndAt: selectedRow.chargeEndAt || "—",
        workMemo: selectedRow.workMemo || "—",
      }
    : null;

  return (
    <>
      <div className="company-management-page">
        <div className="company-management-page__head">
          <div>
            <h2>실제 작업 조건 (Actual Work Record)</h2>
            <p className="company-management-page__intro">
              표준 Recipe는 <strong>읽기 전용</strong>이며, 작업자는 <strong>실제 사용한 조건만</strong>{" "}
              입력합니다. 입력 항목은 선택한 Recipe의 공정 Template에서 자동 생성됩니다. (Sprint 9 Phase 3)
            </p>
          </div>
        </div>

        <section className="company-master-kpis" aria-label="실제 작업 현황 요약">
          {summaryKpis.map((kpi) => {
            const Icon = CATEGORY_ICON[kpi.id] ?? Layers;
            return (
              <div key={kpi.id} className="company-master-kpi">
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
            placeholder="LOT · 표준 Recipe · 공정 · 설비 · 작업자 검색"
            aria-label="실제 작업 조건 검색"
          />
        </div>

        <div className="domain-master-workspace">
          <div className="domain-master-workspace__list">
            <div className="domain-master-workspace__list-head">
              <h3>작업 기록 목록</h3>
              <PrimaryButton type="button" onClick={() => openModal("add")}>
                <Plus size={14} aria-hidden="true" />
                등록
              </PrimaryButton>
            </div>
            <TitanDataTable
              className="inbound-page__table company-management-page__table--compact"
              columns={listColumns}
              rows={pagedRows}
              activeRowId={selectedId}
              onRowClick={(row) => setSelectedId(row.id)}
              emptyMessage="등록된 실제 작업 기록이 없습니다."
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
                    <h3>{selectedRow.lotNo || "—"}</h3>
                    <span className="domain-master-detail__spec">
                      {selectedRow.recipeName || "—"} · {selectedRow.recipeVersionNo || "V1"}
                    </span>
                  </div>
                  <div className="domain-master-detail__header-actions">
                    <span className={statusBadgeClass(selectedRow.status)}>
                      {AWR_STATUS_LABELS[selectedRow.status] ?? "—"}
                    </span>
                    <SecondaryButton type="button" onClick={() => openModal("edit")}>
                      <Pencil size={14} aria-hidden="true" />
                      수정
                    </SecondaryButton>
                    <SecondaryButton type="button" onClick={() => setDeleteTarget(selectedRow)}>
                      <Trash2 size={14} aria-hidden="true" />
                      삭제
                    </SecondaryButton>
                  </div>
                </header>

                <section className="domain-master-detail__summary-card" aria-label="작업 요약">
                  <div className="domain-master-summary__main">
                    <span className="domain-master-summary__name">{selectedRow.lotNo}</span>
                    <span className="domain-master-summary__spec">
                      {selectedRow.recipeCode || "—"} · {templateLabel}
                    </span>
                  </div>
                  <div className="domain-master-summary__metrics">
                    <div>
                      <span className="domain-master-summary__label">공정</span>
                      <strong>{selectedRow.processName || "—"}</strong>
                    </div>
                    <div>
                      <span className="domain-master-summary__label">설비</span>
                      <strong>{selectedRow.equipmentName || "—"}</strong>
                    </div>
                    <div>
                      <span className="domain-master-summary__label">작업자</span>
                      <strong>{selectedRow.workerName || "—"}</strong>
                    </div>
                  </div>
                </section>

                <nav className="company-detail-tabs" aria-label="작업 기록 상세">
                  {AWR_DETAIL_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      className={`company-detail-tabs__btn${activeTab === tab.id ? " is-active" : ""}`}
                      onClick={() => setActiveTab(tab.id)}
                      aria-selected={activeTab === tab.id}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>

                <div className="domain-master-detail__body">
                  {activeTab === "conditions" ? (
                    <section className="company-detail-section" aria-label="실제 작업 조건">
                      <p className="company-detail-section__notice company-detail-section__notice--recipe" role="note">
                        표준값은 <strong>읽기 전용</strong> 참조입니다. 편차는 기술 분석용이며 합격/불합격
                        판정 기준이 아닙니다.
                      </p>
                      {conditionView.sections.length ? (
                        conditionView.sections.map((section) => (
                          <div key={section.id} className="awr-condition-group">
                            <h4 className="company-detail-section__subtitle">{section.label}</h4>
                            <table className="awr-condition-table">
                              <thead>
                                <tr>
                                  <th>항목</th>
                                  <th>표준 (Recipe)</th>
                                  <th>실제 (작업)</th>
                                  <th>편차</th>
                                </tr>
                              </thead>
                              <tbody>
                                {section.fields.map((field) => (
                                  <tr key={field.key}>
                                    <td>
                                      {field.label}
                                      {field.required ? " *" : ""}
                                    </td>
                                    <td className="awr-condition-table__std">{field.standard}</td>
                                    <td className="awr-condition-table__act">{field.actual}</td>
                                    <td
                                      className={`awr-condition-table__dev${
                                        field.deviation !== "정상" && field.deviation !== "—"
                                          ? " is-diff"
                                          : ""
                                      }`}
                                    >
                                      {field.deviation}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ))
                      ) : (
                        <p className="company-detail-section__empty">표시할 작업 조건이 없습니다.</p>
                      )}
                    </section>
                  ) : null}

                  {activeTab === "reference" ? (
                    <section className="company-detail-section" aria-label="표준 Recipe 참조">
                      <p className="company-detail-section__notice company-detail-section__notice--recipe" role="note">
                        표준 Recipe Version Snapshot입니다. Recipe Master에서만 수정되며 이 화면에서는{" "}
                        <strong>변경할 수 없습니다.</strong>
                      </p>
                      <dl className="company-detail-section__grid company-detail-section__grid--profile">
                        {AWR_REFERENCE_FIELDS.map((field) => {
                          const value = referenceSource?.[field.key];
                          const display = value == null || String(value).trim() === "" ? "—" : String(value);
                          return (
                            <div key={field.key}>
                              <dt>{field.label}</dt>
                              <dd>{display}</dd>
                            </div>
                          );
                        })}
                      </dl>
                    </section>
                  ) : null}

                  {activeTab === "work" ? (
                    <section className="company-detail-section" aria-label="작업 정보">
                      <dl className="company-detail-section__grid company-detail-section__grid--trade">
                        {AWR_WORK_FIELDS.map((field) => {
                          const value = workSource?.[field.key];
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
                    </section>
                  ) : null}

                  {activeTab === "knowledge" ? (
                    <section className="company-detail-section" aria-label="Knowledge 연계">
                      <p className="company-detail-section__notice company-detail-section__notice--recipe" role="note">
                        본 작업 기록은 향후 <strong>Knowledge Record</strong>의 입력 데이터가 됩니다. (구조
                        설계만 · Engine 미구현)
                      </p>
                      <pre className="awr-knowledge-preview">
                        {JSON.stringify(knowledgeInput, null, 2)}
                      </pre>
                    </section>
                  ) : null}
                </div>
              </>
            ) : (
              <div className="domain-master-detail__empty">
                <ClipboardCheck size={32} aria-hidden="true" />
                <p>좌측 목록에서 작업 기록을 선택하면 상세 정보가 표시됩니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ActualWorkRecordModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        mode={modalMode}
        initialRow={modalMode === "edit" ? selectedRow : null}
      />

      {deleteTarget ? (
        <MasterDataDeleteDialog
          row={{ ...deleteTarget, name: deleteTarget.lotNo }}
          categoryLabel="실제 작업 조건"
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      ) : null}
    </>
  );
}
