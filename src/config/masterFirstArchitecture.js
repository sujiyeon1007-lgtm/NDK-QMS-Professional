/**
 * Project TITAN (PQMS) — Master First Architecture
 * STEP 1 공식 원칙 · One Source of Truth
 *
 * @see src/config/inboundStatusWorkflow.js — 입고현황 Workflow
 */

/** Project Vision — Master 중심 데이터 흐름 */
export const ONE_SOURCE_OF_TRUTH_VISION =
  "한 번 등록하면 모든 화면에서 활용한다.";

export const MASTER_FIRST_PRINCIPLES = [
  "모든 업무는 Master 데이터를 기준으로 연결",
  "Master 데이터만 수정하면 모든 업무 화면에 자동 반영 (목표)",
  "동일한 데이터를 두 번 입력하지 않음",
  "사용자는 가능한 한 직접 입력하지 않고 Master 정보를 선택하여 업무 진행",
  "Windows 폴더 직접 관리 ❌ — Project TITAN 내부에서 조회·등록·수정·출력·문서·사진·PDF",
];

/** PQMS 데이터 흐름 (Master → 업무) */
export const PQMS_DATA_FLOW = [
  "입고현황",
  "작업일보",
  "품질관리",
  "문서관리",
  "출고현황",
  "이력조회",
];

/** Core Master 4종 */
export const CORE_MASTER_DEFINITIONS = {
  company: {
    id: "company",
    label: "거래처 Master",
    order: 1,
    fields: [
      "업체명",
      "거래처코드",
      "거래처 약칭 (자동 생성)",
      "담당자",
      "연락처",
      "이메일",
      "주소",
      "사업자등록번호",
      "기본 요구사항",
      "검사 기준",
      "성적서 양식",
      "거래명세서 양식",
      "사용 여부",
      "비고",
    ],
  },
  product: {
    id: "product",
    label: "제품 Master",
    order: 2,
    note: "Project TITAN(PQMS)의 Hub — 가장 중요",
    fields: ["품번", "품명", "재질", "규격", "고객사", "제품분류", "사용여부", "비고"],
  },
  equipment: {
    id: "equipment",
    label: "설비 Master",
    order: 3,
    fields: ["설비번호", "설비명", "공정", "사용여부"],
  },
  user: {
    id: "user",
    label: "사용자 Master",
    order: 4,
    fields: ["작업자", "검사자", "승인자", "권한"],
  },
};

/** 제품 Master Hub — 향후 연결 정보 (로드맵) */
export const PRODUCT_MASTER_HUB_LINKS = [
  "품번",
  "도면",
  "검사기준서",
  "작업표준서",
  "관리계획서",
  "기본 검사 항목",
  "기본 성적서 양식",
  "조직사진 기준",
  "경도 기준",
  "유효경화깊이 기준",
  "문서 Revision",
  "품질 이력",
];

/** 입고현황 — 품번 선택 시 제품 Master 자동 입력 (STEP 1 · 현재) */
export const INBOUND_PRODUCT_MASTER_AUTOFILL = [
  { key: "partName", label: "품명", source: "product.name" },
  { key: "material", label: "재질", source: "product.material" },
  { key: "spec", label: "규격", source: "product.spec" },
  { key: "customerCompany", label: "고객사", source: "product.customerCompany", optional: true },
];

/** 입고현황 — 향후 자동 연결 (STEP 1 이후) */
export const INBOUND_PRODUCT_MASTER_FUTURE_LINKS = [
  "도면",
  "검사기준서",
  "작업표준서",
  "관리계획서",
  "검사 항목",
  "성적서 양식",
];

export function getCoreMasterList() {
  return Object.values(CORE_MASTER_DEFINITIONS).sort((a, b) => a.order - b.order);
}
