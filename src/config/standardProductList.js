import { titanColumn } from "./tableColumnPresets";

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
    titanColumn("lotNo"),
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

/** 성적서관리 — 파일 등록 현황 */
export function buildCertificateListColumns({ renderStatus, renderProcess, renderExcel, renderPdf }) {
  return [
    titanColumn("managementId"),
    titanColumn("lotNo"),
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
