/**
 * Project TITAN V1.0 — Status Chip Config (페이지별 Chip 구성)
 *
 * Chip 항목은 페이지마다 자유롭게 정의합니다.
 * Count는 statusChipCounts.js resolver · SQLite 연동 시 API로 교체합니다.
 */

/** @typedef {import("./statusChipIcons.jsx").STATUS_CHIP_ICONS} StatusChipIconMap */

/**
 * @typedef {object} StatusChipDef
 * @property {string} id
 * @property {string} label
 * @property {keyof StatusChipIconMap | string} icon
 * @property {string} tone — titan-process--{tone} (KPI Bar workflow accent)
 * @property {string} [filterValue] — 검색 status 필터
 * @property {Record<string, string>} [filterPatch] — status 외 필드 패치
 * @property {string} [countKey] — counts 객체 키 (기본: id)
 * @property {boolean} [filterable] — false면 표시만 (기본 true)
 */

/**
 * @typedef {object} StatusChipSetDef
 * @property {string} id
 * @property {string} ariaLabel
 * @property {StatusChipDef[]} chips
 */

/** @type {Record<string, StatusChipSetDef>} */
export const STATUS_CHIP_SETS = {
  home: {
    id: "home",
    ariaLabel: "진행현황",
    chips: [
      {
        id: "RECEIVED",
        label: "입고등록",
        icon: "inventory",
        tone: "incoming",
        filterPatch: { __chipRECEIVED: "1" },
      },
      {
        id: "HT_WAIT",
        label: "열처리 대기",
        icon: "precisionManufacturing",
        tone: "production",
        filterPatch: { __chipHT_WAIT: "1" },
      },
      {
        id: "HT_RUNNING",
        label: "열처리 중",
        icon: "precisionManufacturing",
        tone: "production",
        filterPatch: { __chipHT_RUNNING: "1" },
      },
      {
        id: "INSPECTION_WAIT",
        label: "검사 대기",
        icon: "factCheck",
        tone: "inspection",
        filterPatch: { __chipINSPECTION_WAIT: "1" },
      },
      {
        id: "CERT_WAIT",
        label: "성적서 대기",
        icon: "description",
        tone: "certificate",
        filterPatch: { __chipCERT_WAIT: "1" },
      },
      {
        id: "SHIP_WAIT",
        label: "출고 대기",
        icon: "localShipping",
        tone: "shipment",
        filterPatch: { __chipSHIP_WAIT: "1" },
      },
    ],
  },

  inbound: {
    id: "inbound",
    ariaLabel: "입고 현황",
    chips: [
      {
        id: "productIncomingReg",
        label: "제품 입고 등록",
        icon: "inventory",
        tone: "incoming",
        filterPatch: { __chipProductIncomingReg: "1" },
      },
      {
        id: "productHtlNotPrinted",
        label: "미출력 입고리스트",
        icon: "description",
        tone: "production",
        filterPatch: { __chipProductHtlNotPrinted: "1" },
      },
      {
        id: "productShipWait",
        label: "제품 출고대기",
        icon: "localShipping",
        tone: "shipment",
        filterPatch: { __chipProductShipWait: "1" },
      },
      {
        id: "productShipDone",
        label: "제품 출고완료",
        icon: "taskAlt",
        tone: "complete",
        filterPatch: { __chipProductShipDone: "1" },
      },
    ],
  },

  production: {
    id: "production",
    ariaLabel: "열처리 현황",
    chips: [
      {
        id: "prodProgress",
        label: "진행중",
        icon: "precisionManufacturing",
        tone: "production",
        filterPatch: { __chipProdProgress: "1" },
      },
      {
        id: "prodDone",
        label: "완료",
        icon: "taskAlt",
        tone: "complete",
        filterPatch: { __chipProdDone: "1" },
      },
    ],
  },

  inspection: {
    id: "inspection",
    ariaLabel: "검사 현황",
    chips: [
      {
        id: "inspectNotDone",
        label: "미검사",
        icon: "hourglass",
        tone: "inspect",
        filterPatch: { __chipInspectNotDone: "1" },
      },
      {
        id: "inspectDone",
        label: "검사완료",
        icon: "taskAlt",
        tone: "complete",
        filterPatch: { __chipInspectDone: "1" },
      },
    ],
  },

  certificate: {
    id: "certificate",
    ariaLabel: "성적서 현황",
    chips: [
      {
        id: "certNotIssued",
        label: "미발행",
        icon: "description",
        tone: "certificate",
        filterPatch: { __chipCertNotIssued: "1" },
      },
      {
        id: "certIssued",
        label: "발행완료",
        icon: "taskAlt",
        tone: "complete",
        filterPatch: { __chipCertIssued: "1" },
      },
    ],
  },

  outbound: {
    id: "outbound",
    ariaLabel: "출고 현황",
    chips: [
      {
        id: "shipNotDone",
        label: "미출고",
        icon: "localShipping",
        tone: "shipment",
        filterPatch: { __chipShipNotDone: "1" },
      },
      {
        id: "shipDone",
        label: "출고완료",
        icon: "taskAlt",
        tone: "complete",
        filterPatch: { __chipShipDone: "1" },
      },
    ],
  },

  statistics: {
    id: "statistics",
    ariaLabel: "운영 현황",
    chips: [
      { id: "RECEIVED", label: "입고등록", icon: "inventory", tone: "incoming", filterable: false },
      { id: "HT_WAIT", label: "열처리 대기", icon: "precisionManufacturing", tone: "production", filterable: false },
      { id: "HT_RUNNING", label: "열처리 중", icon: "precisionManufacturing", tone: "production", filterable: false },
      { id: "INSPECTION_WAIT", label: "검사 대기", icon: "factCheck", tone: "inspect", filterable: false },
      { id: "CERT_WAIT", label: "성적서 대기", icon: "description", tone: "certificate", filterable: false },
      { id: "SHIP_WAIT", label: "출고 대기", icon: "localShipping", tone: "shipment", filterable: false },
    ],
  },

  inventory: {
    id: "inventory",
    ariaLabel: "재고관리 KPI",
    chips: [
      {
        id: "inCustody",
        label: "보관 중 재고",
        icon: "inventory",
        tone: "incoming",
        filterPatch: { __chipInCustody: "1" },
      },
      {
        id: "HT_WAIT",
        label: "생산 대기",
        icon: "precisionManufacturing",
        tone: "production",
        filterPatch: { __chipHT_WAIT: "1" },
      },
      {
        id: "HT_RUNNING",
        label: "생산 중",
        icon: "precisionManufacturing",
        tone: "production",
        filterPatch: { __chipHT_RUNNING: "1" },
      },
      {
        id: "INSPECTION_WAIT",
        label: "검사 대기",
        icon: "factCheck",
        tone: "inspection",
        filterPatch: { __chipINSPECTION_WAIT: "1" },
      },
      {
        id: "CERT_WAIT",
        label: "성적서 대기",
        icon: "description",
        tone: "certificate",
        filterPatch: { __chipCERT_WAIT: "1" },
      },
      {
        id: "SHIP_WAIT",
        label: "출고 대기",
        icon: "localShipping",
        tone: "shipment",
        filterPatch: { __chipSHIP_WAIT: "1" },
      },
    ],
  },
};

/**
 * @param {string} chipSetId
 * @returns {StatusChipSetDef | null}
 */
export function getStatusChipSet(chipSetId) {
  return STATUS_CHIP_SETS[chipSetId] ?? null;
}

/**
 * @param {string} chipSetId
 * @param {Record<string, number>} counts
 * @returns {Array<StatusChipDef & { value: number }>}
 */
export function buildStatusChipItems(chipSetId, counts = {}) {
  const set = getStatusChipSet(chipSetId);
  if (!set) return [];

  return set.chips.map((chip) => ({
    ...chip,
    value: counts[chip.countKey ?? chip.id] ?? 0,
  }));
}

/** @deprecated statusChipConfigs STATUS_CHIP_SETS.home 사용 */
export const WORKFLOW_CHIP_STATUS_FILTER = Object.fromEntries(
  STATUS_CHIP_SETS.home.chips.map((chip) => [chip.id, chip.filterValue ?? ""])
);
