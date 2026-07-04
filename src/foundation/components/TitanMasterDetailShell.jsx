import CollapsePanel from "./CollapsePanel";

/**
 * Project TITAN V1.3 — Master-Detail 하단 상세 영역 공통 Shell
 * HOME 제외 모든 관리 페이지: 검색 → 리스트 → 선택 Row 하단 상세
 */
export default function TitanMasterDetailShell({
  hasSelection = false,
  emptyMessage = "리스트에서 항목을 선택하면 상세정보가 표시됩니다.",
  panelTitle = "선택한 Row의 상세정보",
  children,
  className = "",
}) {
  if (!hasSelection) {
    return (
      <section
        className={`titan-master-detail titan-master-detail--empty${className ? ` ${className}` : ""}`.trim()}
        aria-live="polite"
      >
        <p className="titan-master-detail__placeholder">{emptyMessage}</p>
      </section>
    );
  }

  return (
    <section
      className={`titan-master-detail${className ? ` ${className}` : ""}`.trim()}
      aria-label={panelTitle}
    >
      <CollapsePanel title={panelTitle} defaultOpen>
        {children}
      </CollapsePanel>
    </section>
  );
}
