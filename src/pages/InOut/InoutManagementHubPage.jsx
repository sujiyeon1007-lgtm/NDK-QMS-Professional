import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, Factory, Target, Truck } from "lucide-react";

import { INOUT_MANAGEMENT_LAUNCHER_ITEMS } from "../../config/inoutManagementLauncher";
import { OPERATION_ROUTES } from "../../config/operationsRouteRegistry";
import TitanLauncherHubPage from "../../foundation/components/TitanLauncherHubPage";
import TitanMetricCard from "../../foundation/components/TitanMetricCard";
import {
  buildInoutLauncherMetrics,
  buildOperationsDashboardKpiCounts,
} from "../../utils/operationsLauncherMetrics";
import { getSessionProductionRecords } from "../../utils/productionRecords";

import "../../pages/Settings/MasterDataHub.css";

const OPERATIONS_DASHBOARD_KPIS = [
  {
    id: "inboundPending",
    title: "입고 대기",
    route: OPERATION_ROUTES.inboundPending,
    icon: ClipboardList,
    tone: "blue",
    countKey: "inboundPending",
  },
  {
    id: "productionPending",
    title: "생산 대기",
    route: OPERATION_ROUTES.productionPending,
    icon: Factory,
    tone: "green",
    countKey: "productionPending",
  },
  {
    id: "shotStatus",
    title: "쇼트 작업",
    route: OPERATION_ROUTES.shotStatus,
    icon: Target,
    tone: "cyan",
    countKey: "shotWaiting",
  },
  {
    id: "shipmentRegister",
    title: "출고 대기",
    route: OPERATION_ROUTES.shipmentRegister,
    icon: Truck,
    tone: "orange",
    countKey: "shipmentWaiting",
  },
];

export function OperationsManagementKpiRow({ counts = {} }) {
  return (
    <section className="titan-hub-page__kpi-row" aria-label="운영관리 현황 KPI">
      {OPERATIONS_DASHBOARD_KPIS.map((item) => (
        <Link key={item.id} to={item.route} className="titan-hub-page__kpi-link">
          <TitanMetricCard
            title={item.title}
            value={`${counts[item.countKey] ?? 0}건`}
            description="클릭하여 Workspace 이동"
            icon={item.icon}
            tone={item.tone}
            className="titan-hub-page__kpi-card"
          />
        </Link>
      ))}
    </section>
  );
}

/** 운영관리 Launcher — V2.0 Hub */
export default function InoutManagementHubPage() {
  const records = useMemo(() => getSessionProductionRecords(), []);
  const metrics = useMemo(() => buildInoutLauncherMetrics(records), [records]);
  const kpiCounts = useMemo(() => buildOperationsDashboardKpiCounts(records), [records]);

  return (
    <TitanLauncherHubPage
      items={INOUT_MANAGEMENT_LAUNCHER_ITEMS}
      metrics={metrics}
      cardsClassName="master-data-hub__cards"
      header={<OperationsManagementKpiRow counts={kpiCounts} />}
    />
  );
}
