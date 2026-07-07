/**
 * Project TITAN V1.6 — Master Data 참조 무결성 · 삭제 정책
 * 사용 중 Master → 삭제 ❌ · 비활성화 ⭕
 */

import { getTitanDataEngine } from "../foundation/data";
import { getSessionProductionRecords } from "./productionRecords";
import { getInspectionLogs } from "./inspectionLogSession";
import { getCertificateFileEntries } from "./certificateSession";
import { canDeleteProduct, isProductUsedInBusiness } from "./productUsage";

function normalizeKey(value) {
  return String(value ?? "").trim().toLowerCase();
}

function timelineReferencesEquipment(timelineItems, equipmentCode) {
  const key = normalizeKey(equipmentCode);
  if (!key) return false;
  return timelineItems.some((item) => normalizeKey(item.target).includes(key));
}

function productionReferencesEquipment(records, equipmentCode, equipmentName) {
  const codeKey = normalizeKey(equipmentCode);
  const nameKey = normalizeKey(equipmentName);
  return records.some((record) => {
    const equipment = normalizeKey(record.equipment);
    return (codeKey && equipment === codeKey) || (nameKey && equipment === nameKey);
  });
}

function engineProductionReferencesEquipment(productionItems, equipmentCode) {
  const key = normalizeKey(equipmentCode);
  if (!key) return false;
  return productionItems.some((item) => normalizeKey(item.equipmentId) === key);
}

export function isEquipmentUsedInBusiness(equipmentCode, equipmentName = "") {
  const records = getSessionProductionRecords();
  if (productionReferencesEquipment(records, equipmentCode, equipmentName)) {
    return true;
  }

  try {
    const engine = getTitanDataEngine();
    if (engineProductionReferencesEquipment(engine.production.list(), equipmentCode)) {
      return true;
    }
    if (timelineReferencesEquipment(engine.timeline.list(), equipmentCode)) {
      return true;
    }
    const storeRecord = engine.equipment.getById(equipmentCode);
    if (storeRecord?.runningSession || (storeRecord?.chargeableLots?.length ?? 0) > 0) {
      return true;
    }
  } catch {
    /* engine unavailable in isolated scripts */
  }

  return false;
}

export function canDeleteEquipment(equipmentCode, equipmentName = "") {
  if (isEquipmentUsedInBusiness(equipmentCode, equipmentName)) {
    return {
      ok: false,
      message:
        "해당 설비는 생산·Timeline 이력과 연결되어 있습니다.\n\n삭제할 수 없습니다.\n\n사용 여부를 '미사용'으로 변경하여 관리해 주세요.",
    };
  }
  return { ok: true };
}

export function isCompanyUsedInBusiness(companyName) {
  const key = normalizeKey(companyName);
  if (!key) return false;

  if (
    getSessionProductionRecords().some((record) => normalizeKey(record.company) === key)
  ) {
    return true;
  }

  if (getInspectionLogs().some((log) => normalizeKey(log.company) === key)) {
    return true;
  }

  const productionByManagementId = new Map(
    getSessionProductionRecords().map((record) => [record.id, record])
  );

  return getCertificateFileEntries().some((entry) => {
    const linked = productionByManagementId.get(entry.managementId);
    return normalizeKey(linked?.company) === key;
  });
}

export function canDeleteCompany(companyName) {
  if (isCompanyUsedInBusiness(companyName)) {
    return {
      ok: false,
      message:
        "해당 거래처는 입고·생산·검사·성적서 이력과 연결되어 있습니다.\n\n삭제할 수 없습니다.\n\n사용 여부를 '미사용'으로 변경하여 관리해 주세요.",
    };
  }
  return { ok: true };
}

export function isWorkerUsedInBusiness(workerName) {
  const key = normalizeKey(workerName);
  if (!key) return false;

  return getSessionProductionRecords().some((record) => {
    const worker = normalizeKey(record.worker ?? record.operator ?? record.manager);
    return worker === key;
  });
}

export function canDeleteWorker(workerName) {
  if (isWorkerUsedInBusiness(workerName)) {
    return {
      ok: false,
      message:
        "해당 작업자는 생산·검사 이력과 연결되어 있습니다.\n\n삭제할 수 없습니다.\n\n사용 여부를 '미사용'으로 변경하여 관리해 주세요.",
    };
  }
  return { ok: true };
}

export { canDeleteProduct, isProductUsedInBusiness };
