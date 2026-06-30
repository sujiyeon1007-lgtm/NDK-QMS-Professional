/**
 * 생산일보 공정 코드 — 기준정보(코드관리) 연동 예정
 * V1.0: 이온질화 · 연질화 고정 · master heatTreatment 와 병합
 */

import { getMasterDataByCategory } from "../utils/masterData";

export const PRODUCTION_PROCESS_CODE_CATEGORY = "heatTreatment";

/** @type {{ id: string, code: string, name: string, active: boolean }[]} */
export const PRODUCTION_PROCESS_CODE_FALLBACK = [
  { id: "proc-ion", code: "ION-N", name: "이온질화", active: true },
  { id: "proc-soft", code: "SOFT-N", name: "연질화", active: true },
];

/**
 * @returns {{ id: string, code: string, name: string, active: boolean }[]}
 */
export function getProductionProcessCodes() {
  const masterItems = getMasterDataByCategory(PRODUCTION_PROCESS_CODE_CATEGORY);
  const preferred = PRODUCTION_PROCESS_CODE_FALLBACK.map((item) => item.name);
  const fromMaster = masterItems.filter((item) => preferred.includes(item.name));

  if (fromMaster.length >= PRODUCTION_PROCESS_CODE_FALLBACK.length) {
    return fromMaster.filter((item) => item.active !== false);
  }

  return PRODUCTION_PROCESS_CODE_FALLBACK;
}

export function getProductionProcessName(record) {
  return record?.heatTreatment?.trim() || record?.process?.trim() || "—";
}

export function getProcessChipVariant(processName) {
  if (processName === "연질화") return "wait";
  if (processName === "이온질화") return "progress";
  return "hold";
}
