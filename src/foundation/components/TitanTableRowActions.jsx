/**
 * 리스트 마지막 컬럼 [작업] — 등록 · 수정 · 삭제 등 (상세는 더블클릭)
 */
export default function TitanTableRowActions({ children }) {
  if (!children) return null;

  return <div className="titan-table-row-actions">{children}</div>;
}
