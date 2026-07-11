import { titanColumn } from "./tableColumnPresets";

/**
 * Project TITAN V1.3 — 제품 리스트 공통 컬럼 (고정 순서)
 * 입고일 · 생산일 · LOT.NO · 업체명 · 품명 · 품번 · 입고수량 · 작업수량 · 현재공정 · 비고 · 작업
 */
export const V13_PRODUCT_LIST_COLUMN_ORDER = [
  "incomingDate",
  "productionDate",
  "lotNo",
  "company",
  "partName",
  "partNo",
  "inboundQty",
  "workQty",
  "currentProcess",
  "note",
  "tableActions",
];

/**
 * V1.3 공통 제품 리스트 컬럼 빌더
 * @param {{ renderCurrentProcess?: Function, renderActions?: Function }} options
 */
export function buildV13ProductListColumns({ renderCurrentProcess, renderActions } = {}) {
  const columns = [
    titanColumn("incomingDate", { key: "incomingDate", label: "입고일" }),
    titanColumn("productionDate", { key: "productionDate", label: "생산일" }),
    titanColumn("lotNo"),
    titanColumn("company"),
    titanColumn("partName"),
    titanColumn("partNo"),
    titanColumn("inboundQty", { key: "inboundQtyLabel", label: "입고수량" }),
    titanColumn("workQty", { key: "workQtyLabel", label: "작업수량" }),
    titanColumn("currentProcess", {
      key: "currentProcess",
      label: "현재공정",
      render: renderCurrentProcess,
    }),
    titanColumn("note", { key: "remark", label: "비고" }),
  ];
  if (renderActions) {
    columns.push(titanColumn("tableActions", { key: "actions", render: renderActions }));
  }
  return columns;
}

/** LOT · 작업일보 통합 리스트 컬럼 */
export function buildLotWorkLogListColumns({ renderCurrentProcess, renderActions } = {}) {
  const columns = [
    titanColumn("lotNo", { key: "lotNo", label: "LOT.NO" }),
    titanColumn("equipment", { key: "equipmentLabel", label: "설비" }),
    titanColumn("partName", { key: "partName", label: "품명" }),
    titanColumn("partNo", { key: "partNo", label: "품번" }),
    titanColumn("currentProcess", {
      key: "currentProcess",
      label: "공정",
      render: renderCurrentProcess,
    }),
    titanColumn("workQty", { key: "workQtyLabel", label: "수량" }),
    titanColumn("worker", { key: "workerLabel", label: "작업자" }),
    titanColumn("workStartAt", { key: "workStartAtLabel", label: "시작" }),
    titanColumn("workEndAt", { key: "workEndAtLabel", label: "종료" }),
    titanColumn("status", { key: "statusLabel", label: "상태" }),
  ];
  if (renderActions) {
    columns.push(titanColumn("tableActions", { key: "actions", render: renderActions }));
  }
  return columns;
}

/** 생산일보 — RC1 list column order (LOT · 업체 · 품명 · 품번 · 재질 · 장입수량 · 열처리공정 · 현재상태) */
export function buildProductionDailyReportListColumns({
  renderHeatTreatmentProcess,
  renderWorkflowStatus,
  renderActions,
} = {}) {
  const columns = [
    titanColumn("lotNo", { key: "lotNo", label: "LOT번호" }),
    titanColumn("company", { key: "company", label: "업체명" }),
    titanColumn("partName", { key: "partName", label: "품명" }),
    titanColumn("partNo", { key: "partNo", label: "품번" }),
    titanColumn("material", { key: "material", label: "재질" }),
    titanColumn("workQty", { key: "chargeQtyLabel", label: "장입수량" }),
    titanColumn("currentProcess", {
      key: "heatTreatmentProcess",
      label: "열처리공정",
      render: renderHeatTreatmentProcess,
    }),
    titanColumn("status", {
      key: "currentProcess",
      label: "현재상태",
      render: renderWorkflowStatus,
    }),
  ];
  if (renderActions) {
    columns.push(titanColumn("tableActions", { key: "actions", render: renderActions }));
  }
  return columns;
}

/** @deprecated use buildV13ProductListColumns — V1.3 alias */
export function buildStandardProductListColumns({ renderStatus, renderProcess, renderActions }) {
  return buildV13ProductListColumns({
    renderCurrentProcess: renderProcess,
    renderActions,
  });
}

/** 입고관리 — V1.3 공통 컬럼 */
export function buildInboundListColumns({ renderProcess, renderActions }) {
  return buildV13ProductListColumns({ renderCurrentProcess: renderProcess, renderActions });
}

/** 출고관리 — V1.3 (입고일 · 출고일 · LOT.NO …) */
export function buildOutboundV13ListColumns({ renderCurrentProcess, renderStatementStatus, renderActions } = {}) {
  const columns = [
    titanColumn("incomingDate", { key: "incomingDate", label: "입고일" }),
    titanColumn("outboundDate", { key: "outboundDate", label: "출고일" }),
    titanColumn("lotNo"),
    titanColumn("company"),
    titanColumn("partName"),
    titanColumn("partNo"),
    titanColumn("inboundQty", { key: "inboundQtyLabel", label: "입고수량" }),
    titanColumn("workQty", { key: "workQtyLabel", label: "작업수량" }),
    titanColumn("currentProcess", {
      key: "currentProcess",
      label: "현재공정",
      render: renderCurrentProcess,
    }),
    titanColumn("statementStatus", {
      key: "statementStatusLabel",
      label: "거래명세서",
      render: renderStatementStatus,
      widthPercent: 8,
    }),
    titanColumn("note", { key: "remark", label: "비고" }),
  ];
  if (renderActions) {
    columns.push(titanColumn("tableActions", { key: "actions", render: renderActions }));
  }
  return columns;
}

/** 출고관리 — V1.3 출고일 컬럼 */
export function buildOutboundListColumns({ renderProcess, renderStatementStatus, renderActions }) {
  return buildOutboundV13ListColumns({ renderCurrentProcess: renderProcess, renderStatementStatus, renderActions });
}

/** 검사일지 — V1.3 공통 컬럼 */
export function buildInspectionLogListColumns({ renderProcess, renderActions }) {
  return buildV13ProductListColumns({ renderCurrentProcess: renderProcess, renderActions });
}

/** 성적서관리 — V1.3 공통 컬럼 */
export function buildCertificateListColumns({ renderProcess, renderActions }) {
  return buildV13ProductListColumns({ renderCurrentProcess: renderProcess, renderActions });
}

/** 성적서현황 — 발행 이력 리스트 */
export function buildCertificateHistoryListColumns({ renderPdf, renderActions } = {}) {
  return [
    titanColumn("incomingDate", { key: "issuedDate", label: "발행일" }),
    titanColumn("company"),
    titanColumn("lotNo"),
    titanColumn("managementId"),
    titanColumn("manager", { key: "issuedBy", label: "발행자" }),
    titanColumn("qty", { key: "issueCount", label: "발행횟수", widthPercent: 8 }),
    titanColumn("status", { key: "reissueLabel", label: "재발행", widthPercent: 7 }),
    titanColumn("pdfFile", { key: "pdfDownload", label: "PDF", render: renderPdf }),
    titanColumn("tableActions", { key: "actions", label: "작업", render: renderActions }),
  ];
}

/** 문서관리 — V1.3 업체 중심 메인 리스트 */
export function buildDocumentCompanyListColumns({ renderActions }) {
  return [
    titanColumn("company"),
    titanColumn("manager", { key: "manager", label: "담당자" }),
    titanColumn("qty", { key: "documentCountLabel", label: "문서 개수", widthPercent: 9 }),
    titanColumn("incomingDate", { key: "lastModified", label: "최근 수정일" }),
    titanColumn("tableActions", { key: "actions", label: "작업", render: renderActions }),
  ];
}

/** 문서관리 Popup — 문서 리스트 (PM V1.3 간결 컬럼) */
export function buildDocumentRegistryListColumns({ renderStatus, renderAttachments } = {}) {
  return [
    titanColumn("partName", { key: "title", label: "문서명", widthPercent: 24 }),
    titanColumn("managementId", { key: "documentNo", label: "문서번호", widthPercent: 14 }),
    titanColumn("revision", { key: "revision", label: "Rev", widthPercent: 6 }),
    titanColumn("incomingDate", { key: "registeredDate", label: "등록일", widthPercent: 10 }),
    titanColumn("manager", { key: "registeredBy", label: "등록자", widthPercent: 9 }),
    titanColumn("attachments", {
      key: "attachments",
      label: "첨부파일",
      widthPercent: 8,
      render: renderAttachments,
    }),
    titanColumn("status", {
      key: "approvalStatus",
      label: "상태",
      widthPercent: 9,
      render: renderStatus,
    }),
  ];
}

/** 문서관리 Popup — 품목별 문서 탭 품목 리스트 (PM V1.4) */
export function buildDocumentProductSummaryListColumns({ renderStatus }) {
  return [
    titanColumn("partName", { label: "품명", widthPercent: 18 }),
    titanColumn("partNo", { label: "품번", widthPercent: 12 }),
    titanColumn("material", { label: "재질", widthPercent: 10 }),
    titanColumn("spec", { label: "규격", widthPercent: 12 }),
    titanColumn("qty", { key: "documentCountLabel", label: "등록 문서 수", widthPercent: 9 }),
    titanColumn("revision", { key: "latestRevision", label: "최신 Rev", widthPercent: 8 }),
    titanColumn("incomingDate", { key: "lastRegisteredDate", label: "최근 등록일", widthPercent: 11 }),
    titanColumn("status", {
      key: "statusLabel",
      label: "상태",
      widthPercent: 8,
      render: renderStatus,
    }),
  ];
}

/** @deprecated product-centric — use buildDocumentCompanyListColumns */
export function buildDocumentProductListColumns({ renderProcess, renderActions }) {
  return buildV13ProductListColumns({ renderCurrentProcess: renderProcess, renderActions });
}

/** 재고관리 LOT별 — V1.3 공통 컬럼 */
export function buildInventoryLotProductListColumns({ renderProcess, renderActions }) {
  return buildV13ProductListColumns({ renderCurrentProcess: renderProcess, renderActions });
}


/** 업무일지 — 사람 중심 업무 기록 */
export function buildWorkJournalListColumns({ renderSource }) {
  return [
    titanColumn("incomingDate", { key: "date", label: "일자" }),
    titanColumn("registeredAt", { key: "time", label: "시간", widthPercent: 7 }),
    titanColumn("process", { key: "category", label: "업무구분", widthPercent: 10 }),
    titanColumn("taskTitle", { key: "title", label: "업무내용", widthPercent: 20 }),
    titanColumn("manager", { key: "assignee", label: "담당자", widthPercent: 8 }),
    titanColumn("company"),
    titanColumn("managementId"),
    titanColumn("lotNo"),
    titanColumn("status", { key: "sourceLabel", label: "구분", render: renderSource, widthPercent: 7 }),
    titanColumn("note", { widthPercent: 12 }),
  ];
}

/** 재고관리 — 품목별 (업체+품번) */
export function buildInventoryStatusListColumns({ renderStatus }) {
  return [
    titanColumn("incomingDate", { key: "incomingDateLabel", label: "입고일" }),
    titanColumn("company"),
    titanColumn("partName"),
    titanColumn("partNo"),
    titanColumn("material"),
    titanColumn("spec"),
    titanColumn("currentStock", { key: "currentStockLabel" }),
    titanColumn("inboundQty", { key: "inboundQtyLabel" }),
    titanColumn("workInputQty", { key: "workInputQtyLabel" }),
    titanColumn("shippedQty", { key: "shippedQtyLabel" }),
    titanColumn("status", { key: "statusLabel", render: renderStatus }),
  ];
}

/** 재고관리 — LOT별 (관리번호) */
export function buildInventoryByLotListColumns({ renderStatus, renderProcess }) {
  const columns = [
    titanColumn("incomingDate", { key: "incomingDateLabel", label: "입고일" }),
    titanColumn("managementId"),
    titanColumn("lotNo"),
    titanColumn("company"),
    titanColumn("partName"),
    titanColumn("partNo"),
    titanColumn("material"),
    titanColumn("currentStock", { key: "currentStockLabel", label: "수량" }),
  ];
  if (renderProcess) {
    columns.push(
      titanColumn("currentProcess", {
        key: "currentProcess",
        label: "현재공정",
        render: renderProcess,
      })
    );
  }
  columns.push(titanColumn("status", { key: "statusLabel", label: "현재상태", render: renderStatus }));
  return columns;
}

/** 재고관리 — 거래처별 */
export function buildInventoryByCompanyListColumns({ renderStatus }) {
  return [
    titanColumn("incomingDate", { key: "incomingDateLabel", label: "입고일" }),
    titanColumn("company"),
    titanColumn("qty", { key: "skuCountLabel", label: "품목수" }),
    titanColumn("qty", { key: "lotCountLabel", label: "LOT수" }),
    titanColumn("inboundQty", { key: "inboundQtyLabel" }),
    titanColumn("shippedQty", { key: "shippedQtyLabel" }),
    titanColumn("currentStock", { key: "currentStockLabel" }),
    titanColumn("status", { key: "statusLabel", render: renderStatus }),
  ];
}
/** 생산실적관리 — V1.3 공통 컬럼 (분석 화면) */
export function buildProductionResultsListColumns({ renderProcess, renderActions }) {
  return buildV13ProductListColumns({ renderCurrentProcess: renderProcess, renderActions });
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

/** 검사현황 — 완료 이력 조회 (작업 컬럼 없음) */
export function buildInspectionStatusListColumns({ renderProcess, renderResult, renderAttachments }) {
  return [
    titanColumn("incomingDate", { key: "registeredDate", label: "검사등록일" }),
    titanColumn("managementId"),
    titanColumn("lotNo"),
    titanColumn("company"),
    titanColumn("partName"),
    titanColumn("partNo"),
    titanColumn("material"),
    titanColumn("process", { key: "processName", render: renderProcess }),
    titanColumn("status", { key: "inspectionResult", label: "검사결과", render: renderResult }),
    titanColumn("attachments", { key: "attachments", label: "첨부파일", render: renderAttachments }),
  ];
}

/** 양산검사 — 비고 대신 증빙 첨부파일 상태 표시 */
export function buildMassInspectionListColumns({ renderProcess, renderActions, renderAttachments }) {
  const columns = buildV13ProductListColumns({ renderCurrentProcess: renderProcess });
  const attachmentColumn = titanColumn("attachments", {
    key: "attachments",
    label: "첨부파일",
    render: renderAttachments,
  });
  const noteIndex = columns.findIndex((column) => column.key === "remark");
  if (noteIndex >= 0) {
    columns.splice(noteIndex, 1, attachmentColumn);
  } else {
    columns.push(attachmentColumn);
  }
  if (renderActions) {
    columns.push(titanColumn("tableActions", { key: "actions", render: renderActions }));
  }
  return columns;
}

/** 개발검사 */
export function buildDevelopmentInspectionListColumns({ renderStatus, renderActions }) {
  return [
    titanColumn("devNo"),
    titanColumn("company"),
    titanColumn("partName"),
    titanColumn("testName"),
    titanColumn("material"),
    titanColumn("requester"),
    titanColumn("incomingDate", { key: "registeredDate", label: "등록일" }),
    titanColumn("status", { render: renderStatus }),
    titanColumn("tableActions", { key: "actions", label: "검사등록", render: renderActions }),
  ];
}

/** 기타검사 */
export function buildOtherInspectionListColumns({ renderStatus, renderActions }) {
  return [
    titanColumn("managementId"),
    titanColumn("category"),
    titanColumn("company"),
    titanColumn("partName"),
    titanColumn("content"),
    titanColumn("assignee"),
    titanColumn("incomingDate", { key: "registeredDate", label: "등록일" }),
    titanColumn("status", { render: renderStatus }),
    titanColumn("tableActions", { key: "actions", label: "검사등록", render: renderActions }),
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

export function buildShotStatisticsListColumns() {
  return [
    titanColumn("company"),
    titanColumn("partName"),
    titanColumn("partNo"),
    titanColumn("material"),
    titanColumn("spec"),
    titanColumn("worker", { label: "작업자" }),
    titanColumn("statProductionQty", { key: "shotQtyLabel", label: "처리 EA" }),
    titanColumn("workDate", { key: "shotWorkDate", label: "작업일" }),
    titanColumn("status", { key: "statusLabel", label: "상태" }),
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
