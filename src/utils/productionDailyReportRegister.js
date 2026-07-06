/**
 * 생산일보 등록 — 장입 제품 · 열처리 조건
 */

import { createEmptyProductionDailyReportRegister } from "../config/listSearchStandard";
import { hasInspectionLogForManagementId } from "./inspectionLogSession";
import { getSessionProductionRecords, updateSessionProductionRecord } from "./productionRecords";
import {
  getRecordsForProductionLot,
  normalizeProductionLotKey,
} from "./productionDailyReportPrintData";
import { WORKFLOW_STATUS } from "./titanWorkflowStatus";
import { isProductionComplete } from "./productionComplete";

export function mapRecordToChargeProduct(record) {
  if (!record) return null;

  return {
    managementId: record.id,
    company: record.company || "",
    partName: record.partName || "",
    partNo: record.partNo || "",
    material: record.material || "",
    qty: record.qty != null ? String(record.qty) : "",
    process: record.heatTreatment || "",
    htlNo: record.htlNo || "",
  };
}

export function formatHeatTreatmentConditionRows(rows = []) {
  return rows
    .map((row) => {
      const temperature = String(row?.temperature ?? "").trim();
      const duration = String(row?.duration ?? "").trim();
      const parts = [];
      if (temperature) parts.push(`${temperature}℃`);
      if (duration) parts.push(`${duration}시간`);
      return parts.join(" ");
    })
    .filter(Boolean)
    .join(" + ");
}

export function parseHeatTreatmentConditionRows(text = "") {
  const trimmed = String(text ?? "").trim();
  if (!trimmed) return [{ temperature: "", duration: "" }];

  const rows = trimmed
    .split(/\s*\+\s*/)
    .map((segment) => {
      const temperature = segment.match(/([\d.]+)\s*℃/)?.[1] ?? "";
      const duration = segment.match(/([\d.]+)\s*시간/)?.[1] ?? "";
      return { temperature, duration };
    })
    .filter((row) => row.temperature || row.duration);

  return rows.length ? rows : [{ temperature: "", duration: "" }];
}

export function hasHeatTreatmentConditionInput(rows = []) {
  return rows.some(
    (row) => String(row?.temperature ?? "").trim() || String(row?.duration ?? "").trim()
  );
}

function buildProductionDailyReportCancelPatch() {
  return {
    registered: false,
    lotNo: "",
    heatTreatmentConditions: "",
    workDate: "",
    equipment: "",
    workflowStatus: WORKFLOW_STATUS.PROD_PROGRESS,
    completionStatus: "작업중",
    dailyReportDraftStarted: false,
    productionEndAt: "",
    productionCompletedAt: "",
    productionCompletedBy: "",
    productionWorkLog: null,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * @param {string} lotNo
 * @param {object[]} [records]
 */
export function buildProductionDailyReportFormFromLot(lotNo, records = getSessionProductionRecords()) {
  const lotRecords = getRecordsForProductionLot(lotNo, records);
  if (!lotRecords.length) return createEmptyProductionDailyReportRegister();

  const primary =
    lotRecords.find((record) => record.workDate && record.heatTreatmentConditions) ??
    lotRecords.find((record) => record.workDate) ??
    lotRecords[0];

  return {
    lotNo: primary.lotNo?.trim() || String(lotNo).trim(),
    chargeProducts: lotRecords.map(mapRecordToChargeProduct).filter(Boolean),
    heatTreatmentConditionRows: parseHeatTreatmentConditionRows(primary.heatTreatmentConditions),
    workDate: primary.workDate || "",
    equipment: primary.equipment || "",
    worker: primary.registrar || "관리자",
    note: primary.note?.trim() || "",
  };
}

/**
 * @param {string} lotNo
 * @param {object[]} [records]
 */
export function canCancelProductionDailyReportLot(lotNo, records = getSessionProductionRecords()) {
  const lotRecords = getRecordsForProductionLot(lotNo, records);
  if (!lotRecords.length) {
    return { ok: false, reason: "취소할 생산일보 LOT가 없습니다." };
  }

  const blocked = lotRecords.find((record) => hasInspectionLogForManagementId(record.id));
  if (blocked) {
    return {
      ok: false,
      reason: "검사일지가 등록된 LOT는 생산일보를 취소할 수 없습니다.",
    };
  }

  const completed = lotRecords.find((record) => isProductionComplete(record));
  if (completed) {
    return {
      ok: false,
      reason: "생산 완료 처리된 LOT는 생산일보를 취소할 수 없습니다.",
    };
  }

  return { ok: true, records: lotRecords };
}

function revertProductionDailyReportRecord(managementId) {
  const id = managementId?.trim();
  if (!id) return;

  updateSessionProductionRecord(id, buildProductionDailyReportCancelPatch());
}

/**
 * @param {string} lotNo
 * @param {object[]} [records]
 */
export function cancelProductionDailyReportLot(lotNo, records = getSessionProductionRecords()) {
  const check = canCancelProductionDailyReportLot(lotNo, records);
  if (!check.ok) return check;

  check.records.forEach((record) => revertProductionDailyReportRecord(record.id));
  return { ok: true };
}

/**
 * Edit save — removed products from an existing lot bundle.
 * @param {string[]} managementIds
 * @param {object[]} [records]
 */
export function revertProductionDailyReportRecords(managementIds = [], records = getSessionProductionRecords()) {
  const lotKeys = new Set(
    managementIds
      .map((id) => {
        const record = records.find((item) => item.id === id);
        return record ? normalizeProductionLotKey(record.lotNo) : "";
      })
      .filter(Boolean)
  );

  for (const lotKey of lotKeys) {
    const cancelCheck = canCancelProductionDailyReportLot(lotKey, records);
    if (!cancelCheck.ok) return cancelCheck;
  }

  managementIds.forEach((id) => revertProductionDailyReportRecord(id));
  return { ok: true };
}

