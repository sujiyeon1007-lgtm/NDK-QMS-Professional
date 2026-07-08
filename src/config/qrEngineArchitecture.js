/**
 * Sprint 10 Phase 2/3 — QR Engine Architecture (SSoT)
 */
export const QR_ENGINE_BASE_PATH = "/qr";

export const QR_ENGINE_ROUTES = {
  dashboard: `${QR_ENGINE_BASE_PATH}/dashboard`,
  generator: `${QR_ENGINE_BASE_PATH}/generator`,
  registry: `${QR_ENGINE_BASE_PATH}/registry`,
  scan: `${QR_ENGINE_BASE_PATH}/scan`,
  equipmentWork: (equipmentId) =>
    `${QR_ENGINE_BASE_PATH}/equipment/${encodeURIComponent(String(equipmentId ?? "").trim())}`,
  lotLifecycle: (lotNo) =>
    `/quality/lot-lifecycle?lot=${encodeURIComponent(String(lotNo ?? "").trim())}`,
  chargingEquipment: (equipmentId) =>
    `/production/charging/equipment/${encodeURIComponent(String(equipmentId ?? "").trim())}`,
};

export const QR_ENGINE_SCAN_TYPES = {
  equipment: { id: "equipment", labelKo: "Equipment QR", phase: 2 },
  lot: { id: "lot", labelKo: "LOT QR", phase: 2 },
};

export const QR_ENGINE_GENERATOR_TYPES = {
  equipment: {
    id: "equipment",
    labelKo: "Equipment",
    registryType: "equipment",
    displayPrefix: "EQ",
    phase: 3,
  },
  lot: {
    id: "lot",
    labelKo: "LOT",
    registryType: "lot",
    displayPrefix: "LOT",
    phase: 3,
  },
};

export const QR_ENGINE_RECENT_SCANS_KEY = "titan-qr-engine-recent-scans-v1";
export const QR_ENGINE_SCAN_STATS_KEY = "titan-qr-engine-scan-stats-v1";
export const QR_ENGINE_MAX_RECENT_SCANS = 12;

export const QR_ENGINE_COPY = {
  workspaceTitle: "QR Engine",
  workspaceIntro: "TITAN 공통 QR — 생성 · Registry · Scan · 업무 연결",
  dashboardTitle: "Dashboard",
  generatorTitle: "QR Generator",
  registryTitle: "QR Registry",
  scanTitle: "QR Scan",
  scanPlaceholder: "QR 코드 또는 LOT.NO / NDK://EQ/설비코드",
  scanProcessing: "QR 읽는 중...",
  scanResolving: "QR 종류 판별 중...",
  equipmentWorkTitle: "현재 작업",
  openCharging: "설비 장입관리로 이동",
  backToScan: "QR Scan",
  backToDashboard: "Dashboard",
  autoGenerateHint: "설비/LOT 등록 시 QR가 자동 생성됩니다. Generator는 재발행·출력 중심입니다.",
};