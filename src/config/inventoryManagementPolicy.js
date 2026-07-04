/**
 * Project TITAN — 재고관리 V1.0 Policy
 * 조회·집계 전용 — ERP 창고관리 ❌
 *
 * @see src/utils/inventory.js — record 단위 재고 계산
 * @see src/utils/inventoryStatusAnalytics.js — 화면 집계
 */

/** V1.0 — 구현 범위 (조회 전용) */
export const INVENTORY_V1_FEATURES = {
  currentStock: "현재 재고 현황",
  byItem: "품목별 재고 (업체+품번)",
  byLot: "LOT별 재고 (관리번호)",
  byCompany: "거래처별 재고",
  search: "재고 검색 (공통 TitanSearchPanel)",
  autoCalc: "입고·출고 데이터 기반 자동 계산",
  pdfPrint: "재고 PDF 출력",
};

/** V2.0 — 구조만 등록 (미구현) */
export const INVENTORY_V2_FUTURE = [
  { id: "adjustment", label: "재고 조정", status: "planned" },
  { id: "stocktake", label: "재고 실사", status: "planned" },
  { id: "warehouseLocation", label: "창고 위치", status: "planned" },
  { id: "safetyStock", label: "안전재고", status: "planned" },
  { id: "shortageAlert", label: "부족 알림", status: "planned" },
];

export const INVENTORY_VIEW_MODES = [
  { id: "byItem", label: "품목별" },
  { id: "byLot", label: "LOT별" },
  { id: "byCompany", label: "거래처별" },
];

export const INVENTORY_ROUTE = "/inventory";

export const INVENTORY_PRINT = {
  documentCode: "INV-STK",
  title: "재고 현황 리스트",
  filenamePrefix: "inventory-status",
};
