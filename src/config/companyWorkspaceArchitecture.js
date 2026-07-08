import {
  BadgeCheck,
  Building2,
  FileText,
  LayoutDashboard,
  MapPin,
  Network,
  Palette,
  UserCircle,
  Users,
} from "lucide-react";

import { TITAN_WORKSPACE_HOME_PRINCIPLE } from "./titanWorkspaceDesignPrinciple";

/**
 * Company Master Workspace — Architecture
 *
 * Workspace Home principle (V1.0): see TITAN_WORKSPACE_HOME_PRINCIPLE
 */
export { TITAN_WORKSPACE_HOME_PRINCIPLE };
export const COMPANY_WORKSPACE_BASE_PATH = "/company";

export const COMPANY_WORKSPACE_ROUTES = {
  dashboard: `${COMPANY_WORKSPACE_BASE_PATH}/dashboard`,
  information: `${COMPANY_WORKSPACE_BASE_PATH}/information`,
  sites: `${COMPANY_WORKSPACE_BASE_PATH}/sites`,
  organization: `${COMPANY_WORKSPACE_BASE_PATH}/organization`,
  departments: `${COMPANY_WORKSPACE_BASE_PATH}/departments`,
  employees: `${COMPANY_WORKSPACE_BASE_PATH}/employees`,
  positions: `${COMPANY_WORKSPACE_BASE_PATH}/positions`,
  branding: `${COMPANY_WORKSPACE_BASE_PATH}/branding`,
  documentFooter: `${COMPANY_WORKSPACE_BASE_PATH}/document-footer`,
};

export const COMPANY_WORKSPACE_NAV = [
  { id: "workspace", to: COMPANY_WORKSPACE_ROUTES.dashboard, label: "Workspace", icon: LayoutDashboard },
  { id: "information", to: COMPANY_WORKSPACE_ROUTES.information, label: "회사 기본정보", icon: Building2 },
  { id: "sites", to: COMPANY_WORKSPACE_ROUTES.sites, label: "사업장 관리", icon: MapPin },
  { id: "organization", to: COMPANY_WORKSPACE_ROUTES.organization, label: "조직도", icon: Network },
  { id: "departments", to: COMPANY_WORKSPACE_ROUTES.departments, label: "부서관리", icon: Users },
  { id: "employees", to: COMPANY_WORKSPACE_ROUTES.employees, label: "직원관리", icon: UserCircle },
  { id: "positions", to: COMPANY_WORKSPACE_ROUTES.positions, label: "직급관리", icon: BadgeCheck },
  { id: "branding", to: COMPANY_WORKSPACE_ROUTES.branding, label: "Branding", icon: Palette },
  { id: "documentFooter", to: COMPANY_WORKSPACE_ROUTES.documentFooter, label: "문서 Footer", icon: FileText },
];

export const COMPANY_WORKSPACE_QUICK_LINKS = [
  { id: "qr", label: "QR Engine", path: "/qr/dashboard" },
  { id: "equipment", label: "설비 현황", path: "/equipment-status" },
  { id: "product", label: "제품 현황", path: "/equipment-status?view=product" },
  { id: "documents", label: "문서관리", path: "/documents" },
];

export const COMPANY_WORKSPACE_SECTIONS = [
  {
    id: "information",
    label: "회사 기본정보",
    path: COMPANY_WORKSPACE_ROUTES.information,
    description: "회사명 · 사업자등록번호 · 대표자 · 연락처",
    badge: "기본",
    badgeColor: "blue",
    icon: Building2,
    launcherTone: "blue",
    phase: 11,
  },
  {
    id: "sites",
    label: "사업장 관리",
    path: COMPANY_WORKSPACE_ROUTES.sites,
    description: "본사 · 제1공장 · 제2공장 · 창고",
    badge: "사업장",
    badgeColor: "green",
    icon: MapPin,
    launcherTone: "green",
    phase: 11,
  },
  {
    id: "organization",
    label: "조직도",
    path: COMPANY_WORKSPACE_ROUTES.organization,
    description: "조직 구조 (Tree 확장 예정)",
    badge: "조직",
    badgeColor: "purple",
    icon: Network,
    launcherTone: "purple",
    phase: 11,
    placeholder: true,
  },
  {
    id: "departments",
    label: "부서관리",
    path: COMPANY_WORKSPACE_ROUTES.departments,
    description: "품질 · 생산 · 영업 · 경리 · 회계",
    badge: "부서",
    badgeColor: "cyan",
    icon: Users,
    launcherTone: "orange",
    phase: 11,
  },
  {
    id: "employees",
    label: "직원관리",
    path: COMPANY_WORKSPACE_ROUTES.employees,
    description: "사번 · 부서 · 직급 · 재직상태",
    badge: "인사",
    badgeColor: "orange",
    icon: UserCircle,
    launcherTone: "mint",
    phase: 11,
  },
  {
    id: "positions",
    label: "직급관리",
    path: COMPANY_WORKSPACE_ROUTES.positions,
    description: "사원 · 주임 · 대리 · 과장 · 차장 …",
    badge: "직급",
    badgeColor: "purple",
    icon: BadgeCheck,
    launcherTone: "sky",
    phase: 11,
  },
  {
    id: "branding",
    label: "Branding",
    path: COMPANY_WORKSPACE_ROUTES.branding,
    description: "로고 · 직인 · 서명",
    badge: "브랜드",
    badgeColor: "green",
    icon: Palette,
    launcherTone: "pink",
    phase: 11,
    placeholder: true,
  },
  {
    id: "documentFooter",
    label: "문서 Footer",
    path: COMPANY_WORKSPACE_ROUTES.documentFooter,
    description: "성적서 · 거래명세서 · QR 출력 공통 Footer",
    badge: "문서",
    badgeColor: "blue",
    icon: FileText,
    launcherTone: "amber",
    phase: 11,
  },
];

export const COMPANY_SECTION_UI = {
  information: {
    layout: "form",
    previewFields: [
      "회사명",
      "영문명",
      "사업자등록번호",
      "법인등록번호",
      "대표자",
      "업태 · 종목",
      "주소",
      "전화 · 팩스 · 이메일",
      "홈페이지",
    ],
  },
  sites: {
    layout: "table",
    previewColumns: ["사업장명", "유형", "주소", "전화", "상태"],
  },
  organization: {
    layout: "tree",
    previewNote: "조직도 Tree Editor — 향후 Sprint 확장",
  },
  departments: {
    layout: "table",
    previewColumns: ["부서코드", "부서명", "상태"],
  },
  employees: {
    layout: "table",
    previewColumns: ["사번", "이름", "부서", "직급", "연락처", "재직상태"],
  },
  positions: {
    layout: "table",
    previewColumns: ["순위", "직급코드", "직급명", "상태"],
  },
  branding: {
    layout: "slots",
    previewSlots: ["회사 로고", "직인", "서명"],
  },
  documentFooter: {
    layout: "form",
    previewFields: ["회사명", "주소", "전화", "이메일", "Copyright"],
  },
};

export const COMPANY_RECENT_ACTIVITY_DEMO = [
  { id: "a1", label: "직원 정보 수정", at: "2시간 전", tone: "mint", sectionId: "employees" },
  { id: "a2", label: "부서 정보 추가", at: "4시간 전", tone: "orange", sectionId: "departments" },
  { id: "a3", label: "회사정보 수정", at: "1일 전", tone: "blue", sectionId: "information" },
  { id: "a4", label: "Branding 변경", at: "2일 전", tone: "purple", sectionId: "branding" },
  { id: "a5", label: "Footer 수정", at: "3일 전", tone: "amber", sectionId: "documentFooter" },
];

export const COMPANY_WORKSPACE_COPY = {
  workspaceTitle: "Company Workspace",
  workspaceKicker: "Company Master",
  workspaceIntro:
    "TITAN 전체가 참조하는 Company Master — 성적서 · 거래명세서 · QR · Document Studio 공통 Source of Truth",
  workspaceLauncherTitle: "Company Master 관리",
  workspaceLauncherDesc: "관리 영역을 선택해 회사 정보를 통합 관리합니다.",
  dashboardTitle: "Workspace",
  dashboardWorkflow:
    "회사 기본정보 → 사업장 → 조직도 → 부서 → 직원 → 직급 → Branding → 문서 Footer",
  informationTitle: "회사 기본정보",
  sitesTitle: "사업장 관리",
  organizationTitle: "조직도",
  departmentsTitle: "부서관리",
  employeesTitle: "직원관리",
  positionsTitle: "직급관리",
  brandingTitle: "Branding",
  documentFooterTitle: "문서 Footer",
  summaryTitle: "회사 정보 요약",
  summaryEditLabel: "수정",
  recentActivityTitle: "최근 변경 내역",
  recentActivityMore: "더보기",
  launcherGoLabel: "바로가기",
  organizationPlaceholder:
    "조직도 Tree Editor는 향후 Sprint에서 확장합니다. 현재는 Company Master 구조만 준비합니다.",
  brandingPlaceholder:
    "로고 · 직인 · 서명 업로드 및 TDE 연동은 향후 Sprint에서 구현합니다.",
  environmentSeparationNote:
    "회사정보는 Environment(프로그램 설정)와 분리된 Company Master Workspace입니다.",
  uiPreviewBadge: "준비중",
  uiPreviewTitle: "준비중인 Workspace",
  uiPreviewNote: "UI 승인 후 데이터 입력 · CRUD가 연결됩니다.",
  uiPreviewPlaceholder: "Placeholder",
  uiPreviewFuture: "추후 CRUD 연결 예정",
  uiPreviewSample: "화면 예시",
};

export const COMPANY_BUSINESS_SITE_TYPES = [
  { id: "headquarters", label: "본사" },
  { id: "factory", label: "공장" },
  { id: "warehouse", label: "창고" },
  { id: "office", label: "사무소" },
  { id: "other", label: "기타" },
];

export const COMPANY_EMPLOYEE_STATUS = [
  { id: "active", label: "재직" },
  { id: "leave", label: "휴직" },
  { id: "retired", label: "퇴사" },
];

export function getCompanySectionById(sectionId) {
  return COMPANY_WORKSPACE_SECTIONS.find((section) => section.id === sectionId) ?? null;
}

export function getCompanySectionTitle(sectionId) {
  return COMPANY_WORKSPACE_COPY[`${sectionId}Title`] ?? getCompanySectionById(sectionId)?.label ?? "";
}
