/**
 * 업무일지 — 세션 저장 (Mock)
 * 수동 등록 · 자동 기록 오버라이드 · 일일 요약/개선사항
 */

import { buildAutoJournalEntries, getJournalReferenceDate } from "./workJournalData";
import { getSessionProductionRecords } from "./productionRecords";

let manualEntries = [];
/** @type {Record<string, Partial<{ deleted?: boolean, date?: string, time?: string, category?: string, title?: string, company?: string, managementId?: string, lotNo?: string, note?: string }>>} */
let entryOverrides = {};
/** @type {Record<string, { summary?: string, learnings?: string }>} */
let dailyNotes = {};

function applyOverride(entry) {
  const override = entryOverrides[entry.id];
  if (!override) return entry;
  if (override.deleted) return null;
  return { ...entry, ...override };
}

export function getMergedJournalEntries(records = getSessionProductionRecords()) {
  const auto = buildAutoJournalEntries(records)
    .map((entry) => applyOverride(entry))
    .filter(Boolean);

  const manual = manualEntries
    .map((entry) => applyOverride(entry))
    .filter(Boolean);

  return [...auto, ...manual].sort((a, b) => {
    const dateCmp = b.date.localeCompare(a.date);
    if (dateCmp !== 0) return dateCmp;
    return b.time.localeCompare(a.time);
  });
}

export function getTodayJournalEntries(records, date = getJournalReferenceDate()) {
  return getMergedJournalEntries(records).filter((entry) => entry.date === date);
}

export function addManualJournalEntry(entry) {
  const row = {
    id: `manual-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    source: "manual",
    date: entry.date,
    time: entry.time,
    category: entry.category,
    title: entry.title,
    company: entry.company ?? "",
    managementId: entry.managementId ?? "",
    lotNo: entry.lotNo ?? "",
    note: entry.note ?? "",
  };
  manualEntries = [row, ...manualEntries];
  return row;
}

export function updateJournalEntry(id, patch) {
  if (id.startsWith("manual-")) {
    manualEntries = manualEntries.map((entry) =>
      entry.id === id ? { ...entry, ...patch } : entry
    );
    return;
  }
  entryOverrides[id] = { ...entryOverrides[id], ...patch };
}

export function deleteJournalEntry(id) {
  if (id.startsWith("manual-")) {
    manualEntries = manualEntries.filter((entry) => entry.id !== id);
    delete entryOverrides[id];
    return;
  }
  entryOverrides[id] = { ...entryOverrides[id], deleted: true };
}

export function getJournalEntryById(id, records = getSessionProductionRecords()) {
  return getMergedJournalEntries(records).find((entry) => entry.id === id) ?? null;
}

export function getDailyNotes(date = getJournalReferenceDate()) {
  return dailyNotes[date] ?? { summary: "", learnings: "" };
}

export function saveDailyNotes(date, { summary, learnings }) {
  dailyNotes[date] = {
    summary: summary ?? "",
    learnings: learnings ?? "",
  };
}
