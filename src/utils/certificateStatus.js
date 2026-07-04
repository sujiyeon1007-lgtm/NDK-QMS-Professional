/**
 * Project TITAN V1.0 — 성적서 파일 리스트 · 검색
 */

import { matchesBasicSearch } from "../config/listSearchStandard";
import { matchesInboundDataSearch } from "./inboundDataFields";
import { getSessionProductionRecords } from "./productionRecords";
import { getCertificateFileStatus } from "./certificateSession";
import { formatQtyWithUnit } from "./productUnits";

import { mapV13ProductListRow } from "./processFlow";

export function mapCertificateEntryToListRow(entry) {
  const status = getCertificateFileStatus(entry);
  const record = getSessionProductionRecords().find((item) => item.id === entry.managementId);
  const purchaseOrderNo = entry.purchaseOrderNo || record?.purchaseOrderNo || "";
  const customerLotNo = entry.customerLotNo || record?.customerLotNo || "";
  const v13 = record
    ? mapV13ProductListRow(record, status)
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
        currentProcess: entry.process || "—",
        remark: entry.note?.trim() || "—",
        statusLabel: status.label,
        statusVariant: status.variant,
        record: record ?? entry,
      };
  return {
    ...v13,
    id: entry.id,
    managementId: entry.managementId || "—",
    purchaseOrderNo: purchaseOrderNo || "—",
    customerLotNo: customerLotNo || "—",
    material: entry.material || "—",
    qty: formatQtyWithUnit(entry.qty, entry.unit),
    processName: entry.process || "—",
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
  return true;
}
