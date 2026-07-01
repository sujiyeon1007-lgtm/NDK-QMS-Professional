/**
 * Project TITAN V1.0 — 부서별 업무 리스트 · 검색
 */

import { matchesBasicSearch } from "../config/listSearchStandard";
import { DEPARTMENT_WORK_STATUS } from "../config/departmentWorkDashboard";

const STATUS_VARIANT = {
  대기: "wait",
  진행중: "progress",
  완료: "complete",
  보류: "hold",
};

const PRIORITY_VARIANT = {
  높음: "danger",
  보통: "default",
  낮음: "muted",
};

export function mapDepartmentWorkToListRow(task) {
  return {
    id: task.id,
    title: task.title,
    department: task.department,
    departmentId: task.departmentId,
    assignee: task.assignee,
    requestDate: task.requestDate,
    dueDate: task.dueDate || "—",
    priority: task.priority,
    priorityVariant: PRIORITY_VARIANT[task.priority] || "default",
    status: task.status,
    statusLabel: task.status,
    statusVariant: STATUS_VARIANT[task.status] || "wait",
    company: task.company || "—",
    partName: task.partName || "—",
    partNo: task.partNo || "—",
    material: task.material || "—",
    registeredDate: task.requestDate,
    task,
  };
}

export function matchesDepartmentWorkSearch(row, search) {
  const record = {
    company: row.company !== "—" ? row.company : row.department,
    partName: row.title,
    partNo: row.partNo !== "—" ? row.partNo : row.id,
    material: row.material !== "—" ? row.material : row.task.content,
  };

  if (!matchesBasicSearch(search, record)) return false;

  if (search.assignee && !String(row.assignee).toLowerCase().includes(search.assignee.toLowerCase())) {
    return false;
  }
  if (search.status && row.status !== search.status) return false;
  if (search.priority && row.priority !== search.priority) return false;
  if (search.title && !String(row.title).toLowerCase().includes(search.title.toLowerCase())) {
    return false;
  }
  if (search.requestDateFrom && row.requestDate < search.requestDateFrom) return false;
  if (search.requestDateTo && row.requestDate > search.requestDateTo) return false;
  if (search.dueDateFrom && row.dueDate !== "—" && row.dueDate < search.dueDateFrom) return false;
  if (search.dueDateTo && row.dueDate !== "—" && row.dueDate > search.dueDateTo) return false;

  return true;
}

export function filterDepartmentWorkByTab(rows, departmentTab) {
  if (!departmentTab || departmentTab === "all") return rows;
  return rows.filter((row) => row.departmentId === departmentTab);
}

export { DEPARTMENT_WORK_STATUS };
