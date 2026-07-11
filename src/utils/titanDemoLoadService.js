/**
 * Project TITAN — Demo 데이터 명시적 로드 (RC1 → V1.1)
 * 앱 초기화·전체 초기화 후 자동 실행 ❌ — 관리자 버튼 전용
 */

import { writeJson } from "../foundation/data/sessionStorageAdapter";
import lotStore, { buildSeedLotRecords } from "../foundation/data/lotStore";
import productionStore, { mapDemoToProductionRecord } from "../foundation/data/productionStore";
import qualityStore, { buildSeedQualityBundle } from "../foundation/data/qualityStore";
import timelineStore, { buildSeedTimelineRecords } from "../foundation/data/timelineStore";
import { syncAllMasterStoresFromSession } from "../foundation/data/master/masterDataSync";
import {
  TITAN_DEMO_PRODUCTION_RECORDS,
  getTitanDemoInspectionLogSeeds,
  getTitanDemoCertificateSeeds,
  buildQaDemoMasterSeed,
  TITAN_QA_DEMO_SHIPMENT_EVENTS,
  RC1_DEMO_BRANDING_PATCH,
} from "../data/titanDemoSampleData";
import companyStore from "../foundation/data/master/companyStore";
import {
  OPERATIONS_DATA_MODES,
  TITAN_QA_DEMO_SEED_VERSION,
} from "../config/presentationBuildPolicy";
import {
  replaceSessionMasterData,
  TITAN_OPERATIONAL_MASTER_SEED,
  getSessionMasterData,
} from "./masterData";
import {
  replaceSessionProductionRecords,
  getSessionProductionRecords,
} from "./productionRecords";
import { replaceOperationsHistory } from "./titanHistorySession";
import { notifyWorkflowDataRefresh } from "./titanWorkflowRefresh";
import { readJson, writeJson as writeSessionJson } from "../foundation/data/sessionStorageAdapter";
import { OPERATIONS_DATA_MODE_STORAGE_KEY } from "../config/presentationBuildPolicy";

const INSPECTION_LOG_KEY = "project-titan-inspection-log-v3";
const CERTIFICATE_FILES_KEY = "project-titan-certificate-files-v2";

function seedDemoSessionModules(records) {
  const inspectionLogs = getTitanDemoInspectionLogSeeds(records);
  const certificates = getTitanDemoCertificateSeeds(records);
  writeSessionJson(INSPECTION_LOG_KEY, inspectionLogs);
  writeSessionJson(CERTIFICATE_FILES_KEY, certificates);
  return { inspectionCount: inspectionLogs.length, certificateCount: certificates.length };
}

function seedDemoFoundationStores(records) {
  productionStore.replaceAll(records.map((row) => mapDemoToProductionRecord(row)));
  lotStore.replaceAll(buildSeedLotRecords(records));
  qualityStore.read();
  writeJson(qualityStore.storageKey, buildSeedQualityBundle(records));
  timelineStore.replaceAll(buildSeedTimelineRecords());
}

/**
 * Demo Master + Demo 업무 + 시연용 Workflow 데이터 (관리자 버튼 전용)
 */
export function loadTitanDemoData() {
  const profile = companyStore.get();
  companyStore.replace({
    ...profile,
    companyMaster: {
      ...profile.companyMaster,
      ...RC1_DEMO_BRANDING_PATCH.companyMaster,
      updatedAt: new Date().toISOString(),
    },
    branding: { ...profile.branding, ...RC1_DEMO_BRANDING_PATCH.branding },
    documentFooter: {
      ...profile.documentFooter,
      ...RC1_DEMO_BRANDING_PATCH.documentFooter,
      updatedAt: new Date().toISOString(),
    },
  });

  const demoMaster = {
    ...buildQaDemoMasterSeed(TITAN_OPERATIONAL_MASTER_SEED),
    equipment: [...TITAN_OPERATIONAL_MASTER_SEED.equipment],
    workers: [...TITAN_OPERATIONAL_MASTER_SEED.workers],
    heatTreatment: [...TITAN_OPERATIONAL_MASTER_SEED.heatTreatment],
    customCodes: [...TITAN_OPERATIONAL_MASTER_SEED.customCodes],
  };
  replaceSessionMasterData(demoMaster);
  syncAllMasterStoresFromSession(getSessionMasterData());

  const demoRecords = TITAN_DEMO_PRODUCTION_RECORDS.map((row) => ({ ...row }));
  replaceSessionProductionRecords(demoRecords);
  replaceOperationsHistory({
    shipmentEvents: TITAN_QA_DEMO_SHIPMENT_EVENTS.map((row) => ({ ...row })),
    transactionStatements: [],
    defectRecords: [],
  });

  const sessionSeed = seedDemoSessionModules(demoRecords);
  seedDemoFoundationStores(demoRecords);

  writeSessionJson(OPERATIONS_DATA_MODE_STORAGE_KEY, OPERATIONS_DATA_MODES.QA_DEMO);

  notifyWorkflowDataRefresh({
    source: "demo-load-explicit",
    mode: OPERATIONS_DATA_MODES.QA_DEMO,
    version: TITAN_QA_DEMO_SEED_VERSION,
  });

  return {
    ok: true,
    mode: OPERATIONS_DATA_MODES.QA_DEMO,
    recordCount: getSessionProductionRecords().length,
    inspectionCount: sessionSeed.inspectionCount,
    certificateCount: sessionSeed.certificateCount,
    version: TITAN_QA_DEMO_SEED_VERSION,
    message: `Demo 데이터 로드 완료 · ${getSessionProductionRecords().length}건`,
  };
}
