/**
 * RC1 Print Workflow Freeze QA (PM Official)
 * Run: node scripts/verify-rc1-print-freeze-qa.mjs
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
  const consoleErrors = [];
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1680, height: 1050 } });
  page.on("dialog", (d) => d.accept().catch(() => {}));
  page.on("pageerror", (e) => pageErrors.push(String(e)));
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  try {
    await login(page, loadCreds());
    step("Login", !page.url().includes("/login"), page.url());

    await page.evaluate(async () => {
      const { replaceSessionProductionRecords } = await import("/src/utils/productionRecords.js");
      const { TITAN_DEMO_PRODUCTION_RECORDS } = await import("/src/data/titanDemoSampleData.js");
      replaceSessionProductionRecords(TITAN_DEMO_PRODUCTION_RECORDS.map((row) => ({ ...row })));
    });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(600);
    step("Demo operations seed loaded", true);

    await page.goto(BASE + "/quality/inspection/mass", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(700);
    const massRegisterCount = await page.locator("button").filter({ hasText: /^\ub4f1\ub85d$/ }).count();
    step("Mass inspection register button", massRegisterCount > 0, "count=" + massRegisterCount);
    if (massRegisterCount > 0) {
      await page.locator("button").filter({ hasText: /^\ub4f1\ub85d$/ }).first().click();
      await page.waitForTimeout(900);
      step(
        "Mass inspection register navigation",
        page.url().includes("/quality/inspection/register"),
        page.url()
      );
      await page.goto(BASE + "/quality/inspection/mass", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(400);
    }

    await page.goto(BASE + "/operations/production-pending", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(700);
    const prodPrintBtn = page.locator("button").filter({ hasText: /\uc0dd\uc0b0 \ub300\uae30 \ub9ac\uc2a4\ud2b8 \ucd9c\ub825/ }).first();
    step("Production waiting print button", (await prodPrintBtn.count()) > 0);
    if ((await prodPrintBtn.count()) > 0) {
      await prodPrintBtn.click();
      await page.waitForTimeout(1200);
      step(
        "Production waiting - no inbound navigation",
        page.url().includes("/operations/production-pending") && !page.url().includes("/operations/inbound-pending"),
        page.url()
      );
      step(
        "Production waiting - preview modal",
        (await page.locator(".titan-print-modal-overlay, .titan-print-modal, .titan-print-list").count()) > 0
      );
      await dismiss(page);
    }

    await page.goto(BASE + "/operations/inbound-pending", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(700);
    const excelBtn = page.locator("button").filter({ hasText: /\uc5d1\uc140 \ucd9c\ub825/ }).first();
    step("Inbound excel button", (await excelBtn.count()) > 0);
    await excelBtn.click();
    await page.waitForTimeout(600);
    step("Inbound excel criteria", (await page.locator(".inbound-print-criteria").count()) > 0);
    const submitText = await page.locator(".titan-modal__footer button.titan-btn--primary").first().innerText().catch(() => "");
    step("Inbound excel submit label", submitText.includes("\uc5d1\uc140"), submitText);
    await dismiss(page);

    await page.goto(BASE + "/quality/inspection/register?category=%EC%96%91%EC%82%B0", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(700);
    await page.locator("button").filter({ hasText: /\ubbf8\ub9ac\ubcf4\uae30/ }).first().click();
    await page.waitForTimeout(1000);
    step("Inspection register preview modal", (await page.locator(".titan-print-modal").count()) > 0);
    step(
      "Inspection register print wired",
      (await page.locator('.titan-print-modal [title="\uc778\uc1d4"], .titan-print-modal-footer-btn.primary').count()) > 0
    );
    step(
      "Inspection register pdf wired",
      (await page.locator('.titan-print-modal [title="PDF \uc800\uc7a5"], .titan-print-modal-footer-btn').filter({ hasText: /PDF/ }).count()) > 0
    );
    await dismiss(page);

    await page.evaluate(async () => {
      const { replaceSessionProductionRecords } = await import("/src/utils/productionRecords.js");
      const { TITAN_DEMO_PRODUCTION_RECORDS } = await import("/src/data/titanDemoSampleData.js");
      replaceSessionProductionRecords(TITAN_DEMO_PRODUCTION_RECORDS.map((row) => ({ ...row })));
    });
    await page.goto(BASE + "/inout/print", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(800);
    const certTab = page.locator(".inventory-status-page__view-mode, [role='tab']").filter({ hasText: /\uac80\uc0ac\uc131\uc801\uc11c/ }).first();
    if ((await certTab.count()) > 0) await certTab.click();
    await page.waitForTimeout(500);
    const certPrintBtn = page.locator(".titan-table tbody tr button").filter({ hasText: /\ucd9c\ub825/ }).first();
    step("Certificate print button", (await certPrintBtn.count()) > 0);
    if ((await certPrintBtn.count()) > 0) {
      await certPrintBtn.click();
      await page.waitForTimeout(1200);
      step(
        "Certificate preview - no navigate",
        !page.url().includes("/quality/certificate"),
        page.url()
      );
      step("Certificate preview modal", (await page.locator(".titan-print-modal, .certificate-print").count()) > 0);
      await dismiss(page);
    }

    step("White Screen", (await page.locator(".app-shell, .titan-app, #root").count()) > 0);
    step("Console Error", consoleErrors.length === 0, consoleErrors.slice(0, 3).join(" | ") || "0");
    step("Runtime Error", pageErrors.length === 0, pageErrors.join(" | ") || "0");

    const failed = checks.filter((c) => !c.ok);
    if (failed.length) {
      console.error("RC1 Print Freeze QA FAILED", failed);
      process.exitCode = 1;
    } else {
      console.log("RC1 Print Freeze QA: PASS");
    }
  } catch (err) {
    console.error("RC1 Print Freeze QA error:", err.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main();
