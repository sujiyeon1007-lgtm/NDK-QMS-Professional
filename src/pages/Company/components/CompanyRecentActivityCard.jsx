import { Link } from "react-router-dom";
import { ChevronRight, Clock3 } from "lucide-react";

import {
  COMPANY_WORKSPACE_COPY,
  COMPANY_WORKSPACE_ROUTES,
  getCompanySectionById,
} from "../../../config/companyWorkspaceArchitecture";
import { formatCompanyUpdatedAt, getCompanyProfile } from "../../../utils/companyWorkspaceService";

function buildRecentActivityItems() {
  const profile = getCompanyProfile();
  const metaUpdatedAt = profile.meta?.lastUpdatedAt;
  const masterUpdatedAt = profile.companyMaster?.updatedAt;
  const footerUpdatedAt = profile.documentFooter?.updatedAt;
  const brandingUpdatedAt = profile.branding?.updatedAt;

  return [
    {
      id: "company-master",
      label: "회사 기본정보",
      at: formatCompanyUpdatedAt(masterUpdatedAt || metaUpdatedAt),
      tone: "blue",
      sectionId: "information",
    },
    {
      id: "sites",
      label: `사업장 ${profile.businessSites?.length ?? 0}개`,
      at: "Company Master",
      tone: "green",
      sectionId: "sites",
    },
    {
      id: "organization",
      label: `부서 ${profile.departments?.length ?? 0}개 · 직원 ${profile.employees?.length ?? 0}명`,
      at: "조직 기준",
      tone: "purple",
      sectionId: "organization",
    },
    {
      id: "branding",
      label: profile.branding?.logo ? "Logo 등록" : "Logo 미등록",
      at: formatCompanyUpdatedAt(brandingUpdatedAt || metaUpdatedAt),
      tone: "mint",
      sectionId: "branding",
    },
    {
      id: "document-footer",
      label: "문서 Footer",
      at: formatCompanyUpdatedAt(footerUpdatedAt || metaUpdatedAt),
      tone: "amber",
      sectionId: "documentFooter",
    },
  ];
}

export default function CompanyRecentActivityCard() {
  const items = buildRecentActivityItems();

  return (
    <section className="company-workspace-activity" aria-label={COMPANY_WORKSPACE_COPY.recentActivityTitle}>
      <header className="company-workspace-activity__header">
        <h3 className="company-workspace-activity__title">
          <Clock3 size={18} aria-hidden="true" />
          {COMPANY_WORKSPACE_COPY.recentActivityTitle}
        </h3>
        <Link to={COMPANY_WORKSPACE_ROUTES.information} className="company-workspace-activity__more">
          {COMPANY_WORKSPACE_COPY.recentActivityMore}
        </Link>
      </header>

      <ol className="company-activity-timeline">
        {items.map((item, index) => {
          const section = getCompanySectionById(item.sectionId);
          const to = section?.path ?? "#";
          const isLast = index === items.length - 1;
          return (
            <li
              key={item.id}
              className={`company-activity-timeline__item company-activity-timeline__item--${item.tone}${
                isLast ? " company-activity-timeline__item--last" : ""
              }`}
            >
              <span className="company-activity-timeline__marker" aria-hidden="true">
                <span className="company-activity-timeline__dot" />
                {!isLast ? <span className="company-activity-timeline__line" /> : null}
              </span>
              <Link to={to} className="company-activity-timeline__card">
                <span className="company-activity-timeline__main">
                  <strong>{item.label}</strong>
                  <span>{item.at}</span>
                </span>
                <ChevronRight size={16} aria-hidden="true" />
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
