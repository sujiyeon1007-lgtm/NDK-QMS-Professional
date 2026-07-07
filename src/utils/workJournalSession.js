/**
 * 업무일지 — 부서별 SessionStorage (V1.5)
 * 수동 등록 · 자동 기록(append-only) · 일일 요약/개선사항 · 담당자 필터
 */

import { WORK_JOURNAL_STORAGE_KEY } from "../config/titanAssigneePolicy";
import {
  ACTIVE_WORK_JOURNAL_DEPARTMENT_ORDER,
  entryBelongsToJournalDepartment,
  getWorkJournalStorageKey,
  WORK_JOURNAL_LEGACY_STORAGE_KEY,
} from "../config/workJournalDepartmentPolicy";
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

/** @type {Map<string, object>} */
const journalStateByDepartment = new Map();

let legacyMigrated = false;

function migrateLegacyJournalToProduction() {
  if (legacyMigrated) return;
  legacyMigrated = true;
  try {
    const legacyRaw = globalThis.sessionStorage?.getItem(WORK_JOURNAL_LEGACY_STORAGE_KEY);
    const legacyAlt = legacyRaw ? null : globalThis.sessionStorage?.getItem(WORK_JOURNAL_STORAGE_KEY);
    const raw = legacyRaw ?? legacyAlt;
    const prodKey = getWorkJournalStorageKey("production");
    if (!raw || globalThis.sessionStorage?.getItem(prodKey)) return;
    globalThis.sessionStorage?.setItem(prodKey, raw);
  } catch {
    /* SessionStorage unavailable */
  }
}

function loadState(departmentId) {
  migrateLegacyJournalToProduction();
  try {
    const raw = globalThis.sessionStorage?.getItem(getWorkJournalStorageKey(departmentId));
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

function getDepartmentState(departmentId) {
  const key = departmentId || "production";
  if (!journalStateByDepartment.has(key)) {
    journalStateByDepartment.set(key, loadState(key));
  }
  return journalStateByDepartment.get(key);
}

function saveState(departmentId, state) {
  try {
    globalThis.sessionStorage?.setItem(
      getWorkJournalStorageKey(departmentId),
      JSON.stringify(state)
    );
  } catch {
    /* SessionStorage unavailable */
  }
}

function persistState(departmentId) {
  saveState(departmentId, getDepartmentState(departmentId));
}

function applyOverride(entry, departmentId) {
  const state = getDepartmentState(departmentId);
  const override = state.entryOverrides[entry.id];
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

function normalizeOptions(departmentIdOrOptions, maybeOptions = {}) {
  if (typeof departmentIdOrOptions === "string") {
    return {
      departmentId: departmentIdOrOptions,
      ...maybeOptions,
    };
  }
  return {
    departmentId: departmentIdOrOptions?.departmentId ?? "production",
    ...departmentIdOrOptions,
  };
}

export function getMergedJournalEntries(
  departmentId = "production",
  records = getSessionProductionRecords()
) {
  const state = getDepartmentState(departmentId);
  const legacyAuto = buildAutoJournalEntries(records).filter((entry) =>
    entryBelongsToJournalDepartment(entry, departmentId)
  );
  const persistedAuto = state.autoEntries.filter((entry) =>
    entryBelongsToJournalDepartment(entry, departmentId)
  );
  const manual = state.manualEntries.map((entry) => ({
    ...entry,
    journalDepartment: entry.journalDepartment ?? departmentId,
  }));

  const merged = dedupeEntries([...legacyAuto, ...persistedAuto, ...manual])
    .map((entry) => applyOverride(entry, departmentId))
    .filter(Boolean);

  return sortEntries(merged);
}

/**
 * 부서별 업무일지 조회
 * @param {string|object} [departmentIdOrOptions]
 * @param {object} [maybeOptions]
 */
export function getWorkJournalEntries(departmentIdOrOptions = "production", maybeOptions = {}) {
  const {
    departmentId = "production",
    assigneeFilter = "",
    dateFrom = "",
    dateTo = "",
    adminViewAll = false,
    records,
  } = normalizeOptions(departmentIdOrOptions, maybeOptions);

  let entries = getMergedJournalEntries(departmentId, records);

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

/** 향후 통합 조회 — 전 부서 업무일지 */
export function getUnifiedWorkJournalEntries(options = {}) {
  const merged = ACTIVE_WORK_JOURNAL_DEPARTMENT_ORDER.flatMap((departmentId) =>
    getWorkJournalEntries({ ...options, departmentId, adminViewAll: true })
  );
  return sortEntries(dedupeEntries(merged));
}

export function getTodayJournalEntries(
  records,
  date = getJournalReferenceDate(),
  departmentId = "production"
) {
  return getWorkJournalEntries(departmentId, {
    records,
    dateFrom: date,
    dateTo: date,
    adminViewAll: true,
  });
}

export function appendAutoJournalEntry(departmentId, entry) {
  let dept = departmentId;
  let payload = entry;
  if (typeof departmentId !== "string") {
    payload = departmentId;
    dept = payload.journalDepartment ?? "production";
  }

  const row = {
    id: payload.id || `auto-event-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    journalDepartment: dept,
    source: payload.source ?? "auto",
    sourceType: payload.sourceType ?? "auto",
    actionType: payload.actionType ?? "",
    date: payload.date,
    time: payload.time,
    category: payload.category,
    title: payload.title,
    company: payload.company ?? "",
    managementId: payload.managementId ?? "",
    lotNo: payload.lotNo ?? "",
    note: payload.note ?? "",
    assignee: payload.assignee ?? "",
    assigneeUserId: payload.assigneeUserId ?? "",
    workerCode: payload.workerCode ?? "",
    department: payload.department ?? "",
  };

  const state = getDepartmentState(dept);
  journalStateByDepartment.set(dept, {
    ...state,
    autoEntries: [row, ...state.autoEntries],
  });
  persistState(dept);
  return row;
}

export function addManualJournalEntry(departmentId, entry) {
  let dept = departmentId;
  let payload = entry;
  if (typeof departmentId !== "string") {
    payload = departmentId;
    dept = payload.journalDepartment ?? "production";
  }

  const assigneeMeta = resolveAssigneeMeta(payload.assignee);
  const row = {
    id: `manual-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    journalDepartment: dept,
    source: "manual",
    sourceType: "manual",
    actionType: payload.actionType ?? "",
    date: payload.date,
    time: payload.time,
    category: payload.category,
    title: payload.title,
    company: payload.company ?? "",
    managementId: payload.managementId ?? "",
    lotNo: payload.lotNo ?? "",
    note: payload.note ?? "",
    ...assigneeMeta,
  };

  const state = getDepartmentState(dept);
  journalStateByDepartment.set(dept, {
    ...state,
    manualEntries: [row, ...state.manualEntries],
  });
  persistState(dept);
  return row;
}

export function updateJournalEntry(departmentId, id, patch) {
  let dept = departmentId;
  let entryId = id;
  let entryPatch = patch;
  if (typeof departmentId !== "string") {
    entryPatch = id;
    entryId = departmentId;
    dept = "production";
  }

  const state = getDepartmentState(dept);

  if (entryId.startsWith("manual-")) {
    const assigneePatch = entryPatch.assignee ? resolveAssigneeMeta(entryPatch.assignee) : {};

    journalStateByDepartment.set(dept, {
      ...state,
      manualEntries: state.manualEntries.map((entry) =>
        entry.id === entryId ? { ...entry, ...entryPatch, ...assigneePatch } : entry
      ),
    });
    persistState(dept);
    return;
  }

  journalStateByDepartment.set(dept, {
    ...state,
    entryOverrides: {
      ...state.entryOverrides,
      [entryId]: { ...state.entryOverrides[entryId], ...entryPatch },
    },
  });
  persistState(dept);
}

export function deleteJournalEntry(departmentId, id) {
  let dept = departmentId;
  let entryId = id;
  if (typeof departmentId !== "string") {
    entryId = departmentId;
    dept = "production";
  }

  const state = getDepartmentState(dept);

  if (entryId.startsWith("manual-")) {
    const nextOverrides = { ...state.entryOverrides };
    delete nextOverrides[entryId];
    journalStateByDepartment.set(dept, {
      ...state,
      manualEntries: state.manualEntries.filter((entry) => entry.id !== entryId),
      entryOverrides: nextOverrides,
    });
    persistState(dept);
    return;
  }

  journalStateByDepartment.set(dept, {
    ...state,
    entryOverrides: {
      ...state.entryOverrides,
      [entryId]: { ...state.entryOverrides[entryId], deleted: true },
    },
  });
  persistState(dept);
}

export function getJournalEntryById(
  departmentId,
  id,
  records = getSessionProductionRecords()
) {
  let dept = departmentId;
  let entryId = id;
  let recs = records;
  if (typeof departmentId !== "string") {
    recs = id ?? getSessionProductionRecords();
    entryId = departmentId;
    dept = "production";
  }
  return getMergedJournalEntries(dept, recs).find((entry) => entry.id === entryId) ?? null;
}

export function getDailyNotes(departmentId = "production", date = getJournalReferenceDate()) {
  const state = getDepartmentState(departmentId);
  return state.dailyNotes[date] ?? { summary: "", learnings: "" };
}

export function saveDailyNotes(departmentId, date, notes) {
  let dept = departmentId;
  let noteDate = date;
  let payload = notes;
  if (typeof departmentId !== "string" || typeof date !== "string") {
    noteDate = departmentId;
    payload = date;
    dept = "production";
  }

  const state = getDepartmentState(dept);
  journalStateByDepartment.set(dept, {
    ...state,
    dailyNotes: {
      ...state.dailyNotes,
      [noteDate]: {
        summary: payload.summary ?? "",
        learnings: payload.learnings ?? "",
      },
    },
  });
  persistState(dept);
}
