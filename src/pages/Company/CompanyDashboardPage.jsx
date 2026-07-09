import { Building2, FileText, MapPin, Users } from "lucide-react";

import { TitanLauncherCard, TitanMetricCard } from "../../foundation/uiKit";
import {
  COMPANY_WORKSPACE_SECTIONS,
} from "../../config/companyWorkspaceArchitecture";
import { buildCompanyDashboard } from "../../utils/companyWorkspaceService";
import CompanyRecentActivityCard from "./components/CompanyRecentActivityCard";
import CompanySiteStatusCard from "./components/CompanySiteStatusCard";
import CompanySummaryCard from "./components/CompanySummaryCard";

export default function CompanyDashboardPage() {
  const dashboard = buildCompanyDashboard();
  const footer = dashboard.sections?.documentFooter ?? {};
  const branding = dashboard.sections?.branding ?? {};
  const metrics = [
    { id: "sites", title: "사업장", value: dashboard.siteCount, description: "등록 사업장", icon: MapPin, tone: "green" },
    { id: "departments", title: "부서", value: dashboard.departmentCount, description: "운영 부서", icon: Building2, tone: "blue" },
    { id: "employees", title: "직원", value: dashboard.employeeCount, description: "재직 기준", icon: Users, tone: "purple" },
    { id: "footer", title: "문서 Footer", value: footer.companyName ? "등록" : "미등록", description: footer.email || footer.phone || "-", icon: FileText, tone: "amber" },
    { id: "logo", title: "Logo", value: branding.logo ? "등록" : "미등록", description: "Company Branding", icon: Building2, tone: "pink" },
  ];

  return (
    <div className="company-workspace-home company-workspace-home--dashboard company-workspace-home--launcher-only">
      <div className="company-dashboard-panel company-dashboard-panel--summary">
        <CompanySummaryCard />
      </div>

      <section className="company-dashboard-panel company-dashboard-panel--metrics" aria-label="Company Master KPI">
        <div className="company-metric-row">
          {metrics.map((metric) => (
            <TitanMetricCard
              key={metric.id}
              title={metric.title}
              value={metric.value}
              description={metric.description}
              icon={metric.icon}
              tone={metric.tone}
            />
          ))}
        </div>
      </section>

      <div className="titan-launcher-grid company-launcher-grid" aria-label="Quick Launcher">
        {COMPANY_WORKSPACE_SECTIONS.map((section) => (
          <TitanLauncherCard
            key={section.id}
            to={section.path}
            icon={section.icon}
            title={section.label}
            description={section.description}
            badge={section.badge}
            badgeColor={section.badgeColor ?? section.launcherTone}
            tone={section.launcherTone ?? "blue"}
          />
        ))}
      </div>

      <div className="company-dashboard-data-grid">
        <CompanySiteStatusCard />
        <CompanyRecentActivityCard />
      </div>
    </div>
  );
}
