/**
 * Project TITAN — RC1 Official Operational Policy (PM Official)
 * Lock: 2026-07-10
 */

export const RC1_OPERATIONAL_POLICY_VERSION = "RC1-OPERATIONAL-1.1";
export const RC1_OPERATIONAL_POLICY_DATE = "2026-07-10";

export const RC1_GOAL =
  "실제 회사에서 사용하는 것 — 새로운 기능 개발이 아님";

export const RC1_OPERATIONAL_SCOPE = Object.freeze([
  "기준정보관리",
  "입고등록",
  "생산관리",
  "출고등록",
  "거래명세서 발행",
  "재고관리",
  "QR Engine",
]);

export const RC1_OPERATIONAL_EXCLUDED = Object.freeze([
  "성적서 (기존 Excel 유지)",
  "문서관리",
  "통계",
  "회계",
  "경리 (거래처 Master 제공만 — TITAN 등록은 Excel Import)",
]);

export const RC1_COMPANY_MASTER_POLICY = Object.freeze({
  source: "경리팀 제공 Excel",
  importPath: "기준정보관리 · 거래처 · Excel Import",
  titanCrud: "보조 (Import 우선)",
});

export const RC1_DEVELOPMENT_PRIORITY = Object.freeze([
  "실제 운영",
  "버그 수정",
  "운영 피드백 수집",
  "운영일지 누적",
  "Architecture 결정",
  "DB 구현",
  "신규 기능",
]);

export const RC1_OUTBOUND_WORKFLOW = Object.freeze([
  "생산완료",
  "출고등록",
  "거래명세서 (선택)",
  "출고완료",
]);

export const RC1_STORAGE_POLICY = Object.freeze({
  active: "sessionStorage",
  delivery: "host-web",
  deferred: Object.freeze(["sqlite", "postgresql", "apiRepository", "mobile"]),
  architectureReview: "V1.1 Architecture Review",
  note: "운영 데이터 확보 전 저장소(DB) 구현 착수 금지",
});

export const RC1_FROZEN_ARCHITECTURE = Object.freeze([
  "UI",
  "Workflow",
  "QR Engine",
  "Print Engine",
  "Document Engine",
]);

export const RC1_SWAPPABLE_LAYER = Object.freeze(["Repository", "Data Source"]);

export const RC1_OPERATIONAL_DATA_COLLECTION = Object.freeze([
  "생산사무실 사용 패턴",
  "품질사무실 사용 패턴",
  "사장님 요구사항",
  "생산팀 요구사항",
  "QR 사용 빈도",
  "LTE 사용 여부",
  "동시 접속 인원",
  "백업 주기",
  "운영 중 발생한 오류",
]);

export const RC1_OPERATION_LOG_FIELDS = Object.freeze([
  "날짜",
  "사용자",
  "기능",
  "결과",
  "문제점",
  "개선 아이디어",
  "처리 여부",
]);

export const V11_ARCHITECTURE_REVIEW_DECISIONS = Object.freeze([
  "PostgreSQL",
  "API",
  "Auth",
  "Mobile",
  "Repository",
]);

export {
  V11_ARCHITECTURE_DIRECTION_VERSION,
  V11_ARCHITECTURE_DIRECTION_DATE,
  RC1_CONFIRMED_OPERATING_ENVIRONMENT,
  V11_LONG_TERM_PLATFORM_DIRECTION,
  V11_PRIMARY_GOAL,
  V11_ARCHITECTURE_CONSIDERATIONS,
  V11_ARCHITECTURE_REVIEW_GATE,
  getV11ArchitectureDirectionSummary,
} from "./titanV11ArchitectureDirection.js";

export const RC1_ALLOWED_WORK = Object.freeze([
  "RC1 버그 수정",
  "운영 안정화",
  "운영 UX 개선",
  "QR 검증",
  "Build",
  "Browser QA",
  "Host 배포",
  "운영 문서 작성",
  "Architecture 검토 및 문서화",
]);

export const RC1_DEFERRED_WORK = Object.freeze([
  "SQLite 구현",
  "PostgreSQL 구현",
  "API Repository 구현",
  "Mobile 구현",
  "Repository 교체",
  "대규모 리팩토링",
  "신규 기능 추가",
  "UI 변경",
  "Workflow 변경",
  "저장소 변경",
]);

export const RC1_EXIT_CRITERIA = Object.freeze([
  "Build PASS",
  "Browser QA PASS",
  "Host 배포 가능",
  "실제 업무 운영 가능",
  "QR 생성 및 출력 검증 완료",
  "QR 현장 테스트 완료",
  "운영일지 작성 시작",
]);

export const RC1_POST_PHASES = Object.freeze({
  v101: "운영 피드백 반영",
  v11: "Architecture 및 DB 방향 최종 확정",
});

export function getRc1OperationalPolicySummary() {
  return {
    version: RC1_OPERATIONAL_POLICY_VERSION,
    date: RC1_OPERATIONAL_POLICY_DATE,
    goal: RC1_GOAL,
    scope: RC1_OPERATIONAL_SCOPE,
    excluded: RC1_OPERATIONAL_EXCLUDED,
    priority: RC1_DEVELOPMENT_PRIORITY,
    storage: RC1_STORAGE_POLICY,
    frozen: RC1_FROZEN_ARCHITECTURE,
    swappable: RC1_SWAPPABLE_LAYER,
    allowed: RC1_ALLOWED_WORK,
    deferred: RC1_DEFERRED_WORK,
    exitCriteria: RC1_EXIT_CRITERIA,
  };
}
