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
  "/environment/data",
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
  assert((await page.locator(".company-launcher-grid .company-launcher-card").count()) === 10, label + ": expected 10 launcher cards (admin includes 데이터 관리)");
}

async function expectSectionPage(page, label) {
  await page.locator(".company-workspace-section-page").waitFor({ state: "attached", timeout: 30000 });
  await expectHealthyPage(page, label);
  const skeletonRows = await page.locator(".company-workspace-preparing__mock-row").count();
  assert(skeletonRows === 0, label + ": skeleton must not be used as empty state");
  const wiredPanel = await page.locator(".environment-content-panel").count();
  const emptyState = await page.locator(".titan-empty-state").count();
  assert(wiredPanel > 0 || emptyState > 0, label + ": expected wired panel or TitanEmptyState");
  const preparingTitle = await page.locator(".titan-empty-state__title").allTextContents();
  assert(
    !preparingTitle.some((text) => text.includes("\uC900\uBE44 \uC911")),
    label + ": Placeholder(준비 중) must not replace operational sections"
  );
}

async function expectRc1OperationalSection(page, route) {
  const body = await page.locator("body").innerText();
  if (route === "/environment/numbering") {
    assert(body.includes("HTL-YYYYMMDD"), route + ": numbering rules missing");
    assert(body.includes("LOT"), route + ": LOT numbering missing");
  }
  if (route === "/environment/qr-settings") {
    assert(body.includes("NDK://") || body.includes("Base URL"), route + ": QR settings missing");
  }
  if (route === "/environment/menu-toggle") {
    assert((await page.locator(".titan-module-switch").count()) > 0, route + ": module toggles missing");
  }
  if (route === "/environment/menus") {
    assert(body.includes("Menu Freeze") || body.includes("MENU_FREEZE") || body.includes("V1.5"), route + ": menu structure missing");
  }
  if (route === "/environment/backup") {
    assert(body.includes("\uC804\uCCB4 \uBC31\uC5C5") || body.includes("\uBC31\uC5C5"), route + ": backup actions missing");
  }
  if (route === "/environment/data") {
    assert(body.includes("\uB370\uC774\uD130 \uAD00\uB9AC"), route + ": data management title missing");
    assert(body.includes("Master \uB370\uC774\uD130 \uCD08\uAE30\uD654"), route + ": master reset button missing");
    assert(body.includes("\uC5C5\uBB34 \uB370\uC774\uD130 \uCD08\uAE30\uD654"), route + ": operations reset button missing");
    assert(body.includes("\uC804\uCCB4 \uCD08\uAE30\uD654"), route + ": full reset button missing");
    assert((await page.locator(".environment-backup-actions button").count()) >= 3, route + ": reset buttons missing");
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const errors = [];

  const launcherPage = await browser.newPage();
  attachErrorHandlers(launcherPage, errors);
  await login(launcherPage);
  await gotoWorkspace(launcherPage, "/environment/dashboard");
  await expectLauncherHome(launcherPage, "/environment/dashboard");
  const dashBody = await launcherPage.locator("body").innerText();
  assert(dashBody.includes("\uB370\uC774\uD130 \uAD00\uB9AC"), "/environment/dashboard: data launcher card missing");
  const dataNav = await launcherPage.locator(".titan-workspace-nav__link").allTextContents();
  assert(
    dataNav.some((t) => t.includes("\uB370\uC774\uD130 \uAD00\uB9AC")),
    "/environment/dashboard: data nav tab missing — got: " + dataNav.join("|")
  );

  await launcherPage.close();

  for (const route of routes) {
    const page = await browser.newPage();
    attachErrorHandlers(page, errors);
    await login(page);
    await gotoWorkspace(page, route);
    if (route === "/environment/dashboard") {
      await expectLauncherHome(page, route);
    } else {
      await expectSectionPage(page, route);
      await expectRc1OperationalSection(page, route);
    }
    console.log("OK " + route);
    await page.reload({ waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(1000);
    if (route === "/environment/dashboard") {
      await expectLauncherHome(page, "F5 " + route);
    } else {
      await expectSectionPage(page, "F5 " + route);
      await expectRc1OperationalSection(page, route);
    }
    await page.close();
  }

  const usersEmptyPage = await browser.newPage();
  attachErrorHandlers(usersEmptyPage, errors);
  await login(usersEmptyPage);
  await usersEmptyPage.evaluate(() => {
    const authKey = "project-titan-auth-data-v1";
    const raw = JSON.parse(localStorage.getItem(authKey) || "{}");
    localStorage.setItem(
      authKey,
      JSON.stringify({
        ...raw,
        users: [],
        userRoles: [],
      })
    );
  });
  await usersEmptyPage.reload({ waitUntil: "domcontentloaded", timeout: 60000 });
  await usersEmptyPage.waitForTimeout(1200);
  await gotoWorkspace(usersEmptyPage, "/environment/users");
  await usersEmptyPage.locator(".environment-content-panel").waitFor({ state: "attached", timeout: 15000 });
  const emptyCount = await usersEmptyPage.locator(".titan-empty-state").count();
  const tableCount = await usersEmptyPage.locator(".titan-table").count();
  if (!emptyCount) {
    const snippet = (await usersEmptyPage.locator("body").innerText()).slice(0, 400);
    throw new Error("users empty: TitanEmptyState missing (tables=" + tableCount + ") body=" + snippet);
  }
  const emptyTitle = await usersEmptyPage.locator(".titan-empty-state__title").first().innerText();
  assert(emptyTitle.includes("\uB4F1\uB85D\uB418\uC9C0 \uC54A\uC558"), "users empty: title missing — " + emptyTitle);
  assert((await usersEmptyPage.locator(".company-workspace-preparing__mock-row").count()) === 0, "users empty: skeleton visible");
  console.log("OK /environment/users empty (0 users)");

  const usersDataPage = await browser.newPage();
  attachErrorHandlers(usersDataPage, errors);
  await login(usersDataPage);
  await gotoWorkspace(usersDataPage, "/environment/users");
  await usersDataPage.locator(".environment-content-panel").waitFor({ state: "attached", timeout: 15000 });
  const hasTable = (await usersDataPage.locator(".titan-table").count()) > 0;
  const hasEmpty = (await usersDataPage.locator(".titan-empty-state").count()) > 0;
  assert(hasTable || hasEmpty, "users data: neither table nor empty state");
  if (!hasTable) {
    await usersDataPage.getByRole("button", { name: "Demo Admin \uC0DD\uC131" }).click();
    await usersDataPage.waitForTimeout(800);
    assert((await usersDataPage.locator(".titan-table").count()) > 0, "users data: table missing after Demo Admin");
  }
  console.log("OK /environment/users with data (1+ users)");

  const uniqueErrors = [...new Set(errors)].filter(
    (line) => !line.includes("favicon") && !line.includes("DevTools")
  );
  console.log("CONSOLE_ERRORS:", uniqueErrors.length);
  if (uniqueErrors.length) console.log(uniqueErrors.join("\n"));
  await browser.close();
  process.exit(uniqueErrors.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
