/**
 * Project TITAN V1.2 — Smart Access Platform (Architecture Lock)
 *
 * QMS + Paper + Smart + QR + NFC Ready + MES Ready
 * UI 변경 ❌ — Config · Rule · Workflow · 문서 SSoT
 *
 * @see docs/TITAN_V12_SMART_ACCESS_PLATFORM.md
 * @see docs/TITAN_V12_MENU_ARCHITECTURE.md
 * @see src/config/titanV12MenuArchitecture.js — Menu Architecture cross-ref
 * @see src/config/titanOfficialArchitecture.js — Parent SSoT
 * @see src/config/smartAccessArchitecture.js — Route Registry
 */

import {
  EQUIPMENT_QR_RULES,
  MOBILE_DESIGN_PRINCIPLES,
  NFC_READY_POLICY,
  OFFICIAL_EQUIPMENT_QR_CODES,
  PROJECT_PHILOSOPHY,
  QR_PRINT_CENTER_OFFICIAL,
  SMART_ACCESS_ID_REGISTRY,
  SMART_ACCESS_ID_SCHEME,
  SMART_WORKFLOW_CHAIN,
  SUPPORT_MODES,
  getOfficialArchitectureSummary,
} from "./titanOfficialArchitecture";

export const V12_PLATFORM_LOCK_DATE = "2026-07-04";

export const V12_PLATFORM_IDENTITY = {
  version: "V1.2",
  title: "Smart Access Platform",
  taglineKo:
    "QMS + Paper Workflow + Smart Workflow + QR + 향후 NFC + MES Ready — 현장 중심 통합 업무 플랫폼",
  parentArchitecture: "titanOfficialArchitecture.js",
};

/** Product evolution roadmap (Architecture labels — not npm package version) */
export const TITAN_VERSION_ROADMAP = [
  { version: "V1.0", label: "기본 QMS", status: "complete" },
  { version: "V1.1", label: "Paper + Workflow", status: "complete" },
  { version: "V1.2", label: "QR Smart Access", status: "current-architecture" },
  { version: "V2.0", label: "QR + NFC", status: "planned" },
  { version: "V3.0", label: "MES 연동", status: "planned" },
];

/** QR 라벨 규격 — QR 출력센터 PDF 설계 기준 */
export const QR_LABEL_SPEC = {
  a4Printable: true,
  recommendedSizes: ["A6", "A7"],
  coating: "무광 코팅",
  placement: "설비 앞 부착",
  layout: {
    brandHeader: "Project TITAN",
    showEquipmentCode: true,
    showEquipmentName: true,
    showProcess: true,
    qrBlock: true,
    nfcReservedArea: true,
    nfcNote: "향후 NFC 영역 — V2.0 태그 부착 예정",
  },
  example: {
    equipmentCode: "ION-01",
    equipmentName: "이온질화 1호기",
    process: "이온질화",
    smartAccessId: "NDK://EQ/ION-01",
  },
};

/** QR 출력센터 — V1.2 공식 명칭 */
export const QR_PRINT_CENTER = {
  ...QR_PRINT_CENTER_OFFICIAL,
  menuLabel: "QR 출력센터",
  menuLabelAlt: "QR 관리",
};

/** Smart Access Dashboard — HOME 향후 KPI (설계만) */
export const SMART_ACCESS_DASHBOARD = {
  status: "planned",
  location: "HOME Dashboard",
  title: "Smart Access 사용 통계",
  periodBasis: "금일",
  metrics: [
    { id: "inbound", label: "입고", unit: "회", registryId: "incoming" },
    { id: "production", label: "생산", unit: "회", registryId: "equipment" },
    { id: "inspection", label: "검사", unit: "회", registryId: "inspection" },
    { id: "outbound", label: "출고", unit: "회", registryId: "outgoing" },
  ],
  purpose: "현장 Smart Access 실제 사용률 확인 · Paper vs Smart 비교 분석",
  implementationStatus: "planned",
};

/** Re-exports for unified V1.2 import surface */
export {
  PROJECT_PHILOSOPHY,
  SUPPORT_MODES,
  SMART_WORKFLOW_CHAIN,
  SMART_ACCESS_ID_SCHEME,
  SMART_ACCESS_ID_REGISTRY,
  EQUIPMENT_QR_RULES,
  OFFICIAL_EQUIPMENT_QR_CODES,
  NFC_READY_POLICY,
  MOBILE_DESIGN_PRINCIPLES,
  getOfficialArchitectureSummary,
};

export function getV12SmartAccessPlatformSummary() {
  return {
    lockDate: V12_PLATFORM_LOCK_DATE,
    version: V12_PLATFORM_IDENTITY.version,
    title: V12_PLATFORM_IDENTITY.title,
    philosophy: PROJECT_PHILOSOPHY.summaryKo,
    versionRoadmap: TITAN_VERSION_ROADMAP.map((v) => `${v.version} ${v.label}`).join(" → "),
    smartAccessIdExamples: [
      "NDK://INCOMING",
      "NDK://OUTGOING",
      "NDK://INSPECTION",
      "NDK://CERTIFICATE",
      "NDK://EQ/ION-01",
      "NDK://EQ/GAS-01",
    ],
    qrPrintCenter: QR_PRINT_CENTER.menuLabel,
    qrLabelSizes: QR_LABEL_SPEC.recommendedSizes.join(" · "),
    smartAccessDashboard: SMART_ACCESS_DASHBOARD.status,
    nfcReady: NFC_READY_POLICY.sameSmartAccessId,
    doc: "docs/TITAN_V12_SMART_ACCESS_PLATFORM.md",
  };
}
