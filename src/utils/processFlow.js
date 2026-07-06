/**
 * Project TITAN V1.0 — 공정 흐름도 (전 화면 공통)
 */

import { CERTIFICATE_STATUS } from "./ndkWorkflow";
import { getProductionProcessName } from "../config/productionProcessCodes";
import {
  applyScreenWorkflowFields,
  applyRecordCurrentProcessFields,
  resolveRecordCurrentProcess,
} from "./workflowProcessStatus";

/** @typedef {'done' | 'active' | 'pending'} ProcessFlowState */

/** @type {{ id: string, label: string }[]} */
export const PROCESS_FLOW_STEPS = [
  { id: "incoming", label: "입고 등록" },
  { id: "work-order", label: "작업지시서 출력" },
  { id: "handoff", label: "생산부 전달" },
  { id: "lot", label: "LOT 작성" },
  { id: "schedule", label: "생산 예정일" },
  { id: "progress", label: "생산 진행" },
  { id: "done", label: "생산 완료" },
  { id: "daily-report", label: "열처리일보 등록" },
  { id: "inspection", label: "검사일지" },
  { id: "certificate", label: "엑셀 / PDF 등록" },
  { id: "ship-register", label: "출고 등록" },
  { id: "ship-done", label: "출고 완료" },
];

export const PROCESS_FLOW_PANEL_TITLE = "공정 흐름도";

/** @deprecated PROCESS_FLOW_PANEL_TITLE 사용 */
export const PROCESS_FLOW_PANEL_TITLE_LEGACY = "공정 흐름표";

/**
 * @param {object | null | undefined} record
 * @param {string | undefined} statusLabel
 */
function resolveCurrentStepIndex(record, statusLabel) {
  if (!record && statusLabel) {
    const statusOnlyMap = {
      "입고 등록": 0,
      "생산대기": 3,
      "생산진행": 5,
      "생산 진행": 5,
      "생산 완료": 6,
      "검사진행": 8,
      "성적서대기": 9,
      "출고대기": 10,
      "출고등록": 10,
      "부분출고": 10,
      "출고 대기": 10,
    };
    return statusOnlyMap[statusLabel] ?? 0;
  }

  if (!record) return 0;

  if (record.shipmentStatus === "출고완료" || statusLabel === "출고 완료") {
    return 11;
  }

  if (
    record.certificateStatus === CERTIFICATE_STATUS.ISSUED &&
    statusLabel === "출고 대기"
  ) {
    return 10;
  }

  if (record.certificateStatus === CERTIFICATE_STATUS.ISSUED || statusLabel === "성적서대기") {
    return 9;
  }

  if (statusLabel === "검사진행") {
    return 8;
  }

  if (record.completionStatus === "생산완료" || statusLabel === "생산 완료" || statusLabel === "검사대기") {
    return 6;
  }

  if (record.htlNo || record.workSheetGenerated || record.lotNo?.trim()) {
    if (!record.lotNo?.trim()) return 3;
    if (!record.workDate && !record.dueDate) return 4;
    if (!record.registered) return 5;
    return 7;
  }

  if (record.workSheetGenerated) return 1;
  return 0;
}

/**
 * @param {object | null | undefined} record
 * @param {string | undefined} statusLabel
 */
export function getProcessFlowSteps(record, statusLabel) {
  const currentIndex = resolveCurrentStepIndex(record, statusLabel);

  return PROCESS_FLOW_STEPS.map((step, index) => ({
    ...step,
    desc: index < currentIndex ? "완료" : index === currentIndex ? "진행 중" : "대기",
    state: index < currentIndex ? "done" : index === currentIndex ? "active" : "pending",
  }));
}

export function getProcessFlowStepsByStatus(statusLabel) {
  return getProcessFlowSteps(null, statusLabel);
}

/** @param {object} record */
export function getProcessFlowStepsForRecord(record, statusLabel) {
  return getProcessFlowSteps(record, statusLabel);
}

/** @param {object} record */
export function formatStandardQty(record) {
  return `${record.qty ?? 0} ${record.unit || "EA"}`;
}

/** @param {object} record */
export function formatStandardWorkDate(record) {
  return record.workDate || record.dueDate || record.incomingDate || "—";
}

/** @param {object} record */
export function formatStandardRegisteredDate(record) {
  return record.incomingDate || "—";
}

/** @param {object} record */
export function formatProductionDate(record) {
  return (
    record.workDate ||
    record.productionCompleteDate ||
    (record.lotCreatedAt ? String(record.lotCreatedAt).slice(0, 10) : "") ||
    "—"
  );
}

/** @param {object} record */
export function formatInboundQtyLabel(record) {
  return formatStandardQty(record);
}

/** @param {object} record @param {{ workQty?: number }} [options] */
export function formatWorkQtyLabel(record, options = {}) {
  const qty =
    options.workQty ??
    record.workQty ??
    record.completedQty ??
    (record.registered || record.lotNo?.trim() ? record.qty : 0);
  return `${qty ?? 0} ${record.unit || "EA"}`;
}

/** @param {object} record @param {{ label: string, variant: string }} status @param {{ workQty?: number, screenKey?: string }} [options] */
export function mapV13ProductListRow(record, status, options = {}) {
  const base = mapStandardProductListRow(record, status);
  const heatTreatmentProcess = base.processName;
  const { screenKey } = options;
  const row = applyRecordCurrentProcessFields(
    {
      ...base,
      heatTreatmentProcess,
      incomingDate: formatStandardRegisteredDate(record),
      productionDate: formatProductionDate(record),
      inboundQtyLabel: formatInboundQtyLabel(record),
      workQtyLabel: formatWorkQtyLabel(record, options),
      workflowStatus: status?.label ?? "—",
      remark: record.note?.trim() || "—",
    },
    record,
    screenKey
  );

  return screenKey ? applyScreenWorkflowFields(row, screenKey, status) : row;
}

/** @param {object} record @param {{ label: string, variant: string }} status */
export function mapStandardProductListRow(record, status) {
  return {
    id: record.id,
    managementId: record.id,
    lotNo: record.lotNo?.trim() || "—",
    customerLotNo: record.customerLotNo?.trim() || "—",
    purchaseOrderNo: record.purchaseOrderNo?.trim() || "—",
    company: record.company ?? "—",
    partName: record.partName ?? "—",
    partNo: record.partNo ?? "—",
    material: record.material ?? "—",
    qty: formatStandardQty(record),
    processName: getProductionProcessName(record),
    workDate: formatStandardWorkDate(record),
    statusLabel: status?.label ?? "—",
    statusVariant: status?.variant ?? "wait",
    registeredDate: formatStandardRegisteredDate(record),
    record,
  };
}
