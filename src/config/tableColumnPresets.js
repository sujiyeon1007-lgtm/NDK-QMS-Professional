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
  process: { label: "공정", widthPercent: 8 },
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
