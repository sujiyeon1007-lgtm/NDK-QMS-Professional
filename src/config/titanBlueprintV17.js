/**
 * Project TITAN V1.7 — Blueprint Development Methodology (PM 공식)
 *
 * Architecture → Blueprint → PM 승인 → 구현 → QA → Freeze
 * 본 Sprint: Blueprint 작성만 · UI/Router/Foundation/기능 구현 ❌
 *
 * @see .cursor/rules/project-titan-blueprint-v1.7.mdc
 * @see src/config/blueprints/index.js
 * @see docs/blueprints/V1.7/INDEX.md
 */

/** @type {"2026-07-07"} */
export const TITAN_BLUEPRINT_LOCK_DATE = "2026-07-07";

export const TITAN_BLUEPRINT_VERSION = "V1.7";

/** PM 공식 개발 파이프라인 */
export const TITAN_DEVELOPMENT_PIPELINE = [
  { id: "architecture", label: "Architecture", labelKo: "아키텍처 확정" },
  { id: "blueprint", label: "Blueprint", labelKo: "페이지 설계서" },
  { id: "pmApproval", label: "PM Approval", labelKo: "PM 승인" },
  { id: "implementation", label: "Implementation", labelKo: "구현" },
  { id: "qa", label: "QA", labelKo: "Browser QA" },
  { id: "freeze", label: "Freeze", labelKo: "UI/기능 Freeze" },
];

/** Blueprint 승인 전 금지 */
export const TITAN_BLUEPRINT_PRE_APPROVAL_PROHIBITIONS = [
  "기능 먼저 구현",
  "화면 먼저 구현",
  "Architecture 변경",
  "기존 Foundation 변경",
  "Blueprint 미승인 상태에서 신규 UI/Router/Launcher 변경",
];

/**
 * Blueprint 표준 섹션 — V2.0 (10항목 · Task Scope 신규 3번)
 * @deprecated V1.7 9항목 → V2.0 10항목 (Task 중심)
 */
export const TITAN_BLUEPRINT_SECTIONS_V17 = [
  { id: "purpose", order: 1, label: "목적 (Purpose)" },
  { id: "role", order: 2, label: "역할 (Role)" },
  { id: "layout", order: 3, label: "화면 구성 (Layout)" },
  { id: "data", order: 4, label: "데이터 (Data)" },
  { id: "workflow", order: 5, label: "Workflow" },
  { id: "automation", order: 6, label: "자동화 (Automation)" },
  { id: "connectedScreens", order: 7, label: "연결 화면" },
  { id: "outputs", order: 8, label: "출력물" },
  { id: "completionCriteria", order: 9, label: "완료 조건 (Freeze)" },
];

/** Blueprint 표준 섹션 — V2.0 Final (11항목 · Task Scope + Exit Condition) */
export const TITAN_BLUEPRINT_SECTIONS = [
  { id: "purpose", order: 1, label: "목적 (Purpose)" },
  { id: "role", order: 2, label: "역할 (Role)" },
  { id: "taskScope", order: 3, label: "Task Scope (업무 범위)" },
  { id: "exitCondition", order: 4, label: "Exit Condition (종료·이동)", isNew: true },
  { id: "layout", order: 5, label: "화면 구성 (Layout)" },
  { id: "data", order: 6, label: "데이터 (Data)" },
  { id: "workflow", order: 7, label: "Workflow" },
  { id: "automation", order: 8, label: "자동화 (Automation)" },
  { id: "connectedScreens", order: 9, label: "연결 화면" },
  { id: "outputs", order: 10, label: "출력물" },
  { id: "completionCriteria", order: 11, label: "완료 조건 (Freeze)" },
];

/** @deprecated V2.0 10항목 (Exit Condition 미분리) */
export const TITAN_BLUEPRINT_SECTIONS_V20_DRAFT = [
  { id: "purpose", order: 1, label: "목적 (Purpose)" },
  { id: "role", order: 2, label: "역할 (Role)" },
  { id: "taskScope", order: 3, label: "Task Scope (업무 범위)" },
  { id: "layout", order: 4, label: "화면 구성 (Layout)" },
  { id: "data", order: 5, label: "데이터 (Data)" },
  { id: "workflow", order: 6, label: "Workflow" },
  { id: "automation", order: 7, label: "자동화 (Automation)" },
  { id: "connectedScreens", order: 8, label: "연결 화면" },
  { id: "outputs", order: 9, label: "출력물" },
  { id: "completionCriteria", order: 10, label: "완료 조건 (Freeze)" },
];

/**
 * V2.0 핵심 — Workspace First Principle (PM 추가 지시 · 2026-07-07)
 * @see TITAN_V20_WORKSPACE_FIRST_PRINCIPLE in titanV20MenuWorkflowArchitecture.js
 */
export const TITAN_BLUEPRINT_WORKSPACE_PRINCIPLE = {
  principleId: "workspace-first",
  summaryKo:
    "기능(Function) 중심 ❌ · 업무 공간(Workspace) 중심 ✅ — 화면 하나 = 담당자의 책상.",
  designGoal:
    "사용자가 시스템을 열었을 때 '어디서 무엇을 해야 하는지' 고민하지 않도록 Workspace를 설계한다.",
  pageEqualsWorkspace: "페이지 = 업무 공간(Workspace) — 담당자가 '지금 처리해야 할 업무'만 표시",
  rules: [
    "HOME = 회사 전체 상황 (작업 ❌)",
    "설비현황 = 공장 관제실 (작업 ❌)",
    "운영관리 = 운영담당자 오늘 처리 업무",
    "생산관리 = 생산담당자 오늘 처리 업무",
    "품질관리 = 품질담당자 오늘 처리 업무",
    "같은 LOT를 여러 메뉴에서 반복 표시 ❌",
    "업무 완료 → 다음 담당자 Workspace로 자연스럽게 이어짐 (Workflow Engine)",
  ],
  supersedes: "V1.x List 중심 (모든 화면 동일 LOT 리스트)",
  blueprintReviewMethod:
    "11항목 순차 Review (Purpose → … → Freeze) · 항목별 PM 승인 후 Freeze",
};

/**
 * Task Scope — "이 화면에 어떤 데이터를 보여줄 것인가"
 */
export const TITAN_BLUEPRINT_TASK_SCOPE_FIELDS = [
  { id: "workspaceRole", label: "업무 공간(Workspace) 역할" },
  { id: "showOnly", label: "표시 대상 (해당 업무 데이터만)" },
  { id: "hide", label: "표시하지 않음 (다른 단계 데이터)" },
];

/**
 * Exit Condition — "업무가 언제 종료되고 어느 화면으로 이동하는가"
 * Task Scope 아래 별도 섹션 (V2.0 Final)
 */
export const TITAN_BLUEPRINT_EXIT_CONDITION_FIELDS = [
  { id: "completeWhen", label: "종료 조건 (업무 완료 시점)" },
  { id: "removeFromScreen", label: "현재 화면에서 제거" },
  { id: "nextScreen", label: "다음 화면 (자동 이동)" },
  { id: "engine", label: "TitanWorkflowEngine (사용자 수동 변경 ❌)" },
];

/** PM Freeze 정책 — V1.7 공식 */
export const TITAN_PAGE_FREEZE_CRITERIA = [
  "기능 정상 동작",
  "Workflow 검증 완료",
  "Store 연동 완료",
  "Browser QA 완료",
  "PM 승인 완료",
];

export const TITAN_PAGE_FREEZE_POLICY = {
  summaryKo:
    "Freeze된 페이지는 구조 변경 ❌ — 필요 시 Review를 통한 개선만 허용",
  criteria: TITAN_PAGE_FREEZE_CRITERIA,
};

/**
 * Traceability QR ID · Version — Blueprint 설계 (구현 ❌ · Roadmap 준비)
 * @see src/config/titanQrArchitectureV17.js — TITAN_QR_ID_POLICY · TITAN_QR_VERSION_POLICY
 */
export {
  TITAN_QR_ID_POLICY as TITAN_QR_ID_DESIGN,
  TITAN_QR_VERSION_POLICY as TITAN_QR_VERSION_DESIGN,
} from "./titanQrArchitectureV17.js";

/**
 * Blueprint Review 순서 — V2.0 Final (PM 2026-07-07)
 * ① HOME → … → ⑩ LOT Lifecycle (각 화면 PM Review → 승인 → Freeze 후 다음)
 */
export const TITAN_BLUEPRINT_SPRINT_TARGETS = [
  "home",
  "equipmentMonitor",
  "operationsManagement",
  "productionManagement",
  "qualityManagement",
  "statistics",
  "masterData",
  "environment",
  "companyInfo",
  "lotLifecycle",
];

/** @deprecated lotLifecycle은 Review 순서 10번으로 통합 */
export const TITAN_BLUEPRINT_SUPPORTING_TARGETS = [];

/** @deprecated V1.7 초안 순서 — V2.0 개정으로 대체 */
export const TITAN_BLUEPRINT_SPRINT_TARGETS_V17 = [
  "home",
  "inoutManagement",
  "productionManagement",
  "qualityManagement",
  "mes",
  "statistics",
  "masterData",
  "environment",
  "lotLifecycle",
];

/**
 * V2.0 Menu & Workflow Architecture — Blueprint 개정 (PM B안 승인)
 * @see src/config/titanV20MenuWorkflowArchitecture.js
 * @see docs/TITAN_V20_MENU_WORKFLOW_ARCHITECTURE.md
 */
export const TITAN_V20_BLUEPRINT_DIRECTION = {
  architectureApproved: true,
  architectureLockDate: "2026-07-07",
  blueprintArchitectureFinalApproved: true,
  approach: "Blueprint 전체 개정 → 화면별 PM Review → 승인 → Freeze → 다음 화면",
  supersedesListCentricDraft: true,
  sectionsChange: "11항목 (Task Scope 3 · Exit Condition 4 · 신규)",
  workspaceConcept: "Workspace First — 페이지 = 업무 공간 (Function 중심 ❌)",
  workspaceFirstApproved: true,
  exitConditionPolicy: "업무 종료 시점 · 다음 화면 — Task Scope와 분리",
  masterStoreChange: "Company Store 신규 · Worker Store → 기준정보관리",
  companyInfoChange: "회사정보만 (작업자관리 ❌)",
  printManagementShared: "운영·생산 출력관리 = 동일 Layout/Component/UX",
  nextStep: "Phase 2 — Implementation (구현) · Phase 1 (Architecture + Blueprint) ✅ 완료",
  docPath: "docs/TITAN_V20_MENU_WORKFLOW_ARCHITECTURE.md",
  blueprintDocs: "docs/blueprints/V2.0/INDEX.md",
};

/**
 * V2.0 공식 Workspace 유형 분류 (운영관리 Freeze · PM 2026-07-07)
 * @see OPERATIONS_MANAGEMENT_BLUEPRINT.taskScope.screens
 */
export const TITAN_V20_OFFICIAL_WORKSPACE_TYPES = {
  task: {
    label: "Task Workspace",
    screens: [
      "입고등록",
      "출고등록",
      "재고관리",
      "생산계획",
      "설비장입현황",
      "생산일보",
      "검사관리",
      "성적서관리",
    ],
  },
  history: {
    label: "History Workspace",
    screens: ["입출고이력", "불량이력관리"],
    note: "이력 조회 · 전체 이력 예외(입출고)",
  },
  print: { label: "Print Workspace", screens: ["출력관리"], sharedLayout: "operationsProductionPrint" },
  journal: {
    label: "Journal Workspace",
    screens: ["영업업무일지", "품질업무일지"],
    note: "사람별 Launcher",
  },
  document: { label: "Document Workspace", screens: ["문서관리"], note: "품질 문서 — 표준서·공정서·고객·ISO·도면" },
  analytics: {
    label: "Analytics Workspace",
    screens: ["생산실적관리"],
    note: "조회 전용 분석 · Task ❌ · dimensions: 설비/업체/품명/재질/LOT별",
  },
  controlRoom: { label: "Control Room", screens: ["설비현황"], isWorkspace: false },
  dashboard: { label: "Dashboard", screens: ["HOME"], isWorkspace: false },
};

/** @typedef {"pending-pm-approval" | "pm-approved" | "implemented" | "frozen"} BlueprintStatus */

export function getTitanBlueprintMethodologySummary() {
  return {
    lockDate: TITAN_BLUEPRINT_LOCK_DATE,
    version: TITAN_BLUEPRINT_VERSION,
    blueprintTemplateVersion: "V2.0 Final (11-section · Task Scope + Exit Condition)",
    pipeline: TITAN_DEVELOPMENT_PIPELINE.map((row) => row.labelKo),
    sections: TITAN_BLUEPRINT_SECTIONS.map((row) => row.label),
    workspacePrinciple: TITAN_BLUEPRINT_WORKSPACE_PRINCIPLE.summaryKo,
    freezeCriteria: TITAN_PAGE_FREEZE_CRITERIA,
    sprintTargets: TITAN_BLUEPRINT_SPRINT_TARGETS,
    supportingTargets: TITAN_BLUEPRINT_SUPPORTING_TARGETS,
    approach: TITAN_V20_BLUEPRINT_DIRECTION.approach,
    qrIdDesign: TITAN_QR_ID_DESIGN.example,
    qrVersionDesign: TITAN_QR_VERSION_DESIGN.initialVersion,
    blueprintRegistry: "src/config/blueprints/titanBlueprintsV17.js",
    blueprintDocs: "docs/blueprints/V2.0/INDEX.md",
  };
}

export { getBlueprintV17, listBlueprintsV17, TITAN_BLUEPRINTS_V17 } from "./blueprints/index.js";
