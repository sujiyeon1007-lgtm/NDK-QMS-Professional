import { STATISTICS_STATUS_PANEL, getPeriodKpiLabel } from "../../config/statisticsDashboard";
import ProductionKpiPanel from "./ProductionKpiPanel";

function formatTrend(delta) {
  if (delta == null) return "단위별 집계";
  if (delta > 0) return `▲ ${Math.abs(delta).toLocaleString("ko-KR")}%`;
  if (delta < 0) return `▼ ${Math.abs(delta).toLocaleString("ko-KR")}%`;
  return "— 0%";
}

export default function StatisticsKpiPanel({ kpiItems, kpi, delta, period, trendLabel }) {
  const cards = kpiItems.map((item) => {
    const label = getPeriodKpiLabel(period, item.label);
    let value = kpi[item.id];
    let unit = item.unit ?? "";

    if (item.id === "productionQty") {
      value = kpi.productionQty ?? value;
      unit = kpi.productionUnit ?? unit;
    }
    if (item.id === "shipmentQty") {
      value = kpi.shipmentQty ?? value;
      unit = kpi.shipmentUnit ?? unit;
    }
    if (item.id === "totalShipmentQty") {
      value = kpi.totalShipmentQty ?? value;
      unit = kpi.totalShipmentUnit ?? unit;
    }
    if (item.id === "avgProductionQty") {
      value = kpi.avgProductionQty ?? value;
      unit = kpi.avgProductionUnit ?? unit;
    }
    if (item.id === "avgShipmentQty") {
      value = kpi.avgShipmentQty ?? value;
      unit = kpi.avgShipmentUnit ?? unit;
    }

    return {
      ...item,
      label,
      value: typeof value === "number" ? value.toLocaleString("ko-KR") : value ?? "0",
      unit,
      subLabel: `${trendLabel} · ${formatTrend(delta?.[item.id])}`,
    };
  });

  return (
    <ProductionKpiPanel
      title={STATISTICS_STATUS_PANEL.title}
      titleIcon={STATISTICS_STATUS_PANEL.titleIcon}
      cards={cards}
      metricMode
    />
  );
}
