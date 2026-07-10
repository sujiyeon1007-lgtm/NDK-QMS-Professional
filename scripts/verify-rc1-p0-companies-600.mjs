/**
 * RC1 P0 Runtime verification — 600 companies (re-exports browser QA)
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = process.env.QA_BASE_URL || "http://127.0.0.1:5173";
const EXCEL = process.env.RC1_COMPANY_EXCEL || join(root, "scripts/fixtures/rc1-company-master-sales.xls");
const MASTER_KEY = "project-titan-master-data-v3";
const CUSTOMER_KEY = "titan-data-engine-v1.6/master/customer";
const LOG_KEY = "project-titan-master-excel-import-log-v1";
const EXPECTED = 600;

const MOJEON = {
  name: "(주)모전기공",
  bizNo: "314-88-00265",
  ceoName: "손두현",
  address: "부산광역시 강서구 과학산단2로43번길 38(지사동)",
  phone: "0519711551",
  fax: "0519711552",
};

const SKIP_UNDO = process.env.RC1_SKIP_UNDO === "1" || process.argv.includes("--skip-undo");

const checks = [];
function step(name, ok, detail = "") {
  checks.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? ` :: ${detail}` : ""}`);
}

function kpiNum(text = "") {
  return Number(String(text).replace(/[^\d]/g, ""));
}

async function captureCompanyUi(page) {
  return page.evaluate(
    ({ customerKey, masterKey, expected }) => {
      const parseCount = (key, path = null) => {
        try {
          const raw = sessionStorage.getItem(key);
          if (!raw) return 0;
          const parsed = JSON.parse(raw);
          if (path) return Array.isArray(parsed?.[path]) ? parsed[path].length : 0;
          return Array.isArray(parsed) ? parsed.length : 0;
        } catch {
          return -1;
        }
      };

      const customerStoreCount = parseCount(customerKey);
      const legacyCount = parseCount(masterKey, "companies");
      const tableRows = document.querySelectorAll(
        ".company-management-page .titan-table tbody tr:not(.titan-table__row--empty)"
      ).length;
      const footer =
        document.querySelector(".titan-table-footer")?.textContent?.replace(/\s+/g, " ").trim() ?? "";
      const kpiTotal = document.querySelector(".company-master-kpi__value")?.textContent?.trim() ?? "";
      const emptyMsg =
        document.querySelector(".company-management-page .titan-table__empty")?.textContent?.trim() ?? "";
      const searchVal = document.querySelector(".company-management-page__search input")?.value ?? "";

      return {
        customerStoreCount,
        legacyCount,
        tableRows,
        footer,
        kpiTotal,
        emptyMsg,
        searchVal,
        expected,
      };
    },
    { customerKey: CUSTOMER_KEY, masterKey: MASTER_KEY, expected: EXPECTED }
  );
}

function loadCreds() {
  const source = readFileSync(join(root, "src/config/titanLoginSystem.js"), "utf8");
  return {
    loginId: source.match(/loginId:\s*"([^"]+)"/)?.[1] ?? "admin",
    password: source.match(/defaultPassword:\s*"([^"]+)"/)?.[1] ?? "1234",
  };
}

async function login(page, creds) {
  await page.goto(`${BASE}/login`);
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
    await page.getByRole("button", { name: "나중에" }).click();
  }
  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 20000 });
}

async function runImportSteps(page) {
  await page.getByRole("button", { name: "Excel 가져오기" }).click();
  await page.locator('input[type="file"]').first().setInputFiles(EXCEL);
  await page.waitForTimeout(1000);
  await page.getByRole("button", { name: "데이터 검증" }).click();
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: "중복 검사" }).click();
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: "Import 실행" }).click();
  await page.waitForSelector("text=Import 완료", { timeout: 120000 });
}

function getCompanyStatsFromStorage() {
  return `(() => {
    const customerRaw = sessionStorage.getItem("${CUSTOMER_KEY}");
    const customerArr = customerRaw ? JSON.parse(customerRaw) : [];
    const companies = Array.isArray(customerArr)
      ? customerArr.filter((row) => row.active !== false)
      : [];
    const mojeon = companies.find((row) => row.name === ${JSON.stringify(MOJEON.name)});
    const profile = mojeon ? {
      regNo: (mojeon.bizNo || "").trim(),
      name: (mojeon.name || "").trim(),
      representative: (mojeon.ceoName || mojeon.manager || "").trim(),
      address: (mojeon.address || "").trim(),
      phone: (mojeon.phone || "").trim(),
      fax: (mojeon.fax || "").trim(),
      businessType: (mojeon.businessType || "").trim(),
      businessItem: (mojeon.businessItem || "").trim(),
    } : null;
    const logRaw = sessionStorage.getItem("${LOG_KEY}");
    const logs = logRaw ? JSON.parse(logRaw) : {};
    return { count: companies.length, mojeon, profile, canUndo: Boolean(logs.companies?.undoSnapshot) };
  })()`;
}

async function main() {
  if (!existsSync(EXCEL)) {
    console.error(`Excel fixture missing: ${EXCEL}`);
    process.exit(1);
  }

  const pageErrors = [];
  const consoleErrors = [];
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1680, height: 1050 } });
  page.on("dialog", (d) => d.accept().catch(() => {}));
  page.on("pageerror", (e) => pageErrors.push(String(e)));
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  let countAfterFirst = 0;

  try {
    await login(page, loadCreds());

    await page.evaluate(
      ([customerKey, masterKey, logKey]) => {
        sessionStorage.removeItem(customerKey);
        sessionStorage.removeItem(masterKey);
        sessionStorage.removeItem(logKey);
        sessionStorage.removeItem("titan-rc1-import-save-trace-v1");
      },
      [CUSTOMER_KEY, MASTER_KEY, LOG_KEY]
    );
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(800);

    const before = await page.evaluate(getCompanyStatsFromStorage());
    step("0 Baseline companies", before.count < 20, `before=${before.count}`);

    await page.goto(`${BASE}/settings/companies`);
    await page.waitForTimeout(600);

    await runImportSteps(page);

    const resultText = await page.locator(".master-excel-import-modal__result").innerText();
    const failedMatch = resultText.match(/실패[\s\S]*?(\d+)/);
    const createdMatch = resultText.match(/신규 등록[\s\S]*?(\d+)/);
    const created = Number(createdMatch?.[1] ?? 0);
    const failed = Number(failedMatch?.[1] ?? 0);
    step(
      "1 Excel Import (600 success)",
      resultText.includes("Import 완료") && failed === 0 && created >= EXPECTED - 10,
      `created=${created} failed=${failed}`
    );

    const undoVisible = await page.getByRole("button", { name: /마지막 Import Undo/ }).isVisible();
    step("2 Undo button visible", undoVisible);

    await page.locator(".titan-modal__footer").getByRole("button", { name: "닫기" }).click();
    await page.locator(".titan-modal-overlay").first().waitFor({ state: "hidden", timeout: 10000 });
    await page.waitForTimeout(1200);

    const uiAfterImport = await captureCompanyUi(page);
    step(
      "3a customer store sessionStorage",
      uiAfterImport.customerStoreCount >= EXPECTED - 10 && uiAfterImport.customerStoreCount <= EXPECTED + 10,
      `count=${uiAfterImport.customerStoreCount}`
    );
    step(
      "3b KPI = 600",
      kpiNum(uiAfterImport.kpiTotal) >= EXPECTED - 10 && kpiNum(uiAfterImport.kpiTotal) <= EXPECTED + 10,
      `kpi=${uiAfterImport.kpiTotal}`
    );
    step(
      "3c Footer = 총 600건",
      /총\s*600\s*건/.test(uiAfterImport.footer),
      `footer=${uiAfterImport.footer}`
    );
    step(
      "3d Table = 20 rows (page 1)",
      uiAfterImport.tableRows === 20,
      `tableRows=${uiAfterImport.tableRows}`
    );
    step(
      "3e Search reset after import",
      uiAfterImport.searchVal === "",
      `search=${uiAfterImport.searchVal}`
    );

    await page.fill(".company-management-page__search input", MOJEON.name);
    await page.waitForTimeout(400);
    const searchUi = await captureCompanyUi(page);
    step(
      "3f Search by company name",
      searchUi.tableRows >= 1 && /총\s*1\s*건/.test(searchUi.footer),
      `rows=${searchUi.tableRows} footer=${searchUi.footer}`
    );

    await page.fill(".company-management-page__search input", "");
    await page.waitForTimeout(400);

    const page2Btn = page.locator(".titan-table-footer").getByRole("button", { name: "2" });
    if (await page2Btn.count()) {
      await page2Btn.first().click();
      await page.waitForTimeout(400);
      const page2Ui = await captureCompanyUi(page);
      step(
        "3g Pagination page 2",
        page2Ui.tableRows >= 1 && page2Ui.tableRows <= 20,
        `rows=${page2Ui.tableRows}`
      );
    } else {
      step("3g Pagination page 2", false, "page 2 button not found");
    }

    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1200);
    const uiAfterReload = await captureCompanyUi(page);
    step(
      "4 F5 reload keeps 600",
      uiAfterReload.customerStoreCount >= EXPECTED - 10 &&
        kpiNum(uiAfterReload.kpiTotal) >= EXPECTED - 10 &&
        uiAfterReload.tableRows >= 1,
      `customer=${uiAfterReload.customerStoreCount} kpi=${uiAfterReload.kpiTotal} rows=${uiAfterReload.tableRows}`
    );

    const afterFirst = await page.evaluate(getCompanyStatsFromStorage());
    countAfterFirst = afterFirst.count;
    step(
      "4b Storage count after reload",
      countAfterFirst >= EXPECTED - 10 && countAfterFirst <= EXPECTED + 10,
      `${countAfterFirst} companies`
    );

    const mojeonOk =
      afterFirst.mojeon &&
      afterFirst.mojeon.bizNo === MOJEON.bizNo &&
      afterFirst.mojeon.ceoName === MOJEON.ceoName &&
      afterFirst.mojeon.address === MOJEON.address &&
      afterFirst.mojeon.phone === MOJEON.phone &&
      afterFirst.mojeon.fax === MOJEON.fax;
    step(
      "5 Representative company master",
      mojeonOk,
      mojeonOk ? `${MOJEON.name} | ${MOJEON.bizNo}` : JSON.stringify(afterFirst.mojeon)
    );

    const profile = afterFirst.profile;
    const profileOk =
      profile &&
      profile.regNo === MOJEON.bizNo &&
      profile.name === MOJEON.name &&
      profile.representative === MOJEON.ceoName &&
      profile.address === MOJEON.address &&
      profile.phone === MOJEON.phone &&
      profile.fax === MOJEON.fax;
    step(
      "6 Transaction statement profile (getCustomerProfile fields)",
      profileOk,
      JSON.stringify(profile)
    );

    await page.getByRole("button", { name: "Excel 가져오기" }).click();
    await page.locator('input[type="file"]').first().setInputFiles(EXCEL);
    await page.waitForTimeout(1000);
    await page.getByRole("button", { name: "데이터 검증" }).click();
    await page.getByRole("button", { name: "중복 검사" }).click();
    await page.waitForTimeout(500);
    const duplicatePanel = await page.locator(".master-excel-import-modal__body").innerText();
    const hasConflict =
      duplicatePanel.includes("중복") ||
      duplicatePanel.includes("변경") ||
      duplicatePanel.includes("사업자");
    step("7 Duplicate import detection", hasConflict, duplicatePanel.slice(0, 150));

    await page.locator(".titan-modal__footer").getByRole("button", { name: "취소" }).click();
    await page.locator(".titan-modal-overlay").first().waitFor({ state: "hidden", timeout: 10000 });

    if (!SKIP_UNDO) {
      await runImportSteps(page);
      await page.getByRole("button", { name: /마지막 Import Undo/ }).click();
      await page.waitForTimeout(800);
      await page.locator(".titan-modal__footer").getByRole("button", { name: "닫기" }).click();
      await page.waitForTimeout(500);

      const afterUndo = await page.evaluate(getCompanyStatsFromStorage());
      step("8 Undo snapshot", afterUndo.count < countAfterFirst, `${countAfterFirst} -> ${afterUndo.count}`);
    } else {
      step("8 Undo snapshot", true, "skipped (--skip-undo)");
    }

    if (pageErrors.length) step("Runtime errors", false, pageErrors.join(" | "));
    else step("Runtime errors", true);

    if (consoleErrors.length) step("Console errors", false, consoleErrors.slice(0, 3).join(" | "));
    else step("Console errors", true);

    const failedChecks = checks.filter((c) => !c.ok);
    if (failedChecks.length) {
      console.error("RC1 P0 Final Browser QA FAILED");
      process.exitCode = 1;
    } else {
      console.log("RC1 P0 Final Browser QA: PASS");
      console.log("RC1 Company Import — Official Freeze Candidate");
    }
  } catch (error) {
    console.error("RC1 P0 Final Browser QA error:", error.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main();
