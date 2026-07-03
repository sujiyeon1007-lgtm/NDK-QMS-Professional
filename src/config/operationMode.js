/**

 * Project TITAN — Operation Mode (Architecture Roadmap · UI disabled)

 *

 * Maps to Architecture Roadmap — NOT user-selectable program versions:

 *   Standalone → Version 3 (current PQMS implementation)

 *   Hybrid     → Version 2 (MES + TITAN collaboration · future review)

 *   Future     → Version 1 (MES full integration · long-term)

 *

 * Welcome screen disabled — Version 3: HOME 직행 (presentationBuildPolicy.js)

 *

 * @see src/config/presentationBuildPolicy.js

 */



import { PRESENTATION_EDITION_LOCK } from "./titanV1DevelopmentDirection";



/** @typedef {'standalone' | 'hybrid' | 'future'} OperationModeId */



export const OPERATION_MODE = {

  STANDALONE: "standalone",

  HYBRID: "hybrid",

  FUTURE: "future",

};



/** Architecture Roadmap version mapping (documentation only · UI disabled) */

export const OPERATION_MODE_ROADMAP_MAP = {

  [OPERATION_MODE.STANDALONE]: { roadmap: "v3", label: "Version 3 — NDK PQMS (Presentation Version)" },

  [OPERATION_MODE.HYBRID]: { roadmap: "v2", label: "Version 2 — MES + TITAN 협업 (향후 검토)" },

  [OPERATION_MODE.FUTURE]: { roadmap: "v1", label: "Version 1 — MES 완전 연동 (장기 계획)" },

};



/** Accent token keys — map to CSS custom properties in welcome screen */

export const OPERATION_MODE_ACCENT = {

  green: "success",

  yellow: "warning",

  blue: "primary",

};



/** Hybrid preview workflow — Version 2 roadmap: MES + TITAN collaboration */

export const HYBRID_MODE_WORKFLOW = [

  { step: 1, id: "mes", label: "MES", role: "mes", description: "입고 · Master · 생산 SoT" },

  { step: 2, id: "inbound", label: "입고", role: "mes", description: "MES 입고 등록 · 관리번호 생성" },

  { step: 3, id: "titan", label: "Project TITAN", role: "titan", description: "생산·품질 접수 · PQMS 허브" },

  { step: 4, id: "inspection", label: "검사", role: "titan", description: "외관 · 경도 · 조직 · 검사일지" },

  { step: 5, id: "certificate", label: "성적서", role: "titan", description: "검사성적서 · QR · 출력" },

  { step: 6, id: "outbound", label: "출고", role: "mes", description: "MES 출고 · 거래명세서" },

  { step: 7, id: "history", label: "품질이력", role: "titan", description: "Traceability · 품질 통계" },

];



/** Future mode vision — Version 1 roadmap: MES full integration */

export const FUTURE_MODE_VISION = [

  "Oracle MES 실시간 Repository 연동",

  "입고 · 출고 · 생산 · Master Read Only 조회",

  "Master auto-sync · 중복 입력 제거 · MES SoT + TITAN PQMS",

  "정부 사업 · Smart Factory 확장 (장기 계획)",

];



export const OPERATION_MODES = [

  {

    id: OPERATION_MODE.STANDALONE,

    label: "Standalone Mode",

    labelKo: "Standalone Mode",

    roadmapVersion: "v3",

    roadmapLabel: "Version 3 — NDK PQMS (Presentation Version)",

    badge: "Version 3 · 현재 구현",

    description:

      "Version 3 PQMS · SessionStorage · HOME · 입고현황 · 작업일보 · 품질관리 · 문서관리 · 출고현황 · 이력조회",

    status: "current",

    accent: "green",

    accentToken: OPERATION_MODE_ACCENT.green,

    emoji: "🟢",

    actionLabel: "시작",

    actionType: "enter-app",

    editionLock: PRESENTATION_EDITION_LOCK,

    repository: "session",

    features: [

      "HOME Dashboard",

      "입고현황 · 작업일보 (LOT)",

      "품질관리 · 검사 · 경도 · 조직사진",

      "성적서 · 문서관리 · 출고현황 · 이력조회",

      "Print · PDF · Demo Workflow",

    ],

  },

  {

    id: OPERATION_MODE.HYBRID,

    label: "Hybrid Mode",

    labelKo: "Hybrid Mode",

    roadmapVersion: "v2",

    roadmapLabel: "Version 2 — MES + TITAN 협업",

    badge: "Version 2 Roadmap · Preview only",

    description: "Version 2 Architecture — MES와 TITAN PQMS 협업 Workflow 미리보기 · Oracle 연동 없음",

    status: "preview",

    accent: "yellow",

    accentToken: OPERATION_MODE_ACCENT.yellow,

    emoji: "🟡",

    actionLabel: "미리보기",

    actionType: "preview",

    workflow: HYBRID_MODE_WORKFLOW,

  },

  {

    id: OPERATION_MODE.FUTURE,

    label: "Future Mode",

    labelKo: "Future Mode",

    roadmapVersion: "v1",

    roadmapLabel: "Version 1 — MES 완전 연동",

    badge: "Version 1 Roadmap · Coming Soon",

    description: "Version 1 Architecture — Oracle · Repository · Realtime MES · Master auto-sync — 장기 계획",

    status: "long-term",

    accent: "blue",

    accentToken: OPERATION_MODE_ACCENT.blue,

    emoji: "🔵",

    actionLabel: "Coming Soon",

    actionType: "preview",

    vision: FUTURE_MODE_VISION,

  },

];



export const OPERATION_MODE_WELCOME = {

  title: "Project TITAN",

  subtitle: "NDK Production & Quality Management System (PQMS)",

  versionLabel: "Version 3 — Presentation Build",

  sectionTitle: "Architecture Roadmap (미구현 · 참고용)",

  footer: "Version 3 PQMS · Presentation Build · Architecture Roadmap V1/V2 = 문서 only",

};



export function getOperationModeDefinition(modeId) {

  return OPERATION_MODES.find((mode) => mode.id === modeId) ?? null;

}



export function isStandaloneOperationMode(modeId) {

  return modeId === OPERATION_MODE.STANDALONE;

}



export function isPreviewOnlyOperationMode(modeId) {

  return modeId === OPERATION_MODE.HYBRID || modeId === OPERATION_MODE.FUTURE;

}

