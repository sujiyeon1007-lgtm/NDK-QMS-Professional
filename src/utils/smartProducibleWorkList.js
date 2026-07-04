/**
 * Project TITAN V1.1 — Smart 생산 가능 목록
 * 금일 입고(🟢) + 기존 재고(🔵) · 설비 공정 일치 품목만
 *
 * 제품 공정: record.heatTreatment (입고 시 제품관리 process 반영)
 */

import { SMART_PRODUCIBLE_SOURCES } from "../config/titanV11Workflow";
import { getProductionProcessName } from "../config/productionProcessCodes";
import { getStockQty } from "./inventory";
import { getPrintOutputDate } from "./titanPrintDates";
import { getSessionProductionRecords } from "./productionRecords";
import { getPendingDailyReportWorkRequests } from "./titanWorkflowStatus";

export const PRODUCIBLE_SOURCE = {
  TODAY_INBOUND: "todayInbound",
  EXISTING_STOCK: "existingStock",
};

function matchesEquipmentProcess(record, equipmentProcess) {
  const process = String(equipmentProcess ?? "").trim();
  if (!process) return false;
  return getProductionProcessName(record) === process;
}

function isPendingDailyReport(record) {
  return getPendingDailyReportWorkRequests([record]).length > 0;
}

/**
 * @param {{ process: string, code?: string, name?: string }} equipmentContext
 * @param {object[]} [records]
 * @param {string} [referenceDate] — 금일 기준 (YYYY-MM-DD)
 */
export function buildSmartProducibleWorkList(
  equipmentContext,
  records = getSessionProductionRecords(),
  referenceDate = getPrintOutputDate()
) {
  if (!equipmentContext?.process) return [];

  const process = equipmentContext.process;
  const today = referenceDate;
  /** @type {Map<string, { record: object, source: string }>} */
  const merged = new Map();

  for (const record of records) {
    if (!record?.incomingRegistered) continue;
    if (!matchesEquipmentProcess(record, process)) continue;

    const incomingDate = String(record.incomingDate ?? "").trim();
    const stockQty = getStockQty(record);
    const pending = isPendingDailyReport(record);

    if (pending && incomingDate === today) {
      merged.set(record.id, { record, source: PRODUCIBLE_SOURCE.TODAY_INBOUND });
      continue;
    }

    if (pending && incomingDate && incomingDate !== today) {
      merged.set(record.id, { record, source: PRODUCIBLE_SOURCE.EXISTING_STOCK });
      continue;
    }

    if (stockQty > 0 && pending) {
      merged.set(record.id, { record, source: PRODUCIBLE_SOURCE.EXISTING_STOCK });
    }
  }

  return [...merged.values()].sort((a, b) => {
    if (a.source !== b.source) {
      return a.source === PRODUCIBLE_SOURCE.TODAY_INBOUND ? -1 : 1;
    }
    return String(b.record.incomingDate ?? "").localeCompare(String(a.record.incomingDate ?? ""));
  });
}

export function getProducibleSourceMeta(source) {
  return SMART_PRODUCIBLE_SOURCES[source] ?? SMART_PRODUCIBLE_SOURCES.existingStock;
}

export function countProducibleBySource(items = []) {
  return items.reduce(
    (acc, item) => {
      if (item.source === PRODUCIBLE_SOURCE.TODAY_INBOUND) acc.todayInbound += 1;
      else acc.existingStock += 1;
      return acc;
    },
    { todayInbound: 0, existingStock: 0, total: items.length }
  );
}
