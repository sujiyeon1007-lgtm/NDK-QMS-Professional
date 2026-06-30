import { getCurrentUnitPrice, calculateAmounts } from "./unitPriceSession";
import { getOutboundShipQty } from "./outboundManagementStatus";
import { getJournalReferenceDate } from "./workJournalData";

export function buildTransactionStatementPrintProps(record) {
  if (!record) return null;

  const shipQty = getOutboundShipQty(record);
  const issueDate = getJournalReferenceDate();
  const unitPrice = getCurrentUnitPrice(record.company, record.partNo);
  const amounts = calculateAmounts(shipQty, unitPrice);

  return {
    record,
    shipQty,
    amounts,
    unitPrice,
    issueDate,
  };
}

export async function runTitanPrintExport(handler, documentEl, setBusy) {
  if (!documentEl || !handler) return;
  setBusy?.(true);
  try {
    await handler(documentEl);
  } finally {
    setBusy?.(false);
  }
}
