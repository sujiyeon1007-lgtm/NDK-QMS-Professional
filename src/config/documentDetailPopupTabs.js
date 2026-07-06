/** Project TITAN V1.3 — 문서관리 Detail Popup 탭 (입고 Detail Popup 동일 Shell) */

export const DOCUMENT_DETAIL_POPUP_TABS = [
  { id: "basic", label: "기본정보" },
  { id: "revision", label: "개정이력" },
  { id: "attachments", label: "첨부파일" },
  { id: "related", label: "관련문서" },
  { id: "memo", label: "메모" },
];

export const DOCUMENT_RELATED_SECTIONS = [
  { id: "sop", label: "관련 SOP", types: ["sop", "work_standard"] },
  { id: "inspection", label: "관련 검사기준서", types: ["inspection_standard"] },
  { id: "work", label: "관련 작업표준서", types: ["work_standard", "control_plan", "check_sheet"] },
  { id: "contract", label: "관련 계약서", types: ["contract"] },
];
