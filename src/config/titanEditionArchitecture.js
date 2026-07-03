/**
 * Project TITAN — Edition Layer (Platform REV.6 Official)
 * ① Quality · ② Standalone · ③ MES Connected · Enterprise (Future)
 */

import { PLATFORM_ARCHITECTURE_VERSION } from "./titanPlatformArchitecture";
import {
  V1_0_EDITION_LOCK,
  isEditionOnHold,
  isV1EditionLocked,
} from "./titanV1DevelopmentDirection";

export { PLATFORM_ARCHITECTURE_VERSION as EDITION_ARCHITECTURE_VERSION };

export const TITAN_EDITION = {
  QUALITY: "quality",
  STANDALONE: "standalone",
  MES_CONNECTED: "mes-connected",
  ENTERPRISE: "enterprise",
};

export const REPOSITORY_ADAPTER = {
  SESSION: "session",
  SQLITE: "sqlite",
  ORACLE: "oracle",
  API: "api",
  CSV: "csv",
};

export const MES_REPOSITORY_ADAPTER = {
  ORACLE: REPOSITORY_ADAPTER.ORACLE,
  API: REPOSITORY_ADAPTER.API,
  CSV: REPOSITORY_ADAPTER.CSV,
};

/** Edition별 Sidebar 메뉴 id (menuStructure SIDEBAR_MENU) */
export const EDITION_SIDEBAR_MENU_IDS = {
  [TITAN_EDITION.QUALITY]: [
    "home",
    "inboundStatus",
    "workDaily",
    "quality",
    "documents",
    "masterData",
    "outboundStatus",
    "history",
    "environment",
  ],
  [TITAN_EDITION.STANDALONE]: [
    "home",
    "inboundStatus",
    "workDaily",
    "quality",
    "documents",
    "masterData",
    "outboundStatus",
    "history",
    "environment",
  ],
  [TITAN_EDITION.MES_CONNECTED]: [
    "home",
    "inboundStatus",
    "workDaily",
    "quality",
    "documents",
    "masterData",
    "outboundStatus",
    "history",
    "environment",
  ],
};

/** Edition 기능 비교 (공식 REV.6) */
export const EDITION_FEATURE_COMPARISON = [
  { feature: "거래처 관리", quality: "△ 최소", standalone: "✅", mesConnected: "MES" },
  { feature: "제품 관리", quality: "△ 최소", standalone: "✅", mesConnected: "MES" },
  { feature: "입고현황", quality: "✅", standalone: "✅", mesConnected: "MES" },
  { feature: "출고현황", quality: "✅", standalone: "✅", mesConnected: "MES" },
  { feature: "성적서 (검사관리)", quality: "✅", standalone: "✅", mesConnected: "✅" },
  { feature: "재고관리", quality: "❌", standalone: "✅", mesConnected: "MES" },
  { feature: "품질접수", quality: "✅", standalone: "✅", mesConnected: "✅" },
  { feature: "검사등록", quality: "✅", standalone: "✅", mesConnected: "✅" },
  { feature: "경도관리", quality: "✅", standalone: "✅", mesConnected: "✅" },
  { feature: "유효경화깊이", quality: "✅", standalone: "✅", mesConnected: "✅" },
  { feature: "조직사진", quality: "✅", standalone: "✅", mesConnected: "✅" },
  { feature: "성적서", quality: "✅", standalone: "✅", mesConnected: "✅" },
  { feature: "문서관리", quality: "✅", standalone: "✅", mesConnected: "✅" },
  { feature: "품질이력", quality: "✅", standalone: "✅", mesConnected: "✅" },
  { feature: "QR Traceability", quality: "✅", standalone: "✅", mesConnected: "✅" },
  { feature: "통계", quality: "✅", standalone: "✅", mesConnected: "✅" },
];

export const TITAN_EDITION_DEFINITIONS = {
  [TITAN_EDITION.QUALITY]: {
    id: TITAN_EDITION.QUALITY,
    label: "Quality Edition",
    labelKo: "QMS Only",
    subtitle: "QMS Only",
    description: "순수 품질관리 · MES/입출고/생산 없음 · CSV·Excel Import",
    repositoryFamily: "quality",
    dataSources: [REPOSITORY_ADAPTER.SESSION, REPOSITORY_ADAPTER.CSV],
    defaultRepository: REPOSITORY_ADAPTER.SESSION,
    dataInput: ["직접 입력", "CSV Import", "Excel Import"],
    masterDataOwner: "titan-minimal",
    inboundPolicy: "none",
    outboundPolicy: "none",
    inventoryPolicy: "none",
    productionPolicy: "none",
    managementNoPolicy: "titan-generated",
    mesReadOnly: false,
    selectable: false,
    onHold: true,
    onHoldReason: "V1.0 uses Standalone Edition scope — resumes as alternate path",
    future: false,
    target: "중소 열처리 · 품질팀 단독 · MES 미사용",
  },
  [TITAN_EDITION.STANDALONE]: {
    id: TITAN_EDITION.STANDALONE,
    label: "Standalone Edition",
    labelKo: "독립 실행형 QMS",
    subtitle: "V1.0 Official",
    description: "독립 실행형 NDK 품질관리 시스템 · SessionStorage Demo · Workflow 완성",
    repositoryFamily: "standalone",
    dataSources: [REPOSITORY_ADAPTER.SESSION, REPOSITORY_ADAPTER.SQLITE],
    defaultRepository: REPOSITORY_ADAPTER.SESSION,
    futureRepository: REPOSITORY_ADAPTER.SQLITE,
    masterDataOwner: "titan",
    inboundPolicy: "titan-register",
    outboundPolicy: "titan",
    inventoryPolicy: "titan",
    productionPolicy: "titan",
    managementNoPolicy: "titan-generated",
    mesReadOnly: false,
    selectable: true,
    onHold: false,
    future: false,
    target: "NDK V1.0 · 독립 실행형 QMS",
  },
  [TITAN_EDITION.MES_CONNECTED]: {
    id: TITAN_EDITION.MES_CONNECTED,
    label: "MES Connected Edition",
    labelKo: "QMS + MES",
    subtitle: "V1.1",
    description: "MES 운영 SoT · TITAN 품질(QMS) · Read Only",
    repositoryFamily: "mes",
    dataSources: [REPOSITORY_ADAPTER.ORACLE, REPOSITORY_ADAPTER.API, REPOSITORY_ADAPTER.CSV],
    defaultRepository: REPOSITORY_ADAPTER.ORACLE,
    adapters: [REPOSITORY_ADAPTER.ORACLE, REPOSITORY_ADAPTER.API, REPOSITORY_ADAPTER.CSV],
    masterDataOwner: "mes",
    inboundPolicy: "mes-inquiry-quality-intake",
    outboundPolicy: "mes-read",
    inventoryPolicy: "mes-read",
    productionPolicy: "mes-read",
    managementNoPolicy: "mes-generated",
    mesReadOnly: true,
    selectable: false,
    onHold: true,
    onHoldReason: "V1.1 MES 연동 — Oracle PoC 후 진행",
    future: false,
    target: "NDK · MES 운영 업체",
  },
  [TITAN_EDITION.ENTERPRISE]: {
    id: TITAN_EDITION.ENTERPRISE,
    label: "Enterprise Edition",
    labelKo: "확장형",
    subtitle: "Future",
    description: "Smart Factory · ERP·MES·PLC·IoT·AI·SPC (Future)",
    repositoryFamily: "enterprise",
    futureIntegrations: ["ERP", "MES", "PLC", "IoT", "AI", "SPC", "설비 모니터링", "실시간 Dashboard"],
    selectable: false,
    future: true,
  },
};

export const QUALITY_EDITION_MODULES = [
  "HOME",
  "품질접수",
  "검사등록",
  "경도관리",
  "유효경화깊이",
  "조직사진",
  "성적서관리",
  "문서관리",
  "품질이력",
  "통계",
  "환경설정",
];

export const QUALITY_EDITION_EXCLUDED = [
  "입고관리",
  "출고관리",
  "재고관리",
  "생산관리",
  "거래명세서",
];

export const EDITION_SHARED_PRINCIPLES = {
  uiIdentical: true,
  workflowIdentical: true,
  printEngineShared: true,
  documentManagementShared: true,
  certificateShared: true,
  qrShared: true,
  qualityHistoryShared: true,
  onlyRepositoryAndMenuDiffers: true,
};

export const MES_CONNECTED_PRINCIPLES = [
  "동일 데이터 두 번 입력 금지",
  "MES = Source of Truth",
  "TITAN = QMS",
  "Read Only",
];

export const EDITION_REPOSITORY_MAP = {
  [TITAN_EDITION.QUALITY]: { v1_0: REPOSITORY_ADAPTER.SESSION, v1_1: REPOSITORY_ADAPTER.SESSION },
  [TITAN_EDITION.STANDALONE]: { v1_0: REPOSITORY_ADAPTER.SESSION, v1_1: REPOSITORY_ADAPTER.SQLITE },
  [`${TITAN_EDITION.MES_CONNECTED}:${REPOSITORY_ADAPTER.ORACLE}`]: {
    v1_0: REPOSITORY_ADAPTER.ORACLE,
    v1_1: REPOSITORY_ADAPTER.ORACLE,
  },
  [`${TITAN_EDITION.MES_CONNECTED}:${REPOSITORY_ADAPTER.API}`]: {
    v1_0: REPOSITORY_ADAPTER.API,
    v1_1: REPOSITORY_ADAPTER.API,
  },
  [`${TITAN_EDITION.MES_CONNECTED}:${REPOSITORY_ADAPTER.CSV}`]: {
    v1_0: REPOSITORY_ADAPTER.CSV,
    v1_1: REPOSITORY_ADAPTER.CSV,
  },
};

export const EDITION_DISPLAY = {
  architecture: "Project TITAN Platform Architecture REV.6 (Official)",
  tagline: "Develop Once, Deploy Anywhere",
};

export function getSelectableEditions() {
  if (isV1EditionLocked()) {
    const quality = TITAN_EDITION_DEFINITIONS[V1_0_EDITION_LOCK];
    return quality ? [quality] : [];
  }

  return Object.values(TITAN_EDITION_DEFINITIONS)
    .filter((edition) => edition.selectable !== false && !edition.onHold)
    .sort((a, b) => {
      const order = [TITAN_EDITION.QUALITY, TITAN_EDITION.STANDALONE, TITAN_EDITION.MES_CONNECTED];
      return order.indexOf(a.id) - order.indexOf(b.id);
    });
}

/** V1.0 on-hold editions — shown disabled in boot modal (admin) */
export function getOnHoldEditions() {
  return Object.values(TITAN_EDITION_DEFINITIONS).filter(
    (edition) => edition.onHold || isEditionOnHold(edition.id)
  );
}

export function getEditionSidebarMenuIds(editionId) {
  return (
    EDITION_SIDEBAR_MENU_IDS[editionId] ??
    EDITION_SIDEBAR_MENU_IDS[V1_0_EDITION_LOCK] ??
    EDITION_SIDEBAR_MENU_IDS[TITAN_EDITION.QUALITY]
  );
}

export function isSidebarMenuVisibleForEdition(menuId, editionId) {
  return getEditionSidebarMenuIds(editionId).includes(menuId);
}

export function resolveRepositoryBackendForEdition(
  editionId,
  mesAdapter = REPOSITORY_ADAPTER.ORACLE
) {
  if (isV1EditionLocked()) {
    return REPOSITORY_ADAPTER.SESSION;
  }

  const edition = TITAN_EDITION_DEFINITIONS[editionId];
  if (!edition || edition.future) return REPOSITORY_ADAPTER.SESSION;

  if (editionId === TITAN_EDITION.QUALITY || editionId === TITAN_EDITION.STANDALONE) {
    return EDITION_REPOSITORY_MAP[editionId]?.v1_0 ?? REPOSITORY_ADAPTER.SESSION;
  }

  const key = `${TITAN_EDITION.MES_CONNECTED}:${mesAdapter}`;
  const mapped = EDITION_REPOSITORY_MAP[key]?.v1_0;
  if (mapped === REPOSITORY_ADAPTER.API || mapped === REPOSITORY_ADAPTER.CSV) {
    return REPOSITORY_ADAPTER.SESSION;
  }
  return mapped ?? REPOSITORY_ADAPTER.SESSION;
}

export function getEditionDefinition(editionId) {
  return (
    TITAN_EDITION_DEFINITIONS[editionId] ??
    TITAN_EDITION_DEFINITIONS[V1_0_EDITION_LOCK] ??
    TITAN_EDITION_DEFINITIONS[TITAN_EDITION.QUALITY]
  );
}

export function getTitanEditionSummary() {
  return {
    version: PLATFORM_ARCHITECTURE_VERSION,
    editions: getSelectableEditions().map((e) => ({ id: e.id, label: e.labelKo, subtitle: e.subtitle })),
    futureEditions: Object.values(TITAN_EDITION_DEFINITIONS)
      .filter((e) => e.future)
      .map((e) => e.labelKo),
    comparison: EDITION_FEATURE_COMPARISON,
    principles: EDITION_SHARED_PRINCIPLES,
  };
}
