/**
 * Project TITAN V1.0 — Status Chip Count Resolvers
 *
 * V1: Mock / SessionStorage records 기반
 * V2: SQLite · API 실시간 count (동일 resolver 시그니처 유지)
 */

import {
  getCertificateScreenData,
  getHomeScreenData,
  getInboundScreenData,
  getInspectionScreenData,
  getOutboundScreenData,
  getProductionScreenData,
} from "./titanScreenDataSource";
import { getSessionProductionRecords } from "./productionRecords";

/**
 * @typedef {Record<string, number>} StatusChipCounts
 */

/** @type {Record<string, (records: object[]) => StatusChipCounts>} */
export const STATUS_CHIP_COUNT_RESOLVERS = {
  home: resolveHomeStatusChipCounts,
  inbound: resolveInboundStatusChipCounts,
  production: resolveProductionStatusChipCounts,
  inspection: resolveInspectionStatusChipCounts,
  certificate: resolveCertificateStatusChipCounts,
  outbound: resolveOutboundStatusChipCounts,
  statistics: resolveHomeStatusChipCounts,
};

/**
 * @param {string} chipSetId
 * @param {object[]} [records]
 * @returns {StatusChipCounts}
 */
export function computeStatusChipCounts(chipSetId, records = getSessionProductionRecords()) {
  const resolver = STATUS_CHIP_COUNT_RESOLVERS[chipSetId];
  if (!resolver) return {};
  return resolver(records);
}

/** HOME · 통계 — active workflow processKey counts */
export function resolveHomeStatusChipCounts(records) {
  return getHomeScreenData(records).counts;
}

export function resolveInboundStatusChipCounts(records) {
  return getInboundScreenData(records).counts;
}

export function resolveProductionStatusChipCounts(records) {
  return getProductionScreenData(records).counts;
}

export function resolveInspectionStatusChipCounts(records) {
  return getInspectionScreenData(records).counts;
}

export function resolveCertificateStatusChipCounts(records) {
  return getCertificateScreenData(records).counts;
}

export function resolveOutboundStatusChipCounts(records) {
  return getOutboundScreenData(records).counts;
}
