/**
 * 업무일지 — Workflow 기반 자동 기록 생성 (Mock / Session)
 */

import { CERTIFICATE_STATUS, SHIPMENT_STATUS } from "./ndkWorkflow";

export const AUTO_JOURNAL_CATEGORIES = [
  "입고 등록",
  "생산작업계획 등록",
  "LOT 등록",
  "작업관리표 출력",
  "성적서 발행",
  "출고 완료",
];

export const MANUAL_JOURNAL_CATEGORIES = [
  "입고 검사",
  "성적서 발행",
  "고객 대응",
  "NCR",
  "회의",
  "설비 점검",
  "특이사항",
  "개선사항",
];

const DISPLAY_TIMES = [
  "09:10",
  "09:35",
  "10:05",
  "10:40",
  "11:15",
  "11:42",
  "13:20",
  "14:05",
  "14:50",
  "15:30",
  "16:10",
  "16:45",
];

function extractDateFromId(id) {
  const match = id?.match(/_(\d{8})_/);
  if (!match) return "2026-06-28";
  const raw = match[1];
  return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
}

function resolveEntryDate(record) {
  if (record.workDate?.trim()) return record.workDate.trim();
  return extractDateFromId(record.id);
}

function nextTime(index) {
  return DISPLAY_TIMES[index % DISPLAY_TIMES.length];
}

export function getJournalReferenceDate() {
  return "2026-06-28";
}

export function buildAutoJournalEntries(records) {
  const entries = [];
  let timeIndex = 0;

  for (const record of records) {
    const date = resolveEntryDate(record);
    const base = {
      company: record.company ?? "",
      managementId: record.id ?? "",
      lotNo: record.lotNo?.trim() ?? "",
      note: record.note?.trim() ?? "",
      source: "auto",
      recordId: record.id,
    };

    if (record.id) {
      entries.push({
        ...base,
        id: `auto-${record.id}-incoming`,
        autoStep: "incoming",
        date,
        time: nextTime(timeIndex++),
        category: "입고 등록",
        title: `입고 등록 — ${record.company} (${record.id})`,
      });
    }

    if (record.htlNo) {
      entries.push({
        ...base,
        id: `auto-${record.id}-plan`,
        autoStep: "plan",
        date,
        time: nextTime(timeIndex++),
        category: "생산작업계획 등록",
        title: `생산작업계획 등록 — ${record.htlNo}`,
        note: record.htlNo,
      });
    }

    if (record.registered && record.lotNo?.trim()) {
      entries.push({
        ...base,
        id: `auto-${record.id}-lot`,
        autoStep: "lot",
        date,
        time: nextTime(timeIndex++),
        category: "LOT 등록",
        title: `LOT 등록 — ${record.lotNo}`,
        lotNo: record.lotNo.trim(),
      });
    }

    if (record.workSheetGenerated && record.lotNo?.trim()) {
      entries.push({
        ...base,
        id: `auto-${record.id}-worksheet`,
        autoStep: "worksheet",
        date,
        time: nextTime(timeIndex++),
        category: "작업관리표 출력",
        title: `작업관리표 출력 — LOT ${record.lotNo}`,
        lotNo: record.lotNo.trim(),
      });
    }

    if (record.certificateStatus === CERTIFICATE_STATUS.ISSUED) {
      entries.push({
        ...base,
        id: `auto-${record.id}-certificate`,
        autoStep: "certificate",
        date,
        time: nextTime(timeIndex++),
        category: "성적서 발행",
        title: `성적서 발행 — ${record.company} ${record.lotNo || record.id}`,
      });
    }

    if (record.shipmentStatus === SHIPMENT_STATUS.DONE) {
      entries.push({
        ...base,
        id: `auto-${record.id}-shipment`,
        autoStep: "shipment",
        date,
        time: nextTime(timeIndex++),
        category: "출고 완료",
        title: `출고 완료 — ${record.company} ${record.partNo}`,
      });
    }
  }

  return entries.sort((a, b) => {
    const dateCmp = b.date.localeCompare(a.date);
    if (dateCmp !== 0) return dateCmp;
    return b.time.localeCompare(a.time);
  });
}

export function getCategorySummary(entries) {
  const map = new Map();
  for (const entry of entries) {
    map.set(entry.category, (map.get(entry.category) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

export function filterEntriesByDateRange(entries, startDate, endDate) {
  return entries.filter((entry) => entry.date >= startDate && entry.date <= endDate);
}

export function getWeekRange(referenceDate = getJournalReferenceDate()) {
  const date = new Date(`${referenceDate}T12:00:00`);
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + mondayOffset);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = (d) => d.toISOString().slice(0, 10);
  return { start: fmt(monday), end: fmt(sunday) };
}

export function getMonthRange(referenceDate = getJournalReferenceDate()) {
  const [year, month] = referenceDate.split("-");
  const start = `${year}-${month}-01`;
  const lastDay = new Date(Number(year), Number(month), 0).getDate();
  const end = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;
  return { start, end };
}

export function groupEntriesByDate(entries) {
  const map = new Map();
  for (const entry of entries) {
    if (!map.has(entry.date)) map.set(entry.date, []);
    map.get(entry.date).push(entry);
  }
  return [...map.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({ date, items }));
}

export function filterEntriesBySearch(entries, query) {
  const q = query.trim().toLowerCase();
  if (!q) return entries;
  return entries.filter((entry) =>
    [
      entry.category,
      entry.title,
      entry.company,
      entry.managementId,
      entry.lotNo,
      entry.note,
    ].some((field) => field?.toLowerCase().includes(q))
  );
}
