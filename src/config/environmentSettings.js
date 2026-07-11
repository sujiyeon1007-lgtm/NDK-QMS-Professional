/**
 * Project TITAN V1.0 — 환경설정 / 관리자 메뉴 구성
 * @see Menu Freeze V1.3 + V1.2 Admin Architecture
 */

import { MASTER_SSOT_HOLD_ENVIRONMENT_TAB_IDS } from "./masterDataLauncher";

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
  LayoutGrid,
  QrCode,
  HardDrive,
} from "lucide-react";

/** @typedef {"admin" | "system" | "info" | "dev"} EnvironmentTabGroupId */

/** @type {Array<{ id: EnvironmentTabGroupId, label: string, adminOnly?: boolean }>} */
export const ENVIRONMENT_TAB_GROUPS = [
  { id: "admin", label: "관리자" },
  { id: "system", label: "시스템" },
  { id: "info", label: "정보관리" },
  { id: "dev", label: "개발자", adminOnly: true },
];

/** @type {Array<{ id: string, group: EnvironmentTabGroupId, label: string, path: string, icon: import("react").ComponentType, desc?: string, adminOnly?: boolean, masterDataTab?: boolean }>} */
export const ENVIRONMENT_TABS = [
  { id: "users", group: "admin", label: "사용자관리", path: "/environment/users", icon: Users, desc: "관리자가 사용자 계정 생성 · 수정 · 삭제" },
  { id: "permissions", group: "admin", label: "권한관리", path: "/environment/permissions", icon: Shield, desc: "권한별 메뉴 · 기능 접근" },
  { id: "modules", group: "admin", label: "모듈관리", path: "/environment/modules", icon: LayoutGrid, desc: "기능 모듈 ON/OFF · Sidebar · HOME · 라우트" },
  { id: "storage", group: "admin", label: "Storage 관리", path: "/environment/storage", icon: HardDrive, desc: "Storage 폴더 · SQLite 메타 · 사용량", adminOnly: true },
  { id: "backup", group: "admin", label: "백업 / 복원", path: "/environment/backup", icon: Archive, desc: "원클릭 전체 백업" },
  { id: "logs", group: "admin", label: "시스템 로그", path: "/environment/logs", icon: ScrollText, desc: "로그인 · 변경 · 오류" },
  { id: "program", group: "system", label: "프로그램 설정", path: "/environment/program", icon: Settings, desc: "저장 경로 · 자동 백업" },
  { id: "status", group: "system", label: "시스템 설정", path: "/environment/status", icon: Activity, desc: "라이선스 · 시스템 상태 · 업데이트" },
  {
    id: "data",
    group: "system",
    label: "데이터 관리",
    path: "/environment/data",
    icon: Database,
    desc: "Master · 업무 데이터 초기화",
    adminOnly: true,
  },
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
  { id: "about", group: "dev", label: "About", path: "/environment/about", icon: Info, desc: "프로그램 정보 · 업데이트", adminOnly: true },
  { id: "architecture", group: "dev", label: "Architecture", path: "/environment/architecture", icon: Layers, desc: "공식 정책 · 아키텍처", adminOnly: true },
  { id: "mes-poc", group: "dev", label: "MES PoC", path: "/environment/mes-poc", icon: Server, desc: "MES 연동 사전 검증", adminOnly: true },
  { id: "repository-status", group: "dev", label: "Repository Status", path: "/environment/repository-status", icon: GitBranch, desc: "Repository Layer 상태", adminOnly: true },
  { id: "debug", group: "dev", label: "Debug", path: "/environment/debug", icon: Bug, desc: "개발·Demo 디버그 정보", adminOnly: true },
  { id: "company", group: "dev", label: "회사정보", path: "/environment/company", icon: Building2, desc: "회사 기본 정보 · 로고", adminOnly: true },
  { id: "notifications", group: "dev", label: "알림설정", path: "/environment/notifications", icon: Bell, desc: "업무 알림", adminOnly: true },
];

/**
 * @param {boolean} [isAdmin]
 */
export function getVisibleEnvironmentTabs(isAdmin = false) {
  return ENVIRONMENT_TABS.filter(
    (tab) => !MASTER_SSOT_HOLD_ENVIRONMENT_TAB_IDS.has(tab.id) && (!tab.adminOnly || isAdmin)
  );
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

export function getEnvironmentTabById(tabId) {
  return ENVIRONMENT_TABS.find((tab) => tab.id === tabId) ?? null;
}

export function getEnvironmentDefaultTab(isAdmin = false) {
  return isAdmin ? "users" : "program";
}

export function isEnvironmentAdminTab(tabId) {
  const tab = getEnvironmentTabById(tabId);
  return Boolean(tab?.adminOnly);
}

/**
 * URL :tab 파라미터 → ENVIRONMENT_TABS id
 * @param {string} [tabParam]
 * @param {boolean} [isAdmin]
 */
export function resolveEnvironmentTab(tabParam, isAdmin = false) {
  const tab = String(tabParam ?? "").trim();
  if (getEnvironmentTabById(tab)) return tab;
  return getEnvironmentDefaultTab(isAdmin);
}
