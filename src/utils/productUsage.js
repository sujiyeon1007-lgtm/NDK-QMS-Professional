/**
 * Project TITAN V1.0 — 제품 업무 연동 · 사용 통계
 */

import { getSessionProductionRecords } from "./productionRecords";
import { getInspectionLogs } from "./inspectionLogSession";
import { getCertificateFileEntries } from "./certificateSession";

function normalizePartNo(partNo) {
  return String(partNo ?? "").trim().toLowerCase();
}

function bumpUsage(stats, dateValue) {
  stats.count += 1;
  const date = String(dateValue ?? "").trim();
  if (date && (!stats.lastUsedDate || date > stats.lastUsedDate)) {
    stats.lastUsedDate = date;
  }
}

export function getProductUsageStats(partNo) {
  const q = normalizePartNo(partNo);
  const stats = { count: 0, lastUsedDate: null };

  if (!q) {
    return { ...stats, usageCountLabel: "—", lastUsedLabel: "—" };
  }

  getSessionProductionRecords().forEach((record) => {
    if (normalizePartNo(record.partNo) !== q) return;
    bumpUsage(stats, record.workDate || record.incomingDate);
  });

  getInspectionLogs().forEach((log) => {
    if (normalizePartNo(log.partNo) !== q) return;
    bumpUsage(stats, log.inspectionDate);
  });

  const productionByManagementId = new Map(
    getSessionProductionRecords().map((record) => [record.id, record])
  );

  getCertificateFileEntries().forEach((entry) => {
    const linked = productionByManagementId.get(entry.managementId);
    if (normalizePartNo(linked?.partNo) !== q) return;
    bumpUsage(stats, entry.updatedAt?.slice(0, 10) || entry.createdAt?.slice(0, 10));
  });

  return {
    ...stats,
    usageCountLabel: stats.count > 0 ? `${stats.count.toLocaleString("ko-KR")}건` : "—",
    lastUsedLabel: stats.lastUsedDate || "—",
  };
}

export function isProductUsedInBusiness(partNo) {
  return getProductUsageStats(partNo).count > 0;
}

export function canDeleteProduct(partNo) {
  if (isProductUsedInBusiness(partNo)) {
    return {
      ok: false,
      message:
        "해당 제품은 이미 업무 데이터와 연결되어 있습니다.\n\n삭제할 수 없습니다.\n\n사용 여부를 '미사용'으로 변경하여 관리해 주세요.",
    };
  }
  return { ok: true };
}
