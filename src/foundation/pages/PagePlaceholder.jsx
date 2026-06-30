/**
 * PM 승인 전 화면 placeholder
 */
export default function PagePlaceholder({
  title,
  section,
  note = "화면 설계 승인 후 Foundation 컴포넌트로 구현",
}) {
  const heading = section ? `${section} · ${title}` : title;

  return (
    <div className="titan-page-placeholder">
      <div className="titan-page-placeholder__card">
        <span className="titan-page-placeholder__badge">PROJECT TITAN V1.0</span>
        <h2>{heading}</h2>
        <p>{note}</p>
        <small>개발 순서: 설계 → PM 승인 → 구현 → 테스트</small>
      </div>
    </div>
  );
}
