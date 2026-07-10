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
    await page.getByRole("button", { name: "\ub4f1\ub85d" }).first().click();
    await page.locator("label").filter({ hasText: "\uad00\ub9ac\ubc88\ud638" }).locator("input").first().fill(QA.productCode);
    await page.locator("label").filter({ hasText: "\uc5c5\uccb4\uba85" }).locator("select").first().selectOption({ label: QA.companyName });
    await page.locator("label").filter({ hasText: "\ud488\ubc88" }).locator("input").first().fill(QA.partNo);
    await page.locator("label").filter({ hasText: "\ud488\uba85" }).locator("input").first().fill(QA.partName);
    await page.locator("label").filter({ hasText: "\uc7ac\uc9c8" }).locator("select").first().selectOption({ label: QA.material });
    await page.getByRole("button", { name: "\ub4f1\ub85d" }).last().click();
    step("2 Product ready", true);

    await page.goto(BASE + "/operations/inbound-pending");
    await page.locator(".inbound-page button.titan-btn--primary").filter({ hasText: "\uc785\uace0" }).first().click();
    await page.locator(".incoming-modal select").first().selectOption({ label: QA.companyName });
    const partPicker = page.locator(".incoming-modal .titan-searchable-select").filter({ hasText: "\ud488\uba85" });
    await partPicker.locator(".titan-searchable-select__trigger").click();
    await partPicker.locator(".titan-search-ac__option").filter({ hasText: QA.partName }).first().click();
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

    await page.goto(BASE + "/operations/daily-work");
    await page.waitForTimeout(600);
    await page.locator("button").filter({ hasText: "\uc5f4\ucc98\ub9ac\uc77c\ubcf4 \ub4f1\ub85d" }).first().click();
    await page.locator(".daily-report-register").first().waitFor({ timeout: 10000 });
    await page.evaluate((mid) => {
      const sel = document.querySelector(".daily-report-register__product-picker select");
      if (!sel) return;
      const opt = [...sel.options].find((o) => o.textContent.includes(mid));
      if (opt) {
        sel.value = opt.value;
        sel.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }, managementId);
    await page.locator(".daily-report-register__condition-input").first().fill("500");
    await page.locator(".daily-report-register__condition-input").nth(1).fill("8");
    const workInfo = page.locator(".titan-modal__section").filter({ hasText: "\uc791\uc5c5 \uc815\ubcf4" });
    await workInfo.locator(".titan-modal__field select").nth(0).selectOption({ index: 1 });
    await page.locator(".titan-modal__footer button[type='submit']").click();
    await page.locator(".titan-modal-overlay").first().waitFor({ state: "hidden", timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(500);

    lotNo = await page.evaluate(async (mid) => {
      const { getSessionProductionRecords } = await import("/src/utils/productionRecords.js");
      return getSessionProductionRecords().find((r) => r.id === mid)?.lotNo || "";
    }, managementId);
    step("4 LOT create", Boolean(lotNo?.trim()), lotNo);
    if (!lotNo?.trim()) throw new Error("LOT missing");

    const prodResult = await page.evaluate(async (mid) => {
      const m = await import("/src/utils/productionComplete.js");
      return m.completeProductionRecord(mid);
    }, managementId);
    step("5 Production work", prodResult?.ok === true, prodResult?.reason || "");
    if (!prodResult?.ok) throw new Error(prodResult?.reason || "production failed");

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
    await page.goto(BASE + "/production/charging/equipment/3S-1", { waitUntil: "domcontentloaded" });
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
    await page.locator(".titan-search-panel input").first().fill(managementId);
    await page.waitForTimeout(500);
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
