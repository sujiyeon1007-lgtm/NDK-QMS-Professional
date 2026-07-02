/**
 * Project TITAN — LOT 번호 형식 검증 (생산일보 등록 시 save 검증)
 * 예: 260626-3S3A · 260626-10S01B · 260626-61A
 */

import {
  NDK_PRODUCTION_LOT_PATTERN,
  parseProductionLotNo,
  productionLotMatchesEquipment,
} from "./productionLotNumber";

export { NDK_PRODUCTION_LOT_PATTERN as NDK_LOT_FORMAT_PATTERN };

/**
 * LOT 형식 검증 (저장 시점)
 * @param {string} lotNo
 * @returns {{ ok: true, lotNo: string } | { ok: false, code: string, message: string }}
 */
export function validateLotNoFormat(lotNo) {
  const trimmed = String(lotNo ?? "").trim();
  if (!trimmed) {
    return { ok: false, code: "EMPTY", message: "LOT 번호를 입력하세요." };
  }
  if (!NDK_PRODUCTION_LOT_PATTERN.test(trimmed)) {
    return {
      ok: false,
      code: "FORMAT",
      message: "LOT 번호 형식이 올바르지 않습니다. (예: 260626-3S3A)",
    };
  }

  const parsed = parseProductionLotNo(trimmed);
  return { ok: true, lotNo: parsed?.lotNo ?? trimmed.toUpperCase() };
}

/**
 * LOT 번호와 설비 선택 일치 검증
 * @param {string} lotNo
 * @param {string} equipment
 */
export function validateLotNoEquipmentMatch(lotNo, equipment) {
  const formatCheck = validateLotNoFormat(lotNo);
  if (!formatCheck.ok) return formatCheck;

  const equipmentName = String(equipment ?? "").trim();
  if (!equipmentName) {
    return { ok: false, code: "EQUIPMENT", message: "설비를 선택하세요." };
  }

  if (!productionLotMatchesEquipment(formatCheck.lotNo, equipmentName)) {
    return {
      ok: false,
      code: "EQUIPMENT_MISMATCH",
      message: "LOT 번호와 선택 설비가 일치하지 않습니다. 작업일 · 설비를 확인하세요.",
    };
  }

  return formatCheck;
}

/**
 * 생산일보 LOT 등록 — 형식 + 중복 등록 검증
 * @param {string} lotNo
 * @param {object} [managementRecord]
 */
export function validateLotNoForDailyReportRegister(lotNo, managementRecord) {
  const formatCheck = validateLotNoFormat(lotNo);
  if (!formatCheck.ok) return formatCheck;

  const existingLot = managementRecord?.lotNo?.trim();
  if (managementRecord?.registered && existingLot) {
    if (existingLot.toUpperCase() !== formatCheck.lotNo.toUpperCase()) {
      return {
        ok: false,
        code: "ALREADY_REGISTERED",
        message: "이 관리번호에는 이미 LOT가 등록되어 있습니다. LOT 재등록은 불가합니다.",
      };
    }
  }

  return { ok: true, lotNo: formatCheck.lotNo };
}
