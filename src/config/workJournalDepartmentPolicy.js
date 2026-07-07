/**
 * Project TITAN — 부서별 업무일지 정책 (PM FINAL)
 * 공통 업무일지 ❌ · Launcher(Hub)별 독립 업무일지
 * @see .cursor/rules/project-titan-work-journal-department-policy.mdc
 */

import { WORK_JOURNAL_ACTION_TYPES } from "./titanAssigneePolicy";

/** @typedef {'operations' | 'production' | 'quality' | 'sales' | 'accounting' | 'admin'} WorkJournalDepartmentId */

export const WORK_JOURNAL_POLICY_VERSION = "V1.5";
export const WORK_JOURNAL_POLICY_LOCKED = true;

/** SessionStorage key suffix — department별 독립 저장 */
export const WORK_JOURNAL_STORAGE_KEY_PREFIX = "project-titan-work-journal";

/** @deprecated legacy single journal — production으로 마이그레이션 */
export const WORK_JOURNAL_LEGACY_STORAGE_KEY = "project-titan-work-journal-v1";

/**
 * 부서별 업무일지 정의
 * @type {Record<WorkJournalDepartmentId, object>}
 */
export const WORK_JOURNAL_DEPARTMENTS = {
  operations: {
    id: "operations",
    label: "운영 업무일지",
    launcherHubId: "inoutManagement",
    hubPath: "/inout",
    hubLabel: "입출고관리",
    route: "/inout/work-journal",
    status: "active",
    manualCategories: [
      "입고 검사",
      "출고 준비",
      "재고 확인",
      "거래처 대응",
      "출력·명세서",
      "회의",
      "특이사항",
      "개선사항",
    ],
  },
  production: {
    id: "production",
    label: "생산 업무일지",
    launcherHubId: "productionManagement",
    hubPath: "/production",
    hubLabel: "생산관리",
    route: "/production/work-journal",
    status: "active",
    manualCategories: [
      "LOT 작업",
      "설비 점검",
      "작업지시",
      "열처리 특이사항",
      "생산 회의",
      "특이사항",
      "개선사항",
    ],
  },
  quality: {
    id: "quality",
    label: "품질 업무일지",
    launcherHubId: "qualityManagement",
    hubPath: "/quality",
    hubLabel: "품질관리",
    route: "/quality/work-journal",
    status: "active",
    manualCategories: [
      "검사 특이사항",
      "성적서 검토",
      "NCR",
      "고객 대응",
      "품질 회의",
      "특이사항",
      "개선사항",
    ],
  },
  sales: {
    id: "sales",
    label: "영업 업무일지",
    launcherHubId: null,
    hubPath: null,
    hubLabel: "영업",
    route: "/sales/work-journal",
    status: "planned",
    manualCategories: ["고객 방문", "수주", "출고 협의", "특이사항"],
  },
  accounting: {
    id: "accounting",
    label: "경리 업무일지",
    launcherHubId: null,
    hubPath: null,
    hubLabel: "경리",
    route: "/accounting/work-journal",
    status: "planned",
    manualCategories: ["세금계산서", "정산", "특이사항"],
  },
  admin: {
    id: "admin",
    label: "관리 업무일지",
    launcherHubId: null,
    hubPath: null,
    hubLabel: "관리",
    route: "/admin/work-journal",
    status: "planned",
    manualCategories: ["회의", "시스템", "특이사항"],
  },
};

/** Launcher에 노출되는 활성 부서 (순서) */
export const ACTIVE_WORK_JOURNAL_DEPARTMENT_ORDER = ["operations", "production", "quality"];

/** Workflow auto-record → 부서 매핑 */
export const WORK_JOURNAL_ACTION_DEPARTMENT_MAP = {
  [WORK_JOURNAL_ACTION_TYPES.INBOUND_REGISTER]: "operations",
  [WORK_JOURNAL_ACTION_TYPES.OUTBOUND_REGISTER]: "operations",
  [WORK_JOURNAL_ACTION_TYPES.INVENTORY_ADJUST]: "operations",
  [WORK_JOURNAL_ACTION_TYPES.PRODUCTION_DAILY_REGISTER]: "production",
  [WORK_JOURNAL_ACTION_TYPES.QR_REGISTER]: "production",
  [WORK_JOURNAL_ACTION_TYPES.INSPECTION_REGISTER]: "quality",
  [WORK_JOURNAL_ACTION_TYPES.CERTIFICATE_ISSUE]: "quality",
};

/** Demo auto-entry (autoStep) → 부서 */
export const WORK_JOURNAL_AUTO_STEP_DEPARTMENT_MAP = {
  incoming: "operations",
  shipment: "operations",
  plan: "production",
  lot: "production",
  worksheet: "production",
  certificate: "quality",
};

export function getWorkJournalStorageKey(departmentId) {
  return `${WORK_JOURNAL_STORAGE_KEY_PREFIX}-${departmentId}-v1`;
}

export function getWorkJournalDepartment(departmentId) {
  return WORK_JOURNAL_DEPARTMENTS[departmentId] ?? null;
}

export function getActiveWorkJournalDepartments() {
  return ACTIVE_WORK_JOURNAL_DEPARTMENT_ORDER.map((id) => WORK_JOURNAL_DEPARTMENTS[id]).filter(
    Boolean
  );
}

export function resolveWorkJournalDepartmentFromPath(pathname = "") {
  const path = String(pathname).split("?")[0];
  const match = getActiveWorkJournalDepartments().find(
    (dept) => path === dept.route || path.startsWith(`${dept.route}/`)
  );
  if (match) return match;
  if (path === "/work-journal" || path.startsWith("/work-journal/")) {
    return WORK_JOURNAL_DEPARTMENTS.production;
  }
  return null;
}

export function resolveWorkJournalDepartmentFromAction(actionType) {
  if (!actionType) return "production";
  return WORK_JOURNAL_ACTION_DEPARTMENT_MAP[actionType] ?? "production";
}

export function resolveJournalEntryDepartment(entry) {
  if (entry?.journalDepartment) return entry.journalDepartment;
  if (entry?.actionType) {
    return resolveWorkJournalDepartmentFromAction(entry.actionType);
  }
  if (entry?.autoStep) {
    return WORK_JOURNAL_AUTO_STEP_DEPARTMENT_MAP[entry.autoStep] ?? "production";
  }
  return "production";
}

export function entryBelongsToJournalDepartment(entry, departmentId) {
  return resolveJournalEntryDepartment(entry) === departmentId;
}

export function getManualJournalCategoriesForDepartment(departmentId) {
  return getWorkJournalDepartment(departmentId)?.manualCategories ?? [];
}
