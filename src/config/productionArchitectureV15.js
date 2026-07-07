/**
 * Project TITAN V1.5 — Production Architecture Renewal (PM 최종 승인)
 * QR 중심 생산 Workflow · 업무 중심 Launcher 단순화
 * @see .cursor/rules/project-titan-production-architecture-v15.mdc
 */

export const PRODUCTION_ARCHITECTURE_VERSION = "V1.5";
export const PRODUCTION_ARCHITECTURE_LOCKED = true;
export const PRODUCTION_ARCHITECTURE_DATE = "2026-07-07";

/** PM 공식 생산 Workflow — QR 시작점 · 생산일보 자동 생성(단계적) */
export const PRODUCTION_WORKFLOW_V15 = [
  "생산계획",
  "설비장입",
  "생산일보",
  "생산실적관리",
  "출력관리",
];

/** @deprecated V1.5 이전 세분화 구조 — 참고용 */
export const LEGACY_PRODUCTION_WORKFLOW = [
  "생산계획",
  "작업지시",
  "LOT관리",
  "생산일보",
  "생산실적",
  "업무일지",
  "불량이력관리",
];

/** 생산일보 — 공식 기록 유지 · QR 장입 시 초안 자동 생성(로드맵) */
export const PRODUCTION_DAILY_REPORT_POLICY = {
  retained: true,
  manualFirstEntry: false,
  autoDraftOnChargeStart: true,
  autoFieldsOnStart: ["설비", "시작시간", "LOT", "작업정보"],
  autoFieldsOnComplete: ["종료시간", "작업시간", "상태"],
  userSupplements: ["특이사항", "메모"],
};

/** 불량이력 — 생산관리 ❌ · 품질관리 Launcher */
export const DEFECT_HISTORY_OWNER = "qualityManagement";
export const DEFECT_HISTORY_ROUTE = "/quality/defect-history";
export const DEFECT_HISTORY_LEGACY_ROUTE = "/production/defect-history";

/** 품질관리 Workflow (불량이력 포함) */
export const QUALITY_WORKFLOW_V15 = [
  "검사관리",
  "성적서관리",
  "불량이력관리",
  "문서관리",
  "품질 업무일지",
];

/** 설비 장입관리 Hub — 생산관리 Launcher 내부 (Sidebar ❌) */
export const PRODUCTION_CHARGING_HUB_WORKFLOW_V15 = [
  "전체 설비 현황",
  "이온질화",
  "가스질화",
  "가스연질화",
];

/** @deprecated PRODUCTION_CHARGING_HUB_WORKFLOW_V15 */
export const QR_CHARGING_HUB_WORKFLOW = PRODUCTION_CHARGING_HUB_WORKFLOW_V15;

export const PRODUCTION_CHARGING_HUB_ROUTE = "/production/charging";

export const PRODUCTION_ARCHITECTURE_PRINCIPLE =
  "QR를 시작점으로 LOT · 생산일보 · Timeline · 제품 추적이 하나의 흐름으로 자동 연결";

export const MES_ROLE_SEPARATION = {
  equipmentStatus: "공장 전체 설비 관제 (작업 수행 ❌)",
  productStatus: "제품 진행현황 · LOT 추적",
  productionCharging: "설비 장입 작업 — 생산관리 Launcher 내부 Hub",
  productionManagement: "생산 수행 허브 (계획 → 장입 → 일보 → 실적)",
};

/** PM FINAL — 설비 장입관리·생산일보 동등 핵심 강조 */
export const PRODUCTION_LAUNCHER_CORE_CARD_IDS = ["qr-charging", "daily-report"];
