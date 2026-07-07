/**
 * Project TITAN V1.7 — Equipment QR Workflow (Master QR · Scan → 장입)
 *
 * QR 분류: Master QR (설비 식별 · 생산 시작) — @see src/config/titanQrArchitectureV17.js
 * 설비 QR Scan → EquipmentStore → 장입 Workflow
 */

import { parseEquipmentFromQrPayload, resolveEquipmentContext } from "./equipmentQr";
import {
  getAvailableLots,
  getEquipmentById,
  getEquipmentDetailSnapshot,
} from "./equipmentWorkflowService";

export function normalizeEquipmentQrCode(codeOrPayload) {
  return parseEquipmentFromQrPayload(codeOrPayload);
}

/**
 * @param {string} codeOrPayload
 */
export function resolveEquipmentQrNavigationPath(codeOrPayload) {
  const code = normalizeEquipmentQrCode(codeOrPayload);
  if (!code) return null;
  return `/production/charging/equipment/${encodeURIComponent(code)}`;
}

/**
 * @param {string} codeOrPayload
 */
export function processEquipmentQrScan(codeOrPayload) {
  const code = normalizeEquipmentQrCode(codeOrPayload);
  if (!code) {
    return { ok: false, message: "유효하지 않은 설비 QR입니다." };
  }

  const masterContext = resolveEquipmentContext(code);
  const equipment = getEquipmentById(code);
  if (!equipment) {
    return {
      ok: false,
      message: `설비 '${code}'를 EquipmentStore에서 찾을 수 없습니다.\n기준정보관리 → 설비관리에서 등록 여부를 확인하세요.`,
    };
  }

  if (masterContext && masterContext.equipment?.active === false) {
    return {
      ok: false,
      message: `설비 '${code}'는 미사용 상태입니다.`,
    };
  }

  const detail = getEquipmentDetailSnapshot(code);
  const availableLots = getAvailableLots(code);

  return {
    ok: true,
    equipmentId: code,
    equipment,
    detail,
    availableLots,
    navigationPath: resolveEquipmentQrNavigationPath(code),
    smartAccessId: equipment.smartAccessId ?? `NDK://EQ/${code}`,
    process: equipment.process ?? masterContext?.process ?? "",
  };
}

/**
 * @param {string} codeOrPayload
 */
export function assertEquipmentQrScan(codeOrPayload) {
  const result = processEquipmentQrScan(codeOrPayload);
  if (!result.ok) {
    throw new Error(result.message ?? "설비 QR 처리 실패");
  }
  return result;
}
