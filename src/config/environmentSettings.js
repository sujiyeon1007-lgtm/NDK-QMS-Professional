/**
 * Project TITAN V1.0 — 환경설정 메뉴 구성 (Menu Freeze V1.0)
 * @see src/config/menuFreezeV1.js — ENVIRONMENT_TAB_GROUPS_FREEZE
 */

import {
  Building2,
  Users,
  Shield,
  Bell,
  Archive,
  ScrollText,
  Settings,
  Database,
  Activity,
  Info,
  Server,
  Layers,
  GitBranch,
  Bug,
  Tags,
  UserCog,
} from "lucide-react";

/** @typedef {"system" | "users" | "info" | "admin"} EnvironmentTabGroupId */

/** @type {Array<{ id: EnvironmentTabGroupId, label: string, adminOnly?: boolean }>} */
export const ENVIRONMENT_TAB_GROUPS = [
  { id: "system", label: "① 시스템" },
  { id: "users", label: "② 사용자" },
  { id: "info", label: "③ 정보관리" },
  { id: "admin", label: "④ 관리자", adminOnly: true },
];

/** @type {Array<{ id: string, group: EnvironmentTabGroupId, label: string, path: string, icon: import("react").ComponentType, desc?: string, adminOnly?: boolean, masterDataTab?: boolean }>} */
export const ENVIRONMENT_TABS = [
  { id: "program", group: "system", label: "프로그램 설정", path: "/environment/program", icon: Settings, desc: "저장 경로 · 자동 백업" },
  { id: "status", group: "system", label: "시스템 설정", path: "/environment/status", icon: Activity, desc: "라이선스 · 시스템 상태 · 업데이트" },
  { id: "backup", group: "system", label: "백업 / 복원", path: "/environment/backup", icon: Archive, desc: "원클릭 전체 백업" },
  { id: "logs", group: "system", label: "로그관리", path: "/environment/logs", icon: ScrollText, desc: "로그인 · 변경 · 오류" },
  { id: "users", group: "users", label: "사용자관리", path: "/environment/users", icon: Users, desc: "프로그램 사용자" },
  { id: "permissions", group: "users", label: "권한관리", path: "/environment/permissions", icon: Shield, desc: "권한별 메뉴 접근" },
  {
    id: "employees",
    group: "info",
    label: "직원정보관리",
    path: "/environment/employees",
    icon: UserCog,
    desc: "직원 마스터 · 부서 · 재직 상태",
    masterDataTab: true,
  },
  {
    id: "customCodes",
    group: "info",
    label: "사용자정의코드",
    path: "/environment/customCodes",
    icon: Tags,
    desc: "상태 · 긴급 · 우선순위 · 단위 코드",
    masterDataTab: true,
  },
  { id: "about", group: "admin", label: "About", path: "/environment/about", icon: Info, desc: "프로그램 정보 · 업데이트", adminOnly: true },
  { id: "architecture", group: "admin", label: "Architecture", path: "/environment/architecture", icon: Layers, desc: "공식 정책 · 아키텍처", adminOnly: true },
  { id: "mes-poc", group: "admin", label: "MES PoC", path: "/environment/mes-poc", icon: Server, desc: "MES 연동 사전 검증", adminOnly: true },
  { id: "repository-status", group: "admin", label: "Repository Status", path: "/environment/repository-status", icon: GitBranch, desc: "Repository Layer 상태", adminOnly: true },
  { id: "debug", group: "admin", label: "Debug", path: "/environment/debug", icon: Bug, desc: "개발·Demo 디버그 정보", adminOnly: true },
  { id: "company", group: "admin", label: "회사정보", path: "/environment/company", icon: Building2, desc: "회사 기본 정보 · 로고", adminOnly: true },
  { id: "notifications", group: "admin", label: "알림설정", path: "/environment/notifications", icon: Bell, desc: "업무 알림", adminOnly: true },
  { id: "data", group: "admin", label: "데이터 관리", path: "/environment/data", icon: Database, desc: "샘플 · 정리 · 최적화", adminOnly: true },
];

/**
 * @param {boolean} [isAdmin]
 */
export function getVisibleEnvironmentTabs(isAdmin = false) {
  return ENVIRONMENT_TABS.filter((tab) => !tab.adminOnly || isAdmin);
}

/**
 * @param {boolean} [isAdmin]
 */
export function getEnvironmentTabGroups(isAdmin = false) {
  const visible = getVisibleEnvironmentTabs(isAdmin);
  return ENVIRONMENT_TAB_GROUPS.filter((group) => !group.adminOnly || isAdmin)
    .map((group) => ({
      ...group,
      tabs: visible.filter((tab) => tab.group === group.id),
    }))
    .filter((group) => group.tabs.length > 0);
}

export function getEnvironmentTabMeta(tabId) {
  return ENVIRONMENT_TABS.find((tab) => tab.id === tabId) ?? ENVIRONMENT_TABS[0];
}

export function resolveEnvironmentTab(tabParam) {
  const tab = ENVIRONMENT_TABS.find((item) => item.id === tabParam);
  return tab?.id ?? "program";
}

export function isEnvironmentAdminTab(tabId) {
  return Boolean(ENVIRONMENT_TABS.find((tab) => tab.id === tabId)?.adminOnly);
}

export function isEnvironmentMasterDataTab(tabId) {
  return Boolean(ENVIRONMENT_TABS.find((tab) => tab.id === tabId)?.masterDataTab);
}
