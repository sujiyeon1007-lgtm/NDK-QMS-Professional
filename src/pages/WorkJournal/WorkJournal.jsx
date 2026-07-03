import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { PrimaryButton } from "../../foundation/components/Button";
import Input from "../../foundation/components/Input";
import StatusChip from "../../foundation/components/StatusChip";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanSearchPanel from "../../foundation/components/TitanSearchPanel";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import TitanDetailPanel from "../../foundation/components/TitanDetailPanel";
import { createEmptyWorkJournalSearch } from "../../config/listSearchStandard";
import { buildWorkJournalListColumns } from "../../config/standardProductList";
import { useTitanListSearch } from "../../foundation/hooks/useTitanListSearch";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import { getMasterDataByCategory } from "../../utils/masterData";
import { getSessionProductionRecords } from "../../utils/productionRecords";
import {
  addManualJournalEntry,
  getMergedJournalEntries,
  updateJournalEntry,
} from "../../utils/workJournalSession";
import { getJournalReferenceDate, MANUAL_JOURNAL_CATEGORIES } from "../../utils/workJournalData";
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
  if (search.source && row.source !== search.source) return false;
  if (search.dateFrom && row.date < search.dateFrom) return false;
  if (search.dateTo && row.date > search.dateTo) return false;
  return true;
}

export default function WorkJournal() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editEntry, setEditEntry] = useState(null);
  const [activeId, setActiveId] = useState(null);

  const { search, draft, onDraftChange, onSearch, onReset, advancedOpen, onAdvancedToggle } =
    useTitanListSearch(createEmptyWorkJournalSearch, { storageKey: "work-journal" });

  const companies = useMemo(() => getMasterDataByCategory("companies"), []);
  const records = useMemo(() => getSessionProductionRecords(), [refreshKey]);

  const rows = useMemo(() => {
    return getMergedJournalEntries(records)
      .map(mapJournalRow)
      .filter((row) => matchesWorkJournalSearch(row, search));
  }, [records, search, refreshKey]);

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

  const todayCount = useMemo(
    () => rows.filter((row) => row.date === getJournalReferenceDate()).length,
    [rows]
  );

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
      updateJournalEntry(editEntry.id, form);
    } else {
      addManualJournalEntry(form);
    }
    setRefreshKey((k) => k + 1);
    setModalOpen(false);
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
        업무일지는 Workflow에 포함되지 않는 <strong>사람 중심 업무 기록</strong>입니다. Workflow
        자동 기록과 수동 등록을 함께 조회합니다. (금일 기록 {todayCount}건)
      </p>

      <TitanSearchPanel
        draft={draft}
        onDraftChange={onDraftChange}
        onSearch={onSearch}
        onReset={onReset}
        advancedOpen={advancedOpen}
        onAdvancedToggle={onAdvancedToggle}
        companies={companies}
        records={rows}
        advancedContent={
          <div className="titan-advanced-search__grid">
            <label className="titan-advanced-search__field">
              <span className="titan-advanced-search__label">업무구분</span>
              <select
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
                value={draft.title ?? ""}
                onChange={(e) => onDraftChange({ ...draft, title: e.target.value })}
                placeholder="업무내용"
              />
            </label>
            <label className="titan-advanced-search__field">
              <span className="titan-advanced-search__label">관리번호</span>
              <Input
                value={draft.managementId ?? ""}
                onChange={(e) => onDraftChange({ ...draft, managementId: e.target.value })}
                placeholder="관리번호"
              />
            </label>
            <label className="titan-advanced-search__field">
              <span className="titan-advanced-search__label">LOT.NO</span>
              <Input
                value={draft.lotNo ?? ""}
                onChange={(e) => onDraftChange({ ...draft, lotNo: e.target.value })}
                placeholder="LOT.NO"
              />
            </label>
            <label className="titan-advanced-search__field">
              <span className="titan-advanced-search__label">일자 From</span>
              <Input
                type="date"
                value={draft.dateFrom ?? ""}
                onChange={(e) => onDraftChange({ ...draft, dateFrom: e.target.value })}
              />
            </label>
            <label className="titan-advanced-search__field">
              <span className="titan-advanced-search__label">일자 To</span>
              <Input
                type="date"
                value={draft.dateTo ?? ""}
                onChange={(e) => onDraftChange({ ...draft, dateTo: e.target.value })}
              />
            </label>
            <label className="titan-advanced-search__field">
              <span className="titan-advanced-search__label">구분</span>
              <select
                value={draft.source ?? ""}
                onChange={(e) => onDraftChange({ ...draft, source: e.target.value })}
              >
                <option value="">전체</option>
                <option value="auto">자동</option>
                <option value="manual">수동</option>
              </select>
            </label>
          </div>
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
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      ) : null}
    </div>
  );
}
