/**
 * Project TITAN V1.0 — Workflow (유연 · 비순차)
 *
 * 입고등록 완료 후 필요한 메뉴를 자유롭게 사용.
 * 모든 제품이 동일한 Workflow를 거치지 않음.
 *
 *   managementId → (선택) 생산계획 → (선택) 생산일보 → (선택) 성적서
 *   → 거래명세서 출력 · 출고관리 (입고등록만으로 가능)
 */

import { hasInspectionLogForManagementId } from "./inspectionLogSession";
import { formatQtyWithUnit } from "./productUnits";
import { getStockQty, isIncomingRegistered } from "./productionRecords";
import { getWorkflowStatus, WORKFLOW_STATUS } from "./titanWorkflowStatus";

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
 * 검사일지 작성 가능 여부 (생산일보 LOT 등록 완료 · 선택 Workflow)
 */
export function isInspectionReady(record) {
  return Boolean(record?.registered && record?.lotNo?.trim());
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
 * 진행 상태 요약 (정보 표시용 · 순차 강제 없음)
 */
export function getRecordWorkflowState(record) {
  const workflowStatus = getWorkflowStatus(record);
  if (workflowStatus === WORKFLOW_STATUS.SHIP_DONE) return "출고완료";
  if (workflowStatus === WORKFLOW_STATUS.CERT_DONE) return "성적서완료";
  if (workflowStatus === WORKFLOW_STATUS.INSPECT_DONE) return "검사완료";
  if (workflowStatus === WORKFLOW_STATUS.PROD_DONE) return "생산완료";
  if (workflowStatus === WORKFLOW_STATUS.PROD_PROGRESS) return "생산중";
  if (workflowStatus === WORKFLOW_STATUS.WORK_WAIT) return "작업대기";

  if (!isIncomingRegistered(record)) return "입고대기";
  if (record?.shipmentStatus === SHIPMENT_STATUS.DONE && getStockQty(record) <= 0) {
    return "출고완료";
  }
  if (getStockQty(record) > 0 && (record?.shippedQty ?? 0) > 0) return "부분출고";
  if (record?.certificateStatus === CERTIFICATE_STATUS.ISSUED) return "성적서 발행완료";
  if (record?.registered && record?.lotNo?.trim()) return "생산완료";
  if (record?.htlNo) return "생산계획";
  return "입고완료";
}

/**
 * 성적서 대상 여부 (생산일보 LOT 등록 완료 · 선택 Workflow)
 */
export function isCertificateReady(record) {
  return Boolean(record?.registered && record?.lotNo?.trim());
}

/**
 * 출고 가능 여부 — 입고등록 완료 + 재고 있음 (성적서 무관)
 */
export function isShipmentReady(record) {
  return isIncomingRegistered(record) && getStockQty(record) > 0;
}

/**
 * 거래명세서 출력 가능 — 입고등록 정보만으로 출력 (성적서 무관)
 */
export function isTransactionStatementReady(record) {
  return isIncomingRegistered(record);
}

/** 이력조회 타임라인 단계 (선택 Workflow · 완료 여부만 표시) */
export const HISTORY_TIMELINE_STEPS = [
  { key: "incoming", label: "입고 등록" },
  { key: "plan", label: "생산작업계획 등록" },
  { key: "htl", label: "열처리 작업 리스트 포함" },
  { key: "dailyLot", label: "생산일보 LOT 등록" },
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
 * 관리번호 기준 전체 이력 타임라인 (선택 Workflow · 순차 강제 없음)
 */
export function buildProductHistoryTimeline(record) {
  return HISTORY_TIMELINE_STEPS.map((step) => ({
    key: step.key,
    label: step.label,
    detail: getHistoryStepDetail(record, step.key),
    status: isHistoryStepDone(record, step.key) ? "done" : "optional",
  }));
}

/**
 * 진행 상태 요약 (상단 표시)
 */
export function getHistoryStatusChips(record) {
  return [
    { label: "입고완료", done: isIncomingRegistered(record) },
    {
      label: "생산완료",
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
