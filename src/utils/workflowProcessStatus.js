/**
 * Project TITAN V1.4 — Current Process SSoT (PM Final · 9 stages)
 *
 * 현재공정 = 9-stage business workflow (영문 Key · 화면 한글)
 * 현재상태 = per-menu task status (진행중 · 미검사 · …)
 * 처리공정 = 이온질화 · 가스질화 … (별도 필드 · 혼용 금지)
 */

import { getCertificateFileStatus, hasCertificateFilesForManagementId } from "./certificateSession";
import { isProductionWaitingStageRecord } from "./titanWorkflowStatus";
import {
  isHeatTreatmentComplete,
  isInspectionComplete,
  isCertificateIssued,
  MENU_TASK_STATUS,
} from "./menuWorkflowGate";
import { getStockQty } from "./inventory";
import { SHIPMENT_STATUS } from "./ndkWorkflow";
import { isIncomingRegistered } from "./productionRecords";
import { isShotWorkComplete, isShotWorkType } from "../config/workTypeWorkflow";

/** @typedef {'inbound' | 'production' | 'inspection' | 'certificate' | 'outbound' | 'inventory'} ScreenWorkflowKey */

/** Official internal keys (SQLite · Oracle · API SSoT) */
export const CURRENT_PROCESS_KEYS = Object.freeze({
  RECEIVED: "RECEIVED",
  HT_WAIT: "HT_WAIT",
  HT_RUNNING: "HT_RUNNING",
  INSPECTION_WAIT: "INSPECTION_WAIT",
  INSPECTION_DONE: "INSPECTION_DONE",
  CERT_WAIT: "CERT_WAIT",
  CERT_DONE: "CERT_DONE",
  SHIP_WAIT: "SHIP_WAIT",
  SHIPPED: "SHIPPED",
});

/** Official 9-stage labels (display order) */
export const CURRENT_PROCESS_CHAIN = Object.freeze([
  "입고등록",
  "열처리 대기",
  "열처리 중",
  "검사 대기",
  "검사 완료",
  "성적서 대기",
  "성적서 발행 완료",
  "출고 대기",
  "출고 완료",
]);

/** KPI waiting stages — 완료(이력) 단계 제외 */
export const CURRENT_PROCESS_KPI_STAGES = Object.freeze([
  "입고등록",
  "열처리 대기",
  "열처리 중",
  "검사 대기",
  "성적서 대기",
  "출고 대기",
]);

/** @type {Record<string, string>} internal key → Korean label */
export const CURRENT_PROCESS_LABELS = Object.freeze({
  RECEIVED: "입고등록",
  HT_WAIT: "열처리 대기",
  HT_RUNNING: "열처리 중",
  INSPECTION_WAIT: "검사 대기",
  INSPECTION_DONE: "검사 완료",
  CERT_WAIT: "성적서 대기",
  CERT_DONE: "성적서 발행 완료",
  SHIP_WAIT: "출고 대기",
  SHIPPED: "출고 완료",
});

export const CURRENT_PROCESS_VARIANTS = Object.freeze({
  RECEIVED: "incoming",
  HT_WAIT: "production",
  HT_RUNNING: "production",
  INSPECTION_WAIT: "inspection",
  INSPECTION_DONE: "inspection",
  CERT_WAIT: "certificate",
  CERT_DONE: "certificate",
  SHIP_WAIT: "shipment",
  SHIPPED: "shipment",
});

/** KPI bucket — 성적서 대기 = 검사 완료(미발행) + 성적서 대기 */
export const CURRENT_PROCESS_KPI_BUCKETS = Object.freeze({
  RECEIVED: [CURRENT_PROCESS_KEYS.RECEIVED],
  HT_WAIT: [CURRENT_PROCESS_KEYS.HT_WAIT],
  HT_RUNNING: [CURRENT_PROCESS_KEYS.HT_RUNNING],
  INSPECTION_WAIT: [CURRENT_PROCESS_KEYS.INSPECTION_WAIT],
  CERT_WAIT: [CURRENT_PROCESS_KEYS.INSPECTION_DONE, CURRENT_PROCESS_KEYS.CERT_WAIT],
  SHIP_WAIT: [CURRENT_PROCESS_KEYS.SHIP_WAIT],
});

export const SCREEN_WORKFLOW_PROCESS = {
  inbound: "입고등록",
  production: "열처리",
  inspection: "검사",
  certificate: "성적서",
  outbound: "출고",
  inventory: "재고",
};

export const SCREEN_WORKFLOW_PROCESS_VARIANT = {
  inbound: "incoming",
  production: "production",
  inspection: "inspection",
  certificate: "certificate",
  outbound: "shipment",
  inventory: "inventory",
};

function buildCurrentProcess(key) {
  return {
    key,
    label: CURRENT_PROCESS_LABELS[key] ?? "—",
    variant: CURRENT_PROCESS_VARIANTS[key] ?? "incoming",
  };
}

function hasLotCreated(record) {
  return Boolean(record?.registered && record?.lotNo?.trim());
}

function isShipmentRegistered(record) {
  return record?.shipmentStatus === SHIPMENT_STATUS.DONE;
}

/**
 * Workflow 기준 현재공정 SSoT — PM V1.4 단계별 조건
 * @param {object | null | undefined} record
 * @returns {{ key: string, label: string, variant: string }}
 */
export function resolveRecordCurrentProcess(record) {
  if (!record || !isIncomingRegistered(record)) {
    return buildCurrentProcess(CURRENT_PROCESS_KEYS.RECEIVED);
  }

  // 쇼트는 생산계획·설비가동·작업일보를 거치지 않는다.
  if (isShotWorkType(record)) {
    if (isShipmentRegistered(record)) {
      return buildCurrentProcess(CURRENT_PROCESS_KEYS.SHIPPED);
    }
    if (isShotWorkComplete(record)) {
      return buildCurrentProcess(
        record?.shotInspectionRequired
          ? CURRENT_PROCESS_KEYS.INSPECTION_WAIT
          : CURRENT_PROCESS_KEYS.SHIP_WAIT
      );
    }
    return buildCurrentProcess(CURRENT_PROCESS_KEYS.RECEIVED);
  }

  // ⑨ 출고 완료 — 출고 등록 완료
  if (isShipmentRegistered(record)) {
    return buildCurrentProcess(CURRENT_PROCESS_KEYS.SHIPPED);
  }

  // ⑧ 출고 대기 — 열처리 완료 + 재고 (성적서·검사와 독립 · PM P0)
  if (isHeatTreatmentComplete(record) && getStockQty(record) > 0) {
    return buildCurrentProcess(CURRENT_PROCESS_KEYS.SHIP_WAIT);
  }

  // ⑧-b 성적서 발행 완료 + 출고 미등록 (품질 완료 건 — 출고 대기 동일)
  if (isCertificateIssued(record) && getStockQty(record) > 0) {
    return buildCurrentProcess(CURRENT_PROCESS_KEYS.SHIP_WAIT);
  }

  // ⑥ 성적서 대기 / ⑤ 검사 완료 (출고 전 생산 미완료 · 품질 추적)
  if (isInspectionComplete(record)) {
    if (hasCertificateFilesForManagementId(record.id)) {
      return buildCurrentProcess(CURRENT_PROCESS_KEYS.CERT_WAIT);
    }
    return buildCurrentProcess(CURRENT_PROCESS_KEYS.INSPECTION_DONE);
  }

  // ④ 검사 대기 — 열처리 완료 · 검사 미등록
  if (isHeatTreatmentComplete(record)) {
    return buildCurrentProcess(CURRENT_PROCESS_KEYS.INSPECTION_WAIT);
  }

  // ③ 열처리 중 — 생산일보 등록 · 열처리 미완료
  if (hasLotCreated(record) && !isHeatTreatmentComplete(record)) {
    return buildCurrentProcess(CURRENT_PROCESS_KEYS.HT_RUNNING);
  }

  // ②-b 열처리 대기 — LOT 생성 · 생산일보 미등록 (설비 장입 대기)
  if (record?.lotNo?.trim() && !record?.registered && !isHeatTreatmentComplete(record)) {
    return buildCurrentProcess(CURRENT_PROCESS_KEYS.HT_WAIT);
  }

  // ②-a 열처리 대기 — 생산 대기 투입 · LOT 생성 전 (입고리스트 출력과 독립)
  if (isProductionWaitingStageRecord(record)) {
    return buildCurrentProcess(CURRENT_PROCESS_KEYS.HT_WAIT);
  }

  // ① 입고등록 — 입고 등록 완료 · 생산 대기 미투입
  return buildCurrentProcess(CURRENT_PROCESS_KEYS.RECEIVED);
}

/**
 * @param {string} processKey
 * @returns {boolean}
 */
export function isCurrentProcessKpiStage(processKey) {
  const label = CURRENT_PROCESS_LABELS[processKey];
  return label ? CURRENT_PROCESS_KPI_STAGES.includes(label) : false;
}

/**
 * KPI chip bucket id → record matches
 * @param {object} record
 * @param {string} kpiId — RECEIVED | HT_WAIT | … | CERT_WAIT | SHIP_WAIT
 */
export function matchesCurrentProcessKpiBucket(record, kpiId) {
  const keys = CURRENT_PROCESS_KPI_BUCKETS[kpiId];
  if (!keys?.length) return false;
  const currentKey = resolveRecordCurrentProcess(record).key;
  return keys.includes(currentKey);
}

export function applyRecordCurrentProcessFields(row, record, _screenKey) {
  const current = record
    ? resolveRecordCurrentProcess(record)
    : buildCurrentProcess(CURRENT_PROCESS_KEYS.RECEIVED);

  return {
    ...row,
    currentProcess: current.label,
    currentProcessKey: current.key,
    currentProcessVariant: current.variant,
    workflowProcess: current.label,
  };
}

export const CERTIFICATE_MANAGEMENT_STATUS = {
  WAIT: MENU_TASK_STATUS.CERT_NOT_ISSUED,
  DONE: MENU_TASK_STATUS.CERT_ISSUED,
};

export function getScreenWorkflowProcess(screenKey) {
  if (!screenKey) return "—";
  return SCREEN_WORKFLOW_PROCESS[screenKey] ?? "—";
}

export function getScreenWorkflowProcessVariant(screenKey) {
  if (!screenKey) return "incoming";
  return SCREEN_WORKFLOW_PROCESS_VARIANT[screenKey] ?? "incoming";
}

export function inferScreenKeyFromListRow(listRow) {
  if (!listRow) return null;
  if (listRow.screenKey) return listRow.screenKey;
  if (listRow.entry) return "certificate";
  if (listRow.outboundDate !== undefined || listRow.shipDateLabel !== undefined) return "outbound";
  if (listRow.rowKey != null && listRow.inspectionStatus != null) return "inspection";
  if (listRow.log) return "inspection";
  if (listRow.inventoryQtyLabel != null || listRow.stockQtyLabel != null) return "inventory";
  return null;
}

export function getCertificateManagementStatus(entry) {
  const fileStatus = getCertificateFileStatus(entry);
  if (fileStatus.label === "등록완료") {
    return { label: CERTIFICATE_MANAGEMENT_STATUS.DONE, variant: "complete" };
  }
  return { label: CERTIFICATE_MANAGEMENT_STATUS.WAIT, variant: "wait" };
}

export function getMassInspectionManagementStatus(log) {
  if (!log) {
    return { label: MENU_TASK_STATUS.INSPECT_NOT_DONE, variant: "wait" };
  }
  return { label: MENU_TASK_STATUS.INSPECT_DONE, variant: "complete" };
}

export function getInspectionResultLabel(log) {
  if (!log) return "—";
  if (log.reinspect === true || log.status === "재검사") return "재검사";
  if (log.judgment === "합격") return "합격";
  if (log.judgment === "불합격") return "불합격";
  if (log.status === "검사중" || log.judgment === "보류") return "검사중";
  return log.judgment?.trim() || "—";
}

export function applyScreenWorkflowFields(row, screenKey, status) {
  const record = row?.record ?? null;
  const withProcess = record ? applyRecordCurrentProcessFields(row, record, screenKey) : row;

  return {
    ...withProcess,
    screenKey,
    workflowStatus: status?.label ?? withProcess.workflowStatus ?? withProcess.statusLabel ?? "—",
    statusLabel: status?.label ?? withProcess.statusLabel ?? "—",
    statusVariant: status?.variant ?? withProcess.statusVariant ?? "wait",
  };
}
