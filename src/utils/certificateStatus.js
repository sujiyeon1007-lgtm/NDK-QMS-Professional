/**
 * Project TITAN V1.3 — 성적서 리스트 · 검색 (검사완료 제품 자동 표시)
 */

import { matchesBasicSearch } from "../config/listSearchStandard";
import { matchesInboundDataSearch } from "./inboundDataFields";
import {
  buildCertificateEntryFromRecord,
  getCertificateEntryByManagementId,
  getCertificateHistoryEntries,
  isCertificateEntryIssued,
} from "./certificateSession";
import { isCertificateIssued, isCertificateMenuEligible, MENU_TASK_STATUS } from "./menuWorkflowGate";
import { mapV13ProductListRow } from "./processFlow";
import { getSessionProductionRecords } from "./productionRecords";
import { formatQtyWithUnit } from "./productUnits";
import {
  CERTIFICATE_MANAGEMENT_STATUS,
  getCertificateManagementStatus,
} from "./workflowProcessStatus";

function resolveCertificateMenuEntry(record) {
  const existing = getCertificateEntryByManagementId(record.id);
  if (existing) return existing;
  return buildCertificateEntryFromRecord(record);
}

/** 검사완료 제품 — 성적서등록 대기 (미발행) */
export function getCertificateRegisterListRows() {
  return getCertificateMenuListRows().filter((row) => {
    const record = getSessionProductionRecords().find((item) => item.id === row.entry?.managementId);
    if (record && isCertificateIssued(record)) return false;
    if (isCertificateEntryIssued(row.entry)) return false;
    return true;
  });
}

/** 성적서현황 — 발행 완료 이력 (발행 후에도 유지) */
export function getCertificateHistoryListRows() {
  const historyEntries = getCertificateHistoryEntries();
  const historyIds = new Set(historyEntries.map((entry) => entry.managementId));

  const fromEntries = historyEntries.map((entry) => mapCertificateHistoryToListRow(entry));

  const fromRecords = getSessionProductionRecords()
    .filter((record) => isCertificateIssued(record) && !historyIds.has(record.id))
    .map((record) => {
      const entry = buildCertificateEntryFromRecord(record, {
        issueCount: 1,
        lastIssuedDate: record.certificateIssuedAt?.slice(0, 10) || record.updatedAt?.slice(0, 10) || "",
        lastIssuedBy: record.certificateIssuedBy || "",
        isReissue: false,
      });
      return mapCertificateHistoryToListRow({
        ...entry,
        id: entry.id || `history-${record.id}`,
      });
    });

  return [...fromEntries, ...fromRecords].sort((a, b) =>
    String(b.issuedDate).localeCompare(String(a.issuedDate))
  );
}

export function mapCertificateHistoryToListRow(entry) {
  const base = mapCertificateEntryToListRow(entry);
  const issueCount = Number(entry.issueCount) > 0 ? Number(entry.issueCount) : 1;
  return {
    ...base,
    issuedDate: entry.lastIssuedDate || entry.registeredDate || entry.createdAt?.slice(0, 10) || "—",
    issuedBy: entry.lastIssuedBy || entry.registeredBy || "—",
    issueCount,
    isReissue: Boolean(entry.isReissue),
    reissueLabel: entry.isReissue || issueCount > 1 ? "Y" : "—",
  };
}

export function matchesCertificateHistorySearch(row, search) {
  if (!matchesCertificateSearch(row, search)) return false;
  if (search.__chipCertReissued && row.reissueLabel !== "Y") return false;
  return true;
}

/** 검사완료 제품 — 성적서관리 자동 표시 대상 */
export function getCertificateMenuListRows() {
  return getSessionProductionRecords()
    .filter(isCertificateMenuEligible)
    .map((record) => {
      const entry = resolveCertificateMenuEntry(record);
      return mapCertificateEntryToListRow({
        ...entry,
        id: entry.id || `pending-cert-${record.id}`,
      });
    });
}

export function mapCertificateEntryToListRow(entry) {
  const status = getCertificateManagementStatus(entry);
  const record = getSessionProductionRecords().find((item) => item.id === entry.managementId);
  const purchaseOrderNo = entry.purchaseOrderNo || record?.purchaseOrderNo || "";
  const customerLotNo = entry.customerLotNo || record?.customerLotNo || "";
  const heatTreatmentProcess = entry.process?.trim() || record?.process || "—";
  const v13 = record
    ? mapV13ProductListRow(record, status, { screenKey: "certificate" })
    : {
        id: entry.id,
        incomingDate: entry.registeredDate || entry.createdAt?.slice(0, 10) || "—",
        productionDate: "—",
        lotNo: entry.lotNo?.trim() || "—",
        company: entry.company || "—",
        partName: entry.partName || "—",
        partNo: entry.partNo || "—",
        inboundQtyLabel: formatQtyWithUnit(entry.qty, entry.unit),
        workQtyLabel: formatQtyWithUnit(entry.qty, entry.unit),
        currentProcess: "성적서",
        workflowProcess: "성적서",
        workflowStatus: status.label,
        remark: entry.note?.trim() || "—",
        statusLabel: status.label,
        statusVariant: status.variant,
        record: record ?? entry,
      };
  return {
    ...v13,
    id: entry.id,
    screenKey: "certificate",
    managementId: entry.managementId || "—",
    purchaseOrderNo: purchaseOrderNo || "—",
    customerLotNo: customerLotNo || "—",
    material: entry.material || "—",
    qty: formatQtyWithUnit(entry.qty, entry.unit),
    heatTreatmentProcess,
    processName: heatTreatmentProcess,
    excelRegistered: Boolean(entry.excelFile?.name),
    pdfRegistered: Boolean(entry.pdfFile?.name),
    registeredDate: entry.registeredDate || entry.createdAt?.slice(0, 10) || "—",
    assignee: entry.registeredBy || "—",
    entry,
  };
}

export function matchesCertificateSearch(row, search) {
  const entry = row?.entry ?? row;
  if (!entry || typeof entry !== "object") return false;
  const record = getSessionProductionRecords().find((item) => item.id === entry.managementId);
  const merged = {
    ...entry,
    purchaseOrderNo: entry.purchaseOrderNo || record?.purchaseOrderNo,
    customerLotNo: entry.customerLotNo || record?.customerLotNo,
    lotNo: entry.lotNo || record?.lotNo,
    managementId: entry.managementId || record?.id,
  };
  if (!matchesBasicSearch(search, merged)) return false;
  if (!matchesInboundDataSearch(search, merged)) return false;
  if (search.process && row.processName !== search.process) return false;
  if (search.productionDateFrom && row.productionDate < search.productionDateFrom) return false;
  if (search.productionDateTo && row.productionDate > search.productionDateTo) return false;
  if (search.incomingDateFrom && row.incomingDate < search.incomingDateFrom) return false;
  if (search.incomingDateTo && row.incomingDate > search.incomingDateTo) return false;
  if (search.qty && !String(entry.qty ?? "").includes(search.qty)) return false;
  if (search.note && !String(entry.note ?? "").includes(search.note)) return false;
  const issuedDate = row.issuedDate && row.issuedDate !== "—" ? row.issuedDate : row.registeredDate;
  if (search.issuedDateFrom && issuedDate !== "—" && issuedDate < search.issuedDateFrom) return false;
  if (search.issuedDateTo && issuedDate !== "—" && issuedDate > search.issuedDateTo) return false;
  if (search.registeredDateFrom && row.registeredDate !== "—" && row.registeredDate < search.registeredDateFrom) {
    return false;
  }
  if (search.registeredDateTo && row.registeredDate !== "—" && row.registeredDate > search.registeredDateTo) {
    return false;
  }
  if (search.assignee && !String(entry.registeredBy ?? "").includes(search.assignee)) return false;
  if (search.status && row.statusLabel !== search.status) return false;
  if (
    search.__chipCertNotIssued &&
    row.statusLabel !== MENU_TASK_STATUS.CERT_NOT_ISSUED
  ) {
    return false;
  }
  if (search.__chipCertIssued && row.statusLabel !== MENU_TASK_STATUS.CERT_ISSUED) {
    return false;
  }
  if (search.__chipCertWait && row.statusLabel !== CERTIFICATE_MANAGEMENT_STATUS.WAIT) {
    return false;
  }
  if (search.__chipCertDone && row.statusLabel !== CERTIFICATE_MANAGEMENT_STATUS.DONE) {
    return false;
  }
  return true;
}
