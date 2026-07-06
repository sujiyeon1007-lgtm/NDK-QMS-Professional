/**
 * Project TITAN — 품질 Traceability 이력조회 (이력조회 전용)
 */

import { hasInspectionLogForManagementId } from "./inspectionLogSession";
import { getSessionProductionRecords, isIncomingRegistered } from "./productionRecords";
import { matchesInboundDataSearch } from "./inboundDataFields";
import { matchesBasicSearch } from "../config/listSearchStandard";
import { CERTIFICATE_STATUS } from "./ndkWorkflow";
import {
  formatOutboundTimeLabel,
  getOutboundManager,
  getOutboundShipDate,
  hasOutboundShipment,
} from "./outboundManagementStatus";

/** 이력조회 Traceability 단계 — 입고 → 작업일보 → 품질 → 출고 */
export const QUALITY_TRACEABILITY_STEPS = [
  { id: "inbound", label: "입고현황", path: "/inout/incoming" },
  { id: "dailyReport", label: "작업일보", path: "/production/daily-report" },
  { id: "quality", label: "품질관리", path: "/quality/inspection" },
  { id: "outbound", label: "출고현황", path: "/inout/shipment" },
];

export function createEmptyHistoryInquirySearch() {
  return {
    managementId: "",
    lotNo: "",
    purchaseOrderNo: "",
    partNo: "",
    customerLotNo: "",
    company: "",
    partName: "",
    material: "",
  };
}

export function matchesHistoryInquirySearch(record, search) {
  if (search.managementId && !String(record.id ?? "").toLowerCase().includes(search.managementId.trim().toLowerCase())) {
    return false;
  }
  if (search.lotNo && !String(record.lotNo ?? "").toLowerCase().includes(search.lotNo.trim().toLowerCase())) {
    return false;
  }
  if (!matchesBasicSearch(search, record)) return false;
  if (!matchesInboundDataSearch(search, record)) return false;
  return true;
}

function buildInboundStep(record) {
  const done = isIncomingRegistered(record);
  return {
    ...QUALITY_TRACEABILITY_STEPS[0],
    status: done ? "done" : "pending",
    detail: done
      ? `${record.incomingDate ?? "—"} · ${record.company ?? "—"} · ${record.qty ?? "—"}${record.unit ? ` ${record.unit}` : ""}`
      : "입고 정보 없음",
  };
}

function buildDailyReportStep(record) {
  const done = Boolean(record.registered && record.lotNo?.trim());
  return {
    ...QUALITY_TRACEABILITY_STEPS[1],
    status: done ? "done" : "pending",
    detail: done
      ? `LOT ${record.lotNo} · ${record.workDate ?? record.completionDate ?? "—"} · ${record.worker ?? "—"}`
      : "작업일보 미등록",
  };
}

function buildQualityStep(record) {
  const inspected = hasInspectionLogForManagementId(record.id);
  const certDone = record.certificateStatus === CERTIFICATE_STATUS.ISSUED;
  const done = inspected || certDone;
  return {
    ...QUALITY_TRACEABILITY_STEPS[2],
    status: done ? "done" : "pending",
    detail: certDone
      ? "성적서 등록 완료"
      : inspected
        ? "검사일지 등록 완료"
        : "품질 업무 미진행",
  };
}

function buildOutboundStep(record) {
  const shipped = hasOutboundShipment(record);
  const outboundDate = getOutboundShipDate(record);
  const manager = getOutboundManager(record);
  const outboundTime = formatOutboundTimeLabel(record);
  return {
    ...QUALITY_TRACEABILITY_STEPS[3],
    status: shipped ? "done" : "pending",
    detail: shipped
      ? `출고 ${record.shippedQty ?? 0}${record.unit ? ` ${record.unit}` : ""} · ${outboundDate} · ${manager} · ${outboundTime}`
      : "출고 이력 없음",
  };
}

export function buildQualityTraceabilityTimeline(record) {
  if (!record) return [];
  return [
    buildInboundStep(record),
    buildDailyReportStep(record),
    buildQualityStep(record),
    buildOutboundStep(record),
  ];
}

export function searchHistoryInquiryRecords(search) {
  return getSessionProductionRecords()
    .filter((record) => matchesHistoryInquirySearch(record, search))
    .sort((a, b) => String(b.incomingDate ?? "").localeCompare(String(a.incomingDate ?? "")));
}

export function findHistoryRecordByQuery(queryParams = {}) {
  const managementId = String(queryParams.id ?? queryParams.managementId ?? "").trim();
  const lotNo = String(queryParams.lot ?? queryParams.lotNo ?? "").trim();

  const records = getSessionProductionRecords();
  if (managementId) {
    return records.find((row) => row.id === managementId) ?? null;
  }
  if (lotNo) {
    return records.find((row) => String(row.lotNo ?? "").toLowerCase() === lotNo.toLowerCase()) ?? null;
  }
  return null;
}

export function mapHistoryInquiryListRow(record) {
  const timeline = buildQualityTraceabilityTimeline(record);
  const completedSteps = timeline.filter((step) => step.status === "done").length;
  return {
    id: record.id,
    managementId: record.id,
    lotNo: record.lotNo || "—",
    purchaseOrderNo: record.purchaseOrderNo || "—",
    customerLotNo: record.customerLotNo || "—",
    company: record.company || "—",
    partName: record.partName || "—",
    partNo: record.partNo || "—",
    material: record.material || "—",
    incomingDate: record.incomingDate || "—",
    traceProgress: `${completedSteps}/${timeline.length}`,
    workflowLabel:
      completedSteps === timeline.length
        ? "전체 이력"
        : completedSteps > 0
          ? "진행 중"
          : "입고만",
  };
}
