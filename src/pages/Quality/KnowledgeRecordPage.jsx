import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookMarked, ClipboardCheck, FlaskConical, Layers, Pencil, Plus, Trash2 } from "lucide-react";

import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import {
  KR_DETAIL_TABS,
  KR_LIST_COLUMNS,
  KR_RESULT_LABELS,
  KR_SELECTION_KEY,
  KR_SUMMARY_FIELDS,
} from "../../config/knowledgeRecordModel";
import {
  addKnowledgeRecord,
  buildInspectionResultView,
  buildKnowledgeConditionView,
  buildKnowledgeRecordSummary,
  getKnowledgeRecords,
  knowledgeResultLabel,
  resolveKnowledgeTemplateLabel,
  softDeleteKnowledgeRecord,
  updateKnowledgeRecord,
} from "../../utils/knowledgeRecordStore";
import KnowledgeRecordModal from "./KnowledgeRecordModal";
import MasterDataDeleteDialog from "../Settings/MasterDataDeleteDialog";

import "../InOut/InboundManagement.css";
import "../Settings/CompanyManagement.css";
import "../Settings/RecipeManagement.css";
import "../Production/ActualWorkRecord.css";
import "./KnowledgeRecord.css";

const CATEGORY_ICON = {
  total: BookMarked,
  pass: ClipboardCheck,
  fail: ClipboardCheck,
  lots: FlaskConical,
};

function renderCell(row, key) {
  const value = row?.[key];
  if (value == null || String(value).trim() === "") return "—";
  return String(value);
}

function resultBadgeClass(result) {
  return `kr-result-badge is-${String(result ?? "PASS").toLowerCase()}`;
}

/** Sprint 9 Phase 4 · Knowledge Record — Actual Work + Inspection 결과 기술 데이터 (Store만 · Engine ❌) */
export default function KnowledgeRecordPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedId, setSelectedId] = useState(() => sessionStorage.getItem(KR_SELECTION_KEY) ?? "");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [activeTab, setActiveTab] = useState("summary");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const allRows = useMemo(() => getKnowledgeRecords(), [refreshKey]);
  const summaryKpis = useMemo(() => buildKnowledgeRecordSummary(), [refreshKey]);

  const displayRows = useMemo(
    () =>
      allRows.map((row) => ({
        ...row,
        resultLabel: knowledgeResultLabel(row.result),
      })),
    [allRows]
  );

  const filteredRows = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) return displayRows;
    return displayRows.filter((row) =>
      [row.lotNo, row.partName, row.partNo, row.recipeName, row.processName, row.inspectorName, row.company]
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

  const conditionView = useMemo(() => buildKnowledgeConditionView(selectedRow), [selectedRow]);
  const inspectionView = useMemo(() => buildInspectionResultView(selectedRow), [selectedRow]);
  const templateLabel = useMemo(() => resolveKnowledgeTemplateLabel(selectedRow), [selectedRow]);

  useEffect(() => {
    setPage(1);
  }, [searchKeyword, setPage]);

  useEffect(() => {
    if (!selectedId) return;
    if (!allRows.some((row) => row.id === selectedId)) {
      setSelectedId("");
      sessionStorage.removeItem(KR_SELECTION_KEY);
    }
  }, [allRows, selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    sessionStorage.setItem(KR_SELECTION_KEY, selectedId);
  }, [selectedId]);

  const listColumns = useMemo(
    () =>
      KR_LIST_COLUMNS.map((col) => ({
        key: col.key,
        label: col.label,
        widthPercent: col.widthPercent,
        render:
          col.render === "result"
            ? (row) => <span className={resultBadgeClass(row.result)}>{row.resultLabel ?? "—"}</span>
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
        ? updateKnowledgeRecord(selectedRow.id, form)
        : addKnowledgeRecord(form);
    if (!result.ok) return;
    setRefreshKey((key) => key + 1);
    setModalOpen(false);
    if (result.row?.id) setSelectedId(result.row.id);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const result = softDeleteKnowledgeRecord(deleteTarget.id);
    if (!result.ok) return;
    if (selectedId === deleteTarget.id) {
      setSelectedId("");
      sessionStorage.removeItem(KR_SELECTION_KEY);
    }
    setDeleteTarget(null);
    setRefreshKey((key) => key + 1);
  };

  const summarySource = selectedRow
    ? {
        ...selectedRow,
        templateLabel,
      }
    : null;

  return (
    <>
      <div className="company-management-page">
        <div className="company-management-page__head">
          <div>
            <h2>Knowledge Record (기술 데이터)</h2>
            <p className="company-management-page__intro">
              실제 작업 조건(Actual Work Record)과 검사 결과(Inspection)를 <strong>하나의 기술 데이터</strong>로
              LOT에 귀속합니다. 표준 Recipe · 실제 조건은 <strong>Snapshot으로 재사용</strong>됩니다.
              (Sprint 9 Phase 4 · 저장·조회만 · Engine 미구현)
            </p>
          </div>
        </div>

        <section className="company-master-kpis" aria-label="기술 데이터 현황 요약">
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
            placeholder="LOT · 품명 · 품번 · 표준 Recipe · 공정 · 검사자 검색"
            aria-label="기술 데이터 검색"
          />
        </div>

        <div className="domain-master-workspace">
          <div className="domain-master-workspace__list">
            <div className="domain-master-workspace__list-head">
              <h3>기술 데이터 목록</h3>
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
              emptyMessage="등록된 기술 데이터가 없습니다."
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
                      {selectedRow.partName || "—"} · {selectedRow.recipeName || "—"}
                    </span>
                  </div>
                  <div className="domain-master-detail__header-actions">
                    <span className={resultBadgeClass(selectedRow.result)}>
                      {KR_RESULT_LABELS[selectedRow.result] ?? "—"}
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

                <section className="domain-master-detail__summary-card" aria-label="기술 데이터 요약">
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
                      <span className="domain-master-summary__label">검사자</span>
                      <strong>{selectedRow.inspectorName || "—"}</strong>
                    </div>
                  </div>
                </section>

                <nav className="company-detail-tabs" aria-label="기술 데이터 상세">
                  {KR_DETAIL_TABS.map((tab) => (
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
                  {activeTab === "summary" ? (
                    <section className="company-detail-section" aria-label="기술 요약">
                      <p className="company-detail-section__notice company-detail-section__notice--recipe" role="note">
                        Production(실제 작업) + Inspection(검사) 결과를 하나의 기술 데이터로 저장합니다.
                        분석·추천은 향후 Knowledge Engine 영역입니다.
                      </p>
                      <dl className="company-detail-section__grid company-detail-section__grid--profile">
                        {KR_SUMMARY_FIELDS.map((field) => {
                          const value = summarySource?.[field.key];
                          const display = value == null || String(value).trim() === "" ? "—" : String(value);
                          return (
                            <div key={field.key}>
                              <dt>{field.label}</dt>
                              <dd>{display}</dd>
                            </div>
                          );
                        })}
                      </dl>
                      {selectedRow.knowledgeMemo ? (
                        <p className="company-detail-section__memo">{selectedRow.knowledgeMemo}</p>
                      ) : null}
                      {selectedRow.lotNo ? (
                        <p className="company-detail-section__memo">
                          <Link to={`/quality/lot-lifecycle?lot=${encodeURIComponent(selectedRow.lotNo)}`}>
                            LOT Lifecycle (Technology Summary) →
                          </Link>
                        </p>
                      ) : null}
                    </section>
                  ) : null}

                  {activeTab === "conditions" ? (
                    <section className="company-detail-section" aria-label="실제 작업 조건">
                      <p className="company-detail-section__notice company-detail-section__notice--recipe" role="note">
                        표준 Recipe(Snapshot)와 실제 작업 조건(Snapshot) 비교입니다. 기록 시점 그대로
                        고정됩니다.
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

                  {activeTab === "inspection" ? (
                    <section className="company-detail-section" aria-label="검사 결과">
                      <p className="company-detail-section__notice company-detail-section__notice--recipe" role="note">
                        검사 결과(경도 · 유효경화깊이 · 경화깊이 · 외관)와 판정입니다.
                      </p>
                      <table className="awr-condition-table">
                        <thead>
                          <tr>
                            <th>검사 항목</th>
                            <th>측정값</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inspectionView.map((field) => (
                            <tr key={field.key}>
                              <td>{field.label}</td>
                              <td className="awr-condition-table__act">{field.value}</td>
                            </tr>
                          ))}
                          <tr>
                            <td>판정</td>
                            <td>
                              <span className={resultBadgeClass(selectedRow.result)}>
                                {KR_RESULT_LABELS[selectedRow.result] ?? "—"}
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </section>
                  ) : null}

                  {activeTab === "snapshot" ? (
                    <section className="company-detail-section" aria-label="Snapshot">
                      <p className="company-detail-section__notice company-detail-section__notice--recipe" role="note">
                        Recipe Snapshot · Actual Snapshot · Inspection 결과를 그대로 저장한 원본 데이터입니다.
                      </p>
                      <pre className="awr-knowledge-preview">
                        {JSON.stringify(
                          {
                            lotNo: selectedRow.lotNo,
                            recipeVersionNo: selectedRow.recipeVersionNo,
                            templateId: selectedRow.templateId,
                            recipeParameterSnapshot: selectedRow.recipeParameterSnapshot,
                            actualParameters: selectedRow.actualParameters,
                            inspectionResult: selectedRow.inspectionResult,
                            result: selectedRow.result,
                            actualWorkRecordId: selectedRow.actualWorkRecordId,
                          },
                          null,
                          2
                        )}
                      </pre>
                    </section>
                  ) : null}
                </div>
              </>
            ) : (
              <div className="domain-master-detail__empty">
                <BookMarked size={32} aria-hidden="true" />
                <p>좌측 목록에서 기술 데이터를 선택하면 상세 정보가 표시됩니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <KnowledgeRecordModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        mode={modalMode}
        initialRow={modalMode === "edit" ? selectedRow : null}
      />

      {deleteTarget ? (
        <MasterDataDeleteDialog
          row={{ ...deleteTarget, name: deleteTarget.lotNo }}
          categoryLabel="Knowledge Record"
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      ) : null}
    </>
  );
}
