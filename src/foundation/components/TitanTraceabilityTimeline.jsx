import { ArrowDown, CheckCircle2, Circle, LoaderCircle } from "lucide-react";
import StatusChip from "./StatusChip";

/**
 * Project TITAN V2.0 — QR Traceability Timeline (HOME · 상세 Widget 공통)
 */
export default function TitanTraceabilityTimeline({ steps = [], ariaLabel = "작업 이력 Timeline" }) {
  if (!steps.length) {
    return <p className="titan-traceability-timeline__empty">QR 작업 이력이 없습니다.</p>;
  }

  return (
    <ol className="titan-traceability-timeline" aria-label={ariaLabel}>
      {steps.map((step, index) => (
        <li
          key={step.id}
          className={`titan-traceability-timeline__item${step.status === "active" ? " is-active" : ""}${step.status === "done" ? " is-done" : ""}`}
        >
          <div className="titan-traceability-timeline__marker" aria-hidden="true">
            {step.status === "done" ? (
              <CheckCircle2 size={16} />
            ) : step.status === "active" ? (
              <LoaderCircle size={16} />
            ) : (
              <Circle size={16} />
            )}
          </div>
          <div className="titan-traceability-timeline__content">
            <div className="titan-traceability-timeline__head">
              <strong>{step.label}</strong>
              <span className="titan-traceability-timeline__time">{step.timeLabel}</span>
              {step.durationLabel && step.durationLabel !== "—" ? (
                <StatusChip variant="info">{step.durationLabel}</StatusChip>
              ) : null}
            </div>
            {step.detail ? <p className="titan-traceability-timeline__detail">{step.detail}</p> : null}
          </div>
          {index < steps.length - 1 ? (
            <ArrowDown size={14} className="titan-traceability-timeline__arrow" aria-hidden="true" />
          ) : null}
        </li>
      ))}
    </ol>
  );
}
