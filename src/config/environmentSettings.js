/**
 * Project TITAN V1.0 — 환경설정 메뉴 구성
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
} from "lucide-react";

/** @type {Array<{ id: string, label: string, path: string, icon: import("react").ComponentType, desc?: string }>} */
export const ENVIRONMENT_TABS = [
  { id: "company", label: "회사정보", path: "/environment/company", icon: Building2, desc: "회사 기본 정보 · 로고" },
  { id: "users", label: "사용자관리", path: "/environment/users", icon: Users, desc: "프로그램 사용자" },
  { id: "permissions", label: "권한관리", path: "/environment/permissions", icon: Shield, desc: "권한별 메뉴 접근" },
  { id: "notifications", label: "알림설정", path: "/environment/notifications", icon: Bell, desc: "업무 알림" },
  { id: "backup", label: "백업 / 복원", path: "/environment/backup", icon: Archive, desc: "원클릭 전체 백업" },
  { id: "logs", label: "로그관리", path: "/environment/logs", icon: ScrollText, desc: "로그인 · 변경 · 오류" },
  { id: "program", label: "프로그램 설정", path: "/environment/program", icon: Settings, desc: "저장 경로 · 자동 백업" },
  { id: "data", label: "데이터 관리", path: "/environment/data", icon: Database, desc: "샘플 · 정리 · 최적화" },
  { id: "status", label: "시스템 상태", path: "/environment/status", icon: Activity, desc: "라이선스 · 상태" },
  { id: "about", label: "정보 (About)", path: "/environment/about", icon: Info, desc: "프로그램 정보" },
];

export function getEnvironmentTabMeta(tabId) {
  return ENVIRONMENT_TABS.find((tab) => tab.id === tabId) ?? ENVIRONMENT_TABS[0];
}

export function resolveEnvironmentTab(tabParam) {
  const tab = ENVIRONMENT_TABS.find((item) => item.id === tabParam);
  return tab?.id ?? "company";
}
