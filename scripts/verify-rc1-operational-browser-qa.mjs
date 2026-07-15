/**
 * P0-UI-002 — equipment card single-click browser verification
 * Run: QA_BASE_URL=http://127.0.0.1:5175 node scripts/p0-ui-002-click-test.mjs
 */
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const BASE = process.env.QA_BASE_URL || "http://127.0.0.1:5175";
const ROUTE = "/operations/equipment-status";

const results = [];
function step(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? ` :: ${detail}` : ""}`);
}

function readLoginCreds() {
  const source = readFileSync(path.join(root, "src/config/titanLoginSystem.js"), "utf8");
  const loginId = source.match(/loginId:\s*"([^"]+)"/)?.[1] ?? "admin";
  const password = source.match(/defaultPassword:\s*"([^"]+)"/)?.[1] ?? "1234";
  return { loginId, password };
}

async function login(page, { loginId, password }) {
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
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

let browser;
let page;

try {
  browser = await chromium.launch({ headless: true });
  page = await browser.newPage();

  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  let reloadCount = 0;
  page.on("load", () => {
    reloadCount += 1;
  });

  await login(page, readLoginCreds());

  await page.goto(`${BASE}${ROUTE}`, { waitUntil: "networkidle", timeout: 60000 });
  const urlBefore = page.url();
  step("page loads equipment-status route", page.url().includes("equipment-status"), urlBefore);

  await page.waitForSelector(".control-room-equipment-card", { timeout: 30000 });
  const cardCount = await page.locator(".control-room-equipment-card").count();
  step(".control-room-equipment-card visible", cardCount > 0, `count=${cardCount}`);

  await page.evaluate(() => {
    window.__p0Ui002Marker = "alive";
  });

  const loadsBeforeClick = reloadCount;
  await page.locator(".control-room-equipment-card").first().click({ timeout: 10000 });
  await page.waitForTimeout(800);

  const urlAfter = page.url();
  step("URL unchanged after click", urlAfter === urlBefore, `before=${urlBefore} after=${urlAfter}`);

  const markerAlive = await page.evaluate(() => window.__p0Ui002Marker === "alive");
  step(
    "no document reload (marker alive, load count unchanged)",
    reloadCount === loadsBeforeClick && markerAlive,
    `loads before=${loadsBeforeClick} after=${reloadCount} marker=${markerAlive}`
  );

  const muiDialog = await page.locator(".MuiDialog-root").count();
  const roleDialog = await page.locator('[role="dialog"]').count();
  const dialogVisible = muiDialog > 0 || roleDialog > 0;
  step(
    "MuiDialog or role=dialog visible",
    dialogVisible,
    `MuiDialog-root=${muiDialog} role=dialog=${roleDialog}`
  );

  step("console errors = 0", consoleErrors.length === 0, consoleErrors.slice(0, 3).join(" | "));

  const exitCode = results.every((r) => r.ok) ? 0 : 1;
  console.log(
    `\nP0-UI-002 Click Test: ${exitCode === 0 ? "PASS" : "FAIL"} (${results.filter((r) => r.ok).length}/${results.length})`
  );
  process.exit(exitCode);
} catch (error) {
  console.error("FATAL", error);
  process.exit(1);
} finally {
  await page?.close().catch(() => {});
  await browser?.close().catch(() => {});
}
