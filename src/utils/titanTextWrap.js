/**
 * Project TITAN V1.0 — 단어 단위 줄바꿈 (버튼 · 제목 · 카드)
 */

const ACTION_SUFFIXES = ["출력", "등록", "발행"];

/**
 * 버튼 라벨을 2줄 형식으로 변환 (단어/괄호 단위)
 * @param {string | undefined | null} text
 * @returns {string}
 */
export function formatTitanButtonLabel(text) {
  if (!text || typeof text !== "string") return text ?? "";

  if (text.includes("\n")) return text;

  const parenIndex = text.indexOf(" (");
  if (parenIndex > 0 && text.endsWith(")")) {
    return `${text.slice(0, parenIndex)}\n${text.slice(parenIndex + 1)}`;
  }

  for (const suffix of ACTION_SUFFIXES) {
    if (text.endsWith(suffix)) {
      const prefix = text.slice(0, -suffix.length).trim();
      if (prefix) return `${prefix}\n${suffix}`;
    }
  }

  return text;
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
