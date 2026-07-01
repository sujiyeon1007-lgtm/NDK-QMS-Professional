/**

 * Project TITAN V1.0 — 제품 진행현황 Standard List 컬럼

 *

 * HOME · 입고 · 생산 · 검사 · 성적서 · 출고 · 이력조회 공통 기준

 *

 * HOME Dashboard: 납기일 · 진행상태는 Row Expand에서만 표시 (리스트 중복 제거)

 */



import TitanProcessNameCell from "../foundation/components/TitanProcessNameCell";

import { titanColumn } from "./tableColumnPresets";



/** @typedef {import("./tableColumnPresets").TitanColumnDef} TitanColumnDef */



/**

 * @returns {TitanColumnDef[]}

 */

export function buildProductWorkflowListColumns() {

  return [

    titanColumn("managementId"),

    titanColumn("lotNo"),

    titanColumn("company"),

    titanColumn("partName", { widthPercent: 20 }),

    titanColumn("qty", { widthPercent: 8 }),

    titanColumn("currentProcess", {

      label: "현재공정",

      widthPercent: 14,

      render: (row) => (

        <TitanProcessNameCell

          label={row.currentProcess ?? row.statusLabel ?? row.processName ?? "—"}

          processKey={row.processKey ?? "incoming"}

        />

      ),

    }),

  ];

}



export const PRODUCT_WORKFLOW_LIST_COLUMNS = buildProductWorkflowListColumns();


