import { KPI_MODE_SUMMARY, resolveKpiMode } from "../../config/kpiLayoutStandard";

/**
 * Project TITAN V1.0 — KPI Bar Slot (HOME Baseline wrapper)
 */
export default function TitanKpiBarSlot({
  children,
  className = "",
  ariaLabel,
  mode,
  layout,
}) {
  const kpiMode = resolveKpiMode(mode ?? layout);
  const summaryClass = kpiMode === KPI_MODE_SUMMARY ? "titan-kpi-bar-slot--summary" : "";

  return (
    <section
      className={`titan-kpi-bar-slot ${summaryClass} ${className}`.trim()}
      aria-label={ariaLabel}
      data-kpi-mode={kpiMode === KPI_MODE_SUMMARY ? "summary" : "realtime"}
    >
      {children}
    </section>
  );
}
