/**
 * Project TITAN Architecture — Edition REV.4 · Trace ID · Repository
 * 공식: src/config/titanEditionArchitecture.js
 */

export const ARCHITECTURE_VERSION = "V1.0-REV.6-PLATFORM";

/** @deprecated use OFFICIAL_POLICY_VERSION from titanV1OfficialPolicy.js */
export const OFFICIAL_POLICY_REF = "titanV1OfficialPolicy.js";

/** MES 실물 분석 (BonCfgII · FR3 · Export) */
export const MES_ANALYSIS_FINDINGS = {
  stack: ["Oracle Database", "FastReport (FR3)", "Oracle Dataset Reports", "Delphi · TWOWIN"],
  mesGeneratesManagementNo: true,
  managementNoExample: "DL260702-016",
  mesSourceOfTruth: [
    "관리번호",
    "거래처 Master",
    "제품 Master",
    "품번",
    "재질",
    "LOT",
    "입고",
    "출고",
    "재고",
    "생산",
  ],
};

/** TITAN 핵심 — MES 관리번호 = Primary Reference */
export const TITAN_CORE = {
  platform: "MES 연동 열처리 전문 QMS (Quality Management Platform)",
  notReplacement: "ERP/MES 대체 ❌",
  mesRelation: "MES 생산·물류·Master → TITAN 품질(QMS)",
  primaryKey: "mesManagementNo",
  managementNoPolicy: "TITAN은 관리번호를 생성하지 않음 · MES 관리번호 조회·사용",
};

export const OFFICIAL_GOAL =
  "MES가 생산·물류 SoT · TITAN이 품질 SoT · Repository로 자연스럽게 연동";

/** 품질 데이터 스키마 Primary Key (V1.1 Oracle/SQLite 공통) */
export const QUALITY_DATA_KEY = "mesManagementNo";

/** Demo: SessionStorage = 가상 MES Oracle */
export const DEMO_DATA_ROLE = {
  storage: "sessionStorage",
  treatedAs: "virtual-mes-oracle",
  workflow: "maintain",
  stack: "React UI → Repository → SessionStorage",
  v1_1Stack: "React UI → Repository → Oracle",
  idFieldAlias: "record.id === mesManagementNo (Demo)",
};

export const SOURCE_OF_TRUTH = {
  mes: [
    "managementNo",
    "customerMaster",
    "productMaster",
    "partNo",
    "material",
    "lot",
    "inbound",
    "outbound",
    "inventory",
    "production",
  ],
  titan: [
    "qualityIntake",
    "inspection",
    "appearanceInspection",
    "hardness",
    "effectiveDepth",
    "microstructure",
    "microscopePhoto",
    "inspectionCriteria",
    "certificate",
    "pdf",
    "qrPortal",
    "traceability",
    "qualityHistory",
    "defectHistory",
    "statistics",
    "documents",
  ],
};

/** MES — 생성·수정 · TITAN — 조회만 */
export const MES_RESPONSIBILITIES = [
  "거래처 Master",
  "제품 Master",
  "품번",
  "재질",
  "입고",
  "출고",
  "재고",
  "생산",
  "관리번호 생성",
  "LOT",
];

/** TITAN — 품질 플랫폼 */
export const TITAN_RESPONSIBILITIES = [
  "품질접수",
  "검사등록",
  "외관검사",
  "경도",
  "유효경화깊이",
  "조직사진",
  "현미경사진",
  "검사기준",
  "성적서",
  "PDF",
  "QR Portal",
  "Traceability",
  "품질이력",
  "불량이력",
  "통계",
  "문서관리",
];

export const DATA_DOMAIN_SEPARATION = {
  productionData: { owner: "mes", titanAccess: "read-only" },
  qualityData: { owner: "titan", key: QUALITY_DATA_KEY },
  qualityDocuments: { owner: "titan", mode: "revision-approval-pdf-history" },
};

/** 관리번호 정책 변경 (MES 실물 분석) */
export const MANAGEMENT_NUMBER_POLICY = {
  generator: "mes",
  titanCreates: false,
  titanUses: "mesManagementNo as-is",
  example: "DL260702-016",
  workflow: "MES 입고등록 → MES 관리번호 자동생성 → Oracle → TITAN 조회",
};

export const INBOUND_POLICY = {
  finalMode: "inbound-inquiry-read-only",
  flow: ["입고조회", "MES 데이터 조회", "품질접수", "TITAN Workflow 시작"],
  registration: "MES에서만 수행",
  demoNote: "V1.0 Demo UI는 가상 MES 등록 유지 · 구조는 조회+품질접수 전제",
};

export const QR_POLICY = {
  basis: "mesManagementNo",
  example: "DL260702-016",
  portalLinks: [
    "성적서",
    "조직사진",
    "경도",
    "검사이력",
    "출고이력",
  ],
};

export const REPOSITORY_POLICY = {
  config: "repositoryArchitecture.js",
  entry: "src/repositories/index.js → getRepositories()",
  rule: "UI는 Session/Oracle 직접 호출 금지",
  v1_0: "SessionStorage Repository",
  v1_1: "Oracle Repository (UI·Workflow 불변)",
};

export const UX_PHILOSOPHY = {
  goal: "MES 화면 복제 ❌ · Workflow 유지 + UX 현대화",
  titanFocus: [
    "품질(QMS) 중심",
    "검색·자동완성 Workflow",
    "최소 입력",
    "품질 데이터 시각화",
    "PDF·QR 문서",
    "Traceability",
  ],
  uiPrinciples: [
    "정보 구조 우선 (색상보다)",
    "Border · Spacing · Typography",
    "파스텔톤 · 공통 Design System",
    "Live Search · Autocomplete 기본",
    "중복 입력 금지 · 클릭 최소화",
  ],
};

export const ARCHITECTURE_DISPLAY = {
  program: "Project TITAN",
  version: "V1.0",
  architecture: "TITAN Core Platform · REV.6 Official",
  platform: "Develop Once, Deploy Anywhere",
  dataSource: "Edition → Repository → Data Source",
  future: "Enterprise Edition · SQLite · API · CSV",
  revision: ARCHITECTURE_VERSION,
};

export function getTitanArchitectureDisplayInfo() {
  return { ...ARCHITECTURE_DISPLAY };
}

export const SCREEN_INTEGRATION_MODEL = {
  inbound: {
    menuLabel: "입출고관리",
    demoMode: "virtual-mes-register-ui",
    finalMode: "mes-inbound-read-quality-intake",
    demoNote: INBOUND_POLICY.demoNote,
  },
  outbound: {
    menuLabel: "입출고관리",
    demoMode: "workflow-as-today",
    finalMode: "mes-outbound-read-link-quality",
  },
  masterData: {
    menuLabel: "기준정보관리",
    demoMode: "direct-register-temporary",
    finalMode: "mes-master-read-sync",
  },
};

export const DEFERRED_INTEGRATION = ["oracle-live", "api", "csv-live", "sqlite-swap"];

/** Repository 스켈레ton 구현 OK · 전면 UI 마이그레이션은 Sprint별 점진 */
export const CURRENT_SPRINT_FOCUS = "Sprint 3 — Print Engine · DOC-01 · 거래명세서 · 부분출고";

export const PARALLEL_POC = "MES 연동 PoC (Oracle · Master · 입고 · CSV · API)";

export const MES_INTEGRATION_POC = {
  config: "mesIntegrationPoc.js",
  session: "mesIntegrationPocSession.js",
};

export const V1_1_PLAN = [
  "Repository → Oracle 교체",
  "MES 실시간 조회",
  "SessionStorage 제거",
  "Oracle 기반 QMS 완성",
];

export const MENU_RENAME_POLICY = {
  deferUntil: "post-sprint-ui-refactor",
  current: "keep-existing-labels",
};

/** Workflow REV.3 FINAL */
export const ARCHITECTURE_FLOW = [
  "MES — 입고등록 → 관리번호 자동생성 → Oracle",
  "TITAN — 입고조회 → 품질접수",
  "검사등록 → 경도 → 유효경화깊이 → 조직사진 → 성적서",
  "QR → 품질이력 · Traceability",
  "문서관리 (품번·Revision·PDF)",
];

export const TRACE_ID_HUB_FLOW = [
  "mesManagementNo (MES)",
  "품질접수",
  "LOT",
  "생산일보",
  "검사",
  "조직사진",
  "성적서",
  "출고",
  "QR",
  "품질이력",
];

export const DEVELOPMENT_PRINCIPLES = [
  "MES 기능을 TITAN에서 재개발하지 않음",
  "동일 데이터 두 번 입력 금지",
  "Master는 MES 기준 · TITAN 조회",
  "TITAN은 QMS만 구현",
  "관리번호는 MES 기준",
  "품질 데이터는 mesManagementNo로 연결",
  "Repository Pattern 기본",
  "Demo·Oracle 동일 Workflow",
];
