/**
 * Project TITAN — LOT 번호 형식 검증 (생산일보 등록 시 save 검증)
 * 예: 26060206-3S2A · 26060206-2S1B · 26060301-1S3A
 */

/** 8자리 일자-숫자S숫자영문 (업체 LOT 패턴 공통) */
export const NDK_LOT_FORMAT_PATTERN = /^\d{8}-\d+S\d+[A-Z]$/;

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
  if (!NDK_LOT_FORMAT_PATTERN.test(trimmed)) {
    return {
      ok: false,
      code: "FORMAT",
      message: "LOT 번호 형식이 올바르지 않습니다. (예: 26060206-3S2A)",
    };
  }
  return { ok: true, lotNo: trimmed };
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
