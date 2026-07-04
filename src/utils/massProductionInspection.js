/**
 * Project TITAN V1.3 — 양산검사 리스트 (생산완료 + 검사일지 병합)
 */

import { matchesBasicSearch } from "../config/listSearchStandard";
import { getProductionProcessName } from "../config/productionProcessCodes";
import { MASS_INSPECTION_STATUS } from "../config/inspectionManagement";
import { getInspectionLogs } from "./inspectionLogSession";
import { isProductionComplete } from "./productionComplete";
import { formatQtyWithUnit } from "./productUnits";
import { getSessionProductionRecords } from "./productionRecords";

function resolveProductionCompleteDate(record) {
  const raw =
    record.productionCompletedAt ||
    record.productionEndAt ||
    record.productionWorkLog?.completedAt ||
    record.productionWorkLog?.endAt ||
    "";
  return raw ? String(raw).slice(0, 10) : "—";
}

function buildMassLogIndex(logs = getInspectionLogs()) {
  /** @type {Map<string, object>} */
  const index = new Map();
  logs
    .filter((log) => log.category === "양산" && log.managementId?.trim())
    .forEach((log) => {
      const key = log.managementId.trim();
      const existing = index.get(key);
      if (!existing || String(log.createdAt) > String(existing.createdAt)) {
        index.set(key, log);
      }
    });
  return index;
}

export function getMassProductionInspectionRows() {
  const logIndex = buildMassLogIndex();
  return getSessionProductionRecords()
    .filter(isProductionComplete)
    .map((record) => {
      const log = logIndex.get(record.id) ?? null;
      const hasLog = Boolean(log);
      return {
        id: log?.id ?? record.id,
        rowKey: log?.id ?? `prod-${record.id}`,
        managementId: record.id,
        lotNo: record.lotNo?.trim() || log?.lotNo?.trim() || "—",
        customerLotNo:
          record.customerLotNo?.trim() ||
          record.purchaseOrderNo?.trim() ||
          log?.customerLotNo?.trim() ||
          log?.purchaseOrderNo?.trim() ||
          "—",
        company: record.company || "—",
        partName: record.partName || "—",
        partNo: record.partNo || "—",
        material: record.material || "—",
        qty: formatQtyWithUnit(record.qty, record.unit),
        processName: getProductionProcessName(record),
        inspectionDate: log?.inspectionDate || "—",
        statusLabel: hasLog ? MASS_INSPECTION_STATUS.DONE : MASS_INSPECTION_STATUS.WAIT,
        statusVariant: hasLog ? "complete" : "wait",
        registeredDate: log?.createdAt?.slice(0, 10) || resolveProductionCompleteDate(record),
        inspectionStatus: hasLog ? MASS_INSPECTION_STATUS.DONE : MASS_INSPECTION_STATUS.WAIT,
        inspectionStatusVariant: hasLog ? "complete" : "wait",
        assignee: log?.assignee || record.registrar || "—",
        note: log?.note || "",
        logId: log?.id ?? null,
        record,
        log,
      };
    })
    .sort((a, b) => b.registeredDate.localeCompare(a.registeredDate));
}

export function matchesMassProductionInspectionSearch(row, search) {
  if (!matchesBasicSearch(search, row)) return false;
  if (search.managementId && !String(row.managementId).includes(search.managementId.trim())) {
    return false;
  }
  if (search.lotNo && !String(row.lotNo).includes(search.lotNo.trim())) return false;
  if (search.status && row.statusLabel !== search.status.trim()) return false;
  if (search.assignee && !String(row.assignee).includes(search.assignee.trim())) return false;
  if (
    search.registeredDateFrom &&
    row.registeredDate !== "—" &&
    row.registeredDate < search.registeredDateFrom
  ) {
    return false;
  }
  if (
    search.registeredDateTo &&
    row.registeredDate !== "—" &&
    row.registeredDate > search.registeredDateTo
  ) {
    return false;
  }
  if (search.note && !String(row.note ?? "").includes(search.note.trim())) return false;
  if (search.customerLotNo?.trim()) {
    const query = search.customerLotNo.trim().toLowerCase();
    const merged = String(row.customerLotNo ?? "").toLowerCase();
    const po = String(row.record?.purchaseOrderNo ?? row.log?.purchaseOrderNo ?? "").toLowerCase();
    if (!merged.includes(query) && !po.includes(query)) return false;
  }
  if (search.purchaseOrderNo?.trim()) {
    const query = search.purchaseOrderNo.trim().toLowerCase();
    const merged = String(row.customerLotNo ?? "").toLowerCase();
    const po = String(row.record?.purchaseOrderNo ?? row.log?.purchaseOrderNo ?? "").toLowerCase();
    if (!merged.includes(query) && !po.includes(query)) return false;
  }
  return true;
}
