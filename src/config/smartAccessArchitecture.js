/**

 * Project TITAN — Smart Access Architecture (V1.1+)

 *

 * Hybrid System: Paper · QR · Mobile · NFC(Future)

 * One Time Input → One Scan → One Workflow

 *

 * UI 변경 없음 — URL/Workflow/Config SSoT

 * QR와 NFC는 동일 Smart Access ID · 동일 Handler

 *

 * @see docs/TITAN_V12_SMART_ACCESS_PLATFORM.md — V1.2 Smart Access Platform

 * @see docs/TITAN_OFFICIAL_ARCHITECTURE.md — Official Architecture (Primary SSoT)

 * @see src/config/titanV12SmartAccessPlatform.js — V1.2 lock · QR 라벨 · Dashboard

 * @see src/config/titanOfficialArchitecture.js — Smart Access ID Registry (NDK://)

 * @see docs/SMART_ACCESS_ARCHITECTURE.md

 * @see src/config/titanV11Workflow.js

 */



import {

  EQUIPMENT_QR_RULES,

  NFC_READY_POLICY,

  OFFICIAL_EQUIPMENT_QR_CODES,

  PROJECT_PHILOSOPHY,

  QR_PRINT_CENTER_OFFICIAL,

  SMART_ACCESS_ID_REGISTRY,

  SMART_ACCESS_ID_SCHEME,

  SUPPORT_MODES,

  buildCanonicalSmartAccessId,

  buildLegacySmartAccessPayload,

  getSmartAccessTargetId,

  parseSmartAccessId,

} from "./titanOfficialArchitecture";



/** Smart Access 핵심 철학 — re-export from Official Architecture */

export const SMART_ACCESS_PHILOSOPHY = {

  oneTimeInput: PROJECT_PHILOSOPHY.oneTimeInput,

  oneScan: PROJECT_PHILOSOPHY.oneScan,

  oneWorkflow: PROJECT_PHILOSOPHY.oneWorkflow,

  hybrid: "PC QMS + QR + Mobile + NFC — 단일 Hybrid System",

  summaryKo: PROJECT_PHILOSOPHY.summaryKo,

};



/** 접근 방식 (병행 · 대체 ❌) — aligned with Official Architecture */

export const SMART_ACCESS_MODES = {

  paper: SUPPORT_MODES.paper,

  smart: SUPPORT_MODES.smart,

  future: {

    ...SUPPORT_MODES.nfc,

    id: "future",

    label: "Future Mode (NFC)",

    sameUrlAsQr: SUPPORT_MODES.nfc.sameIdAsQr,

  },

};



/** Smart Access ID scheme — canonical NDK:// + legacy alias */

export {

  SMART_ACCESS_ID_SCHEME,

  SMART_ACCESS_ID_REGISTRY,

  EQUIPMENT_QR_RULES,

  OFFICIAL_EQUIPMENT_QR_CODES,

  buildCanonicalSmartAccessId,

  buildLegacySmartAccessPayload,

  parseSmartAccessId,

  getSmartAccessTargetId,

};



/**

 * Smart Access 진입 — Canonical Route Registry

 * registryId / Smart Access ID → targetId → pathTemplate + query

 */

export const SMART_ACCESS_TARGETS = {

  inboundRegister: {

    id: "inboundRegister",

    registryId: "incoming",

    label: "입고등록 QR",

    menuDomain: "inboundStatus",

    pathTemplate: "/inout/incoming",

    query: { smart: "register" },

    canonicalId: SMART_ACCESS_ID_REGISTRY.incoming.canonicalId,

    legacyPayload: SMART_ACCESS_ID_REGISTRY.incoming.legacyPayload,

    workflowSteps: ["입고등록 화면"],

    implementationStatus: "planned",

  },

  production: {

    id: "production",

    registryId: "production",

    label: "생산등록 QR",

    menuDomain: "workDaily",

    pathTemplate: "/production/daily-report",

    query: { smart: "register" },

    canonicalId: SMART_ACCESS_ID_REGISTRY.production?.canonicalId,

    legacyPayload: SMART_ACCESS_ID_REGISTRY.production?.legacyPayload,

    workflowSteps: ["생산등록 화면"],

    implementationStatus: "planned",

  },

  equipment: {

    id: "equipment",

    registryId: "equipment",

    label: "설비 QR · 생산등록",

    menuDomain: "workDaily",

    pathTemplate: "/production/daily-report",

    query: { equipment: "{code}", qr: "{payload}" },

    canonicalPattern: SMART_ACCESS_ID_REGISTRY.equipment.canonicalPattern,

    legacyPattern: SMART_ACCESS_ID_REGISTRY.equipment.legacyPattern,

    workflowSteps: [

      "설비 자동 인식",

      "공정 자동 확인",

      "생산 가능 목록",

      "LOT",

      "생산중",

      "생산완료",

      "검사대기",

      "검사",

      "성적서",

      "출고",

    ],

    implementationStatus: "active",

    codeRef: "src/utils/equipmentQr.js",

  },

  inspectionRegister: {

    id: "inspectionRegister",

    registryId: "inspection",

    label: "검사실 QR",

    menuDomain: "quality",

    pathTemplate: "/quality/inspection",

    query: { smart: "register", room: "{code}" },

    canonicalId: SMART_ACCESS_ID_REGISTRY.inspection.canonicalId,

    legacyPayload: SMART_ACCESS_ID_REGISTRY.inspection.legacyPayload,

    workflowSteps: ["검사등록 화면"],

    implementationStatus: "planned",

  },

  certificate: {

    id: "certificate",

    registryId: "certificate",

    label: "품질실 QR · 성적서",

    menuDomain: "quality",

    pathTemplate: "/quality/certificate",

    query: { smart: "1", room: "{code}" },

    canonicalId: SMART_ACCESS_ID_REGISTRY.certificate.canonicalId,

    legacyPayload: SMART_ACCESS_ID_REGISTRY.certificate.legacyPayload,

    workflowSteps: ["성적서 화면"],

    implementationStatus: "planned",

  },

  outboundRegister: {

    id: "outboundRegister",

    registryId: "outgoing",

    label: "출고장 QR",

    menuDomain: "outboundStatus",

    pathTemplate: "/inout/shipment",

    query: { smart: "register", dock: "{code}" },

    canonicalId: SMART_ACCESS_ID_REGISTRY.outgoing.canonicalId,

    legacyPayload: SMART_ACCESS_ID_REGISTRY.outgoing.legacyPayload,

    workflowSteps: ["출고등록"],

    implementationStatus: "planned",

  },

  equipmentMaster: {

    id: "equipmentMaster",

    registryId: "equipmentInfo",

    label: "설비관리 QR",

    menuDomain: "masterData",

    pathTemplate: "/settings/equipment",

    query: { detail: "{code}" },

    canonicalPattern: SMART_ACCESS_ID_REGISTRY.equipmentInfo.canonicalPattern,

    legacyPattern: SMART_ACCESS_ID_REGISTRY.equipmentInfo.legacyPattern,

    workflowSteps: ["설비정보", "점검이력", "생산현황"],

    implementationStatus: "planned",

  },

};



/** QR 출력센터 — Official Architecture + route target mapping */

export const QR_PRINT_CENTER = {

  menuLabel: QR_PRINT_CENTER_OFFICIAL.menuLabel,

  plannedMenuPath: QR_PRINT_CENTER_OFFICIAL.plannedMenuPath,

  plannedParentMenu: QR_PRINT_CENTER_OFFICIAL.plannedParentMenu,

  features: QR_PRINT_CENTER_OFFICIAL.categories.map((cat) => ({

    id: cat.id,

    label: cat.label,

    registryId: cat.registryId,

    targetId: getSmartAccessTargetId(cat.registryId) ?? cat.registryId,

  })),

  outputFormats: QR_PRINT_CENTER_OFFICIAL.features,

  multiCopy: QR_PRINT_CENTER_OFFICIAL.multiCopy,

  implementationStatus: QR_PRINT_CENTER_OFFICIAL.implementationStatus,

};



/** NFC — QR와 동일 Smart Access ID (Official Architecture) */

export const NFC_ACCESS_POLICY = {

  sameUrlAsQr: NFC_READY_POLICY.sameSmartAccessId,

  sameSmartAccessId: NFC_READY_POLICY.sameSmartAccessId,

  handler: "parseSmartAccessId(id) → targetId → buildSmartAccessPath() — QR/NFC 구분 없음",

  example: NFC_READY_POLICY.example,

  note: "NFC 태그에 Smart Access ID 또는 동일 URL 저장 · QR→NFC 교체 시 앱 수정 불필요",

};



/** Paper Mode 출력 — 삭제 금지 (Smart Access와 독립) */

export const PAPER_MODE_PRINTS = [

  { id: "htl", label: "입고리스트 (열처리 작업 요청)", doc: "DOC-01" },

  { id: "outList", label: "출고리스트", doc: "OUT" },

  { id: "inv", label: "거래명세서", doc: "DOC-04" },

  { id: "dpr", label: "생산일보", doc: "DOC-02" },

];



/** Smart Access URL 예시 (배포 base는 환경설정 연동 예정) */

export const SMART_ACCESS_URL_EXAMPLES = {

  equipmentIonCanonical: "/production/daily-report?equipment=ION-01&qr=NDK%3A%2F%2FEQ%2FION-01",

  equipmentIonLegacy: "/production/daily-report?equipment=ION-01&qr=NDK%7CEQ%7CION-01",

  inboundRegister: "/inout/incoming?smart=register",

  inspection: "/quality/inspection?smart=register&room=QC-01",

  certificate: "/quality/certificate?smart=1",

  outbound: "/inout/shipment?smart=register&dock=DOCK-01",

  nfcEquipment: "NDK://EQ/ION-01",

};



/**

 * Resolve Smart Access input (canonical ID or legacy payload) → app path

 * @param {string} smartAccessInput — NDK://... or NDK|...

 * @param {{ code?: string, payload?: string }} [overrides]

 */

export function resolveSmartAccessPathFromId(smartAccessInput, overrides = {}) {

  const parsed = parseSmartAccessId(smartAccessInput);

  if (!parsed) return "/";



  const targetId = getSmartAccessTargetId(parsed.registryId);

  if (!targetId) return "/";



  const code = overrides.code ?? parsed.code ?? "";

  const payload =

    overrides.payload ??

    (parsed.format === "canonical"

      ? buildCanonicalSmartAccessId(parsed.registryId, code)

      : smartAccessInput);



  return buildSmartAccessPath(targetId, { code, payload });

}



/**

 * targetId → 앱 내 상대 경로 (code 치환)

 * @param {string} targetId

 * @param {{ code?: string, payload?: string }} params

 */

export function buildSmartAccessPath(targetId, params = {}) {

  const target = SMART_ACCESS_TARGETS[targetId];

  if (!target) return "/";



  const code = params.code ?? "";

  const payload =
    params.payload ??
    (buildLegacySmartAccessPayload(target.registryId, code) ||
      buildCanonicalSmartAccessId(target.registryId, code));

  const search = new URLSearchParams();



  for (const [key, value] of Object.entries(target.query ?? {})) {

    const resolved = String(value)

      .replace("{code}", code)

      .replace("{payload}", payload);

    if (resolved) search.set(key, resolved);

  }



  const qs = search.toString();

  return qs ? `${target.pathTemplate}?${qs}` : target.pathTemplate;

}



export function getSmartAccessArchitectureSummary() {

  return {

    officialArchitecture: "docs/TITAN_OFFICIAL_ARCHITECTURE.md",

    philosophy: SMART_ACCESS_PHILOSOPHY,

    idScheme: SMART_ACCESS_ID_SCHEME.canonicalPrefix,

    modes: Object.values(SMART_ACCESS_MODES).map((m) => m.label),

    activeTargets: Object.values(SMART_ACCESS_TARGETS).filter((t) => t.implementationStatus === "active"),

    plannedTargets: Object.values(SMART_ACCESS_TARGETS).filter((t) => t.implementationStatus === "planned"),

    equipmentQrRules: EQUIPMENT_QR_RULES.oneQrPerEquipment,

    qrPrintCenter: QR_PRINT_CENTER.menuLabel,

    nfcPolicy: NFC_ACCESS_POLICY.sameSmartAccessId,

  };

}





