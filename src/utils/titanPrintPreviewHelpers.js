import { getLastOutboundShipQty } from "./outboundRegistration";
import { getCurrentUnitPrice, calculateAmounts } from "./unitPriceSession";
import { formatQtyWithUnit } from "./productUnits";
import { getPrintOutputDate } from "./titanPrintDates";

export function buildTransactionStatementPrintProps(record, options = {}) {
  if (!record) return null;

  const shipQtyNumeric = Number(options.shipQty) || getLastOutboundShipQty(record);
  const shipQty = formatQtyWithUnit(shipQtyNumeric, record.unit || "EA");
  const issueDate = options.issueDate || getPrintOutputDate();
  const unitPrice = getCurrentUnitPrice(record.company, record.partNo);
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
