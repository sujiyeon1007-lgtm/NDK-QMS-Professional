/**

 * Project TITAN — Presentation Build Policy (NDK 1공장)

 * Lock: 2026-07-03

 *

 * Version 3 — NDK PQMS (Presentation Version) = 현재 구현 대상

 * "Presentation Version" / "NDK 1공장 Presentation Build" = Version 3 delivery/build label

 * Version 1·2 = Architecture Roadmap only (NOT user-selectable · NOT implemented)

 */



/** Version 3 QMS build target (Presentation Build delivery) */

export const PRESENTATION_BUILD_TARGET = {

  id: "ndk-factory-1",

  label: "Version 3 — NDK PQMS (Presentation Version)",

  architectureRoadmap: "v3",

  factory: "1공장",

  repository: "session",

  startupRoute: "/home",

};



/** 프로그램 실행 시 HOME 직행 — 운영모드/버전/공장 선택 ❌ */

export const PRESENTATION_DIRECT_HOME_ENTRY = true;



/** Architecture Roadmap only — NOT implemented in program (Version 1·2 + selection UI) */

export const PRESENTATION_ARCHITECTURE_ONLY = [

  {

    id: "version-1",

    label: "Version 1 — MES 완전 연동",

    status: "long-term",

  },

  {

    id: "version-2-hybrid",

    label: "Version 2 — MES + TITAN 협업 (Hybrid)",

    status: "future-review",

  },

  {

    id: "factory-mode",

    label: "Factory Mode (1공장 / 2공장 / 전체공장 선택)",

    status: "architecture-only",

  },

  {

    id: "operation-mode-welcome",

    label: "운영 모드 선택 Welcome Screen",

    status: "architecture-only",

  },

  {

    id: "version-selection",

    label: "Architecture Roadmap 버전 선택 화면",

    status: "architecture-only",

  },

  {

    id: "factory-selection",

    label: "공장 선택 화면",

    status: "architecture-only",

  },

];



/** Version 3 QMS 개발 목표 */

export const PRESENTATION_CURRENT_GOAL =

  "NDK 1공장 생산·품질 업무를 하나의 시스템에서 수행하는 PQMS(Presentation Version) 완성 — Workflow·사용성 최우선";



export const PRESENTATION_EXTENSION_POLICY =

  "확장 기능은 사장님 승인 및 실제 운영 검토 후 단계적 구현";



/** Version 3 QMS 메뉴 (현재 구현) */

export const PRESENTATION_ACTIVE_MENUS = [

  "HOME",

  "입고현황",

  "작업일보",

  "품질관리",

  "기준정보관리",

  "문서관리",

  "출고현황",

  "이력조회",

  "환경설정",

];



export function isPresentationDirectHomeEntry() {

  return PRESENTATION_DIRECT_HOME_ENTRY;

}



export function isArchitectureOnlyFeature(featureId) {

  return PRESENTATION_ARCHITECTURE_ONLY.some((item) => item.id === featureId);

}

