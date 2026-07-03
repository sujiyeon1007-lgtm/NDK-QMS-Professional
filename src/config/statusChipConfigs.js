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
        id: "incoming",
        label: "입고",
        icon: "inventory",
        tone: "incoming",
        filterValue: "입고",
      },
      {
        id: "production",
        label: "작업중",
        icon: "precisionManufacturing",
        tone: "production",
        filterValue: "작업중",
      },
      {
        id: "inspect",
        label: "검사",
        icon: "factCheck",
        tone: "inspect",
        filterValue: "검사",
      },
      {
        id: "cert",
        label: "성적서",
        icon: "description",
        tone: "certificate",
        filterValue: "성적서",
      },
      {
        id: "ship",
        label: "출고",
        icon: "localShipping",
        tone: "shipment",
        filterValue: "출고",
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
    ariaLabel: "생산 현황",
    chips: [
      {
        id: "prodProgress",
        label: "생산중",
        icon: "precisionManufacturing",
        tone: "production",
        filterValue: "생산",
      },
      {
        id: "prodWait",
        label: "생산대기",
        icon: "hourglass",
        tone: "prod-wait",
        filterValue: "생산대기",
      },
      {
        id: "prodDone",
        label: "생산완료",
        icon: "taskAlt",
        tone: "complete",
        filterValue: "생산완료",
      },
    ],
  },

  inspection: {
    id: "inspection",
    ariaLabel: "검사 현황",
    chips: [
      {
        id: "inspectWait",
        label: "검사대기",
        icon: "hourglass",
        tone: "inspect",
        filterValue: "검사대기",
      },
      {
        id: "inspectProgress",
        label: "검사중",
        icon: "factCheck",
        tone: "inspect",
        filterValue: "검사중",
      },
      {
        id: "pass",
        label: "합격",
        icon: "taskAlt",
        tone: "complete",
        filterValue: "합격",
      },
      {
        id: "fail",
        label: "불합격",
        icon: "warning",
        tone: "defect",
        filterValue: "불합격",
      },
      {
        id: "reinspect",
        label: "재검사",
        icon: "replay",
        tone: "wait",
        filterValue: "재검사",
      },
    ],
  },

  certificate: {
    id: "certificate",
    ariaLabel: "성적서 현황",
    chips: [
      {
        id: "certWait",
        label: "성적서대기",
        icon: "description",
        tone: "certificate",
        filterValue: "성적서",
      },
      {
        id: "certDone",
        label: "발행완료",
        icon: "taskAlt",
        tone: "complete",
        filterValue: "발행완료",
      },
    ],
  },

  outbound: {
    id: "outbound",
    ariaLabel: "출고 현황",
    chips: [
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

  statistics: {
    id: "statistics",
    ariaLabel: "운영 현황",
    chips: [
      {
        id: "incoming",
        label: "입고완료",
        icon: "inventory",
        tone: "incoming",
        filterable: false,
      },
      {
        id: "production",
        label: "생산중",
        icon: "precisionManufacturing",
        tone: "production",
        filterable: false,
      },
      {
        id: "inspect",
        label: "검사대기",
        icon: "factCheck",
        tone: "inspect",
        filterable: false,
      },
      {
        id: "cert",
        label: "성적서대기",
        icon: "description",
        tone: "certificate",
        filterable: false,
      },
      {
        id: "ship",
        label: "출고예정",
        icon: "localShipping",
        tone: "shipment",
        filterable: false,
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
