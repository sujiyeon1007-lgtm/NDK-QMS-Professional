import { titanColumn } from "./tableColumnPresets";

/** 입고관리 — 발주번호 · 업체 LOT 포함 */
export function buildInboundListColumns({ renderStatus, renderProcess }) {
  return [
    titanColumn("managementId"),
    titanColumn("purchaseOrderNo"),
    titanColumn("lotNo"),
    titanColumn("customerLotNo"),
    titanColumn("company"),
    titanColumn("partName"),
    titanColumn("partNo"),
    titanColumn("material"),
    titanColumn("qty"),
    titanColumn("process", { key: "processName", render: renderProcess }),
    titanColumn("incomingDate", { key: "registeredDate", label: "입고일" }),
    titanColumn("dueDate"),
    titanColumn("status", { key: "statusLabel", render: renderStatus }),
  ];
}

/**
 * Project TITAN V1.0 — 제품 리스트 공통 컬럼 (생산일보 기준)
 * @param {{ renderStatus: Function, renderProcess: Function }} renderers
 */
export function buildStandardProductListColumns({ renderStatus, renderProcess }) {
  return [
    titanColumn("managementId"),
    titanColumn("lotNo"),
    titanColumn("company"),
    titanColumn("partName"),
    titanColumn("partNo"),
    titanColumn("material"),
    titanColumn("qty"),
    titanColumn("process", { key: "processName", render: renderProcess }),
    titanColumn("workDate"),
    titanColumn("status", { key: "statusLabel", render: renderStatus }),
    titanColumn("incomingDate", { key: "registeredDate", label: "등록일" }),
  ];
}

/** 출고관리 — 공통 리스트 + 거래명세서 상태 */
export function buildOutboundListColumns({ renderStatus, renderProcess, renderStatementStatus }) {
  return [
    titanColumn("managementId"),
    titanColumn("purchaseOrderNo"),
    titanColumn("lotNo"),
    titanColumn("customerLotNo"),
    titanColumn("company"),
    titanColumn("partName"),
    titanColumn("partNo"),
    titanColumn("material"),
    titanColumn("qty", { key: "stockQtyLabel", label: "실재고" }),
    titanColumn("process", { key: "processName", render: renderProcess }),
    titanColumn("workDate", { key: "shipDateLabel", label: "출고일" }),
    titanColumn("status", {
      key: "statementStatusLabel",
      label: "거래명세서",
      render: renderStatementStatus,
    }),
    titanColumn("status", { key: "statusLabel", label: "현재상태", render: renderStatus }),
    titanColumn("incomingDate", { key: "registeredDate", label: "등록일" }),
  ];
}

/** 생산실적관리 — 관리번호 · 설비 미표시 */
export function buildProductionResultsListColumns({ renderProcess, renderLotNo }) {
  return [
    titanColumn("lotNo", { render: renderLotNo }),
    titanColumn("company"),
    titanColumn("partName"),
    titanColumn("partNo"),
    titanColumn("material"),
    titanColumn("qty"),
    titanColumn("process", { key: "processName", render: renderProcess }),
    titanColumn("worker"),
    titanColumn("workDate"),
  ];
}

/** 불량이력관리 */
export function buildDefectHistoryListColumns({ renderProcess, renderHandlingStatus }) {
  return [
    titanColumn("managementId"),
    titanColumn("lotNo"),
    titanColumn("company"),
    titanColumn("partName"),
    titanColumn("partNo"),
    titanColumn("material"),
    titanColumn("process", { key: "processName", render: renderProcess }),
    titanColumn("defectType"),
    titanColumn("defectQty"),
    titanColumn("occurredDate"),
    titanColumn("handlingStatus", { render: renderHandlingStatus }),
  ];
}

/** 검사일지 */
export function buildInspectionLogListColumns({ renderStatus, renderProcess }) {
  return [
    titanColumn("managementId"),
    titanColumn("purchaseOrderNo"),
    titanColumn("lotNo"),
    titanColumn("customerLotNo"),
    titanColumn("company"),
    titanColumn("partName"),
    titanColumn("partNo"),
    titanColumn("material"),
    titanColumn("qty"),
    titanColumn("process", { key: "processName", render: renderProcess }),
    titanColumn("inspectionDate"),
    titanColumn("status", { key: "statusLabel", render: renderStatus }),
    titanColumn("incomingDate", { key: "registeredDate", label: "등록일" }),
  ];
}

/** 통계조회 — 업체별 회사 전체 요약 리스트 */
export function buildInquiryDashboardListColumns() {
  return [
    titanColumn("statNo", { key: "no" }),
    titanColumn("company"),
    titanColumn("statProductionQty", { key: "productionQtyLabel", label: "생산량" }),
    titanColumn("statInspectionCount", { key: "inspectionCount", label: "검사 건수" }),
    titanColumn("statShipmentQty", { key: "shipmentQtyLabel", label: "출고량" }),
    titanColumn("statPassRate", { key: "passRate", label: "합격률" }),
    titanColumn("statDefectRate", { key: "defectRate", label: "불량률" }),
  ];
}

/** 통계자료 — 업체 · 단위별 집계 (레거시) */
export function buildStatisticsListColumns({ showUnitColumn = false, quantityUnitLabel = "" } = {}) {
  const qtyLabel = quantityUnitLabel ? `(${quantityUnitLabel})` : "";
  return [
    titanColumn("statNo", { key: "no" }),
    titanColumn("company"),
    ...(showUnitColumn ? [titanColumn("statUnit", { key: "unitLabel" })] : []),
    titanColumn("statProductionQty", {
      key: "productionQtyLabel",
      label: quantityUnitLabel ? `생산${qtyLabel}` : "생산량",
    }),
    titanColumn("statShipmentQty", {
      key: "shipmentQtyLabel",
      label: quantityUnitLabel ? `출고${qtyLabel}` : "출고량",
    }),
    titanColumn("statInspectionCount", { key: "inspectionCount" }),
    titanColumn("statPassRate", { key: "passRate" }),
    titanColumn("statDefectRate", { key: "defectRate" }),
    titanColumn("statReprocessRate", { key: "reprocessRate" }),
  ];
}

export function buildProductionStatisticsListColumns() {
  return [
    titanColumn("company"),
    titanColumn("partName"),
    titanColumn("partNo"),
    titanColumn("material"),
    titanColumn("process", { key: "processName" }),
    titanColumn("equipment"),
    titanColumn("worker"),
    titanColumn("statProductionQty", { key: "productionQtyLabel", label: "생산량" }),
    titanColumn("statUnit", { key: "unitLabel", label: "단위" }),
    titanColumn("workDate"),
  ];
}

export function buildQualityStatisticsListColumns() {
  return [
    titanColumn("company"),
    titanColumn("partName"),
    titanColumn("partNo"),
    titanColumn("material"),
    titanColumn("process", { key: "processName" }),
    titanColumn("assignee", { label: "검사자" }),
    titanColumn("inspectionDate", { label: "검사일" }),
    titanColumn("status", { key: "judgment", label: "검사 결과" }),
    titanColumn("note", { key: "reprocessLabel", label: "재처리 여부" }),
  ];
}

export function buildShipmentStatisticsListColumns() {
  return [
    titanColumn("company"),
    titanColumn("partName"),
    titanColumn("partNo"),
    titanColumn("material"),
    titanColumn("statShipmentQty", { key: "shipmentQtyLabel", label: "출고량" }),
    titanColumn("statUnit", { key: "unitLabel", label: "단위" }),
    titanColumn("shipDate", { label: "출고일" }),
    titanColumn("manager", { label: "담당자" }),
  ];
}

export function buildSalesStatisticsListColumns() {
  return [
    titanColumn("company"),
    titanColumn("partName"),
    titanColumn("partNo"),
    titanColumn("material"),
    titanColumn("statShipmentQty", { key: "shipmentQtyLabel", label: "출고량" }),
    titanColumn("statUnit", { key: "unitLabel", label: "단위" }),
    titanColumn("shipDate", { label: "출고일" }),
  ];
}

/** 부서별 업무 */
export function buildDepartmentWorkListColumns({ renderStatus, renderPriority }) {
  return [
    titanColumn("taskTitle", { key: "title" }),
    titanColumn("department"),
    titanColumn("assignee"),
    titanColumn("requestDate"),
    titanColumn("dueDate"),
    titanColumn("priority", { render: renderPriority }),
    titanColumn("status", { key: "statusLabel", render: renderStatus }),
  ];
}

/** 성적서관리 — 파일 등록 현황 */
export function buildCertificateListColumns({ renderStatus, renderProcess, renderExcel, renderPdf }) {
  return [
    titanColumn("managementId"),
    titanColumn("purchaseOrderNo"),
    titanColumn("lotNo"),
    titanColumn("customerLotNo"),
    titanColumn("company"),
    titanColumn("partName"),
    titanColumn("partNo"),
    titanColumn("material"),
    titanColumn("qty"),
    titanColumn("process", { key: "processName", render: renderProcess }),
    titanColumn("excelFile", { render: renderExcel }),
    titanColumn("pdfFile", { render: renderPdf }),
    titanColumn("incomingDate", { key: "registeredDate", label: "등록일" }),
    titanColumn("status", { key: "statusLabel", render: renderStatus }),
  ];
}
