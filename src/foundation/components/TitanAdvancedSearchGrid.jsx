/**
 * Project TITAN — 상세검색 다행 그리드 · 가로 스크롤 없음 · 반응형 줄바꿈
 */
export default function TitanAdvancedSearchGrid({ children, className = "" }) {
  return (
    <div className={`titan-advanced-search__grid ${className}`.trim()} role="group">
      {children}
    </div>
  );
}
