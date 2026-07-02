/**
 * Project TITAN — Repository Architecture (Platform REV.5)
 * Core → Repository → Data Source · Edition별 Backend
 *
 * Platform: src/config/titanPlatformArchitecture.js
 */

export const REPOSITORY_ARCHITECTURE_VERSION = "REV.6-PLATFORM";

/** Repository Backend — Edition별 */
export const REPOSITORY_BACKEND = {
  STANDALONE_V1_0: "sessionStorage",
  STANDALONE_V1_1: "sqlite",
  MES_ORACLE: "oracle",
  MES_API: "api",
  MES_CSV: "csv",
  /** @deprecated */ V1_0: "sessionStorage",
  /** @deprecated */ V1_1: "oracle",
};

/**
 * Repository 목록 — UI는 직접 Session/Oracle 호출 금지
 * @type {readonly string[]}
 */
export const REPOSITORY_REGISTRY = [
  "CustomerRepository",
  "ProductRepository",
  "IncomingRepository",
  "InspectionRepository",
  "CertificateRepository",
  "MicrostructureRepository",
  "QualityHistoryRepository",
  "DocumentRepository",
];

/** 품질 데이터 Primary Key — MES 관리번호 (예: DL260702-016) */
export const QUALITY_PRIMARY_KEY = "mesManagementNo";

/** Demo SessionStorage에서 id 필드 = mesManagementNo 로 취급 (V1.1 전환 시 필드명 통일) */
export const DEMO_ID_FIELD_ALIAS = {
  sessionField: "id",
  canonicalField: QUALITY_PRIMARY_KEY,
  note: "V1.0 Demo record.id === MES 관리번호",
};

/** V1.0 · V1.1 동일 Workflow — Backend만 교체 */
export const REPOSITORY_SWAP_POLICY = {
  uiChanges: false,
  workflowChanges: false,
  swapTarget: "repository implementation only",
};
