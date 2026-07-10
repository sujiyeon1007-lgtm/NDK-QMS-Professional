const { chromium } = require("playwright");

const BASE = process.env.TITAN_BASE_URL || process.env.QA_BASE_URL || "http://localhost:5174";
const ERROR_BOUNDARY_SNIPPET = "\uC77C\uC2DC\uC801\uC778 \uC624\uB958";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function login(page) {
  await page.goto(BASE + "/login", { waitUntil: "domcontentloaded" });
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

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));

  await login(page);

  await page.goto(BASE + "/home", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(700);
  await expectHealthyPage(page, "/home");
  assert((await page.locator(".home-page").count()) > 0, "/home: home page shell missing");
  assert((await page.locator(".home-panel--today-summary .home-kpi-row").count()) > 0, "/home: KPI missing");
  assert(
    (await page.locator(".home-work-launcher__grid .home-work-launcher-card").count()) > 0,
    "/home: launcher cards missing"
  );

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(700);
  await expectHealthyPage(page, "F5 /home");

  const firstLauncher = page.locator(".home-work-launcher__grid .home-work-launcher-card").first();
  if ((await firstLauncher.count()) > 0) {
    await firstLauncher.click();
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(700);
    await expectHealthyPage(page, "HOME launcher navigation");
  }

  await browser.close();

  const uniqueErrors = [...new Set(errors)].filter(
    (line) => !line.includes("favicon") && !line.includes("DevTools")
  );
  if (uniqueErrors.length) {
    console.error("HOME Browser QA failed");
    uniqueErrors.forEach((line) => console.error("  - " + line));
    process.exit(1);
  }

  console.log("HOME Browser QA passed");
  console.log("   base=" + BASE);
})();
