import { useEffect, useMemo, useState } from "react";
import { Plus, Save, Trash2, Megaphone } from "lucide-react";

import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import Input from "../../foundation/components/Input";
import StatusChip from "../../foundation/components/StatusChip";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import TitanDetailPanel from "../../foundation/components/TitanDetailPanel";
import {
  TitanAdvancedSearchField,
  useSearchSuggestionHelpers,
} from "../../foundation/components/TitanSearchPanel";
import TitanAdvancedSearch from "../../foundation/components/TitanAdvancedSearch";
import { createEmptyQualityNoticeSearch } from "../../config/listSearchStandard";
import { QUALITY_NOTICE_STATUS } from "../../config/qualityDocumentManagement";
import { useTitanListSearch } from "../../foundation/hooks/useTitanListSearch";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import SectionPageActions from "../../foundation/layout/SectionPageActions";
import {
  buildQualityNoticeFromForm,
  createEmptyQualityNoticeForm,
  deleteQualityNotice,
  getQualityNotices,
  upsertQualityNotice,
} from "../../utils/qualityNoticeSession";
import {
  buildQualityNoticeSearchRecords,
  matchesQualityNoticeSearch,
} from "../../utils/qualityNoticeSearch";

import "./DocumentManagement.css";

const STATUS_CHIP_VARIANT = {
  active: "progress",
  closed: "hold",
};

function QualityNoticeSearchPanel({
  draft,
  onDraftChange,
  onSearch,
  onReset,
  advancedOpen,
  onAdvancedToggle,
  getSuggestions,
}) {
  const update = (key, value) => onDraftChange({ ...draft, [key]: value });

  return (
    <div className="titan-search-panel titan-card document-mgmt-search">
      <div className="titan-search-panel__basic">
        <div className="titan-search-panel__fields document-mgmt-search__fields">
          <TitanAdvancedSearchField
            label="제목"
            fieldKey="title"
            value={draft.title ?? ""}
            onChange={(value) => update("title", value)}
            suggestions={getSuggestions("title")}
            placeholder="제목"
            className="titan-search-panel__field"
          />
          <TitanAdvancedSearchField
            label="작성자"
            fieldKey="author"
            value={draft.author ?? ""}
            onChange={(value) => update("author", value)}
            suggestions={getSuggestions("author")}
            placeholder="작성자"
            className="titan-search-panel__field"
          />
          <TitanAdvancedSearchField
            label="상태"
            fieldKey="status"
            value={draft.status ?? ""}
            onChange={(value) => update("status", value)}
            suggestions={getSuggestions("status")}
            placeholder="공지중 / 종료"
            allowEmpty
            emptyLabel="전체"
            className="titan-search-panel__field"
          />
          <label className="titan-search-panel__field">
            <span className="titan-advanced-search__label">작성일(부터)</span>
            <Input
              type="date"
              value={draft.createdDateFrom ?? ""}
              onChange={(event) => update("createdDateFrom", event.target.value)}
            />
          </label>
        </div>
        <div className="titan-search-panel__actions">
          <PrimaryButton type="button" onClick={onSearch}>
            조회
          </PrimaryButton>
          <SecondaryButton type="button" onClick={onReset}>
            초기화
          </SecondaryButton>
          <SecondaryButton type="button" onClick={onAdvancedToggle}>
            {advancedOpen ? "▲ 상세검색 닫기" : "▼ 상세검색"}
          </SecondaryButton>
        </div>
      </div>
      <TitanAdvancedSearch open={advancedOpen}>
        <div className="titan-advanced-search__grid">
          <label className="titan-advanced-search__field">
            <span className="titan-advanced-search__label">작성일(까지)</span>
            <Input
              type="date"
              value={draft.createdDateTo ?? ""}
              onChange={(event) => update("createdDateTo", event.target.value)}
            />
          </label>
          <label className="titan-advanced-search__field">
            <span className="titan-advanced-search__label">적용일(부터)</span>
            <Input
              type="date"
              value={draft.effectiveDateFrom ?? ""}
              onChange={(event) => update("effectiveDateFrom", event.target.value)}
            />
          </label>
          <label className="titan-advanced-search__field">
            <span className="titan-advanced-search__label">적용일(까지)</span>
            <Input
              type="date"
              value={draft.effectiveDateTo ?? ""}
              onChange={(event) => update("effectiveDateTo", event.target.value)}
            />
          </label>
        </div>
      </TitanAdvancedSearch>
    </div>
  );
}

function DetailField({ label, value }) {
  return (
    <div className="document-mgmt-detail__row">
      <span className="document-mgmt-detail__label">{label}</span>
      <span className="document-mgmt-detail__value">{value || "—"}</span>
    </div>
  );
}

export default function DocumentManagementSection({ refreshKey, onRefresh }) {
  const [localRefresh, setLocalRefresh] = useState(0);
  const [form, setForm] = useState(() => createEmptyQualityNoticeForm());
  const [formMode, setFormMode] = useState("create");
  const [message, setMessage] = useState("");
  const [activeId, setActiveId] = useState(null);

  const { search, draft, onDraftChange, onSearch, onReset, advancedOpen, onAdvancedToggle } =
    useTitanListSearch(createEmptyQualityNoticeSearch, {
      storageKey: "quality-notice-documents",
    });

  const records = useMemo(() => getQualityNotices(), [refreshKey, localRefresh]);
  const searchRecords = useMemo(() => buildQualityNoticeSearchRecords(records), [records]);
  const { getSuggestions } = useSearchSuggestionHelpers(searchRecords, {
    status: QUALITY_NOTICE_STATUS.map((item) => item.label),
  });

  const rows = useMemo(
    () =>
      searchRecords
        .filter((row) => matchesQualityNoticeSearch(row, search))
        .sort((a, b) => String(b.effectiveDate).localeCompare(String(a.effectiveDate))),
    [searchRecords, search]
  );

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

  useEffect(() => {
    if (activeRow && activeId !== activeRow.id) {
      setActiveId(activeRow.id);
    }
  }, [activeRow, activeId]);

  const columns = useMemo(
    () => [
      {
        key: "title",
        label: "제목",
        widthPercent: 28,
        render: (row) => row.title,
      },
      {
        key: "documentTypeLabel",
        label: "문서종류",
        widthPercent: 12,
        render: (row) => row.documentTypeLabel,
      },
      {
        key: "author",
        label: "작성자",
        widthPercent: 10,
        render: (row) => row.author,
      },
      {
        key: "createdDate",
        label: "작성일",
        widthPercent: 10,
        render: (row) => row.createdDate,
      },
      {
        key: "effectiveDate",
        label: "적용일",
        widthPercent: 10,
        render: (row) => row.effectiveDate,
      },
      {
        key: "status",
        label: "상태",
        widthPercent: 10,
        render: (row) => (
          <StatusChip variant={STATUS_CHIP_VARIANT[row.status] ?? "wait"}>{row.statusLabel}</StatusChip>
        ),
      },
    ],
    []
  );

  const bumpRefresh = () => {
    setLocalRefresh((key) => key + 1);
    onRefresh?.();
  };

  const handleSelectRow = (row) => {
    setActiveId(row.id);
    const notice = records.find((item) => item.id === row.id);
    if (notice) {
      setForm(createEmptyQualityNoticeForm(notice));
      setFormMode("edit");
    }
  };

  const handleCreateNew = () => {
    setActiveId(null);
    setForm(createEmptyQualityNoticeForm());
    setFormMode("create");
    setMessage("");
  };

  const handleSave = () => {
    const payload = buildQualityNoticeFromForm(form);
    const result = upsertQualityNotice(payload);
    if (!result.ok) {
      setMessage(result.message ?? "저장에 실패했습니다.");
      return;
    }
    setMessage(formMode === "create" ? "품질 공지가 등록되었습니다." : "품질 공지가 수정되었습니다.");
    setActiveId(result.notice.id);
    setForm(createEmptyQualityNoticeForm(result.notice));
    setFormMode("edit");
    bumpRefresh();
  };

  const handleDelete = (targetId) => {
    const id = targetId || form.id || activeRow?.id;
    if (!id) return;
    if (!window.confirm("선택한 품질 공지를 삭제하시겠습니까?")) return;
    deleteQualityNotice(id);
    setMessage("품질 공지가 삭제되었습니다.");
    handleCreateNew();
    bumpRefresh();
  };

  const updateForm = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const detailContent = activeRow ? (
    <div className="document-mgmt-detail">
      <DetailField label="제목" value={activeRow.title} />
      <DetailField label="문서종류" value={activeRow.documentTypeLabel} />
      <DetailField label="작성자" value={activeRow.author} />
      <DetailField label="작성일" value={activeRow.createdDate} />
      <DetailField label="적용일" value={activeRow.effectiveDate} />
      <DetailField label="상태" value={activeRow.statusLabel} />
      <DetailField label="내용" value={activeRow.body} />
      {activeRow.relatedPartNo ? <DetailField label="관련 품번" value={activeRow.relatedPartNo} /> : null}
      {activeRow.relatedMaterial ? <DetailField label="관련 재질" value={activeRow.relatedMaterial} /> : null}
      {activeRow.attachments?.length ? (
        <DetailField label="첨부파일" value={activeRow.attachments.map((item) => item.name).join(", ")} />
      ) : null}
    </div>
  ) : (
    <p className="environment-empty-note">품질 공지를 선택하거나 새 공지를 등록해 주세요.</p>
  );

  return (
    <div className="document-mgmt-section">
      <SectionPageActions>
        <PrimaryButton type="button" onClick={handleCreateNew}>
          <Plus size={14} aria-hidden="true" />
          품질 공지 등록
        </PrimaryButton>
      </SectionPageActions>

      <header className="document-mgmt-section__head">
        <div className="document-mgmt-section__title-wrap">
          <Megaphone size={18} aria-hidden="true" />
          <div>
            <h2 className="document-mgmt-section__title">문서관리 · 품질 공지</h2>
            <p className="document-mgmt-section__desc">
              Document Management 하위 기능 · V1.0 등록/조회 · 일반 게시판 미운영
            </p>
          </div>
        </div>
      </header>

      <QualityNoticeSearchPanel
        draft={draft}
        onDraftChange={onDraftChange}
        onSearch={onSearch}
        onReset={onReset}
        advancedOpen={advancedOpen}
        onAdvancedToggle={onAdvancedToggle}
        getSuggestions={getSuggestions}
      />

      <div className="document-mgmt-layout">
        <div className="document-mgmt-layout__main">
          <TitanDataTable
            columns={columns}
            rows={pagedRows}
            rowKey="id"
            activeRowId={activeRow?.id}
            onRowClick={handleSelectRow}
            emptyMessage="등록된 품질 공지가 없습니다."
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

        <TitanDetailPanel
          detailContent={detailContent}
          actionLabel="선택 공지 수정"
          onAction={() => activeRow && handleSelectRow(activeRow)}
          secondaryActionLabel="선택 공지 삭제"
          secondaryActionIcon={Trash2}
          onSecondaryAction={() => activeRow && handleDelete(activeRow.id)}
          showProcessFlow={false}
        />
      </div>

      <section className="document-mgmt-form titan-card" aria-label="품질 공지 등록 및 수정">
        <header className="document-mgmt-form__head">
          <h3>{formMode === "create" ? "품질 공지 등록" : "품질 공지 수정"}</h3>
          <span className="document-mgmt-form__type">문서종류: 품질 공지 (Quality Notice)</span>
        </header>

        <div className="document-mgmt-form__grid">
          <label>
            <span>제목</span>
            <Input value={form.title} onChange={(e) => updateForm("title", e.target.value)} placeholder="제목" />
          </label>
          <label>
            <span>작성자</span>
            <Input value={form.author} onChange={(e) => updateForm("author", e.target.value)} placeholder="작성자" />
          </label>
          <label>
            <span>작성일</span>
            <Input type="date" value={form.createdDate} onChange={(e) => updateForm("createdDate", e.target.value)} />
          </label>
          <label>
            <span>적용일</span>
            <Input
              type="date"
              value={form.effectiveDate}
              onChange={(e) => updateForm("effectiveDate", e.target.value)}
            />
          </label>
          <label>
            <span>상태</span>
            <select value={form.status} onChange={(e) => updateForm("status", e.target.value)}>
              {QUALITY_NOTICE_STATUS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>관련 품번 (선택)</span>
            <Input
              value={form.relatedPartNo}
              onChange={(e) => updateForm("relatedPartNo", e.target.value)}
              placeholder="품번"
            />
          </label>
          <label>
            <span>관련 재질 (선택)</span>
            <Input
              value={form.relatedMaterial}
              onChange={(e) => updateForm("relatedMaterial", e.target.value)}
              placeholder="재질"
            />
          </label>
          <label className="document-mgmt-form__field--wide">
            <span>첨부파일 (파일명, 쉼표 구분)</span>
            <Input
              value={form.attachmentNames}
              onChange={(e) => updateForm("attachmentNames", e.target.value)}
              placeholder="예: 공지.pdf, 안내.docx"
            />
          </label>
          <label className="document-mgmt-form__field--wide">
            <span>관련 문서 (선택, 쉼표 구분)</span>
            <Input
              value={form.relatedDocuments}
              onChange={(e) => updateForm("relatedDocuments", e.target.value)}
              placeholder="관련 문서 ID 또는 제목"
            />
          </label>
          <label className="document-mgmt-form__field--full">
            <span>내용</span>
            <textarea
              className="document-mgmt-form__textarea"
              value={form.body}
              onChange={(e) => updateForm("body", e.target.value)}
              placeholder="품질 공지 내용"
              rows={5}
            />
          </label>
        </div>

        <div className="document-mgmt-form__actions">
          <PrimaryButton type="button" onClick={handleSave}>
            <Save size={14} aria-hidden="true" />
            {formMode === "create" ? "등록" : "수정 저장"}
          </PrimaryButton>
          {formMode === "edit" ? (
            <SecondaryButton type="button" onClick={handleDelete}>
              <Trash2 size={14} aria-hidden="true" />
              삭제
            </SecondaryButton>
          ) : null}
          <SecondaryButton type="button" onClick={handleCreateNew}>
            새 공지
          </SecondaryButton>
        </div>

        {message ? <p className="environment-action-message environment-action-message--info">{message}</p> : null}

        <p className="document-mgmt-form__future" aria-hidden="true">
          V2.0 예정: Revision/기준 변경 자동 공지 · ACK · 공지 대상 · 팝업 공지
        </p>
      </section>
    </div>
  );
}
