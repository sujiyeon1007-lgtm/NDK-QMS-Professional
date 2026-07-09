import { useMemo, useState } from "react";
import { BarChart3, Building2, ClipboardCheck, FileText, PackageSearch, Truck } from "lucide-react";

import TitanPrintPreviewModal from "../../components/print/TitanPrintPreviewModal";
import TransactionStatementPrintDocument from "../../components/print/TransactionStatementPrintDocument";
import { TransactionStatementIssueResultDialog } from "../../components/transactionStatement/TransactionStatementPreview";
import {
  FoundationDocumentAction,
  FOUNDATION_DOCUMENT_ACTIONS,
} from "../../foundation/components/FoundationActionBar";
import {
  PrimaryButton,
  SecondaryButton,
  TitanDashboardCard,
  TitanDataTable,
  TitanEmptyState,
  TitanStatusBadge,
} from "../../foundation/uiKit";
import TitanRegisterModal from "../../foundation/components/TitanRegisterModal";
import FoundationAttachment, {
  FoundationAttachmentBadge,
  FoundationAttachmentPopup,
} from "../../foundation/components/FoundationAttachment";
import { useTransactionStatementDocumentOutput } from "../../foundation/hooks/useFoundationDocumentOutput";
import {
  buildAccountingCompanyRows,
  buildAccountingClosingSummary,
  getAccountingInternalItemRows,
  buildAccountingShipmentStatistics,
  buildAccountingStatementRows,
  saveAccountingInternalItem,
} from "../../utils/accountingClerkLiteService";
import {
  getTitanStandardDefaultDateRange,
} from "../../config/listSearchStandard";
import "../Statistics/StatisticsDashboard.css";

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
  internalItems: "사내 물품 관리",
  closingManagement: "마감관리",
  registerItem: "물품 등록",
  editItem: "물품 수정",
  searchPlaceholder: "\uac70\ub798\ucc98",
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
  searchCriteria: "조회 기준",
  workFlowHint: "조회 → 출력 → 마감",
  quickActions: "Quick Actions",
  transactionOutput: "거래명세서 출력",
  pdfOutput: "PDF",
  printOutput: "인쇄",
  bottomSummary: "마감 요약",
  companyCount: "거래처 수",
  shipmentAmountSummary: "출고금액",
};

function includesText(value, keyword) {
  const q = String(keyword ?? "").trim().toLowerCase();
  if (!q) return true;
  return String(value ?? "").toLowerCase().includes(q);
}

function createClerkSearchFilters() {
  const range = getTitanStandardDefaultDateRange();
  return {
    company: "",
    managementId: "",
    documentId: "",
    status: "",
    dateFrom: range.from,
    dateTo: range.to,
  };
}

function matchesClerkSearch(row, filters) {
  if (filters.company && !includesText(row.company, filters.company)) return false;
  if (filters.managementId && !includesText(row.managementId, filters.managementId)) return false;
  if (filters.documentId && !includesText(row.documentId, filters.documentId)) return false;
  if (filters.status && !includesText(row.statusLabel ?? row.paymentStatus ?? row.status, filters.status)) return false;
  const date = String(row.shippedAt ?? row.printedAt ?? row.orderDate ?? row.receivedDate ?? "").slice(0, 10);
  if (filters.dateFrom && date && date !== "-" && date < filters.dateFrom) return false;
  if (filters.dateTo && date && date !== "-" && date > filters.dateTo) return false;
  return true;
}

function formatAccountingNumber(value) {
  return (Number(value) || 0).toLocaleString("ko-KR");
}

function buildAccountingWorkSummary(rows) {
  const companies = new Set(rows.map((row) => row.company).filter(Boolean));
  const issuedRows = rows.filter((row) => row.statement);
  const pendingRows = rows.filter((row) => !row.statement);
  const totalAmount = rows.reduce((sum, row) => sum + (Number(row.totalAmount) || 0), 0);

  return [
    { id: "companies", label: TEXT.companyCount, value: `${formatAccountingNumber(companies.size)}곳` },
    { id: "statements", label: TEXT.statementCount, value: `${formatAccountingNumber(issuedRows.length)}건` },
    { id: "amount", label: TEXT.shipmentAmountSummary, value: `${formatAccountingNumber(totalAmount)}원` },
    { id: "pending", label: TEXT.pendingShipment, value: `${formatAccountingNumber(pendingRows.length)}건` },
  ];
}

function buildStatementColumns() {
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

const INTERNAL_ITEM_CATEGORIES = ["사무용품", "공구", "설비 부품", "소모품", "측정기", "안전용품", "비품", "기타 구매품"];
const PAYMENT_STATUS_OPTIONS = ["미결제", "지급완료", "보류"];
const INTERNAL_ITEM_STATUS_OPTIONS = ["보관", "사용중", "수리중", "폐기", "소진"];

function createInternalItemDraft(row = {}) {
  const source = row ?? {};
  return {
    id: source.id || "",
    itemName: source.itemName || "",
    category: source.category || "기타 구매품",
    vendor: source.vendor || "",
    orderDate: source.orderDate || "",
    receivedDate: source.receivedDate || "",
    manager: source.manager || "관리자",
    qty: source.qty || 1,
    unitPrice: source.unitPrice || 0,
    paymentStatus: source.paymentStatus || "미결제",
    paymentDate: source.paymentDate || "",
    storageLocation: source.storageLocation || "",
    department: source.department || "",
    status: source.status || "보관",
    note: source.note || "",
    attachments: source.attachments || [],
  };
}

function InternalItemField({ label, children }) {
  return (
    <label className="accounting-internal-modal__field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function InternalItemModal({ open, row, onClose, onSave }) {
  const [draft, setDraft] = useState(() => createInternalItemDraft(row));

  if (!open) return null;

  const update = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const handleUpload = (files) =>
    setDraft((current) => ({ ...current, attachments: [...(current.attachments ?? []), ...files] }));
  const handleDelete = (attachmentId) =>
    setDraft((current) => ({
      ...current,
      attachments: (current.attachments ?? []).filter((attachment) => attachment.id !== attachmentId),
    }));

  return (
    <TitanRegisterModal
      open={open}
      onClose={onClose}
      onSubmit={() => onSave(draft)}
      title={draft.id ? TEXT.editItem : TEXT.registerItem}
      submitLabel="저장"
      size="wide"
    >
      <div className="accounting-internal-modal">
        <section className="accounting-internal-modal__section">
          <h3>기본정보</h3>
          <div className="accounting-internal-modal__grid">
            <InternalItemField label="품목명">
              <input className="titan-input" required value={draft.itemName} onChange={(e) => update("itemName", e.target.value)} />
            </InternalItemField>
            <InternalItemField label="분류">
              <select className="titan-input" value={draft.category} onChange={(e) => update("category", e.target.value)}>
                {INTERNAL_ITEM_CATEGORIES.map((item) => <option key={item}>{item}</option>)}
              </select>
            </InternalItemField>
            <InternalItemField label="상태">
              <select className="titan-input" value={draft.status} onChange={(e) => update("status", e.target.value)}>
                {INTERNAL_ITEM_STATUS_OPTIONS.map((item) => <option key={item}>{item}</option>)}
              </select>
            </InternalItemField>
            <InternalItemField label="담당자">
              <input className="titan-input" value={draft.manager} onChange={(e) => update("manager", e.target.value)} />
            </InternalItemField>
          </div>
        </section>

        <section className="accounting-internal-modal__section">
          <h3>구매정보</h3>
          <div className="accounting-internal-modal__grid">
            <InternalItemField label="거래처">
              <input className="titan-input" value={draft.vendor} onChange={(e) => update("vendor", e.target.value)} />
            </InternalItemField>
            <InternalItemField label="주문일">
              <input className="titan-input" type="date" value={draft.orderDate} onChange={(e) => update("orderDate", e.target.value)} />
            </InternalItemField>
            <InternalItemField label="입고일">
              <input className="titan-input" type="date" value={draft.receivedDate} onChange={(e) => update("receivedDate", e.target.value)} />
            </InternalItemField>
            <InternalItemField label="수량">
              <input className="titan-input" type="number" min="0" value={draft.qty} onChange={(e) => update("qty", e.target.value)} />
            </InternalItemField>
            <InternalItemField label="단가">
              <input className="titan-input" type="number" min="0" value={draft.unitPrice} onChange={(e) => update("unitPrice", e.target.value)} />
            </InternalItemField>
            <InternalItemField label="결제상태">
              <select className="titan-input" value={draft.paymentStatus} onChange={(e) => update("paymentStatus", e.target.value)}>
                {PAYMENT_STATUS_OPTIONS.map((item) => <option key={item}>{item}</option>)}
              </select>
            </InternalItemField>
            <InternalItemField label="결제일">
              <input className="titan-input" type="date" value={draft.paymentDate} onChange={(e) => update("paymentDate", e.target.value)} />
            </InternalItemField>
          </div>
        </section>

        <section className="accounting-internal-modal__section">
          <h3>거래처 / 자산 위치</h3>
          <div className="accounting-internal-modal__grid">
            <InternalItemField label="보관위치">
              <input className="titan-input" value={draft.storageLocation} onChange={(e) => update("storageLocation", e.target.value)} />
            </InternalItemField>
            <InternalItemField label="사용부서">
              <input className="titan-input" value={draft.department} onChange={(e) => update("department", e.target.value)} />
            </InternalItemField>
          </div>
        </section>

        <section className="accounting-internal-modal__section accounting-internal-modal__section--attachments">
          <h3>첨부파일</h3>
          <FoundationAttachment attachments={draft.attachments} onUpload={handleUpload} onDelete={handleDelete} />
        </section>

        <section className="accounting-internal-modal__section">
          <h3>메모</h3>
          <textarea className="titan-input accounting-internal-modal__memo" value={draft.note} onChange={(e) => update("note", e.target.value)} />
        </section>
      </div>
    </TitanRegisterModal>
  );
}

function buildInternalItemColumns({ onOpenAttachmentPopup, onOpenDetail }) {
  return [
    { key: "itemName", label: "품목명", widthPercent: 10 },
    { key: "category", label: "분류", widthPercent: 7 },
    { key: "vendor", label: "거래처", widthPercent: 9 },
    { key: "orderDate", label: "주문일", widthPercent: 7 },
    { key: "receivedDate", label: "입고일", widthPercent: 7 },
    { key: "manager", label: "담당자", widthPercent: 6 },
    { key: "qtyLabel", label: "수량", widthPercent: 5, align: "right" },
    { key: "unitPriceLabel", label: "단가", widthPercent: 7, align: "right" },
    { key: "supplyAmountLabel", label: "공급가액", widthPercent: 7, align: "right" },
    { key: "vatLabel", label: "부가세", widthPercent: 6, align: "right" },
    { key: "totalAmountLabel", label: "총금액", widthPercent: 7, align: "right" },
    {
      key: "paymentStatus",
      label: "결제상태",
      widthPercent: 7,
      render: (row) => (
        <TitanStatusBadge status={row.paymentStatus === "지급완료" ? "success" : "warning"} text={row.paymentStatus} />
      ),
    },
    { key: "paymentDate", label: "결제일", widthPercent: 7 },
    {
      key: "statementAttachments",
      label: "거래명세서",
      widthPercent: 7,
      render: (row) => (
        <FoundationAttachmentBadge
          count={row.statementAttachmentCount}
          onClick={(event) => {
            event.stopPropagation();
            onOpenAttachmentPopup("거래명세서", row.statementAttachments);
          }}
        />
      ),
    },
    {
      key: "taxInvoiceAttachments",
      label: "세금계산서",
      widthPercent: 7,
      render: (row) => (
        <FoundationAttachmentBadge
          count={row.taxInvoiceAttachmentCount}
          onClick={(event) => {
            event.stopPropagation();
            onOpenAttachmentPopup("세금계산서", row.taxInvoiceAttachments);
          }}
        />
      ),
    },
    { key: "storageLocation", label: "보관위치", widthPercent: 8 },
    { key: "department", label: "사용부서", widthPercent: 7 },
    { key: "status", label: "상태", widthPercent: 6 },
    { key: "note", label: "비고", widthPercent: 10 },
    {
      key: "actions",
      label: "작업",
      widthPercent: 6,
      render: (row) => (
        <SecondaryButton type="button" onClick={(event) => { event.stopPropagation(); onOpenDetail(row); }}>
          상세
        </SecondaryButton>
      ),
    },
  ];
}

export default function AccountingClerkLitePage({ featureId = "statementManagement" }) {
  const [filters, setFilters] = useState(() => createClerkSearchFilters());
  const [activeRow, setActiveRow] = useState(null);
  const [internalItemPopupRow, setInternalItemPopupRow] = useState(null);
  const [attachmentPopup, setAttachmentPopup] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const transactionStatementOutput = useTransactionStatementDocumentOutput({
    onAfterOutput: () => setRefreshKey((key) => key + 1),
  });

  const statementRows = useMemo(
    () =>
      buildAccountingStatementRows().filter(
        (row) => matchesClerkSearch(row, filters)
      ),
    [filters, refreshKey]
  );
  const companyRows = useMemo(
    () => buildAccountingCompanyRows().filter((row) => matchesClerkSearch(row, filters)),
    [filters, refreshKey]
  );
  const statistics = useMemo(() => buildAccountingShipmentStatistics(), [refreshKey]);
  const internalItemRows = useMemo(() => getAccountingInternalItemRows(), [refreshKey]);
  const closingSummary = useMemo(() => buildAccountingClosingSummary(), [refreshKey]);
  const workSummary = useMemo(() => buildAccountingWorkSummary(statementRows), [statementRows]);

  const columns = useMemo(() => buildStatementColumns(), []);

  const isCompanyView = featureId === "companyLookup";
  const isStatisticsView = featureId === "shipmentStatistics";
  const isInternalItemsView = featureId === "internalItems";
  const isClosingView = featureId === "closingManagement";
  const activeOutputRow = activeRow?.record
    ? activeRow
    : isCompanyView
      ? companyRows.find((row) => row.record) ?? null
      : statementRows.find((row) => row.record) ?? null;
  const internalItemColumns = useMemo(
    () =>
      buildInternalItemColumns({
        onOpenAttachmentPopup: (title, attachments) => setAttachmentPopup({ title, attachments }),
        onOpenDetail: (row) => setInternalItemPopupRow(row),
      }),
    []
  );

  const saveInternalItem = (draft) => {
    saveAccountingInternalItem(draft);
    setInternalItemPopupRow(null);
    setRefreshKey((key) => key + 1);
  };

  if (isInternalItemsView) {
    const internalSummary = [
      { id: "items", label: "구매/자산", value: `${internalItemRows.length}건` },
      { id: "amount", label: "총 구매금액", value: `${closingSummary.totalPurchaseAmount.toLocaleString("ko-KR")}원` },
      { id: "unpaid", label: "미결제", value: `${closingSummary.unpaidAmount.toLocaleString("ko-KR")}원` },
      { id: "pendingDocs", label: "증빙 미처리", value: `${closingSummary.pendingDocCount}건` },
    ];
    return (
      <div className="accounting-clerk-page accounting-clerk-page--work">
        <section className="accounting-work-summary" aria-label="사내 물품 요약">
          {internalSummary.map((item) => (
            <article key={item.id} className="accounting-work-summary__item">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </article>
          ))}
        </section>

        <TitanDashboardCard
          title={TEXT.internalItems}
          icon={PackageSearch}
          headerAction={
            <PrimaryButton type="button" onClick={() => setInternalItemPopupRow(createInternalItemDraft())}>
              {TEXT.registerItem}
            </PrimaryButton>
          }
        >
          <TitanDataTable
            layout="compact"
            columns={internalItemColumns}
            rows={internalItemRows}
            getRowId={(row) => row.id}
            onRowClick={(row) => setActiveRow(row)}
            onRowDoubleClick={(row) => setInternalItemPopupRow(row)}
            emptyMessage="등록된 사내 물품이 없습니다."
          />
        </TitanDashboardCard>

        <InternalItemModal
          key={internalItemPopupRow?.id || "new-internal-item"}
          open={Boolean(internalItemPopupRow)}
          row={internalItemPopupRow}
          onClose={() => setInternalItemPopupRow(null)}
          onSave={saveInternalItem}
        />

        <FoundationAttachmentPopup
          open={Boolean(attachmentPopup)}
          title={attachmentPopup?.title ?? "첨부파일"}
          attachments={attachmentPopup?.attachments ?? []}
          onClose={() => setAttachmentPopup(null)}
        />
      </div>
    );
  }

  if (isClosingView) {
    const closingItems = [
      { id: "month", label: "마감월", value: closingSummary.month },
      { id: "vendors", label: "거래처", value: `${closingSummary.vendorCount}곳` },
      { id: "unpaid", label: "미결제", value: `${closingSummary.unpaidAmount.toLocaleString("ko-KR")}원` },
      { id: "pendingDocs", label: "미처리", value: `${closingSummary.pendingDocCount}건` },
    ];
    return (
      <div className="accounting-clerk-page accounting-clerk-page--work">
        <section className="accounting-work-summary" aria-label="마감관리 요약">
          {closingItems.map((item) => (
            <article key={item.id} className="accounting-work-summary__item">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </article>
          ))}
        </section>

        <TitanDashboardCard title={TEXT.closingManagement} icon={ClipboardCheck}>
          <div className="accounting-closing-grid">
            {closingSummary.closingRows.map((row) => (
              <article key={row.id} className="accounting-closing-card">
                <span>{row.label}</span>
                <strong>{row.count.toLocaleString("ko-KR")}건</strong>
                <TitanStatusBadge status={row.status.includes("확인") ? "warning" : "success"} text={row.status} />
              </article>
            ))}
          </div>
        </TitanDashboardCard>
      </div>
    );
  }

  return (
    <div className="accounting-clerk-page accounting-clerk-page--work">
      <section className="accounting-work-search" aria-label={TEXT.searchCriteria}>
        <div className="accounting-work-search__head">
          <strong>{TEXT.searchCriteria}</strong>
          <TitanStatusBadge color="blue" text={`조회 ${isCompanyView ? companyRows.length : statementRows.length}건`} />
        </div>
        <div className="accounting-lite-search accounting-lite-search--work">
          <div className="accounting-lite-date-filter" aria-label="기간">
            <input
              className="titan-input"
              type="date"
              value={filters.dateFrom}
              onChange={(event) => setFilters((prev) => ({ ...prev, dateFrom: event.target.value }))}
              aria-label="기간 시작"
            />
            <span aria-hidden="true">~</span>
            <input
              className="titan-input"
              type="date"
              value={filters.dateTo}
              onChange={(event) => setFilters((prev) => ({ ...prev, dateTo: event.target.value }))}
              aria-label="기간 종료"
            />
          </div>
          <input
            className="titan-input"
            value={filters.company}
            onChange={(event) => setFilters((prev) => ({ ...prev, company: event.target.value }))}
            placeholder={TEXT.searchPlaceholder}
          />
          <input
            className="titan-input"
            value={filters.managementId}
            onChange={(event) => setFilters((prev) => ({ ...prev, managementId: event.target.value }))}
            placeholder="관리번호"
          />
          <input
            className="titan-input"
            value={filters.documentId}
            onChange={(event) => setFilters((prev) => ({ ...prev, documentId: event.target.value }))}
            placeholder="문서번호"
          />
          <input
            className="titan-input"
            value={filters.status}
            onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
            placeholder="상태"
          />
          <SecondaryButton
            type="button"
            onClick={() => setFilters((prev) => ({ ...prev, status: "미발행" }))}
          >
            미발행만 보기
          </SecondaryButton>
          <SecondaryButton
            type="button"
            onClick={() => setFilters(createClerkSearchFilters())}
          >
            {TEXT.reset}
          </SecondaryButton>
        </div>
      </section>

      <section className="accounting-work-actions" aria-label={TEXT.quickActions}>
        <span className="accounting-work-actions__label">
          {activeOutputRow?.record ? `${activeOutputRow.company} · ${activeOutputRow.managementId}` : "출고 자료를 선택하세요"}
        </span>
        <FoundationDocumentAction
          actions={[
            {
              id: FOUNDATION_DOCUMENT_ACTIONS.TRANSACTION_STATEMENT_PRINT,
              label: TEXT.transactionOutput,
              onClick: () => transactionStatementOutput.openPreview(activeOutputRow),
              disabled: !activeOutputRow?.record,
            },
            {
              id: FOUNDATION_DOCUMENT_ACTIONS.PDF,
              label: TEXT.pdfOutput,
              onClick: () => transactionStatementOutput.openPreview(activeOutputRow),
              disabled: !activeOutputRow?.record,
              title: "미리보기에서 PDF 출력",
            },
            {
              id: FOUNDATION_DOCUMENT_ACTIONS.PRINT,
              label: TEXT.printOutput,
              onClick: () => transactionStatementOutput.openPreview(activeOutputRow),
              disabled: !activeOutputRow?.record,
              title: "미리보기에서 인쇄",
            },
          ]}
          ariaLabel="경리 거래명세서 문서 작업"
        />
      </section>

      <TitanDashboardCard
        title={isCompanyView ? TEXT.customerLookup : isStatisticsView ? TEXT.shipmentStats : TEXT.statementManagement}
        icon={isCompanyView ? Building2 : isStatisticsView ? BarChart3 : FileText}
        className="accounting-work-list-card"
      >
        {isStatisticsView ? (
          <div className="accounting-shipment-statistics">
            <div className="accounting-lite-stats-grid">
              <StatList title={TEXT.monthlyShipment} rows={statistics.byMonth} />
              <StatList title={TEXT.companyShipment} rows={statistics.byCompany} />
              <StatList title={TEXT.partShipment} rows={statistics.byPart} />
            </div>
            <TitanDataTable
              layout="compact"
              columns={columns}
              rows={statementRows}
              activeRowId={activeRow?.id}
              onRowClick={(row) => setActiveRow(row)}
              onRowDoubleClick={(row) => setActiveRow(row)}
              emptyMessage={TEXT.emptyStatement}
            />
          </div>
        ) : (
          <TitanDataTable
            layout="compact"
            columns={isCompanyView ? COMPANY_COLUMNS : columns}
            rows={isCompanyView ? companyRows : statementRows}
            activeRowId={activeRow?.id}
            onRowClick={(row) => setActiveRow(row)}
            onRowDoubleClick={(row) => setActiveRow(row)}
            emptyMessage={isCompanyView ? TEXT.emptyCompany : TEXT.emptyStatement}
          />
        )}
      </TitanDashboardCard>

      <section className="accounting-work-summary" aria-label={TEXT.bottomSummary}>
        {workSummary.map((item) => (
          <article key={item.id} className="accounting-work-summary__item">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </article>
        ))}
      </section>

      <TitanPrintPreviewModal
        open={transactionStatementOutput.isOpen}
        onClose={transactionStatementOutput.closePreview}
        title={TEXT.transactionPdfReprint}
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
    </div>
  );
}