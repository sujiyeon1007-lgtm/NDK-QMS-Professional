import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Plus } from "lucide-react";
import { PrimaryButton } from "../../foundation/components/Button";
import Input from "../../foundation/components/Input";
import StatusChip from "../../foundation/components/StatusChip";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanSearchPanel from "../../foundation/components/TitanSearchPanel";
import TitanAdvancedSearchGrid from "../../foundation/components/TitanAdvancedSearchGrid";
import { DateRangeField } from "../../foundation/components/TitanSearchAdvancedFields";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import TitanDetailPanel from "../../foundation/components/TitanDetailPanel";
import { WORK_JOURNAL_ACTION_LABELS } from "../../config/titanAssigneePolicy";
import {
  getManualJournalCategoriesForDepartment,
  resolveWorkJournalDepartmentFromPath,
} from "../../config/workJournalDepartmentPolicy";
import { createEmptyWorkJournalSearch, WORK_JOURNAL_BASIC_SEARCH_FIELDS } from "../../config/listSearchStandard";
import { buildWorkJournalListColumns } from "../../config/standardProductList";
import { useTitanListSearch } from "../../foundation/hooks/useTitanListSearch";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import { getMasterDataByCategory } from "../../utils/masterData";
import { getAuthSession } from "../../utils/titanAuthSession";
import { isTitanAdminUser } from "../../utils/titanAdminAccess";
import { resolveAssigneeWorkerOptions } from "../../utils/titanAssigneeResolver";
import { getSessionProductionRecords } from "../../utils/productionRecords";
import { getProductionWorkJournalScreenData } from "../../utils/productionWorkspaceData";
import { getQualityWorkJournalScreenData } from "../../utils/qualityWorkspaceData";
import {
  addManualJournalEntry,
  getDailyNotes,
  getWorkJournalEntries,
  saveDailyNotes,
  updateJournalEntry,
} from "../../utils/workJournalSession";
import {
  getDailyActionSummary,
  getJournalReferenceDate,
  MANUAL_JOURNAL_CATEGORIES,
} from "../../utils/workJournalData";
import WorkJournalEntryModal from "./WorkJournalEntryModal";
import SectionPageActions from "../../foundation/layout/SectionPageActions";
import "../InOut/InboundManagement.css";
import "./WorkJournal.css";

function mapJournalRow(entry) {
  return {
    id: entry.id,
    date: entry.date ?? "—",
    time: entry.time ?? "—",
    category: entry.category ?? "—",
    title: entry.title ?? "—",
    assignee: entry.assignee || "—",
    company: entry.company || "—",
    managementId: entry.managementId || "—",
    lotNo: entry.lotNo || "—",
    note: entry.note || "—",
    source: entry.source ?? "manual",
    sourceLabel: entry.source === "auto" ? "자동" : "수동",
    sourceVariant: entry.source === "auto" ? "wait" : "progress",
    entry,
  };
}

function matchesWorkJournalSearch(row, search) {
  if (!search) return true;
  const includes = (value, query) =>
    !query?.trim() ||
    String(value ?? "")
      .toLowerCase()
      .includes(String(query).trim().toLowerCase());

  if (!includes(row.company, search.company)) return false;
  if (!includes(row.category, search.category)) return false;
  if (!includes(row.title, search.title)) return false;
  if (!includes(row.managementId, search.managementId)) return false;
  if (!includes(row.lotNo, search.lotNo)) return false;
  if (!includes(row.assignee, search.assignee)) return false;
  if (search.source && row.source !== search.source) return false;
  if (search.dateFrom && row.date < search.dateFrom) return false;
  if (search.dateTo && row.date > search.dateTo) return false;
  return true;
}

function formatActionSummaryLabel(actionType) {
  return WORK_JOURNAL_ACTION_LABELS[actionType] ?? actionType;
}

export default function WorkJournal() {
  const location = useLocation();
  const journalDepartment = resolveWorkJournalDepartmentFromPath(location.pathname);
  const departmentId = journalDepartment?.id ?? "production";
  const manualCategories = useMemo(
    () => getManualJournalCategoriesForDepartment(departmentId),
    [departmentId]
  );

  const [refreshKey, setRefreshKey] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editEntry, setEditEntry] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [adminAssigneeFilter, setAdminAssigneeFilter] = useState("");
  const [summaryDate, setSummaryDate] = useState(getJournalReferenceDate());
  const [dailyNotesDraft, setDailyNotesDraft] = useState(() => getDailyNotes(departmentId));

  const isAdmin = isTitanAdminUser();
  const authSession = getAuthSession();
  const workerOptions = useMemo(() => resolveAssigneeWorkerOptions(), []);

  const { search, draft, onDraftChange, onSearch, onReset, advancedOpen, onAdvancedToggle } =
    useTitanListSearch(createEmptyWorkJournalSearch, {
      storageKey: `work-journal-${departmentId}`,
    });

  const companies = useMemo(() => getMasterDataByCategory("companies"), []);
  const productionRecords = useMemo(() => getSessionProductionRecords(), [refreshKey]);

  const journalPipeline = useMemo(() => {
    const options = {
      records: productionRecords,
      assigneeFilter: isAdmin ? adminAssigneeFilter || search.assignee : "",
      dateFrom: search.dateFrom,
      dateTo: search.dateTo,
      adminViewAll: isAdmin,
      referenceDate: search.dateFrom || getJournalReferenceDate(),
    };

    if (departmentId === "production") {
      return getProductionWorkJournalScreenData(options);
    }

    if (departmentId === "quality") {
      return getQualityWorkJournalScreenData(options);
    }

    return {
      baseRecords: getWorkJournalEntries(departmentId, options),
      counts: {
        total: 0,
        today: 0,
        manual: 0,
        auto: 0,
      },
    };
  }, [
    departmentId,
    productionRecords,
    isAdmin,
    adminAssigneeFilter,
    search.assignee,
    search.dateFrom,
    search.dateTo,
    refreshKey,
  ]);

  const journalEntries = journalPipeline.baseRecords;

  const rows = useMemo(() => {
    return journalEntries.map(mapJournalRow).filter((row) => matchesWorkJournalSearch(row, search));
  }, [journalEntries, search]);

  const {
    page,
    pageSize,
    totalCount,
    totalPages,
    pagedItems: pagedRows,
    setPage,
    setPageSize,
  } = useListPagination(rows);

  const activeRow = pagedRows.find((row) => row.id === activeId) ?? pagedRows[0] ?? null;

  const referenceDate = search.dateFrom || getJournalReferenceDate();
  const todayCount = useMemo(
    () => rows.filter((row) => row.date === referenceDate).length,
    [rows, referenceDate]
  );

  const dailySummary = useMemo(() => {
    const assigneeScope = isAdmin ? adminAssigneeFilter : authSession?.name ?? "";
    return getDailyActionSummary(journalEntries, summaryDate, assigneeScope);
  }, [journalEntries, summaryDate, isAdmin, adminAssigneeFilter, authSession?.name]);

  const columns = useMemo(
    () =>
      buildWorkJournalListColumns({
        renderSource: (row) => (
          <StatusChip variant={row.sourceVariant}>{row.sourceLabel}</StatusChip>
        ),
      }),
    []
  );

  const openCreateModal = () => {
    setModalMode("create");
    setEditEntry(null);
    setModalOpen(true);
  };

  const openEditModal = (row) => {
    if (!row?.entry) return;
    setActiveId(row.id);
    setModalMode("edit");
    setEditEntry(row.entry);
    setModalOpen(true);
  };

  const handleSave = (form) => {
    if (modalMode === "edit" && editEntry) {
      updateJournalEntry(departmentId, editEntry.id, form);
    } else {
      addManualJournalEntry(departmentId, form);
    }
    setRefreshKey((k) => k + 1);
    setModalOpen(false);
  };

  const handleSaveDailyNotes = () => {
    saveDailyNotes(departmentId, summaryDate, dailyNotesDraft);
    setRefreshKey((k) => k + 1);
  };

  const handleSummaryDateChange = (value) => {
    setSummaryDate(value);
    setDailyNotesDraft(getDailyNotes(departmentId, value));
  };

  return (
    <div className="work-journal-page">
      <SectionPageActions>
        <PrimaryButton type="button" onClick={openCreateModal}>
          <Plus size={14} aria-hidden="true" />
          업무 등록
        </PrimaryButton>
      </SectionPageActions>

      <p className="work-journal-page__notice">
        업무일지는 Workflow에 포함되지 않는 <strong>사람 중심 업무 기록</strong>입니다.
        {isAdmin
          ? " 관리자는 전체 또는 담당자별 업무를 조회할 수 있습니다."
          : " 본인 담당 업무만 기본 조회됩니다."}{" "}
        (금일 기록 {todayCount}건)
      </p>

      {isAdmin ? (
        <div className="work-journal-page__admin-filter">
          <label className="work-journal-page__admin-filter-field">
            <span>담당자 필터</span>
            <select
              value={adminAssigneeFilter}
              onChange={(event) => setAdminAssigneeFilter(event.target.value)}
            >
              <option value="">전체</option>
              {workerOptions.map((worker) => (
                <option key={worker.id} value={worker.name}>
                  {worker.name}
                  {worker.department ? ` · ${worker.department}` : ""}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

      <div className="work-journal-page__summary">
        <div className="work-journal-page__summary-head">
          <label className="work-journal-page__summary-date">
            <span>일일 요약</span>
            <input
              type="date"
              value={summaryDate}
              onChange={(event) => handleSummaryDateChange(event.target.value)}
            />
          </label>
          <span className="work-journal-page__summary-total">총 {dailySummary.total}건</span>
        </div>
        <ul className="work-journal-page__summary-list">
          {dailySummary.byCategory.length ? (
            dailySummary.byCategory.map(({ category, count }) => (
              <li key={category}>
                {category} {count}건
              </li>
            ))
          ) : (
            <li>해당 일자 업무 기록 없음</li>
          )}
        </ul>
        {dailySummary.byAction.length ? (
          <ul className="work-journal-page__summary-actions">
            {dailySummary.byAction.map(({ actionType, count }) => (
              <li key={actionType}>
                {formatActionSummaryLabel(actionType)} {count}건
              </li>
            ))}
          </ul>
        ) : null}
        <div className="work-journal-page__daily-notes">
          <label>
            <span>금일 업무 요약</span>
            <textarea
              rows={2}
              value={dailyNotesDraft.summary}
              onChange={(event) =>
                setDailyNotesDraft((prev) => ({ ...prev, summary: event.target.value }))
              }
            />
          </label>
          <label>
            <span>개선·학습 메모</span>
            <textarea
              rows={2}
              value={dailyNotesDraft.learnings}
              onChange={(event) =>
                setDailyNotesDraft((prev) => ({ ...prev, learnings: event.target.value }))
              }
            />
          </label>
          <PrimaryButton type="button" onClick={handleSaveDailyNotes}>
            일일 메모 저장
          </PrimaryButton>
        </div>
      </div>

      <TitanSearchPanel
        draft={draft}
        onDraftChange={onDraftChange}
        onSearch={onSearch}
        onReset={onReset}
        advancedOpen={advancedOpen}
        onAdvancedToggle={onAdvancedToggle}
        companies={companies}
        records={rows}
        basicFields={WORK_JOURNAL_BASIC_SEARCH_FIELDS}
        advancedContent={
          <TitanAdvancedSearchGrid>
            <label className="titan-advanced-search__field">
              <span className="titan-advanced-search__label">담당자</span>
              <Input
                className="titan-advanced-search__text-input"
                value={draft.assignee ?? ""}
                onChange={(e) => onDraftChange({ ...draft, assignee: e.target.value })}
                placeholder="담당자"
              />
            </label>
            <label className="titan-advanced-search__field">
              <span className="titan-advanced-search__label">업무구분</span>
              <select
                className="titan-search-panel__select"
                value={draft.category ?? ""}
                onChange={(e) => onDraftChange({ ...draft, category: e.target.value })}
              >
                <option value="">전체</option>
                {MANUAL_JOURNAL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </label>
            <label className="titan-advanced-search__field">
              <span className="titan-advanced-search__label">업무내용</span>
              <Input
                className="titan-advanced-search__text-input"
                value={draft.title ?? ""}
                onChange={(e) => onDraftChange({ ...draft, title: e.target.value })}
                placeholder="업무내용"
              />
            </label>
            <DateRangeField
              label="일자"
              fromKey="dateFrom"
              toKey="dateTo"
              draft={draft}
              onDraftChange={onDraftChange}
            />
            <label className="titan-advanced-search__field">
              <span className="titan-advanced-search__label">구분</span>
              <select
                className="titan-search-panel__select"
                value={draft.source ?? ""}
                onChange={(e) => onDraftChange({ ...draft, source: e.target.value })}
              >
                <option value="">전체</option>
                <option value="auto">자동</option>
                <option value="manual">수동</option>
              </select>
            </label>
          </TitanAdvancedSearchGrid>
        }
      />

      <div className="work-journal-page__workspace">
        <div className="work-journal-page__list">
          <TitanDataTable
            className="work-journal-page__table"
            columns={columns}
            rows={pagedRows}
            activeRowId={activeRow?.id}
            onRowClick={(row) => setActiveId(row.id)}
            onRowDoubleClick={openEditModal}
            emptyMessage="업무일지 기록이 없습니다. 업무 등록 또는 Workflow 진행 후 자동 기록을 확인하세요."
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

        {activeRow ? (
          <TitanDetailPanel
            actionLabel="업무 수정"
            onAction={() => openEditModal(activeRow)}
            detailContent={
              <dl className="work-journal-detail">
                <div>
                  <dt>일자 / 시간</dt>
                  <dd>
                    {activeRow.date} {activeRow.time}
                  </dd>
                </div>
                <div>
                  <dt>담당자</dt>
                  <dd>{activeRow.assignee}</dd>
                </div>
                <div>
                  <dt>업무구분</dt>
                  <dd>{activeRow.category}</dd>
                </div>
                <div>
                  <dt>업무내용</dt>
                  <dd>{activeRow.title}</dd>
                </div>
                <div>
                  <dt>업체</dt>
                  <dd>{activeRow.company}</dd>
                </div>
                <div>
                  <dt>관리번호</dt>
                  <dd>{activeRow.managementId}</dd>
                </div>
                <div>
                  <dt>LOT.NO</dt>
                  <dd>{activeRow.lotNo}</dd>
                </div>
                <div>
                  <dt>구분</dt>
                  <dd>
                    <StatusChip variant={activeRow.sourceVariant}>{activeRow.sourceLabel}</StatusChip>
                  </dd>
                </div>
                <div>
                  <dt>비고</dt>
                  <dd>{activeRow.note}</dd>
                </div>
              </dl>
            }
          />
        ) : null}
      </div>

      {modalOpen ? (
        <WorkJournalEntryModal
          key={`${modalMode}-${editEntry?.id ?? "new"}`}
          mode={modalMode}
          initialEntry={editEntry}
          manualCategories={manualCategories}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      ) : null}
    </div>
  );
}
