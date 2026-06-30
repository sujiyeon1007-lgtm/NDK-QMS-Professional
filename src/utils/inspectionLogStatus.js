/**
 * Project TITAN V1.0 — 검사일지 리스트 · 상태 · 검색
 */

import { matchesBasicSearch } from "../config/listSearchStandard";
import { getProductionProcessName } from "../config/productionProcessCodes";
import { formatQtyWithUnit } from "./productUnits";
import { getSessionProductionRecords } from "./productionRecords";

export const INSPECTION_LOG_STATUS_LABELS = {
  PASS: "합격",
  FAIL: "불합격",
  HOLD: "보류",
};

export function getInspectionLogDisplayStatus(log) {
  if (log.judgment === "합격") return { label: INSPECTION_LOG_STATUS_LABELS.PASS, variant: "complete" };
  if (log.judgment === "불합격") return { label: INSPECTION_LOG_STATUS_LABELS.FAIL, variant: "defect" };
  return { label: INSPECTION_LOG_STATUS_LABELS.HOLD, variant: "wait" };
}

function resolveProcessName(log) {
  if (log.process?.trim()) return log.process.trim();
  const record = getSessionProductionRecords().find((item) => item.id === log.managementId);
  return record ? getProductionProcessName(record) : "—";
}

export function mapInspectionLogToListRow(log) {
  const status = getInspectionLogDisplayStatus(log);
  return {
    id: log.id,
    managementId: log.managementId || "—",
    lotNo: log.lotNo?.trim() || "—",
    company: log.company || "—",
    partName: log.partName || "—",
    partNo: log.partNo || "—",
    material: log.material || "—",
    qty: formatQtyWithUnit(log.qty, log.unit),
    processName: resolveProcessName(log),
    inspectionDate: log.inspectionDate || "—",
    statusLabel: status.label,
    statusVariant: status.variant,
    registeredDate: log.createdAt?.slice(0, 10) || "—",
    assignee: log.assignee || "—",
    log,
  };
}

export function matchesInspectionLogSearch(row, search) {
  const log = row.log;
  if (!matchesBasicSearch(search, log)) return false;

  if (
    search.managementId &&
    !String(log.managementId ?? "")
      .toLowerCase()
      .includes(search.managementId.toLowerCase())
  ) {
    return false;
  }
  if (
    search.lotNo &&
    !String(log.lotNo ?? "")
      .toLowerCase()
      .includes(search.lotNo.toLowerCase())
  ) {
    return false;
  }
  if (search.process && row.processName !== search.process) return false;
  if (search.inspectionDateFrom && log.inspectionDate < search.inspectionDateFrom) return false;
  if (search.inspectionDateTo && log.inspectionDate > search.inspectionDateTo) return false;
  if (search.assignee && !String(log.assignee ?? "").includes(search.assignee)) return false;
  if (search.status && row.statusLabel !== search.status) return false;
  return true;
}
