/**
 * Project TITAN V1.0 — 성적서 파일 리스트 · 검색
 */

import { matchesBasicSearch } from "../config/listSearchStandard";
import { getCertificateFileStatus } from "./certificateSession";
import { formatQtyWithUnit } from "./productUnits";

export function mapCertificateEntryToListRow(entry) {
  const status = getCertificateFileStatus(entry);
  return {
    id: entry.id,
    managementId: entry.managementId || "—",
    lotNo: entry.lotNo?.trim() || "—",
    company: entry.company || "—",
    partName: entry.partName || "—",
    partNo: entry.partNo || "—",
    material: entry.material || "—",
    qty: formatQtyWithUnit(entry.qty, entry.unit),
    processName: entry.process || "—",
    excelRegistered: Boolean(entry.excelFile?.name),
    pdfRegistered: Boolean(entry.pdfFile?.name),
    registeredDate: entry.registeredDate || entry.createdAt?.slice(0, 10) || "—",
    statusLabel: status.label,
    statusVariant: status.variant,
    assignee: entry.registeredBy || "—",
    entry,
  };
}

export function matchesCertificateSearch(row, search) {
  const entry = row.entry;
  if (!matchesBasicSearch(search, entry)) return false;

  if (
    search.managementId &&
    !String(entry.managementId ?? "")
      .toLowerCase()
      .includes(search.managementId.toLowerCase())
  ) {
    return false;
  }
  if (
    search.lotNo &&
    !String(entry.lotNo ?? "")
      .toLowerCase()
      .includes(search.lotNo.toLowerCase())
  ) {
    return false;
  }
  if (search.process && row.processName !== search.process) return false;
  if (search.registeredDateFrom && row.registeredDate < search.registeredDateFrom) return false;
  if (search.registeredDateTo && row.registeredDate > search.registeredDateTo) return false;
  if (search.assignee && !String(entry.registeredBy ?? "").includes(search.assignee)) return false;
  if (search.status && row.statusLabel !== search.status) return false;
  return true;
}
