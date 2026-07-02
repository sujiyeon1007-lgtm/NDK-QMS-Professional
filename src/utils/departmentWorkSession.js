/**
 * Project TITAN V1.0 — 부서별 업무 SessionStorage
 */

import { getCurrentTitanUser } from "./titanHistorySession";
import { getJournalReferenceDate } from "./workJournalData";
import {
  DEPARTMENT_DEFINITIONS,
  DEPARTMENT_WORK_PRIORITY,
  DEPARTMENT_WORK_STATUS,
} from "../config/departmentWorkDashboard";

const STORAGE_KEY = "project-titan-department-work-v2";

function createTaskId() {
  return `DW-${Date.now()}`;
}

function normalizeTask(task) {
  const departmentId =
    DEPARTMENT_DEFINITIONS.find((item) => item.id === task.departmentId)?.id ||
    DEPARTMENT_DEFINITIONS.find((item) => item.label === task.department)?.id ||
    "quality";

  const department =
    DEPARTMENT_DEFINITIONS.find((item) => item.id === departmentId)?.label || task.department || "품질부";

  return {
    id: task.id || createTaskId(),
    title: task.title?.trim() || "—",
    departmentId,
    department,
    assignee: task.assignee?.trim() || getCurrentTitanUser(),
    content: task.content?.trim() || "",
    requestDate: task.requestDate?.trim() || getJournalReferenceDate(),
    dueDate: task.dueDate?.trim() || "",
    priority: DEPARTMENT_WORK_PRIORITY.includes(task.priority) ? task.priority : "보통",
    status: DEPARTMENT_WORK_STATUS.includes(task.status) ? task.status : "대기",
    note: task.note?.trim() || "",
    managementId: task.managementId?.trim() || "",
    company: task.company?.trim() || "",
    partName: task.partName?.trim() || "",
    partNo: task.partNo?.trim() || "",
    material: task.material?.trim() || "",
    createdAt: task.createdAt || new Date().toISOString(),
    updatedAt: task.updatedAt || new Date().toISOString(),
    deleted: Boolean(task.deleted),
  };
}

function getSeedTasks() {
  const today = getJournalReferenceDate();
  return [
    normalizeTask({
      id: "DW-SEED-001",
      title: "검사 대기 — CQ91BUL504",
      departmentId: "quality",
      assignee: "품질관리부 / 정반이 사원",
      content: "입고 LOT 검사 일정 확인 및 검사일지 작성",
      requestDate: today,
      dueDate: today,
      priority: "높음",
      status: "진행중",
      company: "서암기계공업",
      partName: "BULL GEAR",
      partNo: "CQ91BUL504",
      material: "SNCM439",
      managementId: "SE_20260703_0002",
    }),
    normalizeTask({
      id: "DW-SEED-002",
      title: "생산 진행 — LOT260701-01",
      departmentId: "production",
      assignee: "생산관리부 / 김과장",
      content: "생산일보 등록 및 작업 지시 확인",
      requestDate: today,
      dueDate: today,
      priority: "높음",
      status: "진행중",
      company: "서암기계공업",
      partName: "BULL GEAR",
      partNo: "CQ91BUL504",
      material: "SNCM439",
    }),
  ];
}

function safeRead() {
  try {
    const raw = globalThis.sessionStorage?.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (parsed.length > 0) return parsed.map(normalizeTask);
    return getSeedTasks();
  } catch {
    return getSeedTasks();
  }
}

function safeWrite(tasks) {
  try {
    globalThis.sessionStorage?.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // SQLite 전환 전 임시 저장소
  }
}

export function getDepartmentWorkTasks({ includeDeleted = false } = {}) {
  const tasks = safeRead();
  if (includeDeleted) return tasks;
  return tasks.filter((task) => !task.deleted);
}

export function upsertDepartmentWorkTask(payload) {
  const normalized = normalizeTask({
    ...payload,
    id: payload.id || createTaskId(),
    updatedAt: new Date().toISOString(),
    createdAt: payload.createdAt || new Date().toISOString(),
  });

  const tasks = safeRead();
  const index = tasks.findIndex((task) => task.id === normalized.id);
  if (index >= 0) {
    tasks[index] = normalized;
  } else {
    tasks.unshift(normalized);
  }
  safeWrite(tasks);
  return normalized;
}

export function softDeleteDepartmentWorkTask(id) {
  const tasks = safeRead();
  const index = tasks.findIndex((task) => task.id === id);
  if (index < 0) return null;
  tasks[index] = { ...tasks[index], deleted: true, updatedAt: new Date().toISOString() };
  safeWrite(tasks);
  return tasks[index];
}

export function createEmptyDepartmentWorkRegister(defaultDepartmentId = "quality") {
  return {
    title: "",
    departmentId: defaultDepartmentId,
    assignee: getCurrentTitanUser(),
    content: "",
    requestDate: getJournalReferenceDate(),
    dueDate: "",
    priority: "보통",
    status: "대기",
    note: "",
    company: "",
    partName: "",
    partNo: "",
    material: "",
    managementId: "",
  };
}

export function buildDepartmentWorkKpiCounts(tasks, departmentTab = "all") {
  const filtered =
    departmentTab === "all" ? tasks : tasks.filter((task) => task.departmentId === departmentTab);

  return {
    waiting: filtered.filter((task) => task.status === "대기").length,
    inProgress: filtered.filter((task) => task.status === "진행중").length,
    completed: filtered.filter((task) => task.status === "완료").length,
    hold: filtered.filter((task) => task.status === "보류").length,
  };
}
