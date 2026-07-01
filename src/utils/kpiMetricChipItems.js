import { getPeriodKpiLabel, displayStatisticsUnit } from "../config/statisticsDashboard";

/** KPI card tone → workflow chip tone (titan-process--*) */
const KPI_CARD_TONE_MAP = {
  blue: "production",
  green: "complete",
  purple: "certificate",
  orange: "shipment",
  red: "defect",
  gray: "hold",
  sky: "incoming",
};

/** Lucide icon component name → status chip icon key */
const LUCIDE_ICON_MAP = {
  Factory: "precisionManufacturing",
  TrendingUp: "today",
  Cog: "precisionManufacturing",
  CircleCheck: "taskAlt",
  CircleX: "cancel",
  AlertTriangle: "warning",
  ShieldCheck: "factCheck",
  PackageCheck: "inventory",
  BarChart3: "factCheck",
  Wrench: "precisionManufacturing",
  Layers: "description",
  Activity: "factCheck",
  Archive: "description",
  Users: "today",
  Bell: "warning",
  Database: "inventory",
  SlidersHorizontal: "factCheck",
  ClipboardCheck: "factCheck",
  Percent: "factCheck",
  Truck: "localShipping",
  Building2: "inventory",
  FileText: "description",
  Package: "inventory",
};

function resolveMetricIconKey(icon) {
  if (typeof icon === "string") return icon;
  const name = icon?.displayName || icon?.name || "";
  return LUCIDE_ICON_MAP[name] ?? "factCheck";
}

function mapMetricTone(tone) {
  return KPI_CARD_TONE_MAP[tone] ?? tone ?? "production";
}

function formatMetricDisplayValue(rawValue) {
  if (rawValue == null || rawValue === "") return "0";
  if (typeof rawValue === "number") return rawValue.toLocaleString("ko-KR");
  return String(rawValue);
}

/**
 * Maps ProductionKpiPanel-style cards to TitanWorkflowStatusChipBar items.
 *
 * @param {Array<{ id: string, label: string, icon?: unknown, tone?: string, value?: unknown, unit?: string }>} cards
 * @param {Record<string, unknown>} [values]
 */
export function buildMetricChipItems(cards, values = null) {
  return cards.map((card) => {
    const rawValue = values ? values[card.id] : card.value;
    const displayValue = formatMetricDisplayValue(rawValue);
    const numericValue = typeof rawValue === "number" ? rawValue : Number(String(rawValue).replace(/,/g, "")) || 0;

    return {
      id: card.id,
      label: card.label,
      icon: resolveMetricIconKey(card.icon),
      tone: mapMetricTone(card.tone),
      value: numericValue,
      displayValue,
      countUnit: card.unit ?? "",
      filterable: false,
    };
  });
}

function resolveStatisticsKpiValue(item, kpi) {
  let value = kpi[item.id];
  let unit = item.unit ?? "";

  if (item.id === "productionQty") {
    value = kpi.productionQty ?? value;
    unit = displayStatisticsUnit(kpi.productionUnit) || unit;
  }
  if (item.id === "shipmentQty") {
    value = kpi.shipmentQty ?? value;
    unit = displayStatisticsUnit(kpi.shipmentUnit) || unit;
  }
  if (item.id === "totalShipmentQty") {
    value = kpi.totalShipmentQty ?? value;
    unit = displayStatisticsUnit(kpi.totalShipmentUnit) || unit;
  }
  if (item.id === "avgProductionQty") {
    value = kpi.avgProductionQty ?? value;
    unit = displayStatisticsUnit(kpi.avgProductionUnit) || unit;
  }
  if (item.id === "avgShipmentQty") {
    value = kpi.avgShipmentQty ?? value;
    unit = displayStatisticsUnit(kpi.avgShipmentUnit) || unit;
  }

  if (item.quantity && !unit) {
    unit = displayStatisticsUnit(kpi.productionUnit || kpi.shipmentUnit || kpi.totalShipmentUnit) || "";
  }

  return {
    value: typeof value === "number" ? value.toLocaleString("ko-KR") : value ?? "0",
    unit,
  };
}

/**
 * Builds tab analytics KPI chips for StatisticsScreen.
 */
export function buildStatisticsMetricChipItems(kpiItems, kpi, period) {
  const cards = kpiItems.map((item) => {
    const { value, unit } = resolveStatisticsKpiValue(item, kpi);
    return {
      id: item.id,
      label: getPeriodKpiLabel(period, item.label),
      icon: item.icon,
      tone: item.tone,
      value,
      unit,
    };
  });
  return buildMetricChipItems(cards);
}
