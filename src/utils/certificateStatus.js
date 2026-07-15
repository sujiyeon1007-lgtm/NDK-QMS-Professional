/**
 * Project TITAN V1.3 — 성적서 리스트 · 검색 (검사완료 제품 자동 표시)
 */

import { matchesBasicSearch } from "../config/listSearchStandard";
import { matchesInboundDataSearch } from "./inboundDataFields";
import {
  buildCertificateEntryFromRecord,
  getCertificateEntryForRecord,
  getCertificateHistoryEntries,
  isCertificateEntryIssued,
} from "./certificateSession";
import { isCertificateIssued, isCertificateMenuEligible, MENU_TASK_STATUS } from "./menuWorkflowGate";
import { mapV13ProductListRow } from "./processFlow";
import { getSessionProductionRecords } from "./productionRecords";
import { expandRecordsByChargeHistory, buildRecordLotRowKey } from "./lotBundleService";
import { resolveChargeQty } from "./equipmentChargingQty";
import { formatQtyWithUnit } from "./productUnits";
import {
  CERTIFICATE_MANAGEMENT_STATUS,
  getCertificateManagementStatus,
} from "./workflowProcessStatus";

function resolveCertificateMenuEntry(record) {
  const existing = getCertificateEntryForRecord(record);
  if (existing) return existing;
  return buildCertificateEntryFromRecord(record);
}

function resolveCertificateRowLotNo(row) {
  const fromEntry = String(row?.entry?.lotNo ?? "").trim();
  if (fromEntry) return fromEntry;
  const fromRow = String(row?.lotNo ?? "").trim();
  return fromRow && fromRow !== "—" ? fromRow : "";
}

/** 검사완료 LOT — 성적서등록 대기 (미발행 · 제품 집계 ❌) */
export function getCertificateRegisterListRows() {
  return getCertificateMenuListRows().filter((row) => {
    if (isCertificateEntryIssued(row.entry)) return false;
    const lotNo = resolveCertificateRowLotNo(row);
    const record = getSessionProductionRecords().find((item) => item.id === row.entry?.managementId);
    if (record && isCertificateIssued({ ...record, lotNo: lotNo || record.lotNo })) {
      return false;
    }
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

/** 검사완료 LOT — 성적서관리 자동 표시 대상 (one row per chargeHistory LOT) */
export function getCertificateMenuListRows() {
  const seen = new Set();
  const rows = [];

  expandRecordsByChargeHistory(getSessionProductionRecords())
    .filter(isCertificateMenuEligible)
    .forEach((record) => {
      const key = buildRecordLotRowKey(record);
      if (key && seen.has(key)) return;
      if (key) seen.add(key);

      const lotNo = record.lotNo?.trim() || "";
      const chargeQty = resolveChargeQty(record, { lotNo });
      const entry = resolveCertificateMenuEntry(record);
      rows.push(
        mapCertificateEntryToListRow({
          ...entry,
          id: entry.id || `pending-cert-${key || record.id}`,
          lotNo: lotNo || entry.lotNo,
          qty: chargeQty || Number(entry.qty) || 0,
        })
      );
    });

  return rows;
}

export function mapCertificateEntryToListRow(entry) {
  const status = getCertificateManagementStatus(entry);
  const record = getSessionProductionRecords().find((item) => item.id === entry.managementId);
  const lotNo = String(entry.lotNo ?? record?.lotNo ?? "").trim();
  const chargeQty = resolveChargeQty(
    record
      ? { ...record, lotNo, chargeQty: entry.qty ?? record.chargeQty }
      : { ...entry, lotNo, chargeQty: entry.qty },
    { lotNo }
  );
  const purchaseOrderNo = entry.purchaseOrderNo || record?.purchaseOrderNo || "";
  const customerLotNo = entry.customerLotNo || record?.customerLotNo || "";
  const heatTreatmentProcess = entry.process?.trim() || record?.process || "—";
  const unit = entry.unit || record?.unit || "EA";
  const v13 = record
    ? mapV13ProductListRow(
        { ...record, lotNo: lotNo || record.lotNo, workQty: chargeQty, chargeQty },
        status,
        { screenKey: "certificate", workQty: chargeQty }
      )
    : {
        id: entry.id,
        incomingDate: entry.registeredDate || entry.createdAt?.slice(0, 10) || "—",
        productionDate: "—",
        lotNo: lotNo || "—",
        company: entry.company || "—",
        partName: entry.partName || "—",
        partNo: entry.partNo || "—",
        inboundQtyLabel: formatQtyWithUnit(chargeQty, unit),
        workQtyLabel: formatQtyWithUnit(chargeQty, unit),
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
    lotNo: lotNo || v13.lotNo || "—",
    purchaseOrderNo: purchaseOrderNo || "—",
    customerLotNo: customerLotNo || "—",
    material: entry.material || "—",
    qty: formatQtyWithUnit(chargeQty, unit),
    workQtyLabel: formatQtyWithUnit(chargeQty, unit),
    heatTreatmentProcess,
    processName: heatTreatmentProcess,
    excelRegistered: Boolean(entry.excelFile?.name),
    pdfRegistered: Boolean(entry.pdfFile?.name),
    registeredDate: entry.registeredDate || entry.createdAt?.slice(0, 10) || "—",
    assignee: entry.registeredBy || "—",
    entry: { ...entry, lotNo, qty: chargeQty, unit },
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
