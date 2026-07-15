const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto("http://localhost:5173/login", { waitUntil: "networkidle" });
  await page.fill('input[name="loginId"]', "admin");
  await page.fill('input[name="password"]', "1234");
  await page.click('button[type="submit"]');
  const modal = page.locator(".titan-login-modal");
  if (await modal.isVisible().catch(() => false)) {
    await page.getByRole("button", { name: "\uB098\uC911\uC5D0" }).click();
  }
  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 20000 });
  await page.goto("http://localhost:5173/company/dashboard", { waitUntil: "networkidle" });
  const home = {
    launcherOnly: await page.locator(".company-workspace-home--launcher-only").count(),
    launcherCards: await page.locator(".company-launcher-card").count(),
    introHidden: await page.locator(".company-workspace-header--home .company-workspace-header__intro").count(),
    kpiOnHome: await page.locator(".company-workspace-home--dashboard .company-kpi-row").count(),
    summaryOnHome: await page.locator(".company-workspace-home--dashboard .company-workspace-summary").count(),
    activityOnHome: await page.locator(".company-workspace-home--dashboard .company-workspace-activity").count(),
  };
  await page.goto("http://localhost:5173/company/information", { waitUntil: "networkidle" });
  const section = {
    kpiPlaceholder: await page.locator(".company-workspace-section-kpi").count(),
    searchPlaceholder: await page.locator(".company-workspace-section-search").count(),
    listPlaceholder: await page.locator(".company-workspace-section-list").count(),
    crudPlaceholder: await page.locator(".company-workspace-section-crud").count(),
  };
  console.log(JSON.stringify({ home, section }, null, 2));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
