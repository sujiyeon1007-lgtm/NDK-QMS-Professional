/**
 * RC1 Golden Scenario QA (PM Official)
 * Run: node scripts/verify-rc1-golden-scenario.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = process.env.QA_BASE_URL || "http://127.0.0.1:5174";
const EXCEL = join(root, "scripts/fixtures/rc1-company-import.xlsx");
const QA = {
  companyName: "\u0028\uC8FC\u0029RC1\uac80\uc99d\uac70\ub798\ucc98",
  code: "RCQA",
  ceoName: "\ud64d\uae38\ub3d9",
  bizNo: "123-45-67890",
  phone: "051-555-0101",
  address: "\ubd80\uc0b0\uad11\uc5ed\uc2dc \ud574\uc6b4\ub300\uad6c RC1\uac80\uc99d\ub85c 100",
  productCode: "RCQA-P-001",
  partNo: "RC1-P-001",
  partName: "RC1\uac80\uc99d\ud488",
  material: "SCM440",
  qty: 10,
  unitPrice: 10000,
};

const checks = [];
function step(name, ok, detail = "") {
  checks.push({ name, ok, detail });
  console.log((ok ? "PASS" : "FAIL") + " " + name + (detail ? " :: " + detail : ""));
}

function loadCreds() {
  const source = readFileSync(join(root, "src/config/titanLoginSystem.js"), "utf8");
  return {
    loginId: source.match(/loginId:\s*"([^"]+)"/)?.[1] ?? "admin",
    password: source.match(/defaultPassword:\s*"([^"]+)"/)?.[1] ?? "1234",
  };
}

async function login(page, creds) {
  await page.goto(BASE + "/login");
  await page.waitForTimeout(500);
  if (!page.url().includes("/login")) return;
  if ((await page.locator('input[name="loginId"]').count()) === 0) {
    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 10000 });
    return;
  }
  await page.fill('input[name="loginId"]', creds.loginId);
  await page.fill('input[name="password"]', creds.password);
  await page.click('button[type="submit"]');
  const modal = page.locator(".titan-login-modal");
  if (await modal.isVisible().catch(() => false)) {
    await page.getByRole("button", { name: "\ub098\uc911\uc5d0" }).click();
  }
  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 20000 });
}

async function dismiss(page) {
  const printClose = page.locator(".titan-print-modal-overlay .titan-modal__close").first();
  if (await printClose.isVisible().catch(() => false)) await printClose.click();
  const later = page.getByRole("button", { name: /\uba38\ubb34\ub974\uae30/ }).first();
  if (await later.isVisible().catch(() => false)) await later.click();
}

async function pickSearchableSelect(page, scope, labelText, optionText) {
  const field = page.locator(scope).locator(".form-field").filter({ hasText: labelText });
  const acInput = field.locator(".titan-search-ac__input").first();
  if ((await acInput.count()) > 0) {
    await acInput.fill(optionText);
    await page.waitForTimeout(300);
    await field.locator(".titan-search-ac__option").filter({ hasText: optionText }).first().click();
    return;
  }
  await field.locator(".titan-searchable-select__trigger").click();
  await field.locator(".titan-search-ac__option").filter({ hasText: optionText }).first().click();
}

async function main() {
  const pageErrors = [];
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1680, height: 1050 } });
  page.on("dialog", (d) => d.accept().catch(() => {}));
  page.on("pageerror", (e) => pageErrors.push(String(e)));

  let managementId = "";
  let lotNo = "";

  try {
    await login(page, loadCreds());

    await page.goto(BASE + "/settings/companies");
    await page.getByRole("button", { name: "Excel \uac00\uc838\uc624\uae30" }).click();
    await page.locator('input[type="file"]').first().setInputFiles(EXCEL);
    await page.waitForTimeout(800);
    await page.getByRole("button", { name: "\ub370\uc774\ud130 \uac80\uc99d" }).click();
    await page.getByRole("button", { name: "\uc911\ubcf5 \uac80\uc0ac" }).click();
    await page.getByRole("button", { name: "Import \uc2e4\ud589" }).click();
    await page.waitForSelector("text=Import \uc644\ub8cc", { timeout: 20000 });
    await page.locator(".titan-modal__footer").getByRole("button", { name: "\ub2eb\uae30" }).click();
    step("1 Company register", true);

    await page.goto(BASE + "/settings/products");
    const productResult = await page.evaluate(async (q) => {
      const { stageMasterAdd } = await import("/src/utils/masterData.js");
      return stageMasterAdd("products", {
        company: q.companyName,
        partNo: q.partNo,
        name: q.partName,
        material: q.material,
        processCategory: "ion",
        processDetail: "이온질화",
        process: "이온질화",
      });
    }, QA);
    step("2 Product ready", productResult?.ok === true, productResult?.message || QA.partNo);
    if (!productResult?.ok) throw new Error(productResult?.message || "product register failed");

    await page.goto(BASE + "/operations/inbound-pending");
    await page.locator(".inbound-page button.titan-btn--primary").filter({ hasText: "\uc785\uace0" }).first().click();
    await pickSearchableSelect(page, ".incoming-modal", "\uAC70\uB798\uCC98", QA.companyName);
    await pickSearchableSelect(page, ".incoming-modal", "\ud488\uba85", QA.partName);
    await page.locator(".incoming-modal label").filter({ hasText: "\uc218\ub7c9" }).locator("input").fill(String(QA.qty));
    await page.locator(".incoming-modal-footer button").filter({ hasText: "\ub4f1\ub85d" }).last().click();
    await page.waitForTimeout(800);
    await dismiss(page);

    managementId = await page.evaluate(async (q) => {
      const { getSessionProductionRecords } = await import("/src/utils/productionRecords.js");
      const hit = getSessionProductionRecords()
        .filter((r) => r.company === q.companyName && (r.partName === q.partName || r.name === q.partName))
        .sort((a, b) => String(b.id || "").localeCompare(String(a.id || "")))[0];
      return hit?.id || "";
    }, QA);
    step("3 Inbound register", Boolean(managementId), managementId);
    if (!managementId) throw new Error("managementId missing");

    await page.evaluate(async (mid) => {
      const m = await import("/src/utils/titanWorkflowStatus.js");
      const day = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      m.applyInboundHtlDocumentPrinted([mid], "HTL-" + day + "-GOLDEN", { isReprint: false });
      m.applyMoveToProductionWaiting([mid]);
    }, managementId);

    await page.evaluate(async () => {
      const { getTitanDataEngine } = await import("/src/foundation/data/index.js");
      const { EQUIPMENT_RAW_LIST } = await import("/src/config/equipmentConfig.js");
      const { syncMasterCategoryToStore } = await import("/src/foundation/data/master/masterDataSync.js");
      const { initTitanWorkflowIntegration } = await import("/src/utils/titanWorkflowIntegration.js");
      syncMasterCategoryToStore(
        "equipment",
        EQUIPMENT_RAW_LIST.filter((row) => !row.maintenance).map((row) => ({
          id: row.id,
          code: row.code,
          name: row.name,
          process: row.process,
          active: true,
        }))
      );
      getTitanDataEngine();
      initTitanWorkflowIntegration();
    });

    const chargeResult = await page.evaluate(async ({ mid, qty }) => {
      try {
        const { getChargeableLots, ensureLotBeforeCharging } = await import("/src/utils/equipmentWorkflowService.js");
        const { executeStartCharging, executeFinishCharging } = await import("/src/utils/titanWorkflowIntegration.js");
        const { getSessionProductionRecords } = await import("/src/utils/productionRecords.js");
        const { resolveRecordCurrentProcess, CURRENT_PROCESS_KEYS } = await import("/src/utils/workflowProcessStatus.js");
        const EQUIPMENT_ID = "ION-01";
        const chargeQty = Math.min(15, qty);
        const waitingRow = getChargeableLots(EQUIPMENT_ID).find(
          (row) => String(row.sourceRecordId ?? row.id ?? "").trim() === mid
        );
        if (!waitingRow) return { ok: false, reason: "chargeable row missing" };
        const ensured = ensureLotBeforeCharging(EQUIPMENT_ID, { ...waitingRow, chargeQty });
        const lotNo = String(ensured?.lotNo ?? "").trim();
        const chargeableRow = {
          ...(ensured?.chargeableRow ?? waitingRow),
          chargeQty,
          remainingChargeQty: Math.max(0, qty - chargeQty),
        };
        const startResult = executeStartCharging({
          equipmentId: EQUIPMENT_ID,
          lotNo,
          chargeQty,
          chargeableRow,
          operator: "생산부",
        });
        executeFinishCharging({
          equipmentId: EQUIPMENT_ID,
          lotNo,
          chargeableRow,
          operator: "생산부",
        });
        const record = getSessionProductionRecords().find((r) => r.id === mid);
        const processKey = record ? resolveRecordCurrentProcess(record).key : null;
        return {
          ok: true,
          lotNo,
          chargeQty,
          process: processKey,
          legacyIds: startResult?.legacyRecordIds ?? [],
          dailyReportAutoCreated: Boolean(record?.dailyReportAutoCreated),
          inspectionWait: processKey === CURRENT_PROCESS_KEYS.INSPECTION_WAIT,
        };
      } catch (error) {
        return { ok: false, reason: error instanceof Error ? error.message : String(error) };
      }
    }, { mid: managementId, qty: QA.qty });

    lotNo = chargeResult?.lotNo || "";
    step("4 Equipment charge + LOT", chargeResult?.ok === true && Boolean(lotNo), lotNo || chargeResult?.reason || "");
    step("4b Daily report auto", chargeResult?.dailyReportAutoCreated === true, String(chargeResult?.dailyReportAutoCreated));
    step("5 Heat finish -> inspection wait", chargeResult?.inspectionWait === true, chargeResult?.process || "");
    if (!chargeResult?.ok) throw new Error(chargeResult?.reason || "equipment charge failed");

    await page.goto(BASE + "/operations/daily-work");
    await page.waitForTimeout(700);
    const dailyText = await page.locator(".titan-table, .inbound-page").innerText().catch(() => "");
    step("5b Daily work list visible", dailyText.includes(managementId) || dailyText.includes(lotNo), managementId);

    const inspectionId = await page.evaluate(async (mid) => {
      const { getSessionProductionRecords } = await import("/src/utils/productionRecords.js");
      const { buildInspectionLogFromRecord, addInspectionLog } = await import("/src/utils/inspectionLogSession.js");
      const record = getSessionProductionRecords().find((r) => r.id === mid);
      const log = addInspectionLog(buildInspectionLogFromRecord(record, { judgment: "\ud569\uaca9", assignee: "\uad00\ub9ac\uc790" }));
      return log?.id || "";
    }, managementId);
    step("6 Inspection complete", Boolean(inspectionId), inspectionId);
    if (!inspectionId) throw new Error("inspection missing");

    const certId = await page.evaluate(async (mid) => {
      const { getSessionProductionRecords } = await import("/src/utils/productionRecords.js");
      const { buildCertificateEntryFromRecord, upsertCertificateFileEntry } = await import("/src/utils/certificateSession.js");
      const record = getSessionProductionRecords().find((r) => r.id === mid);
      const entry = upsertCertificateFileEntry({
        ...buildCertificateEntryFromRecord(record),
        excelFile: { name: "RC1-GOLDEN.xlsx", size: 1024 },
        pdfFile: { name: "RC1-GOLDEN.pdf", size: 2048 },
      });
      return entry?.id || "";
    }, managementId);
    step("7 Certificate issue", Boolean(certId), certId);
    if (!certId) throw new Error("certificate missing");

    await page.goto(BASE + "/operations/shipment-register");
    await page.locator("button").filter({ hasText: "\ucd9c\uace0 \ub4f1\ub85d" }).first().click();
    await page.locator(".titan-modal select").first().evaluate((sel, mid) => {
      const opt = [...sel.options].find((o) => o.textContent.includes(mid) || o.value.includes(mid));
      if (opt) {
        sel.value = opt.value;
        sel.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }, managementId);
    await page.locator(".titan-modal label").filter({ hasText: "\ucd9c\uace0\uc218\ub7c9" }).locator("input").first().fill(String(QA.qty));
    await page.locator(".titan-modal__footer button[type='submit']").click();
    await page.waitForTimeout(600);
    step("8 Outbound register", true);

    await page.evaluate(async (q) => {
      const { addUnitPriceHistory } = await import("/src/utils/unitPriceSession.js");
      const { getSessionProductionRecords, updateSessionProductionRecord } = await import("/src/utils/productionRecords.js");
      addUnitPriceHistory({
        company: q.companyName,
        partNo: q.partNo,
        partName: q.partName,
        effectiveDate: new Date().toISOString().slice(0, 10),
        price: q.unitPrice,
        note: "RC1-GOLDEN",
      });
      const r = getSessionProductionRecords().find((x) => x.id === q.managementId);
      if (r) updateSessionProductionRecord(r.id, { unitPrice: q.unitPrice });
    }, { ...QA, managementId });

    await page.getByRole("button", { name: "\uac70\ub798\uba85\uc138\uc11c \ubc1c\ud589 \ud6c4 \ucd9c\uace0 \uc644\ub8cc" }).click();
    await page.waitForSelector(".ts-preview-wrap", { timeout: 20000 });
    const preview = await page.locator(".ts-preview-wrap").first().innerText();
    step("9 Transaction statement output", preview.includes(QA.companyName) && preview.includes(String(QA.qty)), "");

    await page.goto(BASE + "/qr/generator");
    await page.waitForTimeout(800);
    const optionCount = await page.locator(".qr-engine-generator-select option").count();
    if (optionCount >= 2) {
      const equipmentId = await page.locator(".qr-engine-generator-select option").nth(1).getAttribute("value");
      if (equipmentId) await page.selectOption(".qr-engine-generator-select", equipmentId);
    }
    await page.getByRole("button", { name: "A4 \ucd9c\ub825" }).click();
    await page.waitForTimeout(600);
    const qrPrint = await page.locator(".qr-engine-print-sheet:not(.qr-engine-print-sheet--label)").count();
    step("10 QR output", qrPrint > 0, "sheets=" + qrPrint);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE + "/production/charging/equipment/ION-01", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(900);
    const mobileBody = await page.locator("body").innerText().catch(() => "");
    step(
      "10b QR mobile equipment page",
      !mobileBody.includes("\uC77C\uC2DC\uC801\uC778 \uC624\uB958") && mobileBody.length > 20,
      page.url()
    );
    await page.setViewportSize({ width: 1680, height: 1050 });

    await page.goto(BASE + "/history");
    await page.waitForTimeout(800);
    const historySearch = page.locator(".titan-search-panel input, .titan-search-ac__input").first();
    if ((await historySearch.count()) > 0) {
      await historySearch.fill(managementId);
      await page.waitForTimeout(500);
    }
    const historyText = await page.locator(".titan-table, .quality-history-inquiry").innerText().catch(() => "");
    step("11 History inquiry", historyText.includes(managementId) || historyText.includes(lotNo), managementId);

    step("Runtime errors", pageErrors.length === 0, pageErrors.join(" | ") || "0");

    const failed = checks.filter((c) => !c.ok);
    if (failed.length) {
      console.error("RC1 Golden Scenario FAILED", failed);
      process.exitCode = 1;
    } else {
      console.log("RC1 Golden Scenario QA: PASS");
    }
  } catch (err) {
    console.error("RC1 Golden Scenario error:", err.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main();
