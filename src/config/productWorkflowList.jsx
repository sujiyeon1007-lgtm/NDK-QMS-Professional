/**

 * Project TITAN V1.3 — HOME 제품 진행 리스트 컬럼

 */



import HomeCurrentProcessBadgeCell from "../pages/Home/HomeCurrentProcessBadgeCell";

import HomeProductProgressCell from "../pages/Home/HomeProductProgressCell";

import { titanColumn } from "./tableColumnPresets";



/** HOME HomeProductProgressTable — 실무 Dashboard 목록 */

export function buildHomeProductProgressTableColumns() {

  return [

    titanColumn("managementId"),

    titanColumn("lotNo", {

      label: "LOT번호",

    }),

    titanColumn("company"),

    titanColumn("partName"),

    titanColumn("partNo"),

    titanColumn("material"),

    titanColumn("workQty", {

      label: "작업수량",

      render: (row) => row.workQtyLabel ?? "—",

    }),

    titanColumn("completedQty", {

      label: "완료수량",

      render: (row) => row.completedQtyLabel ?? "—",

    }),

    titanColumn("currentProcess", {

      label: "현재공정",

      render: (row) => <HomeCurrentProcessBadgeCell row={row} />,

    }),

    titanColumn("progress", {

      label: "진행률",

      render: (row) => <HomeProductProgressCell row={row} />,

    }),

    titanColumn("incomingDate", {

      label: "등록일",

      render: (row) => row.registeredDate ?? "—",

    }),

  ];

}



/** @deprecated buildHomeProductProgressTableColumns 사용 */

export function buildHomeProgressColumns() {

  return buildHomeProductProgressTableColumns();

}
