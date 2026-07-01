/**
 * Project TITAN V1.0 — 텍스트 줄바꿈 유틸
 *
 * V1.0 Lock: 버튼 라벨은 한 줄 (formatTitanButtonLabel — 분리 없음)
 * 등록 모달 Summary 카드만 formatTitanSummaryText 줄바꿈 허용
 */

/**
 * @param {string | undefined | null} text
 * @returns {string}
 */
export function formatTitanButtonLabel(text) {
  if (!text || typeof text !== "string") return text ?? "";
  return text.replace(/\s*\n\s*/g, " ").trim();
}

/**
 * 등록 모달 입력값 요약 — 괄호/단어 단위 줄바꿈 (접미사 분리 없음)
 * @param {string | undefined | null} text
 * @returns {string}
 */
export function formatTitanSummaryText(text) {
  if (!text || typeof text !== "string") return text ?? "";

  if (text.includes("\n")) return text;

  const parenIndex = text.indexOf(" (");
  if (parenIndex > 0 && text.endsWith(")")) {
    return `${text.slice(0, parenIndex)}\n${text.slice(parenIndex + 1)}`;
  }

  return text;
}

/** @param {string} text */
export function splitTitanLines(text) {
  return String(text ?? "")
    .split("\n")
    .filter((line, index, arr) => line.length > 0 || arr.length === 1);
}
