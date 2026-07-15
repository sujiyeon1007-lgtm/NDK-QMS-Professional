const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const BASE = "http://localhost:5173";
  await page.goto(BASE + "/login", { waitUntil: "networkidle", timeout: 60000 });
  console.log("named", await page.locator("input[name=loginId]").count());
  console.log("label", await page.getByLabel("ID").count());
  await page.getByLabel("ID").fill("admin");
  await page.getByLabel("PASSWORD").fill("1234");
  await page.getByRole("button", { name: "LOGIN" }).click();
  await page.waitForTimeout(1500);
  const later = page.getByRole("button", { name: "\uB098\uC911\uC5D0" });
  if (await later.count()) await later.click();
  await page.waitForTimeout(4000);
  console.log("url", page.url(), "chrome", await page.locator(".titan-app-chrome").count());
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
