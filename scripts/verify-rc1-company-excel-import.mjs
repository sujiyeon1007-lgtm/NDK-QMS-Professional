/**
 * RC1 P0 - Accounting Excel company import / SSOT / transaction statement verify
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const EXCEL_PATH =
  process.env.RC1_COMPANY_EXCEL ||
  path.join(root, "scripts/fixtures/rc1-company-accounting.xls");

const SAMPLE_NAME = "(\uC720)\uCC3D\uC131\uC815\uBC00";
const SAMPLE_BIZ_NO = "621-81-12791";
const SAMPLE_CEO = "\uAE40\uC815\uD654";
const SAMPLE_EMAIL = "hym5258@hanmail.net";
const SAMPLE_MOBILE = "01094950217";

const memory = new Map();
globalThis.sessionStorage = {
  getItem(key) {
    return memory.has(key) ? memory.get(key) : null;
  },
  setItem(key, value) {
    memory.set(key, String(value));
  },
  removeItem(key) {
    memory.delete(key);
  },
  clear() {
    memory.clear();
  },
  get length() {
    return memory.size;
  },
  key(index) {
    return [...memory.keys()][index] ?? null;
  },
};
globalThis.window = {
  dispatchEvent() {},
  addEventListener() {},
  removeEventListener() {},
};
globalThis.localStorage = {
  getItem() {
    return null;
  },
  setItem() {},
  removeItem() {},
  clear() {},
  get length() {
    return 0;
  },
  key() {
    return null;
  },
};

const checks = [];
function step(name, ok, detail = "") {
  checks.push({ name, ok, detail });
  console.log((ok ? "PASS" : "FAIL") + " " + name + (detail ? " :: " + detail : ""));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const masterDataIndex = pathToFileURL(path.join(root, "src/utils/masterData.js")).href;
const importIndex = pathToFileURL(path.join(root, "src/utils/masterExcelImport.js")).href;
const statementIndex = pathToFileURL(path.join(root, "src/utils/transactionStatementConfig.js")).href;

const { getMasterDataByCategory, findCompanyByBizNo, revertMasterImport } = await import(
  masterDataIndex
);
const { parseMasterExcelBuffer, analyzeMasterImport, executeMasterImport } = await import(
  importIndex
);
const { getCustomerProfile } = await import(statementIndex);

async function main() {
  assert(existsSync(EXCEL_PATH), `Excel file not found: ${EXCEL_PATH}`);

  const buffer = readFileSync(EXCEL_PATH);
  const parsed = await parseMasterExcelBuffer("companies", buffer, path.basename(EXCEL_PATH));
  assert(parsed.ok, parsed.message ?? "parse failed");

  step("Excel parse", true, `${parsed.rows.length} rows (deduped by bizNo)`);

  const invalid = parsed.rows.filter((row) => !row.valid);
  step(
    "Validation errors",
    invalid.length === 0,
    invalid.slice(0, 3).map((row) => `${row.rowIndex} ${row.errors.join(", ")}`).join(" | ")
  );

  const sample = parsed.rows.find((row) => row.payload?.name === SAMPLE_NAME);
  step(
    "Column mapping sample",
    Boolean(
      sample &&
        sample.payload.bizNo === SAMPLE_BIZ_NO &&
        sample.payload.ceoName === SAMPLE_CEO &&
        sample.payload.address.includes("\uC591\uC0B0") &&
        sample.payload.mobile === SAMPLE_MOBILE &&
        sample.payload.email === SAMPLE_EMAIL &&
        sample.payload.businessType === "\uC81C\uC870"
    ),
    sample ? JSON.stringify(sample.payload) : "sample row missing"
  );

  const beforeCount = getMasterDataByCategory("companies").length;
  const analysis = analyzeMasterImport("companies", parsed.rows);
  step(
    "Duplicate analysis",
    analysis.newRows.length > 0,
    `new=${analysis.newRows.length} conflict=${analysis.keyConflicts.length} invalid=${analysis.invalidRows.length}`
  );

  const importResult = await executeMasterImport(analysis, {
    masterType: "companies",
    conflictPolicy: "update",
    fileName: path.basename(EXCEL_PATH),
  });

  step(
    "Import execute",
    importResult.created >= 590 && importResult.failed === 0,
    `created=${importResult.created} updated=${importResult.updated} failed=${importResult.failed}${
      importResult.errors.length ? " | " + importResult.errors.slice(0, 3).join(" | ") : ""
    }`
  );

  const afterCount = getMasterDataByCategory("companies").length;
  step(
    "Company count",
    afterCount >= 590,
    `before=${beforeCount} after=${afterCount}`
  );

  const imported = findCompanyByBizNo(SAMPLE_BIZ_NO);
  step(
    "Master SSOT fields",
    Boolean(imported && imported.name === SAMPLE_NAME && imported.ceoName === SAMPLE_CEO),
    imported ? `${imported.name} | ${imported.bizNo} | ${imported.ceoName}` : "not found"
  );

  const profile = getCustomerProfile(SAMPLE_NAME);
  step(
    "Transaction statement profile",
    profile.regNo === imported?.bizNo &&
      profile.name === imported?.name &&
      profile.representative === imported?.ceoName &&
      profile.address === imported?.address,
    JSON.stringify({
      regNo: profile.regNo,
      name: profile.name,
      representative: profile.representative,
      phone: profile.phone,
    })
  );

  if (importResult.undoSnapshot) {
    revertMasterImport("companies", importResult.undoSnapshot);
    step("Undo snapshot", getMasterDataByCategory("companies").length === beforeCount);
  }

  if (checks.some((item) => !item.ok)) {
    console.error("\nRC1 Company Excel Import verification FAILED");
    process.exitCode = 1;
  } else {
    console.log("\nRC1 Company Excel Import verification: PASS");
  }
}

main().catch((error) => {
  console.error("RC1 Company Excel Import error:", error.message);
  process.exitCode = 1;
});
