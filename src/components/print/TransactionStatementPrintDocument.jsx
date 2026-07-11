import TransactionStatementPreview from "../transactionStatement/TransactionStatementPreview";

/** 거래명세서 전용 출력 문서 — 입출고 리스트 Preview와 분리 */
function TransactionStatementPrintDocument({
  record,
  shipQty,
  shipQtyNumeric,
  amounts,
  unitPrice,
  issueDate,
}) {
  if (!record) return null;

  return (
    <div className="titan-print-document transaction-statement-print titan-print--portrait" aria-label="거래명세서">
      <TransactionStatementPreview
        record={record}
        shipQty={shipQty}
        shipQtyNumeric={shipQtyNumeric}
        amounts={amounts}
        unitPrice={unitPrice}
        issueDate={issueDate}
      />
    </div>
  );
}

export default TransactionStatementPrintDocument;
