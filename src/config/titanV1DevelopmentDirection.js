/**

 * Project TITAN — Development Direction (Architecture Roadmap)

 * Official lock date: 2026-07-03

 *

 * Architecture Roadmap: Version 1 / 2 / 3 are evolution directions — NOT program versions.

 * CURRENT IMPLEMENTATION: Version 3 — NDK PQMS (Presentation Version · NDK 1공장 · SessionStorage)

 * "Presentation Version" = delivery/build label for Version 3 — NOT a separate architecture version.

 *

 * @see src/config/presentationBuildPolicy.js

 */



/** Presentation build framework lock date (Version 3 delivery label) */

export const PRESENTATION_VERSION_DATE = "2026-07-03";



/** @deprecated use PRESENTATION_VERSION_DATE — legacy alias */

export const V1_0_OFFICIAL_DATE = PRESENTATION_VERSION_DATE;



/** Current architecture roadmap implementation target */

export const CURRENT_DEVELOPMENT_VERSION = "v3";



/** Version 3 official definition — NDK PQMS Presentation Version (현재 구현) */
export const VERSION_3_DEFINITION = {
  id: "v3",
  label: "Version 3",
  title: "NDK Production & Quality Management System",
  titleKo: "NDK 생산품질관리시스템(PQMS)",
  presentationLabel: "Presentation Version",
  fullLabel: "Version 3 — NDK Production & Quality Management System (Presentation Version)",
  fullLabelKo: "Version 3 — NDK 생산품질관리시스템(PQMS) · Presentation Version",
  status: "current",
  factory: "NDK 1공장",
  goal:
    "NDK 1공장의 생산 및 품질 업무를 하나의 시스템에서 수행할 수 있는 PQMS(Presentation Version) 구축",
  evolutionAfterApproval:
    "사장님 승인 및 실제 운영 이후 → Version 2(MES 협업) → Version 1(MES 완전 연동) 순으로 발전",
};



/** Edition lock for Version 3 PQMS Presentation (runtime: SessionStorage) */

export const PRESENTATION_EDITION_LOCK = "standalone";



/** @deprecated use PRESENTATION_EDITION_LOCK — legacy alias for edition session */

export const V1_0_EDITION_LOCK = PRESENTATION_EDITION_LOCK;



/** When false, AppShell auto-applies presentation edition without boot modal */

export const PRESENTATION_SHOW_EDITION_BOOT_MODAL = false;



/** Startup Welcome Screen — disabled (Version 3: HOME 직행) */

export const OPERATION_MODE_WELCOME_ENABLED = false;



/** @deprecated use PRESENTATION_SHOW_EDITION_BOOT_MODAL */

export const V1_0_SHOW_EDITION_BOOT_MODAL = PRESENTATION_SHOW_EDITION_BOOT_MODAL;



/** Project system identity — PQMS (Production & Quality Management System) */

export const PROJECT_PQMS = {

  shortName: "PQMS",

  fullNameKo: "NDK 생산품질관리시스템",

  fullNameEn: "Production & Quality Management System",

  formula: "POP + QMS",

  summary:

    "생산(POP)과 품질(QMS) 업무를 하나의 시스템에서 수행 — Project TITAN = POP + QMS",

  mesDoesNotReplace:

    "MES를 대체하지 않음 — MES = 회사 운영 · Project TITAN = 생산·품질 실무",

};



/** MES vs Project TITAN 역할 (공식) */

export const MES_VS_TITAN_ROLES = {

  mes: {

    label: "MES",

    scope: [

      "수주",

      "구매",

      "거래처 Master",

      "제품 Master",

      "입고 등록",

      "출고 등록",

      "재고",

      "생산계획",

      "회사 운영",

    ],

  },

  titan: {

    label: "Project TITAN (PQMS)",

    scope: [

      "입고현황",

      "작업일보",

      "LOT 생성",

      "품질관리",

      "검사등록",

      "외관검사",

      "경도검사",

      "유효경화깊이",

      "조직사진",

      "성적서",

      "불량이력",

      "NCR",

      "문서관리",

      "출고현황",

      "거래명세서 출력",

      "Traceability",

      "이력조회",

    ],

  },

};



/** Project Vision (official) */

export const PROJECT_VISION = {

  summary:

    "Project TITAN은 NDK 생산품질관리시스템(PQMS)을 구축하는 것을 목표로 한다 — Production & Quality Management System.",

  ultimateGoal:

    "생산과 품질 업무를 하나의 시스템에서 수행 — 입고현황·작업일보(LOT)·품질관리·문서·출고·이력까지 Project TITAN 내부에서 시작하고 종료",

  popQmsIntegration:

    "Project TITAN = POP + QMS — 일반 POP도, 순수 QMS도 아닌 생산·품질 통합 실무 시스템",

  mesRelation:

    "MES를 대체하지 않음 — MES = 회사 운영 · Project TITAN = 생산·품질 실무(PQMS)",

  presentationGoal:

    "사장님께 실제 생산·품질 업무 흐름을 보여줄 수 있는 NDK PQMS(Presentation Build)를 완성도 높게 구축하는 것",

  version1:

    "Version 1 — MES 완전 연동 (Oracle · API · Repository · Master auto-sync · 중복 입력 제거) — 장기 계획",

  version2:

    "Version 2 — MES + TITAN 협업 (MES = 회사 운영 · TITAN = 생산·품질 PQMS · 부분 데이터 동기화) — 향후 검토",

  version3:

    "Version 3 ★ — NDK Production & Quality Management System (Presentation Version) — NDK 1공장 생산·품질 통합 구축 · 현재 구현 대상",

};



/** Top priority — Version 3 QMS (Presentation Build delivery) */

export const PRESENTATION_TOP_PRIORITY =

  "사장님 Demo 및 내부 검토용 NDK PQMS(Presentation Version)를 완성도 높게 구축한다.";



/** @deprecated use PRESENTATION_TOP_PRIORITY */

export const V1_0_TOP_PRIORITY = PRESENTATION_TOP_PRIORITY;



/** Core promise — Version 3 current; V1/V2 roadmap only */

export const PRESENTATION_CORE_PROMISE =

  "Version 3 PQMS(Presentation Version)만 구현한다 — Version 1·2는 Architecture Roadmap 문서만 · Oracle/MES 연동 구현 ❌";



/** @deprecated use PRESENTATION_CORE_PROMISE */

export const V1_0_CORE_PROMISE = PRESENTATION_CORE_PROMISE;



/** Version 3 completion criterion */

export const PRESENTATION_COMPLETION_CRITERION =

  "실제 생산·품질 업무에서 이렇게 사용하면 되겠구나 — Can the CEO see the production & quality workflow?";



/** Editions paused until Version 1 gate (roadmap) */

export const VERSION_1_EDITIONS_ON_HOLD = ["quality", "mes-connected"];



/** @deprecated use VERSION_1_EDITIONS_ON_HOLD */

export const V1_0_EDITIONS_ON_HOLD = VERSION_1_EDITIONS_ON_HOLD;



/** Repository backends paused until Version 1 gate (MES full integration roadmap) */

export const VERSION_1_REPOSITORIES_ON_HOLD = ["oracle", "api", "csv", "sqlite"];



/** @deprecated use VERSION_1_REPOSITORIES_ON_HOLD */

export const V1_0_REPOSITORIES_ON_HOLD = VERSION_1_REPOSITORIES_ON_HOLD;



/** Current development principles — Version 3 QMS (NDK 1공장 Presentation Build) */

export const PRESENTATION_DEVELOPMENT_PRINCIPLES = [

  "Version 3 PQMS(Presentation Version)만 구현 — 실행 즉시 HOME",

  "Version 1·Version 2 = Architecture Roadmap 문서만 · UI/기능 ❌",

  "운영모드·버전·공장 선택 화면 구현 ❌",

  "Presentation Build = Version 3 PQMS 구현의 delivery/build label (별도 architecture version ❌)",

  "생산·품질 업무 TITAN 내부 완결 · SessionStorage Demo",

  "MES 대체 ❌ — MES = 회사 운영 · TITAN = 생산·품질 실무",

  "Workflow·사용성 > 복잡한 확장 기능",

  "확장 기능 = 사장님 승인 · 운영 검토 후 단계적 구현",

  "사장님 승인 및 실제 운영 이후 Version 2(MES 협업) → Version 1(MES 완전 연동) 순으로 발전",

];



/** @deprecated use PRESENTATION_DEVELOPMENT_PRINCIPLES */

export const V1_0_DEVELOPMENT_PRINCIPLES = PRESENTATION_DEVELOPMENT_PRINCIPLES;



/** Version 3 screen polish priorities (in order) */

export const PRESENTATION_VERSION_PRIORITIES = [

  "HOME",

  "입고현황",

  "작업일보",

  "품질관리",

  "기준정보관리",

  "문서관리",

  "출고현황",

  "이력조회",

  "출력물",

  "Demo 데이터",

];



/** Version 3 strategic target — NDK 1공장 QMS (Presentation Build) */

export const VERSION_3_TARGET = {

  version: "v3",

  label: VERSION_3_DEFINITION.fullLabel,

  edition: "Standalone Edition (SessionStorage Demo)",

  editionLock: PRESENTATION_EDITION_LOCK,

  repository: "session",

  factory: "1공장",

  startup: "HOME 직행",

  scope: "HOME · 입고현황 · 작업일보 · 품질관리 · 기준정보관리 · 문서관리 · 출고현황 · 이력조회 · 환경설정",

  completionCriterion: PRESENTATION_COMPLETION_CRITERION,

  topPriority: PRESENTATION_TOP_PRIORITY,

  corePromise: PRESENTATION_CORE_PROMISE,

  officialDate: PRESENTATION_VERSION_DATE,

  demoBasis: "SessionStorage 기반 Demo · 실제 업무 Workflow · CEO Demo-ready",

  buildLabel: "Presentation Version / NDK 1공장 Presentation Build",

};



/** @deprecated use VERSION_3_TARGET — legacy alias (old Presentation = Version 2 naming) */

export const VERSION_2_TARGET = VERSION_3_TARGET;



/** @deprecated use VERSION_3_TARGET */

export const V1_0_TARGET = VERSION_3_TARGET;



/** Version 1 scope — MES full integration (long-term roadmap) */

export const VERSION_1_SCOPE = [

  "MES(Oracle) 실시간 연동",

  "MES 데이터 공유 · Master auto-sync",

  "입고·출고·생산·Master 조회",

  "Realtime Repository",

  "중복 입력 제거",

];



/** Version 2 scope — MES + TITAN collaboration (future review roadmap) */

export const VERSION_2_SCOPE = [

  "MES + TITAN 협업 Workflow",

  "MES = 회사 운영 SoT · TITAN = 생산·품질 PQMS",

  "부분 데이터 동기화",

  "Hybrid Mode (Architecture · Preview only)",

  "Oracle/API Repository (향후)",

];



/** Version 3 scope — current QMS implementation (9 menus) */

export const VERSION_3_SCOPE = [

  "HOME Dashboard",

  "입고현황",

  "작업일보",

  "품질관리 (검사·성적서·불량·NCR)",

  "기준정보관리",

  "문서관리",

  "출고현황",

  "이력조회",

  "환경설정",

  "출력물",

];



/** @deprecated use VERSION_3_SCOPE — legacy alias (old scope was VERSION_2_SCOPE) */

export const V1_0_SCOPE = VERSION_3_SCOPE;



/** @deprecated legacy V1.1 naming — maps to VERSION_1 */

export const V1_1_SCOPE = VERSION_1_SCOPE;



/** @deprecated legacy platform expansion naming — roadmap reference only */

export const V2_0_SCOPE = [

  "문서관리 및 Traceability 고도화",

  "Revision Control",

  "Approval Workflow",

  "Effective History",

  "Document Compare",

  "통계 고도화",

  "타 고객·업체 확장 (Quality Edition)",

];



/** Development strategy by architecture roadmap version */

export const DEVELOPMENT_STRATEGY = {

  version1: {

    id: "v1",

    label: "Version 1",

    title: "MES 완전 연동 (Oracle · MES SoT · Master auto-sync)",

    status: "long-term",

    scope: VERSION_1_SCOPE,

    note: "장기 계획 — 정부 사업·MES 업그레이드 방향 확정 후 검토",

  },

  version2: {

    id: "v2",

    label: "Version 2",

    title: "MES + TITAN 협업 (부분 데이터 동기화)",

    status: "future-review",

    scope: VERSION_2_SCOPE,

    note: "향후 검토 — MES 운영 + TITAN 생산·품질(PQMS) 협업 Architecture only",

  },

  version3: {

    id: "v3",

    label: "Version 3",

    title: "NDK Production & Quality Management System (Presentation Version)",

    status: "current",

    scope: VERSION_3_SCOPE,

    repository: "session",

    note: "현재 구현 대상 · NDK 1공장 PQMS Presentation Version · SessionStorage Demo",

  },

};



/** @deprecated legacy keys — use DEVELOPMENT_STRATEGY.version1/2/3 */

export const LEGACY_DEVELOPMENT_STRATEGY = {

  v1_0: DEVELOPMENT_STRATEGY.version3,

  v1_1: DEVELOPMENT_STRATEGY.version1,

  v2_0: DEVELOPMENT_STRATEGY.version2,

};



/** Current QMS sidebar (Version 3 · 9 menus) */

export const VERSION_3_MENU = [

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



/** @deprecated use VERSION_3_MENU — legacy alias (old menu constant was VERSION_2_MENU) */

export const VERSION_2_MENU = VERSION_3_MENU;



/** @deprecated use VERSION_3_MENU */

export const V1_0_MENU = VERSION_3_MENU;



/** Architecture-only roadmap items (V1/V2 — NOT Version 3 current implementation) */

export const VERSION_ON_HOLD = [

  "Version 1 — MES Connected Edition",

  "Version 1 — MES 완전 연동 (Oracle/API/CSV Repository)",

  "Version 1 — Oracle 실시간 Repository · Master auto-sync",

  "Version 2 — MES + TITAN Hybrid 협업",

  "Version 2 — 부분 데이터 동기화",

  "Factory Mode (1공장 / 2공장 / 전체공장 선택)",

  "Operation Mode Welcome · 버전/공장 선택 UI",

];



/** @deprecated use VERSION_ON_HOLD */

export const V1_0_ON_HOLD = VERSION_ON_HOLD;



/** @deprecated use VERSION_ON_HOLD — legacy alias */

export const V1_0_EXCLUDED = [

  "Version 1 — MES 연동",

  "Version 2 — Hybrid Mode UI",

];



/** Version 3 end-to-end workflow (SessionStorage Demo) */

export const VERSION_3_WORKFLOW = [

  { step: 1, id: "inboundStatus", label: "입고현황" },

  { step: 2, id: "workDaily", label: "작업일보 (LOT 생성)" },

  { step: 3, id: "inspection", label: "검사등록" },

  { step: 4, id: "visual", label: "외관검사" },

  { step: 5, id: "hardness", label: "경도" },

  { step: 6, id: "effective-depth", label: "유효경화깊이" },

  { step: 7, id: "microstructure", label: "조직사진" },

  { step: 8, id: "certificate", label: "성적서" },

  { step: 9, id: "document", label: "문서관리" },

  { step: 10, id: "outbound", label: "출고현황" },

  { step: 11, id: "transaction", label: "거래명세서" },

  { step: 12, id: "qr-trace", label: "QR · Traceability" },

  { step: 13, id: "history", label: "이력조회" },

  { step: 14, id: "print", label: "출력물" },

];



/** @deprecated use VERSION_3_WORKFLOW — legacy alias */

export const VERSION_2_WORKFLOW = VERSION_3_WORKFLOW;



/** @deprecated use VERSION_3_WORKFLOW */

export const V1_0_WORKFLOW = VERSION_3_WORKFLOW;



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



/** Version 3 implementation principles (Presentation Build delivery) */

export const PRESENTATION_IMPLEMENTATION = {

  repository: "session",

  oracleIntegration: false,

  architectureRoadmap: "v3",

  buildLabel: "Presentation Version / NDK 1공장 Presentation Build",

  priorities: PRESENTATION_VERSION_PRIORITIES,

  principles: [

    "SessionStorage 유지",

    "Oracle 연동 없음 (Version 1 roadmap only)",

    "UI/UX Polish 우선",

    "실제 업무 Workflow",

    "CRUD 동작",

    "PDF/Preview 출력",

    "Demo 데이터",

    "Demo-ready 상태",

  ],

};



/** Sprint plan — aligned to Version 3 QMS priorities */

export const SPRINT_PLAN = {

  sprint1: {

    id: "sprint-1",

    label: "Sprint 1",

    scope: ["HOME Dashboard Polish", "입고현황 Workflow STEP 1 ✅ · UI 설계 대기"],

    status: "current",

  },

  sprint2: {

    id: "sprint-2",

    label: "Sprint 2",

    scope: ["검사등록", "성적서관리", "Print Engine · PDF/Preview"],

    status: "planned",

  },

  sprint3: {

    id: "sprint-3",

    label: "Sprint 3",

    scope: ["문서관리", "출고관리", "거래명세서", "출력물"],

    status: "planned",

  },

  sprint4: {

    id: "sprint-4",

    label: "Sprint 4",

    scope: ["품질이력", "QR 구조", "통계 · Dashboard Polish"],

    status: "planned",

  },

  version1Gate: {

    id: "version-1-gate",

    label: "Version 1 Gate (Roadmap · long-term)",

    scope: ["정부 사업·MES 업그레이드 방향", "Oracle PoC", "Version 1 MES full integration"],

    status: "long-term",

  },

};



/** Architecture Roadmap vision path */

export const VISION_PATH = [

  {

    version: "Version 1",

    id: "v1",

    label: "MES 완전 연동",

    status: "long-term",

    note: "Oracle · MES SoT · Master auto-sync · 중복 입력 제거 — 장기 계획",

  },

  {

    version: "Version 2",

    id: "v2",

    label: "MES + TITAN 협업",

    status: "future-review",

    note: "MES 운영 + TITAN 품질 · 부분 데이터 동기화 — Architecture only",

  },

  {

    version: "Version 3",

    id: "v3",

    label: "NDK PQMS (Presentation Version)",

    status: "current",

    note: "현재 구현 대상 · NDK 1공장 PQMS Presentation · SessionStorage Demo · 8 menus",

  },

];



export function isPresentationEditionLocked() {

  return Boolean(PRESENTATION_EDITION_LOCK);

}



/** @deprecated use isPresentationEditionLocked */

export function isV1EditionLocked() {

  return isPresentationEditionLocked();

}



export function isEditionOnHold(editionId) {

  return VERSION_1_EDITIONS_ON_HOLD.includes(editionId);

}



export function isRepositoryOnHold(adapter) {

  return VERSION_1_REPOSITORIES_ON_HOLD.includes(adapter);

}



export function isCurrentDevelopmentVersion(versionId) {

  return versionId === CURRENT_DEVELOPMENT_VERSION;

}



export function getDevelopmentDirectionSummary() {

  return {

    frameworkDate: PRESENTATION_VERSION_DATE,

    currentVersion: CURRENT_DEVELOPMENT_VERSION,

    buildLabel: VERSION_3_DEFINITION.fullLabel,

    version3Definition: VERSION_3_DEFINITION,

    pqms: PROJECT_PQMS,

    mesVsTitanRoles: MES_VS_TITAN_ROLES,

    operationModeWelcome: OPERATION_MODE_WELCOME_ENABLED,

    vision: PROJECT_VISION,

    strategy: DEVELOPMENT_STRATEGY,

    topPriority: PRESENTATION_TOP_PRIORITY,

    corePromise: PRESENTATION_CORE_PROMISE,

    principles: PRESENTATION_DEVELOPMENT_PRINCIPLES,

    editionLock: PRESENTATION_EDITION_LOCK,

    showBootModal: PRESENTATION_SHOW_EDITION_BOOT_MODAL,

    target: VERSION_3_TARGET,

    scope: VERSION_3_SCOPE,

    menu: VERSION_3_MENU,

    onHold: VERSION_ON_HOLD,

    workflow: VERSION_3_WORKFLOW,

    presentationPriorities: PRESENTATION_VERSION_PRIORITIES,

    presentationImplementation: PRESENTATION_IMPLEMENTATION,

    sprints: SPRINT_PLAN,

    visionPath: VISION_PATH,

    editionsOnHold: VERSION_1_EDITIONS_ON_HOLD,

    repositoriesOnHold: VERSION_1_REPOSITORIES_ON_HOLD,

  };

}



/** @deprecated use getDevelopmentDirectionSummary */

export function getV1DevelopmentDirectionSummary() {

  return getDevelopmentDirectionSummary();

}

