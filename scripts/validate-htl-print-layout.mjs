/**
 * DOC-01 print layout validation (local only — not part of build)
 * Run: node scripts/validate-htl-print-layout.mjs
 */
import { buildHtlPrintLayout } from "../src/utils/htlWorkListPrintLayout.js";
import { buildRowGroups, estimateRowLines } from "../src/utils/titanPrintLayout.js";
import { TITAN_LIST_PRINT_LINE_BUDGET, TITAN_LIST_PRINT_MIN_ORPHAN_ROWS } from "../src/config/titanListPrintStandard.js";

function makeRow(index, overrides = {}) {
  return {
    no: index + 1,
    managementId: overrides.managementId ?? `SE_20260703_${String(index + 1).padStart(4, "0")}`,
    company: overrides.company ?? "서암기계공업",
    partName: overrides.partName ?? `품명-${index + 1}`,
    partNo: overrides.partNo ?? `P-${index + 1}`,
    material: overrides.material ?? "SCM440",
    qty: 10,
    unit: "EA",
    note: overrides.note ?? "",
    lotNo: "",
    incomingDate: "2026-07-03",
  };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function countRows(pages) {
  return pages.reduce((sum, page) => sum + page.length, 0);
}

function groupsSplitAcrossPages(pages) {
  const pageByRowKey = new Map();
  pages.forEach((page, pageIndex) => {
    page.forEach((row) => {
      const key = row.managementId ?? row.id ?? "";
      if (!pageByRowKey.has(key)) {
        pageByRowKey.set(key, new Set());
      }
      pageByRowKey.get(key).add(pageIndex);
    });
  });
  return [...pageByRowKey.entries()].filter(([, pageSet]) => pageSet.size > 1);
}

function runScenario(label, rows, options = {}) {
  const layout = buildHtlPrintLayout(rows, "", options);
  const { pages, columns, columnWidths, orientation } = layout;
  const splits = groupsSplitAcrossPages(pages);

  console.log(`\n[${label}]`);
  console.log(`  rows=${rows.length} pages=${pages.length} pageSizes=${pages.map((p) => p.length).join(",")}`);
  console.log(`  splitGroups=${splits.length}`);

  assert(countRows(pages) === rows.length, `${label}: row count mismatch`);
  assert(pages.length >= 1, `${label}: expected at least one page`);

  pages.slice(0, -1).forEach((page, pageIndex) => {
    assert(
      page.length >= TITAN_LIST_PRINT_MIN_ORPHAN_ROWS || pages.length === 1,
      `${label}: orphan rows on page ${pageIndex + 1} (size=${page.length}, min=${TITAN_LIST_PRINT_MIN_ORPHAN_ROWS})`
    );
  });

  splits.forEach(([key, pageSet]) => {
    const groupRows = buildRowGroups(rows).find((g) => g.key === key)?.rows ?? [];
    const groupLines = groupRows.reduce(
      (sum, row) => sum + estimateRowLines(row, columns, columnWidths, orientation),
      0
    );
    assert(
      groupLines > TITAN_LIST_PRINT_LINE_BUDGET,
      `${label}: group ${key} split across pages but fits in line budget (${groupLines})`
    );
  });

  return layout;
}

console.log("DOC-01 HTL Print Layout Validation");

runScenario("1 record", [makeRow(0)]);
runScenario("10 records", Array.from({ length: 10 }, (_, i) => makeRow(i)));
runScenario("30 records", Array.from({ length: 30 }, (_, i) => makeRow(i)));
runScenario("60 records", Array.from({ length: 60 }, (_, i) => makeRow(i)));

runScenario("long wrap columns", [
  makeRow(0, {
    company: "서암기계공업 주식회사 글로벌 열처리 사업부 협력업체",
    partName: "고속 절삭용 특수 강종 열처리 대형 피니언 기어 샤프트",
    partNo: "SA-HT-2026-00789-REV-B-LONG",
    material: "SCM440H MODIFIED SPECIAL GRADE",
    note: "생산부 전달: 표면 경화 후 연마 여유 0.15mm 유지 필수",
  }),
]);

const sharedId = "SE_20260703_0001";
runScenario("group keep-together (3 rows same managementId)", [
  makeRow(0, { managementId: sharedId, partName: "품명-A" }),
  makeRow(1, { managementId: sharedId, partName: "품명-B" }),
  makeRow(2, { managementId: sharedId, partName: "품명-C" }),
  makeRow(3, { managementId: "SE_20260703_0002" }),
]);

runScenario("memo reserve", Array.from({ length: 8 }, (_, i) => makeRow(i)), {
  workMemo: "전달사항: 금일 입고분 우선 처리",
});

runScenario("oversized group fallback (12 rows same managementId)", Array.from({ length: 12 }, (_, i) =>
  makeRow(i, { managementId: "SE_OVERSIZED_GROUP" })
));

console.log("\nAll validation checks passed.");
