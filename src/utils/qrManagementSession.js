/**
 * Project TITAN V1.3 — QR관리 Session API (delegates to qrRegistryStore)
 */

import { getCurrentTitanUser } from "./titanHistorySession";
import { getMasterDataByCategory } from "./masterData";
import { getSessionProductionRecords, updateSessionProductionRecord } from "./productionRecords";
import {
  buildEquipmentQrPayloadText,
  buildInoutQrPayloadText,
  mapQrEquipmentListRow,
  mapQrInoutListRow,
} from "./qrManagementModel";
import {
  QR_REGISTRY_TYPES,
  createQrRegistryEntry,
  deleteQrRegistryEntry,
  getQrByEntitySync,
  getQrByIdSync,
  listQrRegistrySync,
  markQrRegistryPrinted,
  regenerateQrRegistryEntry,
  upsertQrRegistryEntry,
} from "./qrRegistryStore";

function migrateLegacyProductionQrFlags() {
  getSessionProductionRecords()
    .filter((record) => record.qrGenerated)
    .forEach((record) => {
      const existing = getQrByEntitySync(QR_REGISTRY_TYPES.INOUT, record.id);
      if (existing) return;
      upsertQrRegistryEntry({
        id: `QR-inout-${record.id}`,
        qrType: QR_REGISTRY_TYPES.INOUT,
        entityKey: record.id,
        payload: buildInoutQrPayloadText({ ...record, managementId: record.id }),
        status: "active",
        createdAt: record.lotCreatedAt ?? record.incomingDate ?? new Date().toISOString(),
        createdBy: "Program Administrator",
        printCount: 0,
      });
    });
}

let migrationDone = false;
function ensureMigrated() {
  if (migrationDone) return;
  migrationDone = true;
  migrateLegacyProductionQrFlags();
}

export function getQrInoutListRows() {
  ensureMigrated();
  const qrByEntity = new Map(
    listQrRegistrySync(QR_REGISTRY_TYPES.INOUT).map((row) => [row.entityKey, row])
  );
  return getSessionProductionRecords()
    .filter((record) => record.incomingRegistered)
    .map((record) => mapQrInoutListRow(record, qrByEntity.get(record.id) ?? null))
    .sort((a, b) => String(b.managementId).localeCompare(String(a.managementId)));
}

export function getQrEquipmentListRows() {
  ensureMigrated();
  const qrByEntity = new Map(
    listQrRegistrySync(QR_REGISTRY_TYPES.EQUIPMENT).map((row) => [row.entityKey, row])
  );
  return getMasterDataByCategory("equipment")
    .filter((row) => row.active !== false)
    .map((equipment) =>
      mapQrEquipmentListRow(equipment, qrByEntity.get(equipment.code) ?? null)
    )
    .sort((a, b) => String(a.equipmentCode).localeCompare(String(b.equipmentCode)));
}

/** @deprecated use getQrInoutListRows */
export function getQrManagementRecords() {
  ensureMigrated();
  return listQrRegistrySync(QR_REGISTRY_TYPES.INOUT).map((qrRecord) => {
    const record = getSessionProductionRecords().find((item) => item.id === qrRecord.entityKey);
    return mapQrInoutListRow(record, qrRecord);
  });
}

export function getQrRecordById(qrId) {
  ensureMigrated();
  return getQrByIdSync(qrId);
}

export function getQrRecordByManagementId(managementId) {
  ensureMigrated();
  return getQrByEntitySync(QR_REGISTRY_TYPES.INOUT, managementId);
}

export function getQrCreatableProductionRecords() {
  ensureMigrated();
  const existing = new Set(
    listQrRegistrySync(QR_REGISTRY_TYPES.INOUT).map((item) => item.entityKey)
  );
  return getSessionProductionRecords().filter(
    (record) => record.incomingRegistered && !existing.has(record.id)
  );
}

export function getQrCreatableEquipmentRecords() {
  ensureMigrated();
  const existing = new Set(
    listQrRegistrySync(QR_REGISTRY_TYPES.EQUIPMENT).map((item) => item.entityKey)
  );
  return getMasterDataByCategory("equipment").filter(
    (row) => row.active !== false && !existing.has(row.code)
  );
}

export function createInoutQrRecord(managementId, createdBy = getCurrentTitanUser()) {
  ensureMigrated();
  const record = getSessionProductionRecords().find((item) => item.id === managementId);
  if (!record) return { ok: false, message: "제품을 찾을 수 없습니다." };

  const payload = buildInoutQrPayloadText({ ...record, managementId: record.id });
  const result = createQrRegistryEntry(QR_REGISTRY_TYPES.INOUT, managementId, payload, createdBy);
  if (!result.ok) return result;

  updateSessionProductionRecord(managementId, { qrGenerated: true });
  return { ok: true, record: mapQrInoutListRow(record, result.record) };
}

export function createEquipmentQrRecord(equipmentCode, createdBy = getCurrentTitanUser()) {
  ensureMigrated();
  const equipment = getMasterDataByCategory("equipment").find(
    (row) => row.code === equipmentCode
  );
  if (!equipment) return { ok: false, message: "설비를 찾을 수 없습니다." };

  const payload = buildEquipmentQrPayloadText(equipment);
  const result = createQrRegistryEntry(
    QR_REGISTRY_TYPES.EQUIPMENT,
    equipment.code,
    payload,
    createdBy
  );
  if (!result.ok) return result;

  return { ok: true, record: mapQrEquipmentListRow(equipment, result.record) };
}

/** @deprecated use createInoutQrRecord */
export function createQrRecord(managementId, createdBy = getCurrentTitanUser()) {
  return createInoutQrRecord(managementId, createdBy);
}

export function regenerateInoutQrRecord(qrId, createdBy = getCurrentTitanUser()) {
  ensureMigrated();
  const current = getQrByIdSync(qrId);
  if (!current || current.qrType !== QR_REGISTRY_TYPES.INOUT) {
    return { ok: false, message: "QR을 찾을 수 없습니다." };
  }

  const production = getSessionProductionRecords().find((item) => item.id === current.entityKey);
  if (!production) return { ok: false, message: "연결된 제품 정보가 없습니다." };

  const payload = buildInoutQrPayloadText({ ...production, managementId: production.id });
  return regenerateQrRegistryEntry(qrId, payload, createdBy);
}

export function regenerateEquipmentQrRecord(qrId, createdBy = getCurrentTitanUser()) {
  ensureMigrated();
  const current = getQrByIdSync(qrId);
  if (!current || current.qrType !== QR_REGISTRY_TYPES.EQUIPMENT) {
    return { ok: false, message: "QR을 찾을 수 없습니다." };
  }

  const equipment = getMasterDataByCategory("equipment").find(
    (row) => row.code === current.entityKey
  );
  if (!equipment) return { ok: false, message: "연결된 설비 정보가 없습니다." };

  const payload = buildEquipmentQrPayloadText(equipment);
  return regenerateQrRegistryEntry(qrId, payload, createdBy);
}

/** @deprecated use regenerateInoutQrRecord */
export function regenerateQrRecord(qrId, createdBy = getCurrentTitanUser()) {
  return regenerateInoutQrRecord(qrId, createdBy);
}

export function deleteInoutQrRecord(qrId) {
  ensureMigrated();
  const current = getQrByIdSync(qrId);
  if (!current || current.qrType !== QR_REGISTRY_TYPES.INOUT) {
    return { ok: false, message: "QR을 찾을 수 없습니다." };
  }

  const result = deleteQrRegistryEntry(qrId);
  if (result.ok) {
    updateSessionProductionRecord(current.entityKey, { qrGenerated: false });
  }
  return result;
}

export function deleteEquipmentQrRecord(qrId) {
  ensureMigrated();
  const current = getQrByIdSync(qrId);
  if (!current || current.qrType !== QR_REGISTRY_TYPES.EQUIPMENT) {
    return { ok: false, message: "QR을 찾을 수 없습니다." };
  }
  return deleteQrRegistryEntry(qrId);
}

/** @deprecated use deleteInoutQrRecord */
export function deleteQrRecord(qrId) {
  return deleteInoutQrRecord(qrId);
}

export function reprintQrRecords(qrIds = []) {
  ensureMigrated();
  const validIds = qrIds.filter((id) => id && getQrByIdSync(id));
  return markQrRegistryPrinted(validIds);
}
