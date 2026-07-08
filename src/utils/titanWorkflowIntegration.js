/**
 * Project TITAN V1.5 — Workflow Integration Bridge
 * TitanWorkflowEngine → Legacy productionRecords · Refresh 알림
 */

import { getTitanDataEngine } from "../foundation/data";
import { getTitanWorkflowEngine } from "../foundation/workflow";
import { WORKFLOW_EVENTS } from "../foundation/workflow/workflowEvents";
import { EQUIPMENT_LOT_PRODUCTS } from "../config/equipmentConfig";
import { getRecordsForProductionLot, normalizeProductionLotKey } from "./productionDailyReportPrintData";
import { getSessionProductionRecords, updateSessionProductionRecord } from "./productionRecords";
import { onDailyReportSaved, onProductionComplete } from "./titanWorkflowStatus";
import { getCurrentTitanUser } from "./titanHistorySession";
import { recordQrTraceabilityEvent } from "./qrTraceabilitySession";
import { notifyWorkflowDataRefresh } from "./titanWorkflowRefresh";
import { getTimelineByLotNo, getTimelineByEquipmentId } from "./timelineQuery";
import { prepareCertificateLinkForLot } from "./certificateLinkPrep";
import {
  addActualWorkRecord,
  getActualWorkRecords,
  getApprovedRecipesForSelection,
  updateActualWorkRecord,
} from "./actualWorkRecordStore";
import { addKnowledgeRecord, getKnowledgeRecords } from "./knowledgeRecordStore";

/** @type {boolean} */
let integrationInitialized = false;

function todayWorkDate() {
  return new Date().toISOString().slice(0, 10);
}

function formatNowClock() {
  const date = new Date();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function formatNowDateTime() {
  const date = new Date();
  const day = date.toISOString().slice(0, 10);
  return `${day} ${formatNowClock()}`;
}

function normalizeWorkConditions(value) {
  if (!value || typeof value !== "object") return {};
  return Object.fromEntries(
    Object.entries(value)
      .map(([key, raw]) => [key, String(raw ?? "").trim()])
      .filter(([, raw]) => raw.length > 0)
  );
}

/**
 * @param {string} lotNo
 * @param {{ partName?: string }} [chargeableRow]
 */
function resolveLegacyRecordsForChargingLot(lotNo, chargeableRow = {}) {
  const key = normalizeProductionLotKey(lotNo);
  if (!key) return [];

  const records = getSessionProductionRecords();
  const byLot = records.filter((row) => normalizeProductionLotKey(row.lotNo) === key);
  if (byLot.length > 0) return byLot;

  const partName = String(chargeableRow.partName ?? "").trim();
  if (partName) {
    const byPart = records.filter(
      (row) =>
        row.incomingRegistered &&
        row.htlNo?.trim() &&
        !row.registered &&
        String(row.partName ?? "").trim() === partName
    );
    if (byPart.length > 0) return byPart;
  }

  const lotProducts = EQUIPMENT_LOT_PRODUCTS[lotNo] ?? [];
  const partNames = new Set(lotProducts.map((row) => String(row.partName ?? "").trim()).filter(Boolean));
  if (partNames.size > 0) {
    return records.filter(
      (row) =>
        row.incomingRegistered &&
        row.htlNo?.trim() &&
        partNames.has(String(row.partName ?? "").trim())
    );
  }

  return [];
}

/**
 * @param {object} params
 */
function bridgeLegacyDailyReportOnStart(params) {
  const lotNo = String(params.lotNo ?? "").trim();
  const equipmentId = String(params.equipmentId ?? "").trim();
  const equipmentName = String(params.equipmentName ?? equipmentId).trim();
  const operator = String(params.operator ?? getCurrentTitanUser() ?? "생산부").trim();
  const productionId = String(params.productionId ?? "").trim();
  const now = new Date().toISOString();
  const workDate = todayWorkDate();

  const legacyRecords = resolveLegacyRecordsForChargingLot(lotNo, params.chargeableRow ?? {});
  const touchedIds = [];

  legacyRecords.forEach((record) => {
    onDailyReportSaved(record.id, {
      registered: true,
      lotNo,
      equipment: equipmentName,
      workDate,
      operator,
      productionWorkflowId: productionId,
      dailyReportAutoCreated: true,
      dailyReportDraftStarted: true,
      updatedAt: now,
    });
    touchedIds.push(record.id);

    recordQrTraceabilityEvent(record.id, {
      type: "chargeStart",
      at: now,
      worker: operator,
      source: "workflow",
      detail: `${equipmentName} · ${lotNo}`,
    });
  });

  return touchedIds;
}

/**
 * @param {object} params
 */
function bridgeLegacyProductionCompleteOnFinish(params) {
  const lotNo = String(params.lotNo ?? "").trim();
  const equipmentName = String(params.equipmentName ?? params.equipmentId ?? "").trim();
  const operator = String(params.operator ?? getCurrentTitanUser() ?? "생산부").trim();
  const now = new Date().toISOString();

  const legacyRecords =
    getRecordsForProductionLot(lotNo, getSessionProductionRecords(), { registeredOnly: false }).length > 0
      ? getRecordsForProductionLot(lotNo, getSessionProductionRecords(), { registeredOnly: false })
      : resolveLegacyRecordsForChargingLot(lotNo, params.chargeableRow ?? {});

  const touchedIds = [];

  legacyRecords.forEach((record) => {
    if (!record.registered && lotNo) {
      updateSessionProductionRecord(record.id, {
        registered: true,
        lotNo,
        equipment: equipmentName,
        workDate: record.workDate || todayWorkDate(),
      });
    }

    onProductionComplete(record.id, {
      productionEndAt: now,
      productionCompletedAt: now,
      productionCompletedBy: operator,
      updatedAt: now,
    });
    touchedIds.push(record.id);

    recordQrTraceabilityEvent(record.id, {
      type: "productionEnd",
      at: now,
      worker: operator,
      source: "workflow",
      detail: `${equipmentName} · ${lotNo}`,
    });
  });

  return touchedIds;
}

function syncEquipmentChargeableLotsAfterStart(equipmentId, lotNo) {
  const dataEngine = getTitanDataEngine();
  const equipment = dataEngine.equipment.getById(equipmentId);
  if (!equipment?.chargeableLots?.length) return;

  const nextLots = equipment.chargeableLots.filter(
    (row) => normalizeProductionLotKey(row.lotNo) !== normalizeProductionLotKey(lotNo)
  );
  if (nextLots.length !== equipment.chargeableLots.length) {
    dataEngine.equipment.update(equipmentId, { chargeableLots: nextLots });
  }
}

function findActualWorkRecordForLot(lotNo, equipmentName = "") {
  const lotKey = normalizeProductionLotKey(lotNo);
  if (!lotKey) return null;

  return (
    getActualWorkRecords()
      .filter((row) => normalizeProductionLotKey(row.lotNo) === lotKey)
      .filter((row) => !equipmentName || row.equipmentName === equipmentName)
      .sort((a, b) => String(b.updatedAt ?? b.createdAt ?? "").localeCompare(String(a.updatedAt ?? a.createdAt ?? "")))[0] ??
    null
  );
}

function syncActualWorkOnStart(params) {
  const lotNo = String(params.lotNo ?? "").trim();
  if (!lotNo) return null;

  const equipmentName = String(params.equipmentName ?? params.equipmentId ?? "").trim();
  const operator = String(params.operator ?? getCurrentTitanUser() ?? "생산부").trim();
  const actualParameters = normalizeWorkConditions(params.workConditions);
  const existing = findActualWorkRecordForLot(lotNo, equipmentName);

  if (existing) {
    const result = updateActualWorkRecord(existing.id, {
      ...existing,
      lotNo,
      equipmentName,
      workerName: operator,
      chargeStartAt: existing.chargeStartAt || formatNowDateTime(),
      chargeEndAt: existing.chargeEndAt || "",
      workMemo: params.workMemo ?? existing.workMemo ?? "",
      actualParameters: { ...(existing.actualParameters ?? {}), ...actualParameters },
      status: "in-progress",
    });
    return result.ok ? result.row : existing;
  }

  const recipe = getApprovedRecipesForSelection()[0] ?? null;
  if (!recipe) return null;

  const result = addActualWorkRecord({
    recipeId: recipe.id,
    lotNo,
    mesManagementNo: params.managementId ?? params.chargeableRow?.managementId ?? "",
    equipmentName,
    workerName: operator,
    chargeStartAt: formatNowDateTime(),
    chargeEndAt: "",
    workMemo: params.workMemo ?? "",
    actualParameters,
    status: "in-progress",
  });
  return result.ok ? result.row : null;
}

function syncKnowledgeOnFinish(params) {
  const lotNo = String(params.lotNo ?? "").trim();
  if (!lotNo) return { actualWorkRecord: null, knowledgeRecord: null };

  const equipmentName = String(params.equipmentName ?? params.equipmentId ?? "").trim();
  const operator = String(params.operator ?? getCurrentTitanUser() ?? "생산부").trim();
  const actualParameters = normalizeWorkConditions(params.workConditions);
  const existingActual = findActualWorkRecordForLot(lotNo, equipmentName);
  let actualWorkRecord = existingActual;

  if (existingActual) {
    const result = updateActualWorkRecord(existingActual.id, {
      ...existingActual,
      lotNo,
      equipmentName,
      workerName: operator,
      chargeStartAt: existingActual.chargeStartAt || formatNowDateTime(),
      chargeEndAt: formatNowDateTime(),
      workMemo: params.workMemo ?? existingActual.workMemo ?? "",
      actualParameters: { ...(existingActual.actualParameters ?? {}), ...actualParameters },
      status: "completed",
    });
    actualWorkRecord = result.ok ? result.row : existingActual;
  } else {
    actualWorkRecord = syncActualWorkOnStart(params);
    if (actualWorkRecord) {
      const result = updateActualWorkRecord(actualWorkRecord.id, {
        ...actualWorkRecord,
        chargeEndAt: formatNowDateTime(),
        status: "completed",
      });
      actualWorkRecord = result.ok ? result.row : actualWorkRecord;
    }
  }

  if (!actualWorkRecord) return { actualWorkRecord: null, knowledgeRecord: null };

  const alreadyLinked = getKnowledgeRecords().find(
    (row) => row.actualWorkRecordId === actualWorkRecord.id
  );
  if (alreadyLinked) return { actualWorkRecord, knowledgeRecord: alreadyLinked };

  const knowledge = addKnowledgeRecord({
    actualWorkRecordId: actualWorkRecord.id,
    company: params.chargeableRow?.companyName ?? params.companyName ?? "",
    partNo: params.chargeableRow?.partNo ?? params.partNo ?? "",
    partName: params.chargeableRow?.partName ?? params.productName ?? "",
    quantity: String(params.chargeableRow?.qty ?? params.quantity ?? ""),
    inspectionResult: {},
    result: "PASS",
    inspectorName: "",
    inspectedAt: "",
    knowledgeMemo: "Workflow Engine · finishCharging 자동 축적",
  });

  return {
    actualWorkRecord,
    knowledgeRecord: knowledge.ok ? knowledge.row : null,
  };
}

/**
 * @param {{
 *   equipmentId: string,
 *   lotNo: string,
 *   chargeableRow?: Record<string, unknown>,
 *   operator?: string,
 *   expectedEndTime?: string,
 * }} input
 */
export function executeStartCharging(input) {
  const equipmentId = String(input.equipmentId ?? "").trim();
  const lotNo = String(input.lotNo ?? "").trim();
  if (!equipmentId) throw new Error("equipmentId is required");
  if (!lotNo) throw new Error("lotNo is required");

  const dataEngine = getTitanDataEngine();
  const equipment = dataEngine.equipment.getById(equipmentId);
  const operator = input.operator ?? getCurrentTitanUser() ?? "생산부";

  const workflow = getTitanWorkflowEngine();
  const result = workflow.startCharging({
    ...input,
    equipmentId,
    lotNo,
    operator,
    startTime: formatNowClock(),
    equipmentName: equipment?.equipmentName ?? equipmentId,
    productName: input.chargeableRow?.partName ?? "",
    quantity: input.chargeableRow?.qty ?? 0,
  });

  syncEquipmentChargeableLotsAfterStart(equipmentId, lotNo);
  const actualWorkRecord = syncActualWorkOnStart({
    ...input,
    equipmentId,
    lotNo,
    operator,
    equipmentName: equipment?.equipmentName ?? equipmentId,
  });

  const legacyIds = bridgeLegacyDailyReportOnStart({
    ...input,
    equipmentId,
    lotNo,
    operator,
    productionId: result.productionId,
    equipmentName: equipment?.equipmentName ?? equipmentId,
  });

  notifyWorkflowDataRefresh({
    action: "startCharging",
    equipmentId,
    lotNo,
    productionId: result.productionId,
    legacyRecordIds: legacyIds,
    actualWorkRecordId: actualWorkRecord?.id ?? null,
  });

  return { ...result, legacyRecordIds: legacyIds, actualWorkRecord };
}

/**
 * @param {{
 *   equipmentId: string,
 *   lotNo?: string,
 *   productionId?: string,
 *   operator?: string,
 *   chargeableRow?: Record<string, unknown>,
 * }} input
 */
export function executeFinishCharging(input) {
  const equipmentId = String(input.equipmentId ?? "").trim();
  if (!equipmentId) throw new Error("equipmentId is required");

  const dataEngine = getTitanDataEngine();
  const equipment = dataEngine.equipment.getById(equipmentId);
  const lotNo =
    String(input.lotNo ?? "").trim() ||
    String(equipment?.runningSession?.lotNo ?? equipment?.currentLot ?? "").trim();
  const operator = input.operator ?? getCurrentTitanUser() ?? "생산부";

  const workflow = getTitanWorkflowEngine();
  const result = workflow.finishCharging({
    ...input,
    equipmentId,
    lotNo,
    operator,
    endTime: formatNowClock(),
  });

  const legacyIds = bridgeLegacyProductionCompleteOnFinish({
    ...input,
    equipmentId,
    lotNo,
    operator,
    equipmentName: equipment?.equipmentName ?? equipmentId,
  });
  const knowledgeSync = syncKnowledgeOnFinish({
    ...input,
    equipmentId,
    lotNo,
    operator,
    equipmentName: equipment?.equipmentName ?? equipmentId,
  });

  notifyWorkflowDataRefresh({
    action: "finishCharging",
    equipmentId,
    lotNo,
    productionId: result.productionId,
    legacyRecordIds: legacyIds,
    actualWorkRecordId: knowledgeSync.actualWorkRecord?.id ?? null,
    knowledgeRecordId: knowledgeSync.knowledgeRecord?.id ?? null,
  });

  return { ...result, legacyRecordIds: legacyIds, ...knowledgeSync };
}

/** @param {string} [equipmentId] @param {string} [lotNo] */
export function getWorkflowTimelineItems(equipmentId, lotNo) {
  const equipmentKey = String(equipmentId ?? "").trim();
  const lotKey = normalizeProductionLotKey(lotNo);

  const rows = lotKey
    ? getTimelineByLotNo(lotKey)
    : equipmentKey
      ? getTimelineByEquipmentId(equipmentKey)
      : getTitanDataEngine().timeline.list().slice(0, 20);

  return rows.slice(0, 20).map((row) => ({
    time: row.time ?? "—",
    label: row.title ?? "—",
    detail: row.detail ?? row.user ?? "",
    lotNo: row.lotNo ?? "",
    equipmentId: row.equipmentId ?? "",
  }));
}

export { getTimelineByLotNo, getTimelineByEquipmentId, prepareCertificateLinkForLot };

export function initTitanWorkflowIntegration() {
  if (integrationInitialized) return;
  integrationInitialized = true;

  const workflow = getTitanWorkflowEngine();

  const refreshEvents = [
    WORKFLOW_EVENTS.PRODUCTION_STARTED,
    WORKFLOW_EVENTS.PRODUCTION_FINISHED,
    WORKFLOW_EVENTS.DASHBOARD_REFRESHED,
    WORKFLOW_EVENTS.EQUIPMENT_STATE_CHANGED,
  ];

  refreshEvents.forEach((eventName) => {
    workflow.on(eventName, (payload) => {
      notifyWorkflowDataRefresh({ event: eventName, payload });
    });
  });
}

export function resetTitanWorkflowIntegrationForTests() {
  integrationInitialized = false;
}
