/**
 * P0-ARCHITECTURE-001 browser QA — 100/30/70 cross-equipment
 * Run: node scripts/verify-p0-architecture-001-browser.mjs
 */
import { chromium } from "playwright";

const BASE = process.env.QA_BASE_URL || "http://127.0.0.1:5177";
const TEST_ID = "P0-ARCH-100-30-70";
const BTN_START = "\uc5f4\ucc98\ub9ac \uc2dc\uc791";
const BTN_END = "\uc5f4\ucc98\ub9ac \uc885\ub8cc";
const ION = "\uc774\uc628\uc9c8\ud654";
const checks = [];

function step(name, ok, detail = "") {
  checks.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? ` :: ${detail}` : ""}`);
}

async function readQty(page, equipmentId, managementId) {
  await page.goto(`${BASE}/production/charging/equipment/${encodeURIComponent(equipmentId)}`);
  await page.waitForTimeout(1000);
  const row = page.locator(".qr-lot-table__grid tbody tr").filter({ hasText: managementId }).first();
  if ((await row.count()) === 0) return null;
  const text = (await row.locator("td").nth(5).innerText()).trim();
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
  await page.goto(`${BASE}/production/charging/equipment/${encodeURIComponent(equipmentId)}`);
  await page.waitForTimeout(1000);
  await page.locator(".qr-lot-table__grid tbody tr").filter({ hasText: managementId }).first().click();
  await page.locator('.qr-lot-charge-qty input[type="checkbox"]').check();
  await page.locator(".qr-lot-charge-qty__field input.titan-input").fill(String(chargeQty));
  await page.getByRole("button", { name: BTN_START }).click();
  await page.waitForTimeout(800);
  await dismissWorkflowOverlay(page);
  await page.getByRole("button", { name: BTN_END }).click();
  await page.waitForTimeout(1000);
  await dismissWorkflowOverlay(page);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1680, height: 1050 } });
  page.on("dialog", (d) => d.accept().catch(() => {}));

  try {
    await page.addInitScript(() => {
      sessionStorage.setItem(
        "project-titan-auth-session-v1",
        JSON.stringify({
          userId: "admin",
          loginId: "admin",
          name: "admin",
          roleLabels: ["admin"],
          isProgramAdministrator: true,
          loginAt: new Date().toISOString(),
        })
      );
    });

    await page.goto(`${BASE}/home`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);

    await page.evaluate(
      async ({ testId, ion }) => {
        const { resetTitanDataEngineInstance, getTitanDataEngine } = await import(
          "/src/foundation/data/index.js"
        );
        const { replaceSessionProductionRecords, addSessionProductionRecord } = await import(
          "/src/utils/productionRecords.js"
        );
        const { WORKFLOW_STATUS, applyMoveToProductionWaiting } = await import(
          "/src/utils/titanWorkflowStatus.js"
        );
        const { buildRc1EquipmentMasterSeedRows } = await import(
          "/src/data/rc1EquipmentMasterSeed.js"
        );
        const { syncMasterCategoryToStore } = await import(
          "/src/foundation/data/master/masterDataSync.js"
        );
        const { initTitanWorkflowIntegration } = await import(
          "/src/utils/titanWorkflowIntegration.js"
        );

        resetTitanDataEngineInstance();
        getTitanDataEngine();
        syncMasterCategoryToStore("equipment", buildRc1EquipmentMasterSeedRows());
        initTitanWorkflowIntegration();
        replaceSessionProductionRecords([]);

        addSessionProductionRecord({
          id: testId,
          mesManagementNo: testId,
          company: "RC1",
          partName: "P0-ARCH",
          partNo: "P0-001",
          material: "SCM440",
          qty: 100,
          inboundQty: 100,
          incomingRegistered: true,
          registered: false,
          workflowStatus: WORKFLOW_STATUS.WORK_WAIT,
          lotNo: "",
          heatTreatment: ion,
          processDetail: ion,
        });
        applyMoveToProductionWaiting([testId]);
      },
      { testId: TEST_ID, ion: ION }
    );

    step("1 Seed 100EA", true, TEST_ID);

    const before1 = await readQty(page, "3S-1", TEST_ID);
    const before2 = await readQty(page, "3S-2", TEST_ID);
    const before10 = await readQty(page, "10S-01", TEST_ID);
    step(
      "2 Pre-charge 100EA on 3S-1/3S-2/10S-01",
      before1 === 100 && before2 === 100 && before10 === 100,
      `3S-1=${before1} 3S-2=${before2} 10S-01=${before10}`
    );

    await charge(page, "3S-1", TEST_ID, 30);

    const after2 = await readQty(page, "3S-2", TEST_ID);
    const after10 = await readQty(page, "10S-01", TEST_ID);
    step(
      "3 After 3S-1 30EA: 70EA on 3S-2/10S-01",
      after2 === 70 && after10 === 70,
      `3S-2=${after2} 10S-01=${after10}`
    );

    await charge(page, "3S-2", TEST_ID, 40);

    const after10b = await readQty(page, "10S-01", TEST_ID);
    step("4 After 3S-2 40EA: 30EA on 10S-01", after10b === 30, `10S-01=${after10b}`);

    await charge(page, "10S-01", TEST_ID, 30);

    const finalQty = await readQty(page, "10S-01", TEST_ID);
    step("5 After final 30EA: removed from list", finalQty === null, `10S-01=${finalQty ?? "none"}`);
  } catch (error) {
    step("Runtime", false, error instanceof Error ? error.message : String(error));
  } finally {
    await browser.close();
  }

  const failed = checks.filter((c) => !c.ok);
  console.log(`\nP0-ARCHITECTURE-001 Browser: ${failed.length === 0 ? "PASS" : "FAIL"}`);
  process.exit(failed.length === 0 ? 0 : 1);
}

main();
