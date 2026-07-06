/**
 * Project TITAN V1.4 — 리스트 더블클릭 상세 안내 (PM 승인)
 */
export default function TitanListInteractionHint({
  message = "💡 리스트를 더블클릭하면 상세정보를 확인할 수 있습니다.",
  className = "",
}) {
  return (
    <p className={`titan-list-interaction-hint${className ? ` ${className}` : ""}`} role="note">
      {message}
    </p>
  );
}
