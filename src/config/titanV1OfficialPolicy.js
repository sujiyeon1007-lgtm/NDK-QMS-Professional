/**
 * Project TITAN — 공식 정책
 * Platform REV.6: src/config/titanPlatformArchitecture.js
 * Edition: src/config/titanEditionArchitecture.js
 *
 * Cursor: project-titan-platform-architecture-rev6.mdc (최우선)
 */

export const OFFICIAL_POLICY_VERSION = "V1.0-REV.6-PLATFORM";

/** 🎯 TITAN Platform 비전 */
export const TITAN_MISSION = {
  headline: "열처리 산업 Quality Management Platform",
  platform: "One Core · Multiple Editions · Multiple Repositories · One Quality Platform",
  tagline: "Develop Once, Deploy Anywhere",
  traceHub: "관리번호(Trace ID)를 중심으로 모든 품질 정보를 연결",
};

/** 🏢 MES — 회사 운영 시스템 (Source of Truth · TITAN 조회) */
export const MES_SCOPE = [
  "거래처 Master",
  "제품 Master",
  "품번",
  "재질",
  "수주",
  "입고",
  "출고",
  "재고",
  "생산",
];

/** MES 실물 분석 추가 (BonCfgII · Oracle · FR3) */
export const MES_SCOPE_EXTENDED = [
  ...MES_SCOPE,
  "관리번호 생성", // 예: DL260702-016 — 입고 시 MES 자동생성
  "LOT", // MES LOT · TITAN 품질 Workflow 연동
];

/** 🛡️ TITAN — 품질관리 시스템 */
export const TITAN_SCOPE = [
  "관리번호", // Trace ID 허브 — MES 번호 연결·품질 추적 (TITAN 중복 생성 ❌)
  "LOT",
  "검사등록",
  "경도",
  "유효경화깊이",
  "조직사진",
  "성적서",
  "Traceability",
  "품질 통계",
  "출력물",
  "문서관리",
];

/** 관리번호(Trace ID) 허브 — TITAN 품질 연결 */
export const TRACE_ID_HUB_FLOW = [
  "관리번호 (MES → TITAN Trace Hub)",
  "입고",
  "LOT",
  "생산일보",
  "검사",
  "조직사진",
  "성적서",
  "출고",
  "QR",
  "품질이력",
];

/** 관리번호 정책 (MES 실물 + V1.0 공식) */
export const MANAGEMENT_NUMBER_POLICY = {
  mesGenerates: true,
  example: "DL260702-016",
  titanCreatesDuplicate: false,
  titanRole: "MES 관리번호를 Trace ID 허브로 연결·조회·품질 데이터 Primary Key",
  canonicalField: "mesManagementNo",
  demoAlias: "record.id === mesManagementNo",
};

/** ⭐ 문서관리 — TITAN 핵심 모듈 (REV.4: 품질 공지 통합) */
export const DOCUMENT_MANAGEMENT_TREE = [
  "도면",
  "검사기준서",
  "관리계획서",
  "작업표준서",
  "FMEA",
  "고객 요구사항",
  "NCR",
  "특채 승인서",
  "품질 공지",
  "Check Sheet",
  "시험성적서",
  "기타 품질문서",
];

/** REV.4 — 품질 공지 = Document Management 하위 · 일반 게시판 ❌ */
export const QUALITY_NOTICE_POLICY = {
  integratedInDocumentManagement: true,
  standaloneMenu: false,
  documentType: "quality_notice",
  v1Features: ["등록", "조회"],
  v2Features: ["읽음(ACK)"],
  adminLocation: "Sidebar 문서관리 (/documents)",
};

export const DOCUMENT_MANAGEMENT_MODEL = [
  "품번",
  "Revision",
  "승인자",
  "개정일",
  "PDF",
  "이력관리",
];

/** 검사등록 자동 연결 (품번 → 최신 Revision) */
export const INSPECTION_DOCUMENT_AUTO_LINK = [
  "도면",
  "검사기준서",
  "관리계획서",
  "작업표준서",
];

export const INSPECTION_REGISTRATION_FLOW = [
  "검사등록",
  "관리번호 연결 (MES Trace ID)",
  "품번 선택",
  "최신 문서 자동 연결",
];

/** 생산 데이터 vs 품질 문서 */
export const DATA_DOMAIN_POLICY = {
  productionData: {
    owner: "MES",
    titanAccess: "조회 중심",
  },
  qualityDocuments: {
    owner: "TITAN",
    capabilities: ["버전관리", "개정이력", "승인", "검색", "연결"],
  },
};

/** 공식 정책 장점 */
export const POLICY_BENEFITS = [
  "MES는 회사 공통 시스템으로 유지",
  "TITAN은 품질팀 메인 시스템으로 성장",
  "문서 폴더 탐색 불필요",
  "검사 시 최신 문서 자동 연결",
  "관리번호 하나로 품질 이력 추적",
  "ISO 9001 / IATF 16949 대응 기반",
];

/** V1.1+ DMS 확장 (V1.0 범위 외 · Roadmap) */
export const V1_1_DMS_ROADMAP = [
  "문서 승인 워크플로우",
  "개정 이력 비교",
  "만료 예정 문서 알림",
  "QR로 현장 최신 작업표준서 열람",
  "성적서 발행 시 검사기준서 Revision 자동 기록",
];

/** V1.0 Demo · Repository · Sprint */
export const V1_0_IMPLEMENTATION = {
  demo: "SessionStorage = 가상 MES · Workflow 유지",
  repository: "UI → getRepositories() → SessionStorage",
  sprintFocus: "Sprint 3 — Print Engine · DOC-01 · 거래명세서 · 부분출고",
  pocParallel: "MES 연동 PoC",
  v1_1: "Repository → Oracle · UI·Workflow 불변",
};

/** 환경설정 About 표시 */
export const OFFICIAL_POLICY_DISPLAY = {
  policy: "Project TITAN Platform Policy",
  revision: OFFICIAL_POLICY_VERSION,
  platformArchitecture: "REV.6 — Quality · Standalone · MES Connected",
  editionLayer: "Standalone · MES Connected · Enterprise (Future)",
  architecture: "Core Platform · Edition · Repository · Data Source",
};

export function getTitanOfficialPolicySummary() {
  return {
    version: OFFICIAL_POLICY_VERSION,
    mission: TITAN_MISSION.headline,
    mesScope: MES_SCOPE,
    titanScope: TITAN_SCOPE,
    documentManagement: DOCUMENT_MANAGEMENT_TREE,
    managementNumber: MANAGEMENT_NUMBER_POLICY,
  };
}
