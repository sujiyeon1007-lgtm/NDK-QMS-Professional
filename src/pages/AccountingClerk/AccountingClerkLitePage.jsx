import { useMemo, useState } from "react";
import { BarChart3, Building2, FileText, Truck } from "lucide-react";

import TitanPrintPreviewModal from "../../components/print/TitanPrintPreviewModal";
import TransactionStatementPrintDocument from "../../components/print/TransactionStatementPrintDocument";
import {
  PrimaryButton,
  SecondaryButton,
  TitanDashboardCard,
  TitanDataTable,
  TitanEmptyState,
  TitanMetricCard,
  TitanStatusBadge,
} from "../../foundation/uiKit";
import { buildTransactionStatementPrintProps } from "../../utils/titanPrintPreviewHelpers";
import { exportTitanPdf, printTitanDocument } from "../../utils/titanPrintExport";
import { recordTransactionStatementPrint } from "../../utils/outboundRegistration";
import {
  buildAccountingCompanyRows,
  buildAccountingLiteMetrics,
  buildAccountingShipmentStatistics,
  buildAccountingStatementRows,
} from "../../utils/accountingClerkLiteService";
import { ACCOUNTING_CLERK_PHILOSOPHY } from "../../config/accountingClerkPolicy";

const TEXT = {
  documentId: "\ubb38\uc11cID",
  managementId: "\uad00\ub9ac\ubc88\ud638",
  company: "\uac70\ub798\ucc98",
  partName: "\ud488\uba85",
  partNo: "\ud488\ubc88",
  shipQty: "\ucd9c\uace0\uc218\ub7c9",
  shippedAt: "\ucd9c\uace0\uc77c",
  printedAt: "\ubc1c\ud589\uc77c",
  status: "\uc0c1\ud0dc",
  action: "\uc791\uc5c5",
  pdfReprint: "PDF \uc7ac\ucd9c\ub825",
  businessNumber: "\uc0ac\uc5c5\uc790\ubc88\ud638",
  representative: "\ub300\ud45c\uc790",
  manager: "\ub2f4\ub2f9\uc790",
  phone: "\ub300\ud45c\ubc88\ud638",
  email: "\uc774\uba54\uc77c",
  issuedDocument: "\ubc1c\ud589\ubb38\uc11c",
  shipmentAmount: "\ucd9c\uace0\uae08\uc561",
  noStats: "\ud45c\uc2dc\ud560 \ud1b5\uacc4\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.",
  statsHint: "\ucd9c\uace0 \uc774\ub825\uc774 \uc0dd\uc131\ub418\uba74 \uc790\ub3d9 \uc9d1\uacc4\ub429\ub2c8\ub2e4.",
  customerLookup: "\uac70\ub798\ucc98 \uc870\ud68c",
  shipmentStats: "\ucd9c\uace0 \ud1b5\uacc4",
  statementManagement: "\uac70\ub798\uba85\uc138\uc11c \uad00\ub9ac",
  searchPlaceholder: "\uac70\ub798\ucc98 · \uad00\ub9ac\ubc88\ud638 · \ud488\uba85 · \ud488\ubc88 · LOT",
  reset: "\ucd08\uae30\ud654",
  monthlyShipment: "\uc6d4\ubcc4 \ucd9c\uace0 \uac74\uc218",
  companyShipment: "\uac70\ub798\ucc98\ubcc4 \ucd9c\uace0",
  partShipment: "\ud488\ubaa9\ubcc4 \ucd9c\uace0",
  emptyCompany: "\uc870\ud68c\ub41c \uac70\ub798\ucc98\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.",
  emptyStatement: "\uc870\ud68c\ub41c \uac70\ub798\uba85\uc138\uc11c \uc774\ub825\uc774 \uc5c6\uc2b5\ub2c8\ub2e4.",
  detail: "\uc0c1\uc138\uc815\ubcf4",
  totalAmount: "\ud569\uacc4\uae08\uc561",
  statementCount: "\uac70\ub798\uba85\uc138\uc11c",
  pendingShipment: "\ubbf8\ubc1c\ud589 \ucd9c\uace0",
  issuedHistory: "\ubc1c\ud589 \uc774\ub825",
  outboundLinked: "\ucd9c\uace0 \uc5f0\uacc4 \ub300\uc0c1",
  masterLookup: "\uac70\ub798\ucc98 Master \uc870\ud68c",
  issuedBasis: "\ubc1c\ud589 \uc774\ub825 \uae30\uc900",
  transactionPdfReprint: "\uac70\ub798\uba85\uc138\uc11c PDF \uc7ac\ucd9c\ub825",
};

function includesText(value, keyword) {
  const q = String(keyword ?? "").trim().toLowerCase();
  if (!q) return true;
  return String(value ?? "").toLowerCase().includes(q);
}

function matchesStatementSearch(row, keyword) {
  return [
    row.documentId,
    row.managementId,
    row.company,
    row.partName,
    row.partNo,
    row.lotNo,
    row.shippedAt,
    row.printedAt,
  ].some((value) => includesText(value, keyword));
}

function buildStatementColumns({ onPreview }) {
  return [
    { key: "documentId", label: TEXT.documentId, widthPercent: 10 },
    { key: "managementId", label: TEXT.managementId, widthPercent: 12 },
    { key: "company", label: TEXT.company, widthPercent: 13 },
    { key: "partName", label: TEXT.partName, widthPercent: 13 },
    { key: "partNo", label: TEXT.partNo, widthPercent: 11 },
    { key: "shipQtyLabel", label: TEXT.shipQty, widthPercent: 8 },
    { key: "shippedAt", label: TEXT.shippedAt, widthPercent: 8 },
    { key: "printedAt", label: TEXT.printedAt, widthPercent: 8 },
    {
      key: "statusLabel",
      label: TEXT.status,
      widthPercent: 8,
      render: (row) => (
        <TitanStatusBadge
          status={row.statusKey === "pending" ? "warning" : "success"}
          text={row.statusLabel}
        />
      ),
    },
    {
      key: "actions",
      label: TEXT.action,
      widthPercent: 9,
      render: (row) => (
        <SecondaryButton type="button" disabled={!row.record} onClick={() => onPreview(row)}>
          {TEXT.pdfReprint}
        </SecondaryButton>
      ),
    },
  ];
}

const COMPANY_COLUMNS = [
  { key: "company", label: TEXT.company, widthPercent: 16 },
  { key: "businessNumber", label: TEXT.businessNumber, widthPercent: 13 },
  { key: "representative", label: TEXT.representative, widthPercent: 10 },
  { key: "manager", label: TEXT.manager, widthPercent: 13 },
  { key: "phone", label: TEXT.phone, widthPercent: 14 },
  { key: "email", label: TEXT.email, widthPercent: 16 },
  { key: "statementCountLabel", label: TEXT.issuedDocument, widthPercent: 8 },
  { key: "totalAmountLabel", label: TEXT.shipmentAmount, widthPercent: 10 },
];

function StatList({ title, rows }) {
  return (
    <TitanDashboardCard title={title}>
      {rows.length ? (
        <ul className="accounting-lite-stat-list">
          {rows.map((row) => (
            <li key={row.label}>
              <span>{row.label}</span>
              <strong>{row.countLabel}</strong>
            </li>
          ))}
        </ul>
      ) : (
        <TitanEmptyState title={TEXT.noStats} description={TEXT.statsHint} />
      )}
    </TitanDashboardCard>
  );
}

export default function AccountingClerkLitePage({ featureId = "statementManagement" }) {
  const [keyword, setKeyword] = useState("");
  const [activeRow, setActiveRow] = useState(null);
  const [previewRow, setPreviewRow] = useState(null);
  const [busy, setBusy] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const metrics = useMemo(() => buildAccountingLiteMetrics(), [refreshKey]);
  const statementRows = useMemo(
    () => buildAccountingStatementRows().filter((row) => matchesStatementSearch(row, keyword)),
    [keyword, refreshKey]
  );
  const companyRows = useMemo(
    () => buildAccountingCompanyRows().filter((row) => matchesStatementSearch(row, keyword)),
    [keyword, refreshKey]
  );
  const statistics = useMemo(() => buildAccountingShipmentStatistics(), [refreshKey]);

  const printProps = useMemo(() => {
    if (!previewRow?.record) return null;
    return buildTransactionStatementPrintProps(previewRow.record, {
      shipQty: previewRow.shipQty,
      issueDate: previewRow.printedAt === "-" ? undefined : previewRow.printedAt,
    });
  }, [previewRow]);

  const columns = useMemo(
    () => buildStatementColumns({ onPreview: (row) => setPreviewRow(row) }),
    []
  );

  const handlePrinted = () => {
    if (!printProps?.record) return;
    recordTransactionStatementPrint(printProps.record, {
      shipQty: printProps.shipQtyNumeric,
      unitPrice: printProps.unitPrice,
      amounts: printProps.amounts,
    });
    setRefreshKey((key) => key + 1);
  };

  const handlePrint = async (documentEl) => {
    setBusy(true);
    try {
      await printTitanDocument(documentEl);
      handlePrinted();
    } finally {
      setBusy(false);
    }
  };

  const handlePdf = async (documentEl) => {
    setBusy(true);
    try {
      const id = printProps?.record?.id ?? "statement";
      await exportTitanPdf(documentEl, `transaction-statement-${id}.pdf`);
      handlePrinted();
    } finally {
      setBusy(false);
    }
  };

  const isCompanyView = featureId === "companyLookup";
  const isStatisticsView = featureId === "shipmentStatistics";

  return (
    <div className="accounting-clerk-page">
      <p className="accounting-clerk-page__notice accounting-clerk-page__notice--info">
        {ACCOUNTING_CLERK_PHILOSOPHY.statementNotice}
      </p>

      <section className="accounting-clerk-metrics" aria-label="Accounting Clerk Lite KPI">
        <TitanMetricCard title={TEXT.statementCount} value={`${metrics.totalStatements}건`} description={TEXT.issuedHistory} icon={FileText} tone="blue" />
        <TitanMetricCard title={TEXT.pendingShipment} value={`${metrics.pendingStatements}건`} description={TEXT.outboundLinked} icon={Truck} tone="orange" />
        <TitanMetricCard title={TEXT.company} value={`${metrics.companyCount}곳`} description={TEXT.masterLookup} icon={Building2} tone="green" />
        <TitanMetricCard title={TEXT.shipmentAmount} value={metrics.totalAmountLabel} description={TEXT.issuedBasis} icon={BarChart3} tone="gray" />
      </section>

      <TitanDashboardCard
        title={isCompanyView ? TEXT.customerLookup : isStatisticsView ? TEXT.shipmentStats : TEXT.statementManagement}
        icon={isCompanyView ? Building2 : isStatisticsView ? BarChart3 : FileText}
        headerAction={
          <div className="accounting-lite-search">
            <input
              className="titan-input"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder={TEXT.searchPlaceholder}
            />
            <SecondaryButton type="button" onClick={() => setKeyword("")}>
              {TEXT.reset}
            </SecondaryButton>
          </div>
        }
      >
        {isStatisticsView ? (
          <div className="accounting-lite-stats-grid">
            <StatList title={TEXT.monthlyShipment} rows={statistics.byMonth} />
            <StatList title={TEXT.companyShipment} rows={statistics.byCompany} />
            <StatList title={TEXT.partShipment} rows={statistics.byPart} />
          </div>
        ) : (
          <TitanDataTable
            layout="compact"
            columns={isCompanyView ? COMPANY_COLUMNS : columns}
            rows={isCompanyView ? companyRows : statementRows}
            activeRowId={activeRow?.id}
            onRowClick={(row) => setActiveRow(row)}
            onRowDoubleClick={(row) => {
              if (!isCompanyView && row.record) setPreviewRow(row);
            }}
            emptyMessage={isCompanyView ? TEXT.emptyCompany : TEXT.emptyStatement}
          />
        )}
      </TitanDashboardCard>

      {activeRow && !isStatisticsView ? (
        <TitanDashboardCard title={TEXT.detail}>
          <dl className="accounting-lite-detail">
            <div><dt>{TEXT.company}</dt><dd>{activeRow.company}</dd></div>
            <div><dt>{TEXT.businessNumber}</dt><dd>{activeRow.businessNumber}</dd></div>
            <div><dt>{TEXT.manager}</dt><dd>{activeRow.companyManager ?? activeRow.manager ?? "-"}</dd></div>
            <div><dt>{TEXT.managementId}</dt><dd>{activeRow.managementId ?? "-"}</dd></div>
            <div><dt>{TEXT.shippedAt}</dt><dd>{activeRow.shippedAt ?? "-"}</dd></div>
            <div><dt>{TEXT.printedAt}</dt><dd>{activeRow.printedAt ?? "-"}</dd></div>
            <div><dt>{TEXT.totalAmount}</dt><dd>{activeRow.totalAmountLabel ?? activeRow.totalAmount ?? "-"}</dd></div>
          </dl>
          {!isCompanyView ? (
            <PrimaryButton type="button" disabled={!activeRow.record} onClick={() => setPreviewRow(activeRow)}>
              {TEXT.transactionPdfReprint}
            </PrimaryButton>
          ) : null}
        </TitanDashboardCard>
      ) : null}

      <TitanPrintPreviewModal
        open={Boolean(previewRow)}
        onClose={() => setPreviewRow(null)}
        title={TEXT.transactionPdfReprint}
        onPrint={handlePrint}
        onPdf={handlePdf}
        busy={busy}
      >
        {printProps ? <TransactionStatementPrintDocument {...printProps} /> : null}
      </TitanPrintPreviewModal>
    </div>
  );
}