/**
 * Verify V1.4 workflow distribution on demo sample data.
 * Run: node scripts/verify-workflow-v14.mjs
 */
import { TITAN_DEMO_PRODUCTION_RECORDS, getTitanDemoInspectionLogSeeds } from "../src/data/titanDemoSampleData.js";
import {
  CURRENT_PROCESS_KEYS,
  resolveRecordCurrentProcess,
  matchesCurrentProcessKpiBucket,
} from "../src/utils/workflowProcessStatus.js";

const records = TITAN_DEMO_PRODUCTION_RECORDS;
getTitanDemoInspectionLogSeeds(records);

const byKey = Object.fromEntries(Object.values(CURRENT_PROCESS_KEYS).map((k) => [k, 0]));
const kpi = {
  RECEIVED: 0,
  HT_WAIT: 0,
  HT_RUNNING: 0,
  INSPECTION_WAIT: 0,
  CERT_WAIT: 0,
  SHIP_WAIT: 0,
};

for (const record of records) {
  const { key } = resolveRecordCurrentProcess(record);
  byKey[key] = (byKey[key] ?? 0) + 1;
  for (const id of Object.keys(kpi)) {
    if (matchesCurrentProcessKpiBucket(record, id)) {
      kpi[id] += 1;
    }
  }
}

console.log("Current Process distribution:", byKey);
console.log("KPI buckets:", kpi);

const expectedKpi = {
  RECEIVED: 1,
  HT_WAIT: 2,
  HT_RUNNING: 3,
  INSPECTION_WAIT: 2,
  CERT_WAIT: 6,
  SHIP_WAIT: 5,
};

let ok = true;
for (const [id, count] of Object.entries(expectedKpi)) {
  if (kpi[id] !== count) {
    console.error(`KPI mismatch ${id}: expected ${count}, got ${kpi[id]}`);
    ok = false;
  }
}

if (ok) {
  console.log("✓ Demo KPI distribution matches PM V1.4 target");
} else {
  process.exit(1);
}
