import { useEffect, useState } from "react";

import { getWorkflowProcessColor } from "../../config/workflowProcessColors";

const FILL_DURATION_MS = 1000;

/**
 * MES/ERP 스타일 Progress Bar — 페이지 진입 시 0% → 목표 % (약 1s)
 */
export default function HomeAnimatedProgressBar({
  percent = 0,
  processKey = "incoming",
  durationMs = FILL_DURATION_MS,
}) {
  const [fillPercent, setFillPercent] = useState(0);
  const target = Math.max(0, Math.min(100, Number(percent) || 0));
  const colors = getWorkflowProcessColor(processKey);

  useEffect(() => {
    setFillPercent(0);
    const frame = window.requestAnimationFrame(() => {
      setFillPercent(target);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [target, processKey]);

  return (
    <div
      className={`home-progress-bar titan-process--${processKey}`}
      style={{
        "--home-progress-track": colors.bar,
        "--home-progress-fill": colors.barActive,
      }}
    >
      <div className="home-progress-bar__track" aria-hidden="true">
        <div
          className="home-progress-bar__fill"
          style={{
            width: `${fillPercent}%`,
            transitionDuration: `${durationMs}ms`,
          }}
        />
      </div>
      <span className="home-progress-bar__value">{target}%</span>
    </div>
  );
}
