/**
 * Project TITAN V1.5 — 설비 장입 · 설비 상태 SSOT (Config)
 * 상태(status)는 저장하지 않음 — equipmentWorkflowService.js에서 계산
 *
 * 설비 상태 4단계 및 장입 버튼 규칙 = Project TITAN 공식 SSOT
 */

/** @typedef {"idle"|"ready"|"running"|"maintenance"} EquipmentRunStatus */

/**
 * 공식 설비 상태 SSOT — 순서 고정
 * ⚪ 대기 → 🟡 장입 준비 → 🟢 운전중 → 🔴 점검중
 */
export const EQUIPMENT_RUN_STATUS_SSOT = ["idle", "ready", "running", "maintenance"];

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
    label: "대기",
    english: "Idle",
    variant: "wait",
  },
  ready: {
    emoji: "🟡",
    label: "장입 준비",
    english: "Ready for Charging",
    variant: "prod-wait",
  },
  running: {
    emoji: "🟢",
    label: "운전중",
    english: "Running",
    variant: "progress",
  },
  maintenance: {
    emoji: "🔴",
    label: "점검중",
    english: "Maintenance",
    variant: "hold",
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
    showStart: false,
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

export const EQUIPMENT_MAINTENANCE_IDS = new Set(["63", "64", "65"]);

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

/** @type {Record<string, EquipmentRunningSession>} — Master 설비 코드 (EquipmentStore SSOT) */
export const EQUIPMENT_RUNNING_LOTS = {
  "3S-1": {
    lotNo: "LOT240630",
    startTime: "08:32",
    expectedEndTime: "18:20",
    progress: 65,
    statusLabel: "진행중",
    operator: "홍길동",
  },
  "3S-3": {
    lotNo: "LOT240615",
    startTime: "07:10",
    expectedEndTime: "16:40",
    progress: 82,
    statusLabel: "진행중",
    operator: "김철수",
  },
  "10S-02": {
    lotNo: "LOT240628",
    startTime: "09:05",
    expectedEndTime: "19:30",
    progress: 48,
    statusLabel: "진행중",
    operator: "이영희",
  },
  "61": {
    lotNo: "LOT240620",
    startTime: "10:15",
    expectedEndTime: "14:00",
    progress: 91,
    statusLabel: "진행중",
    operator: "박민수",
  },
};

/** @type {Record<string, EquipmentChargeableLotRow[]>} — Master 설비 코드 */
export const EQUIPMENT_CHARGEABLE_LOTS = {
  "3S-2": [
    {
      id: "lot-240701",
      lotNo: "LOT240701",
      partName: "BULL GEAR",
      qty: 12,
      unit: "EA",
      statusLabel: "장입대기",
    },
    {
      id: "lot-240702",
      lotNo: "LOT240702",
      partName: "#2 PINION GEAR",
      qty: 8,
      unit: "EA",
      statusLabel: "장입대기",
    },
  ],
  "3S-4": [
    {
      id: "lot-240703",
      lotNo: "LOT240703",
      partName: "DRIVE SHAFT",
      qty: 20,
      unit: "EA",
      statusLabel: "장입대기",
    },
  ],
  "10S-01": [
    {
      id: "lot-240704",
      lotNo: "LOT240704",
      partName: "SPROCKET",
      qty: 16,
      unit: "EA",
      statusLabel: "장입대기",
    },
  ],
  "10S-03": [
    {
      id: "lot-240705",
      lotNo: "LOT240705",
      partName: "RING GEAR",
      qty: 6,
      unit: "EA",
      statusLabel: "장입대기",
    },
  ],
  "62": [
    {
      id: "lot-240706",
      lotNo: "LOT240706",
      partName: "CLUTCH HUB",
      qty: 10,
      unit: "EA",
      statusLabel: "장입대기",
    },
  ],
};

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
  startLabel: "장입 시작",
  completeLabel: "열처리 완료",
  summaryAriaLabel: "설비 장입 현황",
};

export const HOME_EQUIPMENT_WIDGET_COPY = {
  title: "설비 운영 현황",
  subtitle: "설비 중심 열처리 운전 · 장입 준비 · 점검 상태",
  detailTitle: "설비 상세",
  sameLotTitle: "동일 LOT 제품",
  linkLabel: "장입관리",
  linkTo: "/production/charging",
};

export const EQUIPMENT_STATUS_PAGE_COPY = {
  title: "설비 현황",
  kicker: "MES Dashboard",
  description: "전체 설비 운전 · 장입 · 점검 상태를 한 화면에서 관제합니다.",
  detailTitle: "설비 상세",
  sameLotTitle: "동일 LOT 제품",
  chargingLinkLabel: "장입 작업",
  chargingLinkTo: "/production/charging",
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
