/**
 * Project TITAN V1.3 — 성적서 리스트 · 검색 (검사완료 제품 자동 표시)
 */

import { matchesBasicSearch } from "../config/listSearchStandard";
import { matchesInboundDataSearch } from "./inboundDataFields";
import {
  buildCertificateEntryFromRecord,
  getCertificateEntryByManagementId,
} from "./certificateSession";
import { isCertificateMenuEligible, MENU_TASK_STATUS } from "./menuWorkflowGate";
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
  const entry = row.entry;
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
  if (search.registeredDateFrom && row.registeredDate < search.registeredDateFrom) return false;
  if (search.registeredDateTo && row.registeredDate > search.registeredDateTo) return false;
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
