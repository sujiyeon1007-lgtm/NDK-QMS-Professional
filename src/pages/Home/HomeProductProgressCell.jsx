import { getHomeWorkflowProgressTone } from "./HomeWorkflowProgressRate";

/** 진행률 — 숫자만 표시 (Progress Bar 제거 · Timeline과 중복 방지) */
export default function HomeProductProgressCell({ row }) {
  const value = Math.round(Math.max(0, Math.min(100, Number(row.progressPercent ?? 0))));
  const tone = getHomeWorkflowProgressTone(value);

  return (
    <span className={`home-progress-pct home-progress-pct--${tone}`} title={`진행률 ${value}%`}>
      {value}%
    </span>
  );
}
