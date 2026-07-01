import { getWorkflowProcessColor } from "../../../config/workflowProcessColors";

export default function ProcessStatusChip({ processKey = "incoming", className = "" }) {
  const meta = getWorkflowProcessColor(processKey);

  return (
    <span
      className={`process-status-chip titan-process--${processKey} ${className}`.trim()}
      title={meta.label}
    >
      <span className="process-status-chip__dot" aria-hidden="true" />
      <span className="process-status-chip__label">{meta.label}</span>
    </span>
  );
}
