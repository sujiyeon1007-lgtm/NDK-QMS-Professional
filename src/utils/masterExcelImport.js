/**
 * Project TITAN V1.0 — Generic Master Excel Import/Export
 * ProductMaster · CustomerMaster · MaterialMaster · ProcessMaster
 */

import * as XLSX from "xlsx";
import { getMasterExcelConfig } from "../config/masterExcelImport";
import {
  compareCompanyMasterChanges,
  compareMaterialMasterChanges,
  compareProcessMasterChanges,
  compareProductMasterChanges,
  findCompanyByBizNo,
  findCompanyByCode,
  findMaterialByCode,
  findProcessByCode,
  findProductByCode,
  findProductByCompanyAndPartNo,
  flushMasterDataPersist,
  generateProductManagementCode,
  getMasterDataByCategory,
  normalizeCompanyBizNo,
  stageMasterAdd,
  stageMasterUpdate,
} from "./masterData";
import { saveMasterImportLog } from "./masterExcelImportLog";

const COMPARE_FN = {
  products: compareProductMasterChanges,
  companies: compareCompanyMasterChanges,
  materials: compareMaterialMasterChanges,
  processes: compareProcessMasterChanges,
};

const FIND_BY_CODE = {
  products: findProductByCode,
  companies: findCompanyByCode,
  materials: findMaterialByCode,
  processes: findProcessByCode,
};

function normalizeHeader(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, "")
    .toLowerCase();
}

function buildHeaderLookup(columns) {
  return columns.reduce((acc, column) => {
    column.labels.forEach((label) => {
      acc[normalizeHeader(label)] = column.key;
    });
    acc[normalizeHeader(column.key)] = column.key;
    return acc;
  }, {});
}

function parseNumber(value) {
  if (value === "" || value == null) return null;
  const parsed = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function parseDate(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  if (/^\d{4}\.\d{2}\.\d{2}$/.test(raw)) return raw.replace(/\./g, "-");
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(raw)) return raw.replace(/\//g, "-");
  const excelSerial = Number(raw);
  if (Number.isFinite(excelSerial) && excelSerial > 30000 && excelSerial < 60000) {
    const epoch = new Date(Date.UTC(1899, 11, 30));
    epoch.setUTCDate(epoch.getUTCDate() + excelSerial);
    return epoch.toISOString().slice(0, 10);
  }
  return raw;
}

function normalizeCellValue(key, value, columnDef) {
  if (columnDef?.format === "number") return parseNumber(value);
  if (columnDef?.format === "date") return parseDate(value);
  const trimmed = String(value ?? "").trim();
  if (key === "bizNo") return normalizeCompanyBizNo(trimmed);
  return trimmed;
}

function detectHeaderRowIndex(matrix, headerLookup, maxScan = 25) {
  let bestIndex = 0;
  let bestScore = 0;
  const limit = Math.min(matrix.length, maxScan);
  for (let index = 0; index < limit; index += 1) {
    const row = matrix[index];
    if (!Array.isArray(row)) continue;
    const score = row.filter((cell) => headerLookup[normalizeHeader(cell)]).length;
    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  }
  return bestScore >= 2 ? bestIndex : 0;
}

const COMPANY_IMPORT_SCALAR_FIELDS = [
  "name",
  "ceoName",
  "bizNo",
  "manager",
  "phone",
  "mobile",
  "fax",
  "email",
  "address",
  "businessType",
  "businessItem",
  "note",
];

function isPrimaryCompanyContact(role) {
  const normalized = String(role ?? "").trim();
  return !normalized || normalized.includes("주담당");
}

function scoreCompanyImportRow(row) {
  const payload = row.payload ?? {};
  let score = 0;
  if (isPrimaryCompanyContact(payload.contactRole)) score += 8;
  if (payload.phone) score += 2;
  if (payload.mobile) score += 2;
  if (payload.email) score += 2;
  if (payload.fax) score += 1;
  if (payload.manager) score += 1;
  return score;
}

function mergeCompanyImportPayload(existing = {}, incoming = {}) {
  const merged = { ...existing };
  COMPANY_IMPORT_SCALAR_FIELDS.forEach((key) => {
    const value = incoming[key];
    if (value !== "" && value != null && String(value).trim() !== "") {
      merged[key] = typeof value === "string" ? value.trim() : value;
    }
  });
  if (existing.code) merged.code = existing.code;
  if (existing.abbreviation) merged.abbreviation = existing.abbreviation;
  if (existing.abbreviationLocked != null) merged.abbreviationLocked = existing.abbreviationLocked;
  if (existing.abbreviationManual != null) merged.abbreviationManual = existing.abbreviationManual;
  if (Array.isArray(existing.contacts)) merged.contacts = existing.contacts;
  if (Array.isArray(existing.ndkAssignees)) merged.ndkAssignees = existing.ndkAssignees;
  return merged;
}

function mergeCompanyImportRows(primaryRow, secondaryRow) {
  const preferred =
    scoreCompanyImportRow(primaryRow) >= scoreCompanyImportRow(secondaryRow)
      ? primaryRow
      : secondaryRow;
  const other = preferred === primaryRow ? secondaryRow : primaryRow;
  return {
    ...preferred,
    payload: mergeCompanyImportPayload(preferred.payload ?? {}, other.payload ?? {}),
  };
}

function dedupeCompanyImportRows(rows = []) {
  const invalidRows = [];
  const byBizNo = new Map();

  rows.forEach((row) => {
    const bizNo = normalizeCompanyBizNo(row.payload?.bizNo);
    if (!bizNo) {
      invalidRows.push(row);
      return;
    }
    const existing = byBizNo.get(bizNo);
    if (!existing) {
      byBizNo.set(bizNo, row);
      return;
    }
    byBizNo.set(bizNo, mergeCompanyImportRows(existing, row));
  });

  return [...byBizNo.values(), ...invalidRows];
}

function parseMasterExcelMatrix(masterType, matrix, fileName = "") {
  const config = getMasterExcelConfig(masterType);
  if (!config) return { ok: false, message: "지원하지 않는 Master 유형입니다." };
  if (!matrix.length) return { ok: false, message: "Import 대상 데이터가 없습니다." };

  const headerLookup = buildHeaderLookup(config.columns);
  const headerRowIndex = detectHeaderRowIndex(matrix, headerLookup);
  const headerRow = matrix[headerRowIndex];
  const hasMappedHeader = headerRow.some((cell) => headerLookup[normalizeHeader(cell)]);
  if (!hasMappedHeader) {
    const labels = config.columns.map((c) => c.exportLabel ?? c.labels[0]).join(" · ");
    return { ok: false, message: `Excel 헤더를 확인하세요. (${labels})` };
  }

  const generatedCodes = getMasterDataByCategory(config.categoryKey).map((r) => r.code).filter(Boolean);
  let rows = matrix
    .slice(headerRowIndex + 1)
    .map((values, index) =>
      validateRow(masterType, config, mapSheetRow(headerRow, values, headerLookup, config.columns), headerRowIndex + index + 2, generatedCodes)
    )
    .filter((row) =>
      Object.values(row.payload ?? {}).some((value) => String(value ?? "").trim() !== "")
    );

  if (masterType === "companies") {
    rows = dedupeCompanyImportRows(rows);
  }

  if (!rows.length) return { ok: false, message: "Import 대상 행이 없습니다." };

  return { ok: true, rows, fileName, config };
}

function mapSheetRow(headers, values, headerLookup, columns) {
  const columnByKey = Object.fromEntries(columns.map((col) => [col.key, col]));
  const raw = {};
  headers.forEach((header, index) => {
    const key = headerLookup[normalizeHeader(header)];
    if (key) raw[key] = normalizeCellValue(key, values[index], columnByKey[key]);
  });
  return raw;
}

function validateRow(masterType, config, raw, rowIndex, generatedCodes) {
  const payload = { ...raw, active: true };

  if (masterType === "materials" && payload.description && !payload.spec) {
    payload.spec = payload.description;
  }

  if (config.autoGenerateCode && !payload.code) {
    payload.code = generateProductManagementCode(payload.company, generatedCodes);
    generatedCodes.push(payload.code);
  }

  const errors = [];
  config.requiredKeys.forEach((key) => {
    const col = config.columns.find((c) => c.key === key);
    const label = col?.exportLabel ?? col?.labels?.[0] ?? key;
    const value = payload[key];
    if (value === "" || value == null) errors.push(`${label} 없음`);
  });

  config.columns.forEach((col) => {
    if (col.format === "number" && payload[col.key] != null && payload[col.key] !== "") {
      if (parseNumber(payload[col.key]) == null) {
        errors.push(`${col.exportLabel ?? col.labels[0]} 형식 오류`);
      }
    }
    if (col.format === "date" && payload[col.key]) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(payload[col.key]))) {
        errors.push(`${col.exportLabel ?? col.labels[0]} 형식 오류 (YYYY-MM-DD)`);
      }
    }
  });

  if (masterType === "products" && payload.unitPrice != null) {
    payload.unitPrice = parseNumber(payload.unitPrice);
  }

  if (masterType === "companies") {
    payload.bizNo = normalizeCompanyBizNo(payload.bizNo);
    delete payload.contactRole;
  }

  return {
    rowIndex,
    payload,
    errors,
    valid: errors.length === 0,
  };
}

export async function parseMasterExcelFile(masterType, file) {
  const config = getMasterExcelConfig(masterType);
  if (!config) return { ok: false, message: "지원하지 않는 Master 유형입니다." };
  if (!file) return { ok: false, message: "Excel 파일을 선택하세요." };

  const extension = String(file.name ?? "")
    .split(".")
    .pop()
    ?.toLowerCase();
  if (!["xlsx", "xls"].includes(extension)) {
    return { ok: false, message: "지원 형식은 Excel (.xlsx · .xls) 입니다." };
  }

  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return { ok: false, message: "시트를 찾을 수 없습니다." };

    const sheet = workbook.Sheets[sheetName];
    const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    return parseMasterExcelMatrix(masterType, matrix, file.name);
  } catch (error) {
    console.error("[MasterExcelImport] parse failed", error);
    return { ok: false, message: "Excel 파일을 읽을 수 없습니다." };
  }
}

export async function parseMasterExcelBuffer(masterType, buffer, fileName = "import.xlsx") {
  const config = getMasterExcelConfig(masterType);
  if (!config) return { ok: false, message: "지원하지 않는 Master 유형입니다." };

  const extension = String(fileName ?? "")
    .split(".")
    .pop()
    ?.toLowerCase();
  if (!["xlsx", "xls"].includes(extension)) {
    return { ok: false, message: "지원 형식은 Excel (.xlsx · .xls) 입니다." };
  }

  try {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return { ok: false, message: "시트를 찾을 수 없습니다." };

    const sheet = workbook.Sheets[sheetName];
    const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    return parseMasterExcelMatrix(masterType, matrix, fileName);
  } catch (error) {
    console.error("[MasterExcelImport] parse buffer failed", error);
    return { ok: false, message: "Excel 파일을 읽을 수 없습니다." };
  }
}

function findExistingByCode(masterType, code) {
  const finder = FIND_BY_CODE[masterType];
  return finder ? finder(code) : null;
}

function findConflict(masterType, payload) {
  if (masterType === "products") {
    return findProductByCompanyAndPartNo(payload.company, payload.partNo);
  }
  if (masterType === "companies") {
    return findCompanyByBizNo(payload.bizNo);
  }
  return null;
}

export function analyzeMasterImport(masterType, rows = []) {
  const config = getMasterExcelConfig(masterType);
  const compareFn = COMPARE_FN[masterType] ?? (() => []);

  const companyByBizNo =
    masterType === "companies"
      ? new Map(
          getMasterDataByCategory("companies")
            .map((row) => [normalizeCompanyBizNo(row.bizNo), row])
            .filter(([bizNo]) => Boolean(bizNo))
        )
      : null;

  const codeDuplicates = [];
  const keyConflicts = [];
  const invalidRows = [];
  const newRows = [];
  const seenCodes = new Set();

  rows.forEach((row) => {
    if (!row.valid) {
      invalidRows.push(row);
      return;
    }

    if (config.duplicateKey === "code" && row.payload.code) {
      const codeKey = row.payload.code.toLowerCase();
      if (seenCodes.has(codeKey)) {
        codeDuplicates.push({ ...row, reason: "파일 내 코드 중복" });
        return;
      }
      seenCodes.add(codeKey);

      const existingByCode = findExistingByCode(masterType, row.payload.code);
      if (existingByCode) {
        codeDuplicates.push({ ...row, reason: "기존 코드 중복", existing: existingByCode });
        return;
      }
    }

    if (config.duplicateKey === "bizNo" && row.payload.bizNo) {
      const bizKey = normalizeCompanyBizNo(row.payload.bizNo);
      if (seenCodes.has(bizKey)) {
        codeDuplicates.push({ ...row, reason: "파일 내 사업자번호 중복" });
        return;
      }
      seenCodes.add(bizKey);

      const existingByBizNo = companyByBizNo?.get(bizKey) ?? findCompanyByBizNo(row.payload.bizNo);
      if (existingByBizNo) {
        if (config.conflictPolicy) {
          const changes = compareFn(existingByBizNo, row.payload);
          keyConflicts.push({ ...row, existing: existingByBizNo, changes });
        } else {
          codeDuplicates.push({ ...row, reason: "기존 사업자번호 중복", existing: existingByBizNo });
        }
        return;
      }
    }

    if (config.conflictPolicy && config.duplicateKey !== "bizNo") {
      const existing = findConflict(masterType, row.payload);
      if (existing) {
        const changes = compareFn(existing, row.payload);
        keyConflicts.push({ ...row, existing, changes });
        return;
      }
    }

    newRows.push(row);
  });

  return {
    total: rows.length,
    newRows,
    codeDuplicates,
    keyConflicts,
    invalidRows,
    validCount: rows.filter((r) => r.valid).length,
  };
}

function buildPayloadForCategory(masterType, payload, existing) {
  if (masterType === "products" && existing) {
    return { ...existing, ...payload, code: existing.code };
  }
  if (masterType === "companies" && existing) {
    return mergeCompanyImportPayload(existing, payload);
  }
  if (masterType === "materials") {
    return { ...payload, spec: payload.spec ?? payload.description ?? "" };
  }
  return payload;
}

/**
 * @param {ReturnType<typeof analyzeMasterImport>} analysis
 * @param {{ conflictPolicy: "keep" | "update", masterType: string, fileName?: string, onProgress?: (p: { current: number, total: number, percent: number }) => void }} options
 */
export async function executeMasterImport(analysis, options = {}) {
  const masterType = options.masterType;
  const config = getMasterExcelConfig(masterType);
  const conflictPolicy = options.conflictPolicy ?? "keep";

  const workItems = [
    ...analysis.newRows.map((row) => ({ type: "create", row })),
    ...analysis.keyConflicts.map((row) => ({ type: "conflict", row })),
  ];
  const total = workItems.length;

  const result = {
    total: analysis.total,
    created: 0,
    updated: 0,
    duplicate: analysis.codeDuplicates.length,
    skipped: 0,
    failed: analysis.invalidRows.length,
    errors: [],
    undoSnapshot: { createdIds: [], updatedRecords: [] },
  };

  analysis.invalidRows.forEach((row) => {
    result.errors.push(`${row.rowIndex}행 ${row.errors.join(", ")}`);
  });

  let current = 0;
  const deferPersist = total > 5;
  for (const item of workItems) {
    current += 1;
    options.onProgress?.({
      current,
      total,
      percent: total ? Math.round((current / total) * 100) : 100,
    });

    if (item.type === "conflict") {
      if (conflictPolicy === "keep") {
        result.skipped += 1;
        result.duplicate += 1;
        await yieldToUi();
        continue;
      }
      const payload = buildPayloadForCategory(masterType, item.row.payload, item.row.existing);
      result.undoSnapshot.updatedRecords.push({
        id: item.row.existing.id,
        previousData: { ...item.row.existing },
      });
      const staged = stageMasterUpdate(config.categoryKey, item.row.existing.id, payload, { deferPersist });
      if (staged.ok) result.updated += 1;
      else {
        result.failed += 1;
        result.errors.push(`${item.row.rowIndex}행 ${staged.message}`);
      }
      await yieldToUi();
      continue;
    }

    const staged = stageMasterAdd(config.categoryKey, item.row.payload, { deferPersist });
    if (staged.ok) {
      result.created += 1;
      result.undoSnapshot.createdIds.push(staged.row.id);
    } else {
      result.failed += 1;
      result.errors.push(`${item.row.rowIndex}행 ${staged.message}`);
    }
    await yieldToUi();
  }

  const memoryAfterLoop =
    config.categoryKey === "companies" ? getMasterDataByCategory("companies").length : 0;

  const shouldFlushPersist =
    total > 5 &&
    (result.created > 0 || result.updated > 0 || memoryAfterLoop > 0);

  if (shouldFlushPersist) {
    flushMasterDataPersist(config.categoryKey);
  }

  if (result.created || result.updated) {
    saveMasterImportLog({
      masterType,
      categoryKey: config.categoryKey,
      fileName: options.fileName ?? "",
      companyName:
        analysis.newRows[0]?.payload?.name ??
        analysis.keyConflicts[0]?.payload?.name ??
        analysis.newRows[0]?.payload?.company ??
        "",
      counts: {
        total: result.total,
        created: result.created,
        updated: result.updated,
        duplicate: result.duplicate + result.skipped,
        failed: result.failed,
      },
      undoSnapshot: result.undoSnapshot,
    });
  }

  return result;
}

function yieldToUi() {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

export function formatMasterChangeSummary(changes = []) {
  if (!changes.length) return "변경 없음";
  return changes.map((item) => `${item.label} 변경`).join(" · ");
}

export async function exportMasterExcel(masterType) {
  const config = getMasterExcelConfig(masterType);
  if (!config) return { ok: false, message: "지원하지 않는 Master 유형입니다." };

  const rows = getMasterDataByCategory(config.categoryKey);
  const headers = config.columns.map((col) => col.exportLabel ?? col.labels[0]);

  const data = rows.map((row) =>
    config.columns.map((col) => {
      if (col.key === "description" && masterType === "materials") {
        return row.spec ?? row.description ?? "";
      }
      const value = row[col.key];
      if (col.format === "number" && value != null) return Number(value);
      return value ?? "";
    })
  );

  const sheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, config.title.slice(0, 31));
  XLSX.writeFile(workbook, `${config.title}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  return { ok: true };
}

// Backward compatibility — product-only imports
export {
  parseMasterExcelFile as parseProductMasterExcelFile,
  analyzeMasterImport as analyzeProductMasterImport,
  executeMasterImport as executeProductMasterImport,
  formatMasterChangeSummary as formatProductMasterChangeSummary,
};
export { getMasterExcelConfig } from "../config/masterExcelImport";
export const PRODUCT_MASTER_IMPORT_HEADERS =
  getMasterExcelConfig("products")?.columns ?? [];
