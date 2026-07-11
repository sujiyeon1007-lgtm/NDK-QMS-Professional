import { createPortal } from "react-dom";
import { CheckCircle2, X } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import {
  NDK_SUPPLIER,
  buildStatementItemRows,
  buildStatementLineItem,
  getCustomerProfile,
} from "../../utils/transactionStatementConfig";
import { parseQtyWithUnit, resolveRecordUnit } from "../../utils/productUnits";
import { resolveRecordUnitPrice } from "../../utils/unitPriceSession";
import {
  getCompanyBrandingForDocuments,
  getCompanyProfile,
} from "../../utils/companyWorkspaceService";
import "./TransactionStatement.css";
import "./TransactionStatementIssueResultDialog.css";

function formatNum(value) {
  const num = Number(value);
  return Number.isFinite(num) && num !== 0 ? num.toLocaleString() : "";
}

function formatQtyNumberCell(qty) {
  const num = Number(qty);
  return Number.isFinite(num) && num !== 0 ? num.toLocaleString() : "";
}

function pickCompanyMasterValue(value, fallback, placeholders = []) {
  const text = String(value ?? "").trim();
  if (!text || placeholders.includes(text)) return fallback;
  return text;
}

function buildSupplierProfile(companyProfile = {}) {
  const master = companyProfile.companyMaster ?? {};
  return {
    regNo: pickCompanyMasterValue(master.businessNumber, NDK_SUPPLIER.regNo, ["000-00-00000"]),
    name: pickCompanyMasterValue(master.companyName, NDK_SUPPLIER.name, ["주식회사 NDK"]),
    representative: pickCompanyMasterValue(master.representative, NDK_SUPPLIER.representative, ["대표이사"]),
    address: pickCompanyMasterValue(master.address, NDK_SUPPLIER.address),
    businessType: pickCompanyMasterValue(master.businessType, NDK_SUPPLIER.businessType),
    businessItem: pickCompanyMasterValue(master.businessItem, NDK_SUPPLIER.businessItem),
    phone: pickCompanyMasterValue(master.phone, NDK_SUPPLIER.phone),
    fax: pickCompanyMasterValue(master.fax, NDK_SUPPLIER.fax),
  };
}

function RepresentativeSealCell({ name, showSeal, sealImage, signatureImage, showSignature = false }) {
  if (!showSeal) return name;

  return (
    <span className="ts-seal-cell-inner">
      <span className="ts-representative-name">{name}</span>
      {showSignature && signatureImage ? (
        <img className="ts-company-signature-image" src={signatureImage} alt="대표이사 서명" />
      ) : null}
      <span className="ts-seal-mark">
        <span className="ts-seal-label">(인)</span>
        {sealImage ? (
          <img className="ts-company-seal-image" src={sealImage} alt="회사 직인" />
        ) : (
          <span className="ts-company-seal" aria-hidden="true">
            印
          </span>
        )}
      </span>
    </span>
  );
}

function sealCellClassName(showSeal, signatureImage, showSignature = false) {
  return `ts-field-value ts-seal-cell${showSeal ? " has-seal" : ""}${showSeal && showSignature && signatureImage ? " has-signature" : ""}`;
}

/** 공급자/공급받는자 — 10열 그리드 (좌 공급자 + 우 공급받는자) */
function PartyInfoTable({ customer, supplier, showSeal, sealImage, signatureImage, totalAmount }) {
  return (
    <table className="ts-form-table ts-party-table">
      <colgroup>
        <col className="ts-col-side" />
        <col className="ts-col-label" />
        <col className="ts-col-value" />
        <col className="ts-col-label" />
        <col className="ts-col-value" />
        <col className="ts-col-side" />
        <col className="ts-col-label" />
        <col className="ts-col-value" />
        <col className="ts-col-label" />
        <col className="ts-col-value" />
      </colgroup>
      <tbody>
        <tr>
          <td rowSpan={5} className="ts-party-side-label">
            공급자
          </td>
          <td className="ts-field-label">등록번호</td>
          <td colSpan={3} className="ts-field-value">
            {supplier.regNo}
          </td>
          <td rowSpan={5} className="ts-party-side-label">
            공급받는자
          </td>
          <td className="ts-field-label">등록번호</td>
          <td colSpan={3} className="ts-field-value">
            {customer.regNo}
          </td>
        </tr>
        <tr className={showSeal ? "ts-seal-row" : undefined}>
          <td className="ts-field-label">상호</td>
          <td className="ts-field-value">{supplier.name}</td>
          <td className="ts-field-label">성명</td>
          <td className={sealCellClassName(showSeal, signatureImage, true)}>
            <RepresentativeSealCell
              name={supplier.representative}
              showSeal={showSeal}
              sealImage={sealImage}
              signatureImage={signatureImage}
              showSignature
            />
          </td>
          <td className="ts-field-label">상호</td>
          <td className="ts-field-value">{customer.name}</td>
          <td className="ts-field-label">성명</td>
          <td className="ts-field-value">
            <RepresentativeSealCell
              name={customer.representative}
              showSeal={false}
            />
          </td>
        </tr>
        <tr>
          <td className="ts-field-label">주소</td>
          <td colSpan={3} className="ts-field-value">
            {supplier.address}
          </td>
          <td className="ts-field-label">주소</td>
          <td colSpan={3} className="ts-field-value">
            {customer.address}
          </td>
        </tr>
        <tr>
          <td className="ts-field-label">업태</td>
          <td className="ts-field-value">{supplier.businessType}</td>
          <td className="ts-field-label">종목</td>
          <td className="ts-field-value">{supplier.businessItem}</td>
          <td className="ts-field-label">업태</td>
          <td className="ts-field-value">{customer.businessType}</td>
          <td className="ts-field-label">종목</td>
          <td className="ts-field-value">{customer.businessItem}</td>
        </tr>
        <tr>
          <td className="ts-field-label">전화</td>
          <td className="ts-field-value">{supplier.phone}</td>
          <td className="ts-field-label">FAX</td>
          <td className="ts-field-value">{supplier.fax}</td>
          <td className="ts-field-label">전화</td>
          <td className="ts-field-value">{customer.phone}</td>
          <td className="ts-field-label">FAX</td>
          <td className="ts-field-value">{customer.fax}</td>
        </tr>
        <tr className="ts-total-row">
          <td colSpan={2} className="ts-total-label">
            합 계 금 액
          </td>
          <td colSpan={8} className="ts-total-value">
            <span className="ts-total-amount-text">
              {totalAmount.toLocaleString()}원
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function StatementItemsTable({ itemRows, totals }) {
  return (
    <table className="ts-form-table ts-items-table">
      <colgroup>
        <col className="ts-i-no" />
        <col className="ts-i-part-no" />
        <col className="ts-i-part-name" />
        <col className="ts-i-unit" />
        <col className="ts-i-qty" />
        <col className="ts-i-price" />
        <col className="ts-i-supply" />
        <col className="ts-i-vat" />
        <col className="ts-i-total" />
        <col className="ts-i-note" />
      </colgroup>
      <thead>
        <tr>
          <th>NO.</th>
          <th>품번</th>
          <th>품명</th>
          <th>단위</th>
          <th>수량</th>
          <th>단가</th>
          <th>금액</th>
          <th>세액</th>
          <th>합계금액</th>
          <th>비고</th>
        </tr>
      </thead>
      <tbody>
        {itemRows.map((item, index) => (
          <tr key={index}>
            <td>{item ? index + 1 : ""}</td>
            <td className="left">{item?.partNo ?? ""}</td>
            <td className="left">{item?.partName ?? ""}</td>
            <td>{item?.unit ?? ""}</td>
            <td className="num">{formatQtyNumberCell(item?.qty)}</td>
            <td className="num">{formatNum(item?.unitPrice)}</td>
            <td className="num">{formatNum(item?.supplyAmount)}</td>
            <td className="num">{formatNum(item?.vat)}</td>
            <td className="num">{formatNum(item?.totalAmount)}</td>
            <td className="left">{item?.note ?? ""}</td>
          </tr>
        ))}
        <tr className="ts-items-footer">
          <td />
          <td colSpan={3} className="ts-receiver-cell">
            <div className="ts-receiver-row">
              <span className="ts-receiver-text">인수자 (인)</span>
              <span className="ts-receiver-signature-space" aria-hidden="true" />
            </div>
          </td>
          <td className="num">{formatQtyNumberCell(totals.qty)}</td>
          <td className="ts-subtotal-label">소계</td>
          <td className="num">{formatNum(totals.supplyAmount)}</td>
          <td className="num">{formatNum(totals.vat)}</td>
          <td className="num">{formatNum(totals.totalAmount)}</td>
          <td />
        </tr>
      </tbody>
    </table>
  );
}

function TransactionStatementSheet({
  copyLabel,
  issueDate,
  customer,
  lineItem,
  totals,
  supplier,
  supplierBranding,
  showSeal = false,
  highlightDate = false,
}) {
  const itemRows = buildStatementItemRows(lineItem);

  return (
    <section className={`ts-sheet${highlightDate ? " supplier-copy" : ""}`}>
      <div className="ts-sheet-top">
        <div className={`ts-issue-date${highlightDate ? " highlighted" : ""}`}>
          <span className="ts-issue-label">발행일자</span>
          <span className="ts-issue-value">{issueDate}</span>
        </div>
        <h1 className="ts-title">거 래 명 세 서</h1>
        <div className="ts-copy-box">
          {supplierBranding?.logo ? (
            <img className="ts-company-logo" src={supplierBranding.logo} alt="회사 로고" />
          ) : null}
          <p className="ts-copy-label">{copyLabel}</p>
        </div>
      </div>

      <div className="ts-form-block">
        <PartyInfoTable
          customer={customer}
          supplier={supplier}
          showSeal={showSeal}
          sealImage={supplierBranding?.stamp || ""}
          signatureImage={supplierBranding?.signature || ""}
          totalAmount={totals.totalAmount}
        />
        <StatementItemsTable itemRows={itemRows} totals={totals} />
      </div>
    </section>
  );
}

export default function TransactionStatementPreview({
  record,
  shipQty,
  shipQtyNumeric,
  amounts,
  unitPrice,
  issueDate,
}) {
  const companyProfile = getCompanyProfile();
  const companyBranding = getCompanyBrandingForDocuments(companyProfile);
  const supplierBranding = {
    logo: companyBranding.logo,
    stamp: companyBranding.stamp,
    signature: companyBranding.signature,
  };
  const supplier = buildSupplierProfile(companyProfile);
  const customer = getCustomerProfile(record.company);
  const unit = resolveRecordUnit(record);
  const qty = Number.isFinite(Number(shipQtyNumeric))
    ? Number(shipQtyNumeric)
    : parseQtyWithUnit(shipQty, unit).qty;

  const resolvedUnitPrice = Number(unitPrice) || resolveRecordUnitPrice(record);
  const lineItem = buildStatementLineItem(record, qty, resolvedUnitPrice, amounts, { unit });

  const totals = {
    qty: lineItem.qty,
    unit: lineItem.unit,
    supplyAmount: lineItem.supplyAmount,
    vat: lineItem.vat,
    totalAmount: lineItem.totalAmount,
  };

  return (
    <div className="ts-preview-wrap" aria-label="거래명세서 미리보기">
      <div className="ts-page">
        <div className="ts-customer-copy-block">
          <TransactionStatementSheet
            copyLabel="(공급받는자)"
            issueDate={issueDate}
            customer={customer}
            lineItem={lineItem}
            totals={totals}
            supplier={supplier}
            supplierBranding={supplierBranding}
            showSeal
          />
          {companyBranding.footerLines.length ? (
            <footer className="ts-document-footer" aria-label="문서 Footer">
              {companyBranding.footerLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </footer>
          ) : null}
        </div>
        <div className="ts-page-divider" aria-hidden="true" />
        <TransactionStatementSheet
          copyLabel="(공급자)"
          issueDate={issueDate}
          customer={customer}
          lineItem={lineItem}
          totals={totals}
          supplier={supplier}
          supplierBranding={supplierBranding}
          showSeal
          highlightDate
        />
      </div>
    </div>
  );
}

export function TransactionStatementIssueResultDialog({
  open,
  result,
  onPrintComplete,
  onPdfOnly,
  onViewHistory,
  onClose,
}) {
  if (!open || !result) return null;

  const statementId = result.statement?.id ?? "";

  return createPortal(
    <div className="ts-issue-result-overlay" role="presentation" onClick={onClose}>
      <div
        className="ts-issue-result-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="ts-issue-result-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="ts-issue-result-header">
          <CheckCircle2 size={22} aria-hidden="true" />
          <div>
            <h2 id="ts-issue-result-title">거래명세서가 발행되었습니다.</h2>
            <p>{statementId}</p>
          </div>
          <button type="button" className="ts-issue-result-close" onClick={onClose} aria-label="닫기">
            <X size={18} />
          </button>
        </header>

        <footer className="ts-issue-result-footer">
          {onViewHistory ? (
            <SecondaryButton type="button" onClick={onViewHistory}>
              출고 이력 보기
            </SecondaryButton>
          ) : null}
          <PrimaryButton type="button" onClick={onPrintComplete}>
            인쇄 완료
          </PrimaryButton>
          <SecondaryButton type="button" onClick={onPdfOnly}>
            PDF만 저장
          </SecondaryButton>
          <SecondaryButton type="button" onClick={onClose}>
            닫기
          </SecondaryButton>
        </footer>
      </div>
    </div>,
    document.body
  );
}
