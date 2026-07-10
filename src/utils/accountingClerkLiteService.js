import { getMasterDataByCategory, formatMasterRowForDisplay } from "./masterData";
import { getSessionProductionRecords } from "./productionRecords";
import { getShipmentEvents, getTransactionStatements } from "./titanHistorySession";
import { getStatementPrintStatus } from "./outboundStatementStatus";
import { normalizeFoundationAttachments } from "./foundationAttachmentEngine";

const DASH = "-";
const COUNT_SUFFIX = "\uac74";
const UNKNOWN_MONTH = "\ubbf8\uc9c0\uc815";
const STATUS_ISSUED = "\ubc1c\ud589\uc644\ub8cc";
const STATUS_PENDING = "\ubbf8\ubc1c\ud589";
const STATUS_REPRINT = "\uc7ac\ucd9c\ub825";
const INTERNAL_ITEMS_STORAGE_KEY = "project-titan-accounting-lite-internal-items-v1";

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

function today() {
  return new Date().toISOString().slice(0, 10);
}

function safeReadInternalItems() {
  try {
    const raw = globalThis.sessionStorage?.getItem(INTERNAL_ITEMS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) && parsed.length ? parsed : getInternalItemSeeds();
  } catch {
    return getInternalItemSeeds();
  }
}

function safeWriteInternalItems(items) {
  try {
    globalThis.sessionStorage?.setItem(INTERNAL_ITEMS_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // SessionStorage demo repository.
  }
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
    lotNo: source.lotNo ?? record?.lotNo ?? DASH,
    material: source.material ?? record?.material ?? DASH,
    shippedAt: formatDate(shipment?.shippedAt ?? statement?.printedAt ?? record?.outboundDate),
    printedAt: statement ? formatDate(statement.printedAt) : DASH,
    issuedAt: statement?.issuedAt ?? (statement ? statement.printedAt : DASH),
    printedBy: statement?.printedBy ?? DASH,
    pdfSaved: Boolean(statement?.pdfSaved),
    pdfStatusLabel: statement ? (statement.pdfSaved ? "PDF 저장" : "-") : DASH,
    outputStatus: statement?.outputStatus ?? (statement ? "출력 완료" : DASH),
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
      managementId: row.managementId,
      partName: row.partName,
      partNo: row.partNo,
      shippedAt: row.shippedAt,
      printedAt: row.printedAt,
      record: row.record,
      statement: row.statement,
      shipment: row.shipment,
      companyInfo: row.companyInfo,
    };
    current.statementCount += row.statement ? 1 : 0;
    current.totalAmount += row.totalAmount;
    if (!current.record && row.record) {
      current.managementId = row.managementId;
      current.partName = row.partName;
      current.partNo = row.partNo;
      current.shippedAt = row.shippedAt;
      current.printedAt = row.printedAt;
      current.record = row.record;
      current.statement = row.statement;
      current.shipment = row.shipment;
      current.companyInfo = row.companyInfo;
    }
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

function getInternalItemSeeds() {
  return [
    {
      id: "ASSET-202607-001",
      itemName: "디지털 버니어 캘리퍼스",
      category: "측정기",
      vendor: "한국측정기",
      orderDate: "2026-07-02",
      receivedDate: "2026-07-04",
      manager: "관리자",
      qty: 2,
      unitPrice: 185000,
      paymentStatus: "미결제",
      paymentDate: "",
      storageLocation: "품질검사실",
      department: "품질부",
      status: "사용중",
      note: "검사실 공용 측정기",
      attachments: [
        { id: "ASSET-ATT-1", name: "거래명세서-캘리퍼스.pdf", attachmentType: "invoice", uploadedAt: "2026-07-04T09:10:00" },
        { id: "ASSET-ATT-2", name: "세금계산서-캘리퍼스.pdf", attachmentType: "taxInvoice", uploadedAt: "2026-07-04T09:20:00" },
      ],
    },
    {
      id: "ASSET-202607-002",
      itemName: "절삭유 필터",
      category: "설비 부품",
      vendor: "NDK 설비자재",
      orderDate: "2026-07-05",
      receivedDate: "2026-07-08",
      manager: "최관리",
      qty: 10,
      unitPrice: 32000,
      paymentStatus: "지급완료",
      paymentDate: "2026-07-08",
      storageLocation: "설비보전 창고",
      department: "생산부",
      status: "보관",
      note: "10S 설비 예방정비용",
      attachments: [
        { id: "ASSET-ATT-3", name: "거래명세서-필터.pdf", attachmentType: "invoice", uploadedAt: "2026-07-08T10:15:00" },
      ],
    },
  ];
}

function normalizeInternalItem(item = {}, index = 0) {
  const qty = Number(item.qty) || 0;
  const unitPrice = Number(item.unitPrice) || 0;
  const supplyAmount = Number.isFinite(Number(item.supplyAmount)) ? Number(item.supplyAmount) : qty * unitPrice;
  const vat = Number.isFinite(Number(item.vat)) ? Number(item.vat) : Math.round(supplyAmount * 0.1);
  const totalAmount = Number.isFinite(Number(item.totalAmount)) ? Number(item.totalAmount) : supplyAmount + vat;
  const attachments = normalizeFoundationAttachments(item.attachments);

  return {
    id: normalize(item.id) || `ASSET-${Date.now()}-${index}`,
    itemName: normalize(item.itemName) || "구매품",
    category: normalize(item.category) || "기타 구매품",
    vendor: normalize(item.vendor) || DASH,
    orderDate: formatDate(item.orderDate) === DASH ? today() : formatDate(item.orderDate),
    receivedDate: formatDate(item.receivedDate) === DASH ? "" : formatDate(item.receivedDate),
    manager: normalize(item.manager) || "관리자",
    qty,
    unitPrice,
    supplyAmount,
    vat,
    totalAmount,
    paymentStatus: normalize(item.paymentStatus) || "미결제",
    paymentDate: formatDate(item.paymentDate) === DASH ? "" : formatDate(item.paymentDate),
    storageLocation: normalize(item.storageLocation) || "",
    department: normalize(item.department) || "",
    status: normalize(item.status) || "보관",
    note: normalize(item.note),
    attachments,
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString(),
  };
}

export function getAccountingInternalItemRows() {
  return safeReadInternalItems().map(normalizeInternalItem).map((row) => {
    const statementAttachments = row.attachments.filter((attachment) => attachment.attachmentType === "invoice");
    const taxInvoiceAttachments = row.attachments.filter((attachment) => attachment.attachmentType === "taxInvoice");

    return {
      ...row,
      qtyLabel: formatNumber(row.qty),
      unitPriceLabel: formatNumber(row.unitPrice),
      supplyAmountLabel: formatNumber(row.supplyAmount),
      vatLabel: formatNumber(row.vat),
      totalAmountLabel: formatNumber(row.totalAmount),
      statementAttachments,
      statementAttachmentCount: statementAttachments.length,
      taxInvoiceAttachments,
      taxInvoiceAttachmentCount: taxInvoiceAttachments.length,
    };
  });
}

export function saveAccountingInternalItem(payload) {
  const rows = safeReadInternalItems().map(normalizeInternalItem);
  const normalized = normalizeInternalItem({
    ...payload,
    id: payload.id || `ASSET-${Date.now()}`,
    updatedAt: new Date().toISOString(),
  });
  const index = rows.findIndex((row) => row.id === normalized.id);
  if (index >= 0) rows[index] = normalized;
  else rows.unshift(normalized);
  safeWriteInternalItems(rows);
  return normalized;
}

export function deleteAccountingInternalItem(id) {
  const targetId = String(id ?? "").trim();
  if (!targetId) return false;
  const rows = safeReadInternalItems().map(normalizeInternalItem);
  const nextRows = rows.filter((row) => row.id !== targetId);
  if (nextRows.length === rows.length) return false;
  safeWriteInternalItems(nextRows);
  return true;
}

export function buildAccountingClosingSummary() {
  const items = getAccountingInternalItemRows();
  const statements = buildAccountingStatementRows();
  const unpaid = items.filter((item) => item.paymentStatus !== "지급완료");
  const pendingDocs = items.filter(
    (item) => item.statementAttachmentCount === 0 || item.taxInvoiceAttachmentCount === 0
  );

  return {
    month: today().slice(0, 7),
    totalPurchaseAmount: items.reduce((sum, item) => sum + item.totalAmount, 0),
    unpaidAmount: unpaid.reduce((sum, item) => sum + item.totalAmount, 0),
    vendorCount: new Set(items.map((item) => item.vendor)).size,
    pendingDocCount: pendingDocs.length,
    shipmentStatementCount: statements.filter((row) => row.statement).length,
    closingRows: [
      { id: "monthClose", label: "월 마감", status: pendingDocs.length ? "미처리 확인" : "마감 가능", count: items.length },
      { id: "vendorClose", label: "거래처별 마감", status: "진행중", count: new Set(items.map((item) => item.vendor)).size },
      { id: "unpaid", label: "미결제 확인", status: unpaid.length ? "확인 필요" : "완료", count: unpaid.length },
      { id: "payment", label: "지급 확인", status: "진행중", count: items.filter((item) => item.paymentStatus === "지급완료").length },
      { id: "pending", label: "미처리 확인", status: pendingDocs.length ? "확인 필요" : "완료", count: pendingDocs.length },
    ],
  };
}