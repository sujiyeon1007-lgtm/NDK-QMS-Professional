/**
 * Project TITAN V1.7 — QR Architecture & Traceability (PM 공식 · Architecture Only)
 *
 * QR은 하나의 기능이 아니라 Master / Operation / Traceability 3역할로 분리한다.
 * 본 파일 = 공식 SSoT · UI/Router/Launcher 변경 ❌ · 구현은 IMPLEMENTATION_ROADMAP 순서
 *
 * @see .cursor/rules/project-titan-qr-architecture-v1.7.mdc
 * @see src/config/smartAccessArchitecture.js — Smart Access · 설비 QR Scan 라우트
 * @see src/utils/equipmentQrWorkflow.js — Master QR Scan → 장입 Workflow (V1.7)
 * @see src/utils/lotTraceabilityModel.js — Traceability 조회 모델 (V1.7 Foundation)
 */

/** @type {"2026-07-07"} */
export const TITAN_QR_ARCHITECTURE_LOCK_DATE = "2026-07-07";

/** PM 추가 승인 — Traceability LOT 기준 · 조회 권한 보완 */
export const TITAN_QR_ARCHITECTURE_SUPPLEMENT_DATE = "2026-07-07";

export const TITAN_QR_ARCHITECTURE_VERSION = "V1.7";

/** PM 공식 철학 */
export const TITAN_QR_PHILOSOPHY = {
  summaryKo: "Project TITAN의 모든 QR은 제품의 흐름(Traceability)을 연결하는 수단",
  traceabilityNotDocument:
    "Traceability QR는 문서를 식별하는 QR가 아니라 제품(LOT)의 전체 Lifecycle을 추적하는 QR",
  oneLotOneTraceabilityQr: "하나의 LOT = 하나의 Traceability QR (공식 정책)",
  documentNoOnLifecycleScreen:
    "Document No.는 QR payload에 저장 ❌ — LOT Lifecycle 화면에서 관련 문서번호 표시",
  printDocumentNoPlusSameQr:
    "모든 공식 출력물: Document No. + 동일 LOT의 Traceability QR 함께 출력",
  reuseOverRegenerate: "QR 생성보다 QR 재사용을 우선 · 동일 LOT = 동일 QR",
  noStandaloneQrMenu: "QR 생성 전용 메뉴 추가 ❌ — 기존 업무 화면·출력 흐름에 내장",
  scanOpensLifecycleNotDocument: "QR Scan → 문서 열기 ❌ · LOT Lifecycle 화면 조회 ✅",
};

/**
 * Traceability QR — LOT 기준 (PM 추가 승인)
 * Document ❌ · LOT 1개 = Traceability QR 1개
 */
export const TITAN_TRACEABILITY_QR_LOT_POLICY = {
  basis: "lot",
  basisNot: "document",
  rule: "LOT 1개 → Traceability QR 1개",
  sameLotSameQr: true,
  regeneratePerDocument: false,
  exampleLotNo: "LOT-202607001",
  sharedAcrossDocuments: [
    "입고리스트",
    "생산일보",
    "검사일지",
    "성적서",
    "거래명세서",
    "출고리스트",
  ],
  qrImmutableWhenDocumentNoChanges: true,
  generationTiming: "LOT 생성 시 1회 (Roadmap 2·3 연계) · 이후 모든 출력물에서 동일 QR 재사용",
};

/** Traceability QR Scan → LOT Lifecycle Workflow (PM 공식) */
export const TITAN_TRACEABILITY_QR_SCAN_FLOW = [
  "Traceability QR Scan",
  "LOT Lifecycle 화면",
  "관리번호",
  "제품정보",
  "고객사",
  "현재공정",
  "현재설비",
  "생산일보",
  "검사일지",
  "성적서",
  "출고상태",
  "Timeline",
];

/**
 * Document No. 정책 (PM 추가 승인)
 * QR payload ❌ · Lifecycle 화면 표시 ✅
 */
export const TITAN_DOCUMENT_NO_POLICY = {
  storedInQrPayload: false,
  displayedOnLifecycleScreen: true,
  immutableQrWhenDocumentNoChanges: true,
  exampleDocumentNumbers: [
    "NDK-IN-2026-000123",
    "NDK-PR-2026-000123",
    "NDK-QA-2026-000123",
    "NDK-COA-2026-000123",
    "NDK-OUT-2026-000123",
  ],
  printLayout: "Document No. (문서별) + Traceability QR (LOT별 · 동일 LOT 동일 QR)",
};

export const TITAN_QR_LOOKUP_PERMISSIONS = {
  admin: {
    role: "admin",
    labelKo: "관리자",
    allowed: [
      "LOT",
      "제품",
      "관리번호",
      "설비",
      "Timeline",
      "생산일보",
      "검사일지",
      "성적서",
      "출고",
      "내부 메모",
    ],
  },
  internal: {
    role: "internal",
    labelKo: "사내 사용자",
    allowed: [
      "LOT",
      "제품",
      "현재공정",
      "설비",
      "생산상태",
      "검사상태",
      "성적서",
      "출고상태",
      "Timeline",
    ],
    note: "업무 수행에 필요한 정보 조회",
  },
  customer: {
    role: "customer",
    labelKo: "고객",
    allowed: ["제품", "LOT", "성적서", "출고상태", "제품 진행상태"],
    denied: [
      "생산일보",
      "내부 메모",
      "작업자",
      "설비 상세정보",
      "내부 품질 메모",
    ],
    note: "고객은 필요한 정보만 조회",
  },
};

/**
 * QR ID 정책 — Blueprint 설계 (구현 ❌ · 확장 준비)
 * Traceability QR 내부 고유 ID · 재발행 · 출력 이력 · QR 관리
 */
export const TITAN_QR_ID_POLICY = {
  status: "design-only",
  appliesTo: "traceability",
  idFormat: "QR-{YYYY}-{SEQ}",
  example: "QR-2026-000001",
  oneIdPerLotTraceabilityQr: true,
  futureCapabilities: ["QR 재발행", "QR 출력 이력", "QR 관리"],
  registryFields: ["qrId", "lotNo", "version", "issuedAt", "reissueHistory"],
};

/**
 * QR Version 정책 — Blueprint 설계 (구현 ❌)
 * 재발행 시 Version 증가 · 재출력은 기존 Version 유지
 */
export const TITAN_QR_VERSION_POLICY = {
  status: "design-only",
  initialVersion: "V1",
  reissueIncrementsVersion: true,
  reprintUsesExistingVersion: true,
  exampleFlow: ["V1", "재발행", "V2"],
};

/** QR 3분류 — PM 공식 */
export const TITAN_QR_TYPES = {
  master: {
    id: "master",
    label: "Master QR",
    labelKo: "설비 관리용 QR",
    purposeKo: "회사 내부 설비 식별 및 생산 시작",
    fixedToAsset: true,
    generationLocation: {
      menu: "기준정보관리",
      path: "/settings/equipment",
      screen: "설비관리 → 설비 상세 → QR 생성",
    },
    capabilities: ["설비 QR 생성", "QR 재생성", "QR 출력(PDF)", "QR 미리보기"],
    usageFlow: [
      "설비 QR 스캔",
      "설비 자동 선택",
      "Workflow 실행",
    ],
    usageMenus: ["생산관리 — Scan only (QR 생성 ❌)"],
    smartAccessRegistryId: "equipment",
    implementationStatus: "partial",
    implementationNote:
      "V1.7: Scan → 장입 Workflow 연동 완료 · 설비 상세 QR 생성/출력은 Roadmap 1",
  },
  operation: {
    id: "operation",
    label: "Operation QR",
    labelKo: "LOT 관리용 QR",
    purposeKo: "제품과 함께 이동하는 LOT 내부 업무 QR",
    fixedToAsset: false,
    travelsWithProduct: true,
    generationLocation: {
      menu: "입출고관리",
      path: "/inout/incoming",
      screen: "입고등록 → LOT 생성 → LOT QR 자동 생성",
    },
    payloadFields: [
      "lotNo",
      "managementId",
      "productName",
      "quantity",
      "customerName",
      "incomingDate",
    ],
    usageDomains: ["생산", "검사", "출고"],
    outputLabels: ["LOT 라벨 출력", "QR 재출력"],
    implementationStatus: "planned",
    implementationNote: "Roadmap 2 — 입고등록 완료 후 LOT QR 자동 생성",
  },
  traceability: {
    id: "traceability",
    label: "Traceability QR",
    labelKo: "LOT Lifecycle 추적 QR",
    purposeKo: "제품(LOT) 전체 Lifecycle 조회 — 문서 식별 ❌",
    basis: "lot",
    basisNot: "document",
    oneLotOneQr: true,
    notDocumentOpenOnly: true,
    scanTarget: "LOT Lifecycle 화면",
    scanTargetNot: "개별 문서 열기",
    lifecycleChain: TITAN_TRACEABILITY_QR_SCAN_FLOW.slice(1),
    lookupFields: [
      "managementId",
      "lotNo",
      "productInfo",
      "customerName",
      "currentProcess",
      "currentEquipment",
      "dailyReport",
      "inspectionLog",
      "certificate",
      "shipmentStatus",
      "timeline",
      "documentNumbers",
    ],
    printPolicy: {
      documentNoRequired: true,
      traceabilityQrRequired: true,
      sameQrPerLotAcrossAllPrints: true,
      documentNoInQrPayload: false,
      documentNoOnLifecycleScreen: true,
      autoAttachOnPrint: true,
      regenerateQrPerDocument: false,
    },
    targetDocuments: [
      { id: "htl", label: "입고리스트", doc: "DOC-01", usesSameLotQr: true },
      { id: "dpr", label: "생산일보", doc: "DOC-02", usesSameLotQr: true },
      { id: "inspectionLog", label: "검사일지", doc: "DOC-03", usesSameLotQr: true },
      { id: "certificate", label: "성적서", doc: "COA", usesSameLotQr: true },
      { id: "invoice", label: "거래명세서", doc: "DOC-04", usesSameLotQr: true },
      { id: "outboundList", label: "출고리스트", doc: "OUT", usesSameLotQr: true },
      { id: "other", label: "기타 출력물", usesSameLotQr: true },
    ],
    lookupPermissions: TITAN_QR_LOOKUP_PERMISSIONS,
    implementationStatus: "planned",
    implementationNote:
      "Roadmap 3 — 출력물에 Document No. + 동일 LOT Traceability QR 부착 · Roadmap 4 Lifecycle 화면 · 권한별 필드 마스킹",
  },
};

/** 메뉴별 QR 역할 — PM 공식 */
export const TITAN_QR_MENU_ROLES = {
  masterData: {
    menuKey: "settings",
    label: "기준정보관리",
    qrRole: "master",
    actions: ["설비 QR 생성", "설비 Master 관리"],
    scanOnly: false,
  },
  inout: {
    menuKey: "inout",
    label: "입출고관리",
    qrRole: "operation",
    actions: ["LOT QR 자동 생성", "LOT 라벨 출력", "QR 재출력"],
    printManagementItems: [
      "LOT 라벨(QR)",
      "입고리스트(QR)",
      "출고리스트(QR)",
      "거래명세서(QR)",
      "생산일보(QR)",
      "검사일지(QR)",
      "성적서(QR)",
      "QR 재출력",
    ],
  },
  production: {
    menuKey: "production",
    label: "생산관리",
    qrRole: "master",
    actions: ["QR Scan", "Workflow 실행"],
    generateQr: false,
  },
  quality: {
    menuKey: "quality",
    label: "품질관리",
    qrRole: "traceability",
    actions: ["Traceability QR 조회", "성적서 출력 시 QR 포함"],
    generateQr: false,
  },
};

/** 개발 원칙 — Architecture lock */
export const TITAN_QR_DEVELOPMENT_PRINCIPLES = [
  "QR 생성 메뉴를 별도로 추가하지 않는다",
  "기존 Launcher 구조를 유지한다",
  "설비 QR은 설비관리(기준정보)에서 생성한다",
  "LOT QR은 입고등록 완료 후 자동 생성한다",
  "Traceability QR은 LOT 1개당 1개 — 문서마다 새 QR 생성 ❌",
  "출력물에는 Document No. + 동일 LOT Traceability QR을 함께 출력한다",
  "Document No.는 QR payload에 저장하지 않는다 — Lifecycle 화면에서 표시",
  "QR Scan은 문서가 아니라 LOT Lifecycle 화면을 연다",
  "QR 조회는 역할(관리자·사내·고객)별 필드 마스킹을 적용한다",
  "QR 생성보다 QR 재사용을 우선한다",
  "Router · Sidebar · Launcher 구조 변경 ❌",
];

/**
 * 구현 순서 — PM 승인 (Architecture 확정 · 순차 구현)
 * @type {ReadonlyArray<{ order: number, id: string, label: string, status: "partial" | "planned" }>}
 */
export const TITAN_QR_IMPLEMENTATION_ROADMAP = [
  {
    order: 1,
    id: "masterQrGeneration",
    label: "설비 QR 생성 (기준정보 → 설비 상세)",
    status: "planned",
  },
  {
    order: 2,
    id: "operationLotQrAuto",
    label: "LOT QR 자동 생성 (입고등록 완료)",
    status: "planned",
  },
  {
    order: 3,
    id: "traceabilityPrintQr",
    label: "출력물 Traceability QR 적용 (Document No. + 동일 LOT QR 재사용)",
    status: "planned",
  },
  {
    order: 4,
    id: "traceabilityLookupScreen",
    label: "QR 조회 — LOT Lifecycle 화면 (역할별 권한)",
    status: "planned",
  },
  {
    order: 5,
    id: "lotTraceabilityScreenLink",
    label: "LOT Traceability 화면 연동",
    status: "partial",
    note: "V1.7: lotTraceabilityModel · 장입 화면 패널 Foundation",
  },
];

/** V1.7 Sprint에서 완료된 Foundation (Scan Workflow — Master QR 사용) */
export const TITAN_QR_V17_FOUNDATION = {
  masterQrScanWorkflow: {
    status: "active",
    code: [
      "src/utils/equipmentQrWorkflow.js",
      "src/pages/QrManagement/hooks/useEquipmentQrScan.js",
      "src/config/smartAccessArchitecture.js",
    ],
    note: "설비 QR Scan → 장입 — Master QR 역할의 사용(Scan)만 구현",
  },
  lotTraceabilityModel: {
    status: "active",
    code: ["src/utils/lotTraceabilityModel.js", "src/utils/timelineQuery.js"],
    note: "Traceability QR 조회 화면(Roadmap 4) 입력용 데이터 모델",
  },
  certificateLinkPrep: {
    status: "active",
    code: ["src/utils/certificateLinkPrep.js"],
    note: "검사 완료 → 성적서 연동 준비",
  },
};

/** @param {keyof typeof TITAN_QR_TYPES} typeId */
export function getTitanQrType(typeId) {
  return TITAN_QR_TYPES[typeId] ?? null;
}

export function getTitanQrArchitectureSummary() {
  return {
    lockDate: TITAN_QR_ARCHITECTURE_LOCK_DATE,
    supplementDate: TITAN_QR_ARCHITECTURE_SUPPLEMENT_DATE,
    version: TITAN_QR_ARCHITECTURE_VERSION,
    philosophy: TITAN_QR_PHILOSOPHY.summaryKo,
    oneLotOneTraceabilityQr: TITAN_QR_PHILOSOPHY.oneLotOneTraceabilityQr,
    traceabilityBasis: TITAN_TRACEABILITY_QR_LOT_POLICY.basis,
    types: Object.values(TITAN_QR_TYPES).map((row) => ({
      id: row.id,
      label: row.labelKo,
      status: row.implementationStatus,
    })),
    lookupPermissions: Object.values(TITAN_QR_LOOKUP_PERMISSIONS).map((row) => ({
      role: row.role,
      label: row.labelKo,
    })),
    roadmap: TITAN_QR_IMPLEMENTATION_ROADMAP.map((row) => ({
      order: row.order,
      label: row.label,
      status: row.status,
    })),
    foundation: TITAN_QR_V17_FOUNDATION,
  };
}
