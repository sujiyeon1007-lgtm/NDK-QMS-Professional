import { getJournalReferenceDate } from "./workJournalData";
import { getSessionProductionRecords } from "./productionRecords";
import { generateHtlNo, resolveHtlNoForPrintRows } from "./titanWorkflowStatus";

/** @typedef {{ no: number, managementId: string, company: string, partName: string, partNo: string, material: string, qty: number, unit: string, note: string, lotNo: string, incomingDate: string }} InOutPrintRow */

/**
 * @param {Array<{ record?: object, company?: string, partName?: string, partNo?: string, material?: string, qty?: number, unit?: string, lotNo?: string, note?: string }>} rows
 * @returns {InOutPrintRow[]}
 */
export function mapStandardRowsToInOutPrintRows(rows = []) {
  return rows.map((row, index) => {
    const record = row.record ?? row;
    return {
      no: index + 1,
      managementId: row.managementId ?? record.id ?? "",
      company: row.company ?? record.company ?? "",
      partName: row.partName ?? record.partName ?? "",
      partNo: row.partNo ?? record.partNo ?? "",
      material: row.material ?? record.material ?? "",
      qty: Number(row.qty ?? record.qty) || 0,
      unit: row.unit ?? record.unit ?? "EA",
      note: record.note ?? row.note ?? "",
      lotNo: row.lotNo ?? record.lotNo ?? "",
      incomingDate: row.incomingDate ?? record.incomingDate ?? "",
    };
  });
}

/** @deprecated generateHtlNo() — HTL-YYYYMMDD-NNN sequential format */
export function buildInOutListNo(prefix = "HTL") {
  if (prefix !== "HTL") {
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, "");
    const time = `${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
    return `${prefix}-${date}-${time}`;
  }
  return generateHtlNo();
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
 * @param {{ listNoPrefix?: string, workDate?: string, workMemo?: string, records?: object[] }} [options]
 */
export function buildInOutListPrintProps(rows = [], options = {}) {
  const {
    listNoPrefix = "HTL",
    workDate = "",
    workMemo = "",
    records = getSessionProductionRecords(),
    printMode = "first",
  } = options;
  const printRows = mapStandardRowsToInOutPrintRows(rows);
  const resolvedWorkDate = workDate || getJournalReferenceDate();
  const listNo =
    listNoPrefix === "HTL" ? resolveHtlNoForPrintRows(rows, records) : buildInOutListNo(listNoPrefix);
  const incomingDate = resolveIncomingDate(printRows);

  return {
    rows: printRows,
    listNo,
    incomingDate,
    printDate: resolvedWorkDate,
    outputDate: resolvedWorkDate,
    workDate: resolvedWorkDate,
    workMemo,
    printMode,
  };
}
