import { getLastOutboundShipQty } from "./outboundRegistration";
import { resolveRecordUnitPrice, calculateAmounts } from "./unitPriceSession";
import { formatQtyWithUnit, resolveRecordUnit } from "./productUnits";
import { getPrintOutputDate } from "./titanPrintDates";

export function buildTransactionStatementPrintProps(record, options = {}) {
  if (!record) return null;

  const shipQtyNumeric = Number(options.shipQty) || getLastOutboundShipQty(record);
  const unit = resolveRecordUnit(record);
  const shipQty = formatQtyWithUnit(shipQtyNumeric, unit);
  const issueDate = options.issueDate || getPrintOutputDate();
  const unitPrice = resolveRecordUnitPrice(record);
  const amounts = calculateAmounts(shipQtyNumeric, unitPrice);

  return {
    record,
    shipQty,
    shipQtyNumeric,
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
