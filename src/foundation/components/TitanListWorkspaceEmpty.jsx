/**
 * Project TITAN — 좌측 Widget 빈 상태 (행 미선택)
 */
export default function TitanListWorkspaceEmpty({
  message = "리스트에서 항목을 선택하세요.",
  className = "",
}) {
  return (
    <div className={`titan-list-workspace-empty titan-card ${className}`.trim()} role="status">
      <p>{message}</p>
    </div>
  );
}
