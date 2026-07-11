/**
 * Project TITAN — 생산 LOT 번호 (YYMMDD-설비코드+순번)
 * 예: 260626-3S3A → 26.06.26 · 3S-3호기 · A차 생산
 */

import { getSessionProductionRecords } from "./productionRecords";
import { getTitanDataEngine } from "../foundation/data";
import { getNumberingPrefix, getMasterDataByCategory } from "./masterData";
import { getCompanyAbbreviation } from "./companyAbbreviation";
import { getPrintOutputDate } from "./titanPrintDates";

/** YYMMDD-설비세gment(숫자로 끝)-순번(A-Z) */
export const NDK_PRODUCTION_LOT_PATTERN = /^(\d{6})-([A-Z0-9]*[0-9])([A-Z])$/i;

/**
 * @param {string} workDate YYYY-MM-DD
 * @returns {string} YYMMDD
 */
export function workDateToLotDatePrefix(workDate) {
  const raw = String(workDate ?? "").trim();
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return "";
  return `${match[1].slice(2)}${match[2]}${match[3]}`;
}

/**
 * 설비명 → LOT 중간 세gment (하이픈 제거)
 * 3S-3 → 3S3 · 10S-01 → 10S01 · 61 → 61
 * @param {string} equipmentName
 */
export function equipmentNameToLotSegment(equipmentName) {
  const name = String(equipmentName ?? "").trim();
  if (!name) return "";

  if (/^\d+$/.test(name)) return name;

  const ionMatch = name.match(/^(\d+S)-(\d+)$/i);
  if (ionMatch) {
    return `${ionMatch[1].toUpperCase()}${ionMatch[2]}`;
  }

  return name.replace(/-/g, "").toUpperCase();
}

/**
 * LOT 세gment → 설비명 (마스터 조회용)
 * 3S3 → 3S-3 · 10S01 → 10S-01
 * @param {string} segment
 */
export function lotSegmentToEquipmentName(segment) {
  const value = String(segment ?? "").trim();
  if (!value) return "";

  if (/^\d+$/.test(value)) return value;

  const ionMatch = value.match(/^(\d+S)(\d+)$/i);
  if (ionMatch) {
    return `${ionMatch[1].toUpperCase()}-${ionMatch[2]}`;
  }

  return value;
}

/**
 * @param {string} lotNo
 * @returns {{ datePrefix: string, equipmentSegment: string, sequenceLetter: string, lotNo: string } | null}
 */
export function parseProductionLotNo(lotNo) {
  const trimmed = String(lotNo ?? "").trim();
  const match = trimmed.match(NDK_PRODUCTION_LOT_PATTERN);
  if (!match) return null;

  return {
    datePrefix: match[1],
    equipmentSegment: match[2].toUpperCase(),
    sequenceLetter: match[3].toUpperCase(),
    lotNo: `${match[1]}-${match[2].toUpperCase()}${match[3].toUpperCase()}`,
  };
}

export function normalizeProductionLotNoKey(lotNo) {
  const parsed = parseProductionLotNo(lotNo);
  return parsed?.lotNo ?? String(lotNo ?? "").trim().toUpperCase();
}

function collectUsedSequenceLetters(datePrefix, equipmentSegment, records, excludeLotNo = "") {
  const used = new Set();
  const excludeKey = excludeLotNo ? normalizeProductionLotNoKey(excludeLotNo) : "";

  records.forEach((record) => {
    const lot = record.lotNo?.trim();
    if (!lot) return;

    const parsed = parseProductionLotNo(lot);
    if (!parsed) return;

    const lotKey = normalizeProductionLotNoKey(lot);
    if (excludeKey && lotKey === excludeKey) return;

    if (
      parsed.datePrefix === datePrefix &&
      parsed.equipmentSegment === equipmentSegment.toUpperCase()
    ) {
      used.add(parsed.sequenceLetter);
    }
  });

  return used;
}

function resolveNextSequenceLetter(datePrefix, equipmentSegment, records, excludeLotNo = "") {
  const used = collectUsedSequenceLetters(datePrefix, equipmentSegment, records, excludeLotNo);

  for (let index = 0; index < 26; index += 1) {
    const letter = String.fromCharCode(65 + index);
    if (!used.has(letter)) return letter;
  }

  return "Z";
}

/**
 * @param {object} options
 * @param {string} options.workDate
 * @param {string} options.equipment
 * @param {object[]} [options.records]
 * @param {string} [options.existingLotNo] 동일 작업일·설비면 기존 LOT 유지
 * @param {string} [options.excludeLotNo] 순번 산정 시 제외 (설비/일자 변경 edit)
 */
export function generateProductionLotNo({
  workDate,
  equipment,
  records = getSessionProductionRecords(),
  existingLotNo = "",
  excludeLotNo = "",
} = {}) {
  const datePrefix = workDateToLotDatePrefix(workDate);
  const equipmentSegment = equipmentNameToLotSegment(equipment);
  if (!datePrefix || !equipmentSegment) return "";

  if (existingLotNo) {
    const parsed = parseProductionLotNo(existingLotNo);
    if (
      parsed &&
      parsed.datePrefix === datePrefix &&
      parsed.equipmentSegment === equipmentSegment
    ) {
      return parsed.lotNo;
    }
  }

  const sequenceLetter = resolveNextSequenceLetter(
    datePrefix,
    equipmentSegment,
    records,
    excludeLotNo
  );

  return `${datePrefix}-${equipmentSegment}${sequenceLetter}`;
}

/**
 * LOT 번호의 설비 세gment가 선택 설비와 일치하는지
 * @param {string} lotNo
 * @param {string} equipment
 */
export function productionLotMatchesEquipment(lotNo, equipment) {
  const parsed = parseProductionLotNo(lotNo);
  if (!parsed) return false;
  return parsed.equipmentSegment === equipmentNameToLotSegment(equipment);
}

/** Fleet id (ION-01) → operational equipment name (3S-1) for LOT segment */
export function resolveFleetEquipmentLotName(equipmentId) {
  const id = String(equipmentId ?? "").trim().toUpperCase();
  const ion = id.match(/^ION-(\d+)$/);
  if (ion) return `3S-${Number(ion[1])}`;
  const gas = id.match(/^GAS-(\d+)$/);
  if (gas) return `10S-${String(Number(gas[1])).padStart(2, "0")}`;
  const soft = id.match(/^SOFT-(\d+)$/);
  if (soft) return String(60 + Number(soft[1]));
  const car = id.match(/^CAR-(\d+)$/);
  if (car) return `CAR-${String(Number(car[1])).padStart(2, "0")}`;
  const hf = id.match(/^HF-(\d+)$/);
  if (hf) return `HF-${String(Number(hf[1])).padStart(2, "0")}`;
  const aux = id.match(/^AUX-(\d+)$/);
  if (aux) return `AUX-${String(Number(aux[1])).padStart(2, "0")}`;
  return "";
}

function isOperationalEquipmentLotName(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return false;
  return /^(\d+S-\d+|\d{2,3})$/i.test(raw);
}

/**
 * Resolve equipment display name/code used in YYMMDD-설비순번 LOT generation.
 * @param {{ id?: string, equipmentId?: string, code?: string, name?: string, equipmentName?: string } | null | undefined} equipment
 */
export function resolveEquipmentLotNumberName(equipment) {
  if (!equipment) return "";
  const code = String(equipment.code ?? "").trim();
  const name = String(equipment.name ?? equipment.equipmentName ?? "").trim();
  if (isOperationalEquipmentLotName(code)) return code;
  if (isOperationalEquipmentLotName(name)) return name;
  const fleet = resolveFleetEquipmentLotName(equipment.id ?? equipment.equipmentId ?? code);
  if (fleet) return fleet;
  return code || name || String(equipment.id ?? equipment.equipmentId ?? "").trim();
}

/** Collect LOT numbers from session · store · charge history for sequence letters */
export function buildProductionLotSequenceRecords() {
  /** @type {{ lotNo?: string }[]} */
  const records = getSessionProductionRecords().map((record) => ({ lotNo: record.lotNo }));

  getSessionProductionRecords().forEach((record) => {
    (record.chargeHistory ?? []).forEach((entry) => {
      const lot = String(entry?.lotNo ?? "").trim();
      if (lot) records.push({ lotNo: lot });
    });
  });

  try {
    const dataEngine = getTitanDataEngine();
    dataEngine.lot.list().forEach((row) => {
      const lot = String(row?.lotNo ?? "").trim();
      if (lot) records.push({ lotNo: lot });
    });
    dataEngine.equipment.list().forEach((equipment) => {
      (equipment.chargeableLots ?? []).forEach((row) => {
        const lot = String(row?.lotNo ?? "").trim();
        if (lot) records.push({ lotNo: lot });
      });
      const sessionLot = String(equipment.runningSession?.lotNo ?? "").trim();
      if (sessionLot) records.push({ lotNo: sessionLot });
    });
    dataEngine.production.list().forEach((row) => {
      const lot = String(row?.lotNo ?? "").trim();
      if (lot) records.push({ lotNo: lot });
    });
  } catch {
    // node verify partial engine
  }

  return records;
}

/**
 * Generate charge LOT at production start — YYMMDD-설비코드+순번 (A/B/C…)
 * @param {object} options
 * @param {string} [options.equipmentId]
 * @param {Record<string, unknown> | null} [options.equipment]
 * @param {string} [options.workDate] YYYY-MM-DD · defaults to production start date (금일)
 * @param {string} [options.existingLotNo] partial charge re-use
 */
export function generateEquipmentChargeLotNo({
  equipmentId = "",
  equipment = null,
  workDate = getPrintOutputDate(),
  existingLotNo = "",
  records = null,
} = {}) {
  const equipmentName = resolveEquipmentLotNumberName(
    equipment ?? { id: equipmentId, equipmentId, code: equipmentId }
  );
  return generateProductionLotNo({
    workDate,
    equipment: equipmentName,
    records: records ?? buildProductionLotSequenceRecords(),
    existingLotNo: String(existingLotNo ?? "").trim(),
  });
}

/** Equipment charge LOT: {companyAbbr}-L-{seq6} e.g. DS-L-000001 */
export const TITAN_LOT_NUMBER_SEQ_PAD = 6;

export function workDateToChargeLotDateSegment(workDate) {
  const raw = String(workDate ?? "").trim();
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return "";
  return `${match[1]}${match[2]}${match[3]}`;
}

function resolveChargeLotCompanyAbbreviation(companyName) {
  const name = String(companyName ?? "").trim();
  if (!name) return "XX";
  const company = getMasterDataByCategory("companies").find((row) => row.name === name);
  if (company) return getCompanyAbbreviation(company);
  return name.slice(0, 2).toUpperCase() || "XX";
}

export function buildChargeLotNumberPattern(companyAbbr) {
  const abbr = String(companyAbbr ?? "XX").trim().toUpperCase() || "XX";
  const prefix = getNumberingPrefix("lot");
  return `${abbr}-${prefix}-`;
}

function extractMaxChargeLotSequence(existingValues, pattern) {
  const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`^${escaped}(\\d+)$`, "i");
  return existingValues.reduce((max, value) => {
    const match = String(value ?? "").trim().match(regex);
    if (!match) return max;
    const seq = Number(match[1]);
    return Number.isFinite(seq) ? Math.max(max, seq) : max;
  }, 0);
}

export function collectChargeLotExistingValues() {
  const values = [];
  getSessionProductionRecords().forEach((record) => {
    const lot = String(record?.lotNo ?? "").trim();
    if (lot) values.push(lot);
  });

  try {
    const dataEngine = getTitanDataEngine();
    dataEngine.lot.list().forEach((row) => {
      const lot = String(row?.lotNo ?? "").trim();
      if (lot) values.push(lot);
    });
    dataEngine.equipment.list().forEach((equipment) => {
      (equipment.chargeableLots ?? []).forEach((row) => {
        const lot = String(row?.lotNo ?? "").trim();
        if (lot) values.push(lot);
      });
    });
  } catch {
    // node verify partial engine
  }

  return values;
}

export function generateChargeLotNumber({
  company = "",
  workDate = getPrintOutputDate(),
  existingValues = null,
} = {}) {
  void workDate;
  const companyAbbr = resolveChargeLotCompanyAbbreviation(company);
  const pattern = buildChargeLotNumberPattern(companyAbbr);
  const values = existingValues ?? collectChargeLotExistingValues();
  const nextSeq = extractMaxChargeLotSequence(values, pattern) + 1;
  return `${pattern}${String(nextSeq).padStart(TITAN_LOT_NUMBER_SEQ_PAD, "0")}`;
}

export function isChargeLotNumberFormat(lotNo) {
  return Boolean(parseProductionLotNo(lotNo));
}
