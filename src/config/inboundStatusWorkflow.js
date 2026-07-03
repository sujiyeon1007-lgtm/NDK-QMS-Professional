/**
 * Project TITAN (PQMS) — 입고현황 Workflow
 * STEP 1 · 최종 승인
 *
 * UI 설계 ❌ — Workflow만 확정
 * 다음 단계: 검색 · 필터 · Status · 버튼 · 리스트 · 상세보기 설계
 *
 * @see src/config/masterFirstArchitecture.js
 * @see src/config/qmsMenuWorkflow.js
 */

export const INBOUND_WORKFLOW_STEP = 1;
export const INBOUND_WORKFLOW_REVISION = "1-final";
export const INBOUND_WORKFLOW_APPROVAL_DATE = "2026-07-03";

/** 입고현황 — PQMS 첫 번째 업무 화면 */
export const INBOUND_STATUS_ROLE = {
  order: 1,
  label: "입고현황",
  summary: "Project TITAN(PQMS)의 첫 번째 업무 화면",
  mesOwns: "실제 입고 등록 (MES 원칙)",
  titanOwns: "Presentation Version 수동 등록 · 입고현황 · Traceability 시작점",
  mesPrinciple: "실제 입고 등록은 MES에서 수행하는 것을 원칙",
  presentationVersion: "Presentation Version에서는 수동 등록 지원",
  evolution: {
    version2: "MES Import",
    version1: "Oracle/API 자동 연동",
  },
};

/** 관리번호 — Traceability 기준 (전 메뉴 공통) */
export const MANAGEMENT_ID_POLICY = {
  generatedAt: "입고현황 등록 시 자동 생성",
  traceabilityHub: true,
  usedInMenus: ["입고현황", "작업일보", "품질관리", "출고현황", "이력조회"],
};

/** 발주번호 — 선택 입력 */
export const PURCHASE_ORDER_NO_POLICY = {
  required: false,
  note: "업체마다 발주번호가 있는 경우에만 입력 · 없으면 공란 저장",
};

/** 입고현황 등록 항목 (STEP 1 확정) */
export const INBOUND_REGISTRATION_FIELDS = [
  { key: "managementId", label: "관리번호", auto: true, required: true },
  { key: "incomingDate", label: "입고일", auto: false, required: true },
  { key: "company", label: "업체명", auto: false, required: true },
  { key: "purchaseOrderNo", label: "발주번호", auto: false, required: false },
  { key: "partNo", label: "품번", auto: false, required: true, masterLookup: "product" },
  { key: "partName", label: "품명", auto: true, required: true, source: "productMaster" },
  { key: "material", label: "재질", auto: true, required: true, source: "productMaster" },
  { key: "spec", label: "규격", auto: true, required: true, source: "productMaster" },
  { key: "customerCompany", label: "고객사", auto: true, required: false, source: "productMaster" },
  { key: "qty", label: "수량", auto: false, required: true },
  { key: "customerLotNo", label: "업체 LOT", auto: false, required: false },
  { key: "note", label: "비고", auto: false, required: false },
];

/** 신규 등록 Workflow (STEP 1 · 최종) */
export const INBOUND_REGISTRATION_WORKFLOW = [
  { step: 1, id: "new", label: "신규 등록" },
  { step: 2, id: "managementId", label: "관리번호 자동 생성", auto: true },
  { step: 3, id: "incomingDate", label: "입고일", userInput: true },
  { step: 4, id: "company", label: "업체명", userInput: true },
  { step: 5, id: "purchaseOrderNo", label: "발주번호 (선택)", optional: true },
  { step: 6, id: "partNo", label: "품번 선택", userInput: true, masterLookup: true },
  { step: 7, id: "productMasterLookup", label: "제품 Master 조회", auto: true },
  { step: 8, id: "partName", label: "품명 자동 입력", auto: true },
  { step: 9, id: "material", label: "재질 자동 입력", auto: true },
  { step: 10, id: "spec", label: "규격 자동 입력", auto: true },
  { step: 11, id: "customerCompany", label: "고객사 자동 입력 (등록된 경우)", auto: true, optional: true },
  { step: 12, id: "qty", label: "수량 입력", userInput: true },
  { step: 13, id: "customerLotNo", label: "업체 LOT 입력", userInput: true },
  { step: 14, id: "note", label: "비고", userInput: true, optional: true },
  { step: 15, id: "save", label: "저장" },
  { step: 16, id: "registered", label: "입고현황 등록" },
  { step: 17, id: "toWorkDaily", label: "작업일보 이동", nextMenu: "/production/daily-report" },
];

/** 품번 선택 → Master 자동 연결 (현재) */
export const INBOUND_PART_NO_AUTOFILL = ["품명", "재질", "규격", "고객사(등록된 경우)"];

/** STEP 1 이후 UI 설계 대상 (미확정) */
export const INBOUND_UI_DESIGN_PENDING = [
  "검색",
  "필터",
  "상태(Status)",
  "버튼 구성",
  "리스트 구조",
  "상세보기",
];

/** Workflow First — 현재 단계 */
export const INBOUND_CURRENT_PHASE = {
  step: INBOUND_WORKFLOW_STEP,
  revision: INBOUND_WORKFLOW_REVISION,
  status: "workflow-approved",
  uiDesign: "pending",
  note: "Workflow 승인 완료 · UI는 Workflow 승인 이후 설계",
};

export function isInboundWorkflowApproved() {
  return INBOUND_CURRENT_PHASE.status === "workflow-approved";
}

export function getInboundWorkflowSummary() {
  return {
    step: INBOUND_WORKFLOW_STEP,
    revision: INBOUND_WORKFLOW_REVISION,
    approvalDate: INBOUND_WORKFLOW_APPROVAL_DATE,
    role: INBOUND_STATUS_ROLE,
    managementId: MANAGEMENT_ID_POLICY,
    purchaseOrderNo: PURCHASE_ORDER_NO_POLICY,
    fields: INBOUND_REGISTRATION_FIELDS,
    workflow: INBOUND_REGISTRATION_WORKFLOW,
    autofill: INBOUND_PART_NO_AUTOFILL,
    uiPending: INBOUND_UI_DESIGN_PENDING,
    phase: INBOUND_CURRENT_PHASE,
  };
}
