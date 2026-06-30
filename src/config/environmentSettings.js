/**
 * Project TITAN V1.0 — 환경설정 메뉴 (프로그램·사용자 설정)
 * V1.1~ 기능 순차 추가 · V1.0은 placeholder UI
 */

import {
  UserCog,
  Monitor,
  FolderOpen,
  Archive,
  Shield,
  Info,
} from "lucide-react";

/** @typedef {{ key: string, label: string, desc: string, icon: import("react").ComponentType, planned?: boolean }} EnvironmentSection */

/** @type {EnvironmentSection[]} */
export const ENVIRONMENT_SECTIONS = [
  {
    key: "user",
    label: "사용자 설정",
    desc: "로그인 사용자 프로필 · 기본 작업 환경",
    icon: UserCog,
  },
  {
    key: "program",
    label: "프로그램 정보",
    desc: "Project TITAN 버전 · 빌드 정보",
    icon: Monitor,
  },
  {
    key: "path",
    label: "저장 경로",
    desc: "데이터 · 출력 · 백업 파일 저장 위치",
    icon: FolderOpen,
  },
  {
    key: "backup",
    label: "백업 / 복원",
    desc: "V1.1에서 제공 예정",
    icon: Archive,
    planned: true,
  },
  {
    key: "permission",
    label: "권한 관리",
    desc: "V1.1에서 제공 예정",
    icon: Shield,
    planned: true,
  },
  {
    key: "system",
    label: "시스템 정보",
    desc: "V1.1에서 제공 예정",
    icon: Info,
    planned: true,
  },
];

export function getEnvironmentSectionMeta(key) {
  return ENVIRONMENT_SECTIONS.find((item) => item.key === key) ?? ENVIRONMENT_SECTIONS[0];
}
