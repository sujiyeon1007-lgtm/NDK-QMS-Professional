/**

 * Project TITAN V1.0 — KPI Panel (단일 Panel · 1행 Realtime + 2행 Summary)

 *

 * Layout only — TitanKpiCard / TitanWorkflowStatusChipBar 재사용

 * Panel 하나 안에 1행(Pill) + 2행(Summary) — 별도 Panel 추가 금지

 */



export default function TitanKpiPanel({

  ariaLabel = "KPI",

  className = "",

  realtime = null,

  summary = null,

}) {

  const hasRealtime = Boolean(realtime);

  const hasSummary = Boolean(summary);



  if (!hasRealtime && !hasSummary) {

    return null;

  }



  return (

    <section className={`titan-kpi-bar-slot ${className}`.trim()} aria-label={ariaLabel}>

      <div className="titan-kpi-unified-panel" role="group" aria-label={ariaLabel}>

        {hasRealtime ? (

          <div className="titan-kpi-panel__row titan-kpi-panel__row--realtime">{realtime}</div>

        ) : null}

        {hasRealtime && hasSummary ? (

          <div className="titan-kpi-panel__row-divider" aria-hidden="true" />

        ) : null}

        {hasSummary ? (

          <div className="titan-kpi-panel__row titan-kpi-panel__row--summary">{summary}</div>

        ) : null}

      </div>

    </section>

  );

}


