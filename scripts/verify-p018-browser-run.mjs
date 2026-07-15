import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const memory = new Map();
globalThis.sessionStorage = {
  getItem: (key) => (memory.has(key) ? memory.get(key) : null),
  setItem: (key, value) => memory.set(key, String(value)),
  removeItem: (key) => memory.delete(key),
  clear: () => memory.clear(),
};
globalThis.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
};
globalThis.window = { dispatchEvent: () => {}, addEventListener: () => {}, removeEventListener: () => {} };

const href = (rel) => pathToFileURL(path.join(root, rel)).href;
const { buildRc1EquipmentMasterSeedRows } = await import(href("src/data/rc1EquipmentMasterSeed.js"));
const { buildEquipmentRecordsFromMasterRows } = await import(
  href("src/foundation/data/master/masterEquipmentBuilder.js")
);
const { WORKFLOW_STATUS } = await import(href("src/utils/titanWorkflowStatus.js"));
const { TITAN_DATA_STORAGE_KEYS } = await import(href("src/foundation/data/titanDataStorageKeys.js"));
const { OPERATIONS_PRODUCTION_RECORDS_STORAGE_KEY } = await import(
  href("src/utils/productionRecords.js")
);

const BASE = process.env.QA_BASE_URL || "http://127.0.0.1:5177";
const TEST_ID = "P018-BROWSER-001";
const INBOUND = 200;
const FIRST_CHARGE = 100;
const SECOND_CHARGE = 100;
const checks = [];

function step(name, ok, detail = "") {
  checks.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? ` :: ${detail}` : ""}`);
}

async function readQty(page, equipmentId, managementId) {
  await page.goto(`${BASE}/production/charging/equipment/${encodeURIComponent(equipmentId)}`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await page.waitForSelector(".qr-lot-table__grid tbody tr", { timeout: 15000 });
  const row = page.locator(".qr-lot-table__grid tbody tr").filter({ hasText: managementId }).first();
  if ((await row.count()) === 0) return null;
  const headers = await page.locator(".qr-lot-table__grid thead th").allInnerTexts();
  const cells = await row.locator("td").allInnerTexts();
  const remainIndex = headers.findIndex((text) => text.includes("\uC794\uC5EC\uC218\uB7C9"));
  const targetIndex = remainIndex >= 0 ? remainIndex : 5;
  const text = String(cells[targetIndex] ?? "").trim();
  const match = text.match(/([\d,]+)/);
  return match ? Number(match[1].replace(/,/g, "")) : null;
}

async function dismissWorkflowOverlay(page) {
  const overlay = page.locator(".operations-workflow-next-overlay");
  if (await overlay.isVisible().catch(() => false)) {
    await page.locator(".operations-workflow-next-close").click().catch(() => overlay.click());
    await page.waitForTimeout(300);
  }
}

async function charge(page, equipmentId, managementId, chargeQty) {
  await page.goto(`${BASE}/production/charging/equipment/${encodeURIComponent(equipmentId)}`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await page.waitForSelector(".qr-lot-table__grid tbody tr", { timeout: 15000 });
  const row = page.locator(".qr-lot-table__grid tbody tr").filter({ hasText: managementId }).first();
  await row.waitFor({ state: "visible", timeout: 10000 });
  await row.click();
  const qtyToggle = page.locator('.qr-lot-charge-qty input[type="checkbox"]');
  await qtyToggle.waitFor({ state: "visible", timeout: 5000 });
  await qtyToggle.check();
  const qtyInput = page.locator(".qr-lot-charge-qty__field input.titan-input");
  await qtyInput.waitFor({ state: "visible", timeout: 5000 });
  await qtyInput.fill(String(chargeQty));
  await qtyInput.blur();
  const startBtn = page.getByRole("button", { name: "열처리 시작" });
  await startBtn.waitFor({ state: "visible", timeout: 5000 });
  await startBtn.click();
  await page.waitForTimeout(1200);
  await dismissWorkflowOverlay(page);
  const endBtn = page.getByRole("button", { name: "열처리 종료" });
  await endBtn.waitFor({ state: "visible", timeout: 10000 });
  await endBtn.click();
  await page.waitForTimeout(1500);
  await dismissWorkflowOverlay(page);
}

async function main() {
  const ION = "\uC774\uC628\uC9C8\uD654";
  const equipmentRows = buildEquipmentRecordsFromMasterRows(buildRc1EquipmentMasterSeedRows(), []);
  const productionRows = [
    {
      id: TEST_ID,
      mesManagementNo: TEST_ID,
      company: "RC1",
      partName: "P018",
      partNo: "P018-001",
      material: "SCM440",
      qty: INBOUND,
      inboundQty: INBOUND,
      incomingRegistered: true,
      registered: false,
      workflowStatus: WORKFLOW_STATUS.WORK_WAIT,
      completionStatus: WORKFLOW_STATUS.WORK_WAIT,
      lotNo: "",
      heatTreatment: ION,
      processDetail: ION,
      process: ION,
      stockQty: INBOUND,
      shipmentStatus: "\uCD9C\uACE0\uB300\uAE30",
      shippedQty: 0,
      workType: "heat-treatment",
      workTypeLabel: "\uC5F4\uCC98\uB9AC",
      productionWaitingAt: new Date().toISOString(),
    },
  ];

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1680, height: 1050 } });
  page.on("dialog", (d) => d.accept().catch(() => {}));

  try {
    await page.addInitScript(
      ({ authKey, equipmentKey, productionKey, equipmentRows, productionRows, seedFlag }) => {
        if (sessionStorage.getItem(seedFlag) === "1") return;
        sessionStorage.setItem(
          authKey,
          JSON.stringify({
            userId: "admin",
            loginId: "admin",
            name: "admin",
            roleLabels: ["admin"],
            isProgramAdministrator: true,
            loginAt: new Date().toISOString(),
          })
        );
        sessionStorage.setItem(equipmentKey, JSON.stringify(equipmentRows));
        sessionStorage.setItem(productionKey, JSON.stringify(productionRows));
        sessionStorage.setItem(seedFlag, "1");
      },
      {
        authKey: "project-titan-auth-session-v1",
        equipmentKey: TITAN_DATA_STORAGE_KEYS.equipment,
        productionKey: OPERATIONS_PRODUCTION_RECORDS_STORAGE_KEY,
        equipmentRows,
        productionRows,
        seedFlag: "p018-browser-seed-v1",
      }
    );

    await page.goto(`${BASE}/home`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(2000);

    step("1 Seed 200EA inbound", true, TEST_ID);

    const before3s1 = await readQty(page, "3S-1", TEST_ID);
    step("2 Pre-charge 200EA on 3S-1", before3s1 === INBOUND, `3S-1=${before3s1}`);

    await charge(page, "3S-1", TEST_ID, FIRST_CHARGE);

    const after10 = await readQty(page, "10S-01", TEST_ID);
    step(
      "3 After 3S-1 100EA partial finish: 100EA on 10S-01",
      after10 === FIRST_CHARGE,
      `10S-01=${after10}`
    );
    await page.screenshot({ path: "qa-p018-10s01-chargeable.png" });

    await charge(page, "10S-01", TEST_ID, SECOND_CHARGE);

    const finalQty = await readQty(page, "10S-01", TEST_ID);
    step(
      "4 After 10S-01 100EA finish: removed from list",
      finalQty === null,
      `10S-01=${finalQty ?? "none"}`
    );
    await page.screenshot({ path: "qa-p018-10s01-removed.png" });
  } catch (error) {
    step("Runtime", false, error instanceof Error ? error.message : String(error));
  } finally {
    await browser.close();
  }

  const failed = checks.filter((c) => !c.ok);
  console.log(`\nP018 Browser Scenario: ${failed.length === 0 ? "PASS" : "FAIL"}`);
  process.exit(failed.length === 0 ? 0 : 1);
}

main();
