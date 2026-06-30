/** 공통 테이블 셀 표시 */
export function formatTableCell(value) {
  if (value == null || value === "" || value === "-") return "—";
  return value;
}
