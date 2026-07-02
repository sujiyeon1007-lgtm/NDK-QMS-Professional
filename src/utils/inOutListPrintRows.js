import { getIncomingQty } from "./inventory";
import { getSessionProductionRecords } from "./productionRecords";
import { parseQtyWithUnit } from "./productUnits";
import { getPrintOutputDate, toCompactPrintDate } from "./titanPrintDates";
import { generateHtlNo, generateOutboundListNo, resolveHtlNoForPrintRows } from "./titanWorkflowStatus";

/** @typedef {{ no: number, managementId: string, company: string, partName: string, partNo: string, material: string, qty: number, unit: string, note: string, lotNo: string, incomingDate: string }} InOutPrintRow */

function resolvePrintQty(record, row, options = {}) {
  if (typeof options.resolveQty === "function") {
    return Number(options.resolveQty(record, row)) || 0;
  }
  return getIncomingQty(record);
}

function resolvePrintUnit(record, row, options = {}) {
  if (typeof options.resolveUnit === "function") {
    return options.resolveUnit(record, row) || "EA";
  }
  if (record.unit) return record.unit;
  return parseQtyWithUnit(row.qty, record.unit).unit;
}

/**
 * @param {Array<{ record?: object, company?: string, partName?: string, partNo?: string, material?: string, qty?: number, unit?: string, lotNo?: string, note?: string }>} rows
 * @param {{ resolveQty?: (record: object, row: object) => number, resolveUnit?: (record: object, row: object) => string }} [options]
 * @returns {InOutPrintRow[]}
 */
export function mapStandardRowsToInOutPrintRows(rows = [], options = {}) {
  return rows.map((row, index) => {
    const record = row.record ?? row;
    return {
      no: index + 1,
      managementId: row.managementId ?? record.id ?? "",
      company: row.company ?? record.company ?? "",
      partName: row.partName ?? record.partName ?? "",
      partNo: row.partNo ?? record.partNo ?? "",
      material: row.material ?? record.material ?? "",
      qty: resolvePrintQty(record, row, options),
      unit: resolvePrintUnit(record, row, options),
      note: record.note ?? row.note ?? "",
      lotNo: row.lotNo ?? record.lotNo ?? "",
      incomingDate: row.incomingDate ?? record.incomingDate ?? "",
    };
  });
}

/** @deprecated — HTL/OUT sequential format via generateHtlNo / generateOutboundListNo */
export function buildInOutListNo(prefix = "HTL", outputDate = getPrintOutputDate()) {
  if (prefix === "HTL") {
    return generateHtlNo(getSessionProductionRecords(), outputDate);
  }
  if (prefix === "OUT") {
    return generateOutboundListNo(getSessionProductionRecords(), outputDate);
  }
  const compactDate = toCompactPrintDate(outputDate) || toCompactPrintDate(getPrintOutputDate());
  const now = new Date();
  const time = `${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
  return `${prefix}-${compactDate}-${time}`;
}

function resolveIncomingDate(rows = []) {
  const dates = rows
    .map((row) => row.incomingDate?.trim())
    .filter(Boolean)
    .sort();
  if (dates.length === 0) return "";
  if (dates[0] === dates[dates.length - 1]) return dates[0];
  return `${dates[0]} ~ ${dates[dates.length - 1]}`;
}

/**
 * @param {Array<object>} rows
 * @param {{ listNoPrefix?: string, workDate?: string, workMemo?: string, records?: object[], printMode?: string, resolveQty?: Function, resolveUnit?: Function, outputDate?: string }} [options]
 */
export function buildInOutListPrintProps(rows = [], options = {}) {
  const {
    listNoPrefix = "HTL",
    workDate = "",
    workMemo = "",
    records = getSessionProductionRecords(),
    printMode = "first",
    resolveQty,
    resolveUnit,
    outputDate = workDate || getPrintOutputDate(),
  } = options;
  const printRows = mapStandardRowsToInOutPrintRows(rows, { resolveQty, resolveUnit });
  const resolvedOutputDate = outputDate || getPrintOutputDate();
  const listNo =
    listNoPrefix === "HTL"
      ? resolveHtlNoForPrintRows(rows, records, resolvedOutputDate)
      : listNoPrefix === "OUT"
        ? generateOutboundListNo(records, resolvedOutputDate)
        : buildInOutListNo(listNoPrefix, resolvedOutputDate);
  const incomingDate = resolveIncomingDate(printRows);

  return {
    rows: printRows,
    listNo,
    incomingDate,
    printDate: resolvedOutputDate,
    outputDate: resolvedOutputDate,
    workDate: resolvedOutputDate,
    workMemo,
    printMode,
  };
}
