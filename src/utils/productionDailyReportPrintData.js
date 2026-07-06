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

export function getRecordsForProductionLot(
  lotNo,
  records = getSessionProductionRecords(),
  options = {}
) {
  const { registeredOnly = true } = options;
  const key = normalizeProductionLotKey(lotNo);
  if (!key) return [];

  return records
    .filter((record) => {
      if (normalizeProductionLotKey(record.lotNo) !== key) return false;
      if (registeredOnly && !record.registered) return false;
      return true;
    })
    .sort((a, b) => String(a.id).localeCompare(String(b.id)));
}

/**
 * 체크한 list Row → 출력용 record (체크 Row 우선 · 날짜/registered로 제외하지 않음)
 * @param {object} row
 * @param {object[]} [records]
 */
export function resolveProductionDailyPrintChargeRecordFromRow(
  row,
  records = getSessionProductionRecords()
) {
  const source = row?.record ?? row;
  const managementId = String(source?.id ?? row?.id ?? row?.managementId ?? "").trim();
  if (!managementId) return null;

  const sessionRecord = records.find((item) => item.id === managementId);
  const record = {
    ...(sessionRecord ?? {}),
    ...source,
    id: managementId,
    lotNo: String(source.lotNo ?? sessionRecord?.lotNo ?? row.lotNo ?? "").trim(),
    workDate:
      source.workDate ??
      sessionRecord?.workDate ??
      row.workDate ??
      source.productionDate ??
      sessionRecord?.productionDate ??
      "",
  };

  if (!normalizeProductionLotKey(record.lotNo)) return null;

  return record;
}

/**
 * 체크박스 선택 행 → 생산일보 출력 chargeRecords (중복 제거 없음 · 리스트 순서 유지)
 * @param {object[]} selectedRows
 * @param {object[]} [records]
 */
export function resolveProductionDailyPrintChargeRecords(
  selectedRows = [],
  records = getSessionProductionRecords()
) {
  const chargeRecords = [];

  selectedRows.forEach((row) => {
    const record = resolveProductionDailyPrintChargeRecordFromRow(row, records);
    if (record) chargeRecords.push(record);
  });

  return chargeRecords;
}

/**
 * 선택 Row 수 = 출력 chargeRecords 수 검증
 * @returns {{ ok: true, chargeRecords: object[] } | { ok: false, reason: string, expected?: number, actual?: number }}
 */
export function validateProductionDailyPrintSelection(
  selectedRows = [],
  records = getSessionProductionRecords()
) {
  if (!selectedRows.length) {
    return { ok: false, reason: "noSelection" };
  }

  const chargeRecords = resolveProductionDailyPrintChargeRecords(selectedRows, records);

  if (chargeRecords.length !== selectedRows.length) {
    return {
      ok: false,
      reason: "rowCountMismatch",
      expected: selectedRows.length,
      actual: chargeRecords.length,
    };
  }

  return { ok: true, chargeRecords };
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
 * @param {{ outputDate?: string, docNo?: string, chargeRecords?: object[] }} [options]
 */
export function buildProductionDailyReportLotBundle(lotNo, records = getSessionProductionRecords(), options = {}) {
  const chargeRecords =
    options.chargeRecords?.length > 0
      ? options.chargeRecords
      : getRecordsForProductionLot(lotNo, records, { registeredOnly: false });
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
    chargeProducts: chargeRecords.map((record, index) => mapRecordToProductionDailyChargeRow(record, index)),
    chargeRecords,
  };
}

/**
 * 체크박스 선택 행 기준 생산일보 bundle — LOT 전체 조회·중복 제거 없음
 * @param {object[]} selectedRows
 * @param {object[]} [records]
 * @param {{ outputDate?: string, docNo?: string, lotNo?: string }} [options]
 */
export function buildProductionDailyReportLotBundleFromSelectedRows(
  selectedRows = [],
  records = getSessionProductionRecords(),
  options = {}
) {
  const validation = validateProductionDailyPrintSelection(selectedRows, records);
  if (!validation.ok) {
    if (validation.reason === "rowCountMismatch") {
      console.error(
        "[생산일보 출력] 선택 Row 수와 출력 대상 수 불일치",
        validation.expected,
        validation.actual
      );
    }
    return null;
  }

  const chargeRecords = validation.chargeRecords;
  if (!chargeRecords.length) return null;

  const lotNo =
    options.lotNo?.trim() ||
    chargeRecords.find((record) => record.lotNo?.trim())?.lotNo?.trim() ||
    "";

  return buildProductionDailyReportLotBundle(lotNo, records, {
    ...options,
    chargeRecords,
  });
}

/**
 * 선택 행 기준 — LOT당 1부 출력물 (각 LOT는 체크된 행만 포함)
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
    const key = normalizeProductionLotKey(record?.lotNo ?? row.lotNo);
    if (!key) return;
    if (!lotKeys.includes(key)) lotKeys.push(key);
  });

  const date = outputDate.replace(/-/g, "");
  const prefix = `DPR-${date}-`;
  const baseSeq = Number.parseInt(generateDprDocumentNo(outputDate, records).slice(prefix.length), 10) || 1;

  return lotKeys
    .map((key, index) => {
      const rowsForLot = targetRows.filter((row) => {
        const record = row.record ?? row;
        return normalizeProductionLotKey(record?.lotNo ?? row.lotNo) === key;
      });
      const docNo = `${prefix}${String(baseSeq + index).padStart(3, "0")}`;
      return buildProductionDailyReportLotBundleFromSelectedRows(rowsForLot, records, {
        outputDate,
        docNo,
        lotNo: rowsForLot[0]?.record?.lotNo ?? rowsForLot[0]?.lotNo ?? key,
      });
    })
    .filter(Boolean);
}
