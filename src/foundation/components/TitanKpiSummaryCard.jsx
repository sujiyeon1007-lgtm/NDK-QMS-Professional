/**
 * Project TITAN V1.0 — Summary KPI Card (Extend · Realtime Foundation 미변경)
 *
 * @deprecated TitanKpiCard mode="summary" — backward-compatible wrapper
 */

import { KPI_MODE_SUMMARY } from "../../config/kpiLayoutStandard";
import TitanKpiCard from "./TitanKpiCard";

export default function TitanKpiSummaryCard(props) {
  return <TitanKpiCard mode={KPI_MODE_SUMMARY} {...props} />;
}
