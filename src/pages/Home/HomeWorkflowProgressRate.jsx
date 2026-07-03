/** HOME 진행현황 상세 — 진행률 텍스트 (0~30 빨강 · 31~70 주황 · 71~99 파랑 · 100 초록) */
export function getHomeWorkflowProgressTone(percent) {
  const value = Math.max(0, Math.min(100, Number(percent) || 0));
  if (value >= 100) return "complete";
  if (value >= 71) return "high";
  if (value >= 31) return "medium";
  return "low";
}

export default function HomeWorkflowProgressRate({ percent = 0 }) {
  const value = Math.max(0, Math.min(100, Number(percent) || 0));
  const tone = getHomeWorkflowProgressTone(value);

  return (
    <p className={`home-workflow-progress-rate home-workflow-progress-rate--${tone}`}>
      <span className="home-workflow-progress-rate__dot" aria-hidden="true" />
      <span className="home-workflow-progress-rate__text">진행률 : {value}%</span>
    </p>
  );
}
