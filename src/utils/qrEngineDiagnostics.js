/**
 * QR Engine Diagnostics — admin operational report (SSoT builder)
 */

import { QR_REGISTRY_TYPES } from "./qrRegistryStore";
import { getQrBrowserBaseUrl } from "../config/qrBrowserUrlConfig";
import { QR_ENGINE_ROUTES } from "../config/qrEngineArchitecture";
import { getMasterDataByCategory } from "./masterData";
import {
  listQrEngineRegistryRows,
  formatEngineDisplayQrId,
} from "./qrEngineRegistryService";
import { getQrEngineRecentScans, getQrEngineScanStats } from "./qrEngineService";
import { getEquipmentList, getEquipmentDetailSnapshot } from "./equipmentWorkflowService";
import { getSessionProductionRecords } from "./productionRecords";
import { getLotLifecycleEventsByLotNo } from "./productionPlanLot";
import { getQrTraceabilityEvents } from "./qrTraceabilitySession";
import { resolveRecordCurrentProcess } from "./workflowProcessStatus";

const PERSISTENCE_KEYS = [
  "project-titan-qr-registry-v1",
  "titan-qr-engine-recent-scans-v1",
  "titan-qr-engine-scan-stats-v1",
  "titan-qr-browser-base-url-v1",
  "titan-operations-production-records-v1",
  "titan-lot-lifecycle-events",
  "project-titan-qr-traceability-v2",
  "project-titan-actual-work-record-v1",
];

function findDuplicateValues(values = []) {
  const counts = new Map();
  values.forEach((value) => {
    const key = String(value ?? "").trim();
    if (!key) return;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  return [...counts.entries()].filter(([, count]) => count > 1).map(([value, count]) => ({ value, count }));
}

function readPersistenceSnapshot() {
  if (typeof window === "undefined") {
    return PERSISTENCE_KEYS.map((key) => ({ key, present: false, bytes: 0 }));
  }
  return PERSISTENCE_KEYS.map((key) => {
    try {
      const raw = window.sessionStorage?.getItem(key) ?? window.localStorage?.getItem(key) ?? "";
      return { key, present: Boolean(raw), bytes: raw ? raw.length : 0 };
    } catch {
      return { key, present: false, bytes: 0 };
    }
  });
}

function buildEquipmentCoverage(registryRows, equipmentMaster) {
  const equipmentRegistry = registryRows.filter((row) => row.qrType === QR_REGISTRY_TYPES.EQUIPMENT);
  const registryByTarget = new Map(equipmentRegistry.map((row) => [row.target, row]));

  return equipmentMaster
    .filter((row) => row.active !== false)
    .map((row) => {
      const code = String(row.code ?? "").trim();
      const qrTarget = String(row.qrUuid ?? row.code ?? "").trim();
      const registry =
        registryByTarget.get(code) ??
        registryByTarget.get(qrTarget) ??
        equipmentRegistry.find((entry) => entry.target === code || entry.target === qrTarget) ??
        null;
      return {
        code,
        name: row.name ?? code,
        qrTarget,
        hasQr: Boolean(registry),
        displayQrId: registry?.displayQrId ?? "",
        browserUrl: registry?.browserUrl ?? (code ? getQrBrowserBaseUrl() + QR_ENGINE_ROUTES.equipmentWork(code) : ""),
        workPath: code ? QR_ENGINE_ROUTES.equipmentWork(code) : "",
      };
    })
    .sort((a, b) => a.code.localeCompare(b.code));
}

function buildEquipmentWorkflowRows() {
  return getEquipmentList().map((item) => {
    const detail = getEquipmentDetailSnapshot(item.id);
    const currentLot = detail?.currentLotNo ?? detail?.runningSession?.lotNo ?? "";
    const lifecycleCount = currentLot ? getLotLifecycleEventsByLotNo(currentLot).length : 0;
    return {
      equipmentId: item.id,
      name: item.name,
      process: item.process ?? "",
      status: item.status ?? "idle",
      currentLot,
      chargeableLotCount: detail?.chargeableLots?.length ?? 0,
      lifecycleEventCount: lifecycleCount,
      workPath: QR_ENGINE_ROUTES.equipmentWork(item.id),
    };
  });
}

function buildLotConnectionSamples(limit = 8) {
  return getSessionProductionRecords()
    .filter((row) => String(row.lotNo ?? "").trim())
    .slice(0, limit)
    .map((row) => {
      const lotNo = String(row.lotNo ?? "").trim();
      const managementId = String(row.id ?? row.mesManagementNo ?? "").trim();
      const process = resolveRecordCurrentProcess(row);
      const lifecycleEvents = getLotLifecycleEventsByLotNo(lotNo);
      const traceEvents = managementId ? getQrTraceabilityEvents(managementId) : [];
      return {
        lotNo,
        managementId,
        companyName: row.companyName ?? row.customerName ?? "",
        partNo: row.partNo ?? "",
        equipmentName: row.equipmentName ?? row.equipment ?? "",
        workflowStatus: process?.label ?? row.workflowStatus ?? "-",
        lifecycleEventCount: lifecycleEvents.length,
        traceabilityEventCount: traceEvents.length,
        lifecyclePath: QR_ENGINE_ROUTES.lotLifecycle(lotNo),
      };
    });
}

export function buildQrEngineDiagnosticsReport() {
  const registryRows = listQrEngineRegistryRows({ autoSync: true });
  const equipmentRegistry = registryRows.filter((row) => row.qrType === QR_REGISTRY_TYPES.EQUIPMENT);
  const equipmentMaster = getMasterDataByCategory("equipment");
  const rawRegistryRows = registryRows.map((row) => row.registryRow ?? row).filter(Boolean);

  const duplicateEntityKeys = findDuplicateValues(
    rawRegistryRows.map((row) => `${row.qrType}::${row.entityKey}`)
  );
  const duplicateRegistryIds = findDuplicateValues(rawRegistryRows.map((row) => row.id));

  const equipmentIndex = equipmentRegistry.reduce((acc, row, index) => {
    acc[row.target] = formatEngineDisplayQrId(QR_REGISTRY_TYPES.EQUIPMENT, index);
    return acc;
  }, {});

  return {
    generatedAt: new Date().toISOString(),
    baseUrl: getQrBrowserBaseUrl(),
    runtimeOrigin: typeof window !== "undefined" ? window.location?.origin ?? "" : "",
    registry: {
      total: registryRows.length,
      equipmentCount: equipmentRegistry.length,
      lotCount: registryRows.filter((row) => row.qrType === QR_REGISTRY_TYPES.LOT).length,
      duplicateEntityKeys,
      duplicateRegistryIds,
    },
    equipmentCoverage: buildEquipmentCoverage(registryRows, equipmentMaster),
    equipmentWorkflow: buildEquipmentWorkflowRows(),
    recentScans: getQrEngineRecentScans(),
    scanStats: getQrEngineScanStats(),
    lotSamples: buildLotConnectionSamples(),
    persistence: readPersistenceSnapshot(),
    equipmentQrIndex: equipmentIndex,
  };
}
