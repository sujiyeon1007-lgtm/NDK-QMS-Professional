/** Project TITAN — 출력물 날짜 (하드코딩 금지 · 실데이터 연동) */

export function getPrintOutputDate(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function toCompactPrintDate(isoDate = "") {
  return String(isoDate).trim().replace(/-/g, "");
}

export function resolvePrintOutputDate(outputDate = "", printDateTime = "") {
  if (outputDate?.trim()) return outputDate.trim();
  const match = String(printDateTime).match(/\d{4}-\d{2}-\d{2}/);
  if (match) return match[0];
  return getPrintOutputDate();
}

/** Local registration/output datetime — YYYY-MM-DD HH:mm */
export function formatLocalDateTime(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}
