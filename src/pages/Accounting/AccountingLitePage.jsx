import { useMemo, useState } from "react";
import { BarChart3, Building2, Calculator, FileText, ListTree, Percent } from "lucide-react";

import TitanDashboardCard from "../../foundation/components/TitanDashboardCard";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanEmptyState from "../../foundation/components/TitanEmptyState";
import TitanMetricCard from "../../foundation/components/TitanMetricCard";
import TitanStatusBadge from "../../foundation/components/TitanStatusBadge";
import {
  buildAccountingCompanyRows,
  buildAccountingLiteMetrics,
  buildAccountingStatementRows,
} from "../../utils/accountingClerkLiteService";
import "./Accounting.css";

const DASH = "-";

const CHART_OF_ACCOUNTS = [
  { id: "sales", category: "매출", accountCode: "401", accountName: "제품매출", type: "수익", note: "거래명세서 공급가액 기준" },
  { id: "vat", category: "세금", accountCode: "255", accountName: "부가세예수금", type: "부채", note: "공급가액 10% 참고" },
  { id: "receivable", category: "채권", accountCode: "108", accountName: "외상매출금", type: "자산", note: "입금/채권 관리는 Coming Soon" },
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

function buildAccountingDashboard() {
  const metrics = buildAccountingLiteMetrics();
  const referenceRows = buildAccountingReferenceRows();
  return {
    metrics: {
      statementCount: metrics.totalStatements,
      companyCount: metrics.companyCount,
      totalAmountLabel: metrics.totalAmountLabel,
      referenceCount: referenceRows.length,
    },
    referenceRows,
  };
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
    title: "월별 현황",
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
    title: "거래처별 현황",
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
};

function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}

function filterRows(rows, query, keys) {
  const needle = normalize(query);
  if (!needle) return rows;
  return rows.filter((row) => keys.some((key) => normalize(row[key]).includes(needle)));
}

function renderStatus(value) {
  const label = String(value ?? "");
  const color = label.includes("완료") || label.includes("발행") ? "green" : label.includes("미") ? "orange" : "gray";
  return <TitanStatusBadge color={color} text={label || "조회"} />;
}

export function AccountingDashboardLite() {
  const dashboard = useMemo(() => buildAccountingDashboard(), []);
  const recentRows = dashboard.referenceRows.slice(0, 6);

  return (
    <div className="accounting-lite-page">
      <section className="accounting-lite-metrics" aria-label="회계관리 KPI">
        <TitanMetricCard title="발행 문서" value={`${dashboard.metrics.statementCount}건`} description="거래명세서 기준" icon={FileText} tone="blue" />
        <TitanMetricCard title="회계 참고자료" value={`${dashboard.metrics.referenceCount}건`} description="출고 + 발행 문서" icon={Calculator} tone="green" />
        <TitanMetricCard title="거래처" value={`${dashboard.metrics.companyCount}곳`} description="출고 실적 기준" icon={Building2} tone="purple" />
        <TitanMetricCard title="합계 금액" value={dashboard.metrics.totalAmountLabel} description="발행 문서 합계" icon={BarChart3} tone="gray" />
      </section>

      <TitanDashboardCard title="회계관리 Lite Scope">
        <div className="accounting-lite-scope">
          <span>조회 전용</span>
          <span>거래명세서 기준</span>
          <span>출고자료 연계</span>
          <span>ERP · 결산 · 금융연동 제외</span>
        </div>
      </TitanDashboardCard>

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
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const rows = useMemo(() => meta.rows(), [meta]);
  const filteredRows = useMemo(() => filterRows(rows, query, meta.searchKeys), [meta, query, rows]);
  const selectedRow = filteredRows.find((row) => row.id === selectedId) ?? filteredRows[0] ?? null;
  const Icon = meta.icon;

  const columns = meta.columns.map((column) =>
    column.key === "statusLabel" || column.key === "reportStatus"
      ? { ...column, render: (row) => renderStatus(row[column.key]) }
      : column
  );

  return (
    <div className="accounting-lite-page">
      <section className="accounting-lite-title-row">
        <div>
          <span className="accounting-lite-eyebrow">Accounting Management Lite</span>
          <h2>{meta.title}</h2>
          <p>{meta.description}</p>
        </div>
        <span className="accounting-lite-title-icon" aria-hidden="true">
          <Icon size={26} />
        </span>
      </section>

      <TitanDashboardCard title="조회 기준">
        <div className="accounting-lite-search">
          <label>
            검색
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="거래처 · 관리번호 · 문서번호 · 계정과목"
            />
          </label>
          <TitanStatusBadge color="blue" text={`조회 ${filteredRows.length}건`} />
          <TitanStatusBadge color="gray" text="등록 · 수정 · 삭제 없음" />
        </div>
      </TitanDashboardCard>

      <div className="accounting-lite-grid">
        <TitanDashboardCard title={meta.title} className="accounting-lite-table-card">
          {filteredRows.length ? (
            <TitanDataTable
              layout="compact"
              columns={columns}
              rows={filteredRows}
              activeRowId={selectedRow?.id}
              onRowClick={(row) => setSelectedId(row.id)}
              onRowDoubleClick={(row) => setSelectedId(row.id)}
              ariaLabel={meta.title}
            />
          ) : (
            <TitanEmptyState title="조회 결과가 없습니다." description="검색어를 변경하거나 초기화해 주세요." />
          )}
        </TitanDashboardCard>

        <TitanDashboardCard title="Detail" className="accounting-lite-detail-card">
          {selectedRow ? (
            <dl className="accounting-lite-detail-list">
              {Object.entries(selectedRow)
                .filter(([key, value]) => !["record", "statement", "shipment", "companyInfo"].includes(key) && typeof value !== "object")
                .slice(0, 10)
                .map(([key, value]) => (
                  <div key={key}>
                    <dt>{key}</dt>
                    <dd>{String(value ?? "-")}</dd>
                  </div>
                ))}
            </dl>
          ) : (
            <TitanEmptyState title="선택된 자료가 없습니다." />
          )}
        </TitanDashboardCard>
      </div>
    </div>
  );
}
