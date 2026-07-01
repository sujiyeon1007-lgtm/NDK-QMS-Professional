/**
 * Project TITAN V1.0 — Standard List · 납기일 셀
 */

export default function TitanDueDateCell({ label = "—", tone = "normal", className = "" }) {
  return (
    <span className={`titan-due-date titan-due-date--${tone} ${className}`.trim()}>
      <span className="titan-due-date__dot" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
