export const WORK_TYPE_IDS = Object.freeze({
  HEAT_TREATMENT: "heat-treatment",
  SHOT: "shot",
  OTHER: "other",
});

export const DEFAULT_WORK_TYPE_ID = WORK_TYPE_IDS.HEAT_TREATMENT;

export const WORK_TYPE_OPTIONS = Object.freeze([
  {
    id: WORK_TYPE_IDS.HEAT_TREATMENT,
    label: "열처리",
    description: "입고 -> 생산계획 -> 설비 가동 현황 -> 작업일보 -> 검사 -> 출고",
    productionFlow: ["입고", "생산계획", "설비 가동 현황", "작업일보", "검사", "출고"],
    usesProductionPlan: true,
    usesEquipmentOperation: true,
    usesDailyReport: true,
    inspectionPolicy: "required",
  },
  {
    id: WORK_TYPE_IDS.SHOT,
    label: "쇼트",
    description: "입고 -> 쇼트 작업 -> 선택 검사 -> 출고",
    productionFlow: ["입고", "쇼트 작업", "선택 검사", "출고"],
    usesProductionPlan: false,
    usesEquipmentOperation: false,
    usesDailyReport: false,
    inspectionPolicy: "optional",
  },
  {
    id: WORK_TYPE_IDS.OTHER,
    label: "기타(향후 확장)",
    description: "세척, 교정, 포장, 외주가공 등 향후 config 확장 대상",
    productionFlow: ["입고", "전용 작업", "출고"],
    usesProductionPlan: false,
    usesEquipmentOperation: false,
    usesDailyReport: false,
    inspectionPolicy: "optional",
  },
]);

export const WORK_TYPE_BY_ID = Object.freeze(
  Object.fromEntries(WORK_TYPE_OPTIONS.map((item) => [item.id, item]))
);

export const SHOT_WORK_STATUS = Object.freeze({
  WAITING: "waiting",
  IN_PROGRESS: "in-progress",
  COMPLETE: "complete",
});

export const SHOT_WORK_STATUS_OPTIONS = Object.freeze([
  { id: SHOT_WORK_STATUS.WAITING, label: "작업 대기", variant: "wait" },
  { id: SHOT_WORK_STATUS.IN_PROGRESS, label: "작업 중", variant: "production" },
  { id: SHOT_WORK_STATUS.COMPLETE, label: "작업 완료", variant: "complete" },
]);

export const SHOT_WORK_STATUS_BY_ID = Object.freeze(
  Object.fromEntries(SHOT_WORK_STATUS_OPTIONS.map((item) => [item.id, item]))
);

const WORK_TYPE_ALIASES = Object.freeze({
  "": DEFAULT_WORK_TYPE_ID,
  heat: WORK_TYPE_IDS.HEAT_TREATMENT,
  htl: WORK_TYPE_IDS.HEAT_TREATMENT,
  "heat-treatment": WORK_TYPE_IDS.HEAT_TREATMENT,
  heatTreatment: WORK_TYPE_IDS.HEAT_TREATMENT,
  "열처리": WORK_TYPE_IDS.HEAT_TREATMENT,
  shot: WORK_TYPE_IDS.SHOT,
  "쇼트": WORK_TYPE_IDS.SHOT,
  other: WORK_TYPE_IDS.OTHER,
  "기타": WORK_TYPE_IDS.OTHER,
  "기타(향후 확장)": WORK_TYPE_IDS.OTHER,
});

export function normalizeWorkTypeId(value) {
  const key = String(value ?? "").trim();
  return WORK_TYPE_BY_ID[WORK_TYPE_ALIASES[key] ?? key]?.id ?? DEFAULT_WORK_TYPE_ID;
}

export function getWorkTypeMeta(value) {
  return WORK_TYPE_BY_ID[normalizeWorkTypeId(value)] ?? WORK_TYPE_BY_ID[DEFAULT_WORK_TYPE_ID];
}

export function isHeatTreatmentWorkType(recordOrType) {
  const value = typeof recordOrType === "object" ? recordOrType?.workType : recordOrType;
  return normalizeWorkTypeId(value) === WORK_TYPE_IDS.HEAT_TREATMENT;
}

export function isShotWorkType(recordOrType) {
  const value = typeof recordOrType === "object" ? recordOrType?.workType : recordOrType;
  return normalizeWorkTypeId(value) === WORK_TYPE_IDS.SHOT;
}

export function normalizeShotWorkStatus(value) {
  const key = String(value ?? "").trim();
  if (!key) return SHOT_WORK_STATUS.WAITING;
  if (SHOT_WORK_STATUS_BY_ID[key]) return key;
  if (key === "작업완료" || key === "작업 완료" || key === "완료" || key === "쇼트완료") {
    return SHOT_WORK_STATUS.COMPLETE;
  }
  if (key === "작업중" || key === "작업 중" || key === "진행중") {
    return SHOT_WORK_STATUS.IN_PROGRESS;
  }
  return SHOT_WORK_STATUS.WAITING;
}

export function getShotWorkStatusMeta(value) {
  return SHOT_WORK_STATUS_BY_ID[normalizeShotWorkStatus(value)] ?? SHOT_WORK_STATUS_BY_ID[SHOT_WORK_STATUS.WAITING];
}

export function isShotWorkComplete(record) {
  return isShotWorkType(record) && normalizeShotWorkStatus(record?.shotStatus) === SHOT_WORK_STATUS.COMPLETE;
}
