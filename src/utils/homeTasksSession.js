/**
 * 업무일정 — 사용자 직접 작성 업무(SessionStorage)
 */

import { getCurrentTitanUser } from "./titanHistorySession";

const STORAGE_KEY = "project-titan-work-schedule-v1";

export const HOME_TASK_PRIORITIES = [
  { value: "high", label: "높음" },
  { value: "normal", label: "보통" },
  { value: "low", label: "낮음" },
];

export const HOME_TASK_STATUS = {
  IN_PROGRESS: "진행중",
  DONE: "완료",
};

function safeRead() {
  try {
    const raw = globalThis.sessionStorage?.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function safeWrite(tasks) {
  try {
    globalThis.sessionStorage?.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // SQLite 전환 전 임시 저장소이므로 저장 실패 시 화면 동작을 막지 않습니다.
  }
}

function normalizePriority(priority) {
  if (priority === "urgent" || priority === "important" || priority === "high") return "high";
  if (priority === "low") return "low";
  return "normal";
}

function normalizeTask(task) {
  const status = task.status ?? (task.completed ? HOME_TASK_STATUS.DONE : HOME_TASK_STATUS.IN_PROGRESS);
  return {
    ...task,
    assignee: task.assignee?.trim() || getCurrentTitanUser(),
    time: task.time?.trim() ?? "",
    priority: normalizePriority(task.priority),
    memo: task.memo?.trim() ?? "",
    source: "user",
    status,
    completed: status === HOME_TASK_STATUS.DONE,
  };
}

function sortHomeTasks(tasks) {
  return [...tasks].map(normalizeTask).sort((a, b) => {
    if (a.status !== b.status) return a.status === HOME_TASK_STATUS.DONE ? 1 : -1;
    const priorityOrder = { high: 0, normal: 1, low: 2 };
    const priorityCmp = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityCmp !== 0) return priorityCmp;
    return (a.time || "99:99").localeCompare(b.time || "99:99");
  });
}

export function getUserTodayTasks() {
  const stored = sortHomeTasks(safeRead());
  if (stored.length > 0) return stored;
  return sortHomeTasks([
    {
      id: "seed-task-1",
      title: "검사일지 작성",
      assignee: getCurrentTitanUser(),
      time: "10:00",
      priority: "high",
      status: HOME_TASK_STATUS.IN_PROGRESS,
      completed: false,
      source: "seed",
    },
    {
      id: "seed-task-2",
      title: "성적서 등록",
      assignee: getCurrentTitanUser(),
      time: "11:30",
      priority: "normal",
      status: HOME_TASK_STATUS.DONE,
      completed: true,
      source: "seed",
    },
  ]);
}

export function addUserHomeTask({ title, assignee, time, priority, memo }) {
  const task = normalizeTask({
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: title.trim(),
    assignee: assignee?.trim() || getCurrentTitanUser(),
    time: time?.trim() ?? "",
    priority: priority || "normal",
    memo: memo?.trim() ?? "",
    status: HOME_TASK_STATUS.IN_PROGRESS,
    completed: false,
  });
  safeWrite([task, ...safeRead()]);
  return task;
}

export function updateHomeTask(id, patch) {
  safeWrite(safeRead().map((task) => {
    if (task.id !== id) return task;
    return normalizeTask({ ...task, ...patch });
  }));
}

export function deleteHomeTask(id) {
  safeWrite(safeRead().filter((task) => task.id !== id));
}

export function toggleHomeTaskCompleted(id, completed) {
  updateHomeTask(id, {
    completed,
    status: completed ? HOME_TASK_STATUS.DONE : HOME_TASK_STATUS.IN_PROGRESS,
  });
}

export function getHomeTaskForEdit(id) {
  const task = safeRead().find((item) => item.id === id);
  return task ? normalizeTask(task) : null;
}
