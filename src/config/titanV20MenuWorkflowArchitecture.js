/**
 * Project TITAN V2.0 — 업무 중심 (Menu & Workflow) Architecture (PM 최종 승인)
 *
 * List 중심 → Task 중심 전환. 한 화면 = 한 업무.
 * Architecture Only — Blueprint V2.0 개정 전 UI/Router/Store 구현 ❌
 *
 * ⚠️ Vision Roadmap V2.0 (Smart QR · Mobile)과 구분:
 *    본 문서 = Menu & Workflow Architecture V2.0
 *
 * @see docs/TITAN_V20_MENU_WORKFLOW_ARCHITECTURE.md
 * @see .cursor/rules/project-titan-v2.0-menu-workflow-architecture.mdc
 */

export const TITAN_V20_MENU_WORKFLOW_VERSION = "V2.0";
export const TITAN_V20_MENU_WORKFLOW_LOCK_DATE = "2026-07-07";
export const TITAN_V20_MENU_WORKFLOW_LOCKED = true;

/** Architecture + Blueprint Architecture Final 승인 · Review/구현 대기 */
export const TITAN_V20_IMPLEMENTATION_STATUS = "blueprint-architecture-final-approved-pending-review";

/**
 * Vision Roadmap V2.0 (Smart QR)과 구분용 라벨
 * @see .cursor/rules/project-titan-vision-roadmap-v1.mdc
 */
export const TITAN_V20_ARCHITECTURE_SCOPE_LABEL =
  "Menu & Workflow Architecture (업무 중심)";

/** PM 공식 철학 (V2.0 Blueprint Final) */
export const TITAN_V20_PHILOSOPHY = {
  summaryKo:
    "한 화면 = 하나의 업무(Workspace) · 한 LOT = 하나의 Workflow · Workflow Engine 자동 관리 · Master Data 기준.",
  principles: [
    "한 화면 = 하나의 업무(Workspace)",
    "한 LOT = 하나의 Workflow",
    "한 작업 완료 = 다음 단계 자동 이동",
    "동일 LOT를 여러 화면에서 반복 표시하지 않는다",
    "사용자는 항상 현재 자신이 처리해야 할 업무만 본다",
    "Workflow Engine이 상태를 자동으로 관리한다 (사용자 수동 변경 ❌)",
    "Master Data를 기준으로 모든 화면이 동작한다",
  ],
};

/**
 * Workspace First Principle (PM 추가 지시 · 2026-07-07)
 * 기능(Function) 중심 ❌ · 업무 공간(Workspace) 중심 ✅
 */
export const TITAN_V20_WORKSPACE_FIRST_PRINCIPLE = {
  lockDate: "2026-07-07",
  summaryKo:
    "화면 하나 = 담당자의 책상. 기능 나열이 아니라 '오늘 이 담당자가 처리할 업무'만 보여주는 Workspace로 설계한다.",
  designGoal:
    "사용자가 시스템을 열었을 때 '어디서 무엇을 해야 하는지' 고민하지 않도록 — Workspace 설계가 구현 목표",
  vsFunctionCentric: "기능(Function) 중심 ❌ → 업무 공간(Workspace) 중심 ✅",
  workspaceByScreen: [
    { screen: "HOME", workspace: "회사 전체 상황 — Dashboard (작업 ❌)" },
    { screen: "설비현황", workspace: "공장 관제실 — 실시간 관제 (작업 ❌)" },
    { screen: "운영관리", workspace: "운영담당자가 오늘 처리해야 하는 업무" },
    { screen: "생산관리", workspace: "생산담당자가 오늘 처리해야 하는 업무" },
    { screen: "품질관리", workspace: "품질담당자가 오늘 처리해야 하는 업무" },
    { screen: "기준정보관리", workspace: "Master Data 관리 Workspace" },
    { screen: "통계관리", workspace: "경영 조회 Workspace (등록 ❌)" },
    { screen: "환경설정", workspace: "시스템 설정 Workspace" },
    { screen: "회사정보", workspace: "Company Store 관리 Workspace" },
  ],
  appliesFrom: "Blueprint Review ① HOME부터 모든 화면 동일 적용",
};

/** V1.x List 중심 → V2.0 Task 중심 전환 배경 */
export const TITAN_V20_TRANSITION_RATIONALE = {
  problemKo: [
    "모든 메뉴에서 동일 LOT 리스트 · 현재공정만 변경 → 혼란",
    "처리해야 할 업무가 직관적으로 보이지 않음",
    "같은 데이터를 여러 화면에서 반복 조회",
    "ERP/QMS/MES 전문 시스템처럼 느껴지지 않음",
  ],
  solutionKo: "데이터 중심(List) → 업무 중심(Task) — 각 화면은 자신의 업무 데이터만 표시",
};

/** Master Store 공식 구조 (V2.0 Final) — Blueprint 승인 후 구현 */
export const TITAN_V20_MASTER_STORE_STRUCTURE = {
  label: "Master Store",
  stores: [
    { id: "customerStore", label: "Customer Store" },
    { id: "productStore", label: "Product Store" },
    { id: "equipmentStore", label: "Equipment Store" },
    { id: "processStore", label: "Process Store" },
    { id: "workerStore", label: "Worker Store", owner: "기준정보관리 → 작업자관리" },
    { id: "companyStore", label: "Company Store", isNew: true, owner: "회사정보" },
  ],
  policy: {
    workerStore: "기준정보관리 Launcher · 작업자관리 — 회사정보에서 분리",
    companyStore: "Config/SessionStorage ❌ · 신규 Company Store · 모든 출력물 Header 참조",
  },
};

/** Company Store — 신규 (Blueprint · 구현 승인 후) */
export const TITAN_V20_COMPANY_STORE = {
  storeId: "companyStore",
  implementationStatus: "blueprint-only",
  forbiddenSources: ["config", "sessionStorage"],
  fields: [
    "회사명",
    "대표자",
    "사업자등록번호",
    "주소",
    "전화",
    "팩스",
    "이메일",
    "회사 로고",
    "직인",
    "사업장 정보",
  ],
  consumers: ["PDF", "성적서", "거래명세서", "모든 출력물 Header"],
};

/** 출력관리 — 운영·생산 공통 (V2.0 Final) */
export const TITAN_V20_PRINT_MANAGEMENT_SHARED = {
  sharedLayoutId: "operationsProductionPrint",
  rule: "운영관리 · 생산관리 출력관리 = 동일 Layout · 동일 Component · 동일 UX",
  implementation: "공통 컴포넌트로 관리 (Blueprint 승인 후)",
};

/** PM 공식 End-to-End Workflow */
export const TITAN_V20_OFFICIAL_WORKFLOW = [
  { id: "incomingRegister", label: "입고등록", stageKey: "RECEIVED" },
  { id: "incomingDone", label: "입고완료", stageKey: "RECEIVED" },
  { id: "productionPlan", label: "생산계획", stageKey: "HT_WAIT" },
  { id: "lotCreate", label: "LOT 생성", stageKey: "HT_WAIT" },
  { id: "equipmentCharge", label: "설비 장입", stageKey: "HT_WAIT" },
  { id: "productionRunning", label: "생산 진행", stageKey: "HT_RUNNING" },
  { id: "productionDone", label: "생산 완료", stageKey: "HT_RUNNING" },
  { id: "inspectionWait", label: "검사 대기", stageKey: "INSPECTION_WAIT" },
  { id: "inspectionDone", label: "검사 완료", stageKey: "INSPECTION_DONE" },
  { id: "certificateIssue", label: "성적서 발행", stageKey: "CERT_DONE" },
  { id: "shipWait", label: "출고 대기", stageKey: "SHIP_WAIT" },
  { id: "shipped", label: "출고 완료", stageKey: "SHIPPED" },
];

/** Sidebar 1Depth — V2.0 공식 (9 menus · Launcher Hub) */
export const TITAN_V20_SIDEBAR_ORDER = [
  "home",
  "equipmentMonitor",
  "operationsManagement",
  "productionManagement",
  "qualityManagement",
  "statisticsInquiry",
  "masterData",
  "environment",
  "companyInfo",
];

export const TITAN_V20_SIDEBAR = [
  { id: "home", label: "HOME", emoji: "🏠", launcher: false, role: "Dashboard" },
  {
    id: "equipmentMonitor",
    label: "설비현황",
    emoji: "📡",
    launcher: false,
    role: "공장 실시간 관제 (MES 개념 ❌)",
    subScreens: ["equipmentView", "lotView", "productView"],
    note: "Control Room 내부 View — Sidebar ❌",
  },
  {
    id: "operationsManagement",
    label: "운영관리",
    emoji: "📦",
    launcher: true,
    legacyMenuId: "inoutManagement",
  },
  {
    id: "productionManagement",
    label: "생산관리",
    emoji: "🏭",
    launcher: true,
  },
  {
    id: "qualityManagement",
    label: "품질관리",
    emoji: "🧪",
    launcher: true,
  },
  {
    id: "statisticsInquiry",
    label: "통계관리",
    emoji: "📊",
    launcher: true,
  },
  {
    id: "masterData",
    label: "기준정보관리",
    emoji: "⚙",
    launcher: true,
  },
  {
    id: "environment",
    label: "환경설정",
    emoji: "🔧",
    launcher: true,
  },
  {
    id: "companyInfo",
    label: "회사정보",
    emoji: "🏢",
    launcher: true,
  },
];

/** V1.5 → V2.0 Sidebar 변경 요약 */
export const TITAN_V20_SIDEBAR_MIGRATION = {
  removed: ["mesGroup", "productStatusSidebar1Depth"],
  renamed: [{ from: "입출고관리", to: "운영관리", menuId: "inoutManagement→operationsManagement" }],
  added: ["companyInfo"],
  merged: {
    mesInto: "equipmentMonitor",
    note: "설비현황 Control Room — Sidebar 1Depth · 제품현황 Sidebar ❌ · 내부 View(설비/LOT/제품)",
  },
};

/** 설비현황 — LOT 중심 Control Room (Launcher ❌ · Workspace ❌) */
export const TITAN_V20_EQUIPMENT_MONITOR = {
  launcher: false,
  isWorkspace: false,
  roleType: "realTimeMonitor",
  metaphor: "공장 전체 실시간 관제 — LOT 중심 Control Room",
  philosophy:
    "설비를 보는 화면 ❌ · 공장 현재 상태를 보는 화면 ✅ — LOT/Workflow/QR 철학과 정합",
  controlRoomStructure: {
    pmDecision: "조건부 승인 — LOT 중심 Control Room 재설계",
    tree: [
      "설비현황 (Control Room · Sidebar 1Depth)",
      "├ 설비 View (Equipment View)",
      "├ LOT View (LOT View · 🆕 중심)",
      "└ 제품 View (Product View · LOT 구성 정보)",
    ],
    lotCentric: "제품은 독립 Workspace ❌ — LOT를 구성하는 정보",
    sidebarPolicy: "제품현황 Sidebar 제거 ✅ · Control Room 내부 View only",
    navigation: "HOME → 설비현황 → Control Room → (설비 | LOT | 제품) View",
  },
  topKpi: [
    "현재 가동 설비",
    "가동률",
    "생산중 LOT",
    "대기 LOT",
    "알람",
    "금일 생산완료",
    "금일 검사대기",
  ],
  views: {
    equipment: {
      id: "equipmentView",
      label: "설비 View",
      legacyRoute: "/equipment-status",
      policy: "현재 구조 유지 + 작업자 · 알람 · 가동률 보강",
      displays: [
        "설비 상태",
        "작업자",
        "현재 LOT",
        "현재 제품",
        "작업 시작",
        "예상 종료",
        "설비 알람",
        "가동률",
        "진행률",
      ],
    },
    lot: {
      id: "lotView",
      label: "LOT View",
      isCenter: true,
      isNew: true,
      displays: [
        "LOT",
        "관리번호",
        "제품",
        "고객사",
        "현재 설비",
        "현재 공정",
        "작업자",
        "진행률",
        "상태",
        "작업 시작",
        "예상 종료",
      ],
    },
    product: {
      id: "productView",
      label: "제품 View",
      legacyRoute: "/product-status",
      policy: "Task List ❌ · 실시간 관제 화면 (생산일보 ❌)",
      displays: [
        "LOT",
        "제품명",
        "품번",
        "고객사",
        "현재 설비",
        "현재 공정",
        "진행률",
        "작업 시작",
        "예상 완료",
      ],
    },
  },
  realtimePrinciple: {
    forbidden: ["등록", "수정", "삭제", "작업"],
    userGoal: [
      "어떤 LOT가 어디에 있는지",
      "어떤 설비가 무엇을 작업 중인지",
      "어느 공정에서 병목이 생겼는지",
    ],
  },
  dataPipeline: {
    legacy: "Session 기반 (제품 View Legacy)",
    target: "TitanDataEngine → TitanWorkflowEngine → Control Room",
    uiPolicy: "UI 변경 최소 · Data Source 교체",
  },
  forbidden: ["QR Scan · 장입 시작 · 열처리 완료 (작업 수행 ❌)"],
  workScreen: "생산관리 → 설비장입현황",
};

/** 운영관리 Launcher */
export const TITAN_V20_OPERATIONS_LAUNCHER = [
  {
    id: "incomingRegister",
    label: "입고등록",
    dataRule: {
      show: ["입고 완료", "생산 미투입 제품"],
      removeWhen: "생산계획으로 이동",
      exclude: ["출고대기", "출고완료"],
    },
  },
  {
    id: "outboundRegister",
    label: "출고등록",
    dataRule: {
      show: ["출고 대기", "출고 완료(출고완료 탭)"],
      exclude: ["입고 제품"],
      note: "출고 완료는 '출고완료' 탭에서만 조회",
    },
  },
  {
    id: "inoutHistory",
    label: "입출고이력",
    dataRule: { show: ["입고 + 출고 전체 이력 조회"] },
  },
  {
    id: "inventoryManagement",
    label: "재고관리",
    dataRule: { show: ["현재 보관중인 제품만"] },
  },
  {
    id: "printManagement",
    label: "출력관리",
    sharedLayout: "operationsProductionPrint",
    outputs: ["입고리스트", "출고리스트", "거래명세서"],
    periodFilters: ["금일", "이번주", "이번달", "사용자 지정"],
  },
  {
    id: "salesWorkJournal",
    label: "영업업무일지",
    structure: "Launcher → 사원별 업무일지 (부서 → 담당자)",
  },
];

/** 생산관리 Launcher */
export const TITAN_V20_PRODUCTION_LAUNCHER = [
  {
    id: "productionPlan",
    label: "생산계획",
    dataRule: {
      show: ["입고 완료", "열처리 대기품"],
      actions: ["LOT 생성", "작업지시 출력", "생산 시작"],
      removeWhen: "생산 시작 후",
    },
    periodFilters: ["금일", "이번주", "이번달", "전체", "열처리 대기품"],
  },
  {
    id: "equipmentChargeStatus",
    label: "설비장입현황",
    importance: "생산관리 최중요 Workspace — LOT를 설비에 연결 (설비 중심 ❌)",
    dataRule: {
      show: ["장입 대기", "장입중 LOT"],
      displays: ["LOT", "설비", "장입시간", "예정 종료", "작업자", "상태"],
      removeWhen: "장입 완료 → 생산일보",
    },
  },
  {
    id: "productionDailyReport",
    label: "생산일보",
    dataRule: {
      show: ["생산 진행", "생산 완료"],
      removeWhen: "생산 완료 후 → 검사관리로 이동",
    },
  },
  {
    id: "productionResults",
    label: "생산실적관리",
    role: "Analytics Workspace — 조회 전용",
    dimensions: ["설비별", "업체별", "품명별", "재질별", "LOT별"],
    lotProductivity: "LOT별 생산성 분석 — LOT 중심 시스템 필수",
  },
  {
    id: "productionPrintManagement",
    label: "출력관리",
    sharedLayout: "operationsProductionPrint",
    outputs: ["생산일보", "LOT 리스트", "작업지시서"],
  },
];

/**
 * 생산관리 HT Stage 정의 (PM Screen Review ④ · 2026-07-07)
 * 모든 생산 화면 = 이 Stage 기준 동작 · TitanWorkflowEngine stageKey
 */
export const TITAN_V20_PRODUCTION_HT_STAGES = {
  HT_WAIT: {
    key: "HT_WAIT",
    label: "열처리 대기",
    screens: ["생산계획"],
    meaning: "입고완료 · LOT 생성·작업지시·생산 시작 전",
    showOnly: ["열처리 대기품"],
  },
  HT_RUNNING: {
    key: "HT_RUNNING",
    label: "열처리 진행",
    screens: ["설비장입현황", "생산일보"],
    meaning: "장입·생산 진행 중 (장입=LOT↔설비 · 일보=생산 진행/완료)",
  },
  HT_COMPLETE: {
    key: "HT_COMPLETE",
    label: "열처리 완료",
    screens: ["생산일보(완료)", "생산실적관리"],
    meaning: "생산 완료 → Engine → 품질관리(검사관리)",
    workflowKey: "INSPECTION_WAIT",
  },
  policy: "모든 생산 화면 = HT Stage 기준 · 사용자 수동 stage 변경 ❌",
};

export const TITAN_V20_QUALITY_INSPECTION_RESULT = {
  PASS: {
    key: "PASS",
    label: "합격",
    meaning: "검사 통과 → 성적서관리 진행",
    exitTo: "성적서관리",
  },
  FAIL: {
    key: "FAIL",
    label: "불합격",
    meaning: "품질 불합격 → 불량이력",
    exitTo: "불량이력관리",
  },
  HOLD: {
    key: "HOLD",
    label: "보류",
    meaning: "판정 보류 · 추가 확인",
  },
  REWORK: {
    key: "REWORK",
    label: "재작업",
    meaning: "재처리 → 재검사",
    exitTo: "재처리 → 재검사",
  },
  policy: "Result = 품질 판정 · Status(Workflow)와 완전 분리",
  examples: [
    "양산검사 + 검사 완료 + PASS",
    "개발검사 + 검사 완료 + HOLD",
  ],
};

/** 품질관리 Launcher */
export const TITAN_V20_QUALITY_LAUNCHER = [
  {
    id: "inspectionManagement",
    label: "검사관리",
    workspaceType: "taskWorkspace",
    entryRequirement: "HT_COMPLETE · 생산 완료",
    showOnly: ["검사 대기 · 검사 진행 LOT"],
    hide: ["생산 진행 제품"],
    inspectionType: {
      label: "검사 종류 (Type)",
      values: ["양산검사", "개발검사", "기타검사"],
    },
    inspectionStatus: {
      label: "검사 상태 (Status)",
      show: ["검사 대기", "검사 진행"],
      statusKeys: ["INSPECTION_WAIT", "INSPECTION_IN_PROGRESS"],
    },
    inspectionResult: {
      label: "검사 판정 (Result)",
      values: ["PASS", "FAIL", "HOLD", "REWORK"],
      note: "Status 완료 시 기록 · Status와 독립",
    },
    dataRule: {
      show: ["HT_COMPLETE · 검사 대기/진행"],
      removeWhen: "검사 완료 (+ Result) → 성적서관리 또는 불량이력 (Engine)",
    },
    examples: ["양산검사 + 검사 진행", "개발검사 + 검사 완료 + HOLD"],
  },
  {
    id: "certificateManagement",
    label: "성적서관리",
    workspaceType: "taskWorkspace",
    showOnly: ["검사 완료 · 성적서 미발행"],
    inspectionStatus: {
      label: "검사 상태 (Status)",
      show: ["검사 완료", "성적서 대기"],
      statusKeys: ["INSPECTION_DONE", "CERT_WAIT"],
    },
    dataRule: {
      show: ["검사 완료 LOT · 성적서 미발행"],
      removeWhen: "성적서 발행 완료 → 운영관리 출고등록 (Engine)",
    },
  },
  {
    id: "defectHistory",
    label: "불량이력관리",
    workspaceType: "historyWorkspace",
    fields: ["불량 등록", "원인", "조치", "재발방지", "이력 조회"],
    triggerResult: ["FAIL", "REWORK"],
  },
  {
    id: "documentManagement",
    label: "문서관리",
    workspaceType: "documentWorkspace",
    categories: ["표준서", "공정서", "고객문서", "ISO", "도면"],
  },
  {
    id: "qualityWorkJournal",
    label: "품질업무일지",
    workspaceType: "journalWorkspace",
    role: "품질 담당자 업무일지",
  },
];

/** 통계 · 기준정보 · 환경 · 회사정보 Launcher */
export const TITAN_V20_STATISTICS_LAUNCHER = [
  { id: "allStatistics", label: "전체통계" },
  { id: "productionStatistics", label: "생산통계" },
  { id: "qualityStatistics", label: "품질통계" },
  { id: "salesStatistics", label: "영업통계" },
];

export const TITAN_V20_MASTER_DATA_LAUNCHER = [
  { id: "customer", label: "거래처관리" },
  { id: "product", label: "제품관리" },
  { id: "material", label: "재질관리" },
  { id: "process", label: "공정관리" },
  { id: "equipment", label: "설비관리" },
  { id: "worker", label: "작업자관리", store: "workerStore" },
];

export const TITAN_V20_ENVIRONMENT_LAUNCHER = [
  { id: "admin", label: "관리자" },
  { id: "system", label: "시스템" },
  { id: "developer", label: "개발자" },
  { id: "qrRegister", label: "QR등록" },
];

/** 회사정보 — 회사정보만 (작업자관리 ❌ → 기준정보관리) */
export const TITAN_V20_COMPANY_INFO_LAUNCHER = [{ id: "companyProfile", label: "회사정보" }];

/**
 * 데이터 표시 원칙 — V2.0 핵심 (한 화면 = 해당 업무 데이터만)
 * Workflow Engine이 stageKey 기준으로 필터 · 자동 이동
 */
export const TITAN_V20_SCREEN_DATA_RULES = [
  {
    screen: "운영관리 → 입고등록",
    showStages: ["RECEIVED"],
    showLabel: "입고 완료 · 생산 미투입",
    removeOn: "생산계획 투입",
    nextScreen: "생산계획",
  },
  {
    screen: "생산관리 → 생산계획",
    showStages: ["HT_WAIT"],
    showLabel: "열처리 대기품",
    removeOn: "LOT 생성 · 생산 시작",
    nextScreen: "설비장입현황",
  },
  {
    screen: "생산관리 → 설비장입현황",
    showLabel: "장입 대기/장입중 LOT",
    removeOn: "장입 완료",
    nextScreen: "생산일보",
  },
  {
    screen: "생산관리 → 생산일보",
    showStages: ["HT_RUNNING"],
    showLabel: "생산 진행 · 생산 완료",
    removeOn: "생산 완료",
    nextScreen: "검사관리",
  },
  {
    screen: "품질관리 → 검사관리",
    showStages: ["INSPECTION_WAIT", "INSPECTION_IN_PROGRESS"],
    entryFrom: "HT_COMPLETE (생산 완료)",
    showLabel: "검사 대기 · 검사 진행 (Type × Status × Result)",
    hide: ["생산 진행 · HT_RUNNING"],
    removeOn: "검사 완료",
    nextScreen: "성적서관리 (PASS/HOLD) · 불량이력 (FAIL/REWORK)",
  },
  {
    screen: "품질관리 → 성적서관리",
    showStages: ["INSPECTION_DONE", "CERT_WAIT"],
    showLabel: "검사 완료 · 성적서 미발행",
    removeOn: "성적서 발행 완료",
    nextScreen: "운영관리 → 출고등록",
  },
  {
    screen: "운영관리 → 출고등록",
    showStages: ["SHIP_WAIT"],
    showLabel: "출고 대기",
    removeOn: "출고 완료",
    nextScreen: "출고완료(탭)",
  },
  {
    screen: "운영관리 → 재고관리",
    showLabel: "현재 재고만",
    excludeStages: ["SHIPPED"],
  },
];

/** Exit Condition — Task Scope 아래 별도 (V2.0 Blueprint Final) */
export const TITAN_V20_EXIT_CONDITIONS = [
  {
    screen: "운영관리 → 입고등록",
    taskScope: "생산 미투입 제품",
    completeWhen: "생산계획 투입",
    nextScreen: "생산관리 → 생산계획",
  },
  {
    screen: "생산관리 → 생산계획",
    taskScope: "열처리 대기품",
    completeWhen: "LOT 생성 완료 · 생산 시작",
    nextScreen: "생산관리 → 설비장입현황",
  },
  {
    screen: "생산관리 → 설비장입현황",
    taskScope: "장입 대기 / 장입중",
    completeWhen: "장입 완료",
    nextScreen: "생산관리 → 생산일보",
  },
  {
    screen: "생산관리 → 생산일보",
    taskScope: "생산 진행 / 생산 완료",
    completeWhen: "생산 완료",
    nextScreen: "품질관리 → 검사관리",
  },
  {
    screen: "품질관리 → 검사관리",
    taskScope: "검사 대기 (생산 완료)",
    completeWhen: "검사 완료",
    nextScreen: "품질관리 → 성적서관리",
  },
  {
    screen: "품질관리 → 성적서관리",
    taskScope: "성적서 미발행",
    completeWhen: "성적서 발행",
    nextScreen: "운영관리 → 출고등록",
  },
  {
    screen: "운영관리 → 출고등록",
    taskScope: "출고 대기",
    completeWhen: "출고 완료",
    nextScreen: "출고완료 탭",
  },
];

/** LOT Lifecycle 접근 (Sidebar ❌) */
export const TITAN_V20_LOT_LIFECYCLE_ACCESS = {
  sidebar: false,
  blueprintTarget: true,
  reviewOrder: 10,
  entryPoints: ["Traceability QR Scan → LOT Lifecycle", "LOT 선택 → LOT Lifecycle"],
};

/** Blueprint Review 순서 (V2.0 Final) */
export const TITAN_V20_BLUEPRINT_REVIEW_ORDER = [
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

/** 업무 자동 이동 — Workflow Engine (사용자 상태 변경 ❌) */
export const TITAN_V20_AUTO_TRANSITION = {
  engine: "TitanWorkflowEngine",
  userManualStatusChange: false,
  flow: [
    "입고등록 완료 → 생산계획",
    "LOT 생성 → 설비장입",
    "생산일보 → 검사관리",
    "검사관리 → 성적서관리",
    "성적서관리 → 출고등록",
    "출고등록 → 출고완료",
  ],
};

/** UI 원칙 — V2.0 */
export const TITAN_V20_UI_PRINCIPLES = [
  "모든 Launcher = 동일 디자인 (TitanLauncherHubPage · titan-hub-page.css)",
  "모든 리스트 = 동일 Layout (TitanDataTable · list-centered)",
  "출력관리 = 운영관리 · 생산관리 동일 UI (sharedLayout: operationsProductionPrint)",
  "Sidebar = Launcher Hub만 · 하위 업무는 Launcher 카드",
];

/** Blueprint Sprint 연계 — V1.7 Blueprint 개정 필요 */
export const TITAN_V20_BLUEPRINT_IMPACT = {
  blueprintArchitectureFinalApproved: true,
  supersedesMenuWorkflow: "V1.7 List 중심 초안",
  requiresBlueprintRevision: false,
  reviewPhase: "④ 생산관리 Blueprint Review (HOME·설비·운영 🔒 Freeze)",
  implementationGate: "Blueprint PM 승인 후 구현",
  sections: "11항목 (Task Scope + Exit Condition)",
  masterStore: "Company Store 신규 · Worker → 기준정보",
  frozenUntilBlueprint: [
    "Sidebar",
    "Router",
    "Store (companyStore 포함)",
    "Screen list filters",
    "Workflow auto-transition UI",
    "CSS",
  ],
};

/** HOME Blueprint Review — PM 확인 항목 (Workspace First · 2026-07-07) */
export const TITAN_V20_HOME_BLUEPRINT_REVIEW = {
  reviewId: "home",
  reviewOrder: 1,
  status: "frozen",
  frozenDate: "2026-07-07",
  freezePolicy: "구조 변경 ❌ · 개선 = Review 문서(Update)만",
  reviewMethod: "Screen Review (항목별 승인 ❌ · 화면 전체 검토 → PM 승인 → Freeze)",
  pmReviewDate: "2026-07-07",
  pmFinalReviewDate: "2026-07-07",
  pmReviewResult: {
    purpose: "approved",
    role: "approved",
    taskScope: "approved",
    exitCondition: "approved",
    layout: "approved",
    data: "approved",
    workflow: "approved",
    automation: "approved",
    connectedScreens: "approved",
    output: "approved",
    freeze: "approved-frozen",
  },
  supplementsRequired: [
    "Task Scope — HOME은 요약 정보만 표시 (전체 리스트 ❌)",
    "Exit Condition — Launcher 정책 적용 · Legacy Route 제거 계획 명시",
    "Data — Session(getSessionProductionRecords) Legacy → TitanDataEngine/WorkflowEngine 전환 계획",
    "Connected Screens — 제품현황 연결은 ② 설비현황 Blueprint에서 최종 확정",
  ],
  reviewSequence: [
    "purpose",
    "role",
    "taskScope",
    "exitCondition",
    "layout",
    "data",
    "workflow",
    "automation",
    "connectedScreens",
    "output",
    "completionCriteria",
  ],
  rolePolicy: {
    isWorkScreen: false,
    isDashboard: true,
    workspaceMetaphor: "회사 전체 상황 — 통합 Dashboard",
    forbiddenOnHome: [
      "입고등록",
      "출고등록",
      "검사등록",
      "성적서 발행",
      "LOT/입고/출고/검사 전체 리스트",
    ],
  },
  displayItems: [
    "오늘 입고",
    "오늘 출고",
    "생산 진행",
    "검사 대기",
    "성적서 미발행",
    "설비 가동률",
    "공지사항",
    "오늘 일정",
    "최근 알림",
    "실시간 진행현황",
  ],
  clickPolicy: {
    rule: "모든 카드·위젯 = Launcher 역할만 (해당 업무 Workspace로 이동)",
    examples: [
      { summary: "검사 대기 15건", target: "품질관리 > 검사관리" },
      { summary: "오늘 입고 8건", target: "운영관리 > 입고등록" },
      { summary: "설비 가동률", target: "설비현황" },
    ],
    forbidden: ["HOME에서 업무 수행", "HOME에서 상세 CRUD"],
  },
  tenSecondGoal: [
    "오늘 무엇을 해야 하는지",
    "공장이 어떻게 돌아가는지",
    "문제가 있는지",
  ],
  perSectionApproval: "Screen Review — 화면 전체 검토 → PM 승인 → Freeze",
};

/** ② 설비현황 Blueprint Review — LOT 중심 Control Room (PM 조건부 승인 · 2026-07-07) */
export const TITAN_V20_EQUIPMENT_MONITOR_BLUEPRINT_REVIEW = {
  reviewId: "equipmentMonitor",
  reviewOrder: 2,
  status: "frozen",
  frozenDate: "2026-07-07",
  freezePolicy: "구조 변경 ❌ · 개선 = Review 문서(Update)만",
  pmFinalReviewDate: "2026-07-07",
  pmReviewResult: {
    decision: "approved-frozen",
    allSections: "approved",
  },
  nextStep: "Official Freeze complete",
};

/** ③ 운영관리 Blueprint — Official Freeze (2026-07-07) */
export const TITAN_V20_OPERATIONS_MANAGEMENT_BLUEPRINT_REVIEW = {
  reviewId: "operationsManagement",
  reviewOrder: 3,
  status: "frozen",
  frozenDate: "2026-07-07",
  freezePolicy: "구조 변경 ❌ · 개선 = Review 문서(Update)만",
  pmFinalReviewDate: "2026-07-07",
  pmReviewResult: { decision: "approved-frozen", allSections: "approved" },
  officialWorkspaceTypes: ["task", "history", "print", "journal"],
  nextStep: "Official Freeze complete",
};

/** ④ 생산관리 Blueprint — Official Freeze (2026-07-07) */
export const TITAN_V20_PRODUCTION_MANAGEMENT_BLUEPRINT_REVIEW = {
  reviewId: "productionManagement",
  reviewOrder: 4,
  status: "frozen",
  frozenDate: "2026-07-07",
  freezePolicy: "구조 변경 ❌ · 개선 = Review 문서(Update)만",
  reviewMethod: "Screen Review",
  reviewDate: "2026-07-07",
  finalReviewDate: "2026-07-07",
  workspaceRole: "LOT Engine — TITAN 핵심 Production Workspace",
  lotCentricPrinciple: {
    official: "생산관리 = 설비 관리 ❌ · LOT Workflow 관리 ✅",
    designCenter: "LOT",
    summary: "LOT 생명주기 운영 — 설비는 LOT 수행 수단",
  },
  htStages: TITAN_V20_PRODUCTION_HT_STAGES,
  launcherCards: ["생산계획", "설비장입현황", "생산일보", "생산실적관리", "출력관리"],
  workspaceTypes: {
    task: ["생산계획", "설비장입현황", "생산일보"],
    analytics: ["생산실적관리"],
    print: ["출력관리"],
  },
  pmReviewResult: {
    decision: "approved-frozen",
    allSections: "approved",
    frozen: true,
  },
  dataLegacyPlan: "Session Legacy → TitanDataEngine/WorkflowEngine · Blueprint only · UI 불변",
  nextStep: "Official Freeze complete — ⑤ 품질관리 Blueprint Review",
};

/**
 * 품질관리 검사 종류(Type) · 상태(Status) — PM 2026-07-07
 * Type과 Status 분리 · 조합 필터
 */
export const TITAN_V20_QUALITY_INSPECTION_TYPES = {
  MASS: { key: "mass", label: "양산검사" },
  DEVELOPMENT: { key: "development", label: "개발검사" },
  OTHER: { key: "other", label: "기타검사" },
  policy: "검사 종류 = Tab/필터 차원 (LOT 업무 분류)",
};

export const TITAN_V20_QUALITY_INSPECTION_STATUS = {
  INSPECTION_WAIT: {
    key: "INSPECTION_WAIT",
    label: "검사 대기",
    screens: ["검사관리"],
    entryFrom: "생산완료 (HT_COMPLETE)",
  },
  INSPECTION_IN_PROGRESS: {
    key: "INSPECTION_IN_PROGRESS",
    label: "검사 진행",
    screens: ["검사관리"],
  },
  INSPECTION_DONE: {
    key: "INSPECTION_DONE",
    label: "검사 완료",
    screens: ["검사관리(완료)", "성적서관리(입력)"],
    exitTo: "성적서관리",
  },
  CERT_WAIT: {
    key: "CERT_WAIT",
    label: "성적서 대기",
    screens: ["성적서관리"],
  },
  CERT_DONE: {
    key: "CERT_DONE",
    label: "성적서 완료",
    screens: ["성적서관리(완료)"],
    exitTo: "운영관리 → 출고등록",
  },
  chain: ["검사 대기", "검사 진행", "검사 완료", "성적서 대기", "성적서 완료"],
  policy: "Status = Workflow 차원 · Engine 자동 전환 · Type × Status 조합 조회",
  examples: [
    "양산검사 + 검사 대기",
    "개발검사 + 검사 진행",
    "기타검사 + 검사 완료",
  ],
};

/** ⑤ 품질관리 Blueprint — Official Freeze (2026-07-07) */
export const TITAN_V20_QUALITY_MANAGEMENT_BLUEPRINT_REVIEW = {
  reviewId: "qualityManagement",
  reviewOrder: 5,
  status: "frozen",
  frozenDate: "2026-07-07",
  freezePolicy: "구조 변경 ❌ · 개선 = Review 문서(Update)만",
  reviewMethod: "Screen Review",
  reviewDate: "2026-07-07",
  finalReviewDate: "2026-07-07",
  workspaceRole: "LOT Quality Validation Engine",
  qualityValidationEngine: {
    official: "LOT Quality Validation Engine",
    chain: "LOT → 생산완료 → 품질검증 → 성적서 → 출고",
    siblingEngines: {
      operations: "업무 시작 Workspace",
      production: "LOT Engine",
      quality: "LOT Quality Validation Engine",
    },
  },
  lotCentricPrinciple: {
    official: "품질관리 = 검사 화면 ❌ · LOT Lifecycle 품질 검증 ✅",
    designCenter: "LOT",
    summary: "LOT 검증·인증 · Type·Status·Result 분리",
  },
  inspectionTypes: TITAN_V20_QUALITY_INSPECTION_TYPES,
  inspectionStatus: TITAN_V20_QUALITY_INSPECTION_STATUS,
  inspectionResult: TITAN_V20_QUALITY_INSPECTION_RESULT,
  launcherCards: ["검사관리", "성적서관리", "불량이력관리", "문서관리", "품질업무일지"],
  workspaceTypes: {
    task: ["검사관리", "성적서관리"],
    history: ["불량이력관리"],
    document: ["문서관리"],
    journal: ["품질업무일지"],
  },
  pmReviewResult: {
    decision: "approved-frozen",
    allSections: "approved",
    frozen: true,
  },
  nextStep: "Official Freeze complete — ⑥ 통계관리 Blueprint Review",
};

/**
 * 통계관리 LOT Traceability Analytics — PM 2026-07-07 (Screen Review 강화)
 * 설비/업체 통계 + LOT 중심 분석 (통계관리 핵심)
 */
export const TITAN_V20_STATISTICS_LOT_TRACEABILITY_ANALYTICS = {
  official: "LOT Traceability Analytics — TITAN LOT 철학 핵심",
  coreMetrics: {
    lotLeadTime: {
      key: "lotLeadTime",
      label: "LOT 처리 시간",
      meaning: "입고 → 출고 전체 리드타임",
    },
    lotProcessDuration: {
      key: "lotProcessDuration",
      label: "LOT 공정 소요 시간",
      meaning: "단계별(입고·생산·검사·성적서·출고) 소요",
    },
    lotBottleneck: {
      key: "lotBottleneck",
      label: "LOT 병목 구간",
      meaning: "지연 단계 식별",
    },
    lotDefectRate: {
      key: "lotDefectRate",
      label: "LOT 불량률",
      meaning: "LOT 기준 불합격(FAIL) 비율",
    },
  },
  enhancedMetrics: {
    lotAvgLeadTime: { key: "lotAvgLeadTime", label: "LOT 평균 Lead Time" },
    lotEquipmentWaitTime: { key: "lotEquipmentWaitTime", label: "LOT 설비 대기시간" },
    lotInspectionWaitTime: { key: "lotInspectionWaitTime", label: "LOT 검사 대기시간" },
    lotShipmentWaitTime: { key: "lotShipmentWaitTime", label: "LOT 출고 대기시간" },
    lotReworkCount: { key: "lotReworkCount", label: "LOT 재작업(REWORK) 횟수" },
  },
  purpose: "병목 분석 — 대기시간·REWORK 추적으로 원인 규명",
  dataSource: "timelineStore (LOT Timeline) · TitanWorkflowEngine 집계",
  policy: "조회 전용 · Analytics Workspace · Read Only",
};

/**
 * 통계관리 Dashboard Drill Down — PM 2026-07-07
 * KPI 클릭 → 관련 Workspace/LOT Lifecycle 이동
 */
export const TITAN_V20_STATISTICS_DRILL_DOWN = {
  official: "통계 = 숫자 표시 ❌ · 원인 즉시 확인 ✅",
  map: [
    { kpi: "불량률", target: "품질관리 → 불량이력관리" },
    { kpi: "설비 가동률", target: "설비현황" },
    { kpi: "LOT Lead Time", target: "LOT Lifecycle" },
    { kpi: "금일 생산", target: "생산관리" },
    { kpi: "금일 출고", target: "운영관리 → 출고등록" },
    { kpi: "금일 검사", target: "품질관리 → 검사관리" },
  ],
  policy: "KPI 클릭 → Drill Down · Analytics Read Only (데이터 수정 ❌)",
};

/** ⑥ 통계관리 Blueprint Review — Analytics Workspace (PM 2026-07-07) */
export const TITAN_V20_STATISTICS_BLUEPRINT_REVIEW = {
  reviewId: "statistics",
  reviewOrder: 6,
  status: "frozen",
  frozenDate: "2026-07-07",
  freezePolicy: "구조 변경 ❌ · 개선 = Review 문서(Update)만",
  reviewMethod: "Screen Review",
  reviewDate: "2026-07-07",
  finalReviewDate: "2026-07-07",
  workspaceRole: "경영 의사결정 지원 Analytics Workspace",
  analyticsPrinciple: {
    official: "업무 화면 ❌ · 경영 분석 화면 ✅",
    summary: "LOT Workflow를 분석하는 Analytics Engine · 조회 전용",
    role: "경영 현황 · 생산성 · 품질 · 영업 실적 분석",
  },
  readOnlyPolicy: {
    official: "Analytics = Read Only",
    rule: "등록/수정/삭제 ❌ · 데이터 수정 절대 ❌",
    dataFlow: "TitanDataEngine → TitanWorkflowEngine → Timeline Store → Analytics",
  },
  lotTraceabilityAnalytics: TITAN_V20_STATISTICS_LOT_TRACEABILITY_ANALYTICS,
  drillDown: TITAN_V20_STATISTICS_DRILL_DOWN,
  kpiPrinciple: {
    official: "상단 KPI = 가장 먼저 보는 지표",
    items: ["금일 생산", "금일 출고", "금일 검사", "LOT 평균 리드타임", "불량률", "설비 가동률"],
  },
  analyticsTabs: {
    전체통계: ["금일 입고", "금일 출고", "생산 완료", "검사 완료", "성적서 발행", "불량률", "설비 가동률"],
    생산통계: ["설비별", "업체별", "품명별", "재질별", "LOT별(필수)"],
    품질통계: ["PASS", "FAIL", "HOLD", "REWORK", "검사 종류", "LOT별 불량률"],
    영업통계: ["고객사별", "매출", "입고", "출고", "거래 건수", "납기 준수율"],
  },
  launcherCards: ["전체통계", "생산통계", "품질통계", "영업통계"],
  workspaceType: "analyticsWorkspace",
  pmReviewResult: {
    decision: "approved-frozen",
    allSections: "approved",
    supplementsApplied: [
      "Read Only 정책",
      "Dashboard Drill Down (KPI → Workspace)",
      "LOT Analytics 강화 (Lead Time·대기시간·REWORK)",
    ],
    frozen: true,
  },
  nextStep: "Official Freeze complete — ⑦ 기준정보관리 Blueprint Review",
};

/**
 * 기준정보관리 Master Store 원칙 — PM 2026-07-07
 * 각 Master = 단일 진실 공급원(SSoT) · 중복 관리 ❌
 */
export const TITAN_V20_MASTER_STORE_SSOT_PRINCIPLE = {
  official: "각 Master = SSoT · 다른 Workspace 중복 관리 ❌",
  stores: [
    { store: "Customer Store", manages: "거래처" },
    { store: "Product Store", manages: "제품·품번·열처리 Spec·도면·Revision" },
    { store: "Material Store", manages: "재질" },
    { store: "Process Store", manages: "공정" },
    { store: "Equipment Store", manages: "설비·Equipment QR" },
    { store: "Worker Store", manages: "작업자 (Master Data)" },
    { store: "Company Store", manages: "회사정보 (회사정보 화면)" },
  ],
  singleSourceExamples: [
    "제품명 수정 → Product Store만 변경 → 모든 화면 자동 반영",
    "설비명 수정 → Equipment Store만 변경",
    "작업자 정보 수정 → Worker Store만 변경",
  ],
  referencedBy: ["운영관리", "생산관리", "품질관리", "통계관리", "LOT Lifecycle"],
  rule: "Master 수정은 해당 Store에서만 · 다른 Workspace는 참조만",
  readWritePolicy: "Master Store = 유일한 읽기/쓰기 공간 · 타 Workspace Read Only",
};

/** ⑦ 기준정보관리 보완 — Master Version / Audit / Equipment QR / Product Master (PM 2026-07-07) */
export const TITAN_V20_MASTER_DATA_SUPPLEMENTS = {
  masterVersion: {
    official: "각 Master 변경 버전 관리 (v1→v2→v3)",
    example: "Product Master v1 → v2 → v3",
    implementation: "Blueprint 정의만 · 구현 나중",
  },
  masterAudit: {
    official: "모든 Master 변경 이력 기록",
    fields: ["수정자", "수정일", "변경 내용"],
    implementation: "Blueprint 정의만 · 구현 나중",
  },
  equipmentQr: {
    official: "설비관리 = Equipment QR 생성",
    flow: "설비등록 → Equipment QR 생성 → Control Room → 생산관리",
  },
  productMaster: {
    official: "제품관리 확장 항목 (단순 품번 ❌)",
    fields: ["품번", "품명", "고객사", "재질", "열처리 Spec", "도면번호", "Revision"],
    usage: "향후 성적서 자동 생성 시 그대로 사용",
  },
  workerMaster: {
    official: "작업자 = Master Data",
    referencedBy: ["생산일보", "검사관리", "LOT 로그", "권한"],
  },
};

/** ⑦ 기준정보관리 Blueprint Review — Master Data Workspace (PM 2026-07-07) */
export const TITAN_V20_MASTER_DATA_BLUEPRINT_REVIEW = {
  reviewId: "masterData",
  reviewOrder: 7,
  status: "frozen",
  frozenDate: "2026-07-07",
  freezePolicy: "구조 변경 ❌ · 개선 = Review 문서(Update)만",
  reviewMethod: "Screen Review",
  reviewDate: "2026-07-07",
  finalReviewDate: "2026-07-07",
  workspaceRole: "Master Data Workspace — 전 Workspace 참조 SSoT",
  masterDataPrinciple: {
    official: "모든 Workspace가 참조하는 Master 단일 관리 영역",
    summary: "생산·품질 업무 수행 ❌ · Master SSoT 관리 ✅",
    readWriteRule: "Master Store = 유일한 R/W 공간 · 타 Workspace Read Only",
  },
  masterStoreSSoT: TITAN_V20_MASTER_STORE_SSOT_PRINCIPLE,
  supplements: TITAN_V20_MASTER_DATA_SUPPLEMENTS,
  launcherCards: ["거래처관리", "제품관리", "재질관리", "공정관리", "설비관리", "작업자관리"],
  pmReviewResult: {
    decision: "approved-frozen",
    allSections: "approved",
    supplementsApplied: [
      "Master Version",
      "Master Audit",
      "Equipment QR",
      "Product Master 확장",
      "Worker = Master Data",
      "Data 정책 (Read Only)",
    ],
    frozen: true,
  },
  freezeCriteria: ["Master Store", "SSoT", "Master Version", "Master Audit", "Equipment QR", "Worker Master"],
  nextStep: "Official Freeze complete — ⑧ 환경설정 Blueprint Review",
};

/** ⑧ 환경설정 3 Profile — System / Permission / Environment (PM 2026-07-07) */
export const TITAN_V20_ENVIRONMENT_PROFILES = {
  systemProfile: {
    official: "System Profile — 시스템 기본 동작",
    items: ["회사 기본 설정", "시스템 옵션", "출력 옵션", "QR 옵션"],
  },
  permissionProfile: {
    official: "Permission Profile — 권한 프로파일",
    items: ["관리자 권한", "일반 사용자 권한", "읽기/쓰기 권한"],
  },
  environmentProfile: {
    official: "Environment Profile — 실행 환경",
    items: ["개발", "테스트", "운영"],
  },
};

/** ⑧ 환경설정 보완 — Role Profile / Feature Toggle / QR Policy (PM 2026-07-07) */
export const TITAN_V20_ENVIRONMENT_SUPPLEMENTS = {
  roleProfile: {
    official: "권한 = Role 기반 관리",
    roles: ["Administrator", "Quality", "Production", "Sales", "Viewer"],
    implementation: "Blueprint 정의만 · 구현 나중",
  },
  featureToggle: {
    official: "Feature Toggle — 기능 확장 정책",
    items: ["Module ON/OFF (회계·영업)", "Print ON/OFF", "Workflow ON/OFF"],
  },
  qrPolicy: {
    official: "QR 등록 = QR 발급 정책 (생성 정책만)",
    types: ["Master QR", "LOT QR", "Traceability QR"],
    rule: "정책만 관리 · 실제 생성은 Workflow",
  },
  systemPolicy: {
    official: "System Policy — 시스템 전역 정책",
    items: ["Feature Toggle", "Module Enable/Disable", "Print Policy", "Workflow Policy"],
  },
};

/** ⑧ 환경설정 Blueprint Review — System Administration Workspace (PM 2026-07-07) */
export const TITAN_V20_ENVIRONMENT_BLUEPRINT_REVIEW = {
  reviewId: "environment",
  reviewOrder: 8,
  status: "frozen",
  frozenDate: "2026-07-07",
  freezePolicy: "구조 변경 ❌ · 개선 = Review 문서(Update)만",
  reviewMethod: "Screen Review",
  reviewDate: "2026-07-07",
  finalReviewDate: "2026-07-07",
  workspaceRole: "System Administration Workspace — 시스템 동작 방식 관리",
  systemAdminPrinciple: {
    official: "설정 변경으로 시스템 전체 동작 제어",
    summary: "운영/생산/품질 데이터 직접 수정 ❌ · 설정 전용",
    dataPolicy: "System Setting → Engine → Workspace (설정만 변경)",
  },
  profiles: TITAN_V20_ENVIRONMENT_PROFILES,
  supplements: TITAN_V20_ENVIRONMENT_SUPPLEMENTS,
  launcherCards: ["관리자", "시스템", "개발자", "QR 등록"],
  pmReviewResult: {
    decision: "approved-frozen",
    allSections: "approved",
    supplementsApplied: [
      "Role Profile",
      "Feature Toggle",
      "QR Policy",
      "System Policy",
    ],
    frozen: true,
  },
  freezeCriteria: [
    "System Administration",
    "System Profile",
    "Permission Profile",
    "Role Profile",
    "Environment Profile",
    "QR Policy",
    "Feature Toggle",
  ],
  nextStep: "Official Freeze complete — ⑨ 회사정보 Blueprint Review",
};

/** ⑨ 회사정보 Company Master 구조 (PM 2026-07-07) */
export const TITAN_V20_COMPANY_MASTER_STRUCTURE = {
  companyMaster: {
    official: "Company Master — 회사 기본 정보",
    fields: ["회사명", "대표자", "사업자등록번호", "주소", "연락처", "이메일", "홈페이지"],
  },
  branding: {
    official: "Branding — CI · Logo · 직인 · 서명",
    items: ["CI", "Logo", "직인", "서명 이미지"],
  },
  certification: {
    official: "Certification — 인증 정보",
    items: ["ISO 인증", "고객 인증", "기타 인증"],
  },
  referencedByOutputs: [
    "성적서",
    "검사리포트",
    "거래명세서",
    "작업지시서",
    "생산일보",
    "입출고리스트",
  ],
  rule: "Company Store = 단일 관리 영역 · 모든 출력물은 참조만 (Read Only)",
};

/** ⑨ 회사정보 보완 — Brand Theme / Certification 확장 / Business Location (PM 2026-07-07) */
export const TITAN_V20_COMPANY_INFO_SUPPLEMENTS = {
  brandTheme: {
    official: "Brand Theme — 출력물 테마 (Form Engine 연동)",
    items: ["Primary Color", "Secondary Color", "Font", "Report Theme"],
    implementation: "Blueprint 정의만 · 구현 나중",
  },
  certificationExtended: {
    official: "Certification 확장 — 유효기간·상태",
    fields: ["인증명", "인증번호", "발급기관", "유효기간", "상태"],
    roadmap: "인증 만료 알림 연계",
  },
  businessLocation: {
    official: "Business Location — 다중 사업장",
    types: ["본사", "공장", "창고"],
    fields: ["사업장명", "주소", "연락처"],
  },
};

/** ⑨ 회사정보 Blueprint Review — Company Master Workspace (PM 2026-07-07) */
export const TITAN_V20_COMPANY_INFO_BLUEPRINT_REVIEW = {
  reviewId: "companyInfo",
  reviewOrder: 9,
  status: "frozen",
  frozenDate: "2026-07-07",
  freezePolicy: "구조 변경 ❌ · 개선 = Review 문서(Update)만",
  reviewMethod: "Screen Review",
  reviewDate: "2026-07-07",
  finalReviewDate: "2026-07-07",
  workspaceRole: "Company Master Workspace — 출력물 공통 회사 Master",
  companyMasterPrinciple: {
    official: "Company Store SSoT — 출력물·시스템 공통 회사 정보 단일 관리",
    summary: "Form Engine 연동 · 모든 출력물은 참조만 (Read Only)",
  },
  companyMasterStructure: TITAN_V20_COMPANY_MASTER_STRUCTURE,
  supplements: TITAN_V20_COMPANY_INFO_SUPPLEMENTS,
  launcherCards: ["회사 기본정보", "CI / Logo 관리", "사업장 정보", "인증 정보"],
  pmReviewResult: {
    decision: "approved-frozen",
    allSections: "approved",
    supplementsApplied: ["Brand Theme", "Certification 확장", "Business Location"],
    frozen: true,
  },
  freezeCriteria: [
    "Company Master",
    "Branding",
    "Business Location",
    "Certification",
    "Company Store",
    "SSoT",
  ],
  nextStep: "Official Freeze complete — ⑩ LOT Lifecycle (Final Blueprint) Review",
};

/** ⑩ LOT Lifecycle Final 보완 — LOT Health / LOT KPI / Related LOT (PM 2026-07-07) */
export const TITAN_V20_LOT_LIFECYCLE_SUPPLEMENTS = {
  lotHealth: {
    official: "LOT 건강 상태 — 하나의 상태값으로 표현",
    values: ["정상", "주의", "지연", "완료"],
  },
  lotKpi: {
    official: "LOT Lifecycle 상단 KPI",
    items: ["현재 공정", "진행률", "총 소요시간", "현재 작업자", "현재 설비", "품질 상태"],
  },
  relatedLot: {
    official: "같은 작업에서 함께 처리된 LOT",
    types: ["같이 장입한 LOT", "동일 작업 LOT", "동일 고객 LOT"],
    implementation: "Blueprint 정의만 · 구현 나중",
  },
  timelineOfficial: {
    official: "Engine 자동 생성 · 수정 ❌",
    stages: ["입고", "생산계획", "장입", "생산", "검사", "성적서", "출고"],
  },
  qrPolicy: {
    official: "Traceability QR 최종 목적지 · 1 LOT = 1 QR",
    rule: "QR payload에 Document No. 저장 ❌",
  },
  dataPolicy: {
    official: "TitanDataEngine → TitanWorkflowEngine → Timeline Store → LOT Lifecycle",
  },
};

/** Project TITAN V2.0 Phase 1 — Architecture + Blueprint 공식 완료 (PM 2026-07-07) */
export const TITAN_V20_PHASE1_COMPLETE = {
  status: "complete",
  completeDate: "2026-07-07",
  label: "Architecture + Blueprint Phase",
  frozenBlueprints: 10,
  corePrinciples: [
    "LOT 중심 시스템",
    "Workflow 중심 시스템",
    "Workspace 중심 UI",
    "SSoT (Master/Company Store)",
    "Control Room와 Workspace 역할 분리",
    "1 LOT = 1 Traceability QR",
    "Architecture → Blueprint → PM 승인 → Freeze → 구현 → QA → Freeze",
  ],
  nextPhase: "Phase 2 — Implementation (구현)",
  roadmap: [
    "Phase 1 — Architecture + Blueprint ✅",
    "Phase 2 — Implementation (구현)",
    "Phase 3 — Inspection Report Engine",
    "Phase 4 — Document / Form Engine",
    "Phase 5 — QR / Mobile / AI",
  ],
};

/** ⑩ LOT Lifecycle Blueprint Review — 최종 Blueprint · 9 Workspace 통합 (PM 2026-07-07) */
export const TITAN_V20_LOT_LIFECYCLE_BLUEPRINT_REVIEW = {
  reviewId: "lotLifecycle",
  reviewOrder: 10,
  status: "frozen",
  frozenDate: "2026-07-07",
  freezePolicy: "구조 변경 ❌ · 개선 = Review 문서(Update)만",
  isFinalBlueprint: true,
  phase1Complete: true,
  reviewMethod: "Final Blueprint Review",
  reviewDate: "2026-07-07",
  finalReviewDate: "2026-07-07",
  workspaceRole: "TITAN 전체 Workflow 완성본 — LOT 중심 통합 Traceability Workspace",
  finalBlueprintPrinciple: {
    official: "지금까지 Freeze한 9 Workspace를 하나의 LOT 중심 시스템으로 연결",
    connects: [
      "HOME",
      "설비현황",
      "운영관리",
      "생산관리",
      "품질관리",
      "통계관리",
      "기준정보관리",
      "환경설정",
      "회사정보",
    ],
    integratedPrinciples: [
      "LOT 중심",
      "Workflow 중심",
      "Workspace 중심",
      "SSoT",
      "QR Traceability",
    ],
  },
  officialFlow: [
    "HOME",
    "설비현황(Control Room)",
    "운영관리",
    "생산관리",
    "품질관리",
    "출고",
    "LOT Lifecycle",
  ],
  screenComposition: {
    lotBasics: [
      "관리번호",
      "LOT 번호",
      "제품",
      "고객사",
      "현재공정",
      "현재설비",
      "현재상태",
      "진행률",
    ],
    timeline: "Timeline (Traceability)",
    histories: ["운영 이력", "생산 이력", "품질 이력", "출고 이력"],
    relatedDocuments: [
      "입고리스트",
      "작업지시서",
      "생산일보",
      "검사리포트",
      "성적서",
      "거래명세서",
    ],
    footer: ["QR", "PDF", "Document No."],
  },
  role: [
    "하나의 LOT 전체 이력 조회",
    "QR Scan 최종 도착 화면",
    "Timeline 기반 Traceability",
    "관련 문서 통합 조회",
    "현재 상태·진행률 확인",
    "경영/품질/생산 공통 LOT 소통",
  ],
  entry: "Traceability QR Scan (Sidebar ❌)",
  supplements: TITAN_V20_LOT_LIFECYCLE_SUPPLEMENTS,
  pmReviewResult: {
    decision: "approved-frozen",
    allSections: "approved",
    supplementsApplied: ["LOT Health", "LOT KPI", "Related LOT", "Timeline 공식", "QR Policy"],
    frozen: true,
    phase1Complete: true,
  },
  freezeCriteria: [
    "LOT 중심",
    "Workflow 중심",
    "Workspace 연결",
    "Timeline",
    "QR Traceability",
    "SSoT",
    "Engine 기반",
  ],
  nextStep: "Phase 1 Complete — Phase 2 Implementation (구현)",
};

/** @returns {object} PM Review용 요약 */
export function getTitanV20MenuWorkflowSummary() {
  return {
    version: TITAN_V20_MENU_WORKFLOW_VERSION,
    lockDate: TITAN_V20_MENU_WORKFLOW_LOCK_DATE,
    scope: TITAN_V20_ARCHITECTURE_SCOPE_LABEL,
    implementationStatus: TITAN_V20_IMPLEMENTATION_STATUS,
    philosophy: TITAN_V20_PHILOSOPHY.summaryKo,
    sidebarCount: TITAN_V20_SIDEBAR.length,
    sidebarOrder: TITAN_V20_SIDEBAR_ORDER,
    workflowSteps: TITAN_V20_OFFICIAL_WORKFLOW.length,
    blueprintImpact: TITAN_V20_BLUEPRINT_IMPACT.reviewPhase,
    blueprintReviewOrder: TITAN_V20_BLUEPRINT_REVIEW_ORDER,
    masterStores: TITAN_V20_MASTER_STORE_STRUCTURE.stores.map((s) => s.id),
    companyStore: TITAN_V20_COMPANY_STORE.storeId,
    workspaceFirst: TITAN_V20_WORKSPACE_FIRST_PRINCIPLE.summaryKo,
    homeReviewStatus: TITAN_V20_HOME_BLUEPRINT_REVIEW.status,
    equipmentReviewStatus: TITAN_V20_EQUIPMENT_MONITOR_BLUEPRINT_REVIEW.status,
    operationsReviewStatus: TITAN_V20_OPERATIONS_MANAGEMENT_BLUEPRINT_REVIEW.status,
    productionReviewStatus: TITAN_V20_PRODUCTION_MANAGEMENT_BLUEPRINT_REVIEW.status,
    qualityReviewStatus: TITAN_V20_QUALITY_MANAGEMENT_BLUEPRINT_REVIEW.status,
    statisticsReviewStatus: TITAN_V20_STATISTICS_BLUEPRINT_REVIEW.status,
    masterDataReviewStatus: TITAN_V20_MASTER_DATA_BLUEPRINT_REVIEW.status,
    environmentReviewStatus: TITAN_V20_ENVIRONMENT_BLUEPRINT_REVIEW.status,
    companyInfoReviewStatus: TITAN_V20_COMPANY_INFO_BLUEPRINT_REVIEW.status,
    lotLifecycleReviewStatus: TITAN_V20_LOT_LIFECYCLE_BLUEPRINT_REVIEW.status,
    phase1Status: TITAN_V20_PHASE1_COMPLETE.status,
    nextPhase: TITAN_V20_PHASE1_COMPLETE.nextPhase,
    docPath: "docs/TITAN_V20_MENU_WORKFLOW_ARCHITECTURE.md",
  };
}
