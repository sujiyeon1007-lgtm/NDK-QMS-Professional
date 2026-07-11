import { chromium } from "playwright";

const BASE = process.env.TITAN_QA_BASE_URL ?? "http://127.0.0.1:5174";
const AUTH_KEY = "project-titan-auth-session-v1";

const demoSession = {
  userId: "admin",
  loginId: "admin",
  name: "Program Administrator",
  roleId: "ROLE_PROGRAM_ADMIN",
  isProgramAdministrator: true,
  loggedInAt: new Date().toISOString(),
};

async function main() {
  const errors = [];
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`console: ${msg.text()}`);
  });

  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await page.evaluate(
    ({ key, session }) => {
      sessionStorage.setItem(key, JSON.stringify(session));
    },
    { key: AUTH_KEY, session: demoSession }
  );

  await page.goto(`${BASE}/home`, { waitUntil: "networkidle", timeout: 30000 });

  const result = {
    ok: false,
    url: page.url(),
    hasHomeShell: await page.locator(".home-page").count(),
    hasErrorBoundary: await page.locator(".titan-error-boundary").count(),
    hasSidebar: await page.locator(".titan-sidebar").count(),
    errors,
  };

  result.ok =
    result.url.includes("/home") &&
    result.hasHomeShell > 0 &&
    result.hasErrorBoundary === 0 &&
    result.hasSidebar > 0 &&
    result.errors.length === 0;

  await browser.close();
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.ok ? 0 : 1);
}

main().catch((error) => {
  console.error("HOME recovery verify failed:", error.message);
  process.exit(1);
});
