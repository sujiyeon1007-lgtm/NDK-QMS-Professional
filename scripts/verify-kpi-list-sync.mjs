/**
 * KPI / List sync verification — node scripts/verify-kpi-list-sync.mjs
 *
 * Self-contained check mirroring productionDailyReportStatus chip buckets.
 * Run: node scripts/verify-kpi-list-sync.mjs
 */

/** Must stay in sync with src/utils/productionDailyReportStatus.js */
const PRODUCTION_CHIP_STATUS_BUCKETS = {
  prodProgress: ["생산중", "생산 진행"],
  prodWait: ["작업대기", "입고 등록", "생산대기"],
  prodDone: ["생산완료", "검사대기", "출고 대기"],
};

const WORKFLOW_STATUS = {
  WORK_WAIT: "작업대기",
  PROD_PROGRESS: "생산중",
  PROD_DONE: "생산완료",
};

function isIncomingRegistered(record) {
  return Boolean(record?.incomingRegistered);
}

function getProductionDailyReportStatus(record) {
  if (!isIncomingRegistered(record)) return null;

  const workflowStatus = record.workflowStatus;

  if (workflowStatus === WORKFLOW_STATUS.PROD_DONE) {
    if (!record.hasInspectionLog) {
      return { label: "검사대기", variant: "complete" };
    }
    return { label: "생산완료", variant: "complete" };
  }

  if (workflowStatus === WORKFLOW_STATUS.PROD_PROGRESS) {
    return { label: "생산중", variant: "production" };
  }

  if (workflowStatus === WORKFLOW_STATUS.WORK_WAIT) {
    return { label: "작업대기", variant: "incoming" };
  }

  if (record.registered && record.lotNo?.trim()) {
    return { label: "생산중", variant: "production" };
  }

  if (record.htlNo || record.lotNo?.trim()) {
    return { label: "생산 진행", variant: "production" };
  }

  return { label: "입고 등록", variant: "incoming" };
}

function filterProductionDailyReportRecords(records = []) {
  return records.filter((record) => getProductionDailyReportStatus(record) !== null);
}

function matchesProductionChipBucket(record, bucketKey) {
  const label = getProductionDailyReportStatus(record)?.label;
  if (!label) return false;
  return (PRODUCTION_CHIP_STATUS_BUCKETS[bucketKey] ?? []).includes(label);
}

function countProductionChipBucket(records, bucketKey) {
  return records.filter((record) => matchesProductionChipBucket(record, bucketKey)).length;
}

function resolveProductionStatusChipCounts(records) {
  const visible = filterProductionDailyReportRecords(records);
  return {
    prodProgress: countProductionChipBucket(visible, "prodProgress"),
    prodWait: countProductionChipBucket(visible, "prodWait"),
    prodDone: countProductionChipBucket(visible, "prodDone"),
  };
}

function filterByChip(records, searchKey) {
  const bucketKey =
    searchKey === "__chipProdProgress"
      ? "prodProgress"
      : searchKey === "__chipProdWait"
        ? "prodWait"
        : "prodDone";
  return filterProductionDailyReportRecords(records).filter((record) =>
    matchesProductionChipBucket(record, bucketKey)
  );
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const MOCK_RECORDS = [
  {
    id: "DL260701-001",
    incomingRegistered: true,
    registered: true,
    lotNo: "LOT-A",
    workflowStatus: "생산중",
  },
  {
    id: "DL260701-002",
    incomingRegistered: true,
    htlNo: "HTL-001",
    workflowStatus: "작업대기",
  },
  {
    id: "DL260701-003",
    incomingRegistered: true,
    registered: true,
    lotNo: "LOT-C",
    workflowStatus: "생산완료",
    hasInspectionLog: false,
  },
  {
    id: "DL260701-004",
    incomingRegistered: true,
    registered: true,
    lotNo: "",
    workflowStatus: "작업대기",
  },
];

function verifyProductionSync(records) {
  const baseRecords = filterProductionDailyReportRecords(records);
  const counts = resolveProductionStatusChipCounts(records);

  assert(baseRecords.length > 0, "production baseRecords should not be empty for mock data");

  const chipSum =
    (counts.prodProgress ?? 0) + (counts.prodWait ?? 0) + (counts.prodDone ?? 0);
  assert(
    chipSum <= baseRecords.length,
    `production chip sum (${chipSum}) must be <= baseRecords (${baseRecords.length})`
  );

  const chipSearchKeys = [
    ["prodProgress", "__chipProdProgress"],
    ["prodWait", "__chipProdWait"],
    ["prodDone", "__chipProdDone"],
  ];

  for (const [chipId, searchKey] of chipSearchKeys) {
    const kpiCount = counts[chipId] ?? 0;
    const filtered = filterByChip(records, searchKey);
    assert(
      filtered.length === kpiCount,
      `production ${chipId}: KPI=${kpiCount} but chip filter returned ${filtered.length}`
    );
  }

  console.log("✓ production KPI/list sync OK", {
    baseCount: baseRecords.length,
    counts,
  });
}

try {
  verifyProductionSync(MOCK_RECORDS);
  console.log("\nAll KPI/list sync checks passed.");
} catch (error) {
  console.error("\nKPI/list sync verification FAILED:");
  console.error(error.message);
  process.exit(1);
}
