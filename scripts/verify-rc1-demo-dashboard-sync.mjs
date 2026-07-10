/**
 * RC1 Demo QA — CEO demo flow + HOME Dashboard / Workspace KPI sync
 * Run: npm run verify:rc1-demo-dashboard-sync
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const EXCEL_PATH =
  process.env.RC1_COMPANY_EXCEL ||
  path.join(root, "scripts/fixtures/rc1-company-accounting.xls");

const memory = new Map();
globalThis.sessionStorage = {
  getItem(key) {
    return memory.has(key) ? memory.get(key) : null;
  },
  setItem(key, value) {
    memory.set(key, String(value));
  },
  removeItem(key) {
    memory.delete(key);
  },
  clear() {
    memory.clear();
  },
  get length() {
    return memory.size;
  },
  key(index) {
    return [...memory.keys()][index] ?? null;
  },
};
globalThis.window = {
  dispatchEvent() {},
  addEventListener() {},
  removeEventListener() {},
};
globalThis.localStorage = {
  getItem() {
    return null;
  },
  setItem() {},
  removeItem() {},
  clear() {},
  get length() {
    return 0;
  },
  key() {
    return null;
  },
};

const checks = [];
function step(name, ok, detail = "") {
  checks.push({ name, ok, detail });
  console.log((ok ? "PASS" : "FAIL") + " " + name + (detail ? " :: " + detail : ""));
}
function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function syncAssert(name, homeVal, workspaceVal) {
  step(name, homeVal === workspaceVal, "HOME=" + homeVal + " WS=" + workspaceVal);
}

async function loadDashboardModules() {
  const href = (rel) => pathToFileURL(path.join(root, rel)).href;
  return {
    buildHomeDashboardRuntimeMetrics: (await import(href("src/utils/homeDashboardRuntimeMetrics.js")))
      .buildHomeDashboardRuntimeMetrics,
    buildHomeWorkLauncherMetrics: (await import(href("src/utils/homeWorkLauncherData.js")))
      .buildHomeWorkLauncherMetrics,
    buildTodayWorkSummary: (await import(href("src/utils/homeDashboardData.js"))).buildTodayWorkSummary,
    getHomeScreenData: (await import(href("src/utils/homeDashboardData.js"))).getHomeScreenData,
    buildCompanyMasterSummary: (await import(href("src/utils/companyMasterDetail.js")))
      .buildCompanyMasterSummary,
    buildProductMasterSummary: (await import(href("src/utils/productMasterDetail.js")))
      .buildProductMasterSummary,
    getOutboundScreenData: (await import(href("src/utils/titanScreenDataSource.js")))
      .getOutboundScreenData,
    buildInboundHistoryWorkspaceRecords: (await import(href("src/utils/operationsWorkspaceData.js")))
      .buildInboundHistoryWorkspaceRecords,
    matchesCurrentProcessKpiBucket: (await import(href("src/utils/workflowProcessStatus.js")))
      .matchesCurrentProcessKpiBucket,
    getMasterStoreSummary: (await import(href("src/foundation/data/master/masterDataSync.js")))
      .getMasterStoreSummary,
    getMasterDataByCategory: (await import(href("src/utils/masterData.js"))).getMasterDataByCategory,
    parseMasterExcelBuffer: (await import(href("src/utils/masterExcelImport.js"))).parseMasterExcelBuffer,
    analyzeMasterImport: (await import(href("src/utils/masterExcelImport.js"))).analyzeMasterImport,
    executeMasterImport: (await import(href("src/utils/masterExcelImport.js"))).executeMasterImport,
    addSessionProductionRecord: (await import(href("src/utils/productionRecords.js")))
      .addSessionProductionRecord,
    getSessionProductionRecords: (await import(href("src/utils/productionRecords.js")))
      .getSessionProductionRecords,
    isIncomingRegistered: (await import(href("src/utils/productionRecords.js"))).isIncomingRegistered,
    processShipment: (await import(href("src/utils/productionRecords.js"))).processShipment,
    applyInboundHtlDocumentPrinted: (await import(href("src/utils/titanWorkflowStatus.js")))
      .applyInboundHtlDocumentPrinted,
    applyMoveToProductionWaiting: (await import(href("src/utils/titanWorkflowStatus.js")))
      .applyMoveToProductionWaiting,
    onDailyReportSaved: (await import(href("src/utils/titanWorkflowStatus.js"))).onDailyReportSaved,
    completeProductionRecord: (await import(href("src/utils/productionComplete.js")))
      .completeProductionRecord,
    resetTitanDataEngineInstance: (await import(href("src/foundation/data/index.js")))
      .resetTitanDataEngineInstance,
    getTitanDataEngine: (await import(href("src/foundation/data/index.js"))).getTitanDataEngine,
  };
}

function assertDashboardSync(stage, mods) {
  const records = mods.getSessionProductionRecords();
  const runtime = mods.buildHomeDashboardRuntimeMetrics();
  const launcher = mods.buildHomeWorkLauncherMetrics(records);
  const today = Object.fromEntries(mods.buildTodayWorkSummary(records).map((i) => [i.id, i.value]));
  const homeCounts = mods.getHomeScreenData(records).counts;
  const outbound = mods.getOutboundScreenData(records).counts;
  const companyKpi = mods.buildCompanyMasterSummary().find((r) => r.id === "total")?.value ?? -1;
  const productKpi = mods.buildProductMasterSummary().find((r) => r.id === "total")?.value ?? -1;
  const store = mods.getMasterStoreSummary();

  console.log("\\n--- KPI Sync @ " + stage + " ---");
  syncAssert(stage + " | Master companies", launcher.masterData.companies, companyKpi);
  syncAssert(stage + " | Master companies runtime", runtime.companies, companyKpi);
  syncAssert(stage + " | Master companies store", store.companies ?? -1, companyKpi);
  syncAssert(stage + " | Master products", launcher.masterData.products, productKpi);
  syncAssert(stage + " | Master products runtime", runtime.products, productKpi);
  syncAssert(
    stage + " | Inbound status",
    launcher.operations.inboundWait,
    records.filter(mods.isIncomingRegistered).length
  );
  syncAssert(
    stage + " | Inbound history",
    launcher.operations.inboundWait,
    mods.buildInboundHistoryWorkspaceRecords(records).length
  );
  syncAssert(stage + " | Ship wait ops", launcher.operations.shipWait, runtime.shipWait);
  syncAssert(stage + " | Ship wait chip", today.SHIP_WAIT, homeCounts.SHIP_WAIT);
  syncAssert(stage + " | Ship wait outbound", launcher.operations.shipWait, outbound.shipNotDone);
  syncAssert(stage + " | Production running", launcher.production.runningLots, runtime.productionInProgress);
  syncAssert(stage + " | HT_RUNNING chip", today.HT_RUNNING, homeCounts.HT_RUNNING);
  const htRunning = records.filter((r) => mods.matchesCurrentProcessKpiBucket(r, "HT_RUNNING")).length;
  syncAssert(stage + " | HT_RUNNING bucket", launcher.production.runningLots, htRunning);
}

async function main() {
  assert(existsSync(EXCEL_PATH), "Excel fixture missing: " + EXCEL_PATH);
  const mods = await loadDashboardModules();
  mods.resetTitanDataEngineInstance();
  mods.getTitanDataEngine();

  const emptyRuntime = mods.buildHomeDashboardRuntimeMetrics();
  step(
    "0 Empty baseline",
    emptyRuntime.inboundRegistered === 0,
    "inbound=" + emptyRuntime.inboundRegistered
  );

  const buffer = readFileSync(EXCEL_PATH);
  const parsed = await mods.parseMasterExcelBuffer("companies", buffer, path.basename(EXCEL_PATH));
  assert(parsed.ok, parsed.message ?? "parse failed");
  const analysis = mods.analyzeMasterImport("companies", parsed.rows);
  const importResult = await mods.executeMasterImport(analysis, {
    masterType: "companies",
    conflictPolicy: "update",
    fileName: path.basename(EXCEL_PATH),
  });
  step(
    "1 Company Import",
    importResult.created >= 590 && importResult.failed === 0,
    "created=" + importResult.created + " failed=" + importResult.failed
  );

  const companies = mods.getMasterDataByCategory("companies");
  step("1b Company Master count", companies.length >= 590, "count=" + companies.length);

  const products = mods.getMasterDataByCategory("products");
  step("2 Product Master ready", products.length > 0, "products=" + products.length);

  const sampleCompany = companies.find((row) => row.active !== false)?.name || companies[0]?.name;
  const sampleProduct = products.find((row) => row.company === sampleCompany) || products[0];
  assert(sampleCompany && sampleProduct, "No sample company/product for demo inbound");

  const today = new Date().toISOString().slice(0, 10);
  const managementId = "RC1QA-" + today.replace(/-/g, "") + "-001";
  mods.addSessionProductionRecord({
    id: managementId,
    company: sampleProduct.company || sampleCompany,
    partName: sampleProduct.name,
    partNo: sampleProduct.partNo,
    material: sampleProduct.material,
    qty: 10,
    incomingDate: today,
    workTypeId: "heatTreatment",
    heatTreatment: sampleProduct.process || "QT",
    registrar: "RC1 QA",
  });
  step(
    "3 Inbound register",
    mods.getSessionProductionRecords().some((row) => row.id === managementId),
    managementId
  );
  assertDashboardSync("After Inbound", mods);

  const dayTag = today.replace(/-/g, "");
  mods.applyInboundHtlDocumentPrinted([managementId], "HTL-" + dayTag + "-DEMO", {
    isReprint: false,
  });
  mods.applyMoveToProductionWaiting([managementId]);
  step("4 HTL print + production wait", true, "HTL-" + dayTag + "-DEMO");
  assertDashboardSync("After HTL", mods);

  const lotNo = "LOT-" + dayTag + "-DEMO";
  mods.onDailyReportSaved(managementId, {
    registered: true,
    lotNo,
    workDate: today,
    equipment: "3S-1",
    heatTreatment: sampleProduct.process || "QT",
    completionStatus: "작업중",
  });
  step(
    "5 LOT / Production register",
    Boolean(mods.getSessionProductionRecords().find((r) => r.id === managementId)?.lotNo),
    lotNo
  );
  assertDashboardSync("After Production LOT", mods);

  const prodResult = mods.completeProductionRecord(managementId, {
    worker: "RC1 QA",
    equipment: "3S-1",
  });
  step("6 Production complete", prodResult.ok === true, prodResult.reason || "");
  assertDashboardSync("After Production Complete", mods);

  const shipResult = mods.processShipment(managementId, 10, {
    shipmentStatus: "출고완료",
    outboundDate: today,
  });
  step("7 Outbound register", shipResult.ok === true, "stockAfter=" + (shipResult.stockAfter ?? ""));
  assertDashboardSync("After Outbound", mods);

  const failed = checks.filter((item) => !item.ok);
  if (failed.length) {
    console.error("\\nRC1 Demo Dashboard Sync verification FAILED (" + failed.length + ")");
    process.exitCode = 1;
  } else {
    console.log("\\nRC1 Demo Dashboard Sync verification: PASS (" + checks.length + " checks)");
  }
}

main().catch((error) => {
  console.error("RC1 Demo Dashboard Sync error:", error.message);
  console.error(error.stack);
  process.exitCode = 1;
});
