/**
 * Sprint 10 Phase 2/3 — QR Engine Architecture (SSoT)
 */
export const QR_ENGINE_BASE_PATH = "/qr";

export const QR_ENGINE_MENU_SHORTCUT_ROUTES = Object.freeze({
  inbound: "/mobile/inbound",
  shipment: "/mobile/shipment",
  inspection: "/mobile/inspection",
  productionDaily: "/mobile/production/daily-report",
  productionPlan: "/mobile/production/plan",
  shot: "/mobile/shot",
  equipmentInspection: "/mobile/equipment/inspection",
  document: "/mobile/document",
  inventory: "/mobile/inventory",
});

export const QR_ENGINE_MENU_SHORTCUT_ITEMS = Object.freeze([
  { id: "inbound", labelKo: "입고등록", route: QR_ENGINE_MENU_SHORTCUT_ROUTES.inbound },
  { id: "shipment", labelKo: "출고등록", route: QR_ENGINE_MENU_SHORTCUT_ROUTES.shipment },
  { id: "inspection", labelKo: "검사등록", route: QR_ENGINE_MENU_SHORTCUT_ROUTES.inspection },
  { id: "productionDaily", labelKo: "생산일보", route: QR_ENGINE_MENU_SHORTCUT_ROUTES.productionDaily },
  { id: "productionPlan", labelKo: "생산계획", route: QR_ENGINE_MENU_SHORTCUT_ROUTES.productionPlan },
  { id: "shot", labelKo: "쇼트 작업현황", route: QR_ENGINE_MENU_SHORTCUT_ROUTES.shot },
  { id: "equipmentInspection", labelKo: "설비점검", route: QR_ENGINE_MENU_SHORTCUT_ROUTES.equipmentInspection },
  { id: "document", labelKo: "문서관리", route: QR_ENGINE_MENU_SHORTCUT_ROUTES.document },
  { id: "inventory", labelKo: "재고조회", route: QR_ENGINE_MENU_SHORTCUT_ROUTES.inventory },
]);

export const QR_ENGINE_ROUTES = {
  dashboard: `${QR_ENGINE_BASE_PATH}/dashboard`,
  generator: `${QR_ENGINE_BASE_PATH}/generator`,
  registry: `${QR_ENGINE_BASE_PATH}/registry`,
  scan: `${QR_ENGINE_BASE_PATH}/scan`,
  testMode: `${QR_ENGINE_BASE_PATH}/test-mode`,
  diagnostics: `${QR_ENGINE_BASE_PATH}/diagnostics`,
  equipmentWork: (equipmentId) =>
    `${QR_ENGINE_BASE_PATH}/equipment/${encodeURIComponent(String(equipmentId ?? "").trim())}`,
  lotLifecycle: (lotNo) =>
    `/quality/lot-lifecycle?lot=${encodeURIComponent(String(lotNo ?? "").trim())}`,
  chargingEquipment: (equipmentId) =>
    `/production/charging/equipment/${encodeURIComponent(String(equipmentId ?? "").trim())}`,
  inboundEntry: "/inout/incoming",
  outboundEntry: "/inout/shipment",
  productEntry: (productCode) =>
    `/settings/products?qrTarget=${encodeURIComponent(String(productCode ?? "").trim())}`,
  materialEntry: (materialCode) =>
    `/settings/materials?qrTarget=${encodeURIComponent(String(materialCode ?? "").trim())}`,
  documentEntry: "/documents",
  workerEntry: (workerCode) =>
    `/production/work-journal?worker=${encodeURIComponent(String(workerCode ?? "").trim())}`,
};

export const QR_ENGINE_SCAN_TYPES = {
  equipment: { id: "equipment", labelKo: "설비 QR", phase: 2 },
  lot: { id: "lot", labelKo: "LOT QR", phase: 2 },
  inbound: { id: "inbound", labelKo: "입고등록 QR", phase: 4 },
  outbound: { id: "outbound", labelKo: "출고등록 QR", phase: 4 },
  product: { id: "product", labelKo: "제품 QR", phase: 4 },
  material: { id: "material", labelKo: "재질 QR", phase: 4 },
  document: { id: "document", labelKo: "문서 QR", phase: 4 },
  worker: { id: "worker", labelKo: "작업자 QR", phase: 4 },
};

export const QR_ENGINE_GENERATOR_TYPES = {
  equipment: {
    id: "equipment",
    labelKo: "설비 QR",
    registryType: "equipment",
    displayPrefix: "EQ",
    phase: 3,
  },
  lot: {
    id: "lot",
    labelKo: "LOT QR",
    registryType: "lot",
    displayPrefix: "LOT",
    phase: 3,
  },
  inbound: {
    id: "inbound",
    labelKo: "입고등록 QR",
    registryType: "inbound",
    displayPrefix: "IN",
    phase: 4,
  },
  outbound: {
    id: "outbound",
    labelKo: "출고등록 QR",
    registryType: "outbound",
    displayPrefix: "OUT",
    phase: 4,
  },
  product: {
    id: "product",
    labelKo: "제품 QR",
    registryType: "product",
    displayPrefix: "PRD",
    phase: 4,
  },
  material: {
    id: "material",
    labelKo: "재질 QR",
    registryType: "material",
    displayPrefix: "MAT",
    phase: 4,
  },
  document: {
    id: "document",
    labelKo: "문서 QR",
    registryType: "document",
    displayPrefix: "DOC",
    phase: 4,
  },
  worker: {
    id: "worker",
    labelKo: "작업자 QR",
    registryType: "worker",
    displayPrefix: "WRK",
    phase: 4,
  },
};

export const QR_ENGINE_GENERATOR_GROUPS = [
  {
    id: "production",
    label: "생산",
    description: "설비 상태 확인, 작업 시작/종료, LOT 작업 이어하기",
    typeIds: ["equipment", "lot"],
  },
  {
    id: "operations",
    label: "운영",
    description: "입고등록, 출고등록, 거래명세서 발행 업무 진입",
    typeIds: ["inbound", "outbound"],
  },
  {
    id: "master",
    label: "기준정보",
    description: "제품·재질 정보 조회 및 관련 이력 연결",
    typeIds: ["product", "material"],
  },
  {
    id: "quality",
    label: "품질",
    description: "성적서, LOT 문서, 출고 문서 등 관련 문서 조회",
    typeIds: ["document"],
  },
  {
    id: "worker",
    label: "작업자",
    description: "작업자 기준 로그인, 작업 시작/종료 진입",
    typeIds: ["worker"],
  },
];

export const QR_ENGINE_WORKFLOWS = {
  equipment: ["설비 상태 조회", "작업 시작", "작업 종료"],
  lot: ["LOT 조회", "작업 이어하기", "LOT 상태 확인"],
  inbound: ["QR 스캔", "간편 입고등록", "LOT 생성", "작업 시작"],
  outbound: ["QR 스캔", "출고등록", "거래명세서", "출고 완료"],
  product: ["제품정보 조회", "관련 LOT 조회", "생산 이력 조회"],
  material: ["재질정보 조회", "관련 제품 조회", "열처리 조건 조회"],
  document: ["성적서", "LOT 문서", "출고 문서", "관련 문서 조회"],
  worker: ["작업자 로그인", "작업 시작", "작업 종료"],
};

export const QR_ENGINE_RECENT_SCANS_KEY = "titan-qr-engine-recent-scans-v1";
export const QR_ENGINE_SCAN_STATS_KEY = "titan-qr-engine-scan-stats-v1";
export const QR_ENGINE_MAX_RECENT_SCANS = 12;

export const QR_ENGINE_COPY = {
  workspaceTitle: "QR 정보관리",
  workspaceIntro: "Master QR는 자동 생성하고, LOT·문서 QR는 필요한 경우 상세보기에서 생성·출력·재발급합니다.",
  dashboardTitle: "대시보드",
  generatorTitle: "QR 출력 / 재발급",
  registryTitle: "QR 목록",
  scanTitle: "QR 스캔",
  testModeTitle: "QR Test Mode",
  testModeIntro:
    "QR 스캔 없이 설비 Workflow를 검증합니다. 설비 선택 후 동일 작업 화면으로 이동해 작업 시작 · 완료 · Lifecycle 저장을 확인하세요.",
  diagnosticsTitle: "QR Diagnostics",
  diagnosticsIntro:
    "QR Registry · Browser URL · 스캔 기록 · Traceability · Workflow · Lifecycle 상태를 관리자가 한 화면에서 진단합니다.",
  adminOnlyHint: "관리자(Debug/Admin) 전용 운영 도구입니다.",
  scanPlaceholder: "QR 코드 또는 LOT.NO / NDK://EQ/설비코드",
  scanProcessing: "QR 읽는 중...",
  scanResolving: "QR 종류 판별 중...",
  equipmentWorkTitle: "설비 작업",
  equipmentWorkIntro: "설비 QR 스캔 후 LOT 선택 · 작업 시작 · 작업 완료 · LOT Lifecycle 연결",
  equipmentCurrentLotLabel: "현재 작업 LOT",
  equipmentWaitingLotLabel: "생산 대기 LOT",
  equipmentFinishLifecycleHint: "작업 완료 후 LOT Lifecycle 보기 · 다음 LOT 작업 · 설비 현황 이동을 선택할 수 있습니다.",
  equipmentWorkSummaryTitle: "설비 작업 현황",
  equipmentWorkCompleteTitle: "작업 완료",
  equipmentWorkCompleteQuestion: "작업이 완료되었습니다. 다음 작업을 선택하세요.",
  equipmentWorkCompleteNextLotHint: "생산 대기 LOT가 남아 있으면 바로 다음 작업을 선택할 수 있습니다.",
  equipmentWorkCompleteLifecycle: "LOT Lifecycle 보기",
  equipmentWorkCompleteNextLot: "다음 LOT 작업",
  equipmentWorkCompleteEquipmentStatus: "설비 현황으로 이동",
  openCharging: "설비 가동 현황 작업으로 이동",
  backToScan: "QR 스캔",
  backToDashboard: "대시보드",
  autoGenerateHint: "V1.0.1 정책: 설비·제품·재질·작업자 등 고정 Master QR만 자동 생성합니다. LOT·성적서·거래명세서·출고서·발주서·반출증 등 실적/문서 QR은 상세 Popup에서 필요할 때 생성합니다.",
};

export const QR_ENGINE_V101_SPLIT_POLICY = Object.freeze({
  status: "blueprint-only",
  masterQr: {
    generation: "auto-or-admin-confirmed",
    targets: ["equipment", "product", "material", "worker", "companyOptional"],
  },
  dataQr: {
    generation: "on-demand-only",
    targets: [
      "lot",
      "inbound",
      "outbound",
      "certificate",
      "invoice",
      "purchaseOrder",
      "releaseSlip",
      "document",
    ],
  },
  menuShortcutQr: {
    generation: "fixed-reusable",
    target: "mobile-route",
    route: "/mobile/qr/menu/{shortcutId}",
  },
  registryRule: "Store only actually generated, printed, reissued, or explicitly requested QR records.",
  foundationPanel: "FoundationQrPanel planned contract; no UI implementation in this policy.",
});

/**
 * Sprint 16-11 PM Approved — V1.1 QR Registry management backlog.
 *
 * V1.0 locks the auto-generation architecture only. These items are
 * intentionally not implemented in Sprint 16-11.
 */
export const QR_ENGINE_V11_BACKLOG = [
  {
    id: "qr-registry-pagination-or-virtual-scroll",
    title: "QR Registry Pagination 또는 Virtual Scroll",
    priority: "V1.1",
    reason: "현재 100건 렌더 제한은 진입 성능 개선용 임시 구조입니다.",
    scope: [
      "5,000~10,000건 이상 QR Registry 대응",
      "Pagination 또는 Virtual Scroll 구조 검토",
      "현재 100건 제한과 호환되는 단계적 전환",
    ],
  },
  {
    id: "qr-registry-unified-search",
    title: "QR Registry 통합 검색",
    priority: "V1.1",
    reason: "100건 렌더 제한과 관계없이 필요한 QR를 찾을 수 있어야 합니다.",
    searchTargets: ["UUID", "제품", "LOT", "설비", "재질", "작업자", "문서"],
    scope: [
      "Registry 전체 메타데이터 기준 검색",
      "검색 결과는 렌더 제한과 독립적으로 산출",
      "목록은 검색 결과 중 표시 가능한 범위만 렌더링",
    ],
  },
  {
    id: "qr-registry-status-column",
    title: "QR 상태(Status) 컬럼 추가 검토",
    priority: "V1.1",
    reason: "현장 부착, 출력, 재발급, 폐기 상태를 관리하기 위한 기반입니다.",
    statusCandidates: ["사용 중", "미출력", "출력 완료", "재발급", "비활성", "폐기"],
    scope: [
      "미출력 QR 관리",
      "재발급 QR 관리",
      "폐기 QR 관리",
      "현장 부착/출력 상태 관리",
    ],
  },
];