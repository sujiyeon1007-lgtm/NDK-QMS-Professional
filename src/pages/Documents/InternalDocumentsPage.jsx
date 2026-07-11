import { useMemo, useState } from "react";
import { FolderOpen } from "lucide-react";

import TitanDataTable from "../../foundation/components/DataTable";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import { INTERNAL_DOCUMENT_CATEGORIES } from "../../config/qualityDocumentManagement";
import DocumentWorkspaceShell from "./DocumentWorkspaceShell";

export default function InternalDocumentsPage() {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const rows = useMemo(() => [], []);

  const filteredRows = useMemo(() => {
    if (categoryFilter === "all") return rows;
    return rows.filter((row) => row.category === categoryFilter);
  }, [rows, categoryFilter]);

  const pagination = useListPagination(filteredRows);

  const columns = useMemo(
    () => [
      { key: "categoryLabel", label: "분류", widthPercent: 14 },
      { key: "title", label: "문서명", widthPercent: 28 },
      { key: "author", label: "작성자", widthPercent: 12 },
      { key: "createdDate", label: "작성일", widthPercent: 12 },
      { key: "statusLabel", label: "상태", widthPercent: 10 },
      { key: "attachments", label: "첨부", widthPercent: 8, render: () => "—" },
    ],
    []
  );

  const searchPanel = (
    <section className="incoming-document-search document-workspace-shell__search" aria-label="사내문서 검색">
      <label>
        <span>문서분류</span>
        <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
          <option value="all">전체</option>
          {INTERNAL_DOCUMENT_CATEGORIES.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>문서명</span>
        <input disabled placeholder="RC1 · 검색 확장 예정" />
      </label>
      <label>
        <span>작성자</span>
        <input disabled placeholder="RC1 · 검색 확장 예정" />
      </label>
    </section>
  );

  return (
    <DocumentWorkspaceShell
      title="사내문서"
      description="공지사항 · 업무지침 · 회의자료 · 교육자료 등 사내 문서를 관리합니다."
      icon={FolderOpen}
      searchPanel={searchPanel}
      empty={filteredRows.length === 0}
      emptyMessage="등록된 사내문서가 없습니다. RC1 이후 등록 기능이 확장됩니다."
    >
      <TitanDataTable
        className="qms-document-page__table"
        columns={columns}
        rows={pagination.pagedItems}
        emptyMessage="등록된 사내문서가 없습니다."
      />
      <TitanTableFooter
        totalCount={pagination.totalCount}
        page={pagination.page}
        totalPages={pagination.totalPages}
        pageSize={pagination.pageSize}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
      />
    </DocumentWorkspaceShell>
  );
}
