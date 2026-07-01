/**

 * Project TITAN V1.0 Lock — KPI Mode

 *

 * realtime — HOME · 입출고 · 생산 · 품질 (UI Freeze · Pill · 숫자 → 한글)

 * summary  — Panel 2행 · 관리/통계 (Rounded Rect · 한글 → 숫자)

 *

 * Panel 1행 realtime: mode=realtime + CSS(.titan-kpi-panel__row--realtime)로 순서만 변경

 */



/** @typedef {"realtime" | "summary"} KpiMode */



/** @type {KpiMode} */

export const KPI_MODE_REALTIME = "realtime";



/** @type {KpiMode} */

export const KPI_MODE_SUMMARY = "summary";



/** @deprecated KPI_MODE_REALTIME 사용 */

export const KPI_LAYOUT_INLINE = KPI_MODE_REALTIME;



/** @deprecated KPI_MODE_SUMMARY 사용 */

export const KPI_LAYOUT_STACK = KPI_MODE_SUMMARY;



/** @deprecated panel-realtime 제거 — realtime + Panel CSS 사용 */

export const KPI_MODE_PANEL_REALTIME = KPI_MODE_REALTIME;



/**

 * @param {string} [layoutOrMode]

 * @returns {KpiMode}

 */

export function resolveKpiMode(layoutOrMode) {

  if (layoutOrMode === KPI_MODE_SUMMARY || layoutOrMode === "stack") return KPI_MODE_SUMMARY;

  return KPI_MODE_REALTIME;

}


