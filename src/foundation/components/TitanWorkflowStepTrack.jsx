/**
 * Project TITAN V1.0 — Workflow Step Track (Foundation)
 *
 * Row Expand · 상세 패널 공정 흐름도 등 전 화면 공통
 * - 연결선: 전 구간 light gray
 * - 현재 공정만 process color + subtle pulse
 * - 대기: white + gray border
 */

import { getPhaseStateLabel } from "../../utils/homeDashboardData";

/**
 * @typedef {{ key: string, label: string, state: 'done' | 'active' | 'pending' }} WorkflowPhase
 */

/**
 * @param {object} props
 * @param {WorkflowPhase[]} props.phases
 * @param {boolean} [props.showCaptions]
 * @param {string} [props.ariaLabel]
 * @param {string} [props.className]
 */
export default function TitanWorkflowStepTrack({
  phases = [],
  showCaptions = true,
  ariaLabel = "공정 진행 단계",
  className = "",
}) {
  return (
    <div className={`titan-workflow-step-track-wrap ${className}`.trim()}>
      <div className="titan-workflow-step-track" aria-label={ariaLabel}>
        {phases.map((phase, index) => (
          <div
            key={phase.key}
            className={`titan-workflow-step-track__item titan-workflow-step-track__item--${phase.state} titan-process--${phase.key}`}
          >
            <div className="titan-workflow-step-track__node">
              <span className="titan-workflow-step-track__dot" aria-hidden="true">
                {phase.state === "done" ? (
                  <span className="titan-workflow-step-track__check" aria-hidden="true">
                    ✓
                  </span>
                ) : phase.state === "active" ? (
                  <span className="titan-workflow-step-track__dot-inner" aria-hidden="true" />
                ) : null}
              </span>
              {index < phases.length - 1 ? (
                <span className="titan-workflow-step-track__line" aria-hidden="true" />
              ) : null}
            </div>
            <span className="titan-workflow-step-track__label">{phase.label}</span>
          </div>
        ))}
      </div>

      {showCaptions ? (
        <div className="titan-workflow-step-track__captions">
          {phases.map((phase) => (
            <span
              key={phase.key}
              className={`titan-workflow-step-track__caption titan-workflow-step-track__caption--${phase.state} titan-process--${phase.key}`}
            >
              {phase.label}: {getPhaseStateLabel(phase.state)}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
