import {
  Archive,
  Bell,
  Hash,
  LayoutDashboard,
  LayoutGrid,
  QrCode,
  Settings,
  Shield,
  ToggleLeft,
  Users,
} from "lucide-react";

import { TITAN_WORKSPACE_HOME_PRINCIPLE } from "./titanWorkspaceDesignPrinciple";

/**
 * Environment Workspace — Architecture (Sprint 12)
 *
 * Program settings ONLY — no company info (Company Workspace only).
 * Workspace Home principle (V1.0): see TITAN_WORKSPACE_HOME_PRINCIPLE
 */
export { TITAN_WORKSPACE_HOME_PRINCIPLE };

export const ENVIRONMENT_WORKSPACE_BASE_PATH = "/environment";

export const ENVIRONMENT_WORKSPACE_ROUTES = {
  dashboard: `${ENVIRONMENT_WORKSPACE_BASE_PATH}/dashboard`,
  users: `${ENVIRONMENT_WORKSPACE_BASE_PATH}/users`,
  permissions: `${ENVIRONMENT_WORKSPACE_BASE_PATH}/permissions`,
  menus: `${ENVIRONMENT_WORKSPACE_BASE_PATH}/menus`,
  menuToggle: `${ENVIRONMENT_WORKSPACE_BASE_PATH}/menu-toggle`,
  numbering: `${ENVIRONMENT_WORKSPACE_BASE_PATH}/numbering`,
  qrSettings: `${ENVIRONMENT_WORKSPACE_BASE_PATH}/qr-settings`,
  backup: `${ENVIRONMENT_WORKSPACE_BASE_PATH}/backup`,
  notifications: `${ENVIRONMENT_WORKSPACE_BASE_PATH}/notifications`,
  system: `${ENVIRONMENT_WORKSPACE_BASE_PATH}/system`,
};

export const ENVIRONMENT_WORKSPACE_NAV = [
  { id: "workspace", to: ENVIRONMENT_WORKSPACE_ROUTES.dashboard, label: "Workspace", icon: LayoutDashboard },
  { id: "users", to: ENVIRONMENT_WORKSPACE_ROUTES.users, label: "사용자 관리", icon: Users },
  { id: "permissions", to: ENVIRONMENT_WORKSPACE_ROUTES.permissions, label: "권한 관리", icon: Shield },
  { id: "menus", to: ENVIRONMENT_WORKSPACE_ROUTES.menus, label: "메뉴 관리", icon: LayoutGrid },
  { id: "menuToggle", to: ENVIRONMENT_WORKSPACE_ROUTES.menuToggle, label: "메뉴 ON/OFF", icon: ToggleLeft },
  { id: "numbering", to: ENVIRONMENT_WORKSPACE_ROUTES.numbering, label: "번호체계", icon: Hash },
  { id: "qrSettings", to: ENVIRONMENT_WORKSPACE_ROUTES.qrSettings, label: "QR 설정", icon: QrCode },
  { id: "backup", to: ENVIRONMENT_WORKSPACE_ROUTES.backup, label: "백업 / 복원", icon: Archive },
  { id: "notifications", to: ENVIRONMENT_WORKSPACE_ROUTES.notifications, label: "알림 설정", icon: Bell },
  { id: "system", to: ENVIRONMENT_WORKSPACE_ROUTES.system, label: "시스템 설정", icon: Settings },
];

export const ENVIRONMENT_WORKSPACE_SECTIONS = [
  {
    id: "users",
    label: "사용자 관리",
    path: ENVIRONMENT_WORKSPACE_ROUTES.users,
    description: "관리자 · 품질 · 생산 · 영업 계정 생성 · 수정 · 삭제",
    badge: "계정",
    badgeColor: "blue",
    icon: Users,
    launcherTone: "blue",
    phase: 12,
    placeholder: true,
  },
  {
    id: "permissions",
    label: "권한 관리",
    path: ENVIRONMENT_WORKSPACE_ROUTES.permissions,
    description: "역할별 메뉴 · 기능 · QR 권한",
    badge: "권한",
    badgeColor: "purple",
    icon: Shield,
    launcherTone: "purple",
    phase: 12,
    placeholder: true,
  },
  {
    id: "menus",
    label: "메뉴 관리",
    path: ENVIRONMENT_WORKSPACE_ROUTES.menus,
    description: "Sidebar · Launcher · Tab 메뉴 구조",
    badge: "메뉴",
    badgeColor: "green",
    icon: LayoutGrid,
    launcherTone: "green",
    phase: 12,
    placeholder: true,
  },
  {
    id: "menuToggle",
    label: "메뉴 ON/OFF",
    path: ENVIRONMENT_WORKSPACE_ROUTES.menuToggle,
    description: "모듈 · 기능 ON/OFF · Sidebar · HOME 연동",
    badge: "모듈",
    badgeColor: "cyan",
    icon: ToggleLeft,
    launcherTone: "mint",
    phase: 12,
    placeholder: true,
  },
  {
    id: "numbering",
    label: "번호체계",
    path: ENVIRONMENT_WORKSPACE_ROUTES.numbering,
    description: "문서번호 · 관리번호 · LOT · 자동채번 규칙",
    badge: "번호",
    badgeColor: "orange",
    icon: Hash,
    launcherTone: "orange",
    phase: 12,
    placeholder: true,
  },
  {
    id: "qrSettings",
    label: "QR 설정",
    path: ENVIRONMENT_WORKSPACE_ROUTES.qrSettings,
    description: "QR 정보관리 · Smart Access · 출력 정책",
    badge: "QR",
    badgeColor: "sky",
    icon: QrCode,
    launcherTone: "sky",
    phase: 12,
    placeholder: true,
  },
  {
    id: "backup",
    label: "백업 / 복원",
    path: ENVIRONMENT_WORKSPACE_ROUTES.backup,
    description: "원클릭 전체 백업 · 복원 · 이력",
    badge: "백업",
    badgeColor: "amber",
    icon: Archive,
    launcherTone: "amber",
    phase: 12,
    placeholder: true,
  },
  {
    id: "notifications",
    label: "알림 설정",
    path: ENVIRONMENT_WORKSPACE_ROUTES.notifications,
    description: "업무 알림 · 공지 · 이메일 · 팝업",
    badge: "알림",
    badgeColor: "pink",
    icon: Bell,
    launcherTone: "pink",
    phase: 12,
    placeholder: true,
  },
  {
    id: "system",
    label: "시스템 설정",
    path: ENVIRONMENT_WORKSPACE_ROUTES.system,
    description: "프로그램 · 라이선스 · 저장경로 · 시스템 상태",
    badge: "시스템",
    badgeColor: "blue",
    icon: Settings,
    launcherTone: "blue",
    phase: 12,
    placeholder: true,
  },
];

export const ENVIRONMENT_SECTION_UI = {
  users: {
    layout: "table",
    previewColumns: ["사용자ID", "이름", "역할", "부서", "상태", "최근 로그인"],
  },
  permissions: {
    layout: "table",
    previewColumns: ["역할", "메뉴 권한", "기능 권한", "QR 권한", "상태"],
  },
  menus: {
    layout: "table",
    previewColumns: ["메뉴", "그룹", "경로", "상태", "비고"],
  },
  menuToggle: {
    layout: "table",
    previewColumns: ["모듈", "상태", "Sidebar", "HOME", "비고"],
  },
  numbering: {
    layout: "form",
    previewFields: ["문서번호 규칙", "관리번호 규칙", "LOT 규칙", "자동채번", "접두어", "순번"],
  },
  qrSettings: {
    layout: "form",
    previewFields: ["Smart Access ID", "QR 출력 정책", "Portal 연동", "설비 QR", "문서 QR"],
  },
  backup: {
    layout: "table",
    previewColumns: ["백업일시", "유형", "크기", "상태", "비고"],
  },
  notifications: {
    layout: "form",
    previewFields: ["업무 알림", "공지 알림", "이메일", "팝업", "적용 대상"],
  },
  system: {
    layout: "form",
    previewFields: ["프로그램 버전", "저장 경로", "자동 백업", "라이선스", "시스템 상태"],
  },
};

export const ENVIRONMENT_WORKSPACE_COPY = {
  workspaceTitle: "Environment Workspace",
  workspaceKicker: "Program Settings",
  workspaceIntro:
    "TITAN 프로그램 설정 전용 Workspace — 사용자 · 권한 · 메뉴 · QR · 백업 · 시스템 (회사정보는 Company Workspace)",
  workspaceLauncherTitle: "프로그램 설정 관리",
  workspaceLauncherDesc: "관리 영역을 선택해 프로그램 설정을 통합 관리합니다.",
  dashboardTitle: "Workspace",
  dashboardWorkflow:
    "사용자 → 권한 → 메뉴 → 메뉴 ON/OFF → 번호체계 → QR → 백업 → 알림 → 시스템",
  usersTitle: "사용자 관리",
  permissionsTitle: "권한 관리",
  menusTitle: "메뉴 관리",
  menuToggleTitle: "메뉴 ON/OFF",
  numberingTitle: "번호체계",
  qrSettingsTitle: "QR 설정",
  backupTitle: "백업 / 복원",
  notificationsTitle: "알림 설정",
  systemTitle: "시스템 설정",
  companySeparationNote:
    "회사정보는 Environment가 아닌 Company Master Workspace에서 관리합니다.",
  uiPreviewBadge: "준비중",
  uiPreviewTitle: "준비중인 Workspace",
  uiPreviewNote: "UI 승인 후 데이터 입력 · CRUD가 연결됩니다.",
  uiPreviewPlaceholder: "Placeholder",
  uiPreviewFuture: "추후 CRUD 연결 예정",
  uiPreviewSample: "화면 예시",
  legacyTabsNote: "프로그램 설정 · 모듈 · Storage · 시스템 로그 등 기존 탭은 동일 경로에서 계속 사용할 수 있습니다.",
};

/** Workspace shell paths — launcher home + 9 section placeholders */
export const ENVIRONMENT_WORKSPACE_SECTION_IDS = ENVIRONMENT_WORKSPACE_SECTIONS.map((s) => s.id);

export const ENVIRONMENT_WORKSPACE_PATH_SEGMENTS = [
  "dashboard",
  "users",
  "permissions",
  "menus",
  "menu-toggle",
  "numbering",
  "qr-settings",
  "backup",
  "notifications",
  "system",
];

export function isEnvironmentWorkspaceShellPath(pathname) {
  if (pathname === ENVIRONMENT_WORKSPACE_BASE_PATH || pathname === `${ENVIRONMENT_WORKSPACE_BASE_PATH}/`) {
    return true;
  }
  if (!pathname.startsWith(`${ENVIRONMENT_WORKSPACE_BASE_PATH}/`)) {
    return false;
  }
  const segment = pathname.slice(`${ENVIRONMENT_WORKSPACE_BASE_PATH}/`.length).split("/")[0];
  return ENVIRONMENT_WORKSPACE_PATH_SEGMENTS.includes(segment);
}

export function getEnvironmentSectionById(sectionId) {
  return ENVIRONMENT_WORKSPACE_SECTIONS.find((section) => section.id === sectionId) ?? null;
}

export function getEnvironmentSectionTitle(sectionId) {
  const copyKey = `${sectionId}Title`;
  if (ENVIRONMENT_WORKSPACE_COPY[copyKey]) {
    return ENVIRONMENT_WORKSPACE_COPY[copyKey];
  }
  return getEnvironmentSectionById(sectionId)?.label ?? "";
}

export function resolveEnvironmentWorkspaceSectionId(pathname) {
  if (
    pathname === ENVIRONMENT_WORKSPACE_ROUTES.dashboard ||
    pathname === ENVIRONMENT_WORKSPACE_BASE_PATH ||
    pathname === `${ENVIRONMENT_WORKSPACE_BASE_PATH}/`
  ) {
    return null;
  }
  const segment = pathname.replace(`${ENVIRONMENT_WORKSPACE_BASE_PATH}/`, "").split("/")[0];
  const segmentToId = {
    users: "users",
    permissions: "permissions",
    menus: "menus",
    "menu-toggle": "menuToggle",
    numbering: "numbering",
    "qr-settings": "qrSettings",
    backup: "backup",
    notifications: "notifications",
    system: "system",
  };
  return segmentToId[segment] ?? null;
}
