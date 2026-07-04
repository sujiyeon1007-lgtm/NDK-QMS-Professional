import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Save } from "lucide-react";

import { PrimaryButton } from "../../foundation/components/Button";
import Input from "../../foundation/components/Input";
import StatusChip from "../../foundation/components/StatusChip";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanSearchPanel from "../../foundation/components/TitanSearchPanel";
import TitanAdvancedSearchGrid from "../../foundation/components/TitanAdvancedSearchGrid";
import {
  DateRangeField,
  ManagerField,
  NoteField,
} from "../../foundation/components/TitanSearchAdvancedFields";
import { STANDARD_PRODUCT_BASIC_SEARCH_FIELDS } from "../../config/listSearchStandard";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import TitanDetailPanel from "../../foundation/components/TitanDetailPanel";
import { useTitanListSearch } from "../../foundation/hooks/useTitanListSearch";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import {
  ACCOUNTING_CLERK_PHILOSOPHY,
  TAX_INVOICE_STATUS,
  TAX_INVOICE_STATUS_LABELS,
  TAX_INVOICE_STATUS_VARIANTS,
  createEmptyTaxInvoiceSearch,
  formatTaxInvoiceAmount,
} from "../../config/accountingClerkPolicy";
import { getMasterDataByCategory } from "../../utils/masterData";
import {
  getTaxInvoiceStatusRows,
  mapTaxInvoiceListRow,
  updateTaxInvoiceStatus,
} from "../../utils/accountingClerkTaxInvoiceSession";
import SectionPageActions from "../../foundation/layout/SectionPageActions";
import "../InOut/InboundManagement.css";
import "./AccountingClerk.css";

const ISSUE_STATUS_OPTIONS = [
  { value: "", label: "전체" },
  { value: TAX_INVOICE_STATUS.ISSUED, label: TAX_INVOICE_STATUS_LABELS.issued },
  { value: TAX_INVOICE_STATUS.UNISSUED, label: TAX_INVOICE_STATUS_LABELS.unissued },
];

function matchesTaxInvoiceSearch(row, search) {
  if (!search) return true;
  const includes = (value, query) =>
    !query?.trim() ||
    String(value ?? "")
      .toLowerCase()
      .includes(String(query).trim().toLowerCase());

  if (!includes(row.company, search.company)) return false;
  if (!includes(row.partName, search.partName)) return false;
  if (!includes(row.partNo, search.partNo)) return false;
  if (!includes(row.material, search.material)) return false;
  if (!includes(row.managementId, search.managementId)) return false;
  if (search.issueStatus && row.issueStatus !== search.issueStatus) return false;
  if (search.manager && !includes(row.manager, search.manager)) return false;
  if (search.shippedAtFrom && row.shippedAt < search.shippedAtFrom) return false;
  if (search.shippedAtTo && row.shippedAt > search.shippedAtTo) return false;
  return true;
}

function buildTaxInvoiceColumns({ renderIssueStatus }) {
  return [
    { key: "company", label: "거래처", widthPercent: 13 },
    { key: "managementId", label: "관리번호", widthPercent: 12 },
    { key: "shippedAt", label: "출고일", widthPercent: 9 },
    {
      key: "supplyAmountLabel",
      label: "공급가액",
      widthPercent: 10,
      render: (row) => formatTaxInvoiceAmount(row.supplyAmount),
    },
    {
      key: "vatLabel",
      label: "부가세",
      widthPercent: 9,
      render: (row) => formatTaxInvoiceAmount(row.vat),
    },
    {
      key: "issueStatus",
      label: "세금계산서 발행 여부",
      widthPercent: 12,
      render: renderIssueStatus,
    },
    { key: "issuedAt", label: "발행일", widthPercent: 9 },
    { key: "manager", label: "담당자", widthPercent: 9 },
    { key: "note", label: "비고", widthPercent: 12 },
  ];
}

export default function TaxInvoiceStatusPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeId, setActiveId] = useState(null);
  const [editDraft, setEditDraft] = useState(null);

  const { search, draft, onDraftChange, onSearch, onReset, advancedOpen, onAdvancedToggle } =
    useTitanListSearch(createEmptyTaxInvoiceSearch, { storageKey: "accounting-clerk-tax-invoice" });

  const companies = useMemo(() => getMasterDataByCategory("companies"), []);

  const rows = useMemo(() => {
    return getTaxInvoiceStatusRows()
      .map(mapTaxInvoiceListRow)
      .filter((row) => matchesTaxInvoiceSearch(row, search));
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

  const activeRow = useMemo(
    () => rows.find((row) => row.id === activeId) ?? pagedRows.find((row) => row.id === activeId) ?? null,
    [activeId, rows, pagedRows]
  );

  const columns = useMemo(
    () =>
      buildTaxInvoiceColumns({
        renderIssueStatus: (row) => (
          <StatusChip variant={TAX_INVOICE_STATUS_VARIANTS[row.issueStatus] ?? "wait"}>
            {row.issueStatusLabel}
          </StatusChip>
        ),
      }),
    []
  );

  const syncEditDraft = (row) => {
    if (!row?.raw) {
      setEditDraft(null);
      return;
    }
    setEditDraft({
      issueStatus: row.raw.issueStatus ?? TAX_INVOICE_STATUS.UNISSUED,
      issuedAt: row.raw.issuedAt ?? "",
      manager: row.raw.manager ?? "",
      note: row.raw.note ?? "",
    });
  };

  const handleRowClick = (row) => {
    setActiveId(row.id);
    syncEditDraft(row);
  };

  const handleSave = () => {
    if (!activeRow?.raw || !editDraft) return;
    updateTaxInvoiceStatus(activeRow.id, editDraft);
    setRefreshKey((k) => k + 1);
  };

  const searchRecords = useMemo(
    () =>
      rows.map((row) => ({
        ...row,
        status: row.issueStatusLabel,
      })),
    [rows]
  );

  return (
    <div className="accounting-clerk-page">
      <SectionPageActions>
        <Link to="/accounting-clerk" className="accounting-clerk-page__back">
          ← 경리관리
        </Link>
      </SectionPageActions>

      <p className="accounting-clerk-page__notice accounting-clerk-page__notice--info">
        {ACCOUNTING_CLERK_PHILOSOPHY.taxInvoiceNotice}
      </p>

      <TitanSearchPanel
        draft={draft}
        onDraftChange={onDraftChange}
        onSearch={onSearch}
        onReset={onReset}
        advancedOpen={advancedOpen}
        onAdvancedToggle={onAdvancedToggle}
        companies={companies}
        records={searchRecords}
        basicFields={STANDARD_PRODUCT_BASIC_SEARCH_FIELDS}
        advancedContent={
          <TitanAdvancedSearchGrid>
            <label className="titan-advanced-search__field">
              <span className="titan-advanced-search__label">발행 여부</span>
              <select
                className="titan-search-panel__select"
                value={draft.issueStatus ?? ""}
                onChange={(e) => onDraftChange({ ...draft, issueStatus: e.target.value })}
              >
                {ISSUE_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value || "all"} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <ManagerField draft={draft} onDraftChange={onDraftChange} />
            <DateRangeField
              draft={draft}
              onDraftChange={onDraftChange}
              fromKey="shippedAtFrom"
              toKey="shippedAtTo"
              label="출고일"
            />
            <NoteField draft={draft} onDraftChange={onDraftChange} />
          </TitanAdvancedSearchGrid>
        }
      />

      <div className="inbound-page__workspace">
        <div className="inbound-page__list">
          <TitanDataTable
            columns={columns}
            rows={pagedRows}
            activeRowId={activeRow?.id}
            onRowClick={handleRowClick}
            emptyMessage="조회된 세금계산서 발행 현황이 없습니다."
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
            showProcessFlow={false}
            detailContent={
              <div className="accounting-clerk-detail">
                <dl className="inbound-detail">
                  <div>
                    <dt>거래처</dt>
                    <dd>{activeRow.company}</dd>
                  </div>
                  <div>
                    <dt>관리번호</dt>
                    <dd>{activeRow.managementId}</dd>
                  </div>
                  <div>
                    <dt>출고일</dt>
                    <dd>{activeRow.shippedAt}</dd>
                  </div>
                  <div>
                    <dt>공급가액</dt>
                    <dd>{formatTaxInvoiceAmount(activeRow.supplyAmount)}</dd>
                  </div>
                  <div>
                    <dt>부가세</dt>
                    <dd>{formatTaxInvoiceAmount(activeRow.vat)}</dd>
                  </div>
                </dl>

                {editDraft ? (
                  <div className="accounting-clerk-detail__edit">
                    <label className="accounting-clerk-detail__field">
                      <span>발행 여부</span>
                      <select
                        value={editDraft.issueStatus}
                        onChange={(e) =>
                          setEditDraft({ ...editDraft, issueStatus: e.target.value })
                        }
                      >
                        <option value={TAX_INVOICE_STATUS.ISSUED}>
                          {TAX_INVOICE_STATUS_LABELS.issued}
                        </option>
                        <option value={TAX_INVOICE_STATUS.UNISSUED}>
                          {TAX_INVOICE_STATUS_LABELS.unissued}
                        </option>
                      </select>
                    </label>
                    <label className="accounting-clerk-detail__field">
                      <span>발행일</span>
                      <Input
                        type="date"
                        value={editDraft.issuedAt}
                        onChange={(e) =>
                          setEditDraft({ ...editDraft, issuedAt: e.target.value })
                        }
                      />
                    </label>
                    <label className="accounting-clerk-detail__field">
                      <span>담당자</span>
                      <Input
                        value={editDraft.manager}
                        onChange={(e) =>
                          setEditDraft({ ...editDraft, manager: e.target.value })
                        }
                        placeholder="담당자"
                      />
                    </label>
                    <label className="accounting-clerk-detail__field">
                      <span>비고</span>
                      <Input
                        value={editDraft.note}
                        onChange={(e) => setEditDraft({ ...editDraft, note: e.target.value })}
                        placeholder="비고"
                      />
                    </label>
                    <PrimaryButton type="button" onClick={handleSave}>
                      <Save size={14} aria-hidden="true" />
                      저장
                    </PrimaryButton>
                  </div>
                ) : null}
              </div>
            }
          />
        ) : null}
      </div>
    </div>
  );
}
