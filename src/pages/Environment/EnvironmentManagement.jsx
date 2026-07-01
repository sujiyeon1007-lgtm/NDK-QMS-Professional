import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Activity, Archive, Bell, Users } from "lucide-react";

import TitanKpiBarSlot from "../../foundation/components/TitanKpiBarSlot";
import TitanWorkflowStatusChipBar from "../../foundation/components/TitanWorkflowStatusChipBar";
import { buildMetricChipItems } from "../../utils/kpiMetricChipItems";
import { resolveEnvironmentTab } from "../../config/environmentSettings";
import {
  estimateStorageUsage,
  getEnvironmentSettings,
  getSystemStatusSummary,
} from "../../utils/environmentSettingsSession";
import { renderEnvironmentSection } from "./EnvironmentSections";

import "../InOut/InboundManagement.css";
import "./Environment.css";

export default function EnvironmentManagement() {
  const { tab: tabParam } = useParams();
  const tabId = resolveEnvironmentTab(tabParam);
  const [refreshKey, setRefreshKey] = useState(0);

  const kpiCards = useMemo(() => {
    const settings = getEnvironmentSettings();
    const status = getSystemStatusSummary();
    const storage = estimateStorageUsage();
    const activeUsers = settings.users.filter((user) => user.active !== false).length;

    return [
      {
        id: "status",
        label: "시스템 상태",
        value: status.dbStatus,
        unit: "",
        tone: "green",
        icon: Activity,
        subLabel: `SQLite ${status.sqliteStatus}`,
      },
      {
        id: "backup",
        label: "최근 백업",
        value: status.latestBackupLabel === "—" ? "—" : status.latestBackupLabel.slice(0, 10),
        unit: "",
        tone: "blue",
        icon: Archive,
        subLabel: status.latestBackupLabel,
      },
      {
        id: "users",
        label: "사용자",
        value: activeUsers.toLocaleString("ko-KR"),
        unit: "명",
        tone: "sky",
        icon: Users,
        subLabel: "활성 계정",
      },
      {
        id: "errors",
        label: "오류 로그",
        value: status.errorCount.toLocaleString("ko-KR"),
        unit: "건",
        tone: status.errorCount > 0 ? "orange" : "gray",
        icon: Bell,
        subLabel: `저장공간 ${storage.storagePercent}%`,
      },
    ];
  }, [refreshKey]);

  const metricChipItems = useMemo(() => buildMetricChipItems(kpiCards), [kpiCards]);

  return (
    <div className="inbound-page environment-page">
      <TitanKpiBarSlot ariaLabel="현황판" className="inbound-page__kpi">
        <TitanWorkflowStatusChipBar items={metricChipItems} ariaLabel="현황판" />
      </TitanKpiBarSlot>

      <div className="environment-settings-body">
        {renderEnvironmentSection(tabId, {
          refreshKey,
          onRefresh: () => setRefreshKey((key) => key + 1),
        })}
      </div>
    </div>
  );
}
