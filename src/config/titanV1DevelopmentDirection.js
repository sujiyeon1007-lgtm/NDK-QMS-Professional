/**
 * Project TITAN V1.0 — Development Direction
 * Official lock date: 2026-07-02
 * V1.0 = 독립 실행형 NDK QMS (Standalone · SessionStorage)
 * V1.1 = MES 연동 · V2.0 = 문서/Traceability 고도화
 */

/** Official V1.0 development direction lock date */
export const V1_0_OFFICIAL_DATE = "2026-07-02";

/** Project Vision (official) */
export const PROJECT_VISION = {
  summary:
    "Project TITAN은 NDK의 품질관리 업무를 통합 관리하는 품질관리 시스템(QMS)을 구축하는 것을 목표로 한다.",
  v1_0: "V1.0에서는 실제 업무에 사용할 수 있는 독립적인 품질관리 시스템을 완성한다.",
  v1_1: "이후 V1.1에서 MES와 연동하여 기존 업무와 자연스럽게 연결한다.",
};

/** Top priority */
export const V1_0_TOP_PRIORITY =
  "NDK에서 실제 사용할 수 있는 독립 실행형 품질관리 시스템(QMS)을 완성한다.";

/** Core promise — MES is integration target, not development driver */
export const V1_0_CORE_PROMISE =
  "MES 때문에 흔들리지 않는다 — MES is integration target, not development direction driver.";

/** V1.0 locks to Standalone Edition (독립 실행형 QMS) */
export const V1_0_EDITION_LOCK = "standalone";

/** When false, AppShell auto-applies V1.0 edition without boot modal */
export const V1_0_SHOW_EDITION_BOOT_MODAL = false;

/** Editions paused until V1.1+ decision */
export const V1_0_EDITIONS_ON_HOLD = ["quality", "mes-connected"];

/** Repository backends paused until V1.1 (MES PoC gate) */
export const V1_0_REPOSITORIES_ON_HOLD = ["oracle", "api", "csv", "sqlite"];

/** Current development principles (Sprint focus) */
export const V1_0_DEVELOPMENT_PRINCIPLES = [
  "현재 Sprint에서는 MES 연동을 구현하지 않는다",
  "현재 목표는 NDK에서 실제 사용할 수 있는 품질관리 시스템(QMS)을 완성하는 것이다",
  "MES 연동은 Repository 구조를 유지한 상태에서 V1.1에서 진행한다",
  "UI와 Workflow를 먼저 완성한다 (SessionStorage Demo)",
  "기존 설계를 유지하고 불필요한 변경은 하지 않는다",
];

/** V1.0 strategic target */
export const V1_0_TARGET = {
  edition: "Standalone Edition (독립 실행형 NDK QMS)",
  repository: "session",
  scope: "입고·LOT·생산일보·검사·경도·성적서·문서·QR·Traceability·품질이력·출력물",
  completionCriterion: "Can NDK quality team use this tomorrow?",
  topPriority: V1_0_TOP_PRIORITY,
  corePromise: V1_0_CORE_PROMISE,
  officialDate: V1_0_OFFICIAL_DATE,
  demoBasis: "SessionStorage 기반 Demo 및 Workflow 완성",
};

/** V1.0 full scope (독립 실행형 QMS) */
export const V1_0_SCOPE = [
  "입고관리",
  "LOT 관리",
  "생산일보",
  "검사등록",
  "외관검사",
  "경도",
  "유효경화깊이",
  "조직사진",
  "성적서",
  "문서관리",
  "QR",
  "Traceability",
  "품질이력",
  "출력물",
];

/** V1.1 scope (MES 연동 — not current sprint) */
export const V1_1_SCOPE = [
  "MES(Oracle/API/CSV) 연동",
  "제품 Master 조회",
  "거래처 조회",
  "입고 조회",
  "출고 조회",
  "Repository → Oracle 교체",
];

/** V2.0 scope (future) */
export const V2_0_SCOPE = [
  "문서관리 및 Traceability 고도화",
  "Revision Control",
  "Approval Workflow",
  "Effective History",
  "Document Compare",
  "통계 고도화",
];

/** Development strategy by version */
export const DEVELOPMENT_STRATEGY = {
  v1_0: {
    label: "V1.0",
    title: "독립 실행형 NDK 품질관리 시스템(QMS)",
    scope: V1_0_SCOPE,
    repository: "session",
    note: "SessionStorage 기반 Demo 및 Workflow 완성",
  },
  v1_1: {
    label: "V1.1",
    title: "MES(Oracle/API/CSV) 연동",
    scope: V1_1_SCOPE,
    note: "Repository 구조 유지 · Oracle PoC 후 진행",
  },
  v2_0: {
    label: "V2.0",
    title: "문서관리 및 Traceability 고도화",
    scope: V2_0_SCOPE,
  },
};

/** Conceptual navigation target (V1.0) */
export const V1_0_MENU = [
  "HOME",
  "입고관리",
  "LOT 관리",
  "생산일보",
  "검사등록",
  "외관검사",
  "경도관리",
  "유효경화깊이",
  "조직사진",
  "성적서관리",
  "문서관리",
  "품질이력",
  "통계",
  "환경설정",
];

/** On hold — not V1.0 sprint scope (code 유지 · 삭제 ❌) */
export const V1_0_ON_HOLD = [
  "MES Connected Edition",
  "MES 연동 (Oracle/API/CSV Repository)",
  "출고관리 (MES 조회 — V1.1)",
  "재고관리",
  "거래명세서",
  "V2.0 문서관리 고도화",
];

/** @deprecated use V1_0_ON_HOLD — legacy alias */
export const V1_0_EXCLUDED = [
  "MES 연동",
  "출고관리",
  "재고관리",
  "거래명세서",
  "V2.0 Revision Control · Approval Workflow · Document Compare",
];

/** V1.0 end-to-end workflow (SessionStorage Demo) */
export const V1_0_WORKFLOW = [
  { step: 1, id: "inbound", label: "입고관리" },
  { step: 2, id: "lot", label: "LOT 관리" },
  { step: 3, id: "daily-report", label: "생산일보" },
  { step: 4, id: "inspection", label: "검사등록" },
  { step: 5, id: "visual", label: "외관검사" },
  { step: 6, id: "hardness", label: "경도" },
  { step: 7, id: "effective-depth", label: "유효경화깊이" },
  { step: 8, id: "microstructure", label: "조직사진" },
  { step: 9, id: "certificate", label: "성적서" },
  { step: 10, id: "document", label: "문서관리" },
  { step: 11, id: "qr-trace", label: "QR · Traceability" },
  { step: 12, id: "history", label: "품질이력" },
  { step: 13, id: "print", label: "출력물" },
];

/** Quality inspection sub-workflow (검사등록 이후) */
export const QUALITY_WORKFLOW = [
  { step: 1, id: "inspection", label: "검사등록" },
  { step: 2, id: "visual", label: "외관검사" },
  { step: 3, id: "hardness", label: "경도" },
  { step: 4, id: "effective-depth", label: "유효경화깊이" },
  { step: 5, id: "microstructure", label: "조직사진" },
  { step: 6, id: "certificate", label: "성적서" },
  { step: 7, id: "document", label: "문서관리" },
  { step: 8, id: "history", label: "품질이력" },
  { step: 9, id: "statistics", label: "통계" },
];

/** V1.0 sprint plan (official 2026-07-02) */
export const SPRINT_PLAN = {
  sprint3: {
    id: "sprint-3",
    label: "Sprint 3",
    scope: ["Print Engine", "성적서", "출력물", "문서관리 기본 구조"],
  },
  sprint4: {
    id: "sprint-4",
    label: "Sprint 4",
    scope: ["품질접수", "검사등록", "경도", "유효경화깊이", "조직사진"],
  },
  sprint5: {
    id: "sprint-5",
    label: "Sprint 5",
    scope: ["품질이력", "통계", "Dashboard"],
  },
  sprint6: {
    id: "sprint-6",
    label: "Sprint 6",
    scope: ["문서관리 고도화", "QR", "PDF", "검색 기능"],
  },
  afterPoC: {
    id: "after-poc",
    label: "After Oracle PoC",
    scope: ["Oracle PoC", "MES 연동 여부 결정", "V1.1 MES Connected", "V2.0 고도화"],
  },
};

/** Long-term vision path */
export const VISION_PATH = [
  {
    version: "V1.0",
    label: "독립 실행형 NDK QMS",
    note: "SessionStorage · Workflow 완성 · MES 연동 없음",
  },
  {
    version: "V1.1",
    label: "MES 연동",
    note: "Oracle/API/CSV · Repository 교체 · Master/입출고 조회",
  },
  {
    version: "V2.0",
    label: "문서/Traceability 고도화",
    note: "Revision · Approval · Effective History · Document Compare",
  },
];

export function isV1EditionLocked() {
  return Boolean(V1_0_EDITION_LOCK);
}

export function isEditionOnHold(editionId) {
  return V1_0_EDITIONS_ON_HOLD.includes(editionId);
}

export function isRepositoryOnHold(adapter) {
  return V1_0_REPOSITORIES_ON_HOLD.includes(adapter);
}

export function getV1DevelopmentDirectionSummary() {
  return {
    officialDate: V1_0_OFFICIAL_DATE,
    vision: PROJECT_VISION,
    strategy: DEVELOPMENT_STRATEGY,
    topPriority: V1_0_TOP_PRIORITY,
    corePromise: V1_0_CORE_PROMISE,
    principles: V1_0_DEVELOPMENT_PRINCIPLES,
    editionLock: V1_0_EDITION_LOCK,
    showBootModal: V1_0_SHOW_EDITION_BOOT_MODAL,
    target: V1_0_TARGET,
    scope: V1_0_SCOPE,
    menu: V1_0_MENU,
    onHold: V1_0_ON_HOLD,
    workflow: V1_0_WORKFLOW,
    sprints: SPRINT_PLAN,
    visionPath: VISION_PATH,
    editionsOnHold: V1_0_EDITIONS_ON_HOLD,
    repositoriesOnHold: V1_0_REPOSITORIES_ON_HOLD,
  };
}
