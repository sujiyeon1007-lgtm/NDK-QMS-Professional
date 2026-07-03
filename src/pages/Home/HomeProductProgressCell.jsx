import {
  getActiveWorkflowPhase,
  getNextWorkflowPhaseLabel,
} from "../../utils/homeDashboardData";
import HomeAnimatedProgressBar from "./HomeAnimatedProgressBar";

/** 진행률 Bar + Hover Tooltip (현재 공정 · 진행률 · 다음 단계) */
export default function HomeProductProgressCell({ row }) {
  const phases = row.phases ?? [];
  const progressPercent = Number(row.progressPercent ?? 0);
  const processKey = row.processKey ?? getActiveWorkflowPhase(phases)?.key ?? "incoming";
  const currentLabel = row.currentProcess ?? getActiveWorkflowPhase(phases)?.label ?? "—";
  const nextStep = getNextWorkflowPhaseLabel(phases);

  return (
    <div className="home-progress-cell">
      <HomeAnimatedProgressBar percent={progressPercent} processKey={processKey} />
      <div className="home-progress-cell__tooltip" role="tooltip">
        <span>
          <strong>현재 공정</strong> {currentLabel}
        </span>
        <span>
          <strong>진행률</strong> {progressPercent}%
        </span>
        <span>
          <strong>예상 다음 단계</strong> {nextStep}
        </span>
      </div>
    </div>
  );
}
