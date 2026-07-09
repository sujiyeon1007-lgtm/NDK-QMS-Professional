/**
 * Company Workspace stabilization QA (Sprint 11)
 * Run: node scripts/verify-company-workspace-qa.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = process.env.QA_BASE_URL || "http://localhost:4173";

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
  await page.locator(".company-workspace-section-page").waitFor({ state: "attached", timeout: 10000 });
  await expectHealthyPage(page, label);
  assert(
    (await page.locator(".company-workspace-section-page").count()) > 0,
    label + ": section placeholder missing"
  );
  assert((await page.locator(".company-workspace-back-link").count()) > 0, label + ": workspace back link missing");
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

  await gotoWorkspace(page, "/company/dashboard");
  await expectLauncherHome(page, "direct /company/dashboard");
  results.push({ check: "direct /company/dashboard", ok: true });

  await reloadWorkspace(page);
  await expectLauncherHome(page, "F5 /company/dashboard");
  results.push({ check: "F5 /company/dashboard", ok: true });

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

  await gotoWorkspace(page, "/company/dashboard");
  const launcherCards = page.locator(".company-launcher-grid .company-launcher-card");
  const launcherCount = await launcherCards.count();
  assert(launcherCount === 8, "expected 8 launcher cards, got " + launcherCount);
  for (let i = 0; i < launcherCount; i += 1) {
    const card = launcherCards.nth(i);
    const label = ((await card.innerText()) || "").trim().split("\n")[0];
    const href = await card.getAttribute("href");
    assert(href, "launcher card missing href: " + label);
    await card.click();
    await page.waitForURL((url) => url.pathname === new URL(href, BASE).pathname, { timeout: 10000 });
    await page.waitForTimeout(800);
    await expectSectionPlaceholder(page, "launcher click " + (i + 1) + " " + label);
    results.push({ check: "launcher click " + label, ok: true, url: page.url() });
    await gotoWorkspace(page, "/company/dashboard");
  }

  const tabs = page.locator("nav.company-workspace-nav a");
  const tabCount = await tabs.count();
  assert(tabCount === 9, "expected 9 top tabs, got " + tabCount);
  for (let i = 0; i < tabCount; i += 1) {
    const tab = tabs.nth(i);
    const label = ((await tab.innerText()) || "").trim();
    await tab.click();
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(500);
    if (i === 0) {
      await expectLauncherHome(page, "tab click " + (i + 1) + " " + label);
    } else {
      await expectSectionPlaceholder(page, "tab click " + (i + 1) + " " + label);
    }
    results.push({ check: "tab click " + label, ok: true, url: page.url() });
  }

  await browser.close();

  const uniqueConsole = [...new Set(consoleErrors)].filter(
    (line) => !line.includes("favicon") && !line.includes("DevTools")
  );
  const uniquePageErrors = [...new Set(errors)];

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

  console.log("Company Workspace QA passed");
  console.log("   base=" + BASE + " | checks=" + results.length);
  for (const row of results) {
    console.log("   - " + row.check + (row.url ? " -> " + row.url : ""));
  }
}

main().catch((err) => {
  console.error("Company Workspace QA failed:", err.message);
  process.exit(1);
});
