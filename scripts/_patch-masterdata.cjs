const fs = require("fs");
const path = require("path");
const file = path.join(__dirname, "..", "src", "utils", "masterData.js");
let s = fs.readFileSync(file, "utf8");
function rep(oldText, newText, label) {
  if (!s.includes(oldText)) throw new Error("miss " + label);
  s = s.replace(oldText, newText);
  console.log("patched", label);
}
rep(
  'import { buildCompanyAbbreviation, getCompanyAbbreviation, shouldAutoUpdateAbbreviation } from "./companyAbbreviation";',
  'import { buildCompanyAbbreviation, getCompanyAbbreviation, shouldAutoUpdateAbbreviation } from "./companyAbbreviation";\nimport { generateTitanDocumentNumber } from "./titanDocumentNumbering";\nimport { inferProcessCategoryFromDetail, resolveProductProcessLabel } from "../config/productProcessSelection";',
  "imports"
);
rep(
  `      process: payload.process?.trim() ?? "",
      description: payload.description?.trim() ?? "",`,
  `      processCategory: payload.processCategory?.trim() ?? inferProcessCategoryFromDetail(payload.processDetail, payload.process),
      processDetail: payload.processDetail?.trim() ?? "",
      process: resolveProductProcessLabel(payload.processCategory, payload.processDetail, payload.process),
      description: payload.description?.trim() ?? "",`,
  "product normalize"
);
rep(
  `export function generateProductManagementCode(companyName, existingCodes = null) {
  const codeMap = getCompanyCodeMap();
  const companyCode =
    codeMap[companyName] ??
    buildCompanyAbbreviation(companyName, getMasterDataByCategory("companies"));
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const prefix = \`\${companyCode}_\${datePart}_\`;
  const codes =
    existingCodes ??
    getMasterDataByCategory("products").map((row) => String(row.code ?? ""));
  const maxSeq = codes.reduce((max, code) => {
    if (!code.startsWith(prefix)) return max;
    const seq = Number(code.slice(prefix.length));
    return Number.isFinite(seq) ? Math.max(max, seq) : max;
  }, 0);
  return \`\${prefix}\${String(maxSeq + 1).padStart(3, "0")}\`;
}`,
  `export function generateProductManagementCode(companyName, existingCodes = null) {
  return generateTitanDocumentNumber("product", companyName, existingCodes);
}`,
  "generateProductManagementCode"
);
rep(
  `  if (resolvedKey !== "companies" && !normalized.code) {
    return {
      ok: false,
      message:
        resolvedKey === "employees"
          ? "사번을 입력하세요."
          : resolvedKey === "workers"
            ? "작업자 코드를 입력하세요."
            : "코드를 입력하세요.",
    };
  }`,
  `  if (resolvedKey === "products" && mode === "add" && !normalized.code && normalized.company) {
    normalized.code = generateProductManagementCode(normalized.company);
  }

  if (resolvedKey !== "companies" && !normalized.code) {
    return {
      ok: false,
      message:
        resolvedKey === "employees"
          ? "사번을 입력하세요."
          : resolvedKey === "workers"
            ? "작업자 코드를 입력하세요."
            : resolvedKey === "products"
              ? "업체를 선택하면 관리번호가 자동 생성됩니다."
              : "코드를 입력하세요.",
    };
  }`,
  "validate auto code"
);
fs.writeFileSync(file, s, "utf8");
console.log("masterData done");
