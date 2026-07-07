/**
 * Project TITAN V1.5 — 설비 Workflow Foundation SSOT
 * HOME · 설비 장입관리 · MES 설비현황 공통 데이터
 *
 * Read path: TitanDataEngine.equipmentStore → ViewModel (Fallback: equipmentConfig)
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
import { getTitanDataEngine } from "../foundation/data";

export { resolveEquipmentChargingButtons };

function readEquipmentStoreList() {
  try {
    const list = getTitanDataEngine()?.equipment?.list?.() ?? [];
    return list.length > 0 ? list : null;
  } catch {
    return null;
  }
}

/**
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
 * @param {Record<string, unknown>} storeRecord
 */
function buildEquipmentViewModelFromStore(storeRecord) {
  const status = /** @type {import("../config/equipmentConfig").EquipmentRunStatus} */ (
    storeRecord.status ?? "idle"
  );
  const runningSession = storeRecord.runningSession ?? null;
  const chargeableLots = Array.isArray(storeRecord.chargeableLots)
    ? storeRecord.chargeableLots.map((row) => ({ ...row }))
    : [];
  const displayLots = runningSession
    ? [runningSession.lotNo]
    : chargeableLots.map((row) => row.lotNo);

  return {
    id: storeRecord.equipmentId,
    name: storeRecord.equipmentName,
    process: storeRecord.process,
    code: storeRecord.code,
    maintenance: Boolean(storeRecord.maintenance),
    smartAccessId: storeRecord.smartAccessId,
    status,
    runningSession: runningSession ? { ...runningSession } : null,
    chargeableLots,
    displayLots,
    chargingButtons: resolveEquipmentChargingButtons(status),
  };
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
  const storeList = readEquipmentStoreList();
  if (storeList?.length) {
    return storeList.map((row) => buildEquipmentViewModelFromStore(row));
  }
  return [];
}

export function getEquipmentById(equipmentId) {
  const key = String(equipmentId ?? "").trim();
  if (!key) return null;

  const storeList = readEquipmentStoreList();
  if (storeList?.length) {
    const storeRecord = storeList.find((row) => row.equipmentId === key || row.code === key);
    if (storeRecord) return buildEquipmentViewModelFromStore(storeRecord);
    return null;
  }

  const raw = EQUIPMENT_RAW_LIST.find((item) => item.id === key);
  return raw ? buildEquipmentViewModel(raw) : null;
}

export function getDefaultEquipmentId() {
  const storeList = readEquipmentStoreList();
  if (storeList?.length) return storeList[0].equipmentId;
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

/**
 * 설비 알람 계산 (Blueprint ② 설비 View — 설비 알람)
 * 저장 ❌ · Engine 상태 기반 항상 계산
 * @param {{ status?: string, maintenance?: boolean, runningSession?: { progress?: number } | null }} equipment
 * @returns {{ level: "warning"|"info", label: string } | null}
 */
export function computeEquipmentAlarm(equipment) {
  if (!equipment) return null;
  if (equipment.maintenance || equipment.status === "maintenance") {
    return { level: "warning", label: "점검 필요" };
  }
  const progress = Number(equipment.runningSession?.progress ?? 0);
  if (equipment.status === "running" && progress >= 90) {
    return { level: "info", label: "종료 임박" };
  }
  return null;
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
    // Blueprint ② 설비 View 필드 (작업자 · 현재 제품 · 알람 · 가동률)
    operator: equipment.runningSession?.operator ?? null,
    currentProductName: sameLotProducts[0]?.partName ?? null,
    alarm: computeEquipmentAlarm(equipment),
    utilization: equipment.status === "running" ? equipment.runningSession?.progress ?? 0 : 0,
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
    // Blueprint ② 설비 View 필드 (작업자 · 현재 제품 · 알람 · 가동률)
    operator: equipment.runningSession?.operator ?? null,
    currentProductName: sameLotProducts[0]?.partName ?? null,
    alarm: computeEquipmentAlarm(equipment),
    utilization: equipment.status === "running" ? equipment.runningSession?.progress ?? 0 : 0,
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
