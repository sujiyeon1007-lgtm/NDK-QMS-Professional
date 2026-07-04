import Card from "./Card";

/**
 * Project TITAN V1.3 — 리스트 하단 Row 요약 (HOME Dashboard 카드 스타일)
 * 검색 → 리스트 → 선택 Row 요약 Card (상세페이지 ❌)
 */
export function TitanRowSummary({ children, className = "", emptyMessage, hasSelection = true }) {
  if (!hasSelection) {
    return (
      <div
        className={`titan-row-summary titan-row-summary--empty${className ? ` ${className}` : ""}`.trim()}
        aria-live="polite"
      >
        <p className="titan-row-summary__placeholder">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`titan-row-summary${className ? ` ${className}` : ""}`.trim()}>{children}</div>
  );
}

export function TitanRowSummaryCard({ title, children, className = "" }) {
  return (
    <Card className={`titan-row-summary-card home-panel${className ? ` ${className}` : ""}`.trim()}>
      <div className="home-panel__head home-panel__head--compact">
        <h3>{title}</h3>
      </div>
      <div className="titan-row-summary-card__body">{children}</div>
    </Card>
  );
}
