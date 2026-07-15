/**
 * Project TITAN V1.5 — Workflow Integration Bridge
 * TitanWorkflowEngine → Legacy productionRecords · Refresh 알림
 */

import { getTitanDataEngine } from "../foundation/data";
import { getTitanWorkflowEngine } from "../foundation/workflow";
import { WORKFLOW_EVENTS } from "../foundation/workflow/workflowEvents";
import { EQUIPMENT_LOT_PRODUCTS } from "../config/equipmentConfig";
import { getRecordsForProductionLot, normalizeProductionLotKey } from "./productionDailyReportPrintData";
import { getLotBundle } from "./lotBundleService";
import { getSessionProductionRecords, updateSessionProductionRecord } from "./productionRecords";
import { onDailyReportSaved, onProductionComplete, WORKFLOW_STATUS } from "./titanWorkflowStatus";
import { getCurrentTitanUser } from "./titanHistorySession";
import { recordQrTraceabilityEvent } from "./qrTraceabilitySession";
import { notifyWorkflowDataRefresh } from "./titanWorkflowRefresh";
import { getTimelineByLotNo, getTimelineByEquipmentId } from "./timelineQuery";
import { prepareCertificateLinkForLot } from "./certificateLinkPrep";
import { recordLotEquipmentLifecycleEvent } from "./productionPlanLot";
import {
  addActualWorkRecord,
  getActualWorkRecords,
  getApprovedRecipesForSelection,
  getRecipeById,
  updateActualWorkRecord,
} from "./actualWorkRecordStore";
import { addKnowledgeRecord, getKnowledgeRecords } from "./knowledgeRecordStore";
import {
  appendWorkflowChangeLog,
  buildWorkflowChangeLogEntry,
  resolveProcessStepCompletion,
} from "./productProcessWorkflow";
import {
  appendChargeHistory,
  completeLatestChargeHistoryEntry,
  resolveRemainingChargeQty,
  resolveTotalChargedQty,
  hasOtherInProgressChargeSessions,
  hasInProgressChargeOnEquipment,
} from "./equipmentChargingQty";
import {
  recordMatchesEquipmentProcess,
  reconcileAllEquipmentSessionsInStore,
} from "./equipmentWorkflowService";

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

function resolveLegacyRecordsForChargingLot(lotNo, chargeableRow = {}, equipmentId = "") {
  const records = getSessionProductionRecords();
  const sourceRecordId = String(
    chargeableRow.sourceRecordId ?? chargeableRow.managementId ?? ""
  ).trim();

  if (sourceRecordId) {
    const bySource = records.filter((row) => String(row.id ?? "").trim() === sourceRecordId);
    if (bySource.length > 0) return bySource;
    const byMesNo = records.filter(
      (row) => String(row.mesManagementNo ?? "").trim() === sourceRecordId
    );
    if (byMesNo.length > 0) return byMesNo;
  }

  const key = normalizeProductionLotKey(lotNo);
  if (!key) return [];

  const byLot = records.filter((row) => normalizeProductionLotKey(row.lotNo) === key);
  if (byLot.length > 0) return byLot;

  const equipmentKey = String(equipmentId ?? "").trim();
  if (equipmentKey) {
    try {
      const equipment = getTitanDataEngine().equipment.getById(equipmentKey);
      const session = equipment?.runningSession ?? null;
      const targets = Array.isArray(session?.chargeTargets) ? session.chargeTargets : [];
      const lotItems = Array.isArray(session?.lotItems) ? session.lotItems : [];
      const sourceIds = new Set(
        [...targets, ...lotItems]
          .map((row) => String(row?.sourceRecordId ?? "").trim())
          .filter(Boolean)
      );
      if (sourceIds.size > 0) {
        const byTargets = records.filter((row) => sourceIds.has(String(row.id ?? "").trim()));
        if (byTargets.length > 0) return byTargets;
      }
    } catch {
      // partial engine
    }
  }

  const partName = String(chargeableRow.partName ?? "").trim();
  if (partName && chargeableRow.source === "production-waiting") {
    const byWaitingPart = records.filter(
      (row) =>
        row.incomingRegistered &&
        !row.registered &&
        String(row.partName ?? row.productName ?? "").trim() === partName
    );
    if (byWaitingPart.length > 0) return byWaitingPart;
  }

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
  const bundleItems = getLotBundle(lotNo)?.lotItems ?? [];
  if (bundleItems.length > 0) {
    const sourceIds = new Set(
      bundleItems.map((row) => String(row.sourceRecordId ?? "").trim()).filter(Boolean)
    );
    const byBundle = records.filter((row) => sourceIds.has(String(row.id ?? "").trim()));
    if (byBundle.length > 0) return byBundle;
  }

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

function resolveAllRecordsForChargingFinish(params = {}) {
  const lotNo = String(params.lotNo ?? "").trim();
  const equipmentId = String(params.equipmentId ?? "").trim();

  const byLot = getRecordsForProductionLot(lotNo, getSessionProductionRecords(), {
    registeredOnly: false,
  });
  if (byLot.length > 0) return byLot;

  const byChargeTargets = resolveLegacyRecordsForChargingLot(
    lotNo,
    params.chargeableRow ?? {},
    equipmentId
  );
  if (byChargeTargets.length > 0) return byChargeTargets;

  return [];
}

function appendLegacyFinishRecordFallback(legacyRecords, params = {}) {
  if (legacyRecords.length > 0) return legacyRecords;

  const chargeSourceRecordId = String(
    params.chargeableRow?.sourceRecordId ?? params.chargeableRow?.managementId ?? ""
  ).trim();
  if (chargeSourceRecordId) {
    const fallback = getSessionProductionRecords().find(
      (row) =>
        String(row.id ?? "").trim() === chargeSourceRecordId ||
        String(row.mesManagementNo ?? "").trim() === chargeSourceRecordId
    );
    if (fallback) {
      legacyRecords.push(fallback);
      return legacyRecords;
    }
  }

  const equipmentId = String(params.equipmentId ?? "").trim();
  const engineEquipment = equipmentId ? getTitanDataEngine().equipment.getById(equipmentId) : null;
  const productionWorkflowId = String(
    params.productionId ??
      engineEquipment?.runningSession?.productionId ??
      ""
  ).trim();

  if (productionWorkflowId) {
    const byWorkflow = getSessionProductionRecords().filter(
      (row) => String(row.productionWorkflowId ?? "").trim() === productionWorkflowId
    );
    if (byWorkflow.length > 0) {
      legacyRecords.push(...byWorkflow);
    }
  }

  return legacyRecords;
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
  const startClock = String(params.startTime ?? formatNowClock()).trim();
  const startDateTime = `${workDate} ${startClock}`;

  const legacyRecords = resolveLegacyRecordsForChargingLot(lotNo, params.chargeableRow ?? {});
  const touchedIds = [];
  const chargeSourceRecordId = String(
    params.chargeableRow?.sourceRecordId ?? params.chargeableRow?.managementId ?? ""
  ).trim();

  if (legacyRecords.length === 0 && chargeSourceRecordId) {
    const fallback = getSessionProductionRecords().find(
      (row) =>
        String(row.id ?? "").trim() === chargeSourceRecordId ||
        String(row.mesManagementNo ?? "").trim() === chargeSourceRecordId
    );
    if (fallback) legacyRecords.push(fallback);
  }

  legacyRecords.forEach((record) => {
    const explicitChargeQty = Number(params.chargeQty ?? params.chargeableRow?.chargeQty);
    const chargeQty =
      Number.isFinite(explicitChargeQty) && explicitChargeQty > 0
        ? explicitChargeQty
        : Number(record.workQty ?? record.qty) || 0;
    const inboundQty =
      Number(params.chargeableRow?.inboundQty ?? record.inboundQty ?? record.qty) || chargeQty;
    const maxChargeable = resolveRemainingChargeQty(record) || inboundQty;
    const remainingChargeQty =
      params.chargeQtyMeta != null && Number.isFinite(Number(params.chargeQtyMeta.remainingQty))
        ? Math.max(0, Number(params.chargeQtyMeta.remainingQty) || 0)
        : Math.max(0, maxChargeable - chargeQty);
    const chargeDetail =
      chargeQty > 0
        ? `${equipmentName} · ${lotNo} · 장입 ${chargeQty.toLocaleString("ko-KR")} EA`
        : `${equipmentName} · ${lotNo}`;

    const alreadyActiveOnEquipment = hasInProgressChargeOnEquipment(record, equipmentId);
    const otherActiveSessions = hasOtherInProgressChargeSessions(record, equipmentId);
    const nextChargeHistory = alreadyActiveOnEquipment
      ? record.chargeHistory
      : appendChargeHistory(record.chargeHistory, {
          chargeQty,
          inboundQty,
          lotNo,
          equipmentId,
          equipmentName,
          productionId,
          startedAt: startDateTime,
          status: "in-progress",
        });

    const sessionPatch = {
      inboundQty,
      workQty: chargeQty,
      chargeQty,
      remainingChargeQty,
      chargeHistory: nextChargeHistory,
      productionWorkLog: {
        ...(record.productionWorkLog ?? {}),
        startAt: startDateTime,
        worker: operator,
        equipment: equipmentName,
        source: "equipment-charging",
        chargeQty,
        inboundQty,
      },
      updatedAt: now,
      // P0: 작업일보 row visible at Start (not Finish)
      registered: true,
      lotNo,
      dailyReportAutoCreated: true,
      dailyReportDraftStarted: true,
    };

    if (!otherActiveSessions && !alreadyActiveOnEquipment) {
      Object.assign(sessionPatch, {
        equipment: equipmentName,
        equipmentId,
        workDate,
        registrar: operator,
        worker: operator,
        operator,
        productionStartAt: now,
        chargeStartAt: startDateTime,
        productionWorkflowId: productionId,
        awaitingNextProcessStep: false,
      });
    }

    onDailyReportSaved(record.id, sessionPatch);
    touchedIds.push(record.id);

    recordQrTraceabilityEvent(record.id, {
      type: "chargeStart",
      at: now,
      worker: operator,
      source: "workflow",
      detail: chargeDetail,
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
  const endClock = String(params.endTime ?? formatNowClock()).trim();
  const endDateTime = `${todayWorkDate()} ${endClock}`;

  const legacyRecords = appendLegacyFinishRecordFallback(
    resolveAllRecordsForChargingFinish(params),
    params
  );

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

    const freshRecord =
      getSessionProductionRecords().find((row) => row.id === record.id) ?? record;
    const completion = resolveProcessStepCompletion(
      freshRecord,
      params.nextProcessStepIndex ?? null
    );
    const productionWorkLogPatch = {
      productionWorkLog: {
        ...(freshRecord.productionWorkLog ?? {}),
        endAt: endDateTime,
        completedAt: now,
        worker: operator,
        equipment: equipmentName,
        source: "equipment-charging",
      },
      updatedAt: now,
    };

    if (completion?.mode === "advance") {
      let workflowChangeLog = freshRecord.workflowChangeLog;
      if (!completion.isAutoAdvance) {
        workflowChangeLog = appendWorkflowChangeLog(
          freshRecord,
          buildWorkflowChangeLogEntry(freshRecord, {
            fromIndex: completion.fromIndex,
            toIndex: completion.toIndex,
            user: operator,
            note: params.workflowChangeNote,
          })
        );
      }

      const inboundQtyForAdvance = Number(freshRecord.inboundQty ?? freshRecord.qty) || 0;
      const completedHistory = completeLatestChargeHistoryEntry(freshRecord.chargeHistory, lotNo, {
        completedAt: now,
        chargeQty: Number(freshRecord.chargeQty ?? freshRecord.workQty) || 0,
        equipmentId: params.equipmentId,
        equipmentName,
        productionId: params.productionId,
        status: "completed",
      });

      updateSessionProductionRecord(freshRecord.id, {
        ...completion.patch,
        workflowChangeLog,
        ...productionWorkLogPatch,
        lotNo: "",
        registered: false,
        workQty: inboundQtyForAdvance,
        chargeQty: "",
        remainingChargeQty: inboundQtyForAdvance,
        chargeHistory: completedHistory,
        productionWorkflowId: "",
        productionStartAt: "",
        chargeStartAt: "",
      });
      touchedIds.push(freshRecord.id);

      const advancedRecord =
        getSessionProductionRecords().find((row) => row.id === freshRecord.id) ?? freshRecord;
      purgeChargeableStoreRowsForRecord(advancedRecord, params.equipmentId);

      recordQrTraceabilityEvent(freshRecord.id, {
        type: "processStepComplete",
        at: now,
        worker: operator,
        source: "workflow",
        detail: `${equipmentName} · ${lotNo} · ${completion.patch.currentProcessDetail ?? ""}`,
      });
      return;
    }

    const inboundQtyForFinish = Number(freshRecord.inboundQty ?? freshRecord.qty) || 0;
    const sessionChargeQty = Number(freshRecord.chargeQty ?? freshRecord.workQty) || 0;
    const alreadyCharged = resolveTotalChargedQty(freshRecord);
    const storedRemaining = Number(freshRecord.remainingChargeQty);
    const remainingChargeQty =
      Number.isFinite(storedRemaining) && storedRemaining >= 0
        ? storedRemaining
        : Math.max(0, inboundQtyForFinish - alreadyCharged - sessionChargeQty);
    const otherActiveSessions = hasOtherInProgressChargeSessions(freshRecord, params.equipmentId);
    const completedHistory = completeLatestChargeHistoryEntry(freshRecord.chargeHistory, lotNo, {
      completedAt: now,
      chargeQty: sessionChargeQty,
      equipmentId: params.equipmentId,
      equipmentName,
      productionId: params.productionId,
    });

    if (otherActiveSessions) {
      updateSessionProductionRecord(freshRecord.id, {
        chargeHistory: completedHistory,
        totalChargedQty: alreadyCharged + sessionChargeQty,
        productionWorkLog: {
          ...(freshRecord.productionWorkLog ?? {}),
          endAt: endDateTime,
          completedAt: now,
          chargeQty: sessionChargeQty,
          inboundQty: inboundQtyForFinish,
        },
        updatedAt: now,
      });
      touchedIds.push(freshRecord.id);

      recordQrTraceabilityEvent(freshRecord.id, {
        type: "productionEnd",
        at: now,
        worker: operator,
        source: "workflow",
        detail:
          sessionChargeQty > 0
            ? `${equipmentName} · ${lotNo} · 장입 ${sessionChargeQty.toLocaleString("ko-KR")} EA (다른 설비 운전중)`
            : `${equipmentName} · ${lotNo}`,
      });
      return;
    }

    if (remainingChargeQty > 0) {
      const inboundQty = Number(freshRecord.inboundQty ?? freshRecord.qty) || 0;

      updateSessionProductionRecord(freshRecord.id, {
        workflowStatus: WORKFLOW_STATUS.WORK_WAIT,
        registered: false,
        dailyReportAutoCreated: false,
        dailyReportDraftStarted: false,
        productionStartAt: "",
        chargeStartAt: "",
        productionEndAt: "",
        productionCompletedAt: "",
        productionCompletedBy: "",
        productionWorkflowId: "",
        awaitingNextProcessStep: true,
        lotNo: "",
        workQty: remainingChargeQty,
        qty: inboundQty,
        inboundQty,
        remainingChargeQty,
        totalChargedQty: alreadyCharged + sessionChargeQty,
        chargeQty: "",
        chargeHistory: completedHistory,
        productionWorkLog: {
          ...(freshRecord.productionWorkLog ?? {}),
          endAt: endDateTime,
          completedAt: now,
          chargeQty: sessionChargeQty,
          inboundQty,
        },
        updatedAt: now,
      });

      restorePartialChargeableLot(params.equipmentId, freshRecord, remainingChargeQty);
      touchedIds.push(freshRecord.id);

      recordQrTraceabilityEvent(freshRecord.id, {
        type: "productionEnd",
        at: now,
        worker: operator,
        source: "workflow",
        detail:
          sessionChargeQty > 0
            ? `${equipmentName} · ${lotNo} · 장입 ${sessionChargeQty.toLocaleString("ko-KR")} EA (잔량 ${remainingChargeQty.toLocaleString("ko-KR")} EA)`
            : `${equipmentName} · ${lotNo}`,
      });
      return;
    }

    onProductionComplete(freshRecord.id, {
      productionEndAt: now,
      productionCompletedAt: now,
      productionCompletedBy: operator,
      chargeEndAt: endDateTime,
      workDate: freshRecord.workDate || todayWorkDate(),
      remainingChargeQty: 0,
      totalChargedQty:
        alreadyCharged + sessionChargeQty ||
        Number(freshRecord.inboundQty ?? freshRecord.qty) ||
        sessionChargeQty,
      chargeHistory: completeLatestChargeHistoryEntry(completedHistory, lotNo, {
        completedAt: now,
        chargeQty: sessionChargeQty,
        equipmentId: params.equipmentId,
        equipmentName,
        productionId: params.productionId,
        status: "completed",
      }),
      ...productionWorkLogPatch,
    });
    purgeChargeableStoreRowsForRecord(freshRecord, params.equipmentId);
    touchedIds.push(freshRecord.id);

    recordQrTraceabilityEvent(freshRecord.id, {
      type: "productionEnd",
      at: now,
      worker: operator,
      source: "workflow",
      detail:
        sessionChargeQty > 0
          ? `${equipmentName} · ${lotNo} · 장입 ${sessionChargeQty.toLocaleString("ko-KR")} EA`
          : `${equipmentName} · ${lotNo}`,
    });
  });

  return touchedIds;
}

function syncChargeableStoreRowsForRecord(record, equipmentId = "", { resetFinishingEquipment = false } = {}) {
  const dataEngine = getTitanDataEngine();
  if (!record) return;

  const sourceRecordId = String(record.id ?? "").trim();
  const finishingKey = String(equipmentId ?? "").trim();
  if (!sourceRecordId) return;

  dataEngine.equipment.list().forEach((equipment) => {
    const eqId = String(equipment.equipmentId ?? equipment.id ?? "").trim();
    if (!eqId) return;
    if (!recordMatchesEquipmentProcess(record, equipment.process, equipment.processCode)) return;

    const currentLots = Array.isArray(equipment.chargeableLots) ? equipment.chargeableLots : [];
    const nextLots = currentLots.filter(
      (row) => String(row.sourceRecordId ?? row.id ?? "").trim() !== sourceRecordId
    );
    const lotsChanged = nextLots.length !== currentLots.length;
    const isFinishingEquipment = resetFinishingEquipment && eqId === finishingKey;

    if (!lotsChanged && !isFinishingEquipment) return;

    const patch = { chargeableLots: nextLots };
    if (isFinishingEquipment) {
      patch.status = "idle";
      patch.runningSession = null;
      patch.currentLot = null;
      patch.workflowState = undefined;
    }
    dataEngine.equipment.update(eqId, patch);
  });
}

function purgeChargeableStoreRowsForRecord(record, equipmentId = "") {
  syncChargeableStoreRowsForRecord(record, equipmentId, { resetFinishingEquipment: true });
  notifyWorkflowDataRefresh({
    action: "chargeableStorePurge",
    equipmentId,
    sourceRecordId: String(record?.id ?? "").trim(),
  });
}

function restorePartialChargeableLot(equipmentId, record, remainingQty) {
  if (!record || remainingQty <= 0) return;

  syncChargeableStoreRowsForRecord(record, equipmentId, { resetFinishingEquipment: true });

  notifyWorkflowDataRefresh({
    action: "partialChargeRequeue",
    equipmentId,
    sourceRecordId: String(record.id ?? "").trim(),
    remainingQty,
  });
}

function syncEquipmentChargeableLotsAfterStart(equipmentId, lotNo, chargeableRow = {}) {
  const dataEngine = getTitanDataEngine();
  const equipment = dataEngine.equipment.getById(equipmentId);
  if (!equipment?.chargeableLots?.length) return;

  const sourceRecordId = String(chargeableRow?.sourceRecordId ?? chargeableRow?.id ?? "").trim();
  let remainingQty = Number(chargeableRow?.remainingChargeQty ?? 0);
  if (sourceRecordId) {
    const sessionRecord = getSessionProductionRecords().find(
      (row) => String(row.id ?? "").trim() === sourceRecordId
    );
    if (sessionRecord) {
      remainingQty = resolveRemainingChargeQty(sessionRecord);
    }
  }
  const keepProductRow = remainingQty > 0;

  let nextLots = equipment.chargeableLots;

  if (sourceRecordId) {
    if (keepProductRow) {
      // P0-ARCHITECTURE-001: partial charge — keep parent inbound row with remaining qty
      const updatedRow = {
        ...chargeableRow,
        id: sourceRecordId,
        sourceRecordId,
        lotNo: "",
        qty: remainingQty,
        remainingChargeQty: remainingQty,
        needsLotCreation: true,
        statusLabel: "생산대기",
        source: "production-waiting",
      };
      const existingIndex = equipment.chargeableLots.findIndex(
        (row) => String(row.sourceRecordId ?? row.id ?? "").trim() === sourceRecordId
      );
      nextLots =
        existingIndex >= 0
          ? equipment.chargeableLots.map((row, index) =>
              index === existingIndex ? { ...row, ...updatedRow } : row
            )
          : [...equipment.chargeableLots, updatedRow];
    } else {
      nextLots = equipment.chargeableLots.filter(
        (row) => String(row.sourceRecordId ?? row.id ?? "").trim() !== sourceRecordId
      );
    }
  } else {
    const lotKey = normalizeProductionLotKey(lotNo);
    if (lotKey) {
      nextLots = equipment.chargeableLots.filter(
        (row) => normalizeProductionLotKey(row.lotNo) !== lotKey
      );
    }
  }

  const changed =
    nextLots.length !== equipment.chargeableLots.length ||
    nextLots.some((row, index) => row !== equipment.chargeableLots[index]);
  if (changed) {
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

function patchRunningSessionWorkMeta(equipmentId, patch = {}) {
  const key = String(equipmentId ?? "").trim();
  if (!key) return;

  const dataEngine = getTitanDataEngine();
  const equipment = dataEngine.equipment.getById(key);
  if (!equipment?.runningSession) return;

  dataEngine.equipment.update(key, {
    runningSession: {
      ...equipment.runningSession,
      ...patch,
    },
  });
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

  const recipeId = String(params.recipeId ?? "").trim();
  const recipe =
    (recipeId ? getRecipeById(recipeId) : null) ?? getApprovedRecipesForSelection()[0] ?? null;
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

function createWorkflowProductionId() {
  return `PRD-WF-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function buildRunningSessionLotItem(target, chargeableRow = {}) {
  const sourceRecordId = String(
    target?.sourceRecordId ?? chargeableRow?.sourceRecordId ?? chargeableRow?.id ?? ""
  ).trim();
  const chargeQty = Number(target?.chargeQty ?? chargeableRow?.chargeQty ?? chargeableRow?.qty) || 0;
  return {
    sourceRecordId,
    managementId: String(chargeableRow?.managementId ?? sourceRecordId).trim(),
    partNo: String(chargeableRow?.partNo ?? "").trim(),
    partName: String(chargeableRow?.partName ?? chargeableRow?.productName ?? "").trim(),
    material: String(chargeableRow?.material ?? "").trim(),
    company: String(chargeableRow?.company ?? "").trim(),
    chargeQty,
    qty: chargeQty,
    unit: chargeableRow?.unit ?? "EA",
  };
}

function appendRunningSessionChargeTarget(equipmentId, target, chargeableRow = {}) {
  const dataEngine = getTitanDataEngine();
  const equipment = dataEngine.equipment.getById(equipmentId);
  if (!equipment?.runningSession) return;

  const session = equipment.runningSession;
  const existingTargets = Array.isArray(session.chargeTargets) ? session.chargeTargets : [];
  const existingLotItems = Array.isArray(session.lotItems) ? session.lotItems : [];
  const primaryTarget = session.lotNo
    ? [
        {
          lotNo: session.lotNo,
          sourceRecordId: session.sourceRecordId,
          productionId: session.productionId,
          chargeQty: session.chargeQty,
        },
      ]
    : [];
  const baseTargets = existingTargets.length > 0 ? existingTargets : primaryTarget;
  const lotKey = String(target?.lotNo ?? session.lotNo ?? "").trim().toUpperCase();
  const sourceKey = String(target?.sourceRecordId ?? "").trim();
  const alreadyTracked = baseTargets.some(
    (entry) =>
      String(entry?.lotNo ?? "").trim().toUpperCase() === lotKey &&
      String(entry?.sourceRecordId ?? "").trim() === sourceKey
  );

  const nextTargets = alreadyTracked ? baseTargets : [...baseTargets, target];
  const lotItem = buildRunningSessionLotItem(target, chargeableRow);
  const nextLotItems = existingLotItems.some(
    (row) => String(row?.sourceRecordId ?? "").trim() === sourceKey
  )
    ? existingLotItems.map((row) =>
        String(row?.sourceRecordId ?? "").trim() === sourceKey ? { ...row, ...lotItem } : row
      )
    : [...existingLotItems, lotItem];

  const totalChargeQty = nextTargets.reduce(
    (sum, row) => sum + (Number(row?.chargeQty) || 0),
    0
  );

  dataEngine.equipment.update(equipmentId, {
    runningSession: {
      ...session,
      chargeTargets: nextTargets,
      lotItems: nextLotItems,
      chargeQty: totalChargeQty,
    },
  });
}

/**
 * Additional charge target on an already-running equipment (batch multi-select).
 * @param {Record<string, unknown>} input
 */
function executeStartChargingAdditionalTarget(input) {
  const equipmentId = String(input.equipmentId ?? "").trim();
  const lotNo = String(input.lotNo ?? "").trim();
  if (!equipmentId) throw new Error("equipmentId is required");
  if (!lotNo) throw new Error("lotNo is required");

  const dataEngine = getTitanDataEngine();
  const equipment = dataEngine.equipment.getById(equipmentId);
  if (!equipment?.runningSession) {
    throw new Error("설비가 장입 중이 아닙니다. 추가 장입 대상을 등록할 수 없습니다.");
  }

  const operator = input.operator ?? getCurrentTitanUser() ?? "생산부";
  const managementId = String(
    input.chargeableRow?.managementId ??
      input.chargeableRow?.sourceRecordId ??
      input.managementId ??
      ""
  ).trim();
  const productionId = String(input.productionId ?? createWorkflowProductionId()).trim();
  const now = formatNowClock();

  const workflow = getTitanWorkflowEngine();
  workflow.eventBus.emit(WORKFLOW_EVENTS.PRODUCTION_STARTED, {
    ...input,
    equipmentId,
    lotNo,
    productionId,
    operator,
    managementId,
    startTime: now,
    equipmentName: equipment?.equipmentName ?? equipmentId,
    productName: input.chargeableRow?.partName ?? "",
    quantity: input.chargeQty ?? input.chargeableRow?.chargeQty ?? input.chargeableRow?.qty ?? 0,
  });

  syncEquipmentChargeableLotsAfterStart(equipmentId, lotNo, input.chargeableRow ?? {});
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
    productionId,
    equipmentName: equipment?.equipmentName ?? equipmentId,
  });

  appendRunningSessionChargeTarget(
    equipmentId,
    {
      lotNo,
      sourceRecordId: managementId,
      productionId,
      chargeQty: Number(input.chargeQty ?? input.chargeableRow?.chargeQty) || 0,
    },
    input.chargeableRow ?? {}
  );

  recordLotEquipmentLifecycleEvent({
    lotNo,
    action: "equipmentWorkStart",
    equipmentId,
    equipmentName: equipment?.equipmentName ?? equipmentId,
    operator,
    managementIds: legacyIds,
  });

  notifyWorkflowDataRefresh({
    action: "startCharging",
    equipmentId,
    lotNo,
    productionId,
    legacyRecordIds: legacyIds,
    actualWorkRecordId: actualWorkRecord?.id ?? null,
    batchAdditional: true,
  });

  return { equipmentId, lotNo, productionId, legacyRecordIds: legacyIds, actualWorkRecord };
}

/**
 * Batch start — first item drives equipment session; additional items append chargeHistory.
 * @param {{
 *   equipmentId: string,
 *   items: Array<Record<string, unknown>>,
 *   operator?: string,
 * }} input
 */
export function executeStartChargingBatch(input) {
  const equipmentId = String(input.equipmentId ?? "").trim();
  const items = Array.isArray(input.items) ? input.items : [];
  if (!equipmentId) throw new Error("equipmentId is required");
  if (items.length === 0) throw new Error("장입할 제품을 선택하세요.");

  const sharedLotNo = String(
    input.sharedLotNo ?? input.lotNo ?? items[0]?.lotNo ?? ""
  ).trim();
  const normalizedItems = items.map((item) => ({
    ...item,
    lotNo: sharedLotNo || String(item.lotNo ?? "").trim(),
  }));

  const results = [];
  for (let index = 0; index < normalizedItems.length; index += 1) {
    const item = normalizedItems[index];
    if (index === 0) {
      results.push(
        executeStartCharging({
          ...input,
          ...item,
          equipmentId,
          lotNo: item.lotNo,
        })
      );
    } else {
      results.push(
        executeStartChargingAdditionalTarget({
          ...input,
          ...item,
          equipmentId,
          lotNo: item.lotNo,
        })
      );
    }
  }

  return { equipmentId, lotNo: sharedLotNo || normalizedItems[0]?.lotNo, results, primary: results[0] };
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
  const managementId = String(
    input.chargeableRow?.managementId ??
      input.chargeableRow?.sourceRecordId ??
      input.managementId ??
      ""
  ).trim();
  const result = workflow.startCharging({
    ...input,
    equipmentId,
    lotNo,
    operator,
    managementId,
    startTime: formatNowClock(),
    equipmentName: equipment?.equipmentName ?? equipmentId,
    productName: input.chargeableRow?.partName ?? "",
    quantity: input.chargeQty ?? input.chargeableRow?.chargeQty ?? input.chargeableRow?.qty ?? 0,
  });

  syncEquipmentChargeableLotsAfterStart(equipmentId, lotNo, input.chargeableRow ?? {});
  const actualWorkRecord = syncActualWorkOnStart({
    ...input,
    equipmentId,
    lotNo,
    operator,
    equipmentName: equipment?.equipmentName ?? equipmentId,
  });

  patchRunningSessionWorkMeta(equipmentId, {
    recipeId: actualWorkRecord?.recipeId ?? input.recipeId ?? null,
    recipeName: actualWorkRecord?.recipeName ?? null,
    chargeQty: Number(input.chargeQty ?? input.chargeableRow?.chargeQty) || undefined,
  });

  appendRunningSessionChargeTarget(
    equipmentId,
    {
      lotNo,
      sourceRecordId: managementId,
      productionId: result.productionId,
      chargeQty: Number(input.chargeQty ?? input.chargeableRow?.chargeQty) || 0,
    },
    input.chargeableRow ?? {}
  );

  const legacyIds = bridgeLegacyDailyReportOnStart({
    ...input,
    equipmentId,
    lotNo,
    operator,
    productionId: result.productionId,
    equipmentName: equipment?.equipmentName ?? equipmentId,
  });

  recordLotEquipmentLifecycleEvent({
    lotNo,
    action: "equipmentWorkStart",
    equipmentId,
    equipmentName: equipment?.equipmentName ?? equipmentId,
    operator,
    managementIds: legacyIds,
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
 *   nextProcessStepIndex?: number,
 *   workflowChangeNote?: string,
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

  recordLotEquipmentLifecycleEvent({
    lotNo,
    action: "equipmentWorkFinish",
    equipmentId,
    equipmentName: equipment?.equipmentName ?? equipmentId,
    operator,
    managementIds: legacyIds,
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

/** @deprecated executeFinishCharging — 열처리 완료 (생산 완료 → 검사대기) */
export function executeCompleteHeatTreatment(input) {
  return executeFinishCharging(input);
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

  reconcileAllEquipmentSessionsInStore();

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
