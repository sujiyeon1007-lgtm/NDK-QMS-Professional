import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { PrimaryButton } from "../../foundation/components/Button";
import TitanSearchPanel, { useSearchSuggestionHelpers } from "../../foundation/components/TitanSearchPanel";
import TitanAdvancedSearchGrid from "../../foundation/components/TitanAdvancedSearchGrid";
import { DrawingNoField } from "../../foundation/components/TitanSearchAdvancedFields";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import TitanDetailPanel from "../../foundation/components/TitanDetailPanel";
import { EMPTY_BASIC_SEARCH } from "../../config/listSearchStandard";
import { useTitanListSearch } from "../../foundation/hooks/useTitanListSearch";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import { getMasterDataByCategory } from "../../utils/masterData";
import {
  getProductRegistrations,
  upsertProductRegistration,
} from "../../utils/productRegistrationSession";
import ProductRegisterModal from "./ProductRegisterModal";
import "../InOut/InboundManagement.css";
import SectionPageActions from "../../foundation/layout/SectionPageActions";
import "./ProductManagement.css";

const REGISTER_LABEL = "제품\n등록";

function createEmptyProductSearch() {
  return { ...EMPTY_BASIC_SEARCH, drawingNo: "" };
}

function matchesSearch(row, search) {
  const includes = (value, query) =>
    !query?.trim() || String(value ?? "").toLowerCase().includes(query.trim().toLowerCase());
  return (
    includes(row.company, search.company) &&
    includes(row.partName, search.partName) &&
    includes(row.partNo, search.partNo) &&
    includes(row.material, search.material)
  );
}

export default function ProductManagement() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerInitial, setRegisterInitial] = useState(null);
  const { search, draft, onDraftChange, onSearch, onReset, advancedOpen, onAdvancedToggle } =
    useTitanListSearch(createEmptyProductSearch, { storageKey: "product" });
  const [activeId, setActiveId] = useState(null);

  const companies = useMemo(() => getMasterDataByCategory("companies"), []);
  const searchRecords = useMemo(() => getProductRegistrations(), [refreshKey]);
  const { getSuggestions } = useSearchSuggestionHelpers(searchRecords);

  const rows = useMemo(() => {
    return getProductRegistrations()
      .filter((row) => matchesSearch(row, search))
      .sort((a, b) => a.partNo.localeCompare(b.partNo));
  }, [search, refreshKey]);

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

  const columns = useMemo(
    () => [
      { key: "company", label: "업체명", widthPercent: 14 },
      { key: "partName", label: "품명", widthPercent: 18 },
      { key: "partNo", label: "품번", widthPercent: 14 },
      { key: "drawingNo", label: "도번", widthPercent: 16 },
      { key: "material", label: "재질", widthPercent: 12 },
      { key: "process", label: "열처리 공정", widthPercent: 14 },
    ],
    []
  );

  const handleRegister = (form) => {
    upsertProductRegistration(form);
    setRefreshKey((key) => key + 1);
    setPage(1);
  };

  const openRegister = (initialData = null) => {
    setRegisterInitial(initialData);
    setRegisterOpen(true);
  };

  return (
    <div className="inbound-page product-page">
      <SectionPageActions>
        <PrimaryButton type="button" onClick={() => openRegister()}>
          <Plus size={14} aria-hidden="true" />
          {REGISTER_LABEL}
        </PrimaryButton>
      </SectionPageActions>

      <TitanSearchPanel
        draft={draft}
        onDraftChange={onDraftChange}
        onSearch={onSearch}
        onReset={onReset}
        advancedOpen={advancedOpen}
        onAdvancedToggle={onAdvancedToggle}
        companies={companies}
        records={searchRecords}
        advancedContent={
          <TitanAdvancedSearchGrid>
            <DrawingNoField draft={draft} onDraftChange={onDraftChange} getSuggestions={getSuggestions} />
          </TitanAdvancedSearchGrid>
        }
      />

      <div className="inbound-page__workspace">
        <div className="inbound-page__list">
          <TitanDataTable
            className="inbound-page__table"
            columns={columns}
            rows={pagedRows}
            activeRowId={activeRow?.id}
            onRowClick={(row) => setActiveId(row.id)}
            emptyMessage="등록된 제품이 없습니다."
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
            actionLabel={REGISTER_LABEL}
            actionIcon={Plus}
            onAction={() => openRegister(activeRow)}
            detailContent={
              <dl className="inbound-detail">
                <div>
                  <dt>업체명</dt>
                  <dd>{activeRow.company || "—"}</dd>
                </div>
                <div>
                  <dt>품명</dt>
                  <dd>{activeRow.partName || "—"}</dd>
                </div>
                <div>
                  <dt>품번</dt>
                  <dd>{activeRow.partNo || "—"}</dd>
                </div>
                <div>
                  <dt>도번</dt>
                  <dd>{activeRow.drawingNo || "—"}</dd>
                </div>
                <div>
                  <dt>재질</dt>
                  <dd>{activeRow.material || "—"}</dd>
                </div>
                <div>
                  <dt>열처리 공정</dt>
                  <dd>{activeRow.process || "—"}</dd>
                </div>
                <div>
                  <dt>외관검사</dt>
                  <dd>{activeRow.specification?.appearance?.enabled ? "사용" : "미사용"}</dd>
                </div>
                <div>
                  <dt>경도검사</dt>
                  <dd>{activeRow.specification?.hardness?.enabled ? "사용" : "미사용"}</dd>
                </div>
                <div>
                  <dt>치수검사</dt>
                  <dd>{activeRow.specification?.dimension?.enabled ? "사용" : "미사용"}</dd>
                </div>
                <div>
                  <dt>조직검사</dt>
                  <dd>{activeRow.specification?.microstructure?.enabled ? "사용" : "미사용"}</dd>
                </div>
                <div>
                  <dt>비고</dt>
                  <dd>{activeRow.note || "—"}</dd>
                </div>
              </dl>
            }
          />
        ) : null}
      </div>

      <ProductRegisterModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onRegister={handleRegister}
        initialData={registerInitial}
      />
    </div>
  );
}
