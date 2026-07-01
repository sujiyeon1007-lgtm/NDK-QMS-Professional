/**
 * Project TITAN V1.0 — Realtime KPI Chip (UI Freeze · HOME Baseline)
 *
 * @deprecated TitanKpiCard mode="realtime" — backward-compatible wrapper
 */

import { KPI_MODE_REALTIME } from "../../config/kpiLayoutStandard";
import TitanKpiCard from "./TitanKpiCard";

export default function TitanWorkflowStatusChip(props) {
  return <TitanKpiCard mode={KPI_MODE_REALTIME} {...props} />;
}
