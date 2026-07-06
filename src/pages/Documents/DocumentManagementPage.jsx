import { useCallback, useMemo, useState } from "react";
import { FolderOpen } from "lucide-react";

import TitanDataTable from "../../foundation/components/DataTable";
import TitanSearchPanel from "../../foundation/components/TitanSearchPanel";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import { SecondaryButton } from "../../foundation/components/Button";
import { useTitanListSearch } from "../../foundation/hooks/useTitanListSearch";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import { createEmptyDocumentManagementSearch } from "../../config/listSearchStandard";
import { buildDocumentCompanyListColumns } from "../../config/standardProductList";
import { getMasterDataByCategory } from "../../utils/masterData";
import {
  buildCompanyDocumentListRows,
  matchesCompanyDocumentListSearch,
} from "../../utils/companyDocumentManagement";
import DocumentCompanyPopup from "./DocumentCompanyPopup";

import "../Quality/QualityManagement.css";
import "./DocumentManagementPage.css";

export default function DocumentManagementPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeId, setActiveId] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const { search, draft, onDraftChange, onSearch, onReset, advancedOpen, onAdvancedToggle } =
    useTitanListSearch(createEmptyDocumentManagementSearch, { storageKey: "documents" });

  const companies = useMemo(() => getMasterDataByCategory("companies"), [refreshKey]);

  const listRows = useMemo(() => buildCompanyDocumentListRows(), [refreshKey]);

  const filteredRows = useMemo(
    () => listRows.filter((row) => matchesCompanyDocumentListSearch(row, search)),
    [listRows, search]
  );

  const searchRecords = useMemo(
    () =>
      listRows.map((row) => ({
        company: row.company,
        manager: row.manager,
      })),
    [listRows]
  );

  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalCount,
    pagedItems: pagedRows,
  } = useListPagination(filteredRows);

  const activeRow = useMemo(
    () => filteredRows.find((row) => row.id === activeId) ?? null,
    [activeId, filteredRows]
  );

  const openCompanyPopup = useCallback((row) => {
    if (!row) return;
    setActiveId(row.id);
    setPopupOpen(true);
  }, []);

  const columns = useMemo(
    () =>
      buildDocumentCompanyListColumns({
        renderActions: (row) => (
          <SecondaryButton
            type="button"
            className="titan-btn--table-action"
            onClick={(event) => {
              event.stopPropagation();
              openCompanyPopup(row);
            }}
          >
            <FolderOpen size={12} aria-hidden="true" />
            열기
          </SecondaryButton>
        ),
      }),
    [openCompanyPopup]
  );

  return (
    <div className="qms-document-page">
      <TitanSearchPanel
        draft={draft}
        onDraftChange={onDraftChange}
        onSearch={onSearch}
        onReset={onReset}
        advancedOpen={advancedOpen}
        onAdvancedToggle={onAdvancedToggle}
        companies={companies}
        records={searchRecords}
        basicFields={[
          { key: "company", label: "업체명", placeholder: "업체명" },
          { key: "manager", label: "담당자", placeholder: "담당자" },
        ]}
        advancedContent={null}
      />

      <p className="qms-document-page__workflow-note">
        업체를 선택하면 문서 종류(가로 탭) · 문서 리스트 · 상세 Popup에서 Revision · 첨부파일을
        관리합니다.
      </p>

      <div className="qms-document-page__list quality-page__list">
        <TitanDataTable
          className="qms-document-page__table"
          columns={columns}
          rows={pagedRows}
          activeRowId={activeRow?.id}
          onRowClick={(row) => setActiveId(row.id)}
          onRowDoubleClick={openCompanyPopup}
          emptyMessage="등록된 업체가 없습니다."
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

      <DocumentCompanyPopup
        open={popupOpen}
        companyRow={activeRow}
        onClose={() => setPopupOpen(false)}
        onRefresh={() => setRefreshKey((key) => key + 1)}
      />
    </div>
  );
}
