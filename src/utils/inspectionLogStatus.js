/**
 * Project TITAN V1.0 — 검사일지 리스트 · 상태 · 검색
 */

import { matchesBasicSearch } from "../config/listSearchStandard";
import { getProductionProcessName } from "../config/productionProcessCodes";
import { matchesInboundDataSearch } from "./inboundDataFields";
import { MENU_TASK_STATUS } from "./menuWorkflowGate";
import { mapV13ProductListRow } from "./processFlow";
import { formatQtyWithUnit } from "./productUnits";
import { getSessionProductionRecords } from "./productionRecords";
import {
  getMassInspectionManagementStatus,
} from "./workflowProcessStatus";
export const INSPECTION_LOG_STATUS_LABELS = {
  PASS: "합격",
  FAIL: "불합격",
  HOLD: "보류",
};

export function getInspectionLogDisplayStatus(log) {
  return getMassInspectionManagementStatus(log);
}

function resolveHeatTreatmentProcess(log) {
  if (log.process?.trim()) return log.process.trim();
  const record = getSessionProductionRecords().find((item) => item.id === log.managementId);
  return record ? getProductionProcessName(record) : "—";
}

export function mapInspectionLogToListRow(log) {
  const status = getInspectionLogDisplayStatus(log);
  const record = getSessionProductionRecords().find((item) => item.id === log.managementId);
  const purchaseOrderNo = log.purchaseOrderNo || record?.purchaseOrderNo || "";
  const customerLotNo = log.customerLotNo || record?.customerLotNo || "";
  const heatTreatmentProcess = resolveHeatTreatmentProcess(log);
  const v13 = record
    ? mapV13ProductListRow(record, status, { screenKey: "inspection" })
    : {
        id: log.id,
        incomingDate: log.createdAt?.slice(0, 10) || "—",
        productionDate: log.inspectionDate || "—",
        lotNo: log.lotNo?.trim() || "—",
        company: log.company || "—",
        partName: log.partName || "—",
        partNo: log.partNo || "—",
        inboundQtyLabel: formatQtyWithUnit(log.qty, log.unit),
        workQtyLabel: formatQtyWithUnit(log.qty, log.unit),
        currentProcess: "—",
        workflowProcess: "—",
        workflowStatus: status.label,
        remark: log.note?.trim() || "—",
        statusLabel: status.label,
        statusVariant: status.variant,
        record: record ?? log,
      };
  return {
    ...v13,
    id: log.id,
    screenKey: "inspection",
    managementId: log.managementId || "—",
    purchaseOrderNo: purchaseOrderNo || "—",
    customerLotNo: customerLotNo || "—",
    material: log.material || record?.material || "—",
    qty: formatQtyWithUnit(log.qty, log.unit),
    heatTreatmentProcess,
    processName: heatTreatmentProcess,
    inspectionDate: log.inspectionDate || "—",
    registeredDate: log.createdAt?.slice(0, 10) || "—",
    assignee: log.assignee || "—",
    log,
  };
}
export function matchesInspectionLogSearch(row, search) {
  const log = row.log;
  const record = getSessionProductionRecords().find((item) => item.id === log.managementId);
  const merged = {
    ...log,
    purchaseOrderNo: log.purchaseOrderNo || record?.purchaseOrderNo,
    customerLotNo: log.customerLotNo || record?.customerLotNo,
    lotNo: log.lotNo || record?.lotNo,
    managementId: log.managementId || record?.id,
  };
  if (!matchesBasicSearch(search, merged)) return false;
  if (!matchesInboundDataSearch(search, merged)) return false;
  if (search.process && row.processName !== search.process) return false;
  if (search.productionDateFrom && log.inspectionDate < search.productionDateFrom) return false;
  if (search.productionDateTo && log.inspectionDate > search.productionDateTo) return false;
  if (search.incomingDateFrom && row.incomingDate < search.incomingDateFrom) return false;
  if (search.incomingDateTo && row.incomingDate > search.incomingDateTo) return false;
  if (search.qty && !String(log.qty ?? "").includes(search.qty)) return false;
  if (search.note && !String(log.note ?? "").includes(search.note)) return false;
  if (search.inspectionDateFrom && log.inspectionDate < search.inspectionDateFrom) return false;
  if (search.inspectionDateTo && log.inspectionDate > search.inspectionDateTo) return false;
  if (search.assignee && !String(log.assignee ?? "").includes(search.assignee)) return false;
  if (search.status && row.statusLabel !== search.status) return false;
  if (
    search.__chipInspectNotDone &&
    row.statusLabel !== MENU_TASK_STATUS.INSPECT_NOT_DONE
  ) {
    return false;
  }
  if (search.__chipInspectDone && row.statusLabel !== MENU_TASK_STATUS.INSPECT_DONE) {
    return false;
  }
  return true;
}
