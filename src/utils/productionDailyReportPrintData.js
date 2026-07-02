/**
 * 생산일보 출력 — LOT 단위 · 등록 데이터 연동
 */

import { getProductionProcessName } from "../config/productionProcessCodes";
import { formatQtyWithUnit } from "./productUnits";
import { getSessionProductionRecords } from "./productionRecords";
import { getPrintOutputDate } from "./titanPrintDates";

export function normalizeProductionLotKey(lotNo) {
  return String(lotNo ?? "")
    .trim()
    .toUpperCase();
}

export function isProductionDailyReportPrintReady(record) {
  return Boolean(record?.registered && normalizeProductionLotKey(record?.lotNo));
}

export function getRecordsForProductionLot(lotNo, records = getSessionProductionRecords()) {
  const key = normalizeProductionLotKey(lotNo);
  if (!key) return [];

  return records
    .filter((record) => normalizeProductionLotKey(record.lotNo) === key && record.registered)
    .sort((a, b) => String(a.id).localeCompare(String(b.id)));
}

export function mapRecordToProductionDailyChargeRow(record, index) {
  return {
    no: index + 1,
    managementId: record.id ?? "",
    company: record.company ?? "",
    partName: record.partName ?? "",
    partNo: record.partNo ?? "",
    material: record.material ?? "",
    qty: Number(record.qty) || 0,
    unit: record.unit ?? "EA",
    qtyLabel: formatQtyWithUnit(Number(record.qty) || 0, record.unit ?? "EA"),
    process: getProductionProcessName(record),
  };
}

export function generateDprDocumentNo(outputDate = getPrintOutputDate(), records = getSessionProductionRecords()) {
  const date = outputDate.replace(/-/g, "");
  const prefix = `DPR-${date}-`;
  const sequences = records
    .map((record) => record.dprNo)
    .filter((value) => value?.startsWith(prefix))
    .map((value) => Number.parseInt(value.slice(prefix.length), 10))
    .filter((seq) => Number.isFinite(seq));

  const next = sequences.length ? Math.max(...sequences) + 1 : 1;
  return `${prefix}${String(next).padStart(3, "0")}`;
}

/**
 * @param {string} lotNo
 * @param {object[]} [records]
 * @param {{ outputDate?: string, docNo?: string }} [options]
 */
export function buildProductionDailyReportLotBundle(lotNo, records = getSessionProductionRecords(), options = {}) {
  const chargeRecords = getRecordsForProductionLot(lotNo, records);
  if (!chargeRecords.length) return null;

  const outputDate = options.outputDate || getPrintOutputDate();
  const primary =
    chargeRecords.find((record) => record.workDate && record.heatTreatmentConditions) ??
    chargeRecords.find((record) => record.workDate) ??
    chargeRecords[0];

  const resolvedLotNo = primary.lotNo?.trim() || String(lotNo).trim();
  const docNo = options.docNo || primary.dprNo || generateDprDocumentNo(outputDate, records);

  return {
    lotNo: resolvedLotNo,
    docNo,
    workDate: primary.workDate || "—",
    equipment: primary.equipment || "—",
    worker: primary.registrar || "관리자",
    heatTreatmentConditions: primary.heatTreatmentConditions?.trim() || "",
    note: primary.note?.trim() || "",
    chargeProducts: chargeRecords.map(mapRecordToProductionDailyChargeRow),
    chargeRecords,
  };
}

/**
 * 선택 행 기준 — LOT당 1부 출력물
 * @param {object[]} targetRows
 * @param {object[]} [records]
 * @param {{ outputDate?: string }} [options]
 */
export function buildProductionDailyReportPrintBundles(
  targetRows = [],
  records = getSessionProductionRecords(),
  options = {}
) {
  const outputDate = options.outputDate || getPrintOutputDate();
  const lotKeys = [];

  targetRows.forEach((row) => {
    const record = row.record ?? row;
    const key = normalizeProductionLotKey(record?.lotNo);
    if (!key || !isProductionDailyReportPrintReady(record)) return;
    if (!lotKeys.includes(key)) lotKeys.push(key);
  });

  const date = outputDate.replace(/-/g, "");
  const prefix = `DPR-${date}-`;
  const baseSeq = Number.parseInt(generateDprDocumentNo(outputDate, records).slice(prefix.length), 10) || 1;

  return lotKeys
    .map((key, index) => {
      const sample = records.find(
        (record) => normalizeProductionLotKey(record.lotNo) === key && record.registered
      );
      const docNo = `${prefix}${String(baseSeq + index).padStart(3, "0")}`;
      return buildProductionDailyReportLotBundle(sample?.lotNo ?? key, records, { outputDate, docNo });
    })
    .filter(Boolean);
}
