/**
 * Project TITAN — PQMS Menu & Workflow
 * STEP 0 — 메뉴 1차 최종 (2026-07-03)
 * STEP 1 — 입고현황 Workflow 최종 (2026-07-03)
 *
 * @see src/config/inboundStatusWorkflow.js — STEP 1 입고현황
 * @see src/config/masterFirstArchitecture.js — Master First Architecture
 */

import {
  INBOUND_CURRENT_PHASE,
  INBOUND_STATUS_ROLE as INBOUND_WORKFLOW_ROLE,
  INBOUND_WORKFLOW_REVISION,
  INBOUND_WORKFLOW_STEP,
} from "./inboundStatusWorkflow";
import { getApprovedSidebarMenuDefs } from "./menuConfig";

export const QMS_MENU_WORKFLOW_STEP = 0;
export const QMS_MENU_REVISION = "1-final";

/** STEP 1 — 입고현황 Workflow 승인 */
export const INBOUND_WORKFLOW_APPROVAL = {
  step: INBOUND_WORKFLOW_STEP,
  revision: INBOUND_WORKFLOW_REVISION,
  status: INBOUND_CURRENT_PHASE.status,
  uiDesign: INBOUND_CURRENT_PHASE.uiDesign,
  date: "2026-07-03",
};

/** Project Vision — 최우선 목표 (PQMS) */
export const QMS_ULTIMATE_GOAL =
  "생산과 품질 업무를 하나의 시스템에서 수행하는 NDK PQMS 구축";

/** @deprecated alias — PQMS naming */
export const PQMS_ULTIMATE_GOAL = QMS_ULTIMATE_GOAL;

/** POP + QMS 통합 정의 */
export const PQMS_SYSTEM_DEFINITION =
  "Project TITAN = POP + QMS — 생산 현장(작업일보·LOT)과 품질관리를 하나의 시스템으로 통합";

/** MES vs TITAN — see also titanV1DevelopmentDirection.js MES_VS_TITAN_ROLES */
export const PQMS_MES_ROLE_SUMMARY =
  "MES = 회사 운영(입출고 등록·Master·재고) · TITAN = 생산·품질 실무(PQMS) — MES 대체 ❌";

export const QMS_IN_SYSTEM_WORK_PRINCIPLES = [
  "Windows 폴더 직접 접근 ❌ — 사진·PDF·성적서·도면·거래명세서 등",
  "TITAN 내부: 조회 · 등록 · 수정 · 출력 · 이력관리 · 문서조회 · 사진조회 · PDF조회",
  "Windows Storage = TITAN 내부 저장소 (사용자는 폴더 구조 인식 불필요)",
  "모든 품질 업무는 TITAN 내부에서 시작 → 종료",
];

/** Workflow First · Menu Freeze V1.0 이후 */
export const QMS_WORKFLOW_FIRST_PIPELINE = [
  "Workflow",
  "UI",
  "기능",
  "구현",
  "테스트",
  "검토",
  "승인",
];

/** Menu Freeze V1.1 — 1차 최종 승인 사이드바 (11 menus · menuConfig 기준) */
export const QMS_APPROVED_SIDEBAR_MENUS = getApprovedSidebarMenuDefs();

export const QMS_MENU_APPROVAL = {
  menuStructure: { status: "menu-freeze-v1.3", revision: "V1.3", date: "2026-07-03", locked: true },
  home: {
    status: "role-approved",
    capabilities: ["Dashboard", "공지사항", "오늘 할 일", "진행현황", "최근 작업"],
  },
  inboundStatus: {
    status: "workflow-final",
    workflowStep: 1,
    workflowRevision: "1-final",
    mesOwns: INBOUND_WORKFLOW_ROLE.mesOwns,
    titanOwns: INBOUND_WORKFLOW_ROLE.titanOwns,
    config: "inboundStatusWorkflow.js",
  },
  inventoryStatus: {
    status: "menu-freeze-v1.1",
    note: "입고+작업일보+출고 자동 계산 · 직접 입력 ❌",
    route: "/inventory",
  },
  workDaily: {
    status: "role-approved",
    note: "제품 중심 — LOT · 생산 이력",
    mergedFrom: ["생산관리", "생산일보"],
  },
  workJournal: {
    status: "menu-freeze-v1.2",
    note: "사람 중심 업무 기록 · Workflow 미포함",
    route: "/work-journal",
  },
  quality: {
    status: "role-approved",
    note: "TITAN 핵심 · 검사·성적서·불량·NCR 통합",
    mergedFrom: ["검사관리", "성적서관리", "불량이력관리"],
  },
  documents: {
    status: "workflow-final",
    note: "제품 중심 Workflow — 거래처→제품→문서현황 · config/documentManagementWorkflow.js",
    route: "/documents",
  },
  masterData: {
    status: "menu-freeze-v1",
    note: "Master 6탭 — ①업체(업체·제품) ②기준(재질·공정·설비·작업자)",
    route: "/settings/companies",
  },
  outboundStatus: {
    status: "role-approved",
    mesOwns: "실제 출고 등록",
    titanOwns: "출고 준비 · 품질 관련 출고 업무",
  },
  history: { status: "role-approved", note: "전체 Traceability 조회" },
  statisticsInquiry: {
    status: "menu-freeze-v1.1",
    note: "Dashboard · 업무 데이터 자동 집계 · 조회 전용",
    route: "/statistics/inquiry",
  },
  environment: {
    status: "menu-freeze-v1",
    note: "①시스템 ②사용자 ③정보관리 ④관리자",
    route: "/environment/program",
  },
};

/** Menu Freeze V1.0 — 메뉴 흐름 */
export const QMS_CORE_MENU_FLOW = [
  "HOME",
  "입고현황",
  "작업일보",
  "품질관리",
  "문서관리",
  "기준정보관리",
  "출고현황",
  "이력조회",
  "환경설정",
];

/** Traceability — LOT 기준 흐름 */
export const QMS_LOT_TRACEABILITY_FLOW = [
  "작업일보 (LOT 생성)",
  "품질관리",
  "출고현황",
  "이력조회",
];

/** HOME */
export const HOME_MENU_ROLE = {
  capabilities: ["Dashboard", "공지사항", "오늘 할 일", "진행현황", "최근 작업"],
};

/** 입고현황 — STEP 1 Workflow 최종 (UI 설계 대기) */
export const INBOUND_STATUS_CAPABILITIES = [
  "입고현황 등록 (Presentation · 수동)",
  "관리번호 자동 생성",
  "품번 → 제품 Master 자동입력",
  "발주번호 (선택)",
  "업체 LOT",
  "작업일보 이동",
];

/** @see inboundStatusWorkflow.js */
export const INBOUND_STATUS_ROLE = INBOUND_WORKFLOW_ROLE;

/** 작업일보 */
export const WORK_DAILY_CAPABILITIES = [
  "LOT 생성",
  "작업일",
  "작업자",
  "설비",
  "처리조건",
  "작업수량",
  "비고",
  "작업 완료",
];

export const WORK_DAILY_ROLE = {
  note: "생산관리 ❌ · 품질 Workflow · LOT = Traceability 기준",
  lotUsedIn: ["품질관리", "출고현황", "이력조회"],
};

/** 품질관리 — 하위 기능 */
export const QUALITY_MANAGEMENT_FEATURES = [
  "검사등록",
  "검사현황",
  "외관검사",
  "경도검사",
  "유효경화깊이",
  "조직사진",
  "성적서 발행",
  "PDF Preview",
  "PDF 저장",
  "재출력",
  "발행이력",
  "불량이력",
  "NCR",
];

/** 품질관리 — 합격 Workflow */
export const QUALITY_PASS_WORKFLOW = ["검사", "합격", "성적서", "출고"];

/** 품질관리 — 불합격 Workflow */
export const QUALITY_FAIL_WORKFLOW = [
  "검사",
  "불합격",
  "불량이력",
  "NCR",
  "재처리",
  "재검사",
  "성적서",
];

/** Master Data — 거래처 · 제품 · 설비 · 사용자 · 기타 기준 Master */
export const MASTER_DATA_MANAGEMENT_CATEGORIES = [
  "거래처 Master",
  "제품 Master",
  "설비 Master",
  "사용자 Master",
  "기타 기준 Master",
];

/** Master Data capabilities */
export const MASTER_DATA_CAPABILITIES = [
  "업체관리",
  "제품 Master",
  "재질관리",
  "공정관리",
  "설비관리",
  "작업자 Master",
  "직원 정보관리",
  "검사기준관리",
  "사용자정의코드",
];

/** 문서관리 */
export const DOCUMENT_MANAGEMENT_CATEGORIES = [
  "도면",
  "검사기준서",
  "작업표준서",
  "관리계획서",
  "FMEA",
  "고객 요구사항",
  "특채 승인서",
  "NCR 문서",
  "품질공지",
  "기타 품질문서",
];

export const DOCUMENT_MANAGEMENT_CAPABILITIES = [
  "문서 Revision",
  "승인",
  "이력관리",
  "PDF 조회",
];

/** 출고현황 */
export const OUTBOUND_STATUS_CAPABILITIES = [
  "출고현황",
  "부분출고",
  "잔량관리",
  "거래명세서",
  "성적서 확인",
  "출고이력",
];

export const OUTBOUND_STATUS_ROLE = {
  mesOwns: "실제 출고 등록",
  titanOwns: "출고 준비 및 품질 관련 출고 업무",
};

/** 이력조회 */
export const HISTORY_TRACEABILITY_SEARCH = [
  "관리번호",
  "LOT",
  "발주번호",
  "품번",
  "업체 LOT",
];

export const HISTORY_TRACEABILITY_CHAIN = [
  "입고",
  "작업일보",
  "검사",
  "성적서",
  "출고",
];

/** 환경설정 */
export const ENVIRONMENT_MENU_ROLE = {
  capabilities: ["시스템 설정", "사용자", "권한", "기본정보", "About"],
};

/** Architecture Roadmap only — Version 1·2 (Version 3 = 현재 구현) */
export const QMS_ROADMAP_ARCHITECTURE_ONLY = [
  "Version 1 — MES 완전 연동 (장기 계획)",
  "Version 2 — MES + TITAN 협업 (향후 검토)",
  "Version 3 — NDK PQMS (Presentation Version) · 현재 구현",
  "Factory Mode (1공장 / 2공장 / 전체공장)",
  "Operation Mode Welcome · Architecture Roadmap 선택 UI",
];

/** @deprecated */
export const INBOUND_LEGACY_LABEL = "입고관리";
export const OUTBOUND_LEGACY_LABEL = "출고관리";
export const PRODUCTION_LEGACY_MENU = "생산관리";
export const INSPECTION_LEGACY_MENU = "검사관리";
export const CERTIFICATE_LEGACY_MENU = "성적서관리";

export const QMS_WORKFLOW_DEVELOPMENT_PRINCIPLES = [
  ...QMS_IN_SYSTEM_WORK_PRINCIPLES,
  "Master First Architecture — One Source of Truth",
  "Workflow First — UI보다 업무 흐름 먼저 확정",
  "Workflow 승인 → 기능 정의 → 승인 → UI 설계 → 승인 → 구현 → 테스트 → 다음 메뉴",
  "STEP 1 입고현황 Workflow 최종 승인 · UI 설계 대기",
  "MES ≠ TITAN · 입고·출고 등록 = MES (Presentation = 수동 등록)",
  "Version 3 NDK PQMS (Presentation Version · NDK 1공장) = 현재 유일 구현 대상",
];

/** Legacy aliases */
export const INSPECTION_MANAGEMENT_FEATURES = QUALITY_MANAGEMENT_FEATURES;

export const QMS_DEPRECATED_SIDEBAR_SECTIONS = [
  "certificateManagement",
  "inspectionManagement",
  "inout",
  "production",
  "qualityLegacy",
  "departmentWork",
  "statistics",
];

export function isQmsMenuApproved(menuId) {
  const entry = QMS_MENU_APPROVAL[menuId];
  if (!entry) return false;
  return ["approved", "role-approved", "composition-approved"].includes(entry.status);
}

export function getNextWorkflowMenuId() {
  return "inboundStatus";
}
