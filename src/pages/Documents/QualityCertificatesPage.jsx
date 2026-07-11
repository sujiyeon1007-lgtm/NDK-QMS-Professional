import { useMemo } from "react";
import { Award } from "lucide-react";

import TitanDataTable from "../../foundation/components/DataTable";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import {
  getQualityCertificateRows,
  QUALITY_CERTIFICATE_FIELDS,
} from "../../utils/qualityCertificatesSession";
import DocumentWorkspaceShell from "./DocumentWorkspaceShell";

export default function QualityCertificatesPage() {
  const rows = useMemo(() => getQualityCertificateRows(), []);
  const pagination = useListPagination(rows);

  const columns = useMemo(
    () => [
      { key: "name", label: "인증서명", widthPercent: 22 },
      { key: "issuer", label: "발급기관", widthPercent: 18 },
      { key: "issuedDate", label: "발급일", widthPercent: 12 },
      { key: "expiryDate", label: "만료일", widthPercent: 12 },
      {
        key: "attachments",
        label: "파일첨부",
        widthPercent: 10,
        render: (row) => (row.attachments?.length ? `${row.attachments.length}건` : "—"),
      },
    ],
    []
  );

  const searchPlaceholder = (
    <section className="incoming-document-search document-workspace-shell__search" aria-label="인증서 검색">
      {QUALITY_CERTIFICATE_FIELDS.filter((field) => field.key !== "attachments").map((field) => (
        <label key={field.key}>
          <span>{field.label}</span>
          <input disabled placeholder="RC1 · 검색 확장 예정" />
        </label>
      ))}
    </section>
  );

  return (
    <DocumentWorkspaceShell
      title="인증서 관리"
      description="품질·환경 인증서를 등록·조회합니다. (발급기관 · 발급일 · 만료일 · 첨부)"
      icon={Award}
      searchPanel={searchPlaceholder}
      empty={rows.length === 0}
      emptyMessage="등록된 인증서가 없습니다. RC1 이후 등록 기능이 확장됩니다."
    >
      <TitanDataTable
        className="qms-document-page__table"
        columns={columns}
        rows={pagination.pagedItems}
        emptyMessage="등록된 인증서가 없습니다."
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
