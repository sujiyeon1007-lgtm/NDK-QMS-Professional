import { getMasterDataByCategory, formatMasterRowForDisplay } from "./masterData";
import { getSessionProductionRecords } from "./productionRecords";
import { getShipmentEvents, getTransactionStatements } from "./titanHistorySession";
import { getStatementPrintStatus } from "./outboundStatementStatus";

const DASH = "-";
const COUNT_SUFFIX = "\uac74";
const UNKNOWN_MONTH = "\ubbf8\uc9c0\uc815";
const STATUS_ISSUED = "\ubc1c\ud589\uc644\ub8cc";
const STATUS_PENDING = "\ubbf8\ubc1c\ud589";
const STATUS_REPRINT = "\uc7ac\ucd9c\ub825";

function normalize(value) {
  return String(value ?? "").trim();
}

function formatDate(value) {
  const text = normalize(value);
  if (!text) return DASH;
  return text.slice(0, 10);
}

function formatNumber(value) {
  return (Number(value) || 0).toLocaleString("ko-KR");
}

function findRecord(records, managementId) {
  const id = normalize(managementId);
  return records.find((row) => row.id === id || row.managementId === id) ?? null;
}

function findCompany(companies, companyName) {
  const name = normalize(companyName);
  return companies.find((row) => normalize(row.name) === name || normalize(row.company) === name) ?? null;
}

function buildCompanyInfo(companies, companyName) {
  const company = findCompany(companies, companyName);
  if (!company) {
    return {
      companyName: companyName || DASH,
      businessNumber: DASH,
      representative: DASH,
      manager: DASH,
      phone: DASH,
      email: DASH,
      raw: null,
    };
  }

  const formatted = formatMasterRowForDisplay(company);
  return {
    companyName: formatted.name ?? companyName ?? DASH,
    businessNumber: formatted.businessNumber ?? formatted.bizNo ?? DASH,
    representative: formatted.representative ?? formatted.ceoName ?? DASH,
    manager: formatted.primaryContactName || formatted.manager || formatted.ndkAssigneeLabel || DASH,
    phone: formatted.phoneLabel ?? formatted.phone ?? DASH,
    email: formatted.emailLabel ?? formatted.email ?? DASH,
    raw: formatted,
  };
}

function buildStatementRow({ statement, shipment, record, companies, index }) {
  const source = statement ?? shipment ?? {};
  const company = buildCompanyInfo(companies, source.company ?? record?.company);
  const status = statement
    ? { label: statement.reprint ? STATUS_REPRINT : STATUS_ISSUED, key: statement.reprint ? "reprint" : "issued" }
    : { label: STATUS_PENDING, key: "pending" };
  const recordStatus = record ? getStatementPrintStatus(record) : null;
  const shipQty = Number(source.shipQty ?? record?.shipQty ?? 0) || 0;
  const unitPrice = Number(source.unitPrice ?? 0) || 0;
  const supplyAmount = Number(source.supplyAmount ?? shipQty * unitPrice) || 0;
  const vat = Number(source.vat ?? Math.round(supplyAmount * 0.1)) || 0;
  const totalAmount = Number(source.totalAmount ?? supplyAmount + vat) || 0;

  return {
    id: source.id ?? `${source.managementId ?? record?.id ?? "statement"}-${index}`,
    documentId: statement?.id ?? DASH,
    managementId: source.managementId ?? record?.id ?? DASH,
    company: company.companyName,
    businessNumber: company.businessNumber,
    representative: company.representative,
    companyManager: company.manager,
    phone: company.phone,
    email: company.email,
    partName: source.partName ?? record?.partName ?? DASH,
    partNo: source.partNo ?? record?.partNo ?? DASH,
    lotNo: record?.lotNo ?? DASH,
    material: source.material ?? record?.material ?? DASH,
    shippedAt: formatDate(shipment?.shippedAt ?? statement?.printedAt ?? record?.outboundDate),
    printedAt: statement ? formatDate(statement.printedAt) : DASH,
    printedBy: statement?.printedBy ?? DASH,
    shipQty,
    shipQtyLabel: `${formatNumber(shipQty)} ${source.unit ?? record?.unit ?? "EA"}`,
    unit: source.unit ?? record?.unit ?? "EA",
    unitPrice,
    supplyAmount,
    vat,
    totalAmount,
    supplyAmountLabel: formatNumber(supplyAmount),
    vatLabel: formatNumber(vat),
    totalAmountLabel: formatNumber(totalAmount),
    statusLabel: status.label,
    statusKey: status.key,
    reprintCount: recordStatus?.reprintCount ?? 0,
    record,
    statement,
    shipment,
    companyInfo: company,
  };
}

export function buildAccountingStatementRows() {
  const records = getSessionProductionRecords();
  const shipments = getShipmentEvents();
  const statements = getTransactionStatements();
  const companies = getMasterDataByCategory("companies");
  const statementRows = statements.map((statement, index) =>
    buildStatementRow({
      statement,
      shipment: shipments.find((row) => row.managementId === statement.managementId) ?? null,
      record: findRecord(records, statement.managementId),
      companies,
      index,
    })
  );

  const statementIds = new Set(statementRows.map((row) => row.managementId));
  const pendingShipmentRows = shipments
    .filter((shipment) => !statementIds.has(shipment.managementId))
    .map((shipment, index) =>
      buildStatementRow({
        shipment,
        record: findRecord(records, shipment.managementId),
        companies,
        index: `shipment-${index}`,
      })
    );

  return [...statementRows, ...pendingShipmentRows].sort((a, b) =>
    String(b.printedAt === DASH ? b.shippedAt : b.printedAt).localeCompare(
      String(a.printedAt === DASH ? a.shippedAt : a.printedAt)
    )
  );
}

export function buildAccountingCompanyRows() {
  const rows = buildAccountingStatementRows();
  const map = new Map();
  rows.forEach((row) => {
    const current = map.get(row.company) ?? {
      id: row.company,
      company: row.company,
      businessNumber: row.businessNumber,
      representative: row.representative,
      manager: row.companyManager,
      phone: row.phone,
      email: row.email,
      statementCount: 0,
      totalAmount: 0,
    };
    current.statementCount += row.statement ? 1 : 0;
    current.totalAmount += row.totalAmount;
    map.set(row.company, current);
  });
  return [...map.values()].map((row) => ({
    ...row,
    statementCountLabel: `${formatNumber(row.statementCount)}${COUNT_SUFFIX}`,
    totalAmountLabel: formatNumber(row.totalAmount),
  }));
}

export function buildAccountingLiteMetrics() {
  const rows = buildAccountingStatementRows();
  const issuedRows = rows.filter((row) => row.statement);
  const pendingRows = rows.filter((row) => !row.statement);
  const companies = new Set(rows.map((row) => row.company));
  const totalAmount = issuedRows.reduce((sum, row) => sum + row.totalAmount, 0);

  return {
    totalStatements: issuedRows.length,
    pendingStatements: pendingRows.length,
    companyCount: companies.size,
    totalAmount,
    totalAmountLabel: formatNumber(totalAmount),
  };
}

export function buildAccountingShipmentStatistics() {
  const rows = buildAccountingStatementRows();
  const byMonth = new Map();
  const byCompany = new Map();
  const byPart = new Map();

  rows.forEach((row) => {
    const month = row.shippedAt === DASH ? UNKNOWN_MONTH : row.shippedAt.slice(0, 7);
    byMonth.set(month, (byMonth.get(month) ?? 0) + 1);
    byCompany.set(row.company, (byCompany.get(row.company) ?? 0) + 1);
    byPart.set(row.partName, (byPart.get(row.partName) ?? 0) + 1);
  });

  const mapList = (map) =>
    [...map.entries()]
      .map(([label, count]) => ({ label, count, countLabel: `${formatNumber(count)}${COUNT_SUFFIX}` }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

  return {
    byMonth: mapList(byMonth),
    byCompany: mapList(byCompany),
    byPart: mapList(byPart),
  };
}