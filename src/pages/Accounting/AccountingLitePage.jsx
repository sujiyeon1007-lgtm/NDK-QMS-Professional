import { useMemo, useState } from "react";
import { BarChart3, Building2, CalendarClock, ClipboardCheck, FileText, ListTree, Percent } from "lucide-react";

import TitanPrintPreviewModal from "../../components/print/TitanPrintPreviewModal";
import TransactionStatementPrintDocument from "../../components/print/TransactionStatementPrintDocument";
import { TransactionStatementIssueResultDialog } from "../../components/transactionStatement/TransactionStatementPreview";
import {
  FoundationDocumentAction,
  FOUNDATION_DOCUMENT_ACTIONS,
} from "../../foundation/components/FoundationActionBar";
import TitanDashboardCard from "../../foundation/components/TitanDashboardCard";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanEmptyState from "../../foundation/components/TitanEmptyState";
import TitanStatusBadge from "../../foundation/components/TitanStatusBadge";
import TitanStandardDetailPopup from "../../foundation/components/detailPopup/TitanStandardDetailPopup";
import { useTransactionStatementDocumentOutput } from "../../foundation/hooks/useFoundationDocumentOutput";
import {
  buildAccountingCompanyRows,
  buildAccountingClosingSummary,
  buildAccountingStatementRows,
} from "../../utils/accountingClerkLiteService";
import "./Accounting.css";

const DASH = "-";

const CHART_OF_ACCOUNTS = [
  { id: "sales", category: "매출", accountCode: "401", accountName: "제품매출", type: "수익", note: "거래명세서 공급가액 기준" },
  { id: "vat", category: "세금", accountCode: "255", accountName: "부가세예수금", type: "부채", note: "공급가액 10% 참고" },
  { id: "receivable", category: "채권", accountCode: "108", accountName: "외상매출금", type: "자산", note: "거래명세서 기준 참고 계정" },
  { id: "shipment", category: "출고", accountCode: "901", accountName: "출고참고자료", type: "관리", note: "회계 참고용 조회 계정" },
];

function formatNumber(value) {
  return (Number(value) || 0).toLocaleString("ko-KR");
}

function resolveMonth(value) {
  const text = String(value ?? "").trim();
  return text && text !== DASH ? text.slice(0, 7) : "미지정";
}

function aggregateRows(rows, getKey, buildBase) {
  const map = new Map();
  rows.forEach((row) => {
    const key = getKey(row);
    const current = map.get(key) ?? buildBase(key, row);
    current.shipmentCount += 1;
    current.documentCount += row.statement ? 1 : 0;
    current.supplyAmount += Number(row.supplyAmount) || 0;
    current.vat += Number(row.vat) || 0;
    current.totalAmount += Number(row.totalAmount) || 0;
    map.set(key, current);
  });

  return [...map.values()]
    .map((row) => ({
      ...row,
      shipmentCountLabel: `${formatNumber(row.shipmentCount)}건`,
      documentCountLabel: `${formatNumber(row.documentCount)}건`,
      supplyAmountLabel: formatNumber(row.supplyAmount),
      vatLabel: formatNumber(row.vat),
      totalAmountLabel: formatNumber(row.totalAmount),
    }))
    .sort((a, b) => String(b.id).localeCompare(String(a.id)));
}

function buildAccountingReferenceRows() {
  return buildAccountingStatementRows().map((row) => ({
    ...row,
    accountingType: row.statement ? "발행 문서" : "출고 자료",
    certificateStatus: row.record?.certificateStatus ?? row.record?.certificateIssuedStatus ?? "참고",
  }));
}

function buildAccountingMonthlyRows() {
  return aggregateRows(
    buildAccountingStatementRows(),
    (row) => resolveMonth(row.shippedAt),
    (month) => ({
      id: month,
      month,
      shipmentCount: 0,
      documentCount: 0,
      supplyAmount: 0,
      vat: 0,
      totalAmount: 0,
    })
  );
}

function buildAccountingCompanyStatusRows() {
  const companies = buildAccountingCompanyRows();
  const aggregated = aggregateRows(
    buildAccountingStatementRows(),
    (row) => row.company || DASH,
    (company, row) => ({
      id: company,
      company,
      businessNumber: row.businessNumber,
      representative: row.representative,
      manager: row.companyManager,
      shipmentCount: 0,
      documentCount: 0,
      supplyAmount: 0,
      vat: 0,
      totalAmount: 0,
      managementId: row.managementId,
      partName: row.partName,
      partNo: row.partNo,
      shippedAt: row.shippedAt,
      printedAt: row.printedAt,
      record: row.record,
      statement: row.statement,
      shipment: row.shipment,
      companyInfo: row.companyInfo,
    })
  );

  return aggregated.map((row) => {
    const companyInfo = companies.find((item) => item.company === row.company);
    return {
      ...row,
      phone: companyInfo?.phone ?? DASH,
      email: companyInfo?.email ?? DASH,
    };
  });
}

function buildAccountingVatRows() {
  return buildAccountingMonthlyRows().map((row) => ({
    ...row,
    vatRate: row.supplyAmount > 0 ? "10%" : DASH,
    reportStatus: "조회 전용",
  }));
}

function buildAccountingChartOfAccountsRows() {
  return CHART_OF_ACCOUNTS;
}

function buildAccountingIssueHistoryRows() {
  return buildAccountingStatementRows()
    .filter((row) => row.statement)
    .map((row) => ({
      ...row,
      issueType: row.statusKey === "reprint" ? "재출력" : "최초 발행",
      issuedBy: row.printedBy,
    }));
}

function buildAccountingClosingRows() {
  const summary = buildAccountingClosingSummary();
  return summary.closingRows.map((row) => ({
    ...row,
    month: summary.month,
    countLabel: `${formatNumber(row.count)}건`,
    unpaidAmountLabel: formatNumber(summary.unpaidAmount),
    pendingDocCount: summary.pendingDocCount,
  }));
}

function buildAccountingBusinessSummary(rows) {
  const companies = new Set(rows.map((row) => row.company).filter(Boolean));
  const outputRows = rows.filter((row) => row.record);
  const issuedRows = rows.filter((row) => row.statement);
  const pendingRows = rows.filter((row) => row.record && !row.statement);
  const totalAmount = rows.reduce((sum, row) => sum + (Number(row.totalAmount) || 0), 0);

  return [
    { id: "statements", label: "거래명세서", value: `${formatNumber(issuedRows.length)}건` },
    { id: "pending", label: "미발행", value: `${formatNumber(pendingRows.length)}건` },
    { id: "amount", label: "이번 달 매출", value: `${formatNumber(totalAmount)}원` },
    { id: "companies", label: "거래처", value: `${formatNumber(companies.size)}곳` },
  ];
}

const FEATURE_META = {
  journalLookup: {
    title: "회계자료 조회",
    description: "거래명세서 · 출고자료 · 발행 문서를 회계 참고자료로 조회합니다.",
    icon: FileText,
    rows: buildAccountingReferenceRows,
    searchKeys: ["managementId", "company", "partName", "partNo", "documentId", "accountingType"],
    columns: [
      { key: "accountingType", label: "자료구분" },
      { key: "documentId", label: "문서번호" },
      { key: "managementId", label: "관리번호" },
      { key: "company", label: "거래처" },
      { key: "partName", label: "품명" },
      { key: "supplyAmountLabel", label: "공급가액" },
      { key: "vatLabel", label: "부가세" },
      { key: "totalAmountLabel", label: "합계" },
      { key: "statusLabel", label: "상태" },
    ],
  },
  monthlyStatus: {
    title: "월별 매출",
    description: "월별 출고금액과 문서 발행 건수를 조회합니다.",
    icon: BarChart3,
    rows: buildAccountingMonthlyRows,
    searchKeys: ["month"],
    columns: [
      { key: "month", label: "월" },
      { key: "shipmentCountLabel", label: "출고" },
      { key: "documentCountLabel", label: "문서 발행" },
      { key: "supplyAmountLabel", label: "공급가액" },
      { key: "vatLabel", label: "부가세" },
      { key: "totalAmountLabel", label: "합계" },
    ],
  },
  companyStatus: {
    title: "거래처별 매출",
    description: "거래처별 출고 · 공급가액 · 부가세 현황을 조회합니다.",
    icon: Building2,
    rows: buildAccountingCompanyStatusRows,
    searchKeys: ["company", "businessNumber", "representative", "manager"],
    columns: [
      { key: "company", label: "거래처" },
      { key: "businessNumber", label: "사업자번호" },
      { key: "representative", label: "대표자" },
      { key: "shipmentCountLabel", label: "출고" },
      { key: "documentCountLabel", label: "문서" },
      { key: "supplyAmountLabel", label: "공급가액" },
      { key: "vatLabel", label: "부가세" },
      { key: "totalAmountLabel", label: "합계" },
    ],
  },
  taxData: {
    title: "세금자료",
    description: "거래명세서 기준 공급가액 · 부가세 · 합계를 조회합니다.",
    icon: Percent,
    rows: buildAccountingVatRows,
    searchKeys: ["month", "reportStatus"],
    columns: [
      { key: "month", label: "월" },
      { key: "supplyAmountLabel", label: "공급가액" },
      { key: "vatRate", label: "세율" },
      { key: "vatLabel", label: "부가세" },
      { key: "totalAmountLabel", label: "합계" },
      { key: "reportStatus", label: "상태" },
    ],
  },
  vatStatus: {
    title: "부가세 현황",
    description: "거래명세서 기준 공급가액 · 부가세 · 합계를 조회합니다. 신고 기능은 제공하지 않습니다.",
    icon: Percent,
    rows: buildAccountingVatRows,
    searchKeys: ["month", "reportStatus"],
    columns: [
      { key: "month", label: "월" },
      { key: "supplyAmountLabel", label: "공급가액" },
      { key: "vatRate", label: "세율" },
      { key: "vatLabel", label: "부가세" },
      { key: "totalAmountLabel", label: "합계" },
      { key: "reportStatus", label: "상태" },
    ],
  },
  issueHistory: {
    title: "발행 이력",
    description: "거래명세서 발행 및 재출력 이력을 조회합니다.",
    icon: CalendarClock,
    rows: buildAccountingIssueHistoryRows,
    searchKeys: ["documentId", "managementId", "lotNo", "company", "partName", "partNo", "issueType", "issuedBy", "outputStatus"],
    columns: [
      { key: "documentId", label: "문서번호" },
      { key: "issueType", label: "발행구분" },
      { key: "managementId", label: "관리번호" },
      { key: "lotNo", label: "LOT" },
      { key: "company", label: "거래처" },
      { key: "partName", label: "품명" },
      { key: "printedAt", label: "발행일" },
      { key: "issuedBy", label: "발행자" },
      { key: "pdfStatusLabel", label: "PDF 여부" },
      { key: "outputStatus", label: "출력상태" },
      { key: "totalAmountLabel", label: "합계" },
    ],
  },
  closingStatus: {
    title: "마감 현황",
    description: "월 마감 · 거래처별 마감 · 미처리 상태를 조회합니다.",
    icon: ClipboardCheck,
    rows: buildAccountingClosingRows,
    searchKeys: ["month", "label", "status"],
    columns: [
      { key: "month", label: "마감월" },
      { key: "label", label: "구분" },
      { key: "countLabel", label: "건수" },
      { key: "status", label: "상태" },
      { key: "unpaidAmountLabel", label: "미결제 금액" },
      { key: "pendingDocCount", label: "미처리 증빙" },
    ],
  },
  chartOfAccounts: {
    title: "계정과목 조회",
    description: "V1.0 Lite에서 사용하는 기본 계정과목을 조회합니다. 편집 기능은 제공하지 않습니다.",
    icon: ListTree,
    rows: buildAccountingChartOfAccountsRows,
    searchKeys: ["category", "accountCode", "accountName", "type", "note"],
    columns: [
      { key: "category", label: "분류" },
      { key: "accountCode", label: "코드" },
      { key: "accountName", label: "계정과목" },
      { key: "type", label: "유형" },
      { key: "note", label: "비고" },
    ],
  },
};

function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}

function createAccountingSearch() {
  return {
    keyword: "",
    dateFrom: "",
    dateTo: "",
    company: "",
    managementId: "",
    documentId: "",
    status: "",
  };
}

function matchesAccountingSearch(row, search, keys) {
  const keyword = normalize(search.keyword);
  const matchesKeyword = !keyword || keys.some((key) => normalize(row[key]).includes(keyword));
  if (!matchesKeyword) return false;
  if (search.company && !normalize(row.company).includes(normalize(search.company))) return false;
  if (search.managementId && !normalize(row.managementId).includes(normalize(search.managementId))) return false;
  if (search.documentId && !normalize(row.documentId).includes(normalize(search.documentId))) return false;
  if (search.status && !normalize(row.statusLabel ?? row.reportStatus ?? row.status).includes(normalize(search.status))) {
    return false;
  }
  const date = String(row.printedAt && row.printedAt !== DASH ? row.printedAt : row.shippedAt ?? row.month ?? "").slice(0, 10);
  if (search.dateFrom && date && date < search.dateFrom) return false;
  if (search.dateTo && date && date > search.dateTo) return false;
  return true;
}

function renderStatus(value) {
  const label = String(value ?? "");
  const color = label.includes("완료") || label.includes("발행") ? "green" : label.includes("미") ? "orange" : "gray";
  return <TitanStatusBadge color={color} text={label || "조회"} />;
}

export function AccountingDashboardLite() {
  const recentRows = useMemo(() => buildAccountingReferenceRows().slice(0, 8), []);
  const summaryItems = useMemo(() => buildAccountingBusinessSummary(recentRows), [recentRows]);

  return (
    <div className="accounting-lite-page">
      <section className="accounting-lite-summary" aria-label="회계관리 요약">
        {summaryItems.map((item) => (
          <article key={item.id} className="accounting-lite-summary__item">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </article>
        ))}
      </section>

      <TitanDashboardCard title="최근 회계 참고자료">
        {recentRows.length ? (
          <TitanDataTable
            layout="compact"
            columns={FEATURE_META.journalLookup.columns.slice(0, 7)}
            rows={recentRows}
            ariaLabel="최근 회계 참고자료"
          />
        ) : (
          <TitanEmptyState title="회계 참고자료가 없습니다." description="출고 및 거래명세서 데이터가 생성되면 자동으로 표시됩니다." />
        )}
      </TitanDashboardCard>
    </div>
  );
}

export default function AccountingLitePage({ featureId }) {
  const meta = FEATURE_META[featureId] ?? FEATURE_META.journalLookup;
  const [search, setSearch] = useState(() => createAccountingSearch());
  const [selectedId, setSelectedId] = useState("");
  const [detailRow, setDetailRow] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const transactionStatementOutput = useTransactionStatementDocumentOutput({
    onAfterOutput: () => setRefreshKey((key) => key + 1),
  });
  const rows = useMemo(() => {
    void refreshKey;
    return meta.rows();
  }, [meta, refreshKey]);
  const filteredRows = useMemo(
    () => rows.filter((row) => matchesAccountingSearch(row, search, meta.searchKeys)),
    [meta, search, rows]
  );
  const selectedRow = filteredRows.find((row) => row.id === selectedId) ?? filteredRows[0] ?? null;
  const summaryItems = useMemo(() => buildAccountingBusinessSummary(filteredRows), [filteredRows]);
  const openTransactionStatementOutput = (row) => {
    if (!row?.record) return;
    transactionStatementOutput.openPreview(row);
  };

  const columns = meta.columns.map((column) =>
      column.key === "statusLabel" || column.key === "reportStatus"
        ? { ...column, render: (row) => renderStatus(row[column.key]) }
        : column
  );

  const detailSummary = detailRow
    ? {
        company: detailRow.company ?? detailRow.label ?? meta.title,
        partName: detailRow.partName ?? detailRow.accountName ?? detailRow.label ?? "회계자료",
        partNo: detailRow.partNo ?? detailRow.documentId ?? detailRow.month ?? detailRow.accountCode ?? DASH,
        lotNo: detailRow.lotNo ?? DASH,
        currentProcess: "회계조회",
        statusLabel: detailRow.statusLabel ?? detailRow.reportStatus ?? detailRow.status ?? "조회",
        statusVariant: "default",
      }
    : null;

  const renderDetailContent = () => (
    <dl className="accounting-lite-popup-detail">
      {Object.entries(detailRow ?? {})
        .filter(([key, value]) => !["record", "statement", "shipment", "companyInfo"].includes(key) && typeof value !== "object")
        .slice(0, 16)
        .map(([key, value]) => (
          <div key={key}>
            <dt>{key}</dt>
            <dd>{String(value ?? DASH)}</dd>
          </div>
        ))}
    </dl>
  );

  return (
    <div className="accounting-lite-page">
      <section className="accounting-lite-search-card" aria-label="회계관리 조회 기준">
        <div className="accounting-lite-search accounting-lite-search--business">
          <label>
            기간
            <div className="accounting-lite-date-pair">
              <input
                type="date"
                value={search.dateFrom}
                onChange={(event) => setSearch((prev) => ({ ...prev, dateFrom: event.target.value }))}
              />
              <span aria-hidden="true">~</span>
              <input
                type="date"
                value={search.dateTo}
                onChange={(event) => setSearch((prev) => ({ ...prev, dateTo: event.target.value }))}
              />
            </div>
          </label>
          <label>
            거래처
            <input
              type="search"
              value={search.company}
              onChange={(event) => setSearch((prev) => ({ ...prev, company: event.target.value }))}
              placeholder="거래처"
            />
          </label>
          <label>
            관리번호
            <input
              type="search"
              value={search.managementId}
              onChange={(event) => setSearch((prev) => ({ ...prev, managementId: event.target.value }))}
              placeholder="관리번호"
            />
          </label>
          <label>
            문서번호
            <input
              type="search"
              value={search.documentId}
              onChange={(event) => setSearch((prev) => ({ ...prev, documentId: event.target.value }))}
              placeholder="문서번호"
            />
          </label>
          <label>
            상태
            <input
              type="search"
              value={search.status}
              onChange={(event) => setSearch((prev) => ({ ...prev, status: event.target.value }))}
              placeholder="상태"
            />
          </label>
          <TitanStatusBadge color="blue" text={`조회 ${filteredRows.length}건`} />
          <button type="button" className="accounting-lite-reset" onClick={() => setSearch(createAccountingSearch())}>
            초기화
          </button>
        </div>
      </section>

      <section className="accounting-lite-summary" aria-label="회계 요약">
        {summaryItems.map((item) => (
          <article key={item.id} className="accounting-lite-summary__item">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </article>
        ))}
      </section>

      <section className="accounting-lite-quick-actions" aria-label="회계 Quick Actions">
        <span className="accounting-lite-quick-actions__label">
          {selectedRow ? `${selectedRow.company ?? selectedRow.month ?? selectedRow.label ?? "선택 자료"} 선택됨` : "자료를 선택하세요"}
        </span>
        <FoundationDocumentAction
          actions={[
            {
              id: FOUNDATION_DOCUMENT_ACTIONS.TRANSACTION_STATEMENT_PRINT,
              onClick: () => openTransactionStatementOutput(selectedRow),
              disabled: !selectedRow?.record,
            },
          ]}
          ariaLabel="회계 문서 작업"
        />
      </section>

      <TitanDashboardCard title={meta.title} className="accounting-lite-table-card">
        {filteredRows.length ? (
          <TitanDataTable
            layout="compact"
            columns={columns}
            rows={filteredRows}
            activeRowId={selectedRow?.id}
            onRowClick={(row) => setSelectedId(row.id)}
            onRowDoubleClick={(row) => {
              setSelectedId(row.id);
              setDetailRow(row);
            }}
            ariaLabel={meta.title}
          />
        ) : (
          <TitanEmptyState title="조회 결과가 없습니다." description="검색어를 변경하거나 초기화해 주세요." />
        )}
      </TitanDashboardCard>

      <TitanPrintPreviewModal
        open={transactionStatementOutput.isOpen}
        onClose={transactionStatementOutput.closePreview}
        title="거래명세서 출력 미리보기"
        onPrint={transactionStatementOutput.print}
        onPdf={transactionStatementOutput.pdf}
        busy={transactionStatementOutput.busy}
      >
        {transactionStatementOutput.printProps ? (
          <TransactionStatementPrintDocument {...transactionStatementOutput.printProps} />
        ) : null}
      </TitanPrintPreviewModal>

      <TransactionStatementIssueResultDialog
        open={Boolean(transactionStatementOutput.issueResult)}
        result={transactionStatementOutput.issueResult}
        onPrintComplete={() => transactionStatementOutput.confirmIssueResult("출력 완료")}
        onPdfOnly={() => transactionStatementOutput.confirmIssueResult("PDF만 저장")}
        onClose={transactionStatementOutput.closeIssueResult}
      />

      <TitanStandardDetailPopup
        open={Boolean(detailRow)}
        onClose={() => setDetailRow(null)}
        summary={detailSummary}
        tabs={[{ id: "basicInfo", label: "기본정보" }]}
        renderTabContent={renderDetailContent}
        footerActions={[
          {
            id: FOUNDATION_DOCUMENT_ACTIONS.TRANSACTION_STATEMENT_PRINT,
            onClick: () => openTransactionStatementOutput(detailRow),
            disabled: !detailRow?.record,
          },
          {
            id: FOUNDATION_DOCUMENT_ACTIONS.CLOSE,
            onClick: () => setDetailRow(null),
          },
        ]}
        ariaLabel="회계자료 상세"
      />
    </div>
  );
}
