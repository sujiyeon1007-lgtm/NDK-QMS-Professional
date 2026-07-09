const { chromium } = require("playwright");
const { mkdirSync } = require("node:fs");
const { join } = require("node:path");

const BASE = process.env.TITAN_BASE_URL || "http://localhost:5174";
const OUT = join(__dirname, "..", "screenshots", "environment-dashboard-sprint12.png");

(async () => {
  mkdirSync(join(__dirname, "..", "screenshots"), { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.fill('input[name="loginId"]', "admin");
  await page.fill('input[name="password"]', "1234");
  await page.click('button[type="submit"]');
  const modal = page.locator(".titan-login-modal");
  if (await modal.isVisible().catch(() => false)) {
    await page.getByRole("button", { name: "\uB098\uC911\uC5D0" }).click();
  }
  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 20000 });
  await page.goto(`${BASE}/environment/dashboard`, { waitUntil: "networkidle" });
  await page.waitForSelector(".company-workspace-home--dashboard", { timeout: 15000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: OUT, fullPage: true });
  console.log("SCREENSHOT:", OUT);
  console.log("URL:", page.url());
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
