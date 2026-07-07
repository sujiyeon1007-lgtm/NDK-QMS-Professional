/**
 * Project TITAN V1.3 — Work journal auto-record (workflow hooks)
 */

import {
  WORK_JOURNAL_ACTION_LABELS,
  WORK_JOURNAL_SOURCE_TYPE,
} from "../config/titanAssigneePolicy";
import { resolveAssigneeMeta } from "./titanAssigneeResolver";
import { getPrintOutputDate } from "./titanPrintDates";
import { resolveWorkJournalDepartmentFromAction } from "../config/workJournalDepartmentPolicy";
import { appendAutoJournalEntry } from "./workJournalSession";

function formatTime(now = new Date()) {
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

/**
 * Append workflow auto event to work journal (append-only)
 * @param {object} params
 * @param {string} params.actionType — WORK_JOURNAL_ACTION_TYPES value
 * @param {string} [params.assignee]
 * @param {string} [params.managementId]
 * @param {string} [params.company]
 * @param {string} [params.lotNo]
 * @param {string} [params.title]
 * @param {string} [params.note]
 * @param {string} [params.date]
 */
export function appendWorkJournalAutoEntry({
  actionType,
  assignee,
  managementId = "",
  company = "",
  lotNo = "",
  title = "",
  note = "",
  date,
}) {
  if (!actionType) return null;

  const category = WORK_JOURNAL_ACTION_LABELS[actionType] ?? actionType;
  const assigneeMeta = resolveAssigneeMeta(assignee);
  const departmentId = resolveWorkJournalDepartmentFromAction(actionType);
  const entryDate = date?.trim() || getPrintOutputDate();
  const now = new Date();

  const resolvedTitle =
    title?.trim() ||
    [category, company, managementId].filter(Boolean).join(" — ") ||
    category;

  return appendAutoJournalEntry(departmentId, {
    actionType,
    category,
    title: resolvedTitle,
    company: company?.trim() ?? "",
    managementId: managementId?.trim() ?? "",
    lotNo: lotNo?.trim() ?? "",
    note: note?.trim() ?? "",
    date: entryDate,
    time: formatTime(now),
    source: WORK_JOURNAL_SOURCE_TYPE.AUTO,
    sourceType: WORK_JOURNAL_SOURCE_TYPE.AUTO,
    journalDepartment: departmentId,
    ...assigneeMeta,
  });
}
