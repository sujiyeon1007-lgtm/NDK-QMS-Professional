/**

 * Project TITAN V2.0 — Production Workspace Data (Sprint 5A · 5B)

 *

 * Blueprint ④ 생산관리 — Production Shell + Task Workspaces

 *

 * 데이터 흐름:

 *   TitanDataEngine(생산 SSOT · productionRecords)

 *     → TitanWorkflowEngine Stage 판정 (workflowProcessStatus)

 *       → Production Workspace (Stage 필터)

 *         → UI

 *

 * Task Workspace 원칙:

 *   - KPI = 리스트 동일 records (예외 없음)

 *   - Plan → Charging → Daily Report 자동 Stage 이동 (Engine)

 */



import { isHeatTreatmentComplete } from "./menuWorkflowGate";

import {

  countProductionChipBucket,

  filterProductionDailyReportRecords,

  matchesProductionChipBucket,

} from "./productionDailyReportStatus";

import { getSessionProductionRecords, isIncomingRegistered } from "./productionRecords";

import { CURRENT_PROCESS_KEYS, resolveRecordCurrentProcess } from "./workflowProcessStatus";

import { getEquipmentList, getEquipmentSummary } from "./equipmentWorkflowService";

import { getWorkJournalEntries } from "./workJournalSession";

import { getJournalReferenceDate } from "./workJournalData";
import { getTitanDataEngine } from "../foundation/data";
import {
  SHOT_WORK_STATUS,
  isHeatTreatmentWorkType,
  isShotWorkComplete,
  isShotWorkType,
  normalizeShotWorkStatus,
} from "../config/workTypeWorkflow";



/** 생산계획 Task Workspace Stage — HT_WAIT · LOT 미생성 */

export const PRODUCTION_PLAN_STAGE = CURRENT_PROCESS_KEYS.HT_WAIT;



/** 설비 장입 Task Workspace — HT_WAIT · LOT 생성 · 생산일보 미등록 */

export const PRODUCTION_CHARGING_STAGE = CURRENT_PROCESS_KEYS.HT_WAIT;



/** 생산일보 Task Workspace Stage — HT_RUNNING */

export const PRODUCTION_DAILY_REPORT_STAGE = CURRENT_PROCESS_KEYS.HT_RUNNING;



/** 생산실적 Analytics Workspace — HT_COMPLETE (열처리 완료) */

export const PRODUCTION_RESULT_STAGE = CURRENT_PROCESS_KEYS.INSPECTION_WAIT;



/**

 * Production Workspace 생산 records (SSOT)

 * @returns {object[]}

 */

export function getProductionRecords() {
  const sessionRecords = getSessionProductionRecords();
  const sessionLotKeys = new Set(
    sessionRecords.map((record) => String(record?.lotNo ?? "").trim().toUpperCase()).filter(Boolean)
  );
  let manualLotRecords = [];

  try {
    manualLotRecords = getTitanDataEngine()
      .lot
      .list()
      .filter((row) => row?.source === "manual-lot")
      .filter((row) => {
        const lotKey = String(row?.lotNo ?? "").trim().toUpperCase();
        return lotKey && !sessionLotKeys.has(lotKey);
      })
      .map((row) => ({
        id: `MANUAL-${row.lotNo}`,
        mesManagementNo: `MANUAL-${row.lotNo}`,
        company: row.company || "수기 LOT",
        partName: row.productName || "수기 LOT",
        productName: row.productName || "수기 LOT",
        material: row.material || "",
        qty: Number(row.quantity) || 0,
        quantity: Number(row.quantity) || 0,
        lotNo: row.lotNo,
        equipment: row.equipmentId || "",
        workDate: row.workDate || "",
        registrar: row.operator || "생산부",
        note: row.note || "",
        registered: row.status !== "장입대기",
        incomingRegistered: true,
        workflowStatus: row.status === "검사대기" ? "INSPECTION_WAIT" : "HT_RUNNING",
        currentProcess: row.status === "검사대기" ? "검사 대기" : "열처리 중",
        source: "manual-lot",
      }));
  } catch {
    manualLotRecords = [];
  }

  return [...manualLotRecords, ...sessionRecords];

}



/** @param {object[]} records @param {(object) => boolean} predicate */

function dedupeProductionRecords(records, predicate) {

  const seen = new Set();

  const result = [];



  for (const record of records) {

    if (!predicate(record)) continue;

    const key = String(record?.id ?? "").trim();

    if (key) {

      if (seen.has(key)) continue;

      seen.add(key);

    }

    result.push(record);

  }



  return result;

}



// ─── 생산계획 (HT_WAIT · LOT 미생성) ─────────────────────────────────────────



/**

 * HT_WAIT · LOT 미생성 — LOT 생성 후 Charging Workspace로 자동 이동

 * @param {object} record

 * @returns {boolean}

 */

export function isProductionPlanStageRecord(record) {

  return (

    isHeatTreatmentWorkType(record) &&

    resolveRecordCurrentProcess(record).key === PRODUCTION_PLAN_STAGE &&

    !record?.lotNo?.trim()

  );

}



/** @deprecated Sprint 5B — LOT 생성 후 Charging 이동 */

export function isProductionPlanLotPendingRecord(record) {

  return isProductionPlanStageRecord(record);

}



/** @deprecated Sprint 5B — Charging Workspace 사용 */

export function isProductionPlanLotCreatedRecord(record) {

  return isProductionChargingStageRecord(record);

}



export function buildProductionPlanWorkspaceRecords(records = getProductionRecords()) {

  return dedupeProductionRecords(records, isProductionPlanStageRecord);

}



export function countProductionPlanWorkspace(records = buildProductionPlanWorkspaceRecords()) {

  return {

    htWait: records.length,

    lotPending: records.length,

    lotCreated: 0,

  };

}



export function getProductionPlanScreenData(records = getProductionRecords()) {

  const baseRecords = buildProductionPlanWorkspaceRecords(records);

  return {

    baseRecords,

    counts: countProductionPlanWorkspace(baseRecords),

  };

}



// ─── 설비 장입 (HT_WAIT · LOT 생성 · !registered) ───────────────────────────



/**

 * LOT 생성 완료 · 생산일보 미등록 — startCharging 시 Daily Report로 이동

 * @param {object} record

 * @returns {boolean}

 */

export function isProductionChargingStageRecord(record) {

  if (!isIncomingRegistered(record)) return false;
  if (!isHeatTreatmentWorkType(record)) return false;

  if (!record?.lotNo?.trim()) return false;

  if (record?.registered) return false;

  if (isHeatTreatmentComplete(record)) return false;

  return resolveRecordCurrentProcess(record).key === PRODUCTION_CHARGING_STAGE;

}



/** 장입 대기 — LOT 생성 · 설비 미장입 */
export function isProductionChargingPendingRecord(record) {
  return isProductionChargingStageRecord(record);
}

function collectActiveChargingLotNos(equipmentList = getEquipmentList()) {
  const lotNos = new Set();
  equipmentList.forEach((equipment) => {
    const lotNo = String(equipment?.runningSession?.lotNo ?? "").trim().toUpperCase();
    if (lotNo) lotNos.add(lotNo);
  });
  return lotNos;
}

/** 장입중 — 설비 running session 기준 */
export function isProductionChargingActiveRecord(record, activeLotNos = collectActiveChargingLotNos()) {
  if (!isProductionChargingStageRecord(record)) return false;
  const lotKey = String(record?.lotNo ?? "").trim().toUpperCase();
  return lotKey ? activeLotNos.has(lotKey) : false;
}

export function buildProductionChargingWorkspaceRecords(records = getProductionRecords()) {
  return dedupeProductionRecords(records, isProductionChargingStageRecord);
}

export function countProductionChargingWorkspace(
  records = buildProductionChargingWorkspaceRecords(),
  equipmentList = getEquipmentList()
) {
  const chargeableLots = equipmentList.reduce(
    (sum, equipment) => sum + (equipment.chargeableLots?.length ?? 0),
    0
  );
  const activeSessions = equipmentList.filter((equipment) => equipment.runningSession).length;
  const activeLotNos = collectActiveChargingLotNos(equipmentList);

  return {
    lotQueue: records.length,
    chargePending: records.filter(
      (record) => !activeLotNos.has(String(record?.lotNo ?? "").trim().toUpperCase())
    ).length,
    chargeActive: activeSessions,
    chargeableLots,
    activeSessions,
  };
}



export function getProductionChargingScreenData(records = getProductionRecords()) {

  const baseRecords = buildProductionChargingWorkspaceRecords(records);

  const equipmentSummary = getEquipmentSummary();

  const lotCounts = countProductionChargingWorkspace(baseRecords);



  return {

    baseRecords,

    equipmentSummary,

    counts: {

      ...equipmentSummary,

      ...lotCounts,

    },

  };

}



// ─── 생산일보 (HT_RUNNING) ───────────────────────────────────────────────────



/**

 * HT_RUNNING — registered + lotNo · 열처리 진행/완료 (일보 UI Freeze V1.3)

 * @param {object} record

 * @returns {boolean}

 */

export function isProductionDailyReportStageRecord(record) {
  if (!isHeatTreatmentWorkType(record)) return false;
  if (resolveRecordCurrentProcess(record).key !== PRODUCTION_DAILY_REPORT_STAGE) {
    return false;
  }
  return filterProductionDailyReportRecords([record]).length > 0;
}



export function buildProductionDailyReportWorkspaceRecords(records = getProductionRecords()) {

  return dedupeProductionRecords(records, isProductionDailyReportStageRecord);

}



export function countProductionDailyReportWorkspace(

  records = buildProductionDailyReportWorkspaceRecords()

) {

  return {

    prodProgress: countProductionChipBucket(records, "prodProgress"),

    prodDone: countProductionChipBucket(records, "prodDone"),

    htRunning: records.filter(

      (record) => resolveRecordCurrentProcess(record).key === PRODUCTION_DAILY_REPORT_STAGE

    ).length,

  };

}



export function getProductionDailyReportScreenData(records = getProductionRecords()) {

  const baseRecords = buildProductionDailyReportWorkspaceRecords(records);

  return {

    baseRecords,

    counts: countProductionDailyReportWorkspace(baseRecords),

  };

}



export function matchesProductionDailyReportWorkspaceChip(record, chipId) {

  if (chipId === "prodProgress") return matchesProductionChipBucket(record, "prodProgress");

  if (chipId === "prodDone") return matchesProductionChipBucket(record, "prodDone");

  return true;

}



// ─── 생산실적 (HT_COMPLETE · Analytics) ─────────────────────────────────────



/**

 * 열처리 완료 — Analytics 조회 전용

 * @param {object} record

 * @returns {boolean}

 */

export function isProductionResultStageRecord(record) {

  if (!isHeatTreatmentWorkType(record)) return false;

  return isHeatTreatmentComplete(record);

}



export function buildProductionResultWorkspaceRecords(records = getProductionRecords()) {

  return dedupeProductionRecords(records, isProductionResultStageRecord);

}



export function countProductionResultWorkspace(records = buildProductionResultWorkspaceRecords()) {

  return {

    completed: records.length,

    inspectionWait: records.filter(

      (record) => resolveRecordCurrentProcess(record).key === PRODUCTION_RESULT_STAGE

    ).length,

  };

}



export function getProductionResultScreenData(records = getProductionRecords()) {

  const baseRecords = buildProductionResultWorkspaceRecords(records);

  return {

    baseRecords,

    counts: countProductionResultWorkspace(baseRecords),

  };

}



// ─── 쇼트 작업현황 (Shot Work Type) ──────────────────────────────────────────



export function isShotWorkspaceRecord(record) {
  return isIncomingRegistered(record) && isShotWorkType(record);
}



export function buildShotWorkspaceRecords(records = getProductionRecords()) {
  return dedupeProductionRecords(records, isShotWorkspaceRecord);
}



export function countShotWorkspace(records = buildShotWorkspaceRecords(), referenceDate = getJournalReferenceDate()) {
  const todayRecords = records.filter(
    (record) => (record.shotWorkDate || record.shotCompletedAt || record.incomingDate) === referenceDate
  );
  const completedRecords = records.filter((record) => isShotWorkComplete(record));
  const workerTotals = new Map();

  completedRecords.forEach((record) => {
    const worker = String(record.shotWorker || record.registrar || "미지정").trim();
    workerTotals.set(worker, (workerTotals.get(worker) || 0) + (Number(record.qty) || 0));
  });

  const topWorker = [...workerTotals.entries()].sort((a, b) => b[1] - a[1])[0];

  return {
    todayCount: todayRecords.length,
    todayQty: todayRecords.reduce((sum, record) => sum + (Number(record.qty) || 0), 0),
    waiting: records.filter((record) => normalizeShotWorkStatus(record.shotStatus) === SHOT_WORK_STATUS.WAITING).length,
    completed: completedRecords.length,
    workerTopQty: topWorker?.[1] ?? 0,
    workerTopLabel: topWorker?.[0] ?? "미지정",
  };
}



export function getShotWorkScreenData(records = getProductionRecords()) {
  const baseRecords = buildShotWorkspaceRecords(records);
  return {
    baseRecords,
    counts: countShotWorkspace(baseRecords),
  };
}



// ─── 생산 업무일지 ───────────────────────────────────────────────────────────



/**

 * @param {object} [options]

 */

export function buildProductionWorkJournalWorkspaceEntries(options = {}) {

  return getWorkJournalEntries("production", options);

}



/**

 * @param {object} [options]

 */

export function getProductionWorkJournalScreenData(options = {}) {

  const referenceDate = options.referenceDate ?? getJournalReferenceDate();

  const baseRecords = buildProductionWorkJournalWorkspaceEntries(options);

  const todayEntries = baseRecords.filter((entry) => entry.date === referenceDate);



  return {

    baseRecords,

    counts: {

      total: baseRecords.length,

      today: todayEntries.length,

      manual: baseRecords.filter((entry) => entry.source !== "auto").length,

      auto: baseRecords.filter((entry) => entry.source === "auto").length,

    },

  };

}


