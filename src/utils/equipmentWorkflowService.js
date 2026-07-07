/**
 * Project TITAN V1.5 — 설비 Workflow Foundation SSOT
 * HOME · 설비 장입관리 공통 데이터 · 상태 계산
 *
 * SessionStorage · QR Scan · Workflow Engine 연결 없음 (Sprint 2 Foundation)
 */

import {
  EQUIPMENT_CHARGEABLE_LOTS,
  EQUIPMENT_LOT_PRODUCTS,
  EQUIPMENT_PROCESS_GROUP_ORDER,
  EQUIPMENT_RAW_LIST,
  EQUIPMENT_RUN_STATUS_SSOT,
  EQUIPMENT_RUNNING_LOTS,
  resolveEquipmentChargingButtons,
} from "../config/equipmentConfig";

export { resolveEquipmentChargingButtons };

/**
 * 설비 상태 계산 (공식 SSOT)
 * 1. maintenance → 점검중
 * 2. runningLot → 운전중
 * 3. chargeable LOT → 장입 준비
 * 4. else → 대기
 *
 * @param {import("../config/equipmentConfig").EquipmentRawRecord} equipment
 * @returns {import("../config/equipmentConfig").EquipmentRunStatus}
 */
export function computeEquipmentRunStatus(equipment) {
  if (!equipment) return "idle";
  if (equipment.maintenance) return "maintenance";

  const runningLot = EQUIPMENT_RUNNING_LOTS[equipment.id];
  if (runningLot) return "running";

  const chargeableLots = EQUIPMENT_CHARGEABLE_LOTS[equipment.id] ?? [];
  if (chargeableLots.length > 0) return "ready";

  return "idle";
}

/**
 * @param {import("../config/equipmentConfig").EquipmentRawRecord} equipment
 */
export function buildEquipmentViewModel(equipment) {
  const status = computeEquipmentRunStatus(equipment);
  const runningSession = EQUIPMENT_RUNNING_LOTS[equipment.id] ?? null;
  const chargeableLots = (EQUIPMENT_CHARGEABLE_LOTS[equipment.id] ?? []).map((row) => ({ ...row }));
  const displayLots = runningSession
    ? [runningSession.lotNo]
    : chargeableLots.map((row) => row.lotNo);

  return {
    ...equipment,
    status,
    runningSession: runningSession ? { ...runningSession } : null,
    chargeableLots,
    displayLots,
    chargingButtons: resolveEquipmentChargingButtons(status),
  };
}

export function getEquipmentList() {
  return EQUIPMENT_RAW_LIST.map((item) => buildEquipmentViewModel(item));
}

export function getEquipmentById(equipmentId) {
  const raw = EQUIPMENT_RAW_LIST.find((item) => item.id === equipmentId);
  return raw ? buildEquipmentViewModel(raw) : null;
}

export function getDefaultEquipmentId() {
  return EQUIPMENT_RAW_LIST[0]?.id ?? null;
}

export function getRunningSession(equipmentId) {
  const equipment = getEquipmentById(equipmentId);
  if (!equipment?.runningSession) return null;

  return {
    ...equipment.runningSession,
    equipmentId: equipment.id,
    equipmentName: equipment.name,
    partName: getLotPrimaryPartName(equipment.runningSession.lotNo),
  };
}

/** @deprecated getRunningSession — QR Sprint 1 alias */
export function getActiveChargingSession(equipmentId) {
  return getRunningSession(equipmentId);
}

export function getChargeableLots(equipmentId) {
  const equipment = getEquipmentById(equipmentId);
  if (!equipment || equipment.status !== "ready") {
    return [];
  }
  return equipment.chargeableLots.map((row) => ({ ...row }));
}

/** @deprecated getChargeableLots */
export function getAvailableLots(equipmentId) {
  return getChargeableLots(equipmentId);
}

export function getLotProducts(lotNo) {
  const key = String(lotNo ?? "").trim();
  if (!key) return [];
  return (EQUIPMENT_LOT_PRODUCTS[key] ?? []).map((row) => ({ ...row }));
}

function getLotPrimaryPartName(lotNo) {
  return getLotProducts(lotNo)[0]?.partName ?? "—";
}

export function getEquipmentSummary() {
  const list = getEquipmentList();
  /** @type {Record<string, number>} */
  const counts = Object.fromEntries(EQUIPMENT_RUN_STATUS_SSOT.map((key) => [key, 0]));

  list.forEach((item) => {
    if (counts[item.status] != null) {
      counts[item.status] += 1;
    }
  });

  return {
    total: list.length,
    idle: counts.idle,
    ready: counts.ready,
    running: counts.running,
    maintenance: counts.maintenance,
  };
}

/**
 * HOME · QR 상세 패널용
 * @param {string | null | undefined} equipmentId
 */
export function getEquipmentDetailSnapshot(equipmentId) {
  const equipment = getEquipmentById(equipmentId);
  if (!equipment) return null;

  const activeLotNo =
    equipment.runningSession?.lotNo ?? equipment.chargeableLots[0]?.lotNo ?? null;
  const sameLotProducts = activeLotNo ? getLotProducts(activeLotNo) : [];

  return {
    equipmentId: equipment.id,
    equipmentName: equipment.name,
    process: equipment.process,
    status: equipment.status,
    currentLotNo: equipment.runningSession?.lotNo ?? null,
    startTime: equipment.runningSession?.startTime ?? null,
    expectedEndTime: equipment.runningSession?.expectedEndTime ?? null,
    progress: equipment.runningSession?.progress ?? 0,
    statusLabel: equipment.runningSession?.statusLabel ?? null,
    chargeableLots: equipment.chargeableLots,
    displayLots: equipment.displayLots,
    sameLotProducts,
    sameLotProductCount: sameLotProducts.length,
    chargingButtons: equipment.chargingButtons,
  };
}

/**
 * MES Dashboard 카드용 ViewModel
 * @param {import("../config/equipmentConfig").EquipmentRawRecord | string} equipmentOrId
 */
export function getEquipmentMonitorCard(equipmentOrId) {
  const equipment =
    typeof equipmentOrId === "string" ? getEquipmentById(equipmentOrId) : equipmentOrId;
  if (!equipment) return null;

  const activeLotNo =
    equipment.runningSession?.lotNo ?? equipment.chargeableLots[0]?.lotNo ?? null;
  const sameLotProducts = activeLotNo ? getLotProducts(activeLotNo) : [];

  return {
    equipmentId: equipment.id,
    equipmentName: equipment.name,
    process: equipment.process,
    status: equipment.status,
    currentLotNo: equipment.runningSession?.lotNo ?? activeLotNo,
    startTime: equipment.runningSession?.startTime ?? null,
    expectedEndTime: equipment.runningSession?.expectedEndTime ?? null,
    progress: equipment.runningSession?.progress ?? 0,
    sameLotProductCount: sameLotProducts.length,
    displayLots: equipment.displayLots,
  };
}

/** 공정 그룹별 설비 목록 (MES Dashboard · 30대+ 확장) */
export function getEquipmentListGroupedByProcess() {
  /** @type {Map<string, ReturnType<typeof getEquipmentMonitorCard>[]>} */
  const groupMap = new Map();

  getEquipmentList().forEach((item) => {
    const process = item.process || "기타";
    if (!groupMap.has(process)) {
      groupMap.set(process, []);
    }
    const card = getEquipmentMonitorCard(item);
    if (card) {
      groupMap.get(process).push(card);
    }
  });

  const orderedProcesses = [
    ...EQUIPMENT_PROCESS_GROUP_ORDER.filter((process) => groupMap.has(process)),
    ...[...groupMap.keys()].filter((process) => !EQUIPMENT_PROCESS_GROUP_ORDER.includes(process)),
  ];

  return orderedProcesses.map((process) => ({
    process,
    items: groupMap.get(process) ?? [],
  }));
}
