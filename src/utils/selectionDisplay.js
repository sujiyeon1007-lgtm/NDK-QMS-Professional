/**
 * 다중 선택 시 상세 표시 — 첫 항목 + 외 N건
 * @param {Array<{ company?: string }>} rows
 */
export function formatMultiSelectCompany(rows = []) {
  if (!rows.length) return "—";
  const first = rows[0]?.company?.trim() || "—";
  if (rows.length === 1) return first;
  return `${first} 외 ${rows.length - 1}건`;
}
