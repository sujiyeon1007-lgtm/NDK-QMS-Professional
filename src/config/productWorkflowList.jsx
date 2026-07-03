/**
 * Project TITAN V1.3 — HOME 제품 진행 리스트 컬럼
 */

import HomeCurrentProcessBadgeCell from "../pages/Home/HomeCurrentProcessBadgeCell";
import { titanColumn } from "./tableColumnPresets";

/** HOME HomeProductProgressTable — Dashboard 간결 목록 */
export function buildHomeProductProgressTableColumns() {
  return [
    titanColumn("company"),
    titanColumn("partName", { widthPercent: 18 }),
    titanColumn("partNo"),
    titanColumn("material"),
    titanColumn("qty", { widthPercent: 6 }),
    titanColumn("currentProcess", {
      label: "현재공정",
      widthPercent: 12,
      render: (row) => <HomeCurrentProcessBadgeCell row={row} />,
    }),
  ];
}

/** @deprecated buildHomeProductProgressTableColumns 사용 */
export function buildHomeProgressColumns() {
  return buildHomeProductProgressTableColumns();
}

/** @deprecated buildHomeProductProgressTableColumns 사용 */
export function buildHomeProductProgressColumns() {
  return buildHomeProductProgressTableColumns();
}

/** @deprecated buildHomeProductProgressTableColumns 사용 */
export function buildHomeProgressOverviewColumns() {
  return buildHomeProductProgressTableColumns();
}

/** @deprecated buildHomeProductProgressTableColumns 사용 */
export function buildProductWorkflowListColumns() {
  return buildHomeProductProgressTableColumns();
}

export const PRODUCT_WORKFLOW_LIST_COLUMNS = buildHomeProductProgressTableColumns();
