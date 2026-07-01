/**

 * Project TITAN V1.0 — Status Chip Bar (Compact KPI · ERP 스타일)

 *

 * realtime · summary → TitanKpiCard (unified shell)

 */



import { useMemo } from "react";



import { buildStatusChipItems, getStatusChipSet } from "../../config/statusChipConfigs";

import { KPI_MODE_SUMMARY, resolveKpiMode } from "../../config/kpiLayoutStandard";

import { computeStatusChipCounts } from "../../utils/statusChipCounts";

import TitanKpiCard from "./TitanKpiCard";



export default function TitanWorkflowStatusChipBar({

  chipSetId,

  items: itemsProp,

  counts: countsProp,

  records,

  activeId = null,

  onChipClick,

  disabledIds = [],

  className = "",

  ariaLabel,

  mode,

  layout,

  bare = false,

}) {

  const chipSet = chipSetId ? getStatusChipSet(chipSetId) : null;

  const kpiMode = resolveKpiMode(mode ?? layout);

  const isSummary = kpiMode === KPI_MODE_SUMMARY;



  const counts = useMemo(() => {

    if (countsProp) return countsProp;

    if (chipSetId && records) return computeStatusChipCounts(chipSetId, records);

    return {};

  }, [countsProp, chipSetId, records]);



  const items = useMemo(() => {

    if (itemsProp) return itemsProp;

    if (chipSetId) return buildStatusChipItems(chipSetId, counts);

    return [];

  }, [itemsProp, chipSetId, counts]);



  const groupLabel = ariaLabel ?? chipSet?.ariaLabel ?? "업무 현황";



  if (items.length === 0) {

    return null;

  }



  const chips = items.map((chip) => (

    <TitanKpiCard

      key={chip.id}

      mode={kpiMode}

      chip={chip}

      active={activeId === chip.id}

      disabled={disabledIds.includes(chip.id)}

      onClick={onChipClick}

    />

  ));



  if (bare) {

    return (

      <div

        className={`titan-kpi-panel__chips${isSummary ? " titan-kpi-panel__chips--summary" : ""} ${className}`.trim()}

        data-kpi-mode={isSummary ? KPI_MODE_SUMMARY : "realtime"}

      >

        {chips}

      </div>

    );

  }



  return (

    <div

      className={`titan-status-chip-bar${isSummary ? " titan-status-chip-bar--summary" : ""} ${className}`.trim()}

      role="group"

      aria-label={groupLabel}

      data-kpi-mode={isSummary ? KPI_MODE_SUMMARY : "realtime"}

    >

      {chips}

    </div>

  );

}


