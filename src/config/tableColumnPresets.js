/**
 * Project TITAN V1.0 — 공통 테이블 컬럼 폭 (비율 기준)
 * px 고정값 대신 widthPercent(%) 사용 · TitanDataTable colgroup 적용
 */

/** @typedef {{ key: string, label: string, widthPercent?: number, width?: string, render?: Function }} TitanColumnDef */

/**
 * PM V1.0 3차 기준 — 업체명 축소 · 품명/품번 확대
 * @type {Record<string, { label: string, widthPercent: number }>}
 */
export const TITAN_COLUMN_WIDTHS = {
  select: { label: "", widthPercent: 3 },
  managementId: { label: "관리번호", widthPercent: 11 },
  company: { label: "업체명", widthPercent: 13 },
  partName: { label: "품명", widthPercent: 22 },
  partNo: { label: "품번", widthPercent: 14 },
  material: { label: "재질", widthPercent: 8 },
  qty: { label: "수량", widthPercent: 7 },
  shipQty: { label: "수량", widthPercent: 8 },
  dueDate: { label: "납기", widthPercent: 9 },
  shipDate: { label: "작업일", widthPercent: 9 },
  lotNo: { label: "LOT.NO", widthPercent: 9 },
  customerLotNo: { label: "업체 LOT", widthPercent: 10 },
  purchaseOrderNo: { label: "발주번호", widthPercent: 11 },
  process: { label: "공정", widthPercent: 11 },
  currentProcess: { label: "현재공정", widthPercent: 12 },
  workQty: { label: "수량", widthPercent: 7 },
  workDate: { label: "작업일", widthPercent: 9 },
  status: { label: "현재상태", widthPercent: 10 },
  incomingDate: { label: "등록일", widthPercent: 9 },
  registeredAt: { label: "등록일시", widthPercent: 12 },
  registrar: { label: "등록자", widthPercent: 8 },
  manager: { label: "담당자", widthPercent: 8 },
  worker: { label: "작업자", widthPercent: 8 },
  equipment: { label: "설비", widthPercent: 8 },
  defectType: { label: "불량유형", widthPercent: 9 },
  defectQty: { label: "불량수량", widthPercent: 8 },
  occurredDate: { label: "발생일", widthPercent: 9 },
  handlingStatus: { label: "처리상태", widthPercent: 9 },
  note: { label: "비고", widthPercent: 10 },
  inspectionDate: { label: "검사일", widthPercent: 9 },
  excelFile: { label: "엑셀", widthPercent: 6 },
  pdfFile: { label: "PDF", widthPercent: 6 },
  taskTitle: { label: "업무명", widthPercent: 22 },
  department: { label: "담당부서", widthPercent: 10 },
  assignee: { label: "담당자", widthPercent: 12 },
  manager: { label: "담당자", widthPercent: 10 },
  shipDate: { label: "출고일", widthPercent: 9 },
  requestDate: { label: "요청일", widthPercent: 9 },
  priority: { label: "우선순위", widthPercent: 8 },
  statNo: { label: "NO", widthPercent: 5 },
  statProductionKg: { label: "생산(kg)", widthPercent: 10 },
  statShipmentKg: { label: "출고(kg)", widthPercent: 10 },
  statProductionQty: { label: "생산량", widthPercent: 10 },
  statShipmentQty: { label: "출고량", widthPercent: 10 },
  statUnit: { label: "단위", widthPercent: 7 },
  statInspectionCount: { label: "검사건수", widthPercent: 9 },
  statPassRate: { label: "합격률(%)", widthPercent: 9 },
  statDefectRate: { label: "불량률(%)", widthPercent: 9 },
  statReprocessRate: { label: "재처리율(%)", widthPercent: 9 },
};

/**
 * @param {keyof typeof TITAN_COLUMN_WIDTHS | string} preset
 * @param {Partial<TitanColumnDef>} [overrides]
 * @returns {TitanColumnDef}
 */
export function titanColumn(preset, overrides = {}) {
  const base = TITAN_COLUMN_WIDTHS[preset];
  if (!base) {
    throw new Error(`Unknown titan column preset: ${preset}`);
  }

  const key = overrides.key ?? preset;
  return {
    key,
    label: overrides.label ?? base.label,
    widthPercent: overrides.widthPercent ?? base.widthPercent,
    ...overrides,
  };
}

/** HOME · 입고 제품 현황 */
export const HOME_PRODUCT_COLUMNS = [
  titanColumn("managementId"),
  titanColumn("company"),
  titanColumn("partName"),
  titanColumn("partNo"),
  titanColumn("status", { key: "statusLabel", label: "현재상태" }),
  titanColumn("registeredAt"),
  titanColumn("registrar"),
];

/**
 * @param {TitanColumnDef} col
 * @returns {string | undefined}
 */
export function resolveColumnWidth(col) {
  if (col.widthPercent != null) {
    return `${col.widthPercent}%`;
  }
  return col.width;
}
