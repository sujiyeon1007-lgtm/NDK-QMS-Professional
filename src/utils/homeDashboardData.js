/**
 * HOME Dashboard — PM V1.0 승인 (현황 카드 · 최근 작업 리스트)
 */

import {
  CERTIFICATE_STATUS,
  SHIPMENT_STATUS,
  getRecordWorkflowState,
} from "./ndkWorkflow";
import { getStockQty } from "./inventory";
import { getSessionProductionRecords, isIncomingRegistered } from "./productionRecords";
import { hasInspectionLogForManagementId } from "./inspectionLogSession";
import { HOME_STATUS_GROUPS } from "../config/homeDashboard";
import { mapStandardProductListRow } from "./processFlow";

const REGISTRAR_FALLBACK = "관리자";

const DISPLAY_TIMES = [
  "11:42",
  "11:18",
  "10:55",
  "10:31",
  "09:47",
  "09:20",
  "08:50",
  "08:15",
  "08:02",
  "07:45",
];

function countHomeStatusCards(records = []) {
  return {
    incomingDone: records.filter((r) => isIncomingRegistered(r)).length,
    shipWaiting: records.filter(
      (r) =>
        isIncomingRegistered(r) &&
        getStockQty(r) > 0 &&
        r.shipmentStatus !== SHIPMENT_STATUS.DONE
    ).length,
    shipDone: records.filter((r) => getRecordWorkflowState(r) === "출고완료").length,
    prodWaiting: records.filter(
      (r) => isIncomingRegistered(r) && !r.registered && !r.lotNo?.trim()
    ).length,
    prodProgress: records.filter(
      (r) =>
        isIncomingRegistered(r) &&
        r.htlNo &&
        (!r.registered || !r.lotNo?.trim())
    ).length,
    prodDone: records.filter((r) => r.registered && r.lotNo?.trim()).length,
    inspectWaiting: records.filter(
      (r) =>
        r.registered &&
        r.lotNo?.trim() &&
        !hasInspectionLogForManagementId(r.id)
    ).length,
    inspectDone: records.filter(
      (r) =>
        r.registered &&
        r.lotNo?.trim() &&
        hasInspectionLogForManagementId(r.id) &&
        r.certificateStatus === CERTIFICATE_STATUS.PENDING
    ).length,
    certDone: records.filter(
      (r) => r.certificateStatus === CERTIFICATE_STATUS.ISSUED
    ).length,
  };
}

export function buildHomeStatusGroups(records = getSessionProductionRecords()) {
  const counts = countHomeStatusCards(records);

  return HOME_STATUS_GROUPS.map((group) => ({
    ...group,
    cards: group.cards.map((card) => ({
      ...card,
      count: counts[card.id] ?? 0,
    })),
  }));
}

export function getHomeDisplayStatus(record) {
  const state = getRecordWorkflowState(record);

  if (state === "출고완료") return { label: "출고 완료", variant: "complete" };
  if (state === "부분출고" || state === "성적서 발행완료") {
    return { label: "출고 대기", variant: "wait" };
  }
  if (record?.certificateStatus === CERTIFICATE_STATUS.PENDING && record?.registered) {
    return { label: "성적서대기", variant: "certificate" };
  }
  if (
    record?.registered &&
    record?.lotNo?.trim() &&
    hasInspectionLogForManagementId(record.id)
  ) {
    return { label: "검사 진행", variant: "progress" };
  }
  if (record?.registered && record?.lotNo?.trim()) {
    return { label: "생산 진행", variant: "production" };
  }
  if (state === "생산계획" || record?.htlNo) {
    return { label: "생산 진행", variant: "production" };
  }
  if (isIncomingRegistered(record)) {
    return { label: "입고 완료", variant: "incoming" };
  }
  return { label: "입고 대기", variant: "wait" };
}

function formatRegisteredAt(record, index) {
  const date = record.lotCreatedAt ?? record.incomingDate ?? "";
  const time = DISPLAY_TIMES[index] ?? "—";
  if (!date) return "—";
  if (String(date).includes("T")) {
    const parsed = new Date(date);
    if (!Number.isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, "0");
      const d = String(parsed.getDate()).padStart(2, "0");
      const hh = String(parsed.getHours()).padStart(2, "0");
      const mm = String(parsed.getMinutes()).padStart(2, "0");
      return `${y}-${m}-${d} ${hh}:${mm}`;
    }
  }
  return `${date} ${time}`;
}

export function buildRecentWorkList(records = getSessionProductionRecords()) {
  return [...records]
    .filter((r) => isIncomingRegistered(r))
    .sort((a, b) => b.id.localeCompare(a.id))
    .map((record, index) => {
      const status = getHomeDisplayStatus(record);
      const row = mapStandardProductListRow(record, status);
      return {
        ...row,
        registeredAt: formatRegisteredAt(record, index),
        registrar: record.registrar ?? REGISTRAR_FALLBACK,
      };
    });
}

export function getHomeDashboardData(records = getSessionProductionRecords()) {
  return {
    statusGroups: buildHomeStatusGroups(records),
    recentWorkList: buildRecentWorkList(records),
  };
}
