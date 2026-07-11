import { writeJson } from "../../foundation/data/sessionStorageAdapter";
import customerStore from "../../foundation/data/master/customerStore";
import productStore from "../../foundation/data/master/productStore";
import materialStore from "../../foundation/data/master/materialStore";
import workerStore from "../../foundation/data/master/workerStore";
import processStore from "../../foundation/data/master/processStore";
import equipmentStore from "../../foundation/data/equipmentStore";
import lotStore from "../../foundation/data/lotStore";
import productionStore from "../../foundation/data/productionStore";
import qualityStore from "../../foundation/data/qualityStore";
import dashboardStore from "../../foundation/data/dashboardStore";
import timelineStore from "../../foundation/data/timelineStore";
import { buildEquipmentRecordsFromMasterRows } from "../../foundation/data/master/masterDataSync";
import { TITAN_DATA_STORAGE_KEYS } from "../../foundation/data/titanDataStorageKeys";
import {
  DATA_RESET_MASTER_CATEGORIES,
  DATA_RESET_SCOPES,
} from "../../config/titanDataResetPolicy";
import { TITAN_DOCUMENT_JSON_STORAGE_KEY } from "../../config/titanDocumentJsonModel";
import { INCOMING_DOCUMENT_ARCHIVE_STORAGE_KEY } from "../../utils/incomingDocumentArchiveSession";
import {
  OPERATIONS_PRODUCTION_RECORDS_STORAGE_KEY,
  replaceSessionProductionRecords,
  getOperationsRecordCount,
} from "../../utils/productionRecords";
import { resetOperationsHistory } from "../../utils/titanHistorySession";
import { clearMasterDataCategories, getMasterDataByCategory, replaceSessionMasterData, TITAN_EMPTY_MASTER_SEED } from "../../utils/masterData";
import { notifyWorkflowDataRefresh } from "../../utils/titanWorkflowRefresh";
import { appendAuditLog } from "../../utils/environmentSettingsSession";
import { loadTitanDemoData } from "../../utils/productionRecords";
import { getInspectionLogs } from "../../utils/inspectionLogSession";
import { getCertificateFileEntries } from "../../utils/certificateSession";
import { OPERATIONS_DATA_MODE_STORAGE_KEY, OPERATIONS_DATA_MODES } from "../../config/presentationBuildPolicy";
import { resetTitanDataEngineInstance } from "../../foundation/data/TitanDataEngine";

const OPERATIONS_SESSION_KEYS = [
  "project-titan-inspection-log-v3",
  "project-titan-certificate-files-v2",
  "project-titan-inspection-report-v1",
  "titan-defect-history-v2",
  "project-titan-product-drawings-v2",
  "project-titan-quality-notices-v1",
  "project-titan-document-metadata-v1",
  "project-titan-document-pins-v1",
  "project-titan-document-changelog-v1",
  INCOMING_DOCUMENT_ARCHIVE_STORAGE_KEY,
  TITAN_DOCUMENT_JSON_STORAGE_KEY,
  "project-titan-product-inspection-v2",
  "project-titan-development-inspection-v1",
  "project-titan-other-inspection-v1",
  "project-titan-qr-traceability-v2",
];

function resetOperationsData() {
  const clearedKeys = [];

  replaceSessionProductionRecords([]);
  clearedKeys.push(OPERATIONS_PRODUCTION_RECORDS_STORAGE_KEY);

  resetOperationsHistory();
  clearedKeys.push(
    "titan-operations-shipment-events-v1",
    "titan-operations-transaction-statements-v1",
    "titan-operations-defect-records-v1"
  );

  OPERATIONS_SESSION_KEYS.forEach((key) => {
    clearedKeys.push(key);
  });

  writeJson("project-titan-inspection-log-v3", []);
  writeJson("project-titan-certificate-files-v2", []);
  writeJson("project-titan-product-drawings-v2", []);
  writeJson("project-titan-quality-notices-v1", []);
  writeJson("project-titan-inspection-report-v1", {});
  writeJson("project-titan-qr-traceability-v2", {});

  lotStore.replaceAll([]);
  productionStore.replaceAll([]);
  clearedKeys.push(lotStore.storageKey, productionStore.storageKey);

  writeJson(TITAN_DATA_STORAGE_KEYS.quality, {
    inspections: [],
    certificates: [],
    defects: [],
    documents: [],
  });
  clearedKeys.push(TITAN_DATA_STORAGE_KEYS.quality);

  timelineStore.replaceAll([]);
  clearedKeys.push(timelineStore.storageKey);

  dashboardStore.clear();
  clearedKeys.push(dashboardStore.storageKey);

  writeJson(OPERATIONS_DATA_MODE_STORAGE_KEY, OPERATIONS_DATA_MODES.OPERATIONAL);

  notifyWorkflowDataRefresh({ source: "data-reset-operations" });

  return { clearedKeys };
}

function resetMasterData() {
  replaceSessionMasterData(TITAN_EMPTY_MASTER_SEED);

  const categoryKeys = DATA_RESET_MASTER_CATEGORIES.map((item) => item.key);
  clearMasterDataCategories(categoryKeys);

  customerStore.replaceAll([]);
  productStore.replaceAll([]);
  materialStore.replaceAll([]);
  workerStore.replaceAll([]);
  processStore.replaceAll([]);
  equipmentStore.replaceAll(buildEquipmentRecordsFromMasterRows([], []));

  notifyWorkflowDataRefresh({ source: "data-reset-master", categories: categoryKeys });

  return { clearedCategories: categoryKeys };
}

/** @returns {import("../repositoryTypes").DataResetRepository} */
export function createSessionDataResetRepository() {
  return {
    getSummary() {
      return {
        master: DATA_RESET_MASTER_CATEGORIES.reduce((acc, item) => {
          acc[item.key] = getMasterDataByCategory(item.key).length;
          return acc;
        }, {}),
        operations: {
          productionRecords: getOperationsRecordCount(),
          inspections: getInspectionLogs().length,
          certificates: getCertificateFileEntries().length,
        },
      };
    },

    loadDemo() {
      const result = loadTitanDemoData();
      resetTitanDataEngineInstance();
      appendAuditLog({
        type: "create",
        action: "Demo 데이터 불러오기",
        target: "데이터 관리",
      });
      return result;
    },

    reset(scope) {
      if (
        scope !== DATA_RESET_SCOPES.MASTER &&
        scope !== DATA_RESET_SCOPES.OPERATIONS &&
        scope !== DATA_RESET_SCOPES.ALL
      ) {
        return { ok: false, scope, clearedKeys: [], message: `Unknown scope: ${scope}` };
      }

      const clearedKeys = [];
      let clearedCategories = [];

      if (scope === DATA_RESET_SCOPES.MASTER || scope === DATA_RESET_SCOPES.ALL) {
        const masterResult = resetMasterData();
        clearedCategories = masterResult.clearedCategories;
        clearedKeys.push(...clearedCategories.map((key) => `master:${key}`));
      }

      if (scope === DATA_RESET_SCOPES.OPERATIONS || scope === DATA_RESET_SCOPES.ALL) {
        const opsResult = resetOperationsData();
        clearedKeys.push(...opsResult.clearedKeys);
      }

      if (scope === DATA_RESET_SCOPES.ALL) {
        resetTitanDataEngineInstance();
      }

      const actionLabel =
        scope === DATA_RESET_SCOPES.MASTER
          ? "Master \ub370\uc774\ud130 \ucd08\uae30\ud654"
          : scope === DATA_RESET_SCOPES.OPERATIONS
            ? "\uc5c5\ubb34 \ub370\uc774\ud130 \ucd08\uae30\ud654"
            : "\uc804\uccb4 \ub370\uc774\ud130 \ucd08\uae30\ud654";

      appendAuditLog({ type: "delete", action: actionLabel, target: "\ub370\uc774\ud130 \uad00\ub9ac" });

      return {
        ok: true,
        scope,
        clearedKeys,
        clearedCategories,
        message: `${actionLabel} \uc644\ub8cc`,
      };
    },
  };
}