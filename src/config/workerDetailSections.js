/**
 * Project TITAN Sprint 8 — 작업자관리 (Worker Master) 화면 config
 * Domain Master Workspace(2-Panel) — Material / Process / Equipment 패턴 재사용.
 */

/** 좌측 Worker List 컬럼 */
export const WORKER_LIST_COLUMNS = [
  { key: "name", label: "작업자명", widthPercent: 28 },
  { key: "code", label: "사번", widthPercent: 18 },
  { key: "process", label: "담당 공정", widthPercent: 30, render: "meta" },
  { key: "activeLabel", label: "상태", widthPercent: 14, render: "active" },
];

/** 우측 Detail Workspace 탭 (7탭) */
export const WORKER_DETAIL_TABS = [
  { id: "profile", label: "기본정보" },
  { id: "processes", label: "담당 공정" },
  { id: "production", label: "생산 실적" },
  { id: "quality", label: "품질 실적" },
  { id: "recentWork", label: "최근 작업" },
  { id: "qualification", label: "자격 정보" },
  { id: "updates", label: "최근 수정" },
];

/** ① 기본정보 */
export const WORKER_PROFILE_FIELDS = [
  { key: "name", label: "작업자명" },
  { key: "code", label: "사번" },
  { key: "phone", label: "연락처" },
  { key: "activeLabel", label: "상태", render: "active" },
];

/** ② 담당 공정 테이블 */
export const WORKER_PROCESS_COLUMNS = [
  { key: "name", label: "공정명" },
  { key: "code", label: "공정코드" },
  { key: "lotCount", label: "작업 LOT" },
];

/** ③ 생산 실적 테이블 */
export const WORKER_PRODUCTION_COLUMNS = [
  { key: "lotNo", label: "LOT.NO" },
  { key: "partNo", label: "품번" },
  { key: "partName", label: "품명" },
  { key: "workDate", label: "작업일" },
];

/** ④ 품질 실적 테이블 */
export const WORKER_QUALITY_COLUMNS = [
  { key: "inspectionItem", label: "검사" },
  { key: "passLabel", label: "합격" },
  { key: "failLabel", label: "불합격" },
];

/** ⑤ 최근 작업 테이블 */
export const WORKER_RECENT_WORK_COLUMNS = [
  { key: "lotNo", label: "LOT.NO" },
  { key: "process", label: "공정" },
  { key: "equipment", label: "설비" },
  { key: "workDate", label: "작업일" },
];

/** ⑥ 자격 정보 — 조회 전용 (향후 교육관리 · 자격관리 연결 준비) */
export const WORKER_QUALIFICATION_FIELDS = [
  { key: "education", label: "교육" },
  { key: "certificate", label: "자격증" },
  { key: "department", label: "부서" },
  { key: "note", label: "비고", span: 2 },
];
