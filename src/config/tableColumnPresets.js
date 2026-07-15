/**
 * Project TITAN V1.0 — 공통 테이블 컬럼 (ERP/MES Compact Grid)
 *
 * layout="compact" (기본): 데이터 길이 기준 auto · 왼쪽 정렬 · 화면 억지 확장 없음
 * layout="ratio" (레거시): widthPercent(%) 고정 비율
 */

/** @typedef {"wide" | "medium" | "narrow"} TitanWidthHint */

/** @typedef {{ key: string, label: string, widthHint?: TitanWidthHint, widthPercent?: number, width?: string, identifier?: boolean, render?: Function }} TitanColumnDef */

/** 식별번호 — 전체 표시 우선 · Tooltip */
export const TITAN_IDENTIFIER_COLUMN_KEYS = new Set([
  "managementId",
  "lotNo",
  "partNo",
  "purchaseOrderNo",
  "customerLotNo",
  "drawingNo",
  "documentNo",
  "certificateNo",
  "code",
  "companyCode",
]);

/** V1.3 — 좌측 정렬 컬럼 (텍스트 · 식별 · 거래처) */
const TITAN_ALIGN_LEFT_KEYS = new Set([
  "company",
  "companyName",
  "companyCode",
  "companyCeo",
  "partName",
  "partNo",
  "material",
  "spec",
  "name",
  "title",
  "taskTitle",
  "note",
  "description",
  "content",
  "managementId",
  "lotNo",
  "customerLotNo",
  "purchaseOrderNo",
  "drawingNo",
  "devNo",
  "testName",
  "assignee",
  "manager",
  "managerName",
  "worker",
  "registrar",
  "equipment",
  "department",
  "requester",
  "email",
  "documentNo",
  "certificateNo",
]);

/** V1.3 — 가운데 정렬 (Badge · 수량 · 날짜 · 작업) */
const TITAN_ALIGN_CENTER_KEYS = new Set([
  "__select",
  "process",
  "processName",
  "currentProcess",
  "status",
  "statusLabel",
  "statementStatus",
  "inspectionStatus",
  "handlingStatus",
  "companyStatus",
  "activeLabel",
  "sourceLabel",
  "category",
  "qty",
  "shipQty",
  "workQty",
  "completedQty",
  "defectQty",
  "currentStock",
  "inboundQty",
  "remainingChargeQty",
  "chargeQty",
  "shippedQty",
  "workInputQty",
  "progress",
  "tableActions",
  "actions",
  "attachments",
  "attachmentCount",
  "excelFile",
  "pdfFile",
  "priority",
  "revision",
  "lastModified",
  "documentStatusId",
  "skuCountLabel",
  "lotCountLabel",
  "statNo",
  "statUnit",
  "statProductionKg",
  "statShipmentKg",
  "statProductionQty",
  "statShipmentQty",
  "statInspectionCount",
  "statPassRate",
  "statDefectRate",
  "statReprocessRate",
  "incomingDate",
  "registeredDate",
  "dueDate",
  "shipDate",
  "outboundDate",
  "workDate",
  "productionDate",
  "registeredAt",
  "inspectionDate",
  "occurredDate",
  "requestDate",
  "productionCompleteDate",
  "time",
  "defectType",
]);

/** 기준정보 등 key → preset 매핑 */
export const MASTER_COLUMN_PRESET_MAP = {
  name: "companyName",
  code: "companyCode",
  ceoName: "companyCeo",
  activeLabel: "companyStatus",
  partNo: "partNo",
  company: "company",
  material: "material",
  spec: "spec",
  partName: "partName",
  description: "note",
  department: "department",
  equipType: "process",
  group: "department",
  employmentStatus: "companyStatus",
};

/**
 * @type {Record<string, { label: string, widthHint: TitanWidthHint, widthPercent?: number }>}
 */
export const TITAN_COLUMN_WIDTHS = {
  select: { label: "", widthHint: "narrow", widthPercent: 3 },
  managementId: { label: "관리번호", widthHint: "wide", widthPercent: 11 },
  company: { label: "업체명", widthHint: "wide", widthPercent: 13 },
  partName: { label: "품명", widthHint: "wide", widthPercent: 22 },
  partNo: { label: "품번", widthHint: "medium", widthPercent: 14 },
  material: { label: "재질", widthHint: "medium", widthPercent: 8 },
  spec: { label: "규격", widthHint: "medium", widthPercent: 9 },
  currentStock: { label: "현재 재고", widthHint: "narrow", widthPercent: 9 },
  inboundQty: { label: "입고수량", widthHint: "narrow", widthPercent: 9 },
  remainingChargeQty: { label: "잔여수량", widthHint: "narrow", widthPercent: 9 },
  chargeQty: { label: "장입수량", widthHint: "narrow", widthPercent: 9 },
  workInputQty: { label: "작업 투입", widthHint: "narrow", widthPercent: 9 },
  shippedQty: { label: "출고 수량", widthHint: "narrow", widthPercent: 9 },
  lastIncomingDate: { label: "입고일", widthHint: "medium", widthPercent: 10 },
  qty: { label: "수량", widthHint: "narrow", widthPercent: 7 },
  shipQty: { label: "수량", widthHint: "narrow", widthPercent: 8 },
  dueDate: { label: "납기", widthHint: "medium", widthPercent: 9 },
  shipDate: { label: "작업일", widthHint: "medium", widthPercent: 9 },
  outboundDate: { label: "출고일", widthHint: "medium", widthPercent: 9 },
  lotNo: { label: "LOT.NO", widthHint: "medium", widthPercent: 9 },
  customerLotNo: { label: "업체 LOT", widthHint: "medium", widthPercent: 10 },
  purchaseOrderNo: { label: "발주번호", widthHint: "wide", widthPercent: 11 },
  process: { label: "공정", widthHint: "medium", widthPercent: 11 },
  currentProcess: { label: "현재공정", widthHint: "medium", widthPercent: 12 },
  progress: { label: "진행률", widthHint: "narrow", widthPercent: 8 },
  workQty: { label: "작업수량", widthHint: "narrow", widthPercent: 8 },
  completedQty: { label: "완료수량", widthHint: "narrow", widthPercent: 7 },
  workDate: { label: "작업일", widthHint: "medium", widthPercent: 9 },
  productionDate: { label: "생산일", widthHint: "medium", widthPercent: 9 },
  status: { label: "현재상태", widthHint: "narrow", widthPercent: 10 },
  statusLabel: { label: "상태", widthHint: "narrow", widthPercent: 10 },
  statementStatus: { label: "거래명세서", widthHint: "narrow", widthPercent: 8 },
  incomingDate: { label: "입고일", widthHint: "medium", widthPercent: 9 },
  registeredAt: { label: "등록일시", widthHint: "medium", widthPercent: 12 },
  workStartAt: { label: "시작", widthHint: "medium", widthPercent: 9 },
  workEndAt: { label: "종료", widthHint: "medium", widthPercent: 9 },
  registrar: { label: "등록자", widthHint: "medium", widthPercent: 8 },
  manager: { label: "담당자", widthHint: "medium", widthPercent: 8 },
  worker: { label: "작업자", widthHint: "medium", widthPercent: 8 },
  equipment: { label: "설비", widthHint: "medium", widthPercent: 8 },
  defectType: { label: "불량유형", widthHint: "medium", widthPercent: 9 },
  defectQty: { label: "불량수량", widthHint: "narrow", widthPercent: 8 },
  occurredDate: { label: "발생일", widthHint: "medium", widthPercent: 9 },
  handlingStatus: { label: "처리상태", widthHint: "narrow", widthPercent: 9 },
  note: { label: "비고", widthHint: "wide", widthPercent: 10 },
  attachments: { label: "첨부파일", widthHint: "narrow", widthPercent: 8 },
  inspectionDate: { label: "검사일", widthHint: "medium", widthPercent: 9 },
  revision: { label: "Rev", widthHint: "narrow", widthPercent: 6 },
  registeredDate: { label: "등록일", widthHint: "medium", widthPercent: 9 },
  lastModified: { label: "최근 수정일", widthHint: "medium", widthPercent: 10 },
  excelFile: { label: "엑셀", widthHint: "narrow", widthPercent: 6 },
  pdfFile: { label: "PDF", widthHint: "narrow", widthPercent: 6 },
  taskTitle: { label: "업무명", widthHint: "wide", widthPercent: 22 },
  department: { label: "담당부서", widthHint: "medium", widthPercent: 10 },
  assignee: { label: "담당자", widthHint: "medium", widthPercent: 12 },
  requester: { label: "의뢰자", widthHint: "medium", widthPercent: 10 },
  devNo: { label: "개발번호", widthHint: "medium", widthPercent: 11 },
  testName: { label: "시험명", widthHint: "wide", widthPercent: 16 },
  category: { label: "구분", widthHint: "medium", widthPercent: 9 },
  content: { label: "내용", widthHint: "wide", widthPercent: 18 },
  productionCompleteDate: { label: "열처리완료일", widthHint: "medium", widthPercent: 10 },
  inspectionStatus: { label: "검사상태", widthHint: "narrow", widthPercent: 9 },
  tableActions: { label: "작업", widthHint: "medium", widthPercent: 12 },
  requestDate: { label: "요청일", widthHint: "medium", widthPercent: 9 },
  priority: { label: "우선순위", widthHint: "narrow", widthPercent: 8 },
  statNo: { label: "NO", widthHint: "narrow", widthPercent: 5 },
  statProductionKg: { label: "생산(kg)", widthHint: "narrow", widthPercent: 10 },
  statShipmentKg: { label: "출고(kg)", widthHint: "narrow", widthPercent: 10 },
  statProductionQty: { label: "생산량", widthHint: "narrow", widthPercent: 10 },
  statShipmentQty: { label: "출고량", widthHint: "narrow", widthPercent: 10 },
  statUnit: { label: "단위", widthHint: "narrow", widthPercent: 7 },
  statInspectionCount: { label: "검사건수", widthHint: "narrow", widthPercent: 9 },
  statPassRate: { label: "합격률(%)", widthHint: "narrow", widthPercent: 9 },
  statDefectRate: { label: "불량률(%)", widthHint: "narrow", widthPercent: 9 },
  statReprocessRate: { label: "재처리율(%)", widthHint: "narrow", widthPercent: 9 },
  companyName: { label: "업체명", widthHint: "wide", widthPercent: 22 },
  companyCode: { label: "코드", widthHint: "narrow", widthPercent: 8 },
  companyCeo: { label: "대표자", widthHint: "medium", widthPercent: 14 },
  companyStatus: { label: "상태", widthHint: "narrow", widthPercent: 6 },
};

/** 거래처관리 — Compact ERP/MES list */
export const COMPANY_LIST_COLUMN_PRESETS = [
  titanColumn("companyName", { key: "name" }),
  titanColumn("companyCode", { key: "code", label: "코드" }),
  titanColumn("companyCeo", { key: "ceoName", label: "대표자" }),
  titanColumn("companyStatus", { key: "activeLabel", label: "상태" }),
];

/**
 * @param {string} key
 * @returns {TitanWidthHint}
 */
export function inferWidthHint(key) {
  if (!key || key === "__select") return "narrow";
  if (
    /^(qty|count|status|active|priority|unit|progress|select|statNo|excelFile|pdfFile)$/i.test(
      key
    ) ||
    /Qty$|Count$|Rate$|Stock$|stock$/i.test(key)
  ) {
    return "narrow";
  }
  if (/Date$|At$|Time$/i.test(key)) return "medium";
  if (/^(company|partName|name|title|taskTitle|note|description|email|managementId|purchaseOrderNo)$/i.test(key)) {
    return "wide";
  }
  return "medium";
}

/**
 * @param {string} key
 * @returns {boolean}
 */
export function isTitanIdentifierColumn(key) {
  return TITAN_IDENTIFIER_COLUMN_KEYS.has(key);
}

/**
 * V1.3 공통 Grid 정렬 — @returns {"left"|"center"|"right"}
 */
export function resolveColumnAlign(col) {
  if (col?.align === "left" || col?.align === "center" || col?.align === "right") {
    return col.align;
  }

  const key = col?.key ?? "";
  if (TITAN_ALIGN_CENTER_KEYS.has(key)) {
    return "center";
  }
  if (TITAN_ALIGN_LEFT_KEYS.has(key)) {
    return "left";
  }
  if (/Date$|At$|Time$/i.test(key)) {
    return "center";
  }
  if (/Qty$|Count$|Stock$|Rate$|^qty$|^stat/i.test(key)) {
    return "center";
  }
  if (/^(company|partName|name|title|note|managementId|lotNo|material|spec|partNo|customerLotNo|purchaseOrderNo)/i.test(key)) {
    return "left";
  }
  return "left";
}

/**
 * @param {TitanColumnDef} col
 * @param {"compact" | "ratio"} [layout]
 * @returns {TitanColumnDef}
 */
export function resolveColDefinition(col, layout = "compact") {
  const normalizedLayout = layout === "auto" ? "compact" : layout;
  const presetKey = MASTER_COLUMN_PRESET_MAP[col.key] ?? col.key;
  const preset = TITAN_COLUMN_WIDTHS[presetKey] ?? TITAN_COLUMN_WIDTHS[col.key];
  const widthHint = col.widthHint ?? preset?.widthHint ?? inferWidthHint(col.key);

  if (normalizedLayout === "ratio") {
    if (col.widthPercent != null || col.width) {
      return { ...col, widthHint };
    }
    if (preset?.widthPercent != null) {
      return { ...col, widthPercent: preset.widthPercent, widthHint };
    }
    return { ...col, widthHint };
  }

  const { widthPercent: _ignored, ...rest } = col;
  return { ...rest, widthHint };
}

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
  const column = {
    key,
    label: overrides.label ?? base.label,
    widthHint: overrides.widthHint ?? base.widthHint,
    widthPercent: overrides.widthPercent ?? base.widthPercent,
    ...overrides,
  };
  if (!column.align) {
    column.align = resolveColumnAlign(column);
  }
  return column;
}

/**
 * RC1 설비 장입 — 장입 가능 LOT 리스트 (6 columns · ratio layout)
 * 업체명/품명 wide · 품번/재질 medium · 수량 narrow
 */
export const CHARGEABLE_LOT_COLUMN_SPEC = [
  { preset: "company", widthPercent: 18 },
  { preset: "partName", widthPercent: 24 },
  { preset: "partNo", widthPercent: 14 },
  { preset: "material", widthPercent: 12 },
  { preset: "inboundQty", widthPercent: 9, label: "입고 수량(EA)" },
  { preset: "remainingChargeQty", widthPercent: 9, label: "잔여 수량(EA)" },
];

/**
 * RC1 설비 운전중 — 장입된 제품 리스트 (read-only monitor)
 */
export const CHARGED_LOT_RUNNING_COLUMN_SPEC = [
  { preset: "company", widthPercent: 18 },
  { preset: "partName", widthPercent: 22 },
  { preset: "partNo", widthPercent: 14 },
  { preset: "material", widthPercent: 12 },
  { preset: "inboundQty", widthPercent: 9, label: "입고수량" },
  { preset: "chargeQty", widthPercent: 9, label: "장입수량" },
];

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
 * @param {"compact" | "ratio"} [layout]
 * @returns {string | undefined}
 */
export function resolveColumnWidth(col, layout = "compact") {
  const normalizedLayout = layout === "auto" ? "compact" : layout;
  if (normalizedLayout === "ratio") {
    if (col.widthPercent != null) {
      return `${col.widthPercent}%`;
    }
    return col.width;
  }
  return col.width;
}

/**
 * @param {TitanColumnDef} col
 * @returns {string}
 */
export function resolveColumnClass(col) {
  const hint = col.widthHint ?? inferWidthHint(col.key);
  return `titan-col--${hint}`;
}

export function resolveColumnCellClassName(col) {
  const align = resolveColumnAlign(col);
  return `titan-table__cell titan-table__cell--${col.key} titan-table__cell--align-${align}`;
}
