/**
 * 생산일보 출력 — PM 검증 (node scripts/verify-production-daily-print.mjs)
 * 선택 Row 수 = chargeProducts 수 = 인쇄 행 수
 */

const LOT_A = "260701-3S1A";

function normalizeProductionLotKey(lotNo) {
  return String(lotNo ?? "")
    .trim()
    .toUpperCase();
}

function resolveProductionDailyPrintChargeRecordFromRow(row, records) {
  const source = row?.record ?? row;
  const managementId = String(source?.id ?? row?.id ?? row?.managementId ?? "").trim();
  if (!managementId) return null;

  const sessionRecord = records.find((item) => item.id === managementId);
  const record = {
    ...(sessionRecord ?? {}),
    ...source,
    id: managementId,
    lotNo: String(source.lotNo ?? sessionRecord?.lotNo ?? row.lotNo ?? "").trim(),
    workDate:
      source.workDate ??
      sessionRecord?.workDate ??
      row.workDate ??
      source.productionDate ??
      sessionRecord?.productionDate ??
      "",
  };

  if (!normalizeProductionLotKey(record.lotNo)) return null;

  return record;
}

function resolveProductionDailyPrintChargeRecords(selectedRows, records) {
  const chargeRecords = [];
  selectedRows.forEach((row) => {
    const record = resolveProductionDailyPrintChargeRecordFromRow(row, records);
    if (record) chargeRecords.push(record);
  });
  return chargeRecords;
}

function resolveProductionCheckboxPrintRows(selectedIds, rows) {
  const rowById = new Map(rows.map((row) => [row.id, row]));
  return selectedIds.map((id) => rowById.get(id)).filter(Boolean);
}

function groupProductionPrintRowsByLot(printRows) {
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
  return Array.from(groups.values());
}

function resolveProductionDailyPrintLotGroups(selectedIds, rows) {
  if (!selectedIds.length) return { ok: false, reason: "noSelection" };
  const rowById = new Map(rows.map((row) => [row.id, row]));
  const printRows = selectedIds.map((id) => rowById.get(id)).filter(Boolean);
  const lotGroups = groupProductionPrintRowsByLot(printRows);
  if (!lotGroups.length) return { ok: false, reason: "notReady" };
  return { ok: true, lotGroups, printRows };
}

function resolveAllListRowsForProductionLot(lotNo, rows) {
  const lotKey = normalizeProductionLotKey(lotNo);
  if (!lotKey) return [];
  return rows.filter((row) => {
    const record = row.record ?? row;
    return normalizeProductionLotKey(record?.lotNo ?? row.lotNo) === lotKey;
  });
}

function resolveProductionDailyPartialLotPrompt(selectedIds, visibleRows, allRows = visibleRows) {
  const resolved = resolveProductionDailyPrintLotGroups(selectedIds, visibleRows);
  if (!resolved.ok || resolved.lotGroups.length !== 1) return { show: false };

  const lotGroup = resolved.lotGroups[0];
  const allLotRows = resolveAllListRowsForProductionLot(lotGroup.lotNo, allRows);
  const totalCount = allLotRows.length;
  const selectedCount = lotGroup.count;

  if (totalCount <= selectedCount) return { show: false };

  return {
    show: true,
    lotNo: lotGroup.lotNo,
    selectedCount,
    totalCount,
    selectedRows: lotGroup.rows,
    allLotRows,
    allRowIds: allLotRows.map((row) => row.id),
  };
}

function makeRecord(id, partName, partNo, lotNo = LOT_A, extra = {}) {
  return {
    id,
    company: "서암기계공업",
    partName,
    partNo,
    registered: true,
    lotNo,
    ...extra,
  };
}

function makeListRow(record) {
  return { id: record.id, managementId: record.id, record };
}

const records = [
  makeRecord("SE_0001", "SHAFT", "SHAFT-01"),
  makeRecord("SE_0002", "BULL GEAR", "H2E19655"),
  makeRecord("SE_0003", "BULL GEAR", "CQ91BUL504"),
  makeRecord("SE_0004", "BULL GEAR", "H2E19655", "260629-3S2A"),
  makeRecord("SE_0005", "BULL GEAR", "H2E19655"),
  makeRecord("SE_0006", "BULL GEAR", "H2E19655"),
];

const rows = records.map(makeListRow);

function assertParity(testName, selectedRows, sessionRecords = records) {
  const chargeRecords = resolveProductionDailyPrintChargeRecords(selectedRows, sessionRecords);
  if (chargeRecords.length !== selectedRows.length) {
    throw new Error(
      `${testName}: charge ${chargeRecords.length} !== selected ${selectedRows.length}`
    );
  }
  console.log(`✅ ${testName} — ${selectedRows.length}행`);
}

assertParity("테스트 1", [rows[0], rows[1], rows[2]]);
assertParity("테스트 2", [rows[0]]);
assertParity("테스트 3", [rows[0], rows[1]]);

const multiIds = [rows[0].id, rows[1].id, rows[3].id];
const printRows = resolveProductionCheckboxPrintRows(multiIds, rows);
const lotGroups = groupProductionPrintRowsByLot(printRows);
if (lotGroups.length !== 2) throw new Error("테스트 4: lot group count");
const lotA = lotGroups.find((g) => g.lotKey === normalizeProductionLotKey(LOT_A));
if (lotA.rows.length !== 2) throw new Error("테스트 4: LOT A row count");
assertParity("테스트 4 (LOT A)", lotA.rows);

assertParity("테스트 5", [rows[4], rows[5]]);

const mixedSessionRecords = [
  makeRecord("SE_A1", "SHAFT", "SHAFT-01", LOT_A, { workDate: "2026-07-10" }),
  makeRecord("SE_A2", "BULL GEAR", "H2E19655", "", {
    registered: false,
    workDate: "",
    lotNo: "",
  }),
  makeRecord("SE_A3", "BULL GEAR", "CQ91BUL504", LOT_A, { workDate: "2026-07-10" }),
];

const mixedRows = [
  makeListRow(
    makeRecord("SE_A1", "SHAFT", "SHAFT-01", LOT_A, { workDate: "2026-07-10" })
  ),
  makeListRow(
    makeRecord("SE_A2", "BULL GEAR", "H2E19655", LOT_A, { workDate: "2026-07-01" })
  ),
  makeListRow(
    makeRecord("SE_A3", "BULL GEAR", "CQ91BUL504", LOT_A, { workDate: "2026-07-10" })
  ),
];

assertParity("테스트 6 (동일 LOT · 다른 생산일)", mixedRows, mixedSessionRecords);

const partialLotRows = rows.slice(0, 3);
const partialIds = [partialLotRows[0].id, partialLotRows[1].id];
const partialPrompt = resolveProductionDailyPartialLotPrompt(
  partialIds,
  partialLotRows,
  partialLotRows
);
if (!partialPrompt.show) throw new Error("테스트 7: partial prompt should show");
if (partialPrompt.selectedCount !== 2 || partialPrompt.totalCount !== 3) {
  throw new Error(`테스트 7: partial counts (${partialPrompt.selectedCount}/${partialPrompt.totalCount})`);
}
assertParity("테스트 7 (선택만 출력)", partialPrompt.selectedRows, records);
assertParity("테스트 7 (LOT 전체 출력)", partialPrompt.allLotRows, records);

if (
  resolveProductionDailyPartialLotPrompt(
    partialLotRows.map((row) => row.id),
    partialLotRows,
    partialLotRows
  ).show
) {
  throw new Error("테스트 8: full LOT selection should not prompt");
}

const multiLotResolved = resolveProductionDailyPrintLotGroups(
  [rows[0].id, rows[3].id],
  rows
);
if (multiLotResolved.lotGroups.length !== 2) throw new Error("테스트 9: multi LOT groups");
if (
  resolveProductionDailyPartialLotPrompt([rows[0].id, rows[3].id], rows, rows).show
) {
  throw new Error("테스트 9: multi LOT should not show partial prompt");
}

const singleLotRow = [makeListRow(makeRecord("SE_S1", "SHAFT", "S1", "LOT-SOLO"))];
if (
  resolveProductionDailyPartialLotPrompt(
    [singleLotRow[0].id],
    singleLotRow,
    singleLotRow
  ).show
) {
  throw new Error("테스트 10: single product single LOT should not prompt");
}

console.log("\n모든 생산일보 출력 검증 시나리오 통과");
