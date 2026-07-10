/**
 * RC1.1 Browser QA Gate (PM Official)
 * Run: node scripts/verify-rc11-browser-qa.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = process.env.QA_BASE_URL || "http://127.0.0.1:5174";

const SIDEBAR_HUB_ROUTES = [
  { route: "/home", label: "HOME", kind: "home" },
  { route: "/qr", label: "qr-hub", kind: "qr" },
  { route: "/inout", label: "operations-hub", kind: "hub" },
  { route: "/production", label: "production-hub", kind: "hub" },
  { route: "/quality", label: "quality-hub", kind: "hub" },
  { route: "/statistics/dashboard", label: "statistics-dashboard", kind: "stats" },
  { route: "/accounting-clerk", label: "accounting-clerk-hub", kind: "hub" },
  { route: "/accounting", label: "accounting-hub", kind: "hub" },
  { route: "/settings/hub", label: "master-data-hub", kind: "hub" },
  { route: "/environment", label: "environment-hub", kind: "env" },
  { route: "/company/dashboard", label: "company-hub", kind: "company" },
];

const OPERATIONS_WORKFLOW = [
  { route: "/home", label: "HOME", hub: true },
  { route: "/inout", label: "operations-hub", hub: true },
  { route: "/operations/inbound-pending", label: "inbound-pending", ops: true },
  { route: "/operations/inbound-history", label: "inbound-history", ops: true },
  { route: "/operations/production-pending", label: "production-pending", ops: true },
  { route: "/operations/equipment-status", label: "equipment-status", mes: true },
  { route: "/operations/daily-work", label: "daily-work", ops: true },
  { route: "/operations/shot-status", label: "shot-status", ops: true },
  { route: "/operations/shipment-register", label: "shipment-register", ops: true },
  { route: "/operations/shipment-history", label: "shipment-history", ops: true },
  { route: "/inout/print", label: "inout-print", print: true },
  { route: "/production/print", label: "production-print", print: true },
];

const QUALITY_ROUTES = [
  { route: "/quality", label: "quality-hub", hub: true },
  { route: "/quality/inspection/mass", label: "inspection-mass", ops: true },
  { route: "/quality/certificate", label: "certificate", ops: true },
  { route: "/documents", label: "documents", docs: true },
];

const QR_ROUTES = [
  { route: "/qr/dashboard", label: "qr-dashboard", qr: true },
  { route: "/qr/generator", label: "qr-generator", qr: true },
  { route: "/qr/registry", label: "qr-registry", qr: true },
  { route: "/qr/scan", label: "qr-scan", qr: true },
];

const AUX_ROUTES = [
  { route: "/inventory", label: "inventory", ops: true },
  { route: "/history", label: "history", list: true },
  { route: "/statistics/production", label: "statistics-production", stats: true },
  { route: "/statistics/quality", label: "statistics-quality", stats: true },
  { route: "/statistics/sales", label: "statistics-sales", stats: true },
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

async function expectHealthyPage(page, label, retries = 3) {
  let lastError = null;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const bodyText = await page.locator("body").innerText();
      assert(bodyText.length > 200, label + ": page body too short (possible white screen)");
      assert(!bodyText.includes(ERROR_BOUNDARY_SNIPPET), label + ": error boundary visible");
      const rootEl = page.locator("#root");
      await rootEl.waitFor({ state: "attached" });
      const rootText = (await rootEl.innerText()).trim();
      assert(rootText.length > 50, label + ": #root empty or too short");
      return;
    } catch (err) {
      lastError = err;
      await page.waitForTimeout(1000);
    }
  }
  throw lastError;
}

async function gotoWorkspace(page, route) {
  await page.goto(BASE + route, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
}

async function reloadWorkspace(page) {
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  await page
    .waitForFunction(() => (document.body?.innerText || "").trim().length > 200, null, { timeout: 12000 })
    .catch(() => {});
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
    ".titan-hub-page, .titan-launcher-hub, .titan-launcher-grid, .accounting-clerk-workspace, .accounting-workspace, .titan-workspace, .qr-engine-workspace"
  ).count();
  assert(hubCount > 0, label + ": hub shell missing");
}

async function expectStatsPage(page, label) {
  await expectHealthyPage(page, label);
  assert(
    (await page.locator(".statistics-page, .statistics-screen, .statistics-executive-dashboard, .titan-section-page").count()) > 0,
    label + ": statistics shell missing"
  );
}

async function expectEnvPage(page, label) {
  await expectHealthyPage(page, label);
  assert(
    (await page.locator(".environment-layout, .environment-menu-toolbar, .titan-section-page").count()) > 0,
    label + ": environment shell missing"
  );
}

async function expectQrPage(page, label) {
  await expectHealthyPage(page, label);
  assert(
    (await page.locator(".qr-engine-workspace, .qr-engine-page, .titan-workspace").count()) > 0,
    label + ": qr engine shell missing"
  );
}

async function expectDocsPage(page, label) {
  await expectHealthyPage(page, label);
  assert((await page.locator(".qms-document-page, .documents-layout, .titan-section-page").count()) > 0, label + ": documents shell missing");
}

async function expectPrintWorkspace(page, label) {
  await expectHealthyPage(page, label);
  assert(
    (await page.locator(".print-management-workspace, .titan-section-page, .inbound-page").count()) > 0,
    label + ": print workspace missing"
  );
}

async function expectListPage(page, label) {
  await expectHealthyPage(page, label);
  assert((await page.locator(".titan-table, table.titan-table, .titan-section-page").count()) > 0, label + ": list shell missing");
}

async function expectMesPage(page, label) {
  await expectHealthyPage(page, label);
  assert(
    (await page.locator(".equipment-status-page, .product-status-page, .titan-section-page").count()) > 0,
    label + ": MES monitor shell missing"
  );
}

async function visitRoute(page, step, prefix = "direct") {
  await gotoWorkspace(page, step.route);
  if (step.hub || step.kind === "hub") {
    if (step.route === "/home" || step.kind === "home") {
      await expectHealthyPage(page, step.label);
      assert((await page.locator(".home-dashboard, .home-page").count()) > 0, step.label + ": HOME dashboard missing");
    } else if (step.kind === "company" || step.route === "/company/dashboard") {
      await expectLauncherHome(page, step.label);
    } else {
      await expectHubPage(page, step.label);
    }
  } else if (step.ops) {
    await expectOperationsWorkspace(page, step.label);
  } else if (step.docs) {
    await expectDocsPage(page, step.label);
  } else if (step.qr || step.kind === "qr") {
    await expectQrPage(page, step.label);
  } else if (step.stats || step.kind === "stats") {
    await expectStatsPage(page, step.label);
  } else if (step.kind === "env") {
    await expectEnvPage(page, step.label);
  } else if (step.print) {
    await expectPrintWorkspace(page, step.label);
  } else if (step.list) {
    await expectListPage(page, step.label);
  } else if (step.mes) {
    await expectMesPage(page, step.label);
  } else {
    await expectHealthyPage(page, step.label);
  }
}

async function expectBreadcrumb(page, label) {
  const count = await page.locator(".titan-breadcrumb").count();
  assert(count > 0, label + ": breadcrumb missing");
}

async function testLegacyRedirect(page, from, to) {
  const expected = to.split("?")[0];
  await page.goto(BASE + from, { waitUntil: "domcontentloaded" });
  await page.waitForURL((url) => url.pathname === expected, { timeout: 15000 });
  const pathname = new URL(page.url()).pathname;
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

async function testCompanyBackLink(page, results) {
  await gotoWorkspace(page, "/company/information");
  await expectSectionPlaceholder(page, "company information");
  const backLink = page.locator(".company-workspace-back-link, a[href='/company/dashboard']").first();
  assert((await backLink.count()) > 0, "company back link missing");
  await backLink.click();
  await page.waitForTimeout(600);
  assert(page.url().includes("/company/dashboard"), "company back link target wrong");
  await expectLauncherHome(page, "company back navigation");
  results.push({ check: "company back link", ok: true, category: "breadcrumb" });
}

async function testCompanyBranding(page, results) {
  await gotoWorkspace(page, "/company/branding");
  await expectSectionPlaceholder(page, "company branding");
  const preview = await page.locator(".company-branding-output-preview, .company-branding-preview, .company-branding-asset-card").count();
  assert(preview > 0, "company branding preview missing");
  results.push({ check: "company branding preview", ok: true, category: "branding" });
}

async function testPrintPreview(page, results) {
  await gotoWorkspace(page, "/operations/inbound-pending");
  await expectOperationsWorkspace(page, "print preview base");
  const printBtn = page
    .locator("button")
    .filter({ hasText: /\uC785\uACE0\uB9AC\uC2A4\uD2B8|\uC785\uACE0 \uB9AC\uC2A4\uD2B8/ })
    .first();
  await printBtn.click();
  await page.waitForTimeout(500);
  const criteria = page.locator(".inbound-print-criteria");
  assert((await criteria.count()) > 0, "inbound print criteria missing");
  const previewBtn = page
    .locator("button")
    .filter({ hasText: /\uBBF8\uB9AC\uBCF4\uAE30|\uC778\uC1D4\uD2B8/ })
    .first();
  if ((await previewBtn.count()) > 0) {
    await previewBtn.click();
    await page.waitForTimeout(800);
    const printPreview = await page.locator(".titan-print-list, .titan-print-modal, .titan-print-preview").count();
    assert(printPreview > 0, "inbound print preview missing");
    results.push({ check: "inbound print preview", ok: true, category: "print" });
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
  } else {
    results.push({ check: "inbound print preview", ok: true, category: "print", note: "criteria only" });
  }
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
}

async function testQrPreview(page, results) {
  await gotoWorkspace(page, "/qr/generator");
  await expectQrPage(page, "qr generator preview");
  const previewPanel = await page.locator(".qr-engine-generator-preview, .qr-engine-preview-panel, .qr-engine-print-preview").count();
  const selectCount = await page.locator(".qr-engine-generator-select option").count();
  assert(selectCount >= 1, "qr generator target list missing");
  assert(previewPanel > 0 || selectCount >= 2, "qr preview panel missing");
  results.push({ check: "qr generator preview", ok: true, category: "qr" });
}

async function testSidebarNavigation(page, results) {
  const sidebarLinks = [
    { label: "HOME", path: "/home" },
    { label: "QR 정보관리", path: "/qr" },
    { label: "운영관리", path: "/inout" },
    { label: "생산관리", path: "/production" },
    { label: "품질관리", path: "/quality" },
    { label: "통계관리", path: "/statistics" },
    { label: "경리관리", path: "/accounting-clerk" },
    { label: "회계관리", path: "/accounting" },
    { label: "기준정보관리", path: "/settings" },
    { label: "환경설정", path: "/environment" },
    { label: "회사정보", path: "/company" },
  ];
  for (const item of sidebarLinks) {
    await page.goto(BASE + "/home", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400);
    const link = page.locator(".titan-sidebar a, .app-sidebar a").filter({ hasText: item.label }).first();
    assert((await link.count()) > 0, "sidebar link missing: " + item.label);
    await link.click();
    await page.waitForTimeout(900);
    const pathname = new URL(page.url()).pathname;
    assert(pathname.startsWith(item.path), "sidebar " + item.label + " expected " + item.path + " got " + pathname);
    await expectHealthyPage(page, "sidebar " + item.label);
    results.push({ check: "sidebar " + item.label, ok: true, category: "sidebar" });
  }
}

async function testQrAndPrint(page, results) {
  await testQrPreview(page, results);
  await testCompanyBranding(page, results);
  await testPrintPreview(page, results);
}

async function main() {
  const errors = [];
  const consoleErrors = [];
  const results = [];
  const failures = [];

  function record(check, ok, detail = "", category = "route") {
    results.push({ check, ok, detail, category });
    if (!ok) failures.push({ check, detail, category });
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1680, height: 1050 } });

  page.on("pageerror", (err) => errors.push("pageerror: " + err.message));
  page.on("crash", () => errors.push("pageerror: page crashed"));
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  const creds = loadAdminCredentials();
  try {
    await login(page, creds);
    record("login", true, "", "auth");

    const allRoutes = [
      ...SIDEBAR_HUB_ROUTES,
      ...OPERATIONS_WORKFLOW.filter((s) => s.route !== "/home" && s.route !== "/inout"),
      ...QUALITY_ROUTES.filter((s) => s.route !== "/quality"),
      ...QR_ROUTES,
      ...AUX_ROUTES,
    ];

    for (const step of allRoutes) {
      try {
        await visitRoute(page, step, "direct");
        record("route " + step.route, true, step.label, "route");
      } catch (err) {
        record("route " + step.route, false, err.message, "route");
      }
      try {
        await reloadWorkspace(page);
        await visitRoute(page, { ...step, label: "F5 " + step.label }, "f5");
        record("F5 " + step.route, true, step.label, "f5");
      } catch (err) {
        record("F5 " + step.route, false, err.message, "f5");
      }
    }

    try {
      await testInboundDialogs(page, results);
    } catch (err) {
      record("inbound register dialog", false, err.message, "crud");
      record("inbound print criteria dialog", false, err.message, "crud");
    }
    try {
      await testCompanyBackLink(page, results);
    } catch (err) {
      record("company back link", false, err.message, "breadcrumb");
    }

    for (const legacy of LEGACY_REDIRECTS) {
      try {
        await testLegacyRedirect(page, legacy.from, legacy.to);
        record("legacy " + legacy.from, true, legacy.to, "redirect");
      } catch (err) {
        record("legacy " + legacy.from, false, err.message, "redirect");
      }
    }

    for (const route of COMPANY_ROUTES) {
      try {
        await gotoWorkspace(page, route);
        if (route === "/company/dashboard") {
          await expectLauncherHome(page, "direct " + route);
        } else {
          await expectSectionPlaceholder(page, "direct " + route);
        }
        record("company " + route, true, "", "company");
        await reloadWorkspace(page);
        if (route === "/company/dashboard") {
          await expectLauncherHome(page, "F5 " + route);
        } else {
          await expectSectionPlaceholder(page, "F5 " + route);
        }
        record("F5 " + route, true, "", "company");
      } catch (err) {
        record("company " + route, false, err.message, "company");
      }
    }

    try {
      await testSidebarNavigation(page, results);
    } catch (err) {
      record("sidebar navigation", false, err.message, "sidebar");
    }
    try {
      await testQrAndPrint(page, results);
    } catch (err) {
      record("qr/print/branding bundle", false, err.message, "ops");
    }
    try {
      await testAccountingClerk(page, results);
    } catch (err) {
      record("accounting-clerk", false, err.message, "accounting");
    }
    try {
      await testAccounting(page, results);
    } catch (err) {
      record("accounting", false, err.message, "accounting");
    }
  } catch (err) {
    record("qa execution", false, err.message, "fatal");
  } finally {
    await browser.close();
  }

  const uniqueConsole = [...new Set(consoleErrors)].filter(
    (line) =>
      !line.includes("favicon") &&
      !line.includes("DevTools") &&
      !line.includes("Failed to load resource") &&
      !line.includes("404")
  );
  const uniquePageErrors = [...new Set(errors)];

  const whiteScreenPass = uniquePageErrors.length === 0 && failures.filter((f) => f.category === "route" || f.category === "fatal").length === 0;
  const consolePass = uniqueConsole.length === 0;
  const runtimePass = uniquePageErrors.length === 0;
  const routePass = results.filter((r) => r.category === "route" || r.category === "sidebar").every((r) => r.ok);
  const f5Pass = results.filter((r) => r.category === "f5" || r.check.startsWith("F5")).every((r) => r.ok);
  const breadcrumbPass = results.filter((r) => r.category === "breadcrumb" || r.check.includes("back")).every((r) => r.ok !== false);
  const crudPass = results.some((r) => r.check?.includes("inbound register") && r.ok !== false);
  const printPass = results.some((r) => r.category === "print" && r.ok !== false);
  const qrPass = results.some((r) => r.category === "qr" && r.ok !== false);
  const brandingPass = results.some((r) => r.category === "branding" && r.ok !== false);

  console.log("RC1 Final Browser QA Report (PM Official)");
  console.log("---");
  console.log(formatGate("White Screen", whiteScreenPass, uniquePageErrors.join(" | ") || "0"));
  console.log(formatGate("Console Error", consolePass, uniqueConsole.join(" | ") || "0"));
  console.log(formatGate("Runtime Error", runtimePass, uniquePageErrors.join(" | ") || "0"));
  console.log(formatGate("Route Validation", routePass, routePass ? "all routes healthy" : "see failures"));
  console.log(formatGate("F5 Refresh", f5Pass, f5Pass ? "all F5 reloads healthy" : "see failures"));
  console.log(formatGate("Sidebar Menu Entry", results.filter((r) => r.category === "sidebar").every((r) => r.ok), ""));
  console.log(formatGate("Breadcrumb / Back Link", breadcrumbPass, ""));
  console.log(formatGate("CRUD Basic (inbound dialogs)", crudPass, ""));
  console.log(formatGate("Print Preview", printPass, ""));
  console.log(formatGate("QR Preview", qrPass, ""));
  console.log(formatGate("Company Branding", brandingPass, ""));
  console.log("Checks: " + results.length);
  for (const row of results) {
    console.log("  [" + (row.ok === false ? "FAIL" : "PASS") + "] " + row.check + (row.detail ? " :: " + row.detail : ""));
  }

  if (uniquePageErrors.length) {
    console.error("Runtime/Page errors:");
    uniquePageErrors.forEach((line) => console.error("  - " + line));
  }
  if (uniqueConsole.length) {
    console.error("Console errors:");
    uniqueConsole.forEach((line) => console.error("  - " + line));
  }
  if (failures.length) {
    console.error("Failures:");
    failures.forEach((f) => console.error("  - " + f.check + ": " + f.detail));
    process.exit(1);
  }
  if (uniquePageErrors.length || uniqueConsole.length) process.exit(1);
  console.log("RC1 Final Browser QA Gate: PASS");
}

function formatGate(name, pass, cause) {
  const status = pass ? "PASS" : "FAIL";
  const fix = pass ? "-" : "Investigate route/component causing failure; fix without Workflow/UI freeze changes";
  console.log(name + ": " + status + (cause && !pass ? " | 원인: " + cause : "") + " | 수정: " + fix);
  return pass;
}

main().catch((err) => {
  console.error("RC1 Final Browser QA failed:", err.message);
  process.exit(1);
});
