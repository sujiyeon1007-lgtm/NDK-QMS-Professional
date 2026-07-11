/**
 * 생산일보 공정 코드 — 기준정보(코드관리) 연동 · RC1 ION/SOFT/GAS
 */

import { getMasterDataByCategory } from "../utils/masterData";
import {
  buildRc1EquipmentMasterSeedRows,
} from "../data/rc1EquipmentMasterSeed.js";

export const PRODUCTION_PROCESS_CODE_CATEGORY = "heatTreatment";

/** @type {Record<string, { code: string, label: string, legacyNames: string[] }>} */
export const HEAT_TREATMENT_PROCESS_CODE_META = {
  ION: {
    code: "ION",
    label: "\uC774\uC628\uC9C8\uD654",
    legacyNames: ["\uC774\uC628\uC9C8\uD654", "\uC9C8\uD654"],
  },
  SOFT: {
    code: "SOFT",
    label: "\uC5F0\uC9C8\uD654",
    legacyNames: ["\uC5F0\uC9C8\uD654", "\uAC00\uC2A4\uC5F0\uC9C8\uD654"],
  },
  GAS: {
    code: "GAS",
    label: "\uAC00\uC2A4\uC9C8\uD654",
    legacyNames: ["\uAC00\uC2A4\uC9C8\uD654"],
  },
};

export const HEAT_TREATMENT_PROCESS_CODES = Object.keys(HEAT_TREATMENT_PROCESS_CODE_META);

export const DEFAULT_HEAT_TREATMENT_MASTER_ROWS = HEAT_TREATMENT_PROCESS_CODES.map((code, index) => ({
  id: `ht-${code.toLowerCase()}`,
  code,
  name: HEAT_TREATMENT_PROCESS_CODE_META[code].label,
  description: `${HEAT_TREATMENT_PROCESS_CODE_META[code].label} \uC5F4\uCC98\uB9AC`,
  active: true,
  order: index + 1,
}));

const DETAIL_TO_PROCESS_CODE = {};
Object.values(HEAT_TREATMENT_PROCESS_CODE_META).forEach((meta) => {
  meta.legacyNames.forEach((name) => {
    DETAIL_TO_PROCESS_CODE[name] = meta.code;
  });
  DETAIL_TO_PROCESS_CODE[meta.label] = meta.code;
});

/** @type {{ id: string, code: string, name: string, active: boolean }[]} */
export const PRODUCTION_PROCESS_CODE_FALLBACK = DEFAULT_HEAT_TREATMENT_MASTER_ROWS.map((row) => ({
  id: row.id,
  code: row.code,
  name: row.name,
  active: row.active !== false,
}));

export function resolveHeatTreatmentProcessCode(labelOrCode) {
  const raw = String(labelOrCode ?? "").trim();
  if (!raw) return "";
  const upper = raw.toUpperCase();
  if (HEAT_TREATMENT_PROCESS_CODE_META[upper]) return upper;
  return DETAIL_TO_PROCESS_CODE[raw] ?? "";
}

export function getHeatTreatmentProcessLabel(code) {
  const key = String(code ?? "").trim().toUpperCase();
  return HEAT_TREATMENT_PROCESS_CODE_META[key]?.label ?? String(code ?? "").trim();
}

export function resolveProductDetailProcessCode(processDetail) {
  return resolveHeatTreatmentProcessCode(processDetail);
}

export function buildHeatTreatmentProcessSelectOptions() {
  return HEAT_TREATMENT_PROCESS_CODES.map((code) => ({
    value: code,
    label: `${getHeatTreatmentProcessLabel(code)} (${code})`,
  }));
}

export function buildDefaultEquipmentMasterRows() {
  return buildRc1EquipmentMasterSeedRows();
}

/**
 * @returns {{ id: string, code: string, name: string, active: boolean }[]}
 */
export function getProductionProcessCodes() {
  const masterItems = getMasterDataByCategory(PRODUCTION_PROCESS_CODE_CATEGORY);
  const active = masterItems.filter((item) => item.active !== false);
  if (active.length > 0) return active;
  return PRODUCTION_PROCESS_CODE_FALLBACK;
}

export function getProductionProcessName(record) {
  return record?.heatTreatment?.trim() || record?.process?.trim() || "—";
}

export {
  getHeatTreatmentProcessTone,
  getHeatTreatmentProcessTone as getProcessChipVariant,
} from "./heatTreatmentProcessColors";
