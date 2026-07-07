/**
 * Project TITAN — Official Architecture (SSoT)
 *
 * QMS + Smart Factory Lite + Mobile + QR + Future NFC + MES Ready
 * Architecture / Config / Rule only — UI 변경 ❌
 *
 * @see docs/TITAN_V12_OFFICIAL_ARCHITECTURE.md — V1.2 Consolidated (14 sections · PRIMARY)
 * @see src/config/titanV12OfficialArchitecture.js — V1.2 Consolidated Config
 * @see docs/TITAN_OFFICIAL_ARCHITECTURE.md
 * @see src/config/smartAccessArchitecture.js — Route Registry · Handler mapping
 * @see src/config/titanQrArchitectureV17.js — V1.7 QR 3분류 (Master · Operation · Traceability)
 * @see src/config/titanV11Workflow.js — Paper · Smart workflow chains
 */

/** Official Architecture lock date */
export const OFFICIAL_ARCHITECTURE_LOCK_DATE = "2026-07-04";

/** Project identity — integrated work platform */
export const PROJECT_IDENTITY = {
  name: "Project TITAN",
  taglineKo:
    "QMS + Smart Factory Lite + Mobile + QR + Future NFC + MES Ready — 통합 업무 플랫폼",
  components: [
    "QMS",
    "Smart Factory Lite",
    "Mobile (Future)",
    "QR",
    "NFC (Future)",
    "MES Ready",
  ],
  pqmsFormula: "POP + QMS",
  mesRelation: "MES 대체 ❌ · MES Ready — Repository/Data Source만 교체 · UI 불변",
};

/** Core philosophy */
export const PROJECT_PHILOSOPHY = {
  summaryKo: "기존 업무를 없애는 시스템이 아니라 기존 업무를 더 편하게 만드는 시스템",
  paperMaintained: true,
  smartAdded: true,
  userChoice: "Paper OR Smart — 사용자 선택 · 병행 지원",
  oneTimeInput: "한 번 입력한 데이터는 다른 메뉴에서 재입력하지 않음",
  oneScan: "QR 또는 NFC 1회 인식 → 해당 업무 화면 직행 (메뉴 탐색 ❌)",
  oneWorkflow: "Paper · Smart · NFC 모두 동일 Workflow 상태머신 사용",
};

/** Mandatory development priority order */
export const DEVELOPMENT_PRIORITY_PIPELINE = [
  { id: "workflow", label: "Workflow", labelKo: "업무 흐름" },
  { id: "ui", label: "UI", labelKo: "화면 설계" },
  { id: "database", label: "Database", labelKo: "데이터 구조" },
  { id: "development", label: "Development", labelKo: "개발" },
  { id: "test", label: "Test", labelKo: "테스트" },
  { id: "fieldFeedback", label: "Field Feedback", labelKo: "현장 피드백" },
  { id: "improvement", label: "Improvement", labelKo: "개선" },
];

/** One Time Input — single data flow (no duplicate input) */
export const ONE_TIME_INPUT_DATA_FLOW = [
  { id: "productMaster", label: "제품관리" },
  { id: "inbound", label: "입고" },
  { id: "production", label: "생산" },
  { id: "inspection", label: "검사" },
  { id: "certificate", label: "성적서" },
  { id: "outbound", label: "출고" },
  { id: "statistics", label: "통계" },
];

/** Support modes — parallel, never delete Paper */
export const SUPPORT_MODES = {
  paper: {
    id: "paper",
    label: "Paper Mode",
    description: "기존 출력물 기반 업무 — 입고리스트 · 출고리스트 · 거래명세서 · 생산일보",
    status: "active",
    deleteForbidden: true,
  },
  smart: {
    id: "smart",
    label: "Smart Mode",
    description: "QR 스캔 → 업무 화면 직행 → 등록 · 상태 변경",
    status: "active",
    primaryChannel: "qr",
  },
  nfc: {
    id: "nfc",
    label: "NFC Mode (Future)",
    description: "NFC 태그 → QR와 동일 Smart Access ID · Handler 공유",
    status: "planned",
    primaryChannel: "nfc",
    sameIdAsQr: true,
  },
};

/** Paper Workflow — fixed, delete forbidden */
export const PAPER_WORKFLOW_CHAIN = [
  { id: "inbound", label: "입고" },
  { id: "htlPrint", label: "입고리스트 출력", doc: "DOC-01" },
  { id: "production", label: "생산" },
  { id: "inspection", label: "검사" },
  { id: "certificate", label: "성적서" },
  { id: "outbound", label: "출고" },
  { id: "statistics", label: "통계" },
];

/** Smart Workflow — additive (Paper와 병행) */
export const SMART_WORKFLOW_CHAIN = [
  { id: "smartEntry", label: "QR/NFC 진입" },
  { id: "locationResolve", label: "위치/설비 자동 인식" },
  { id: "processResolve", label: "공정 자동 인식" },
  { id: "producibleList", label: "생산 가능 목록" },
  { id: "lotRegister", label: "LOT 등록" },
  { id: "prodProgress", label: "생산중", status: "생산중" },
  { id: "prodDone", label: "생산완료", status: "생산완료" },
  { id: "inspectQueue", label: "검사대기", status: "생산완료" },
  { id: "inspection", label: "검사" },
  { id: "certificate", label: "성적서" },
  { id: "outbound", label: "출고" },
];

/** Smart Access ID scheme — canonical NDK:// format */
export const SMART_ACCESS_ID_SCHEME = {
  canonicalPrefix: "NDK://",
  canonicalEquipmentPattern: "NDK://EQ/{code}",
  legacyDelimiter: "|",
  legacyEquipmentPrefix: "NDK|EQ|",
  note: "QR · NFC · Future Barcode 모두 동일 Smart Access ID — Handler 단일 진입",
  nfcExample: "NDK://EQ/ION-01 — QR→NFC 교체 시 프로그램 변경 ❌",
};

/**
 * Smart Access ID Registry — canonical + legacy alias
 * targetId maps to SMART_ACCESS_TARGETS in smartAccessArchitecture.js
 */
export const SMART_ACCESS_ID_REGISTRY = {
  incoming: {
    id: "incoming",
    canonicalId: "NDK://INCOMING",
    legacyPayload: "NDK|IN|REG",
    label: "입고등록",
    labelKo: "입고창고 QR",
    targetId: "inboundRegister",
    qrTargetIndex: 1,
    implementationStatus: "planned",
  },
  outgoing: {
    id: "outgoing",
    canonicalId: "NDK://OUTGOING",
    legacyPayload: "NDK|OUT|DOCK|{code}",
    label: "출고등록",
    labelKo: "출고장 QR",
    targetId: "outboundRegister",
    qrTargetIndex: 5,
    implementationStatus: "planned",
  },
  inspection: {
    id: "inspection",
    canonicalId: "NDK://INSPECTION",
    legacyPayload: "NDK|QC|ROOM|{code}",
    label: "검사등록",
    labelKo: "검사실 QR",
    targetId: "inspectionRegister",
    qrTargetIndex: 3,
    implementationStatus: "planned",
  },
  certificate: {
    id: "certificate",
    canonicalId: "NDK://CERTIFICATE",
    legacyPayload: "NDK|QC|CERT|{code}",
    label: "성적서관리",
    labelKo: "품질실 QR",
    targetId: "certificate",
    qrTargetIndex: 4,
    implementationStatus: "planned",
  },
  production: {
    id: "production",
    canonicalId: "NDK://PRODUCTION",
    legacyPayload: "NDK|PR|REG",
    label: "생산등록",
    labelKo: "생산등록 QR",
    targetId: "production",
    qrTargetIndex: 2,
    implementationStatus: "planned",
  },
  equipment: {
    id: "equipment",
    canonicalPattern: "NDK://EQ/{code}",
    legacyPattern: "NDK|EQ|{code}",
    label: "생산설비 QR",
    labelKo: "설비 QR — 생산등록",
    targetId: "equipment",
    qrTargetIndex: 2,
    implementationStatus: "active",
    codeRef: "src/utils/equipmentQr.js",
  },
  equipmentInfo: {
    id: "equipmentInfo",
    canonicalPattern: "NDK://EQ/{code}",
    legacyPattern: "NDK|EQ|INFO|{code}",
    label: "설비정보/점검이력/생산현황",
    labelKo: "설비 QR — Master/현황",
    targetId: "equipmentMaster",
    qrTargetIndex: 6,
    implementationStatus: "planned",
    note: "동일 설비 코드 · 다른 targetId는 query/context로 구분 (향후 Handler)",
  },
};

/** Official equipment QR codes — ONE QR per equipment (not per product/LOT) */
export const OFFICIAL_EQUIPMENT_QR_CODES = [
  { code: "ION-01", process: "이온질화", label: "이온질화 1호" },
  { code: "ION-02", process: "이온질화", label: "이온질화 2호" },
  { code: "GAS-01", process: "가스질화", label: "가스질화 1호" },
  { code: "SOFT-01", process: "연질화", label: "연질화 1호" },
];

/** Equipment QR rules */
export const EQUIPMENT_QR_RULES = {
  perProduct: false,
  perLot: false,
  oneQrPerEquipment: true,
  multiCopyAllowed: true,
  multiCopyNote: "동일 QR 다매 출력 · 현장 여러 위치 부착 가능",
  officialCodes: OFFICIAL_EQUIPMENT_QR_CODES.map((e) => e.code),
};

/** QR targets summary (6 official targets) */
export const QR_TARGETS_OFFICIAL = [
  { index: 1, label: "입고창고", action: "입고등록", registryId: "incoming" },
  { index: 2, label: "생산설비", action: "생산등록", registryId: "equipment" },
  { index: 3, label: "검사실", action: "검사등록", registryId: "inspection" },
  { index: 4, label: "품질실", action: "성적서관리", registryId: "certificate" },
  { index: 5, label: "출고장", action: "출고등록", registryId: "outgoing" },
  { index: 6, label: "설비", action: "설비정보/점검이력/생산현황", registryId: "equipmentInfo" },
];

/** QR Print Center — future admin menu (design only) */
export const QR_PRINT_CENTER_OFFICIAL = {
  menuLabel: "QR 출력센터",
  menuLabelLegacy: "QR 관리",
  plannedMenuPath: "/environment/qr",
  plannedParentMenu: "environment",
  categories: [
    { id: "equipmentQr", label: "설비 QR", registryId: "equipment" },
    { id: "inboundQr", label: "입고등록 QR", registryId: "incoming" },
    { id: "inspectionQr", label: "검사등록 QR", registryId: "inspection" },
    { id: "certificateQr", label: "성적서 QR", registryId: "certificate" },
    { id: "outboundQr", label: "출고등록 QR", registryId: "outgoing" },
    { id: "adminQr", label: "관리자 QR", registryId: "admin" },
  ],
  features: ["PDF", "재출력", "미리보기", "인쇄"],
  multiCopy: EQUIPMENT_QR_RULES.multiCopyNote,
  implementationStatus: "planned",
};

/** NFC Ready policy */
export const NFC_READY_POLICY = {
  qrFirst: true,
  nfcReady: true,
  sameSmartAccessId: true,
  sameHandler: true,
  example: {
    smartAccessId: "NDK://EQ/ION-01",
    url: "https://titan/equipment/ION-01",
    note: "QR·NFC·Barcode 동일 ID — Handler만 교체 · 앱 수정 ❌",
  },
};

/** Mobile design principles (future — no shrunk PC) */
export const MOBILE_DESIGN_PRINCIPLES = {
  status: "future-design-only",
  notShrunkPc: true,
  dedicatedScreens: true,
  principles: [
    "PC 화면 축소 ❌ — Mobile 전용 화면",
    "큰 버튼 · ≤3 클릭 · 현재 업무만 표시",
    "현장(field-work) 중심",
    "Smart Access ID 진입 → 해당 업무 화면만",
  ],
};

/** User-specific screen reference (design) */
export const USER_ROLE_SCREENS = {
  quality: {
    id: "quality",
    label: "품질팀",
    screens: ["입고", "검사", "성적서", "출고", "기준정보"],
  },
  production: {
    id: "production",
    label: "생산팀",
    screens: ["설비 QR", "생산 가능 목록", "LOT", "생산중/완료"],
  },
  admin: {
    id: "admin",
    label: "관리자",
    screens: ["HOME", "KPI", "현황", "통계", "설비현황"],
  },
};

/** MES Ready — data source evolution, UI unchanged */
export const MES_READY_ARCHITECTURE = {
  titanDoesNotReplaceMes: true,
  current: {
    label: "현재 (Presentation)",
    dataPath: "SessionStorage → TITAN → 생산상태",
    repository: "session",
  },
  future: {
    label: "향후 (MES 연동)",
    dataPath: "MES → SQLite/API → TITAN → 품질관리",
    repository: "oracle | api | csv | sqlite",
  },
  uiPolicy: "UI·Workflow 불변 — Repository/Data Source만 교체",
};

/** Official development principles (10 rules — lock) */
export const OFFICIAL_DEVELOPMENT_PRINCIPLES = [
  { id: 1, rule: "기존 디자인 임의 변경 금지" },
  { id: 2, rule: "기존 기능 삭제 금지" },
  { id: 3, rule: "Workflow 중심 개발" },
  { id: 4, rule: "클릭 최소화" },
  { id: 5, rule: "One Time Input" },
  { id: 6, rule: "Paper + Smart 병행" },
  { id: 7, rule: "QR + NFC Ready" },
  { id: 8, rule: "Master Data 적극 활용" },
  { id: 9, rule: "빌드 성공 후 보고" },
  { id: 10, rule: "Commit 가능한 상태 유지" },
];

/**
 * Build canonical Smart Access ID
 * @param {"incoming"|"outgoing"|"inspection"|"certificate"|"equipment"|"equipmentInfo"} registryId
 * @param {string} [code] — required for equipment types
 */
export function buildCanonicalSmartAccessId(registryId, code = "") {
  const entry = SMART_ACCESS_ID_REGISTRY[registryId];
  if (!entry) return "";

  if (entry.canonicalId) return entry.canonicalId;

  if (entry.canonicalPattern) {
    const resolvedCode = String(code ?? "").trim();
    if (!resolvedCode) return "";
    return entry.canonicalPattern.replace("{code}", resolvedCode);
  }

  return "";
}

/**
 * Build legacy payload alias (backward compat)
 * @param {string} registryId
 * @param {string} [code]
 */
export function buildLegacySmartAccessPayload(registryId, code = "") {
  const entry = SMART_ACCESS_ID_REGISTRY[registryId];
  if (!entry) return "";

  const legacy = entry.legacyPayload ?? entry.legacyPattern ?? "";
  if (!legacy) return "";

  return legacy.replace("{code}", String(code ?? "").trim());
}

/**
 * Parse Smart Access ID or legacy payload → { registryId, code, format }
 * @param {string} input
 */
export function parseSmartAccessId(input) {
  const text = String(input ?? "").trim();
  if (!text) return null;

  const upper = text.toUpperCase();

  if (upper.startsWith("NDK://")) {
    const path = text.slice(6);
    const slashIdx = path.indexOf("/");

    if (slashIdx === -1) {
      const domain = path.toUpperCase();
      const domainMap = {
        INCOMING: { registryId: "incoming", code: "" },
        OUTGOING: { registryId: "outgoing", code: "" },
        INSPECTION: { registryId: "inspection", code: "" },
        CERTIFICATE: { registryId: "certificate", code: "" },
      };
      const mapped = domainMap[domain];
      if (mapped) return { ...mapped, format: "canonical", raw: text };
    }

    if (upper.startsWith("NDK://EQ/")) {
      const code = text.slice("NDK://EQ/".length).trim();
      return { registryId: "equipment", code, format: "canonical", raw: text };
    }
  }

  if (upper.startsWith("NDK|EQ|INFO|")) {
    return {
      registryId: "equipmentInfo",
      code: text.slice("NDK|EQ|INFO|".length).trim(),
      format: "legacy",
      raw: text,
    };
  }

  if (upper.startsWith("NDK|EQ|")) {
    return {
      registryId: "equipment",
      code: text.slice("NDK|EQ|".length).trim(),
      format: "legacy",
      raw: text,
    };
  }

  if (upper === "NDK|IN|REG") {
    return { registryId: "incoming", code: "", format: "legacy", raw: text };
  }

  if (upper.startsWith("NDK|OUT|DOCK|")) {
    return {
      registryId: "outgoing",
      code: text.slice("NDK|OUT|DOCK|".length).trim(),
      format: "legacy",
      raw: text,
    };
  }

  if (upper.startsWith("NDK|QC|ROOM|")) {
    return {
      registryId: "inspection",
      code: text.slice("NDK|QC|ROOM|".length).trim(),
      format: "legacy",
      raw: text,
    };
  }

  if (upper.startsWith("NDK|QC|CERT|")) {
    return {
      registryId: "certificate",
      code: text.slice("NDK|QC|CERT|".length).trim(),
      format: "legacy",
      raw: text,
    };
  }

  return null;
}

/** Resolve registry entry → targetId for route mapping */
export function getSmartAccessTargetId(registryId) {
  return SMART_ACCESS_ID_REGISTRY[registryId]?.targetId ?? null;
}

export function getOfficialArchitectureSummary() {
  return {
    lockDate: OFFICIAL_ARCHITECTURE_LOCK_DATE,
    v12Doc: "docs/TITAN_V12_OFFICIAL_ARCHITECTURE.md",
    v12Config: "src/config/titanV12OfficialArchitecture.js",
    identity: PROJECT_IDENTITY.taglineKo,
    philosophy: PROJECT_PHILOSOPHY.summaryKo,
    devPriority: DEVELOPMENT_PRIORITY_PIPELINE.map((s) => s.labelKo).join(" → "),
    paperWorkflow: PAPER_WORKFLOW_CHAIN.map((s) => s.label).join(" → "),
    smartWorkflow: SMART_WORKFLOW_CHAIN.map((s) => s.label).join(" → "),
    smartAccessIdScheme: SMART_ACCESS_ID_SCHEME.canonicalPrefix,
    qrTargets: QR_TARGETS_OFFICIAL.length,
    equipmentCodes: EQUIPMENT_QR_RULES.officialCodes,
    mesReady: MES_READY_ARCHITECTURE.uiPolicy,
    storage: "SQLite 메타 + Storage 파일 — 파일 in SQLite ❌",
    principles: OFFICIAL_DEVELOPMENT_PRINCIPLES.map((p) => p.rule),
    doc: "docs/TITAN_OFFICIAL_ARCHITECTURE.md",
  };
}
