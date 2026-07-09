const { chromium } = require("playwright");

const BASE = process.env.TITAN_BASE_URL || "http://localhost:5174";
const routes = [
  "/environment/dashboard",
  "/environment/users",
  "/environment/permissions",
  "/environment/menus",
  "/environment/menu-toggle",
  "/environment/numbering",
  "/environment/qr-settings",
  "/environment/backup",
  "/environment/notifications",
  "/environment/system",
];
const ERROR_BOUNDARY_SNIPPET = "\uC77C\uC2DC\uC801\uC778 \uC624\uB958";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function attachErrorHandlers(page, errors) {
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));
}

async function login(page) {
  await page.goto(BASE + "/login", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(500);
  if (!page.url().includes("/login")) return;
  if ((await page.locator('input[name="loginId"]').count()) === 0) {
    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 10000 });
    return;
  }
  await page.fill('input[name="loginId"]', "admin");
  await page.fill('input[name="password"]', "1234");
  await page.click('button[type="submit"]');
  const modal = page.locator(".titan-login-modal");
  if (await modal.isVisible().catch(() => false)) {
    await page.getByRole("button", { name: "\uB098\uC911\uC5D0" }).click();
  }
  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 20000 });
}

async function expectHealthyPage(page, label) {
  const bodyText = await page.locator("body").innerText();
  assert(bodyText.length > 200, label + ": page body too short (possible white screen)");
  assert(!bodyText.includes(ERROR_BOUNDARY_SNIPPET), label + ": error boundary visible");
  const rootText = (await page.locator("#root").innerText()).trim();
  assert(rootText.length > 50, label + ": #root empty or too short");
}

async function gotoWorkspace(page, route) {
  await page.goto(BASE + route, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(1000);
}

async function expectLauncherHome(page, label) {
  await page.locator(".company-launcher-grid").waitFor({ state: "attached", timeout: 30000 });
  await expectHealthyPage(page, label);
  assert((await page.locator(".company-workspace--home").count()) > 0, label + ": launcher home shell missing");
  assert((await page.locator(".company-launcher-grid .company-launcher-card").count()) === 9, label + ": expected 9 launcher cards");
}

async function expectSectionPlaceholder(page, label) {
  await page.locator(".company-workspace-section-page").waitFor({ state: "attached", timeout: 30000 });
  await expectHealthyPage(page, label);
  assert((await page.locator(".company-workspace-back-link").count()) > 0, label + ": workspace back link missing");
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const errors = [];

  const launcherPage = await browser.newPage();
  attachErrorHandlers(launcherPage, errors);
  await login(launcherPage);
  await gotoWorkspace(launcherPage, "/environment/dashboard");
  await expectLauncherHome(launcherPage, "/environment/dashboard");
  const launcherCount = await launcherPage.locator(".company-launcher-grid .company-launcher-card").count();
  for (let i = 0; i < launcherCount; i += 1) {
    await gotoWorkspace(launcherPage, "/environment/dashboard");
    const card = launcherPage.locator(".company-launcher-grid .company-launcher-card").nth(i);
    const label = ((await card.innerText()) || "").trim().split("\n")[0];
    const href = await card.getAttribute("href");
    assert(href, "launcher card missing href: " + label);
    await card.click();
    await launcherPage.waitForURL((url) => url.pathname === new URL(href, BASE).pathname, { timeout: 10000 });
    await launcherPage.waitForTimeout(1000);
    await expectSectionPlaceholder(launcherPage, "launcher click " + label);
    console.log("OK launcher " + label);
  }
  await launcherPage.close();

  for (const route of routes) {
    const page = await browser.newPage();
    attachErrorHandlers(page, errors);
    await login(page);
    await gotoWorkspace(page, route);
    if (route === "/environment/dashboard") {
      await expectLauncherHome(page, route);
    } else {
      await expectSectionPlaceholder(page, route);
    }
    console.log("OK " + route);
    await page.reload({ waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(1000);
    if (route === "/environment/dashboard") {
      await expectLauncherHome(page, "F5 " + route);
    } else {
      await expectSectionPlaceholder(page, "F5 " + route);
    }
    await page.close();
  }

  const uniqueErrors = [...new Set(errors)].filter(
    (line) => !line.includes("favicon") && !line.includes("DevTools")
  );
  console.log("CONSOLE_ERRORS:", uniqueErrors.length);
  if (uniqueErrors.length) console.log(uniqueErrors.join("\n"));
  await browser.close();
  process.exit(uniqueErrors.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
