/**
 * Project TITAN V1.0 — 품질관리 KPI 집계
 */

import { getJournalReferenceDate, getMonthRange, getWeekRange } from "./workJournalData";
import { getCertificateReadyRecords } from "./productionRecords";
import { getCertificateFileStatus } from "./certificateSession";

function isDateInRange(dateStr, start, end) {
  if (!dateStr) return false;
  return dateStr >= start && dateStr <= end;
}

export function buildInspectionLogKpiCounts(logs = []) {
  const refDate = getJournalReferenceDate();
  const week = getWeekRange(refDate);
  const month = getMonthRange(refDate);

  const todayInspect = logs.filter((log) => log.inspectionDate === refDate).length;
  const weekInspect = logs.filter((log) => isDateInRange(log.inspectionDate, week.start, week.end)).length;
  const monthInspect = logs.filter((log) => isDateInRange(log.inspectionDate, month.start, month.end)).length;
  const judged = logs.filter((log) => log.judgment === "합격" || log.judgment === "불합격");
  const passRate = judged.length
    ? Math.round((judged.filter((log) => log.judgment === "합격").length / judged.length) * 100)
    : 0;

  return { todayInspect, weekInspect, monthInspect, passRate };
}

export function buildCertificateKpiCounts(records = [], certificateEntries = []) {
  const refDate = getJournalReferenceDate();
  const week = getWeekRange(refDate);
  const month = getMonthRange(refDate);

  const registeredDate = (entry) => entry.registeredDate || entry.createdAt?.slice(0, 10) || "";

  const todayRegister = certificateEntries.filter((entry) => registeredDate(entry) === refDate).length;
  const weekRegister = certificateEntries.filter((entry) =>
    isDateInRange(registeredDate(entry), week.start, week.end)
  ).length;
  const monthRegister = certificateEntries.filter((entry) =>
    isDateInRange(registeredDate(entry), month.start, month.end)
  ).length;

  const readyRecords = getCertificateReadyRecords(records);
  const completeCount = certificateEntries.filter(
    (entry) => getCertificateFileStatus(entry).label === "등록완료"
  ).length;
  const registerRate =
    readyRecords.length > 0 ? Math.round((completeCount / readyRecords.length) * 100) : 0;

  return { todayRegister, weekRegister, monthRegister, registerRate };
}
