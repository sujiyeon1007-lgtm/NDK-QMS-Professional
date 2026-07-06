import {
  isProductionDailyReportPrintReady,
  normalizeProductionLotKey,
} from "../../utils/productionDailyReportPrintData";

export const PRODUCTION_DAILY_PRINT_NO_SELECTION_MESSAGE = "출력할 열처리일보를 선택해 주세요.";
export const PRODUCTION_DAILY_PRINT_NOT_READY_MESSAGE = "열처리일보 등록(LOT) 후 출력할 수 있습니다.";

export function hasProductionCheckboxSelection(selectedIds = []) {
  return Array.isArray(selectedIds) && selectedIds.length > 0;
}

/** 체크된 행만 · selectedIds 순서 유지 (중복 제거 없음) */
export function resolveProductionCheckboxPrintRows(selectedIds = [], rows = []) {
  if (!hasProductionCheckboxSelection(selectedIds)) return [];
  const rowById = new Map(rows.map((row) => [row.id, row]));
  return selectedIds.map((id) => rowById.get(id)).filter(Boolean);
}

export function resolveProductionPrintReadyRows(printRows = []) {
  return printRows.filter((row) => isProductionDailyReportPrintReady(row.record ?? row));
}

/**
 * 체크된 행 기준 LOT 그룹 (출력 LOT 선택 팝업용)
 * @returns {{ lotNo: string, lotKey: string, count: number, rows: object[] }[]}
 */
export function groupProductionPrintRowsByLot(printRows = []) {
  const groups = new Map();

  printRows.forEach((row) => {
    const record = row.record ?? row;
    const lotNo = String(record?.lotNo ?? row.lotNo ?? "").trim();
    const lotKey = normalizeProductionLotKey(lotNo);
    if (!lotKey) return;

    if (!groups.has(lotKey)) {
      groups.set(lotKey, { lotNo, lotKey, count: 0, rows: [] });
    }

    const group = groups.get(lotKey);
    group.count += 1;
    group.rows.push(row);
  });

  return Array.from(groups.values()).sort((a, b) => a.lotNo.localeCompare(b.lotNo, "ko"));
}

/**
 * @returns {{ ok: true, lotGroups: object[] } | { ok: false, reason: "noSelection" | "notReady" }}
 */
export function resolveProductionDailyPrintLotGroups(selectedIds = [], rows = []) {
  if (!hasProductionCheckboxSelection(selectedIds)) {
    return { ok: false, reason: "noSelection" };
  }

  const printRows = resolveProductionCheckboxPrintRows(selectedIds, rows);
  const lotGroups = groupProductionPrintRowsByLot(printRows);

  if (!lotGroups.length) {
    return { ok: false, reason: "notReady" };
  }

  return { ok: true, lotGroups, printRows };
}

/** LOT 선택 팝업 확인 후 — 해당 LOT에 체크된 행만 반환 */
export function resolveProductionDailyPrintRowsForLot(lotGroups = [], lotNo = "") {
  const lotKey = normalizeProductionLotKey(lotNo);
  if (!lotKey) return [];
  return lotGroups.find((group) => group.lotKey === lotKey)?.rows ?? [];
}

/** 리스트 Row 기준 — 동일 LOT 전체 (검색 필터와 무관한 allRows 권장) */
export function resolveAllListRowsForProductionLot(lotNo, rows = []) {
  const lotKey = normalizeProductionLotKey(lotNo);
  if (!lotKey) return [];

  return rows.filter((row) => {
    const record = row.record ?? row;
    return normalizeProductionLotKey(record?.lotNo ?? row.lotNo) === lotKey;
  });
}

/**
 * 동일 LOT 일부만 선택 시 확인 팝업 필요 여부
 * - 체크 제품이 모두 동일 LOT
 * - 해당 LOT 전체 제품 수 > 체크한 제품 수
 * @returns {{ show: false } | { show: true, lotNo: string, lotKey: string, selectedCount: number, totalCount: number, selectedRows: object[], allLotRows: object[], allRowIds: string[] }}
 */
export function resolveProductionDailyPartialLotPrompt(
  selectedIds = [],
  visibleRows = [],
  allRows = visibleRows
) {
  const resolved = resolveProductionDailyPrintLotGroups(selectedIds, visibleRows);
  if (!resolved.ok || resolved.lotGroups.length !== 1) {
    return { show: false };
  }

  const lotGroup = resolved.lotGroups[0];
  const allLotRows = resolveAllListRowsForProductionLot(lotGroup.lotNo, allRows);
  const totalCount = allLotRows.length;
  const selectedCount = lotGroup.count;

  if (totalCount <= selectedCount) {
    return { show: false };
  }

  return {
    show: true,
    lotNo: lotGroup.lotNo,
    lotKey: lotGroup.lotKey,
    selectedCount,
    totalCount,
    selectedRows: lotGroup.rows,
    allLotRows,
    allRowIds: allLotRows.map((row) => row.id),
  };
}
