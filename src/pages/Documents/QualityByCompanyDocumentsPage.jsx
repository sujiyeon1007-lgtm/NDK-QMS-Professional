import { useMemo, useState } from "react";
import { FolderOpen } from "lucide-react";

import TitanDataTable from "../../foundation/components/DataTable";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import { SecondaryButton } from "../../foundation/components/Button";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import { BY_COMPANY_DOCUMENT_TYPE_OPTIONS } from "../../config/qualityDocumentManagement";
import { getMasterDataByCategory } from "../../utils/masterData";
import { getCompanyDocumentRegistryRows } from "../../utils/companyDocumentManagement";
import DocumentWorkspaceShell from "./DocumentWorkspaceShell";

function matchesTypeFilter(row, typeFilter) {
  if (!typeFilter || typeFilter === "all") return true;
  const label = String(row.documentTypeLabel ?? row.documentType ?? "").trim();
  const option = BY_COMPANY_DOCUMENT_TYPE_OPTIONS.find((item) => item.value === typeFilter);
  if (!option) return true;
  if (option.registryTypes?.length) {
    return option.registryTypes.includes(String(row.documentType ?? "").trim());
  }
  return label.includes(option.label);
}

export default function QualityByCompanyDocumentsPage() {
  const companies = useMemo(() => getMasterDataByCategory("companies"), []);
  const [selectedCompany, setSelectedCompany] = useState(() => companies[0]?.name ?? "");
  const [typeFilter, setTypeFilter] = useState("all");

  const rows = useMemo(() => {
    const companyRows = getCompanyDocumentRegistryRows(selectedCompany);
    return companyRows.filter((row) => matchesTypeFilter(row, typeFilter));
  }, [selectedCompany, typeFilter]);

  const pagination = useListPagination(rows);

  const columns = useMemo(
    () => [
      { key: "documentTypeLabel", label: "문서유형", widthPercent: 14 },
      { key: "documentNo", label: "문서번호", widthPercent: 14 },
      { key: "title", label: "문서명", widthPercent: 20 },
      { key: "partNo", label: "품번", widthPercent: 12 },
      { key: "revision", label: "Rev", widthPercent: 8 },
      { key: "revisionDate", label: "개정일", widthPercent: 10 },
      { key: "approvalStatus", label: "상태", widthPercent: 10 },
      {
        key: "actions",
        label: "작업",
        widthPercent: 12,
        render: () => (
          <SecondaryButton type="button" className="titan-btn--table-action" disabled>
            <FolderOpen size={12} aria-hidden="true" />
            조회
          </SecondaryButton>
        ),
      },
    ],
    []
  );

  const searchPanel = (
    <section className="qms-document-page__company-bar incoming-document-search">
      <label className="qms-document-page__company-field">
        <span>업체 선택</span>
        <select
          value={selectedCompany}
          onChange={(event) => setSelectedCompany(event.target.value)}
        >
          <option value="">업체 선택</option>
          {companies.map((company) => (
            <option key={company.id} value={company.name}>
              {company.name}
            </option>
          ))}
        </select>
      </label>
      <label className="qms-document-page__company-field">
        <span>문서유형</span>
        <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
          <option value="all">전체</option>
          {BY_COMPANY_DOCUMENT_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </section>
  );

  return (
    <DocumentWorkspaceShell
      title="업체별 문서관리"
      description="업체를 선택하면 도면 · 작업표준서 · 검사기준서 등 품질 문서를 조회합니다."
      searchPanel={searchPanel}
      empty={!selectedCompany}
      emptyMessage="업체를 선택하면 문서 목록이 표시됩니다."
    >
      <TitanDataTable
        className="qms-document-page__table"
        columns={columns}
        rows={pagination.pagedItems}
        emptyMessage={selectedCompany ? "등록된 문서가 없습니다." : "업체를 선택하세요."}
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
