import {
  NDK_SUPPLIER,
  buildStatementItemRows,
  getCustomerProfile,
} from "../../utils/transactionStatementConfig";
import { formatQtyWithUnit, parseQtyWithUnit } from "../../utils/productUnits";
import "./TransactionStatement.css";

function formatNum(value) {
  const num = Number(value);
  return Number.isFinite(num) && num !== 0 ? num.toLocaleString() : "";
}

function formatQtyCell(qty, unit = "EA") {
  const num = Number(qty);
  if (!Number.isFinite(num) || num === 0) return "";
  return formatQtyWithUnit(num, unit);
}

/** 공급받는자/공급자 — 10열 그리드 (좌 5 + 우 5) */
function PartyInfoTable({ customer, supplier, showSeal, totalAmount }) {
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
            공급받는자
          </td>
          <td className="ts-field-label">등록번호</td>
          <td colSpan={3} className="ts-field-value">
            {customer.regNo}
          </td>
          <td rowSpan={5} className="ts-party-side-label">
            공급자
          </td>
          <td className="ts-field-label">등록번호</td>
          <td colSpan={3} className="ts-field-value">
            {supplier.regNo}
          </td>
        </tr>
        <tr>
          <td className="ts-field-label">상호</td>
          <td className="ts-field-value">{customer.name}</td>
          <td className="ts-field-label">성명</td>
          <td className="ts-field-value">{customer.representative}</td>
          <td className="ts-field-label">상호</td>
          <td className="ts-field-value">{supplier.name}</td>
          <td className="ts-field-label">성명</td>
          <td className={`ts-field-value${showSeal ? " has-seal" : ""}`}>
            {supplier.representative}
            {showSeal && <span className="ts-company-seal" aria-hidden="true">印</span>}
          </td>
        </tr>
        <tr>
          <td className="ts-field-label">주소</td>
          <td colSpan={3} className="ts-field-value">
            {customer.address}
          </td>
          <td className="ts-field-label">주소</td>
          <td colSpan={3} className="ts-field-value">
            {supplier.address}
          </td>
        </tr>
        <tr>
          <td className="ts-field-label">업태</td>
          <td className="ts-field-value">{customer.businessType}</td>
          <td className="ts-field-label">종목</td>
          <td className="ts-field-value">{customer.businessItem}</td>
          <td className="ts-field-label">업태</td>
          <td className="ts-field-value">{supplier.businessType}</td>
          <td className="ts-field-label">종목</td>
          <td className="ts-field-value">{supplier.businessItem}</td>
        </tr>
        <tr>
          <td className="ts-field-label">전화</td>
          <td className="ts-field-value">{customer.phone}</td>
          <td className="ts-field-label">FAX</td>
          <td className="ts-field-value">{customer.fax}</td>
          <td className="ts-field-label">전화</td>
          <td className="ts-field-value">{supplier.phone}</td>
          <td className="ts-field-label">FAX</td>
          <td className="ts-field-value">{supplier.fax}</td>
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
        <col className="ts-i-part-name" />
        <col className="ts-i-part-no" />
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
          <th>품명</th>
          <th>품번</th>
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
            <td className="left">{item?.partName ?? ""}</td>
            <td className="left">{item?.partNo ?? ""}</td>
            <td className="num">{formatQtyCell(item?.qty, item?.unit)}</td>
            <td className="num">{formatNum(item?.unitPrice)}</td>
            <td className="num">{formatNum(item?.supplyAmount)}</td>
            <td className="num">{formatNum(item?.vat)}</td>
            <td className="num">{formatNum(item?.totalAmount)}</td>
            <td className="left">{item?.note ?? ""}</td>
          </tr>
        ))}
        <tr className="ts-items-footer">
          <td />
          <td className="ts-receiver-label">인수자</td>
          <td className="ts-receiver-sign">( 인 )</td>
          <td className="num">{formatQtyCell(totals.qty, totals.unit)}</td>
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
        <p className="ts-copy-label">{copyLabel}</p>
      </div>

      <div className="ts-form-block">
        <PartyInfoTable
          customer={customer}
          supplier={NDK_SUPPLIER}
          showSeal={showSeal}
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
  const customer = getCustomerProfile(record.company);
  const unit = record.unit ?? "EA";
  const qty = Number.isFinite(Number(shipQtyNumeric))
    ? Number(shipQtyNumeric)
    : parseQtyWithUnit(shipQty, unit).qty;

  const lineItem = {
    partNo: record.partNo ?? "",
    partName: record.partName ?? "",
    unit,
    qty,
    unitPrice: Number(unitPrice) || 0,
    supplyAmount: amounts.supplyAmount,
    vat: amounts.vat,
    totalAmount: amounts.totalAmount,
    note: record.drawingNo ? `도번 ${record.drawingNo}` : "",
  };

  const totals = {
    qty: lineItem.qty,
    unit: lineItem.unit,
    supplyAmount: amounts.supplyAmount,
    vat: amounts.vat,
    totalAmount: amounts.totalAmount,
  };

  return (
    <div className="ts-preview-wrap" aria-label="거래명세서 미리보기">
      <div className="ts-page">
        <TransactionStatementSheet
          copyLabel="(공급받는자)"
          issueDate={issueDate}
          customer={customer}
          lineItem={lineItem}
          totals={totals}
        />
        <div className="ts-page-divider" aria-hidden="true" />
        <TransactionStatementSheet
          copyLabel="(공급자)"
          issueDate={issueDate}
          customer={customer}
          lineItem={lineItem}
          totals={totals}
          showSeal
          highlightDate
        />
      </div>
    </div>
  );
}
