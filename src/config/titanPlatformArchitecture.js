/**
 * Project TITAN — Platform Architecture (공식 REV.6)
 * One Core · Multiple Editions · Multiple Repositories · One Quality Platform
 *
 * Rule: .cursor/rules/project-titan-platform-architecture-rev6.mdc
 */

export const PLATFORM_ARCHITECTURE_VERSION = "REV.6";

/** @deprecated */
export const EDITION_ARCHITECTURE_VERSION = PLATFORM_ARCHITECTURE_VERSION;

export const TITAN_PLATFORM_VISION = {
  headline: "열처리 산업 Quality Management Platform",
  scope: "특정 회사 전용 ❌ · Platform ✅",
  tagline: "Develop Once, Deploy Anywhere",
  motto: "One Core · Multiple Editions · Multiple Repositories · One Quality Platform",
};

/** TITAN Core Platform — Edition 비종속 */
export const TITAN_CORE_PLATFORM = [
  "Dashboard",
  "Workflow",
  "Print Engine",
  "Certificate Engine",
  "Document Management",
  "QR Traceability",
  "Quality History",
  "Statistics",
  "Settings",
];

export const PLATFORM_LAYERS = [
  {
    id: "core",
    label: "TITAN Core Platform",
    modules: [
      "UI",
      "Workflow",
      "Print Engine",
      "Certificate Engine",
      "Document Management",
      "QR",
      "Quality History",
      "Statistics",
      "Dashboard",
      "Settings",
    ],
  },
  {
    id: "edition",
    label: "Edition Layer",
    items: ["Quality (QMS Only)", "Standalone (QMS + Basic)", "MES Connected (QMS + MES)", "Enterprise (Future)"],
  },
  {
    id: "repository",
    label: "Repository Layer",
    items: ["Session", "SQLite", "Oracle", "API", "CSV", "Future ERP/MES"],
  },
  {
    id: "datasource",
    label: "Data Source Layer",
    items: ["Session", "SQLite", "Oracle", "REST API", "CSV", "Future ERP/MES"],
  },
];

export const CORE_PLATFORM_PRINCIPLES = [
  "Core는 Edition과 독립 · 절대 Edition에 종속되지 않음",
  "새 기능은 항상 Core 기준으로 개발",
  "Edition = 메뉴 표시 · Repository · 데이터 입력 방식만 차이",
  "UI · Workflow · Print · Certificate · Document 동일",
  "Repository만 Data Source 분리",
];

export const PLATFORM_DEVELOPMENT_PRINCIPLES = [
  "Edition별 따로 개발 ❌",
  "Core 하나만 유지",
  "Edition만 선택 · Repository만 교체",
  "코드 하나 → NDK · 타 열처리 업체 적용",
];

export const PLATFORM_EXTENSION_PRINCIPLES = [
  "Enterprise Edition (Future): ERP · MES · PLC · IoT · AI · SPC · 설비 · 실시간 Dashboard",
  "Core 변경 없이 Edition·Repository 추가",
];

export const MES_CONNECTED_PLATFORM_PRINCIPLES = [
  "MES = 회사 운영 · TITAN = 품질(QMS)",
  "동일 데이터 두 번 입력 ❌",
  "운영 DB 수정 ❌ · Read Only",
  "MES = Source of Truth",
];

export const PLATFORM_DISPLAY = {
  architecture: "Project TITAN Platform Architecture REV.6 (Official)",
  vision: TITAN_PLATFORM_VISION.motto,
};

export function getTitanPlatformSummary() {
  return {
    version: PLATFORM_ARCHITECTURE_VERSION,
    vision: TITAN_PLATFORM_VISION,
    layers: PLATFORM_LAYERS,
    core: TITAN_CORE_PLATFORM,
    principles: PLATFORM_DEVELOPMENT_PRINCIPLES,
  };
}
