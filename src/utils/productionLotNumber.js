/**
 * Project TITAN — 생산 LOT 번호 (YYMMDD-설비코드+순번)
 * 예: 260626-3S3A → 26.06.26 · 3S-3호기 · A차 생산
 */

import { getSessionProductionRecords } from "./productionRecords";

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
