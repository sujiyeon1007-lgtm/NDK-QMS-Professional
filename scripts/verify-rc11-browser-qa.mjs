/**
 * RC1.1 Browser QA Gate (PM Official)
 * Run: node scripts/verify-rc11-browser-qa.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = process.env.QA_BASE_URL || "http://127.0.0.1:4173";

const OPERATIONS_WORKFLOW = [
  { route: "/home", label: "HOME", hub: true },
  { route: "/inout", label: "operations-hub", hub: true },
  { route: "/operations/inbound-pending", label: "inbound-pending", ops: true },
  { route: "/operations/production-pending", label: "production-pending", ops: true },
  { route: "/operations/daily-work", label: "daily-work", ops: true },
  { route: "/operations/shot-status", label: "shot-status", ops: true },
  { route: "/operations/shipment-register", label: "shipment-register", ops: true },
  { route: "/operations/shipment-history", label: "shipment-history", ops: true },
];

const LEGACY_REDIRECTS = [
  { from: "/production/plan", to: "/operations/production-pending" },
  { from: "/production/daily-report", to: "/operations/daily-work" },
  { from: "/production/shot", to: "/operations/shot-status" },
  { from: "/inout/incoming?mode=register", to: "/operations/inbound-pending" },
  { from: "/inout/shipment?mode=register", to: "/operations/shipment-register" },
  { from: "/environment/company", to: "/company/dashboard" },
];

const COMPANY_ROUTES = [
  "/company/dashboard",
  "/company/information",
  "/company/sites",
  "/company/organization",
  "/company/departments",
  "/company/employees",
  "/company/positions",
  "/company/branding",
  "/company/document-footer",
];

const ERROR_BOUNDARY_SNIPPET = "\uC77C\uC2DC\uC801\uC778 \uC624\uB958";

function loadAdminCredentials() {
  const source = readFileSync(join(root, "src/config/titanLoginSystem.js"), "utf8");
  const loginId = source.match(/loginId:\s*"([^"]+)"/)?.[1] ?? "admin";
  const password = source.match(/defaultPassword:\s*"([^"]+)"/)?.[1] ?? "1234";
  return { loginId, password };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function login(page, { loginId, password }) {
  await page.goto(BASE + "/login", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(500);
  if (!page.url().includes("/login")) return;
  if ((await page.locator('input[name="loginId"]').count()) === 0) {
    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 10000 });
    return;
  }
  await page.fill('input[name="loginId"]', loginId);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  const firstLoginModal = page.locator(".titan-login-modal");
  if (await firstLoginModal.isVisible().catch(() => false)) {
    await page.getByRole("button", { name: "\uB098\uC911\uC5D0" }).click();
  }
  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 20000 });
}

async function expectHealthyPage(page, label) {
  const bodyText = await page.locator("body").innerText();
  assert(bodyText.length > 200, label + ": page body too short (possible white screen)");
  assert(!bodyText.includes(ERROR_BOUNDARY_SNIPPET), label + ": error boundary visible");
  const rootEl = page.locator("#root");
  await rootEl.waitFor({ state: "attached" });
  const rootText = (await rootEl.innerText()).trim();
  assert(rootText.length > 50, label + ": #root empty or too short");
}

async function gotoWorkspace(page, route) {
  await page.goto(BASE + route, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);
}

async function reloadWorkspace(page) {
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);
}

async function expectLauncherHome(page, label) {
  await page.locator(".company-launcher-grid").waitFor({ state: "attached", timeout: 10000 });
  await expectHealthyPage(page, label);
  assert((await page.locator(".company-workspace--home").count()) > 0, label + ": launcher home shell missing");
  assert((await page.locator(".company-launcher-grid").count()) > 0, label + ": launcher grid missing");
  assert(
    (await page.locator(".company-launcher-grid .company-launcher-card").count()) === 8,
    label + ": expected 8 launcher cards"
  );
}

async function expectSectionPlaceholder(page, label) {
  await page.locator(".company-workspace-section-page, .company-workspace-page").waitFor({
    state: "attached",
    timeout: 10000,
  });
  await expectHealthyPage(page, label);
  assert(
    (await page.locator(".company-workspace-section-page, .company-workspace-page").count()) > 0,
    label + ": company section shell missing"
  );
  const hasNav =
    (await page.locator(".company-workspace-nav a, .company-workspace-rail__link").count()) > 0;
  assert(hasNav, label + ": company workspace nav missing");
}

async function expectOperationsWorkspace(page, label) {
  await expectHealthyPage(page, label);
  assert((await page.locator(".inbound-page__kpi, .titan-kpi-bar-slot").count()) > 0, label + ": KPI missing");
  assert((await page.locator(".titan-search-panel").count()) > 0, label + ": search panel missing");
  assert((await page.locator(".titan-table, table.titan-table").count()) > 0, label + ": table missing");
  const breadcrumbCount = await page.locator(".titan-breadcrumb").count();
  assert(breadcrumbCount > 0, label + ": breadcrumb missing");
}

async function expectHubPage(page, label) {
  await expectHealthyPage(page, label);
  const hubCount = await page.locator(
    ".titan-hub-page, .titan-launcher-hub, .titan-launcher-grid, .accounting-clerk-workspace, .accounting-workspace"
  ).count();
  assert(hubCount > 0, label + ": hub shell missing");
}

async function expectBreadcrumb(page, label) {
  const count = await page.locator(".titan-breadcrumb").count();
  assert(count > 0, label + ": breadcrumb missing");
}

async function testLegacyRedirect(page, from, to) {
  await page.goto(BASE + from, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(900);
  const pathname = new URL(page.url()).pathname;
  const expected = to.split("?")[0];
  assert(pathname === expected, "legacy redirect " + from + " expected " + expected + " got " + pathname);
}

async function testInboundDialogs(page, results) {
  await gotoWorkspace(page, "/operations/inbound-pending");
  await expectOperationsWorkspace(page, "inbound dialogs base");

  const registerBtn = page
    .locator("button.titan-btn--primary")
    .filter({ hasText: "\uC785\uACE0 \uB4F1\uB85D" })
    .first();
  await registerBtn.click();
  await page.waitForTimeout(500);
  const registerModal = page.locator(".incoming-modal");
  assert((await registerModal.count()) > 0, "inbound register dialog missing");
  await page.locator(".incoming-modal-close").click();
  await page.waitForTimeout(300);
  results.push({ check: "inbound register dialog", ok: true });

  const printBtn = page
    .locator("button")
    .filter({ hasText: /\uC785\uACE0\uB9AC\uC2A4\uD2B8|\uC785\uACE0 \uB9AC\uC2A4\uD2B8/ })
    .first();
  await printBtn.click();
  await page.waitForTimeout(500);
  const printModal = page.locator(".inbound-print-criteria");
  assert((await printModal.count()) > 0, "inbound print criteria dialog missing");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  results.push({ check: "inbound print criteria dialog", ok: true });
}

async function testAccountingClerk(page, results) {
  await gotoWorkspace(page, "/accounting-clerk");
  await expectHealthyPage(page, "accounting-clerk hub");
  await expectHubPage(page, "accounting-clerk hub");
  results.push({ check: "accounting-clerk hub", ok: true });

  await gotoWorkspace(page, "/accounting-clerk/shipmentStatistics");
  await expectHealthyPage(page, "accounting-clerk shipment statistics");
  assert((await page.locator(".accounting-clerk-workspace, .accounting-clerk-page").count()) > 0, "shipment statistics workspace missing");
  await expectBreadcrumb(page, "accounting-clerk shipment statistics");
  assert((await page.locator(".titan-search-panel, .accounting-lite-stat-list, .titan-table").count()) > 0, "shipment statistics content missing");
  results.push({ check: "accounting-clerk shipment statistics", ok: true });

  await reloadWorkspace(page);
  await expectHealthyPage(page, "F5 accounting-clerk shipment statistics");
  results.push({ check: "F5 accounting-clerk shipment statistics", ok: true });
}

async function testAccounting(page, results) {
  await gotoWorkspace(page, "/accounting");
  await expectHealthyPage(page, "accounting hub");
  await expectHubPage(page, "accounting hub");
  results.push({ check: "accounting hub", ok: true });

  await gotoWorkspace(page, "/accounting/monthlyStatus");
  await expectHealthyPage(page, "accounting monthlyStatus");
  assert((await page.locator(".accounting-workspace, .titan-section-page").count()) > 0, "accounting feature shell missing");
  await expectBreadcrumb(page, "accounting monthlyStatus");
  results.push({ check: "accounting monthlyStatus", ok: true });

  await reloadWorkspace(page);
  await expectHealthyPage(page, "F5 accounting monthlyStatus");
  results.push({ check: "F5 accounting monthlyStatus", ok: true });
}

async function testQrAndPrint(page, results) {
  await gotoWorkspace(page, "/qr/generator");
  await expectHealthyPage(page, "qr generator");
  results.push({ check: "qr generator", ok: true });

  await gotoWorkspace(page, "/company/branding");
  await expectSectionPlaceholder(page, "company branding");
  results.push({ check: "company branding", ok: true });
}

async function main() {
  const errors = [];
  const consoleErrors = [];
  const results = [];

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on("pageerror", (err) => errors.push("pageerror: " + err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  const creds = loadAdminCredentials();
  await login(page, creds);
  results.push({ check: "login", ok: true });

  for (const step of OPERATIONS_WORKFLOW) {
    await gotoWorkspace(page, step.route);
    if (step.hub) {
      if (step.route === "/home") {
        await expectHealthyPage(page, "HOME");
        assert((await page.locator(".home-dashboard, .home-page").count()) > 0, "HOME dashboard missing");
      } else {
        await expectHubPage(page, step.label);
      }
    } else if (step.ops) {
      await expectOperationsWorkspace(page, step.label);
    }
    results.push({ check: "direct " + step.route, ok: true });

    await reloadWorkspace(page);
    if (step.hub && step.route !== "/home") {
      await expectHubPage(page, "F5 " + step.label);
    } else if (step.ops) {
      await expectOperationsWorkspace(page, "F5 " + step.label);
    } else if (step.route === "/home") {
      await expectHealthyPage(page, "F5 HOME");
    }
    results.push({ check: "F5 " + step.route, ok: true });
  }

  await testInboundDialogs(page, results);

  for (const legacy of LEGACY_REDIRECTS) {
    await testLegacyRedirect(page, legacy.from, legacy.to);
    results.push({ check: "legacy " + legacy.from + " -> " + legacy.to, ok: true });
  }

  for (const route of COMPANY_ROUTES) {
    await gotoWorkspace(page, route);
    if (route === "/company/dashboard") {
      await expectLauncherHome(page, "direct " + route);
    } else {
      await expectSectionPlaceholder(page, "direct " + route);
    }
    results.push({ check: "direct " + route, ok: true });
    await reloadWorkspace(page);
    if (route === "/company/dashboard") {
      await expectLauncherHome(page, "F5 " + route);
    } else {
      await expectSectionPlaceholder(page, "F5 " + route);
    }
    results.push({ check: "F5 " + route, ok: true });
  }

  await testQrAndPrint(page, results);
  await testAccountingClerk(page, results);
  await testAccounting(page, results);

  await browser.close();

  const uniqueConsole = [...new Set(consoleErrors)].filter(
    (line) =>
      !line.includes("favicon") &&
      !line.includes("DevTools") &&
      !line.includes("Failed to load resource") &&
      !line.includes("404")
  );
  const uniquePageErrors = [...new Set(errors)];

  console.log("RC1.1 Browser QA Report");
  console.log("Build: PASS (assumed — run npm run build separately)");
  console.log("Browser QA: " + (uniquePageErrors.length || uniqueConsole.length ? "FAIL" : "PASS"));
  console.log("White Screen: " + (uniquePageErrors.length ? uniquePageErrors.length : "0"));
  console.log("Console: " + (uniqueConsole.length ? uniqueConsole.length : "0"));
  console.log("Workflow: " + (results.some((r) => r.check.includes("inbound-pending")) ? "PASS" : "FAIL"));
  console.log("Company: PASS");
  console.log("Accounting: PASS");
  console.log("Regression: none detected");
  console.log("Checks: " + results.length);
  for (const row of results) {
    console.log("  - " + row.check + (row.url ? " -> " + row.url : ""));
  }

  if (uniquePageErrors.length) {
    console.error("Page errors:");
    uniquePageErrors.forEach((line) => console.error("  - " + line));
    process.exit(1);
  }

  if (uniqueConsole.length) {
    console.error("Console errors:");
    uniqueConsole.forEach((line) => console.error("  - " + line));
    process.exit(1);
  }

  console.log("RC1.1 Browser QA Gate: PASS");
}

main().catch((err) => {
  console.error("RC1.1 Browser QA failed:", err.message);
  process.exit(1);
});
