/**
 * Project TITAN Sprint 8 — 설비관리 (Equipment Master) 화면 config
 * Domain Master Workspace(2-Panel) — Material / Process Master 패턴 재사용.
 */

/** 좌측 Equipment List 컬럼 — P0 Sprint: 설비명 · 열처리 공정 · 사용여부 */
export const EQUIPMENT_LIST_COLUMNS = [
  { key: "name", label: "설비명", widthPercent: 40 },
  { key: "equipType", label: "열처리 공정", widthPercent: 32 },
  { key: "activeLabel", label: "사용여부", widthPercent: 12, render: "active" },
];

/** 우측 Detail Workspace 탭 (7탭) */
export const EQUIPMENT_DETAIL_TABS = [
  { id: "profile", label: "기본정보" },
  { id: "processes", label: "담당 공정" },
  { id: "materials", label: "처리 재질" },
  { id: "lots", label: "최근 작업 LOT" },
  { id: "qr", label: "QR 정보" },
  { id: "info", label: "설비 정보" },
  { id: "attachments", label: "첨부파일" },
  { id: "updates", label: "최근 수정" },
];

/** ① 기본정보 — P0 Sprint: 3 fields only */
export const EQUIPMENT_PROFILE_FIELDS = [
  { key: "name", label: "설비명" },
  { key: "equipType", label: "열처리 공정" },
  { key: "activeLabel", label: "사용여부", render: "active" },
];

/** ② 담당 공정 테이블 */
export const EQUIPMENT_PROCESS_COLUMNS = [
  { key: "name", label: "공정명" },
  { key: "code", label: "공정코드" },
  { key: "description", label: "설명" },
];

/** ③ 처리 재질 테이블 */
export const EQUIPMENT_MATERIAL_COLUMNS = [
  { key: "name", label: "재질명" },
  { key: "lotCount", label: "작업 LOT" },
];

/** ④ 최근 작업 LOT 테이블 */
export const EQUIPMENT_LOT_COLUMNS = [
  { key: "lotNo", label: "LOT.NO" },
  { key: "partNo", label: "품번" },
  { key: "process", label: "현재공정" },
  { key: "workDate", label: "작업일" },
  { key: "status", label: "상태" },
];

/** ⑤ QR 정보 — 조회 전용 (향후 Sprint 9 QR Workflow 연결 준비) */
export const EQUIPMENT_QR_FIELDS = [
  { key: "registered", label: "QR 등록 여부" },
  { key: "qrNo", label: "QR 번호" },
  { key: "createdAt", label: "발급일" },
  { key: "statusLabel", label: "QR 상태" },
];

/** ⑥ 설비 정보 — 조회 전용 (향후 유지보수 기능 확장 준비) */
export const EQUIPMENT_INFO_FIELDS = [
  { key: "capacity", label: "용량" },
  { key: "maxLoad", label: "최대 적재량" },
  { key: "operatingHours", label: "가동시간" },
  { key: "note", label: "비고", span: 2 },
];
