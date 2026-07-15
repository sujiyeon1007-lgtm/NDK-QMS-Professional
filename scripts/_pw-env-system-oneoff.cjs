const { chromium } = require("playwright");
const BASE = "http://localhost:5173";
function pass(name, ok, detail = "") {
  console.log((ok ? "PASS" : "FAIL") + " | " + name + (detail ? " | " + detail : ""));
  return ok;
}
(async () => {
  let browser;
  let allOk = true;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(BASE + "/login", { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(500);
    await page.fill('input[name="loginId"]', "admin");
    await page.fill('input[name="password"]', "1234");
    await page.click('button[type="submit"]');
    const modal = page.locator(".titan-login-modal");
    if (await modal.isVisible().catch(() => false)) {
      await page.getByRole("button", { name: "\uB098\uC911\uC5D0" }).click();
    }
    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 20000 });
    if (!pass("Login admin/1234", !page.url().includes("/login"), page.url())) allOk = false;

    await page.goto(BASE + "/environment/system", { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(800);
    const bodyText = await page.locator("body").innerText();
    if (!pass('Body contains "1.3.0 RC1"', bodyText.includes("1.3.0 RC1"))) allOk = false;

    const dataTab = page.locator("a, button").filter({ hasText: "\uB370\uC774\uD130 \uAD00\uB9AC" });
    const tabCount = await dataTab.count();
    if (!pass('Nav has "\uB370\uC774\uD130 \uAD00\uB9AC" tab', tabCount >= 1 || bodyText.includes("\uB370\uC774\uD130 \uAD00\uB9AC"), "count=" + tabCount)) allOk = false;

    await page.goto(BASE + "/environment/data", { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(800);
    const resetCount = await page.locator("button").filter({ hasText: "\uCD08\uAE30\uD654" }).count();
    if (!pass("Reset buttons count >= 3", resetCount >= 3, "count=" + resetCount)) allOk = false;

    process.exitCode = allOk ? 0 : 1;
  } catch (e) {
    console.error("ERROR:", e.message);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
  }
})();
