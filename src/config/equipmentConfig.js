/**
 * Project TITAN V1.5 — 설비 장입 · 설비 상태 SSOT (Config)
 * 상태(status)는 저장하지 않음 — equipmentWorkflowService.js에서 계산
 *
 * 설비 상태 4단계 및 장입 버튼 규칙 = Project TITAN 공식 SSOT
 */

import { OPERATION_ROUTES } from "./operationsRouteRegistry";

/** @typedef {"idle"|"ready"|"running"|"maintenance"|"breakdown"} EquipmentRunStatus */

/**
 * 공식 설비 상태 SSOT — 순서 고정
 * 비가동/대기 → 장입완료/작업준비 → 열처리중 → 점검중 → 고장
 */
export const EQUIPMENT_RUN_STATUS_SSOT = ["idle", "ready", "running", "maintenance", "breakdown"];

/**
 * @typedef {{
 *   id: string,
 *   code: string,
 *   name: string,
 *   process: string,
 *   maintenance: boolean,
 *   smartAccessId: string,
 * }} EquipmentRawRecord
 */

export const EQUIPMENT_RUN_STATUS_META = {
  idle: {
    emoji: "⚪",
    label: "비가동/대기",
    english: "Idle",
    variant: "wait",
  },
  ready: {
    emoji: "🟡",
    label: "장입완료/작업준비",
    english: "Ready",
    variant: "wait",
  },
  running: {
    emoji: "🟢",
    label: "열처리중",
    english: "Running",
    variant: "progress",
  },
  maintenance: {
    emoji: "🔴",
    label: "점검중",
    english: "Maintenance",
    variant: "hold",
  },
  breakdown: {
    emoji: "⛔",
    label: "고장",
    english: "Breakdown",
    variant: "danger",
  },
};

/**
 * 설비 상태 → 장입 버튼 규칙 (SSOT)
 * 사람이 직접 활성/비활성 제어 ❌ — computed status만으로 자동 결정
 *
 * @typedef {{ showStart: boolean, showComplete: boolean, startEnabled: boolean, completeEnabled: boolean }} EquipmentChargingButtonState
 */
export const EQUIPMENT_CHARGING_BUTTON_RULES = {
  idle: {
    showStart: true,
    showComplete: false,
    startEnabled: false,
    completeEnabled: false,
  },
  ready: {
    showStart: true,
    showComplete: false,
    startEnabled: true,
    completeEnabled: false,
  },
  running: {
    showStart: false,
    showComplete: true,
    startEnabled: false,
    completeEnabled: true,
  },
  maintenance: {
    showStart: true,
    showComplete: true,
    startEnabled: false,
    completeEnabled: false,
  },
  breakdown: {
    showStart: true,
    showComplete: true,
    startEnabled: false,
    completeEnabled: false,
  },
};

/**
 * @param {EquipmentRunStatus | string | null | undefined} status
 * @returns {EquipmentChargingButtonState}
 */
export function resolveEquipmentChargingButtons(status) {
  const key = String(status ?? "").trim();
  return (
    EQUIPMENT_CHARGING_BUTTON_RULES[key] ?? {
      showStart: false,
      showComplete: false,
      startEnabled: false,
      completeEnabled: false,
    }
  );
}

/** 공정 그룹 표시 순서 (MES Dashboard) */
export const EQUIPMENT_PROCESS_GROUP_ORDER = [
  "이온질화",
  "가스질화",
  "가스연질화",
  "침탄",
  "고주파",
  "기타",
];

/** @type {{ process: string, prefix: string, count: number }[]} */
const EQUIPMENT_FLEET_SPECS = [
  { process: "이온질화", prefix: "ION", count: 6 },
  { process: "가스질화", prefix: "GAS", count: 5 },
  { process: "가스연질화", prefix: "SOFT", count: 4 },
  { process: "침탄", prefix: "CAR", count: 4 },
  { process: "고주파", prefix: "HF", count: 3 },
  { process: "기타", prefix: "AUX", count: 3 },
];

export const EQUIPMENT_MAINTENANCE_IDS = new Set();

function buildEquipmentRawList() {
  /** @type {EquipmentRawRecord[]} */
  const list = [];

  EQUIPMENT_FLEET_SPECS.forEach(({ process, prefix, count }) => {
    for (let index = 1; index <= count; index += 1) {
      const code = `${prefix}-${String(index).padStart(2, "0")}`;
      list.push({
        id: code,
        code,
        name: `${process} ${index}호기`,
        process,
        maintenance: EQUIPMENT_MAINTENANCE_IDS.has(code),
        smartAccessId: `NDK://EQ/${code}`,
      });
    }
  });

  return list;
}

/** @type {EquipmentRawRecord[]} — status 필드 없음 · maintenance만 저장 */
export const EQUIPMENT_RAW_LIST = buildEquipmentRawList();

/**
 * @typedef {{ lotNo: string, startTime: string, expectedEndTime: string, progress: number, statusLabel: string, operator?: string }} EquipmentRunningSession
 */

/** @type {Record<string, EquipmentRunningSession>} — RC1: idle unless real workflow session */
export const EQUIPMENT_RUNNING_LOTS = {};

/** @type {Record<string, EquipmentChargeableLotRow[]>} — RC1: no demo chargeable defaults */
export const EQUIPMENT_CHARGEABLE_LOTS = {};

/**
 * 동일 LOT 제품 목록 (Dummy)
 * @type {Record<string, { partName: string }[]>}
 */
export const EQUIPMENT_LOT_PRODUCTS = {
  LOT240630: [
    { partName: "VALVE STEM" },
    { partName: "SHAFT" },
    { partName: "PIN" },
    { partName: "BUSH" },
  ],
  LOT240701: [{ partName: "BULL GEAR" }, { partName: "SPACER" }],
  LOT240702: [{ partName: "#2 PINION GEAR" }],
  LOT240615: [{ partName: "CAM SHAFT" }, { partName: "WASHER" }],
  "LOT-20260707-001": [{ partName: "샤프트", partNo: "SA-4032" }],
  LOT240628: [{ partName: "GEAR BLANK" }, { partName: "SPACER" }, { partName: "KEY" }],
  LOT240620: [{ partName: "INDUCTION RING" }],
  LOT240703: [{ partName: "DRIVE SHAFT" }],
  LOT240704: [{ partName: "SPROCKET" }, { partName: "HUB" }],
  LOT240705: [{ partName: "RING GEAR" }],
  LOT240706: [{ partName: "CLUTCH HUB" }, { partName: "PLATE" }],
};

export const QR_CHARGING_PAGE_COPY = {
  title: "설비 장입관리",
  description: "설비 QR를 통해 장입을 시작하고 현재 장입 현황을 관리하는 화면",
  equipmentSectionTitle: "설비 리스트",
  lotSectionTitle: "장입 가능 LOT",
  currentSectionTitle: "현재 장입 중",
  startLabel: "열처리 시작",
  completeLabel: "열처리 종료",
  summaryAriaLabel: "설비 장입 현황",
};

export const HOME_EQUIPMENT_WIDGET_COPY = {
  title: "설비 운영 현황",
  subtitle: "설비 중심 열처리 운전 · 대기 · 점검 상태",
  detailTitle: "설비 상세",
  sameLotTitle: "동일 LOT 제품",
  linkLabel: "설비 가동 현황",
  linkTo: OPERATION_ROUTES.equipmentStatus,
};

export const EQUIPMENT_STATUS_PAGE_COPY = {
  title: "설비 가동 현황",
  kicker: "MES Dashboard",
  description: "전체 설비 운전 · 장입 · 점검 상태를 한 화면에서 관제합니다.",
  detailTitle: "설비 상세",
  sameLotTitle: "동일 LOT 제품",
  chargingLinkLabel: "작업 시작/종료",
  chargingLinkTo: OPERATION_ROUTES.equipmentStatus,
};

/** @deprecated EQUIPMENT_RAW_LIST 사용 — status는 계산값 */
export const QR_CHARGING_EQUIPMENT_LIST = EQUIPMENT_RAW_LIST;

/** @deprecated EQUIPMENT_CHARGEABLE_LOTS / equipmentWorkflowService 사용 */
export const QR_CHARGING_AVAILABLE_LOTS = EQUIPMENT_CHARGEABLE_LOTS["3S-2"] ?? [];

/** @deprecated EQUIPMENT_RUNNING_LOTS 사용 */
export const QR_CHARGING_ACTIVE_SESSION = {
  ...EQUIPMENT_RUNNING_LOTS["3S-1"],
  partName: "CARRIER SHAFT",
  equipmentId: "3S-1",
  equipmentName: "3S-1",
};

/** RC1 LOT operational display status (NOT 9-stage Current Process keys) */
export const RC1_LOT_OPERATIONAL_STATUS = Object.freeze({
  PRODUCTION_WAIT: "생산대기",
  CHARGE_COMPLETE: "장입완료",
  WORK_READY: "작업준비",
  HT_RUNNING: "열처리중",
  PRODUCTION_DONE: "생산완료",
});

export const RC1_LEGACY_CHARGE_WAIT = "장입대기";
export const RC1_CHARGE_READY_LABEL = RC1_LOT_OPERATIONAL_STATUS.CHARGE_COMPLETE;

function compactRc1LotStatus(value = "") {
  return String(value ?? "").replace(/\s+/g, "").trim();
}

export function normalizeRc1LotOperationalStatus(rawStatus = "", context = {}) {
  const lotNo = String(context.lotNo ?? "").trim();
  const hasLot = Boolean(lotNo);
  const status = compactRc1LotStatus(rawStatus);

  if (hasLot && (status === "장입대기" || status === compactRc1LotStatus(RC1_LEGACY_CHARGE_WAIT))) {
    return RC1_CHARGE_READY_LABEL;
  }

  if (!hasLot && (status === "장입대기" || status === compactRc1LotStatus(RC1_LEGACY_CHARGE_WAIT))) {
    return RC1_LOT_OPERATIONAL_STATUS.PRODUCTION_WAIT;
  }

  if (status === "작업준비" || status.includes("장입완료")) {
    return RC1_CHARGE_READY_LABEL;
  }

  if (
    status.includes("열처리") ||
    status === "생산중" ||
    status === "운전중" ||
    status.includes("진행")
  ) {
    return RC1_LOT_OPERATIONAL_STATUS.HT_RUNNING;
  }

  if (status.includes("생산완료")) {
    return RC1_LOT_OPERATIONAL_STATUS.PRODUCTION_DONE;
  }

  if (status.includes("생산대기") || status === "작업대기") {
    return RC1_LOT_OPERATIONAL_STATUS.PRODUCTION_WAIT;
  }

  if (rawStatus) return String(rawStatus).trim();
  return hasLot ? RC1_CHARGE_READY_LABEL : RC1_LOT_OPERATIONAL_STATUS.PRODUCTION_WAIT;
}

export function resolveRc1ChargeableRowStatusLabel(row = {}) {
  const lotNo = String(row.lotNo ?? "").trim();
  const needsLot = Boolean(row.needsLotCreation) || row.source === "production-waiting";

  if (!lotNo && needsLot) {
    return RC1_LOT_OPERATIONAL_STATUS.PRODUCTION_WAIT;
  }

  if (lotNo) {
    return normalizeRc1LotOperationalStatus(row.statusLabel ?? row.status, { lotNo });
  }

  return RC1_LOT_OPERATIONAL_STATUS.PRODUCTION_WAIT;
}

export function isRc1LotChargeReadyStatus(status = "") {
  const norm = compactRc1LotStatus(status);
  return norm.includes("장입완료") || norm.includes("작업준비");
}

export function isRc1LotPreStartStatus(status = "") {
  const norm = compactRc1LotStatus(status);
  if (norm.includes("생산대기") || norm.includes("workwait")) return true;
  if (isRc1LotChargeReadyStatus(norm)) return true;
  if (norm === "장입대기") return true;
  return norm.includes("대기") && !norm.includes("검사") && !norm.includes("출고");
}
