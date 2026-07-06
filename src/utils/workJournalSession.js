/**
 * 업무일지 — 세션 저장 (SessionStorage)
 * 수동 등록 · 자동 기록(append-only) · 일일 요약/개선사항 · 담당자 필터
 */

import { WORK_JOURNAL_STORAGE_KEY } from "../config/titanAssigneePolicy";
import { getAuthSession } from "./titanAuthSession";
import { isTitanAdminUser } from "./titanAdminAccess";
import { resolveAssigneeMeta } from "./titanAssigneeResolver";
import {
  buildAutoJournalEntries,
  getJournalReferenceDate,
} from "./workJournalData";
import { getSessionProductionRecords } from "./productionRecords";

const EMPTY_STATE = {
  manualEntries: [],
  autoEntries: [],
  entryOverrides: {},
  dailyNotes: {},
};

function loadState() {
  try {
    const raw = globalThis.sessionStorage?.getItem(WORK_JOURNAL_STORAGE_KEY);
    if (!raw) return { ...EMPTY_STATE };
    const parsed = JSON.parse(raw);
    return {
      manualEntries: Array.isArray(parsed.manualEntries) ? parsed.manualEntries : [],
      autoEntries: Array.isArray(parsed.autoEntries) ? parsed.autoEntries : [],
      entryOverrides:
        parsed.entryOverrides && typeof parsed.entryOverrides === "object"
          ? parsed.entryOverrides
          : {},
      dailyNotes:
        parsed.dailyNotes && typeof parsed.dailyNotes === "object" ? parsed.dailyNotes : {},
    };
  } catch {
    return { ...EMPTY_STATE };
  }
}

function saveState(state) {
  try {
    globalThis.sessionStorage?.setItem(WORK_JOURNAL_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* SessionStorage unavailable */
  }
}

let journalState = loadState();

function persistState() {
  saveState(journalState);
}

function applyOverride(entry) {
  const override = journalState.entryOverrides[entry.id];
  if (!override) return entry;
  if (override.deleted) return null;
  return { ...entry, ...override };
}

function entryMatchesCurrentUser(entry, session = getAuthSession()) {
  if (!session?.userId && !session?.name) return true;

  if (entry.assigneeUserId && session.userId) {
    return entry.assigneeUserId === session.userId;
  }

  if (entry.assignee && session.name) {
    return entry.assignee === session.name;
  }

  return false;
}

function entryMatchesAssigneeFilter(entry, assigneeFilter) {
  if (!assigneeFilter?.trim()) return true;
  return entry.assignee === assigneeFilter.trim();
}

function dedupeEntries(entries) {
  const map = new Map();
  for (const entry of entries) {
    if (!entry?.id) continue;
    map.set(entry.id, entry);
  }
  return [...map.values()];
}

function sortEntries(entries) {
  return [...entries].sort((a, b) => {
    const dateCmp = String(b.date ?? "").localeCompare(String(a.date ?? ""));
    if (dateCmp !== 0) return dateCmp;
    return String(b.time ?? "").localeCompare(String(a.time ?? ""));
  });
}

export function getMergedJournalEntries(records = getSessionProductionRecords()) {
  const legacyAuto = buildAutoJournalEntries(records);
  const persistedAuto = journalState.autoEntries;
  const manual = journalState.manualEntries;

  const merged = dedupeEntries([...legacyAuto, ...persistedAuto, ...manual])
    .map((entry) => applyOverride(entry))
    .filter(Boolean);

  return sortEntries(merged);
}

/**
 * Person-centric journal query
 * @param {object} [options]
 * @param {string} [options.assigneeFilter] — admin only; worker name or empty for all
 * @param {string} [options.dateFrom]
 * @param {string} [options.dateTo]
 * @param {boolean} [options.adminViewAll] — admin sees all when true
 * @param {object[]} [options.records]
 */
export function getWorkJournalEntries(options = {}) {
  const {
    assigneeFilter = "",
    dateFrom = "",
    dateTo = "",
    adminViewAll = false,
    records,
  } = options;

  let entries = getMergedJournalEntries(records);

  if (dateFrom) {
    entries = entries.filter((entry) => entry.date >= dateFrom);
  }
  if (dateTo) {
    entries = entries.filter((entry) => entry.date <= dateTo);
  }

  const isAdmin = isTitanAdminUser();

  if (isAdmin && adminViewAll) {
    if (assigneeFilter?.trim()) {
      entries = entries.filter((entry) => entryMatchesAssigneeFilter(entry, assigneeFilter));
    }
    return entries;
  }

  if (isAdmin && assigneeFilter?.trim()) {
    return entries.filter((entry) => entryMatchesAssigneeFilter(entry, assigneeFilter));
  }

  if (isAdmin && !assigneeFilter?.trim()) {
    return entries;
  }

  const session = getAuthSession();
  return entries.filter((entry) => entryMatchesCurrentUser(entry, session));
}

export function getTodayJournalEntries(records, date = getJournalReferenceDate()) {
  return getWorkJournalEntries({ records, dateFrom: date, dateTo: date, adminViewAll: true });
}

export function appendAutoJournalEntry(entry) {
  const row = {
    id: entry.id || `auto-event-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    source: entry.source ?? "auto",
    sourceType: entry.sourceType ?? "auto",
    actionType: entry.actionType ?? "",
    date: entry.date,
    time: entry.time,
    category: entry.category,
    title: entry.title,
    company: entry.company ?? "",
    managementId: entry.managementId ?? "",
    lotNo: entry.lotNo ?? "",
    note: entry.note ?? "",
    assignee: entry.assignee ?? "",
    assigneeUserId: entry.assigneeUserId ?? "",
    workerCode: entry.workerCode ?? "",
    department: entry.department ?? "",
  };

  journalState = {
    ...journalState,
    autoEntries: [row, ...journalState.autoEntries],
  };
  persistState();
  return row;
}

export function addManualJournalEntry(entry) {
  const assigneeMeta = resolveAssigneeMeta(entry.assignee);
  const row = {
    id: `manual-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    source: "manual",
    sourceType: "manual",
    actionType: entry.actionType ?? "",
    date: entry.date,
    time: entry.time,
    category: entry.category,
    title: entry.title,
    company: entry.company ?? "",
    managementId: entry.managementId ?? "",
    lotNo: entry.lotNo ?? "",
    note: entry.note ?? "",
    ...assigneeMeta,
  };

  journalState = {
    ...journalState,
    manualEntries: [row, ...journalState.manualEntries],
  };
  persistState();
  return row;
}

export function updateJournalEntry(id, patch) {
  if (id.startsWith("manual-")) {
    const assigneePatch = patch.assignee
      ? resolveAssigneeMeta(patch.assignee)
      : {};

    journalState = {
      ...journalState,
      manualEntries: journalState.manualEntries.map((entry) =>
        entry.id === id ? { ...entry, ...patch, ...assigneePatch } : entry
      ),
    };
    persistState();
    return;
  }

  journalState = {
    ...journalState,
    entryOverrides: {
      ...journalState.entryOverrides,
      [id]: { ...journalState.entryOverrides[id], ...patch },
    },
  };
  persistState();
}

export function deleteJournalEntry(id) {
  if (id.startsWith("manual-")) {
    journalState = {
      ...journalState,
      manualEntries: journalState.manualEntries.filter((entry) => entry.id !== id),
    };
    const nextOverrides = { ...journalState.entryOverrides };
    delete nextOverrides[id];
    journalState = { ...journalState, entryOverrides: nextOverrides };
    persistState();
    return;
  }

  journalState = {
    ...journalState,
    entryOverrides: {
      ...journalState.entryOverrides,
      [id]: { ...journalState.entryOverrides[id], deleted: true },
    },
  };
  persistState();
}

export function getJournalEntryById(id, records = getSessionProductionRecords()) {
  return getMergedJournalEntries(records).find((entry) => entry.id === id) ?? null;
}

export function getDailyNotes(date = getJournalReferenceDate()) {
  return journalState.dailyNotes[date] ?? { summary: "", learnings: "" };
}

export function saveDailyNotes(date, { summary, learnings }) {
  journalState = {
    ...journalState,
    dailyNotes: {
      ...journalState.dailyNotes,
      [date]: {
        summary: summary ?? "",
        learnings: learnings ?? "",
      },
    },
  };
  persistState();
}
