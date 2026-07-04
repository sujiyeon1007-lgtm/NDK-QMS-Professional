/**
 * Project TITAN V1.1 — 설비 QR (Smart Access · active target: equipment)
 * Canonical: NDK://EQ/{equipmentCode}
 * Legacy:    NDK|EQ|{equipmentCode}
 * URL: buildSmartAccessPath("equipment", { code }) — QR/NFC 동일
 *
 * @see src/config/titanOfficialArchitecture.js — SMART_ACCESS_ID_REGISTRY.equipment
 * @see src/config/smartAccessArchitecture.js — SMART_ACCESS_TARGETS.equipment
 * @see src/config/titanV11Workflow.js
 */

import {
  buildCanonicalSmartAccessId,
  buildLegacySmartAccessPayload,
  parseSmartAccessId,
} from "../config/titanOfficialArchitecture";
import { buildEquipmentQrPayloadText } from "./qrManagementModel";
import { getMasterDataByCategory } from "./masterData";

const EQUIPMENT_QR_PREFIX_LEGACY = "NDK|EQ|";
const EQUIPMENT_QR_PREFIX_CANONICAL = "NDK://EQ/";

/** @deprecated use buildCanonicalSmartAccessId("equipment", code) — legacy alias kept for compat */
export function buildEquipmentQrValue(equipmentCode) {
  const code = String(equipmentCode ?? "").trim();
  if (!code) return "";
  return buildLegacySmartAccessPayload("equipment", code) || `${EQUIPMENT_QR_PREFIX_LEGACY}${code}`;
}

/** Build official canonical Smart Access ID for equipment */
export function buildEquipmentCanonicalId(equipmentCode) {
  return buildCanonicalSmartAccessId("equipment", equipmentCode);
}

export function parseEquipmentFromQrPayload(payload) {
  const text = String(payload ?? "").trim();
  if (!text) return null;

  const parsed = parseSmartAccessId(text);
  if (parsed && (parsed.registryId === "equipment" || parsed.registryId === "equipmentInfo")) {
    return parsed.code || null;
  }

  const upper = text.toUpperCase();
  if (upper.startsWith(EQUIPMENT_QR_PREFIX_CANONICAL.toUpperCase())) {
    return text.slice(EQUIPMENT_QR_PREFIX_CANONICAL.length).trim();
  }

  if (upper.startsWith(EQUIPMENT_QR_PREFIX_LEGACY)) {
    return text.slice(EQUIPMENT_QR_PREFIX_LEGACY.length).trim();
  }

  return text;
}

/**
 * 설비 코드/QR → Master 설비 + 공정(equipType)
 * @param {string} codeOrPayload
 */
export function resolveEquipmentContext(codeOrPayload) {
  const code = parseEquipmentFromQrPayload(codeOrPayload);
  if (!code) return null;

  const normalized = code.toLowerCase();
  const row = getMasterDataByCategory("equipment").find((item) => {
    if (item.active === false) return false;
    const itemCode = String(item.code ?? "").trim().toLowerCase();
    const itemName = String(item.name ?? "").trim().toLowerCase();
    return itemCode === normalized || itemName === normalized;
  });

  if (!row) return null;

  return {
    id: row.id,
    code: row.code,
    name: row.name,
    process: row.equipType ?? "",
    location: row.location ?? "",
    inspectionCycle: row.inspectionCycle ?? "월 1회",
    equipment: row,
    qrValue: buildEquipmentQrValue(row.code ?? row.name),
  };
}

/** Label print payload (V1.3 Phase 1) */
export function buildEquipmentQrPayload(equipment) {
  return buildEquipmentQrPayloadText(equipment);
}

export { buildEquipmentQrPayloadText };
