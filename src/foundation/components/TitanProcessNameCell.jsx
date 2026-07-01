/**
 * Project TITAN V1.0 — Standard List · 현재공정 셀 (Workflow Status Chip)
 */

export default function TitanProcessNameCell({ label = "—", processKey = "incoming", className = "" }) {
  if (!label || label === "—") {
    return "—";
  }

  return (
    <span
      className={`titan-process-name-cell titan-process-status-chip titan-process--${processKey} ${className}`.trim()}
      title={label}
    >
      <span className="titan-process-status-chip__dot" aria-hidden="true" />
      <span className="titan-process-status-chip__label">{label}</span>
    </span>
  );
}
