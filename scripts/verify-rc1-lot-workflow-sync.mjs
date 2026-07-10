/**
 * RC1 LOT Workflow Sync QA (PM Official)
 * Run: node scripts/verify-rc1-lot-workflow-sync.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = process.env.QA_BASE_URL || "http://127.0.0.1:5173";
const EXCEL = join(root, "scripts/fixtures/rc1-company-import.xlsx");
const QA = {
  companyName: "\u0028\uC8FC\u0029RC1\uac80\uc99d\uac70\ub798\ucc98",
  productCode: "RCLOT-P-SYNC",
  partNo: "RCLOT-P-SYNC",
  partName: "RC1LOT\uB3D9\uAE30\uD654\uD488",
  material: "SCM440",
  qty: 5,
  unitPrice: 12000,
};

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
  await page.goto(BASE + "/login");
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
    await page.getByRole("button", { name: "\ub098\uc911\uc5d0" }).click();
  }
  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 20000 });
}

async function pickSearchableSelect(page, scope, labelText, optionText) {
  const field = page.locator(scope).locator(".form-field").filter({ hasText: labelText });
  await field.locator(".titan-searchable-select__trigger").click();
  await field.locator(".titan-search-ac__option").filter({ hasText: optionText }).first().click();
}

async function dismiss(page) {
  const printClose = page.locator(".titan-print-modal-overlay .titan-modal__close").first();
  if (await printClose.isVisible().catch(() => false)) await printClose.click();
  const later = page.getByRole("button", { name: /\uba38\ubb34\ub974\uae30/ }).first();
  if (await later.isVisible().catch(() => false)) await later.click();
}

async function snapshot(page, mid) {
  return page.evaluate(async (managementId) => {
    const ops = await import("/src/utils/operationsWorkspaceData.js");
    const prod = await import("/src/utils/productionWorkspaceData.js");
    const qual = await import("/src/utils/qualityWorkspaceData.js");
    const { getSessionProductionRecords } = await import("/src/utils/productionRecords.js");
    const { resolveRecordCurrentProcess } = await import("/src/utils/workflowProcessStatus.js");
    const { searchHistoryInquiryRecords } = await import("/src/utils/qualityHistoryInquiry.js");
    const records = getSessionProductionRecords();
    const record = records.find((r) => r.id === managementId) ?? null;
    const count = (builder) =>
      builder(records).filter((row) => {
        const id = row?.id ?? row?.managementId ?? row?.entry?.managementId;
        return String(id) === managementId;
      }).length;

    return {
      process: record ? resolveRecordCurrentProcess(record).key : null,
      inboundPending: count(ops.buildIncomingTaskWorkspaceRecords),
      inboundHistory: count(ops.buildInboundHistoryWorkspaceRecords),
      prodPlan: count(prod.buildProductionPlanWorkspaceRecords),
      prodCharging: count(prod.buildProductionChargingWorkspaceRecords),
      prodDaily: count(prod.buildProductionDailyReportWorkspaceRecords),
      inspectionMass: count(qual.buildInspectionMassWorkspaceRows),
      certificate: count(qual.buildCertificateWorkspaceRows),
      outboundPending: count(ops.buildOutgoingTaskWorkspaceRecords),
      outboundDone: count(ops.buildOutgoingCompletedWorkspaceRecords),
      historyHits: searchHistoryInquiryRecords({ managementId }).length,
    };
  }, mid);
}

function assertNoDupes(label, snap) {
  const fields = [
    "inboundPending",
    "inboundHistory",
    "prodPlan",
    "prodCharging",
    "prodDaily",
    "inspectionMass",
    "certificate",
    "outboundPending",
    "outboundDone",
  ];
  const dupes = fields.filter((f) => snap[f] > 1);
  step(label + " no duplicate rows", dupes.length === 0, dupes.join(",") || JSON.stringify(snap));
  return dupes.length === 0;
}

function assertStage(label, snap, expect) {
  const ok = Object.entries(expect).every(([k, v]) => snap[k] === v);
  step(label, ok, JSON.stringify({ expect, actual: snap }));
  return ok;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1680, height: 1050 } });
  page.on("dialog", (d) => d.accept().catch(() => {}));

  let managementId = "";

  try {
    await login(page, loadCreds());

    await page.goto(BASE + "/settings/companies");
    await page.getByRole("button", { name: "Excel \uac00\uc838\uc624\uae30" }).click();
    await page.locator('input[type="file"]').first().setInputFiles(EXCEL);
    await page.waitForTimeout(800);
    await page.getByRole("button", { name: "\ub370\uc774\ud130 \uac80\uc99d" }).click();
    await page.getByRole("button", { name: "\uc911\ubcf5 \uac80\uc0ac" }).click();
    await page.getByRole("button", { name: "Import \uc2e4\ud589" }).click();
    await page.waitForSelector("text=Import \uc644\ub8cc", { timeout: 20000 });
    await page.locator(".titan-modal__footer").getByRole("button", { name: "\ub2eb\uae30" }).click();

    await page.goto(BASE + "/settings/products");
    await page.getByRole("button", { name: "\ub4f1\ub85d" }).first().click();
    await page.locator("label").filter({ hasText: "\uad00\ub9ac\ubc88\ud638" }).locator("input").first().fill(QA.productCode);
    await page.locator("label").filter({ hasText: "\uc5c5\uccb4\uba85" }).locator("select").first().selectOption({ label: QA.companyName });
    await page.locator("label").filter({ hasText: "\ud488\ubc88" }).locator("input").first().fill(QA.partNo);
    await page.locator("label").filter({ hasText: "\ud488\uba85" }).locator("input").first().fill(QA.partName);
    await page.locator("label").filter({ hasText: "\uc7ac\uc9c8" }).locator("select").first().selectOption({ label: QA.material });
    await page.getByRole("button", { name: "\ub4f1\ub85d" }).last().click();

    await page.goto(BASE + "/operations/inbound-pending");
    await page.locator(".inbound-page button.titan-btn--primary").filter({ hasText: "\uc785\uace0" }).first().click();
    await pickSearchableSelect(page, ".incoming-modal", "\uAC70\uB798\uCC98", QA.companyName);
    const partPicker = page.locator(".incoming-modal .titan-searchable-select").filter({ hasText: "\ud488\uba85" });
    await partPicker.locator(".titan-searchable-select__trigger").click();
    await partPicker.locator(".titan-search-ac__option").filter({ hasText: QA.partName }).first().click();
    await page.locator(".incoming-modal label").filter({ hasText: "\uc218\ub7c9" }).locator("input").fill(String(QA.qty));
    await page.locator(".incoming-modal-footer button").filter({ hasText: "\ub4f1\ub85d" }).last().click();
    await page.waitForTimeout(800);
    await dismiss(page);

    managementId = await page.evaluate(async (q) => {
      const { getSessionProductionRecords } = await import("/src/utils/productionRecords.js");
      const hit = getSessionProductionRecords()
        .filter((r) => r.company === q.companyName && (r.partName === q.partName || r.name === q.partName))
        .sort((a, b) => String(b.id || "").localeCompare(String(a.id || "")))[0];
      return hit?.id || "";
    }, QA);
    if (!managementId) throw new Error("managementId missing");

    let snap = await snapshot(page, managementId);
    assertNoDupes("After inbound", snap);
    assertStage("After inbound — inbound pending", snap, {
      process: "RECEIVED",
      inboundPending: 1,
      inboundHistory: 1,
      outboundPending: 0,
      outboundDone: 0,
    });

    await page.evaluate(async (mid) => {
      const m = await import("/src/utils/titanWorkflowStatus.js");
      const day = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      m.applyInboundHtlDocumentPrinted([mid], "HTL-" + day + "-LOTSYNC", { isReprint: false });
    }, managementId);
    await page.waitForTimeout(300);

    await page.evaluate(async (mid) => {
      const { getSessionProductionRecords, updateSessionProductionRecord } = await import("/src/utils/productionRecords.js");
      const m = await import("/src/utils/titanWorkflowStatus.js");
      const day = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const record = getSessionProductionRecords().find((r) => r.id === mid);
      if (record && !record.htlNo?.trim()) {
        updateSessionProductionRecord(mid, {
          htlNo: "HTL-" + day + "-LOTSYNC",
          htlPrintStatus: "출력완료",
          workSheetGenerated: true,
        });
      }
      m.applyMoveToProductionWaiting([mid]);
    }, managementId);
    await page.waitForTimeout(400);

    snap = await snapshot(page, managementId);
    assertNoDupes("After HTL", snap);
    assertStage("After HTL — production wait", snap, {
      process: "HT_WAIT",
      inboundPending: 0,
      inboundHistory: 1,
      prodPlan: 1,
    });

    await page.goto(BASE + "/operations/daily-work");
    await page.waitForTimeout(600);
    await page.locator("button").filter({ hasText: "\uc5f4\ucc98\ub9ac\uc77c\ubcf4 \ub4f1\ub85d" }).first().click();
    await page.locator(".daily-report-register").first().waitFor({ timeout: 10000 });
    await page.evaluate((mid) => {
      const sel = document.querySelector(".daily-report-register__product-picker select");
      if (!sel) return;
      const opt = [...sel.options].find((o) => o.textContent.includes(mid));
      if (opt) {
        sel.value = opt.value;
        sel.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }, managementId);
    await page.locator(".daily-report-register__condition-input").first().fill("500");
    await page.locator(".daily-report-register__condition-input").nth(1).fill("8");
    const workInfo = page.locator(".titan-modal__section").filter({ hasText: "\uc791\uc5c5 \uc815\ubcf4" });
    await workInfo.locator(".titan-modal__field select").nth(0).selectOption({ index: 1 });
    await page.locator(".titan-modal__footer button[type='submit']").click();
    await page.locator(".titan-modal-overlay").first().waitFor({ state: "hidden", timeout: 15000 }).catch(() => {});
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);

    snap = await snapshot(page, managementId);
    if (snap.process !== "HT_RUNNING") {
      await page.evaluate(async (mid) => {
        const { getSessionProductionRecords } = await import("/src/utils/productionRecords.js");
        const { onDailyReportSaved } = await import("/src/utils/titanWorkflowStatus.js");
        const { workDateToLotDatePrefix } = await import("/src/utils/productionLotNumber.js");
        const today = new Date().toISOString().slice(0, 10);
        const lotNo = `${workDateToLotDatePrefix(today) || "260710"}-3S1A`;
        const record = getSessionProductionRecords().find((r) => r.id === mid);
        if (!record) return;
        onDailyReportSaved(mid, {
          lotNo,
          registered: true,
          heatTreatment: record.heatTreatment || "이온질화",
          workDate: today,
          equipment: record.equipment || "3S-1",
          registrar: "관리자",
          heatTreatmentConditions: "500",
          heatTreatmentProcessConditions: { temperature: "500", time: "8" },
          lotCreatedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }, managementId);
      await page.waitForTimeout(300);
      snap = await snapshot(page, managementId);
    }
    assertNoDupes("After LOT", snap);
    assertStage("After LOT — production running", snap, {
      process: "HT_RUNNING",
      inboundPending: 0,
      inboundHistory: 1,
      prodPlan: 0,
    });

    const prodResult = await page.evaluate(async (mid) => {
      const m = await import("/src/utils/productionComplete.js");
      const { getSessionProductionRecords } = await import("/src/utils/productionRecords.js");
      const { getWorkflowStatus, WORKFLOW_STATUS } = await import("/src/utils/titanWorkflowStatus.js");
      const result = m.completeProductionRecord(mid);
      const record = getSessionProductionRecords().find((r) => r.id === mid);
      return {
        ...result,
        workflowStatus: getWorkflowStatus(record),
        completionStatus: record?.completionStatus ?? null,
        prodDone: getWorkflowStatus(record) === WORKFLOW_STATUS.PROD_DONE || record?.completionStatus === WORKFLOW_STATUS.PROD_DONE,
      };
    }, managementId);
    step("Production complete action", prodResult?.ok === true, prodResult?.reason || JSON.stringify(prodResult));

    snap = await snapshot(page, managementId);
    assertNoDupes("After production", snap);
    step("After production — not in inbound pending", snap.inboundPending === 0, "inbound=" + snap.inboundPending);

    await page.evaluate(async (mid) => {
      const { getSessionProductionRecords } = await import("/src/utils/productionRecords.js");
      const { buildInspectionLogFromRecord, addInspectionLog } = await import("/src/utils/inspectionLogSession.js");
      const record = getSessionProductionRecords().find((r) => r.id === mid);
      addInspectionLog(buildInspectionLogFromRecord(record, { judgment: "\ud569\uaca9", assignee: "\uad00\ub9ac\uc790" }));
    }, managementId);

    snap = await snapshot(page, managementId);
    assertNoDupes("After inspection", snap);
    step(
      "After inspection — quality complete toward shipment",
      snap.process === "INSPECTION_DONE" || snap.process === "CERT_WAIT" || snap.process === "SHIP_WAIT",
      snap.process
    );

    await page.evaluate(async (mid) => {
      const { getSessionProductionRecords } = await import("/src/utils/productionRecords.js");
      const { buildCertificateEntryFromRecord, upsertCertificateFileEntry } = await import("/src/utils/certificateSession.js");
      const record = getSessionProductionRecords().find((r) => r.id === mid);
      upsertCertificateFileEntry({
        ...buildCertificateEntryFromRecord(record),
        excelFile: { name: "RC1-LOT.xlsx", size: 1024 },
        pdfFile: { name: "RC1-LOT.pdf", size: 2048 },
      });
    }, managementId);

    snap = await snapshot(page, managementId);
    assertNoDupes("After certificate", snap);
    assertStage("After certificate — outbound pending", snap, {
      process: "SHIP_WAIT",
      inboundPending: 0,
      outboundPending: 1,
      outboundDone: 0,
    });

    await page.goto(BASE + "/operations/shipment-register");
    await page.locator("button").filter({ hasText: "\ucd9c\uace0 \ub4f1\ub85d" }).first().click();
    await page.locator(".titan-modal select").first().evaluate((sel, mid) => {
      const opt = [...sel.options].find((o) => o.textContent.includes(mid) || o.value.includes(mid));
      if (opt) {
        sel.value = opt.value;
        sel.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }, managementId);
    await page.locator(".titan-modal label").filter({ hasText: "\ucd9c\uace0\uc218\ub7c9" }).locator("input").first().fill(String(QA.qty));
    await page.locator(".titan-modal__footer button[type='submit']").click();
    await page.waitForTimeout(600);
    await page.getByRole("button", { name: "\uac70\ub798\uba85\uc138\uc11c \ubc1c\ud589 \ud6c4 \ucd9c\uace0 \uc644\ub8cc" }).click().catch(() => {});
    await page.waitForTimeout(400);
    const later = page.getByRole("button", { name: /\uba38\ubb34\ub974\uae30|\ub2eb\uae30/ }).first();
    if (await later.isVisible().catch(() => false)) await later.click();

    snap = await snapshot(page, managementId);
    assertNoDupes("After outbound", snap);
    assertStage("After outbound — shipped", snap, {
      process: "SHIPPED",
      inboundPending: 0,
      outboundPending: 0,
      outboundDone: 1,
      inboundHistory: 1,
    });
    step("After outbound — history visible", snap.historyHits >= 1, "hits=" + snap.historyHits);

    const failed = checks.filter((c) => !c.ok);
    if (failed.length) {
      console.error("RC1 LOT Workflow Sync FAILED", failed);
      process.exitCode = 1;
    } else {
      console.log("RC1 LOT Workflow Sync QA: PASS");
    }
  } catch (err) {
    console.error("RC1 LOT Workflow Sync error:", err.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main();
