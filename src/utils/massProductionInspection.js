/**
 * Project TITAN V1.3 — 양산검사 리스트 (생산완료 + 검사일지 병합)
 * 입고관리 · 생산관리 SessionStorage 데이터를 관리번호 기준으로 그대로 이어받음
 */

import { matchesBasicSearch } from "../config/listSearchStandard";
import {
  isInspectionMenuEligible,
  MENU_TASK_STATUS,
} from "./menuWorkflowGate";
import { matchesInboundDataSearch } from "./inboundDataFields";
import { getInspectionLogs, normalizeTitanAttachments } from "./inspectionLogSession";
import { mapV13ProductListRow } from "./processFlow";
import {
  getInspectionResultLabel,
  getMassInspectionManagementStatus,
} from "./workflowProcessStatus";
import { getSessionProductionRecords } from "./productionRecords";
import { registerWorkflowScreenCacheInvalidator } from "./titanWorkflowRefresh";
import { formatFoundationAttachmentTypeLabel } from "./foundationAttachmentEngine";
import {
  INSPECTION_TYPE,
  matchesRecordInspectionTypeFilter,
  resolveLogInspectionType,
} from "../config/inspectionManagement";

function resolveProductionCompleteDate(record) {
  const raw =
    record.productionCompletedAt ||
    record.productionEndAt ||
    record.productionWorkLog?.completedAt ||
    record.productionWorkLog?.endAt ||
    "";
  return raw ? String(raw).slice(0, 10) : "—";
}

function resolveMassInspectionStatus(log) {
  return getMassInspectionManagementStatus(log);
}

function buildMassLogIndex(logs = getInspectionLogs(), inspectionTypeFilter = null) {
  /** @type {Map<string, object>} */
  const index = new Map();
  logs
    .filter((log) => {
      if (!log.managementId?.trim()) return false;
      if (log.category === "기타" || log.inspectionCategory === "other") return false;
      const logType = resolveLogInspectionType(log);
      if (inspectionTypeFilter === INSPECTION_TYPE.MASS) return logType === INSPECTION_TYPE.MASS;
      if (inspectionTypeFilter === INSPECTION_TYPE.DEVELOPMENT) {
        return logType === INSPECTION_TYPE.DEVELOPMENT;
      }
      return log.category === "양산" || log.category === "개발";
    })
    .forEach((log) => {
      const key = log.managementId.trim();
      const existing = index.get(key);
      if (!existing || String(log.createdAt) > String(existing.createdAt)) {
        index.set(key, log);
      }
    });
  return index;
}

/** P0-OP-006 Phase 1 — memo keyed on production snapshot + inspection log count */
let massInspectionSnapshot = null;
let massInspectionLogCount = null;
let massInspectionCache = null;

export function invalidateMassProductionInspectionCache() {
  massInspectionSnapshot = null;
  massInspectionLogCount = null;
  massInspectionCache = null;
}

function buildMassProductionInspectionRowsUncached(inspectionTypeFilter = null) {
  const logIndex = buildMassLogIndex(getInspectionLogs(), inspectionTypeFilter);
  return getSessionProductionRecords()
    .filter(isInspectionMenuEligible)
    .filter((record) => matchesRecordInspectionTypeFilter(record, inspectionTypeFilter))
    .map((record) => {
      const log = logIndex.get(record.id) ?? null;
      const status = resolveMassInspectionStatus(log);
      const v13 = mapV13ProductListRow(record, status, { screenKey: "inspection" });
      const attachments = normalizeTitanAttachments(log?.attachments);

      return {
        ...v13,
        id: log?.id ?? record.id,
        rowKey: log?.id ?? `prod-${record.id}`,
        screenKey: "inspection",
        managementId: record.id,
        customerLotNo:
          record.customerLotNo?.trim() ||
          record.purchaseOrderNo?.trim() ||
          log?.customerLotNo?.trim() ||
          log?.purchaseOrderNo?.trim() ||
          "—",
        material: record.material || "—",
        qty: v13.inboundQtyLabel,
        heatTreatmentProcess: v13.heatTreatmentProcess ?? v13.processName,
        processName: v13.heatTreatmentProcess ?? v13.processName,
        inspectionDate: log?.inspectionDate || "—",
        statusLabel: status.label,
        statusVariant: status.variant,
        inspectionResult: getInspectionResultLabel(log),
        registeredDate: log?.createdAt?.slice(0, 10) || resolveProductionCompleteDate(record),
        inspectionStatus: status.label,
        inspectionStatusVariant: status.variant,
        assignee: log?.assignee || record.registrar || record.worker || "—",
        note: log?.note || record.note || "",
        attachments,
        attachmentCount: attachments.length,
        logId: log?.id ?? null,
        record,
        log,
      };
    })
    .sort((a, b) => b.registeredDate.localeCompare(a.registeredDate));
}

export function getMassProductionInspectionRows(options = {}) {
  const inspectionTypeFilter = options.inspectionType ?? null;
  const snapshot = getSessionProductionRecords();
  const logCount = getInspectionLogs().length;
  const cacheKey = `${inspectionTypeFilter ?? "all"}:${logCount}:${snapshot.length}`;
  if (
    massInspectionSnapshot === snapshot &&
    massInspectionLogCount === logCount &&
    massInspectionCache &&
    massInspectionCache.__cacheKey === cacheKey
  ) {
    return massInspectionCache.rows;
  }

  const result = buildMassProductionInspectionRowsUncached(inspectionTypeFilter);
  massInspectionSnapshot = snapshot;
  massInspectionLogCount = logCount;
  massInspectionCache = { __cacheKey: cacheKey, rows: result };
  return result;
}

export function matchesMassProductionInspectionSearch(row, search) {
  const merged = {
    ...row.record,
    ...row,
    managementId: row.managementId,
    lotNo: row.lotNo,
    note: row.note,
  };

  if (!matchesBasicSearch(search, merged)) return false;
  if (!matchesInboundDataSearch(search, merged)) return false;

  if (search.managementId && !String(row.managementId).includes(search.managementId.trim())) {
    return false;
  }
  if (search.lotNo && !String(row.lotNo).includes(search.lotNo.trim())) return false;
  if (search.status && row.statusLabel !== search.status.trim()) return false;
  if (
    search.__chipInspectNotDone &&
    row.statusLabel !== MENU_TASK_STATUS.INSPECT_NOT_DONE
  ) {
    return false;
  }
  if (search.__chipInspectDone && row.statusLabel !== MENU_TASK_STATUS.INSPECT_DONE) {
    return false;
  }
  if (search.assignee && !String(row.assignee).includes(search.assignee.trim())) return false;
  if (search.process && row.processName !== search.process.trim()) return false;

  if (
    search.incomingDateFrom &&
    row.incomingDate !== "—" &&
    row.incomingDate < search.incomingDateFrom
  ) {
    return false;
  }
  if (
    search.incomingDateTo &&
    row.incomingDate !== "—" &&
    row.incomingDate > search.incomingDateTo
  ) {
    return false;
  }
  if (
    search.productionDateFrom &&
    row.productionDate !== "—" &&
    row.productionDate < search.productionDateFrom
  ) {
    return false;
  }
  if (
    search.productionDateTo &&
    row.productionDate !== "—" &&
    row.productionDate > search.productionDateTo
  ) {
    return false;
  }
  if (
    search.registeredDateFrom &&
    row.registeredDate !== "—" &&
    row.registeredDate < search.registeredDateFrom
  ) {
    return false;
  }
  if (
    search.registeredDateTo &&
    row.registeredDate !== "—" &&
    row.registeredDate > search.registeredDateTo
  ) {
    return false;
  }
  if (search.note && !String(row.note ?? "").includes(search.note.trim())) return false;
  if (search.attachmentStatus?.trim()) {
    const query = search.attachmentStatus.trim().toLowerCase();
    const count = Number(row.attachmentCount ?? 0);
    const attachmentNames = (row.attachments ?? [])
      .map((attachment) => `${formatFoundationAttachmentTypeLabel(attachment)} ${attachment.name}`)
      .join(" ")
      .toLowerCase();
    if (query.includes("미") || query.includes("없")) {
      if (count > 0) return false;
    } else if (query.includes("등록") || query.includes("첨부")) {
      if (count === 0) return false;
    } else if (!attachmentNames.includes(query)) {
      return false;
    }
  }
  if (search.customerLotNo?.trim()) {
    const query = search.customerLotNo.trim().toLowerCase();
    const mergedLot = String(row.customerLotNo ?? "").toLowerCase();
    const po = String(row.record?.purchaseOrderNo ?? row.log?.purchaseOrderNo ?? "").toLowerCase();
    if (!mergedLot.includes(query) && !po.includes(query)) return false;
  }
  if (search.purchaseOrderNo?.trim()) {
    const query = search.purchaseOrderNo.trim().toLowerCase();
    const mergedLot = String(row.customerLotNo ?? "").toLowerCase();
    const po = String(row.record?.purchaseOrderNo ?? row.log?.purchaseOrderNo ?? "").toLowerCase();
    if (!mergedLot.includes(query) && !po.includes(query)) return false;
  }
  return true;
}

registerWorkflowScreenCacheInvalidator(invalidateMassProductionInspectionCache);
