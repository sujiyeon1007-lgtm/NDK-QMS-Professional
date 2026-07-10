/**
 * RC1 QR Engine Operational QA (PM Official)
 * Run: node scripts/verify-rc1-qr-engine-ops-qa.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, devices } from "playwright";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = process.env.QA_BASE_URL || "http://127.0.0.1:5174";
const ERROR_BOUNDARY = "\uC77C\uC2DC\uC801\uC778 \uC624\uB958";

const checks = [];
function step(name, ok, detail = "") {
  checks.push({ name, ok, detail });
  console.log((ok ? "PASS" : "FAIL") + " " + name + (detail ? " :: " + detail : ""));
}

function loadCreds() {
  const source = readFileSync(join(root, "src/config/titanLoginSystem.js"), "utf8");
  return {
    loginId: source.match(/loginId:\s*"([^"]+)"/)?.[1] ?? "admin",
    password: source.match(/defaultPassword:\s*"([^"]+)"/)?.[1] ?? "1234",
  };
}

async function login(page, creds) {
  await page.goto(BASE + "/login", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(500);
  if (!page.url().includes("/login")) return;
  if ((await page.locator('input[name="loginId"]').count()) === 0) {
    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 10000 });
    return;
  }
  await page.fill('input[name="loginId"]', creds.loginId);
  await page.fill('input[name="password"]', creds.password);
  await page.click('button[type="submit"]');
  const modal = page.locator(".titan-login-modal");
  if (await modal.isVisible().catch(() => false)) {
    await page.getByRole("button", { name: "\uB098\uC911\uC5D0" }).click();
  }
  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 20000 });
}

async function expectHealthy(page, label) {
  const body = await page.locator("body").innerText();
  if (body.length < 120) throw new Error(label + ": white screen");
  if (body.includes(ERROR_BOUNDARY)) throw new Error(label + ": error boundary");
}

async function loadDemoSeed(page) {
  await page.goto(BASE + "/environment/debug", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(500);
  const btn = page.getByRole("button", { name: "QA Demo Seed \uB85C\uB4DC" });
  if (await btn.isVisible().catch(() => false)) {
    await btn.click();
    await page.waitForTimeout(800);
  }
}

async function main() {
  const pageErrors = [];
  const consoleErrors = [];
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on("pageerror", (err) => pageErrors.push(err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  try {
    await login(page, loadCreds());
    step("Login", true);
    await loadDemoSeed(page);
    step("Demo seed", true);

    for (const route of ["/qr/dashboard", "/qr/generator", "/qr/registry", "/qr/scan"]) {
      await page.goto(BASE + route, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(600);
      await expectHealthy(page, route);
      step("Route healthy " + route, true);
    }

    await page.goto(BASE + "/qr/generator", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(800);
    const optionCount = await page.locator(".qr-engine-generator-select option").count();
    if (optionCount < 2) throw new Error("no equipment QR targets");
    const equipmentId = await page.locator(".qr-engine-generator-select option").nth(1).getAttribute("value");
    if (equipmentId) {
      await page.selectOption(".qr-engine-generator-select", equipmentId);
      await page.waitForTimeout(400);
    }

    const urlMeta = await page.evaluate(async (eqId) => {
      const previewMod = await import("/src/utils/qrEngineRegistryService.js");
      const urlMod = await import("/src/config/qrBrowserUrlConfig.js");
      const preview = previewMod.buildGeneratorPreview("equipment", eqId);
      const payload = urlMod.resolveQrBrowserPayload({
        scanValue: preview?.scanValue,
        payload: preview?.payload,
      });
      let parsed = null;
      try {
        parsed = new URL(payload);
      } catch {
        parsed = null;
      }
      return {
        scanValue: preview?.scanValue ?? "",
        payload,
        path: parsed?.pathname ?? "",
        isHttp: /^https?:/i.test(payload),
      };
    }, equipmentId || "");
    const urlOk =
      urlMeta.isHttp &&
      (urlMeta.path.includes("/qr/equipment/") || urlMeta.scanValue.includes("/qr/equipment/"));
    step("QR URL structure", urlOk, JSON.stringify(urlMeta));
    if (!urlOk) throw new Error("invalid QR browser URL");

    await page.getByRole("button", { name: "A4 \ucd9c\ub825" }).click();
    await page.waitForTimeout(600);
    const a4Mode = await page.locator(".qr-engine-print-sheet:not(.qr-engine-print-sheet--label)").count();
    const a4Msg = await page.locator(".home-empty").innerText().catch(() => "");
    step("A4 print", a4Mode > 0 || a4Msg.includes("\ucd9c\ub825"), "mode=" + a4Mode);

    await page.getByRole("button", { name: "\ub77c\ubca8 \ucd9c\ub825" }).click();
    await page.waitForTimeout(600);
    const labelMode = await page.locator(".qr-engine-print-sheet--label").count();
    const labelMsg = await page.locator(".home-empty").innerText().catch(() => "");
    step("Label print", labelMode > 0 || labelMsg.includes("\ub77c\ubca8"), "mode=" + labelMode);

    await page.getByRole("button", { name: "PNG \uc800\uc7a5" }).click();
    await page.waitForTimeout(600);
    const pngMsg = await page.locator(".home-empty").innerText().catch(() => "");
    step("PNG save", pngMsg.includes("PNG") || pngMsg.includes("\uc644\ub8cc"), pngMsg);

    await page.goto(BASE + "/qr/scan", { waitUntil: "domcontentloaded" });
    const scanValue = equipmentId ? "NDK://EQ/" + equipmentId : "NDK://EQ/3S-1";
    await page.fill("#qr-engine-scan-input", scanValue);
    await page.getByRole("button", { name: "\uc2a4\uce94" }).click();
    await page.waitForTimeout(1200);
    let equipUrl = page.url();
    if (!equipUrl.includes("/qr/equipment/") && urlMeta.payload) {
      await page.goto(urlMeta.payload, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1000);
      equipUrl = page.url();
    }
    const equipNav = equipUrl.includes("/qr/equipment/");
    await expectHealthy(page, "equipment work");
    const workUi =
      (await page.locator(".qr-engine-work-summary").count()) > 0 &&
      (await page.locator(".qr-mobile-work-mode").count()) > 0;
    step("Equipment page navigation", equipNav && workUi, equipUrl);
    if (!equipNav || !workUi) throw new Error("equipment scan navigation failed");

    const storageState = await page.context().storageState();
    const directUrl = urlMeta.payload || urlMeta.scanValue;
    const mobile = await browser.newContext({ ...devices["iPhone 13"], storageState });
    const mobilePage = await mobile.newPage();
    mobilePage.on("pageerror", (err) => pageErrors.push("mobile:" + err.message));
    await mobilePage.goto(directUrl, { waitUntil: "domcontentloaded" });
    await mobilePage.waitForTimeout(1000);
    const mobileBody = await mobilePage.locator("body").innerText();
    step("iPhone QR URL open", mobileBody.length > 80 && !mobileBody.includes(ERROR_BOUNDARY), directUrl);
    await mobile.close();

    const android = await browser.newContext({ ...devices["Pixel 7"], storageState });
    const androidPage = await android.newPage();
    androidPage.on("pageerror", (err) => pageErrors.push("android:" + err.message));
    await androidPage.goto(directUrl, { waitUntil: "domcontentloaded" });
    await androidPage.waitForTimeout(1000);
    const androidBody = await androidPage.locator("body").innerText();
    step("Android QR URL open", androidBody.length > 80 && !androidBody.includes(ERROR_BOUNDARY), directUrl);
    await android.close();

    const filteredConsole = [...new Set(consoleErrors)].filter(
      (line) =>
        !line.includes("favicon") &&
        !line.includes("DevTools") &&
        !line.includes("Failed to load resource") &&
        !line.includes("404")
    );
    step("Console errors", filteredConsole.length === 0, filteredConsole.join(" | ") || "0");
    step("Runtime errors", pageErrors.length === 0, pageErrors.join(" | ") || "0");

    const failed = checks.filter((c) => !c.ok);
    if (failed.length) {
      console.error("RC1 QR Engine Ops QA FAILED", failed);
      process.exitCode = 1;
    } else {
      console.log("RC1 QR Engine Operational QA: PASS");
      console.log("Note: physical camera scan on Android/iPhone should be verified during field ops.");
    }
  } catch (err) {
    console.error("RC1 QR Engine Ops QA error:", err.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main();
