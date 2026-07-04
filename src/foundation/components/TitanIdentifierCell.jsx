/**
 * Project TITAN — 식별값 셀 (관리번호 · LOT · 품번 등)
 * 가능한 전체 표시 · overflow 시 말줄임 · Hover Tooltip
 */

export default function TitanIdentifierCell({ value, className = "" }) {
  const text = String(value ?? "").trim();
  if (!text || text === "—") {
    return <span className="titan-identifier-cell titan-identifier-cell--empty">—</span>;
  }

  return (
    <span
      className={`titan-identifier-cell ${className}`.trim()}
      title={text}
      aria-label={text}
    >
      {text}
    </span>
  );
}
