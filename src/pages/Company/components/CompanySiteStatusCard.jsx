import { Link } from "react-router-dom";
import { ChevronRight, MapPin } from "lucide-react";

import { TitanLauncherCategoryBadge } from "../../../components/common/badge";
import { COMPANY_WORKSPACE_ROUTES } from "../../../config/companyWorkspaceArchitecture";
import {
  listBusinessSites,
  resolveBusinessSiteTypeLabel,
} from "../../../utils/companyWorkspaceService";

const SITE_TONE_MAP = {
  headquarters: "blue",
  factory: "green",
  warehouse: "orange",
  office: "purple",
  other: "mint",
};

export default function CompanySiteStatusCard() {
  const sites = listBusinessSites();

  return (
    <section className="company-workspace-sites" aria-label="사업장 현황">
      <header className="company-workspace-sites__header">
        <h3 className="company-workspace-sites__title">
          <MapPin size={18} aria-hidden="true" />
          사업장 현황
        </h3>
        <Link to={COMPANY_WORKSPACE_ROUTES.sites} className="company-workspace-sites__more">
          전체 보기
          <ChevronRight size={14} aria-hidden="true" />
        </Link>
      </header>

      <div className="company-sites-grid">
        {sites.map((site) => {
          const tone = SITE_TONE_MAP[site.type] ?? "blue";
          const typeLabel = resolveBusinessSiteTypeLabel(site.type);
          return (
            <article key={site.id} className={`company-site-card company-site-card--${tone}`}>
              <div className="company-site-card__head">
                <strong className="company-site-card__name">{site.name}</strong>
                <TitanLauncherCategoryBadge text={typeLabel} color={tone} />
              </div>
              <div className="company-site-card__meta">
                <span>{site.address || "-"}</span>
                <span>{site.phone || "-"}</span>
              </div>
              {site.status === "active" ? (
                <span className="company-site-card__status">가동</span>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
