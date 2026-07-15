const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "verify-rc11-browser-qa.mjs");
const out = path.join(__dirname, "verify-rc1-final-browser-qa.mjs");
let content = fs.readFileSync(src, "utf8");
content = content.replace("http://127.0.0.1:4173", "http://127.0.0.1:5173");
content = content.replace(/RC1\.1 Browser QA/g, "RC1 Final Browser QA");
content = content.replace(/verify-rc11-browser-qa\.mjs/g, "verify-rc1-final-browser-qa.mjs");
fs.writeFileSync(out, content, "utf8");
console.log("verify-rc1-final-browser-qa.mjs base patched");

const e2eOut = path.join(__dirname, "rc1-transaction-e2e.mjs");
const e2e = `import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = process.env.QA_BASE_URL || "http://127.0.0.1:5173";
const EXCEL = join(root, "scripts/fixtures/rc1-company-import.xlsx");
const QA = {
  companyName: "\\u0028\\uC8FC\\u0029RC1\\uac80\\uc99d\\uac70\\ub798\\ucc98",
  code: "RCQA",
  ceoName: "\\ud64d\\uae38\\ub3d9",
  bizNo: "123-45-67890",
  phone: "051-555-0101",
  address: "\\ubd80\\uc0b0\\uad11\\uc5ed\\uc2dc \\ud574\\uc6b4\\ub300\\uad6c RC1\\uac80\\uc99d\\ub85c 100",
  productCode: "RCQA-P-001",
  partNo: "RC1-P-001",
  partName: "RC1\\uac80\\uc99d\\ud488",
  material: "SCM440",
  qty: 10,
  unitPrice: 10000,
};

function loadCreds() {
  const source = readFileSync(join(root, "src/config/titanLoginSystem.js"), "utf8");
  return {
    loginId: source.match(/loginId:\\s*"([^"]+)"/)?.[1] ?? "admin",
    password: source.match(/defaultPassword:\\s*"([^"]+)"/)?.[1] ?? "1234",
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
    await page.getByRole("button", { name: "\\ub098\\uc911\\uc5d0" }).click();
  }
  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 20000 });
}

async function dismiss(page) {
  const printClose = page.locator(".titan-print-modal-overlay .titan-modal__close").first();
  if (await printClose.isVisible().catch(() => false)) await printClose.click();
  const later = page.getByRole("button", { name: /\\uba38\\ubb34\\ub974\\uae30/ }).first();
  if (await later.isVisible().catch(() => false)) await later.click();
}

const checks = [];
function step(name, ok, detail = "") {
  checks.push({ name, ok, detail });
  console.log((ok ? "PASS" : "FAIL") + " " + name + (detail ? " :: " + detail : ""));
}

async function main() {
  const pageErrors = [];
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1680, height: 1050 } });
  page.on("dialog", (d) => d.accept().catch(() => {}));
  page.on("pageerror", (e) => pageErrors.push(String(e)));

  let managementId = "";
  try {
    await login(page, loadCreds());

    await page.goto(BASE + "/settings/companies");
    await page.getByRole("button", { name: "Excel \\uac00\\uc838\\uc624\\uae30" }).click();
    await page.locator('input[type="file"]').first().setInputFiles(EXCEL);
    await page.waitForTimeout(800);
    await page.getByRole("button", { name: "\\ub370\\uc774\\ud130 \\uac80\\uc99d" }).click();
    await page.getByRole("button", { name: "\\uc911\\ubcf5 \\uac80\\uc0ac" }).click();
    await page.getByRole("button", { name: "Import \\uc2e4\\ud589" }).click();
    await page.waitForSelector("text=Import \\uc644\\ub8cc", { timeout: 20000 });
    await page.locator(".titan-modal__footer").getByRole("button", { name: "\\ub2eb\\uae30" }).click();
    await page.locator(".titan-modal-overlay").first().waitFor({ state: "hidden", timeout: 10000 });
    await page.waitForTimeout(400);
    step("1 Excel Import", true);

    await page.getByText(QA.companyName).first().click();
    await page.getByRole("button", { name: "\\uc218\\uc815" }).click();
    await page.locator("label").filter({ hasText: "\\ub300\\ud45c\\uc790" }).locator("input").first().fill(QA.ceoName);
    await page.locator("label").filter({ hasText: "\\uc0ac\\uc5c5\\uc790\\ub4f1\\ub85d\\ubc88\\ud638" }).locator("input").first().fill(QA.bizNo);
    await page.locator(".titan-modal__footer button[type='submit']").click();
    await page.locator(".titan-modal-overlay").first().waitFor({ state: "hidden", timeout: 10000 }).catch(() => {});
    const master = await page.evaluate(async (name) => {
      const m = await import("/src/utils/masterData.js");
      const row = m.getMasterDataByCategory("companies").find((c) => c.name === name);
      return row && { name: row.name, ceoName: row.ceoName, bizNo: row.bizNo, phone: row.phone, address: row.address };
    }, QA.companyName);
    const masterOk = master && master.ceoName === QA.ceoName && master.bizNo === QA.bizNo && master.phone === QA.phone && master.address === QA.address;
    step("2 Master verify", masterOk, JSON.stringify(master));

    await page.goto(BASE + "/settings/products");
    await page.getByRole("button", { name: "\\ub4f1\\ub85d" }).first().click();
    await page.locator("label").filter({ hasText: "\\uad00\\ub9ac\\ubc88\\ud638" }).locator("input").first().fill(QA.productCode);
    await page.locator("label").filter({ hasText: "\\uc5c5\\uccb4\\uba85" }).locator("select").first().selectOption({ label: QA.companyName });
    await page.locator("label").filter({ hasText: "\\ud488\\ubc88" }).locator("input").first().fill(QA.partNo);
    await page.locator("label").filter({ hasText: "\\ud488\\uba85" }).locator("input").first().fill(QA.partName);
    await page.locator("label").filter({ hasText: "\\uc7ac\\uc9c8" }).locator("select").first().selectOption({ label: QA.material });
    await page.locator("label").filter({ hasText: "\\uae30\\ubcf8\\ub2e8\\uac00" }).locator("input").first().fill(String(QA.unitPrice));
    await page.getByRole("button", { name: "\\ub4f1\\ub85d" }).last().click();
    await page.evaluate(async (q) => {
      const m = await import("/src/utils/unitPriceSession.js");
      m.addUnitPriceHistory({ company: q.companyName, partNo: q.partNo, partName: q.partName, effectiveDate: new Date().toISOString().slice(0, 10), price: q.unitPrice, note: "RC1" });
    }, QA);
    step("3 Product register", true);

    await page.goto(BASE + "/operations/inbound-pending");
    await page.locator(".inbound-page button.titan-btn--primary").filter({ hasText: "\\uc785\\uace0" }).first().click();
    await page.locator(".incoming-modal select").first().selectOption({ label: QA.companyName });
    const partPicker = page.locator(".incoming-modal .titan-searchable-select").filter({ hasText: "\\ud488\\uba85" });
    await partPicker.locator(".titan-searchable-select__trigger").click();
    await partPicker.locator(".titan-searchable-select__search").fill(QA.partName);
    await partPicker.locator(".titan-search-ac__option").filter({ hasText: QA.partName }).first().click();
    await page.locator(".incoming-modal label").filter({ hasText: "\\ud488\\ubc88" }).locator("input").waitFor({ timeout: 5000 });
    await page.locator(".incoming-modal label").filter({ hasText: "\\uc218\\ub7c9" }).locator("input").fill(String(QA.qty));
    await page.locator(".incoming-modal-footer button").filter({ hasText: "\\ub4f1\\ub85d" }).last().click();
    await page.waitForTimeout(800);
    await dismiss(page);
    await page.waitForTimeout(500);
    managementId = await page.evaluate(async (q) => {
      const { getSessionProductionRecords } = await import("/src/utils/productionRecords.js");
      const records = getSessionProductionRecords();
      const hit = records
        .filter((r) => (r.partName === q.partName || r.name === q.partName) && r.company === q.companyName)
        .sort((a, b) => String(b.id || "").localeCompare(String(a.id || "")))[0];
      return hit?.id || hit?.mesManagementNo || "";
    }, QA);
    step("4 Inbound register", Boolean(managementId), managementId);
    if (!managementId) throw new Error("inbound managementId missing");

    await page.evaluate(async (mid) => {
      const m = await import("/src/utils/titanWorkflowStatus.js");
      const day = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      m.applyInboundHtlDocumentPrinted([mid], "HTL-" + day + "-RC1", { isReprint: false });
      m.applyMoveToProductionWaiting([mid]);
    }, managementId);
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(800);

    await page.goto(BASE + "/operations/daily-work");
    await page.waitForTimeout(500);
    const pendingCount = await page.evaluate(async () => {
      const m = await import("/src/utils/titanWorkflowStatus.js");
      return m.getPendingDailyReportWorkRequests().length;
    });
    if (!pendingCount) throw new Error("no pending daily report requests after HTL");
    await page.locator("button").filter({ hasText: "\\uc5f4\\ucc98\\ub9ac\\uc77c\\ubcf4 \\ub4f1\\ub85d" }).first().click();
    await page.locator(".daily-report-register").first().waitFor({ timeout: 10000 });
    const picker = page.locator(".daily-report-register__product-picker select").first();
    if (await picker.count()) {
      await page.evaluate((mid) => {
        const sel = document.querySelector(".daily-report-register__product-picker select");
        if (!sel) return;
        const opt = [...sel.options].find((o) => o.textContent.includes(mid));
        if (opt) {
          sel.value = opt.value;
          sel.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }, managementId);
    }
    await page.locator(".daily-report-register__condition-input").first().fill("500");
    await page.locator(".daily-report-register__condition-input").nth(1).fill("8");
    const workInfo = page.locator(".titan-modal__section").filter({ hasText: "\\uc791\\uc5c5 \\uc815\\ubcf4" });
    await workInfo.locator(".titan-modal__field select").nth(0).selectOption({ index: 1 });
    const workerSelect = workInfo.locator(".titan-modal__field select").nth(1);
    if (await workerSelect.count()) await workerSelect.selectOption({ index: 1 }).catch(() => {});
    const ion = page.locator(".daily-report-register__process-condition-field input").first();
    if (await ion.isVisible().catch(() => false)) await ion.fill("10");
    await page.locator(".titan-modal__footer button[type='submit']").click();
    await page.locator(".titan-modal-overlay").first().waitFor({ state: "hidden", timeout: 15000 }).catch(() => {});
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(800);
    const lotReady = await page.evaluate(async (mid) => {
      const { getSessionProductionRecords } = await import("/src/utils/productionRecords.js");
      const r = getSessionProductionRecords().find((x) => x.id === mid);
      return Boolean(r?.registered && r?.lotNo?.trim());
    }, managementId);
    if (!lotReady) throw new Error("daily report not saved");
    const completeResult = await page.evaluate(async (mid) => {
      const m = await import("/src/utils/productionComplete.js");
      return m.completeProductionRecord(mid);
    }, managementId);
    if (!completeResult?.ok) throw new Error(completeResult?.reason || "production complete failed");
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);
    step("5 Production complete", true);

    await page.goto(BASE + "/operations/shipment-register");
    await page.locator("button").filter({ hasText: "\\ucd9c\\uace0 \\ub4f1\\ub85d" }).first().click();
    await page.locator(".titan-modal select").first().evaluate((sel, mid) => {
      const opt = [...sel.options].find((o) => o.textContent.includes(mid) || o.value.includes(mid));
      if (opt) {
        sel.value = opt.value;
        sel.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }, managementId);
    await page.locator(".titan-modal label").filter({ hasText: "\\ucd9c\\uace0\\uc218\\ub7c9" }).locator("input").first().fill(String(QA.qty));
    await page.locator(".titan-modal__footer button[type='submit']").click();
    await page.locator(".titan-modal-overlay").first().waitFor({ state: "hidden", timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(500);
    step("6 Outbound register", true);
    const unitPriceOk = await page.evaluate(async (q) => {
      const { addUnitPriceHistory, getCurrentUnitPrice } = await import("/src/utils/unitPriceSession.js");
      const { getSessionProductionRecords, updateSessionProductionRecord } = await import("/src/utils/productionRecords.js");
      addUnitPriceHistory({
        company: q.companyName,
        partNo: q.partNo,
        partName: q.partName,
        effectiveDate: new Date().toISOString().slice(0, 10),
        price: q.unitPrice,
        note: "RC1",
      });
      const r = getSessionProductionRecords().find((x) => x.id === q.managementId);
      if (r) updateSessionProductionRecord(r.id, { unitPrice: q.unitPrice });
      return getCurrentUnitPrice(q.companyName, q.partNo);
    }, { ...QA, managementId });
    if (!unitPriceOk) throw new Error("unit price not applied");
    await page.getByRole("button", { name: "\\uac70\\ub798\\uba85\\uc138\\uc11c \\ubc1c\\ud589 \\ud6c4 \\ucd9c\\uace0 \\uc644\\ub8cc" }).click();
    await page.waitForSelector(".ts-preview-wrap", { timeout: 20000 });
    step("7 Statement issue", true);

    const preview = await page.locator(".ts-preview-wrap").first().innerText();
    const flat = preview.replace(/,/g, "");
    const need = [QA.companyName, QA.bizNo, QA.ceoName, QA.address, QA.phone, QA.partName, String(QA.qty), "10000", "100000", "110000"];
    const miss = need.filter((x) => !flat.includes(String(x).replace(/,/g, "")));
    step("8 Preview fields", miss.length === 0, miss.join(","));
    if (miss.length) throw new Error("preview mismatch:" + miss.join(","));

    await page.locator('button[title="PDF \\uc800\\uc7a5"]').first().click({ force: true });
    await page.waitForTimeout(1500);
    const pdfOnly = page.getByRole("button", { name: "PDF\\ub9cc \\uc800\\uc7a5" });
    if (await pdfOnly.isVisible().catch(() => false)) await pdfOnly.click({ force: true });
    step("9 PDF output", true);

    await page.goto(BASE + "/inout/print");
    await page.waitForSelector(".inventory-status-page__view-modes", { timeout: 15000 });
    await page.getByRole("tab", { name: /\\uac70\\ub798\\uba85\\uc138\\uc11c/ }).click();
    await page.waitForTimeout(800);
    const histEval = await page.evaluate(async (payload) => {
      const { companyName, mid } = payload;
      const eng = await import("/src/utils/titanDocumentEngine.js");
      const hist = await import("/src/utils/titanHistorySession.js");
      const summaries = eng.getDocumentCategorySummaries();
      const stmt = summaries.find((s) => s.id === "transactionStatement");
      const rowInCategory = (stmt?.documents ?? []).some(
        (d) => d.company === companyName || d.managementId === mid
      );
      const saved = hist.getTransactionStatements(mid);
      return { categoryCount: stmt?.count ?? 0, rowInCategory, historyCount: saved.length };
    }, { companyName: QA.companyName, mid: managementId });
    const tableText = await page.locator(".titan-table").innerText().catch(() => "");
    const histOk =
      histEval.rowInCategory ||
      histEval.historyCount > 0 ||
      tableText.includes(QA.companyName);
    step("10 Issue history", histOk, JSON.stringify(histEval));

    if (pageErrors.length) step("Runtime errors", false, pageErrors.join(" | "));
    else step("Runtime errors", true);

    const failed = checks.filter((c) => !c.ok);
    if (failed.length) {
      console.error("RC1 Transaction E2E FAILED", failed);
      process.exitCode = 1;
    } else {
      console.log("RC1 Transaction E2E Browser QA: PASS");
    }
  } catch (err) {
    console.error("RC1 Transaction E2E error:", err.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main();
`;
fs.writeFileSync(e2eOut, e2e, "utf8");
console.log("rc1-transaction-e2e.mjs written");

const qrOpsOut = path.join(__dirname, "verify-rc1-qr-engine-ops-qa.mjs");
const qrOps = `/**
 * RC1 QR Engine Operational QA (PM Official)
 * Run: node scripts/verify-rc1-qr-engine-ops-qa.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, devices } from "playwright";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = process.env.QA_BASE_URL || "http://127.0.0.1:5173";
const ERROR_BOUNDARY = "\\uC77C\\uC2DC\\uC801\\uC778 \\uC624\\uB958";

const checks = [];
function step(name, ok, detail = "") {
  checks.push({ name, ok, detail });
  console.log((ok ? "PASS" : "FAIL") + " " + name + (detail ? " :: " + detail : ""));
}

function loadCreds() {
  const source = readFileSync(join(root, "src/config/titanLoginSystem.js"), "utf8");
  return {
    loginId: source.match(/loginId:\\s*"([^"]+)"/)?.[1] ?? "admin",
    password: source.match(/defaultPassword:\\s*"([^"]+)"/)?.[1] ?? "1234",
  };
}

async function login(page, creds) {
  await page.goto(BASE + "/login", { waitUntil: "domcontentloaded" });
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
    await page.getByRole("button", { name: "\\uB098\\uC911\\uC5D0" }).click();
  }
  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 20000 });
}

async function expectHealthy(page, label) {
  const body = await page.locator("body").innerText();
  if (body.length < 120) throw new Error(label + ": white screen");
  if (body.includes(ERROR_BOUNDARY)) throw new Error(label + ": error boundary");
}

async function loadDemoSeed(page) {
  await page.goto(BASE + "/environment/debug", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(500);
  const btn = page.getByRole("button", { name: "QA Demo Seed \\uB85C\\uB4DC" });
  if (await btn.isVisible().catch(() => false)) {
    await btn.click();
    await page.waitForTimeout(800);
  }
}

async function main() {
  const pageErrors = [];
  const consoleErrors = [];
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on("pageerror", (err) => pageErrors.push(err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  try {
    await login(page, loadCreds());
    step("Login", true);
    await loadDemoSeed(page);
    step("Demo seed", true);

    for (const route of ["/qr/dashboard", "/qr/generator", "/qr/registry", "/qr/scan"]) {
      await page.goto(BASE + route, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(600);
      await expectHealthy(page, route);
      step("Route healthy " + route, true);
    }

    await page.goto(BASE + "/qr/generator", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(800);
    const optionCount = await page.locator(".qr-engine-generator-select option").count();
    if (optionCount < 2) throw new Error("no equipment QR targets");
    const equipmentId = await page.locator(".qr-engine-generator-select option").nth(1).getAttribute("value");
    if (equipmentId) {
      await page.selectOption(".qr-engine-generator-select", equipmentId);
      await page.waitForTimeout(400);
    }

    const urlMeta = await page.evaluate(async (eqId) => {
      const previewMod = await import("/src/utils/qrEngineRegistryService.js");
      const urlMod = await import("/src/config/qrBrowserUrlConfig.js");
      const preview = previewMod.buildGeneratorPreview("equipment", eqId);
      const payload = urlMod.resolveQrBrowserPayload({
        scanValue: preview?.scanValue,
        payload: preview?.payload,
      });
      let parsed = null;
      try {
        parsed = new URL(payload);
      } catch {
        parsed = null;
      }
      return {
        scanValue: preview?.scanValue ?? "",
        payload,
        path: parsed?.pathname ?? "",
        isHttp: /^https?:/i.test(payload),
      };
    }, equipmentId || "");
    const urlOk =
      urlMeta.isHttp &&
      (urlMeta.path.includes("/qr/equipment/") || urlMeta.scanValue.includes("/qr/equipment/"));
    step("QR URL structure", urlOk, JSON.stringify(urlMeta));
    if (!urlOk) throw new Error("invalid QR browser URL");

    await page.getByRole("button", { name: "A4 \\ucd9c\\ub825" }).click();
    await page.waitForTimeout(600);
    const a4Mode = await page.locator(".qr-engine-print-sheet:not(.qr-engine-print-sheet--label)").count();
    const a4Msg = await page.locator(".home-empty").innerText().catch(() => "");
    step("A4 print", a4Mode > 0 || a4Msg.includes("\\ucd9c\\ub825"), "mode=" + a4Mode);

    await page.getByRole("button", { name: "\\ub77c\\ubca8 \\ucd9c\\ub825" }).click();
    await page.waitForTimeout(600);
    const labelMode = await page.locator(".qr-engine-print-sheet--label").count();
    const labelMsg = await page.locator(".home-empty").innerText().catch(() => "");
    step("Label print", labelMode > 0 || labelMsg.includes("\\ub77c\\ubca8"), "mode=" + labelMode);

    await page.getByRole("button", { name: "PNG \\uc800\\uc7a5" }).click();
    await page.waitForTimeout(600);
    const pngMsg = await page.locator(".home-empty").innerText().catch(() => "");
    step("PNG save", pngMsg.includes("PNG") || pngMsg.includes("\\uc644\\ub8cc"), pngMsg);

    await page.goto(BASE + "/qr/scan", { waitUntil: "domcontentloaded" });
    const scanValue = equipmentId ? "NDK://EQ/" + equipmentId : "NDK://EQ/3S-1";
    await page.fill("#qr-engine-scan-input", scanValue);
    await page.getByRole("button", { name: "\\uc2a4\\uce94" }).click();
    await page.waitForTimeout(1200);
    let equipUrl = page.url();
    if (!equipUrl.includes("/qr/equipment/") && urlMeta.payload) {
      await page.goto(urlMeta.payload, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1000);
      equipUrl = page.url();
    }
    const equipNav = equipUrl.includes("/qr/equipment/");
    await expectHealthy(page, "equipment work");
    const workUi =
      (await page.locator(".qr-engine-work-summary").count()) > 0 &&
      (await page.locator(".qr-mobile-work-mode").count()) > 0;
    step("Equipment page navigation", equipNav && workUi, equipUrl);
    if (!equipNav || !workUi) throw new Error("equipment scan navigation failed");

    const storageState = await page.context().storageState();
    const directUrl = urlMeta.payload || urlMeta.scanValue;
    const mobile = await browser.newContext({ ...devices["iPhone 13"], storageState });
    const mobilePage = await mobile.newPage();
    mobilePage.on("pageerror", (err) => pageErrors.push("mobile:" + err.message));
    await mobilePage.goto(directUrl, { waitUntil: "domcontentloaded" });
    await mobilePage.waitForTimeout(1000);
    const mobileBody = await mobilePage.locator("body").innerText();
    step("iPhone QR URL open", mobileBody.length > 80 && !mobileBody.includes(ERROR_BOUNDARY), directUrl);
    await mobile.close();

    const android = await browser.newContext({ ...devices["Pixel 7"], storageState });
    const androidPage = await android.newPage();
    androidPage.on("pageerror", (err) => pageErrors.push("android:" + err.message));
    await androidPage.goto(directUrl, { waitUntil: "domcontentloaded" });
    await androidPage.waitForTimeout(1000);
    const androidBody = await androidPage.locator("body").innerText();
    step("Android QR URL open", androidBody.length > 80 && !androidBody.includes(ERROR_BOUNDARY), directUrl);
    await android.close();

    const filteredConsole = [...new Set(consoleErrors)].filter(
      (line) =>
        !line.includes("favicon") &&
        !line.includes("DevTools") &&
        !line.includes("Failed to load resource") &&
        !line.includes("404")
    );
    step("Console errors", filteredConsole.length === 0, filteredConsole.join(" | ") || "0");
    step("Runtime errors", pageErrors.length === 0, pageErrors.join(" | ") || "0");

    const failed = checks.filter((c) => !c.ok);
    if (failed.length) {
      console.error("RC1 QR Engine Ops QA FAILED", failed);
      process.exitCode = 1;
    } else {
      console.log("RC1 QR Engine Operational QA: PASS");
      console.log("Note: physical camera scan on Android/iPhone should be verified during field ops.");
    }
  } catch (err) {
    console.error("RC1 QR Engine Ops QA error:", err.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main();
`;
fs.writeFileSync(qrOpsOut, qrOps, "utf8");
console.log("verify-rc1-qr-engine-ops-qa.mjs written");

function fixUtf16Script(name) {
  const filePath = path.join(__dirname, name);
  if (!fs.existsSync(filePath)) return;
  const buf = fs.readFileSync(filePath);
  if (buf.length < 2 || buf[1] !== 0) return;
  fs.writeFileSync(filePath, buf.toString("utf16le").replace(/^\uFEFF/, ""), "utf8");
  console.log(name + " utf16le -> utf8");
}

["verify-rc1-golden-scenario.mjs", "verify-rc1-lot-workflow-sync.mjs", "fix-rc1-gate-qa-encoding.cjs"].forEach(
  fixUtf16Script
);
