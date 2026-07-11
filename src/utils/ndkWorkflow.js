/**
 * Project TITAN V1.3 — Workflow UI helpers (QR · 이력 · Readiness)
 *
 * **Workflow SSOT:** `titanWorkflowStatus.js` — 입고 → 열처리 → 검사 → 성적서 → 출고
 * This module provides QR payloads, history timeline, and gate helpers only.
 * Do not define alternate workflow rank logic here.
 */

import { hasInspectionLogForManagementId } from "./inspectionLogSession";
import { formatQtyWithUnit } from "./productUnits";
import { getStockQty, isIncomingRegistered } from "./productionRecords";
import { isHeatTreatmentComplete } from "./menuWorkflowGate";
import { isShotWorkComplete, isShotWorkType } from "../config/workTypeWorkflow";
import { HT_TERM } from "../config/titanHeatTreatmentTerminology";
import { getWorkflowStatus, WORKFLOW_STATUS, hasReachedWorkflowStatus } from "./titanWorkflowStatus";
import { getShipmentEvents } from "./titanHistorySession";

/**
 * QR 코드에 저장할 LOT 값 (LOT 번호만 · 모바일 조회 키)
 */
export function getLotQrValue(lotNo) {
  return lotNo?.trim() ?? "";
}

/**
 * LOT 기준 QR 표시용 페이로드 (UI · 이력조회)
 */
export function buildLotQrPayload(lotNo) {
  const trimmed = getLotQrValue(lotNo);
  return trimmed ? `NDK|LOT|${trimmed}` : "";
}

/**
 * QR 스캔 값 → LOT 번호 (LOT 번호 직접 · NDK|LOT| 형식 모두 지원)
 */
export function parseLotFromQrPayload(raw) {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed) return "";
  if (trimmed.toUpperCase().startsWith("NDK|LOT|")) {
    return trimmed.slice("NDK|LOT|".length).trim();
  }
  return trimmed;
}

/**
 * 검사일지 작성 가능 — 열처리 완료(생산완료) 이후 (공식 Workflow)
 */
export function isInspectionReady(record) {
  return hasReachedWorkflowStatus(record, WORKFLOW_STATUS.PROD_DONE);
}

/**
 * 성적서 등록 가능 — 검사 완료 이후 (공식 Workflow)
 */
export function isCertificateReady(record) {
  return (
    hasReachedWorkflowStatus(record, WORKFLOW_STATUS.INSPECT_DONE) ||
    hasInspectionLogForManagementId(record?.id)
  );
}

/**
 * 출고 가능 — 생산(열처리/쇼트) 완료 + 재고 있음 (성적서와 독립 · PM P0)
 */
export function isShipmentReady(record) {
  if (!isIncomingRegistered(record) || getStockQty(record) <= 0) {
    return false;
  }
  if (isShotWorkType(record)) {
    return isShotWorkComplete(record);
  }
  return isHeatTreatmentComplete(record);
}

/**
 * LOT 번호 등록 가능 여부 검사 (UI · V2.0)
 */
export function validateLotNoForRegister(lotNo, managementRecord) {
  const trimmed = lotNo?.trim() ?? "";
  if (!trimmed) {
    return { ok: false, code: "EMPTY", message: "LOT 번호를 입력하세요." };
  }

  const existingLot = managementRecord?.lotNo?.trim();
  if (managementRecord?.registered && existingLot) {
    if (existingLot.toUpperCase() !== trimmed.toUpperCase()) {
      return {
        ok: false,
        code: "ALREADY_REGISTERED",
        message: "이 관리번호에는 이미 LOT가 등록되어 있습니다. LOT 재등록은 불가합니다.",
      };
    }
  }

  return { ok: true, lotNo: trimmed };
}

export function canGenerateWorkSheetForLot(lotGroup) {
  return Boolean(
    lotGroup?.records?.some((record) => record.registered && record.lotNo?.trim())
  );
}

/** @deprecated LOT 그룹 기준 canGenerateWorkSheetForLot 사용 */
export function canGenerateWorkSheet(record) {
  return Boolean(record?.registered && record?.lotNo?.trim());
}

/** 성적서 발행 상태 */
export const CERTIFICATE_STATUS = {
  PENDING: "미발행",
  ISSUED: "발행완료",
};

/** 출고 Workflow 상태 */
export const SHIPMENT_STATUS = {
  WAITING: "출고대기",
  DONE: "출고완료",
};

/**
 * 진행 상태 요약 (SSOT: titanWorkflowStatus → 표시 라벨)
 */
export function getRecordWorkflowState(record) {
  const workflowStatus = getWorkflowStatus(record);
  if (workflowStatus === WORKFLOW_STATUS.SHIP_DONE) return "출고완료";
  if (workflowStatus === WORKFLOW_STATUS.CERT_DONE) return "성적서완료";
  if (workflowStatus === WORKFLOW_STATUS.INSPECT_DONE) return "검사완료";
  if (workflowStatus === WORKFLOW_STATUS.PROD_DONE) return HT_TERM.DONE;
  if (workflowStatus === WORKFLOW_STATUS.PROD_PROGRESS) return HT_TERM.PROGRESS;
  if (workflowStatus === WORKFLOW_STATUS.WORK_WAIT) return "작업대기";
  if (!isIncomingRegistered(record)) return "입고대기";
  return "입고완료";
}

/**
 * 거래명세서 출력 가능 — 입고등록 정보만으로 출력
 */
export function isTransactionStatementReady(record) {
  return isIncomingRegistered(record);
}

/** 이력조회 타임라인 단계 (공식 Workflow · 미진행 단계는 optional 표시) */
export const HISTORY_TIMELINE_STEPS = [
  { key: "incoming", label: "입고 등록" },
  { key: "plan", label: "열처리작업계획 등록" },
  { key: "htl", label: "열처리 작업 리스트 포함" },
  { key: "dailyLot", label: "열처리일보 LOT 등록" },
  { key: "worksheet", label: "작업관리표 출력" },
  { key: "inspection", label: "검사일지 등록" },
  { key: "certificate", label: "엑셀 / PDF 등록" },
  { key: "transaction", label: "거래명세서 출력" },
  { key: "shipment", label: "출고" },
];

function isHistoryStepDone(record, stepKey) {
  switch (stepKey) {
    case "incoming":
      return isIncomingRegistered(record);
    case "plan":
      return Boolean(record?.htlNo);
    case "htl":
      return Boolean(record?.htlNo);
    case "dailyLot":
      return Boolean(record?.registered && record?.lotNo?.trim());
    case "worksheet":
      return Boolean(record?.workSheetGenerated);
    case "inspection":
      return hasInspectionLogForManagementId(record?.id);
    case "certificate":
      return record?.certificateStatus === CERTIFICATE_STATUS.ISSUED;
    case "transaction":
      return Boolean(record?.hasTransactionStatement);
    case "shipment":
      return (record?.shippedQty ?? 0) > 0;
    default:
      return false;
  }
}

function getHistoryStepDetail(record, stepKey) {
  switch (stepKey) {
    case "incoming":
      return record.incomingDate
        ? `${record.incomingDate} · ${formatQtyWithUnit(record.qty, record.unit)}`
        : "대기";
    case "plan":
      return record.htlNo ? `작업 리스트 ${record.htlNo}` : "미진행 (선택)";
    case "htl":
      return record.htlNo ? `열처리 작업 리스트 ${record.htlNo} 포함` : "미진행 (선택)";
    case "dailyLot":
      return record.lotNo ? `LOT ${record.lotNo} · ${record.completionStatus || "—"}` : "미진행 (선택)";
    case "worksheet":
      return record.workSheetGenerated && record.lotNo
        ? `LOT ${record.lotNo} · QR ${getLotQrValue(record.lotNo)}`
        : "미진행 (선택)";
    case "inspection":
      return hasInspectionLogForManagementId(record?.id)
        ? "검사일지 등록 완료"
        : "미진행 (선택)";
    case "certificate":
      return record.certificateStatus === CERTIFICATE_STATUS.ISSUED
        ? "발행완료"
        : "미진행 (선택)";
    case "transaction":
      return record.hasTransactionStatement ? "출력 이력 있음" : "미출력";
    case "shipment":
      if ((record?.shippedQty ?? 0) <= 0) return "미출고";
      return `누적 ${formatQtyWithUnit(record.shippedQty, record.unit)} · 잔여 ${formatQtyWithUnit(getStockQty(record), record.unit)}`;
    default:
      return "";
  }
}

/**
 * 관리번호 기준 전체 이력 타임라인 (공식 Workflow 순서 · SSOT: titanWorkflowStatus)
 */
export function buildProductHistoryTimeline(record) {
  const preShipmentKeys = [
    "incoming",
    "plan",
    "htl",
    "dailyLot",
    "worksheet",
    "inspection",
    "certificate",
    "transaction",
  ];

  const timeline = preShipmentKeys.map((key) => {
    const step = HISTORY_TIMELINE_STEPS.find((item) => item.key === key);
    return {
      key,
      label: step?.label ?? key,
      detail: getHistoryStepDetail(record, key),
      status: isHistoryStepDone(record, key) ? "done" : "optional",
    };
  });

  const workflowChangeLogs = Array.isArray(record?.workflowChangeLog) ? record.workflowChangeLog : [];
  if (workflowChangeLogs.length > 0) {
    const changeEntries = workflowChangeLogs.map((entry, index) => ({
      key: `workflow-change-${index}`,
      label: entry.action === "WORKFLOW_SKIP" ? "공정 생략" : "공정 변경",
      detail: entry.note || `${entry.fromLabel ?? ""} → ${entry.toLabel ?? ""}`,
      status: "done",
      at: entry.at,
      user: entry.user,
    }));
    const dailyLotIdx = timeline.findIndex((step) => step.key === "dailyLot");
    const insertAt = dailyLotIdx >= 0 ? dailyLotIdx + 1 : timeline.length;
    timeline.splice(insertAt, 0, ...changeEntries);
  }

  const partialShipments = resolvePartialShipmentEntries(record);

  partialShipments.forEach((entry, index) => {
    const isPartial = partialShipments.length > 1 && index < partialShipments.length - 1;
    timeline.push({
      key: `partial-shipment-${index}`,
      label: isPartial ? `부분출고 ${index + 1}` : "출고",
      detail: formatPartialShipmentDetail(entry, record),
      status: "done",
    });
  });

  if ((record?.shippedQty ?? 0) > 0 && getStockQty(record) <= 0) {
    timeline.push({
      key: "shipment-complete",
      label: "출고 완료",
      detail: `누적 ${formatQtyWithUnit(record.shippedQty, record.unit)} · 전량 출고`,
      status: "done",
    });
  } else if (partialShipments.length === 0) {
    timeline.push({
      key: "shipment",
      label: "출고",
      detail: getHistoryStepDetail(record, "shipment"),
      status: isHistoryStepDone(record, "shipment") ? "done" : "optional",
    });
  }

  return timeline;
}

function resolvePartialShipmentEntries(record) {
  if (Array.isArray(record?.partialShipHistory) && record.partialShipHistory.length > 0) {
    return record.partialShipHistory;
  }

  return getShipmentEvents(record?.id)
    .slice()
    .reverse()
    .map((event) => ({
      shipDate: event.shippedAt,
      shipQty: event.shipQty,
      shippedBy: event.shippedBy,
      statementStatus: record?.hasTransactionStatement ? "발행완료" : "미출력",
      balanceAfter: event.stockAfter,
    }));
}

function formatPartialShipmentDetail(entry, record) {
  const shipDate = entry.shipDate ?? entry.shippedAt ?? "—";
  const shipQty = formatQtyWithUnit(entry.shipQty, record?.unit || "EA");
  const balance = formatQtyWithUnit(entry.balanceAfter ?? entry.stockAfter ?? 0, record?.unit || "EA");
  const user = entry.shippedBy ?? "—";
  const statement = entry.statementStatus ?? "미출력";
  return `${shipDate} · ${shipQty} · ${user} · 잔량 ${balance} · ${statement}`;
}

/**
 * 진행 상태 요약 (상단 표시)
 */
export function getHistoryStatusChips(record) {
  return [
    { label: "입고완료", done: isIncomingRegistered(record) },
    {
      label: HT_TERM.DONE,
      done: Boolean(record?.registered && record?.lotNo?.trim()),
    },
    {
      label: "검사일지 등록",
      done: hasInspectionLogForManagementId(record?.id),
    },
    {
      label: "성적서 발행완료",
      done: record?.certificateStatus === CERTIFICATE_STATUS.ISSUED,
    },
    {
      label: "출고",
      done: (record?.shippedQty ?? 0) > 0,
    },
  ];
}

export function getQrHistoryView(record) {
  if (!record) return null;
  return {
    managementId: record.id,
    lotNo: record.lotNo || "",
    qrPayload: buildLotQrPayload(record.lotNo),
    workflowState: getRecordWorkflowState(record),
    statusChips: getHistoryStatusChips(record),
    timeline: buildProductHistoryTimeline(record),
  };
}

export { isIncomingRegistered, getStockQty };
