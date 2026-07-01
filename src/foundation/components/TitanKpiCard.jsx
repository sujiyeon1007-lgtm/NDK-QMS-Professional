/**
 * Project TITAN V1.0 — Unified KPI Card (HOME Baseline Shell)
 *
 * mode="realtime" — [숫자+단위] [아이콘] [라벨] (Foundation · UI Freeze · Pill)
 * mode="summary"  — [라벨 ↑] [숫자 ↓] (동일 Shell · Rounded Rect · Layout만)
 *
 * .titan-kpi-card 는 HOME Dashboard 전용 — Status Chip에는 사용하지 않음
 */

import { KPI_MODE_REALTIME, KPI_MODE_SUMMARY, resolveKpiMode } from "../../config/kpiLayoutStandard";
import { resolveStatusChipIcon } from "../../config/statusChipIcons.jsx";

export default function TitanKpiCard({
  chip,
  active = false,
  disabled = false,
  onClick,
  className = "",
  mode = KPI_MODE_REALTIME,
}) {
  const kpiMode = resolveKpiMode(mode);
  const isSummary = kpiMode === KPI_MODE_SUMMARY;
  const Icon = !isSummary ? resolveStatusChipIcon(chip.icon) : null;
  const tone = chip.tone ?? "incoming";
  const filterable = chip.filterable !== false && !disabled;
  const displayValue =
    chip.displayValue ??
    (typeof chip.value === "number"
      ? chip.value.toLocaleString("ko-KR")
      : chip.value ?? "0");
  const countUnit = chip.countUnit ?? "건";
  const showCountUnit = countUnit !== "";

  const handleClick = () => {
    if (!filterable || !onClick) return;
    onClick(chip);
  };

  const metricLabel = `${chip.label} ${displayValue}${showCountUnit ? countUnit : ""}${
    active ? ", 선택됨" : ""
  }`;

  const metricBlock = (
    <span className="titan-status-chip__metric">
      <strong className="titan-status-chip__count">{displayValue}</strong>
      {showCountUnit ? (
        <span className="titan-status-chip__count-unit">{countUnit}</span>
      ) : null}
    </span>
  );

  return (
    <button
      type="button"
      className={`titan-status-chip titan-process--${tone}${
        isSummary ? " titan-status-chip--summary" : ""
      }${active ? " is-active" : ""}${disabled ? " is-disabled" : ""} ${className}`.trim()}
      onClick={handleClick}
      disabled={!filterable}
      aria-pressed={active}
      aria-label={metricLabel}
      data-kpi-mode={isSummary ? KPI_MODE_SUMMARY : KPI_MODE_REALTIME}
    >
      {isSummary ? (
        <>
          <span className="titan-status-chip__label">{chip.label}</span>
          {metricBlock}
        </>
      ) : (
        <>
          {metricBlock}
          {Icon ? (
            <Icon className="titan-status-chip__icon" aria-hidden="true" />
          ) : (
            <span className="titan-status-chip__icon-fallback" aria-hidden="true" />
          )}
          <span className="titan-status-chip__label">{chip.label}</span>
        </>
      )}
    </button>
  );
}
