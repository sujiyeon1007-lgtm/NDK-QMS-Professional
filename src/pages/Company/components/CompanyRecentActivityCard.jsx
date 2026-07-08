import { Link } from "react-router-dom";
import { ChevronRight, Clock3 } from "lucide-react";

import {
  COMPANY_RECENT_ACTIVITY_DEMO,
  COMPANY_WORKSPACE_COPY,
  getCompanySectionById,
} from "../../../config/companyWorkspaceArchitecture";

export default function CompanyRecentActivityCard() {
  return (
    <section className="company-workspace-activity" aria-label={COMPANY_WORKSPACE_COPY.recentActivityTitle}>
      <header className="company-workspace-activity__header">
        <h3 className="company-workspace-activity__title">
          <Clock3 size={18} aria-hidden="true" />
          {COMPANY_WORKSPACE_COPY.recentActivityTitle}
        </h3>
        <span className="company-workspace-activity__more">{COMPANY_WORKSPACE_COPY.recentActivityMore}</span>
      </header>

      <ol className="company-activity-timeline">
        {COMPANY_RECENT_ACTIVITY_DEMO.map((item, index) => {
          const section = getCompanySectionById(item.sectionId);
          const to = section?.path ?? "#";
          const isLast = index === COMPANY_RECENT_ACTIVITY_DEMO.length - 1;
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
