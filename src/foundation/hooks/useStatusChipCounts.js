import { useMemo } from "react";

import { computeStatusChipCounts } from "../../utils/statusChipCounts";

/**
 * Status Chip Count — V1 Mock/Session · V2 SQLite/API 동일 인터페이스
 *
 * @param {string} chipSetId
 * @param {object[]} records
 * @returns {Record<string, number>}
 */
export function useStatusChipCounts(chipSetId, records) {
  return useMemo(() => {
    if (!chipSetId) return {};
    return computeStatusChipCounts(chipSetId, records ?? []);
  }, [chipSetId, records]);
}
