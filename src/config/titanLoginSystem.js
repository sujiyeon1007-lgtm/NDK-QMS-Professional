/**
 * Project TITAN V1.1 — Login System (PM Final Official Design)
 *
 * 지원: 아이디 저장 · 로그인 · 로그아웃 · 비밀번호 변경
 * 미지원: 회원가입 · 비밀번호 찾기 · 비밀번호 저장
 * 기본 관리자: admin / 1234 · Program Administrator · 최초 설치 시 자동 생성
 * 5회 로그인 실패 → 임시 잠금 · Login → Loading → HOME
 */

export const TITAN_LOGIN_VERSION = "V1.1 Presentation Build";

/** Footer — 좌 · 가운데 · 우 (Login UI V1.1) */
export const TITAN_LOGIN_COPYRIGHT = "© NDK Co., Ltd. All rights reserved.";
export const TITAN_LOGIN_FOOTER_PRODUCT = "Project TITAN";
export const TITAN_LOGIN_FOOTER_VERSION_LINE = "Version 1.0.0";
export const TITAN_LOGIN_FOOTER_BUILD = "Presentation Build";
/** @deprecated V1.1 — use TITAN_LOGIN_FOOTER_* split constants */
export const TITAN_LOGIN_FOOTER_VERSION = "Project TITAN / Version 1.0.0 / Presentation Build";

export const TITAN_LOGIN_FOOTER_TRUST = [
  { label: "Security First", icon: "shield" },
  { label: "Data Integrity", icon: "database" },
  { label: "Trusted Solution", icon: "globe" },
];

/** 우측 로그인 카드 — LOGIN 아래 */
export const TITAN_LOGIN_FORM_PRODUCT = "Project TITAN";

/** Left brand — logo 아래 (작은 글씨) */
export const TITAN_LOGIN_BRAND_SUBTITLE = "Integrated Management System";

/** Left brand — 기능 소개 (아이콘 + 한 줄) */
export const TITAN_LOGIN_BRAND_MODULES = [
  { label: "Quality", icon: "shield" },
  { label: "Production", icon: "settings" },
  { label: "Certificate", icon: "fileText" },
  { label: "Document", icon: "folder" },
];

/** Left brand — 슬로건 (3줄) */
export const TITAN_LOGIN_BRAND_SLOGAN_LINES = ["One Platform", "One Workflow", "One Data"];

/** Left brand — 하단 태그라인 */
export const TITAN_LOGIN_BRAND_BOTTOM_TAGLINE = "Quality · Process · Data · Future";

/** Login → HOME 전환 Loading 화면 표시 시간(ms) */
export const TITAN_LOGIN_TRANSITION_MS = 1200;

export const TITAN_LOGIN_STORAGE = {
  authData: "project-titan-auth-data-v1",
  authSession: "project-titan-auth-session-v1",
  rememberLoginId: "project-titan-remember-login-id",
  authChanged: "titan-auth-changed",
};

export const TITAN_DEFAULT_ADMIN = {
  loginId: "admin",
  defaultPassword: "1234",
  name: "Program Administrator",
  department: "경영지원",
  rank: "관리자",
  roleId: "ROLE_PROGRAM_ADMIN",
};

export const TITAN_LOGIN_LOCK_POLICY = {
  maxFailures: 5,
  lockMinutes: 5,
};

/** 메뉴 권한 — Sidebar · Route · 권한관리 UI 공통 */
export const TITAN_MENU_PERMISSIONS = [
  { key: "home", label: "HOME", catalogId: "home" },
  { key: "masterData", label: "기준정보관리", catalogId: "masterData" },
  { key: "inbound", label: "입고관리", catalogId: "inboundStatus" },
  { key: "production", label: "생산관리", catalogId: "workDaily" },
  { key: "inspection", label: "검사관리", catalogId: "quality" },
  { key: "certificate", label: "성적서관리", catalogId: "certificateStatus" },
  { key: "outbound", label: "출고관리", catalogId: "outboundStatus" },
  { key: "inventory", label: "재고관리", catalogId: "inventoryStatus" },
  { key: "documents", label: "문서관리", catalogId: "documents" },
  { key: "statistics", label: "통계관리", catalogId: "statisticsInquiry" },
  { key: "accountingClerk", label: "경리관리", catalogId: "accountingClerk" },
  { key: "accounting", label: "회계관리", catalogId: "accounting" },
  { key: "qrManagement", label: "QR 관리", catalogId: "qrManagement" },
  { key: "admin", label: "관리자", catalogId: "environment" },
];

/** 기능 권한 — 메뉴 내부 CRUD · 출력 · 승인 */
export const TITAN_FEATURE_PERMISSIONS = [
  { key: "view", label: "조회" },
  { key: "register", label: "등록" },
  { key: "edit", label: "수정" },
  { key: "delete", label: "삭제" },
  { key: "pdf", label: "PDF" },
  { key: "print", label: "출력" },
  { key: "approve", label: "승인" },
  { key: "reissue", label: "재발행" },
  { key: "qrCreate", label: "QR 생성" },
];

/** Route prefix → menu permission key */
export const TITAN_ROUTE_PERMISSION_GUARDS = [
  { pathPrefix: "/home", permissionKey: "home" },
  { pathPrefix: "/settings", permissionKey: "masterData" },
  { pathPrefix: "/inout/incoming", permissionKey: "inbound" },
  { pathPrefix: "/production", permissionKey: "production" },
  { pathPrefix: "/quality/inspection", permissionKey: "inspection" },
  { pathPrefix: "/quality/certificate", permissionKey: "certificate" },
  { pathPrefix: "/quality", permissionKey: "inspection" },
  { pathPrefix: "/documents", permissionKey: "documents" },
  { pathPrefix: "/inout/shipment", permissionKey: "outbound" },
  { pathPrefix: "/statistics", permissionKey: "statistics" },
  { pathPrefix: "/accounting-clerk", permissionKey: "accountingClerk" },
  { pathPrefix: "/accounting", permissionKey: "accounting" },
  { pathPrefix: "/qr-management", permissionKey: "qrManagement" },
  { pathPrefix: "/environment", permissionKey: "admin" },
  { pathPrefix: "/environment/storage", permissionKey: "admin" },
  { pathPrefix: "/history", permissionKey: "home" },
  { pathPrefix: "/inventory", permissionKey: "inventory" },
  { pathPrefix: "/work-journal", permissionKey: "home" },
];

export function createDefaultMenuPermissionMap(enabled = false) {
  /** @type {Record<string, boolean>} */
  const map = {};
  TITAN_MENU_PERMISSIONS.forEach((item) => {
    map[item.key] = enabled;
  });
  return map;
}

export function createDefaultFeaturePermissionMap(enabled = false) {
  /** @type {Record<string, boolean>} */
  const map = {};
  TITAN_FEATURE_PERMISSIONS.forEach((item) => {
    map[item.key] = enabled;
  });
  return map;
}

export function createFullMenuPermissionMap() {
  return createDefaultMenuPermissionMap(true);
}

export function createFullFeaturePermissionMap() {
  return createDefaultFeaturePermissionMap(true);
}
